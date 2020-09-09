import { Middleware, ParameterizedContext } from 'koa';
import { UserUnfollowedEditorialCommunityEvent } from '../types/domain-events';
import EditorialCommunityId from '../types/editorial-community-id';
import FollowList from '../types/follow-list';
import { UserId } from '../types/user-id';

type CommitEvents = (events: ReadonlyArray<UserUnfollowedEditorialCommunityEvent>) => Promise<void>;
type GetFollowList = (userId: UserId) => Promise<FollowList>;

interface Ports {
  commitEvents: CommitEvents;
  getFollowList: GetFollowList;
}

export default (ports: Ports): Middleware => (
  async (context: ParameterizedContext, next) => {
    if (context.session.command === 'unfollow' && context.session.editorialCommunityId) {
      const editorialCommunityId = new EditorialCommunityId(context.session.editorialCommunityId);
      const { user } = context.state;
      const followList = await ports.getFollowList(user.id);
      const events = followList.unfollow(editorialCommunityId);
      await ports.commitEvents(events);
    }

    await next();
  }
);

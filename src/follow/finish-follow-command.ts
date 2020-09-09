import { Middleware, ParameterizedContext } from 'koa';
import { UserFollowedEditorialCommunityEvent } from '../types/domain-events';
import EditorialCommunityId from '../types/editorial-community-id';
import FollowList from '../types/follow-list';
import { UserId } from '../types/user-id';

type CommitEvents = (events: ReadonlyArray<UserFollowedEditorialCommunityEvent>) => Promise<void>;
type GetFollowList = (userId: UserId) => Promise<FollowList>;

interface Ports {
  commitEvents: CommitEvents;
  getFollowList: GetFollowList;
}

export default (ports: Ports): Middleware => (
  async (context: ParameterizedContext, next) => {
    if (context.session.command === 'follow' && context.session.editorialCommunityId) {
      const editorialCommunityId = new EditorialCommunityId(context.session.editorialCommunityId);
      const { user } = context.state;
      const followList = await ports.getFollowList(user.id);
      const events = followList.follow(editorialCommunityId);
      await ports.commitEvents(events);
    }

    await next();
  }
);

import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { flow } from 'fp-ts/function';
import { GroupId } from '../types/group-id';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';

type RenderFollowers = (groupId: GroupId) => TE.TaskEither<never, HtmlFragment>;

type GetFollowers<U> = (groupId: GroupId) => T.Task<ReadonlyArray<U>>;

const renderFragment = (followerCount: number) => `
  <section class="followers">
    <h2>
      Followers
    </h2>
    <p>
      ${followerCount} ${followerCount === 1 ? 'user is' : 'users are'} following this group.
    </p>
  </section>
`;

export const renderFollowers = <U>(getFollowers: GetFollowers<U>): RenderFollowers => flow(
  getFollowers,
  T.map((followers) => followers.length),
  T.map(renderFragment),
  T.map(toHtmlFragment),
  TE.rightTask,
);
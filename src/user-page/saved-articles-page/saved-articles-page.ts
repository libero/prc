import { sequenceS } from 'fp-ts/Apply';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { GetAllEvents, projectSavedArticleDois } from './project-saved-article-dois';
import { savedArticles, Ports as SavedArticlesPorts } from './saved-articles';
import { tabs } from '../../shared-components/tabs';
import * as DE from '../../types/data-error';
import { Page } from '../../types/page';
import { RenderPageError } from '../../types/render-page-error';
import { UserId } from '../../types/user-id';
import { followedGroupIds } from '../followed-groups-page/project-followed-group-ids';
import { tabList } from '../tab-list';
import { UserDetails } from '../user-details';
import { userPage } from '../user-page';

type GetUserDetails = (userId: UserId) => TE.TaskEither<DE.DataError, UserDetails>;

type Ports = SavedArticlesPorts & {
  getAllEvents: GetAllEvents,
  getUserDetails: GetUserDetails,
};

type Params = {
  id: UserId,
};

type SavedArticlesPage = (params: Params) => TE.TaskEither<RenderPageError, Page>;

export const savedArticlesPage = (
  ports: Ports,
): SavedArticlesPage => (params) => pipe(
  {
    dois: projectSavedArticleDois(ports.getAllEvents)(params.id),
    groupIds: followedGroupIds(ports.getAllEvents)(params.id),
  },
  sequenceS(T.ApplyPar),
  T.chain(({ dois, groupIds }) => pipe(
    {
      articleCount: T.of(dois.length),
      groupCount: T.of(groupIds.length),
      content: savedArticles(ports)(dois),
    },
    sequenceS(T.ApplyPar),
  )),
  T.map(({ content, articleCount, groupCount }) => tabs({
    tabList: tabList(params.id, articleCount, groupCount),
    activeTabIndex: 0,
  })(content)),
  TE.rightTask,
  userPage(ports.getUserDetails(params.id)),
);

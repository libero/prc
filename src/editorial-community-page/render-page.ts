import { sequenceS } from 'fp-ts/Apply';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { EditorialCommunity } from '../types/editorial-community';
import { EditorialCommunityId } from '../types/editorial-community-id';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';
import { Page } from '../types/page';
import { RenderPageError } from '../types/render-page-error';
import { UserId } from '../types/user-id';

export type RenderPage = (
  editorialCommunity: EditorialCommunity,
  userId: O.Option<UserId>
) => TE.TaskEither<RenderPageError, Page>;

type RenderPageHeader = (editorialCommunity: EditorialCommunity) => HtmlFragment;

type RenderDescription = (editorialCommunity: EditorialCommunity) => TE.TaskEither<'not-found' | 'unavailable', HtmlFragment>;

type RenderFeed = (community: EditorialCommunity, userId: O.Option<UserId>) => TE.TaskEither<'not-found' | 'unavailable', HtmlFragment>;

type Components = {
  header: HtmlFragment,
  description: HtmlFragment,
  feed: string,
  followers: HtmlFragment,
};

const render = (components: Components): string => `
  <div class="sciety-grid sciety-grid--editorial-community">
    ${components.header}
    <div class="editorial-community-page-description">
    ${components.description}
    </div>
    <div class="editorial-community-page-side-bar">
      ${components.followers}
      ${components.feed}
    </div>
  </div>
`;

const renderErrorPage = (): RenderPageError => ({
  type: 'unavailable',
  message: toHtmlFragment('We couldn\'t retrieve this information. Please try again.'),
});

const asPage = (community: EditorialCommunity) => (components: Components): Page => ({
  title: community.name,
  content: pipe(components, render, toHtmlFragment),
});

export const renderPage = (
  renderPageHeader: RenderPageHeader,
  renderDescription: RenderDescription,
  renderFeed: RenderFeed,
  renderFollowers: (editorialCommunityId: EditorialCommunityId) => TE.TaskEither<'not-found' | 'unavailable', HtmlFragment>,
): RenderPage => (editorialCommunity, userId) => pipe(
  {
    header: TE.right(renderPageHeader(editorialCommunity)),
    description: renderDescription(editorialCommunity),
    followers: renderFollowers(editorialCommunity.id),
    feed: renderFeed(editorialCommunity, userId),
  },
  sequenceS(TE.taskEither),
  TE.bimap(renderErrorPage, asPage(editorialCommunity)),
);

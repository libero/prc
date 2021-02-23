import { sequenceS } from 'fp-ts/Apply';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { constant, flow, pipe } from 'fp-ts/function';
import striptags from 'striptags';
import { ArticleServer } from '../types/article-server';
import { Doi } from '../types/doi';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';
import { RenderPageError } from '../types/render-page-error';
import { SanitisedHtmlFragment } from '../types/sanitised-html-fragment';
import { UserId } from '../types/user-id';

type Page = {
  title: string,
  content: HtmlFragment,
  openGraph: {
    title: string,
    description: string,
  },
};

type ArticleDetails = {
  title: string,
  abstract: SanitisedHtmlFragment, // TODO Use HtmlFragment as the HTML is stripped
  server: ArticleServer,
};

type RenderTweetThis = (doi: Doi) => HtmlFragment;
type RenderSaveArticle = (doi: Doi, userId: O.Option<UserId>) => T.Task<HtmlFragment>;

type RenderFeed = (doi: Doi, server: ArticleServer, userId: O.Option<UserId>) => TE.TaskEither<'no-content', HtmlFragment>;
export type RenderActivityPage = (
  doi: Doi,
  userId: O.Option<UserId>,
  articleDetails: ArticleDetails
) => TE.TaskEither<RenderPageError, Page>;

const toErrorPage = (error: 'not-found' | 'unavailable'): RenderPageError => {
  switch (error) {
    case 'not-found':
      return {
        type: 'not-found',
        message: toHtmlFragment(`
            We’re having trouble finding this information.
            Ensure you have the correct URL, or try refreshing the page.
            You may need to come back later.
          `),
      };
    case 'unavailable':
      return {
        type: 'unavailable',
        message: toHtmlFragment(`
            We’re having trouble finding this information.
            Ensure you have the correct URL, or try refreshing the page.
            You may need to come back later.
          `),
      };
  }
};

const render = (components: {
  articleDetails: ArticleDetails,
  doi: Doi,
  feed: string,
  saveArticle: string,
  tweetThis: string,
}): Page => (
  {
    title: `${striptags(components.articleDetails.title)}`,
    content: toHtmlFragment(`
<article class="sciety-grid sciety-grid--activity">
  <header class="page-header page-header--article">
    <h1>${components.articleDetails.title}</h1>
    <div class="article-actions">
      ${components.tweetThis}
      ${components.saveArticle}
    </div>
  </header>
  <div class="article-tabs">
    <a class="article-tabs__tab article-tabs__link" href="/articles/meta/${components.doi.value}" aria-label="Discover article information and abstract">Article</a>
    <h2 class="article-tabs__tab article-tabs__heading">Activity</h2>
  </div>
  <div class="main-content main-content--article">
    ${components.feed}
  </div>

</article>
    `),
    openGraph: {
      title: striptags(components.articleDetails.title),
      description: striptags(components.articleDetails.abstract),
    },
  }
);

export const renderActivityPage = (
  renderFeed: RenderFeed,
  renderSaveArticle: RenderSaveArticle,
  renderTweetThis: RenderTweetThis,
): RenderActivityPage => (doi, userId, articleDetails) => {
  const components = {
    articleDetails: TE.right(articleDetails),
    doi: TE.right(doi),
    feed: pipe(
      articleDetails.server,
      (server) => renderFeed(doi, server, userId),
      TE.orElse(flow(constant(''), TE.right)),
    ),
    saveArticle: pipe(
      renderSaveArticle(doi, userId),
      TE.rightTask,
    ),
    tweetThis: pipe(
      doi,
      renderTweetThis,
      TE.right,
    ),
  };

  return pipe(
    components,
    sequenceS(TE.taskEither),
    TE.bimap(
      toErrorPage,
      render,
    ),
  );
};

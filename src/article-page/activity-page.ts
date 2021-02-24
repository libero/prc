import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { constant, flow, pipe } from 'fp-ts/function';
import striptags from 'striptags';
import {
  FindReviewsForArticleDoi, FindVersionsForArticleDoi, getArticleFeedEvents, GetEditorialCommunity,
} from './get-article-feed-events';
import { GetReview } from './get-feed-events-content';
import { projectHasUserSavedArticle } from './project-has-user-saved-article';
import { createProjectReviewResponseCounts } from './project-review-response-counts';
import { createProjectUserReviewResponse } from './project-user-review-response';
import { renderActivityPage } from './render-activity-page';
import { renderArticleVersionFeedItem } from './render-article-version-feed-item';
import { createRenderFeed } from './render-feed';
import { createRenderReviewFeedItem } from './render-review-feed-item';
import { createRenderReviewResponses } from './render-review-responses';
import { renderSaveArticle } from './render-save-article';
import { renderTweetThis } from './render-tweet-this';
import { ArticleServer } from '../types/article-server';
import { Doi } from '../types/doi';
import { DomainEvent } from '../types/domain-events';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';
import { RenderPageError } from '../types/render-page-error';
import { SanitisedHtmlFragment } from '../types/sanitised-html-fragment';
import { User } from '../types/user';

type ActivityPage = (params: Params) => TE.TaskEither<RenderPageError, Page>;

type Page = {
  title: string,
  content: HtmlFragment,
  openGraph: {
    title: string,
    description: string,
  },
};

type Params = {
  doi: Doi,
  user: O.Option<User>,
};

type GetArticleDetails = (doi: Doi) => TE.TaskEither<'not-found' | 'unavailable', {
  title: SanitisedHtmlFragment,
  abstract: SanitisedHtmlFragment, // TODO Use HtmlFragment as the HTML is stripped
  authors: Array<string>,
  server: ArticleServer,
}>;

type Ports = {
  fetchArticle: GetArticleDetails,
  fetchReview: GetReview,
  getEditorialCommunity: GetEditorialCommunity,
  findReviewsForArticleDoi: FindReviewsForArticleDoi,
  findVersionsForArticleDoi: FindVersionsForArticleDoi,
  getAllEvents: T.Task<ReadonlyArray<DomainEvent>>,
};

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

export const articleActivityPage = (ports: Ports): ActivityPage => {
  const countReviewResponses = createProjectReviewResponseCounts(ports.getAllEvents);
  const renderFeed = createRenderFeed(
    getArticleFeedEvents(
      ports.findReviewsForArticleDoi,
      ports.findVersionsForArticleDoi,
      ports.fetchReview,
      ports.getEditorialCommunity,
    ),
    createRenderReviewFeedItem(
      150,
      createRenderReviewResponses(
        countReviewResponses,
        createProjectUserReviewResponse(ports.getAllEvents),
      ),
    ),
    renderArticleVersionFeedItem,
  );

  return flow(
    TE.right,
    TE.bind('userId', ({ user }) => pipe(user, O.map((u) => u.id), TE.right)),
    TE.bind('articleDetails', ({ doi }) => pipe(doi, ports.fetchArticle)),
    TE.bindW('feed', ({ articleDetails, doi, userId }) => pipe(
      articleDetails.server,
      (server) => renderFeed(doi, server, userId),
      TE.orElse(flow(constant(''), TE.right)),
      TE.map(toHtmlFragment),
    )),
    TE.bindW('saveArticle', ({ doi, userId }) => pipe(
      renderSaveArticle(projectHasUserSavedArticle(ports.getAllEvents))(doi, userId),
      TE.rightTask,
    )),
    TE.bindW('tweetThis', ({ doi }) => pipe(
      doi,
      renderTweetThis,
      TE.right,
    )),
    TE.bimap(
      toErrorPage,
      (components) => ({
        content: renderActivityPage(components),
        title: `${striptags(components.articleDetails.title)}`,
        openGraph: {
          title: striptags(components.articleDetails.title),
          description: striptags(components.articleDetails.abstract),
        },
      }),
    ),
  );
};
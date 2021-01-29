import { URL } from 'url';
import * as RA from 'fp-ts/lib/ReadonlyArray';
import * as T from 'fp-ts/lib/Task';
import { flow, pipe } from 'fp-ts/lib/function';
import { Maybe } from 'true-myth';
import { getFeedEventsContent, GetReview } from './get-feed-events-content';
import { createHandleArticleVersionErrors } from './handle-article-version-errors';
import { mergeFeeds } from './merge-feeds';
import { GetFeedItems } from './render-feed';
import { ArticleServer } from '../types/article-server';
import { Doi } from '../types/doi';
import { EditorialCommunityId } from '../types/editorial-community-id';
import { ReviewId } from '../types/review-id';

type FindReviewsForArticleDoi = (articleVersionDoi: Doi) => T.Task<ReadonlyArray<{
  reviewId: ReviewId,
  editorialCommunityId: EditorialCommunityId,
  occurredAt: Date,
}>>;

export type FindVersionsForArticleDoi = (doi: Doi, server: ArticleServer) => T.Task<ReadonlyArray<{
  source: URL,
  occurredAt: Date,
  version: number,
}>>;

export const getArticleFeedEvents = (
  findReviewsForArticleDoi: FindReviewsForArticleDoi,
  findVersionsForArticleDoi: FindVersionsForArticleDoi,
  fetchReview: GetReview,
  getEditorialCommunity: (editorialCommunityId: EditorialCommunityId) => T.Task<Maybe<{
    name: string,
    avatar: URL,
  }>>,
): GetFeedItems => (
  (doi, server) => async () => (
    // TODO: turn into pipe to remove nesting
    createHandleArticleVersionErrors(
      getFeedEventsContent(
        mergeFeeds([
          () => pipe(
            doi,
            findReviewsForArticleDoi,
            T.map(RA.map((review) => ({ type: 'review', ...review }))),
          ),
          () => pipe(
            findVersionsForArticleDoi(doi, server),
            T.map(RA.map((version) => ({ type: 'article-version', ...version }))),
          ),
        ]),
        fetchReview,
        flow(
          getEditorialCommunity,
          T.map((editorialCommunityMaybe) => editorialCommunityMaybe.unsafelyUnwrap()),
        ),
      ),
    )(doi, server)()
  )
);

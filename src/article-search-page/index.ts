import * as T from 'fp-ts/lib/Task';
import * as TE from 'fp-ts/lib/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import createRenderPage, { RenderPage } from './render-page';
import createRenderSearchResult, { GetReviewCount } from './render-search-result';
import createRenderSearchResults, { FindArticles } from './render-search-results';
import { Doi } from '../types/doi';
import { EditorialCommunityId } from '../types/editorial-community-id';
import { ReviewId } from '../types/review-id';

type FindReviewsForArticleDoi = (articleDoi: Doi) => T.Task<ReadonlyArray<{
  reviewId: ReviewId,
  editorialCommunityId: EditorialCommunityId,
}>>;

interface Ports {
  searchEuropePmc: FindArticles,
  findReviewsForArticleDoi: FindReviewsForArticleDoi,
}

interface Params {
  query?: string,
}

type ArticleSearchPage = (params: Params) => ReturnType<RenderPage>;

export default (ports: Ports): ArticleSearchPage => {
  const getReviewCount: GetReviewCount = (doi) => pipe(
    ports.findReviewsForArticleDoi(doi),
    T.map((list) => list.length),
    TE.rightTask,
  );
  const renderSearchResult = createRenderSearchResult(getReviewCount);
  const renderSearchResults = createRenderSearchResults(ports.searchEuropePmc, renderSearchResult);

  const renderPage = createRenderPage(renderSearchResults);
  return (params) => (
    renderPage(params.query ?? '')
  );
};

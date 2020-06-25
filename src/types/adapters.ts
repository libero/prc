import EditorialCommunityRepository from './editorial-community-repository';
import { Json } from './json';
import ReviewReferenceRepository from './review-reference-repository';
import { FetchCrossrefArticle } from '../api/fetch-crossref-article';
import { FetchDataciteReview } from '../api/fetch-datacite-review';
import { FetchStaticFile } from '../api/fetch-static-file';
import { GetBiorxivCommentCount } from '../infrastructure/get-biorxiv-comment-count';

export interface Adapters {
  fetchArticle: FetchCrossrefArticle;
  getBiorxivCommentCount: GetBiorxivCommentCount;
  fetchReview: FetchDataciteReview;
  fetchStaticFile: FetchStaticFile;
  editorialCommunities: EditorialCommunityRepository;
  reviewReferenceRepository: ReviewReferenceRepository;
  getJson: (uri: string) => Promise<Json>;
}

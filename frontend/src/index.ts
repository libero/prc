import { createTerminus, TerminusOptions } from '@godaddy/terminus';
import createFetchDataset from './api/fetch-dataset';
import createFetchReview from './api/fetch-review';
import createFetchReviewedArticle from './api/fetch-reviewed-article';
import reviewReferenceRepository from './data/review-references';
import createLogger from './logger';
import createServer from './server';

const log = createLogger();

log('Starting server');

const fetchDataset = createFetchDataset();
const fetchReview = createFetchReview(fetchDataset);
const fetchReviewedArticle = createFetchReviewedArticle(reviewReferenceRepository, fetchReview);

const server = createServer({ fetchReviewedArticle, reviewReferenceRepository });

const terminusOptions: TerminusOptions = {
  onShutdown: async (): Promise<void> => {
    log('Shutting server down');
  },
  onSignal: async (): Promise<void> => {
    log('Signal received');
  },
  signals: ['SIGINT', 'SIGTERM'],
};

createTerminus(server, terminusOptions);

server.listen(80);

import { Logger } from './logger';
import { Doi } from '../types/doi';

type ResponseCache = Record<string, Promise<string>>;

type DownstreamFetcher = (doi: Doi, acceptHeader: string) => Promise<string>;

export const inMemoryResponseCache = (
  downstreamFetcher: DownstreamFetcher,
  logger: Logger,
): DownstreamFetcher => {
  const cache: ResponseCache = {};
  return async (doi, acceptHeader) => {
    const cached = cache[doi.value];
    if (cached !== undefined) {
      logger('debug', 'Article cache hit', { doi });
      return cached;
    }
    logger('debug', 'Article cache miss', { doi });
    const promise = downstreamFetcher(doi, acceptHeader)
      .catch((e) => {
        delete cache[doi.value];
        throw e;
      });
    cache[doi.value] = promise;
    return promise;
  };
};

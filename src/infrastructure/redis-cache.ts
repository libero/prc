import { Redis } from 'ioredis';
import { Logger } from './logger';
import { Doi } from '../types/doi';

type DownstreamFetcher = (doi: Doi, acceptHeader: string) => Promise<string>;

export const redisCache = (
  redis: Redis,
  downstreamFetcher: DownstreamFetcher,
  logger: Logger,
): DownstreamFetcher => async (doi, acceptHeader) => {
  const cached = await redis.get(doi.toString());
  if (cached !== null) {
    logger('debug', 'Redis cache hit', { doi });
    return cached;
  }
  logger('debug', 'Redis cache miss', { doi });
  const fetched = await downstreamFetcher(doi, acceptHeader);
  await redis.set(doi.toString(), fetched, 'EX', 60 * 60 * 24);
  return fetched;
};

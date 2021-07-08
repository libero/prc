/* eslint-disable no-empty */
import { inMemoryResponseCache } from '../../src/infrastructure/in-memory-response-cache';
import { Doi } from '../../src/types/doi';
import { dummyLogger } from '../dummy-logger';
import { arbitraryDoi } from '../types/doi.helper';

describe('in-memory-response-cache', () => {
  describe('when the required response is not in the cache', () => {
    it('makes a call to the downstream-fetcher', async () => {
      const downstreamFetcher = async () => 'a-string';
      const spy = jest.fn(downstreamFetcher);
      const cache = inMemoryResponseCache(spy, dummyLogger);
      await cache(arbitraryDoi(), '');

      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('returns the response', async () => {
      const cache = inMemoryResponseCache(async () => ('a-string'), dummyLogger);

      const actual = await cache(arbitraryDoi(), '');

      expect(actual).toBe('a-string');
    });

    describe('when the response is ok', () => {
      it('adds the response to the cache', async () => {
        const downstreamFetcher = async () => 'a-string';
        const spy = jest.fn(downstreamFetcher);
        const cache = inMemoryResponseCache(spy, dummyLogger);
        await cache(new Doi('10.1101/222222'), '');
        await cache(new Doi('10.1101/222222'), '');

        expect(spy).toHaveBeenCalledTimes(1);
      });
    });

    describe('when the downstream-fetcher throws', () => {
      it('removes the response from the cache', async () => {
        const downstreamFetcher = async () => { throw new Error('some-error'); };
        const spy = jest.fn(downstreamFetcher);
        const cache = inMemoryResponseCache(spy, dummyLogger);
        try {
          await cache(new Doi('10.1101/222222'), '');
        } catch (_: unknown) {}
        try {
          await cache(new Doi('10.1101/222222'), '');
        } catch (_: unknown) {}

        expect(spy).toHaveBeenCalledTimes(2);
      });
    });

    describe('when the DOI is requested twice simultaneously', () => {
      it('collapses the calls into one', async () => {
        const downstreamFetcher = async () => 'a-string';
        const spy = jest.fn(downstreamFetcher);
        const cache = inMemoryResponseCache(spy, dummyLogger);
        await Promise.all([
          cache(new Doi('10.1101/222222'), ''),
          cache(new Doi('10.1101/222222'), ''),
        ]);

        expect(spy).toHaveBeenCalledTimes(1);
      });

      describe('and an error happens', () => {
        it('both requests fail', async () => {
          const downstreamFetcher = async () => { throw new Error('some-error'); };
          const cache = inMemoryResponseCache(downstreamFetcher, dummyLogger);
          const results = await Promise.allSettled([
            cache(new Doi('10.1101/222222'), ''),
            cache(new Doi('10.1101/222222'), ''),
          ]);

          expect(results[0].status).toBe('rejected');
          expect(results[1].status).toBe('rejected');
        });
      });
    });
  });
});

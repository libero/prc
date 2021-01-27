import * as E from 'fp-ts/lib/Either';
import * as O from 'fp-ts/lib/Option';
import { articlePage, Params } from '../../src/article-page';
import { createTestServer } from '../http/server';

describe('create render page', (): void => {
  describe('when the article is from bioRxiv', (): void => {
    it('returns a page containing article metadata', async (): Promise<void> => {
      const { adapters } = await createTestServer();
      const renderPage = articlePage(adapters);
      const params: Params = { doi: '10.1101/833392', user: O.none };

      const page = await renderPage(params)();

      expect(page).toStrictEqual(
        E.right(
          expect.objectContaining({
            content: expect.stringContaining('10.1101/833392'),
          }),
        ),
      );
    });
  });

  describe('when the article does not exist', (): void => {
    it('returns a not-found error', async (): Promise<void> => {
      const { adapters } = await createTestServer();
      const renderPage = articlePage(adapters);
      const params: Params = { doi: 'rubbish', user: O.none };

      const error = await renderPage(params)();

      expect(error).toStrictEqual(E.left(expect.objectContaining({ type: 'not-found' })));
    });
  });

  describe('when the article is not from bioRxiv', (): void => {
    it('returns a not-found error', async (): Promise<void> => {
      const { adapters } = await createTestServer();
      const renderPage = articlePage(adapters);
      const params: Params = { doi: '10.7554/eLife.09560', user: O.none };

      const error = await renderPage(params)();

      expect(error).toStrictEqual(E.left(expect.objectContaining({ type: 'not-found' })));
    });
  });
});

import { URL } from 'url';
import createGetBiorxivArticleVersionEvents, { GetJson } from '../../src/article-page/get-biorxiv-article-version-events';
import Doi from '../../src/types/doi';

describe('get-biorxiv-article-version-events', () => {
  it('returns an article-version event for each article version', async () => {
    const doi = new Doi('10.1101/2020.09.02.278911');
    const getJson: GetJson = async () => ({
      collection: [
        {
          date: '2020-01-02',
          version: '2',
        },
        {
          date: '2019-12-31',
          version: '1',
        },
      ],
    });

    const getBiorxivArticleVersionEvents = createGetBiorxivArticleVersionEvents(getJson);

    const events = await getBiorxivArticleVersionEvents(doi);

    expect(events).toHaveLength(2);
    expect(events[0]).toStrictEqual({
      type: 'article-version',
      source: new URL('https://www.biorxiv.org/content/10.1101/2020.09.02.278911v2'),
      postedAt: new Date('2020-01-02'),
      version: 2,
    });
    expect(events[1]).toStrictEqual({
      type: 'article-version',
      source: new URL('https://www.biorxiv.org/content/10.1101/2020.09.02.278911v1'),
      postedAt: new Date('2019-12-31'),
      version: 1,
    });
  });
});

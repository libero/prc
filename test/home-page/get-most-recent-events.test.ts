import createGetMostRecentEvents, { GetFollowList } from '../../src/home-page/get-most-recent-events';
import Doi from '../../src/types/doi';
import EditorialCommunityId from '../../src/types/editorial-community-id';
import { Event } from '../../src/types/events';
import FollowList from '../../src/types/follow-list';
import { NonEmptyArray } from '../../src/types/non-empty-array';

describe('get-most-recent-events', () => {
  const editorialCommunity1 = new EditorialCommunityId('a');
  const getFollowList: GetFollowList = async () => new FollowList([editorialCommunity1]);
  const dummyEvent: Event = {
    type: 'ArticleEndorsed',
    date: new Date('2020-07-08'),
    actorId: editorialCommunity1,
    articleId: new Doi('10.1101/751099'),
  };

  it('sorts by date descending', async () => {
    const initial: NonEmptyArray<Event> = [
      {
        type: 'ArticleEndorsed',
        date: new Date('2020-07-08'),
        actorId: editorialCommunity1,
        articleId: new Doi('10.1101/751099'),
      },
      {
        type: 'ArticleReviewed',
        date: new Date('2020-07-09'),
        actorId: editorialCommunity1,
        articleId: new Doi('10.1101/2020.01.22.915660'),
      },
    ];
    const getEvents = createGetMostRecentEvents(getFollowList, initial, 20);
    const sortedEvents = await getEvents();

    expect(sortedEvents[0]).toStrictEqual(initial[1]);
    expect(sortedEvents[1]).toStrictEqual(initial[0]);
  });

  it.todo('always returns EditorialCommunityJoined events');

  it.todo('only returns events for the follow list');

  describe('when there\'s a small number of items', () => {
    it('returns exactly those', async () => {
      const dummyEvents: NonEmptyArray<Event> = [dummyEvent, dummyEvent, dummyEvent];
      const getEvents = createGetMostRecentEvents(getFollowList, dummyEvents, 20);
      const events = await getEvents();

      expect(events).toHaveLength(dummyEvents.length);
    });
  });

  describe('when there are more items than the specified maximum', () => {
    it('returns just the specified maximum number of items', async () => {
      const dummyEvents: NonEmptyArray<Event> = [dummyEvent, dummyEvent, dummyEvent];
      const maxCount = 2;
      const getEvents = createGetMostRecentEvents(getFollowList, dummyEvents, maxCount);
      const events = await getEvents();

      expect(events).toHaveLength(maxCount);
    });
  });
});

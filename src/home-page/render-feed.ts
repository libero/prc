import templateDate from '../templates/date';
import templateListItems from '../templates/list-items';

type RenderFeed = () => Promise<string>;

type Actor = {
  url: string;
  name: string;
  imageUrl: string;
};

type ArticleEndorsedEvent = {
  type: 'ArticleEndorsed';
  date: Date;
  actor: Actor;
  articleId: string;
  articleTitle: string;
};

const isArticleEndorsedEvent = (event: Event): event is ArticleEndorsedEvent => (
  'type' in event && event.type === 'ArticleEndorsed'
);

type ArticleReviewedEvent = {
  type: 'ArticleReviewed';
  date: Date;
  actor: Actor;
  articleId: string;
  articleTitle: string;
};

const isArticleReviewedEvent = (event: Event): event is ArticleReviewedEvent => (
  'type' in event && event.type === 'ArticleReviewed'
);

type EditorialCommunityJoinedEvent = {
  type: 'EditorialCommunityJoined';
  date: Date;
  actor: Actor;
};

type Event = ArticleEndorsedEvent | ArticleReviewedEvent | EditorialCommunityJoinedEvent;

const events: Array<Event> = [
  {
    type: 'ArticleReviewed',
    date: new Date('2020-07-09'),
    actor: {
      url: '/editorial-communities/10360d97-bf52-4aef-b2fa-2f60d319edd8',
      name: 'A PREreview Journal Club',
      imageUrl: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png',
    },
    articleId: '10.1101/2020.01.22.915660',
    articleTitle: 'Functional assessment of cell entry and receptor usage for lineage B β-coronaviruses, including 2019-nCoV',
  },
  {
    type: 'ArticleEndorsed',
    date: new Date('2020-07-09'),
    actor: {
      url: '/editorial-communities/53ed5364-a016-11ea-bb37-0242ac130002',
      name: 'PeerJ',
      imageUrl: 'https://pbs.twimg.com/profile_images/1095287970939265026/xgyGFDJk_200x200.jpg',
    },
    articleId: '10.1101/751099',
    articleTitle: 'Diffusion tubes: a method for the mass culture of ctenophores and other pelagic marine invertebrates',
  },
  {
    type: 'ArticleReviewed',
    date: new Date('2020-07-09'),
    actor: {
      url: '/editorial-communities/316db7d9-88cc-4c26-b386-f067e0f56334',
      name: 'Review Commons',
      imageUrl: 'https://pbs.twimg.com/profile_images/1204012644660854784/E8JhkG7__200x200.jpg',
    },
    articleId: '10.1101/2019.12.13.875419',
    articleTitle: 'Unconventional kinetochore kinases KKT2 and KKT3 have a unique zinc finger that promotes their kinetochore localization',
  },
  {
    type: 'ArticleReviewed',
    date: new Date('2020-07-08'),
    actor: {
      url: '/editorial-communities/b560187e-f2fb-4ff9-a861-a204f3fc0fb0',
      name: 'eLife',
      imageUrl: 'https://pbs.twimg.com/profile_images/1239550325188710402/7_lY-IyL_200x200.png',
    },
    articleId: '10.1101/2020.05.14.095547',
    articleTitle: 'GATA-1-dependent histone H3K27ac mediates erythroid cell-specific interaction between CTCF sites',
  },
  {
    type: 'ArticleReviewed',
    date: new Date('2020-07-08'),

    actor: {
      url: '/editorial-communities/53ed5364-a016-11ea-bb37-0242ac130002',
      name: 'PeerJ',
      imageUrl: 'https://pbs.twimg.com/profile_images/1095287970939265026/xgyGFDJk_200x200.jpg',
    },
    articleId: '10.1101/751099',
    articleTitle: 'Diffusion tubes: a method for the mass culture of ctenophores and other pelagic marine invertebrates',
  },
  {
    type: 'ArticleReviewed',
    date: new Date('2020-07-08'),
    actor: {
      url: '/editorial-communities/b560187e-f2fb-4ff9-a861-a204f3fc0fb0',
      name: 'eLife',
      imageUrl: 'https://pbs.twimg.com/profile_images/1239550325188710402/7_lY-IyL_200x200.png',
    },
    articleId: '10.1101/2020.05.14.095547',
    articleTitle: 'GATA-1-dependent histone H3K27ac mediates erythroid cell-specific interaction between CTCF sites',
  },
  {
    type: 'EditorialCommunityJoined',
    date: new Date('2020-06-18'),
    actor: {
      url: '/editorial-communities/316db7d9-88cc-4c26-b386-f067e0f56334',
      name: 'Review Commons',
      imageUrl: 'https://pbs.twimg.com/profile_images/1204012644660854784/E8JhkG7__200x200.jpg',
    },
  },
  {
    type: 'EditorialCommunityJoined',
    date: new Date('2020-06-14'),
    actor: {
      url: '/editorial-communities/10360d97-bf52-4aef-b2fa-2f60d319edd8',
      name: 'A PREreview Journal Club',
      imageUrl: 'https://abs.twimg.com/sticky/default_profile_images/default_profile_bigger.png',
    },
  },
];

type TemplateFeedItem = (event: Event) => string;

const templateFeedItem: TemplateFeedItem = (event) => {
  if (isArticleEndorsedEvent(event)) {
    return `
      <a href="${event.actor.url}">${event.actor.name}</a>
      endorsed
      <a href="/articles/${event.articleId}">${event.articleTitle}</a>
    `;
  }
  if (isArticleReviewedEvent(event)) {
    return `
      <a href="${event.actor.url}">${event.actor.name}</a>
      reviewed
      <a href="/articles/${event.articleId}">${event.articleTitle}</a>
    `;
  }
  return `
    <a href="${event.actor.url}">${event.actor.name}</a>
    joined The Hive
  `;
};

export default (): RenderFeed => (
  async () => {
    const feedItems = events.map((event) => `
      <div class="label">
        <img src="${event.actor.imageUrl}">
      </div>
      <div class="content">
        <div class="date">
          ${templateDate(event.date)}
        </div>
        <div class="summary">
          ${templateFeedItem(event)}
        </div>
      </div>
    `);
    return `
      <section>
        <h2 class="ui header">
          Feed
        </h2>
        <ol class="ui large feed">
          ${templateListItems(feedItems, 'event')}
        </ol>
      </section>
    `;
  }
);

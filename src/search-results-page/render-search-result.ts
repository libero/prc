import * as O from 'fp-ts/Option';
import { flow, pipe } from 'fp-ts/function';
import { templateDate } from '../shared-components';
import { Doi } from '../types/doi';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';
import { SanitisedHtmlFragment } from '../types/sanitised-html-fragment';

export type ArticleSearchResult = {
  _tag: 'Article',
  doi: Doi,
  title: string,
  authors: string,
  postedDate: Date,
  reviewCount: O.Option<number>,
};

type GroupSearchResult = {
  _tag: 'Group',
  link: string,
  name: string,
  description: SanitisedHtmlFragment,
  avatarPath: string,
  followers: number,
};

export type SearchResult = ArticleSearchResult | GroupSearchResult;

const renderReviewCount = (reviewCount: number) => `
  <div class="search-results-list__item__review-count">
    Reviews: ${reviewCount}
  </div>
`;

const renderReviews = flow(
  O.filter((reviewCount: number) => reviewCount > 0),
  O.fold(() => '', renderReviewCount),
  toHtmlFragment,
);

const templatePostedDate = flow(
  templateDate,
  (date) => `<div class="search-results-list__item__date">Posted ${date}</div>`,
);

const renderArticleSearchResult = flow(
  (result: ArticleSearchResult) => `
    <div>
      <a class="search-results-list__item__link" href="/articles/activity/${result.doi.value}">${result.title}</a>
      <div>
        ${result.authors}
      </div>
      ${templatePostedDate(result.postedDate)}
      ${renderReviews(result.reviewCount)}
    </div>
  `,
  toHtmlFragment,
);

const renderGroupSearchResult = (result: GroupSearchResult) => pipe(
  `
    <div>
      <a class="search-results-list__item__link" href="${result.link}">${result.name}</a>
      <div class="search-results-list__item__description">
        ${result.description}
      </div>
      <ul class="search-results-list__item__meta">
        <li>${result.followers} Followers</li>
      </ul>
    </div>
    <img class="search-results-list__item__avatar" src="${result.avatarPath}" />
  `,
  toHtmlFragment,
);

export type RenderSearchResult = (result: SearchResult) => HtmlFragment;

export const renderSearchResult: RenderSearchResult = (result) => {
  switch (result._tag) {
    case 'Article':
      return renderArticleSearchResult(result);
    case 'Group':
      return renderGroupSearchResult(result);
  }
};

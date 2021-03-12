import * as TE from 'fp-ts/TaskEither';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';
import { Page } from '../types/page';
import { RenderPageError } from '../types/render-page-error';

export type RenderPage = (query: string) => TE.TaskEither<RenderPageError, Page>;

export const renderErrorPage = (error: 'unavailable'): RenderPageError => ({
  type: error,
  message: toHtmlFragment('We\'re having trouble searching for you, please come back later.'),
});

export const renderPage = (query: string) => (searchResults: HtmlFragment): Page => ({
  title: `Search results for ${query}`,
  content: toHtmlFragment(`
    <div class="search-results-page__background--filler">
      <div class="sciety-grid sciety-grid--search-results">
        <header class="page-header page-header--search-results">
          <h1 class="page-heading--search">Search sciety</h1>
        </header>
        <form action="/articles" method="get" class="search-form">
          <label for="searchText" class="visually-hidden">Search term</label>
          <input id="searchText" name="query" class="search-form__text">
          <div>
            <button type="submit">Search</button>
            <button type="reset">Reset</button>
          </div>
        </form>
        <section class="search-results">
          ${searchResults}
        </section>
      </div>
    </div>
  `),
});

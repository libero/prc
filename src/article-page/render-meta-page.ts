import { ArticleServer } from '../types/article-server';
import { Doi } from '../types/doi';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';
import { SanitisedHtmlFragment } from '../types/sanitised-html-fragment';

type ArticleDetails = {
  title: string,
  abstract: SanitisedHtmlFragment, // TODO Use HtmlFragment as the HTML is stripped
  authors: Array<string>,
  server: ArticleServer,
};

export const renderMetaPage = (components: {
  articleDetails: ArticleDetails,
  abstract: HtmlFragment,
  doi: Doi,
  saveArticle: string,
  tweetThis: string,
}): HtmlFragment => toHtmlFragment(`
<article class="sciety-grid sciety-grid--meta">
  <header class="page-header page-header--article">
    <h1>${components.articleDetails.title}</h1>
    <div class="article-actions">
      ${components.tweetThis}
      ${components.saveArticle}
    </div>
  </header>

  <div class="article-tabs">
    <h2 class="article-tabs__tab article-tabs__heading">Article</h2>
    <a class="article-tabs__tab article-tabs__link" href="/articles/activity/${components.doi.value}" aria-label="Discover article activity">Activity</a>
  </div>

  <div class="main-content main-content--article">
    <section class="article-meta">
      <h3>Authors</h3>
      <ol aria-label="Authors of this article" class="article-author-list" role="list">
        ${components.articleDetails.authors.map((author) => `<li>${author}</li>`).join('')}
      </ol>
      <ul aria-label="Publication details" class="article-meta-data-list" role="list">
        <li>
          <a href="https://doi.org/${components.doi.value}">https://doi.org/${components.doi.value}</a>
        </li>
      </ul>
    </section>

    ${components.abstract}
  </div>

</article>
    `);

import * as T from 'fp-ts/lib/Task';
import { pipe } from 'fp-ts/lib/function';
import { Result } from 'true-myth';
import { Doi } from '../types/doi';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';
import { SanitisedHtmlFragment } from '../types/sanitised-html-fragment';

export type GetArticleAbstract<E> = (doi: Doi) => T.Task<Result<SanitisedHtmlFragment, E>>;

type RenderArticleAbstract<E> = (doi: Doi) => T.Task<Result<HtmlFragment, E>>;

export const createRenderArticleAbstract = <E> (
  getArticleAbstract: GetArticleAbstract<E>,
): RenderArticleAbstract<E> => (
    (doi) => pipe(
      doi,
      getArticleAbstract,
      T.map((result) => result.map((articleAbstract) => toHtmlFragment(`
      <section class="article-abstract" role="doc-abstract">
        <h2>
          Abstract
        </h2>
          ${articleAbstract}
          <a href="https://doi.org/${doi.value}" class="article-call-to-action-link">
            Read the full article
          </a>
      </section>
    `))),
    )
  );

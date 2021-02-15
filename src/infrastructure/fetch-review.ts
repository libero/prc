import { URL } from 'url';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as T from 'fp-ts/Task';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import { FetchDataciteReview } from './fetch-datacite-review';
import { FetchHypothesisAnnotation } from './fetch-hypothesis-annotation';
import { Doi } from '../types/doi';
import { HtmlFragment, toHtmlFragment } from '../types/html-fragment';
import { HypothesisAnnotationId } from '../types/hypothesis-annotation-id';
import { ReviewId } from '../types/review-id';

const hardcodedNCRCReview = toHtmlFragment(`
  <h3>Our take</h3>
  <p>
    This study provides convincing rationale to explore administering only one dose of mRNA vaccine to individuals who possess pre-existing SARS-CoV-2 immunity from previous infection. Antibody testing could be performed prior to vaccination for individuals whose infection history is unknown. This strategy could free up a vast number of vaccine doses, as well as limit discomfort from reactogenicity in those who have pre-existing immunity.
  </p>
  <h3>Study design</h3>
  <p>
    Other
  </p>
  <h3>Study population and setting</h3>
  <p>
    This study investigated individuals who had been vaccinated with either Pfizer or Moderna’s mRNA vaccine in 2020. Antibody responses were studied in 109 participants with and without documented pre-existing SARS-CoV-2 antibody responses (68 seronegative, 41 seropositive). The frequency of local, injection site-related and systemic reactions after first dose of vaccination in 231 participants (149 seronegative, 83 seropositive) was also investigated.
  </p>
  <h3>Summary of main findings</h3>
  <p>
    While seronegative participants mounted low SARS-CoV-2 IgG antibody responses 9-12 days after their first vaccination, seropositive individuals developed antibody titers 10-12 times higher within only days of their first vaccination. Futher, seropositive participants’ antibody titers following their first vaccination were over 10-fold higher than titers measured in seronegative individuals after their second vaccine. Next, mild, local reactions did not differ based on serostatus. However, seropositive individuals had a significantly higher frequency of systemic side effects (ex. fever, chills, fatigue, muscle and joint pains, headache) compared to seronegative individuals. Reactogenicity for seropositive individuals after first dose seemed to resemble reactions of seronegative individuals after their second dose, as reported in phase 3 trials.
  </p>
  <h3>Study strengths</h3>
  <p>
    This study employed a mixture of participants who received either the Pfizer or Moderna mRNA vaccines, which are the two vaccines that have been approved for use by the FDA in the US. Also, they were able to obtain a decent sample size for a first look into this question.
  </p>
  <h3>Limitations</h3>
  <p>
    More seronegative participants were included in this study than seropositive individuals and the groups were not paired in a case-control format.
  </p>
  <h3>Value added</h3>
  <p>
    First concrete rationale for administering only one vaccine dose to those who already have some level of pre-existing SARS-CoV-2 immunity from previous infection.
  </p>
`);

export type FetchReview = (id: ReviewId) => TE.TaskEither<'unavailable' | 'not-found', {
  fullText: HtmlFragment,
  url: URL,
}>;

export const createFetchReview = (
  fetchDataciteReview: FetchDataciteReview,
  fetchHypothesisAnnotation: FetchHypothesisAnnotation,
): FetchReview => (
  (id) => {
    if (id instanceof Doi) {
      return fetchDataciteReview(id);
    }

    if (id instanceof HypothesisAnnotationId) {
      return pipe(
        id,
        fetchHypothesisAnnotation,
        T.map((review) => pipe(
          review.fullText,
          O.fold(
            () => E.left('unavailable' as const),
            (fullText) => E.right({
              ...review,
              fullText,
            }),
          ),
        )),
      );
    }

    return TE.right({
      url: new URL('https://ncrc.jhsph.edu/research/robust-spike-antibody-responses-and-increased-reactogenicity-in-seropositive-individuals-after-a-single-dose-of-sars-cov-2-mrna-vaccine/'),
      fullText: hardcodedNCRCReview,
    });
  }
);

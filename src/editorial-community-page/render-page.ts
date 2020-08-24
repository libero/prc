import EditorialCommunityId from '../types/editorial-community-id';
import { UserId } from '../types/user-id';

type Component = (editorialCommunityId: EditorialCommunityId, userId: UserId) => Promise<string>;

type RenderPage = (editorialCommunityId: EditorialCommunityId, userId: UserId) => Promise<string>;

export default (
  renderPageHeader: Component,
  renderDescription: Component,
  renderEndorsedArticles: Component,
  renderReviewedArticles: Component,
  renderFeed: Component,
): RenderPage => (
  async (editorialCommunityId, userId) => (
    `
      <div class="ui aligned stackable grid">
        <div class="row">
          <div class="column">
            ${await renderPageHeader(editorialCommunityId, userId)}
          </div>
        </div>
        <div class="row">
          <div class="eight wide column">
            ${await renderDescription(editorialCommunityId, userId)}
          </div>
          <div class="eight wide column">
            <section class="ui two statistics">
              ${await renderEndorsedArticles(editorialCommunityId, userId)}
              ${await renderReviewedArticles(editorialCommunityId, userId)}
            </section>
            ${await renderFeed(editorialCommunityId, userId)}
          </div>
        </div> 
      </div>
    `
  )
);

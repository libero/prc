import Router from '@koa/router';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';
import * as TE from 'fp-ts/TaskEither';
import { flow, pipe } from 'fp-ts/function';
import { StatusCodes } from 'http-status-codes';
import { ParameterizedContext } from 'koa';
import bodyParser from 'koa-bodyparser';
import { authenticate } from './authenticate';
import { catchErrors } from './catch-errors';
import { catchStaticFileErrors } from './catch-static-file-errors';
import { loadStaticFile } from './load-static-file';
import { logOut } from './log-out';
import { onlyIfNotAuthenticated } from './only-if-authenticated';
import { pageHandler, RenderPage } from './page-handler';
import { ping } from './ping';
import { redirectBack } from './redirect-back';
import { redirectAfterAuthenticating, requireAuthentication } from './require-authentication';
import { robots } from './robots';
import { aboutPage } from '../about-page';
import { articleActivityPage, articleMetaPage } from '../article-page';
import { followHandler } from '../follow';
import { finishFollowCommand } from '../follow/finish-follow-command';
import { saveFollowCommand } from '../follow/save-follow-command';
import { groupPage } from '../group-page';
import { homePage } from '../home-page';
import { Adapters } from '../infrastructure/adapters';
import { privacyPage } from '../privacy-page';
import { respondHandler } from '../respond';
import { finishRespondCommand } from '../respond/finish-respond-command';
import { saveRespondCommand } from '../respond/save-respond-command';
import { finishSaveArticleCommand } from '../save-article/finish-save-article-command';
import { saveSaveArticleCommand } from '../save-article/save-save-article-command';
import { searchResultsPage } from '../search-results-page';
import { termsPage } from '../terms-page';
import * as Doi from '../types/doi';
import { toHtmlFragment } from '../types/html-fragment';
import { unfollowHandler } from '../unfollow';
import { finishUnfollowCommand } from '../unfollow/finish-unfollow-command';
import { saveUnfollowCommand } from '../unfollow/save-unfollow-command';
import { userPage } from '../user-page';

const biorxivPrefix = '10.1101';

const ensureBiorxivDoiParam = ({ doi, ...params }: Parameters<RenderPage>[0]) => pipe(
  params,
  O.some,
  O.bind('doi', () => pipe(
    doi,
    O.fromNullable,
    O.chain(Doi.fromString),
    O.filter(Doi.hasPrefix(biorxivPrefix)),
  )),
  E.fromOption(() => ({
    type: 'not-found' as const,
    message: toHtmlFragment(`${doi ?? 'Article'} not found`),
  })),
);

export const createRouter = (adapters: Adapters): Router => {
  const router = new Router();

  // PAGES

  router.get('/',
    pageHandler(flow(homePage(adapters), TE.rightTask)));

  router.get('/about',
    pageHandler(() => aboutPage(adapters.fetchStaticFile)));

  router.get('/users/:id(.+)',
    pageHandler(userPage(adapters)));

  router.get('/articles',
    async (context, next) => {
      context.response.set('X-Robots-Tag', 'noindex');
      await next();
    },
    pageHandler(searchResultsPage(adapters)));

  router.get('/articles/:doi(10\\..+)',
    async (context, next) => {
      context.status = StatusCodes.PERMANENT_REDIRECT;
      context.redirect(`/articles/activity/${context.params.doi}`);

      await next();
    });

  router.get('/articles/meta/:doi(.+)',
    pageHandler(flow(ensureBiorxivDoiParam, TE.fromEither, TE.chain((args) => articleMetaPage(args)(adapters)))));

  router.get('/articles/activity/:doi(.+)',
    pageHandler(flow(ensureBiorxivDoiParam, TE.fromEither, TE.chain((args) => articleActivityPage(args)(adapters)))));

  router.get('/groups/:id',
    pageHandler(groupPage(adapters)));

  router.get('/editorial-communities/:id',
    async (context, next) => {
      context.status = StatusCodes.PERMANENT_REDIRECT;
      context.redirect(`/groups/${context.params.id}`);

      await next();
    });

  router.get('/privacy',
    pageHandler(() => pipe(privacyPage, TE.right)));

  router.get('/terms',
    pageHandler(() => pipe(termsPage, TE.right)));

  // COMMANDS

  router.post('/follow',
    bodyParser({ enableTypes: ['form'] }),
    saveFollowCommand(),
    requireAuthentication,
    followHandler(adapters));

  router.post('/unfollow',
    bodyParser({ enableTypes: ['form'] }),
    saveUnfollowCommand(),
    requireAuthentication,
    unfollowHandler(adapters));

  router.post('/respond',
    bodyParser({ enableTypes: ['form'] }),
    saveRespondCommand,
    requireAuthentication,
    respondHandler(adapters));

  router.post('/save-article',
    bodyParser({ enableTypes: ['form'] }),
    saveSaveArticleCommand,
    requireAuthentication,
    finishSaveArticleCommand(adapters),
    redirectBack);

  // AUTHENTICATION

  router.get('/log-in',
    async (context: ParameterizedContext, next) => {
      if (!context.session.successRedirect) {
        context.session.successRedirect = context.request.headers.referer ?? '/';
      }
      await next();
    },
    authenticate);

  router.get('/log-out',
    logOut);

  // TODO set commands as an object on the session rather than individual properties
  router.get('/twitter/callback',
    catchErrors(
      adapters.logger,
      'Detected Twitter callback error',
      'Something went wrong, please try again.',
    ),
    onlyIfNotAuthenticated(authenticate),
    finishFollowCommand(adapters),
    finishUnfollowCommand(adapters),
    finishRespondCommand(adapters),
    finishSaveArticleCommand(adapters),
    redirectAfterAuthenticating());

  // MISC

  router.get('/ping',
    ping());

  router.get('/robots.txt',
    robots());

  router.get('/static/:file(.+)',
    catchStaticFileErrors(adapters.logger),
    loadStaticFile);

  return router;
};

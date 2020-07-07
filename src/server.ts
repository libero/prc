import { createServer, Server } from 'http';
import path from 'path';
import Router from '@koa/router';
import Koa, { ExtendableContext, Next, ParameterizedContext } from 'koa';
import mount from 'koa-mount';
import send from 'koa-send';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from './logger';

type SetRequestId = (requestId: string) => void;

export default (router: Router, logger: Logger, setRequestId: SetRequestId): Server => {
  const app = new Koa();

  app.use(async ({ request, res }: ExtendableContext, next: Next): Promise<void> => {
    const requestId = uuidv4();
    setRequestId(requestId);
    logger('info', 'Received HTTP request', {
      method: request.method,
      url: request.url,
      requestId,
    });

    res.once('finish', () => {
      logger('info', 'Sent HTTP response', {
        status: res.statusCode,
        requestId,
      });
    });

    res.once('close', () => {
      if (res.writableFinished) {
        return;
      }

      logger('info', 'HTTP response not completely sent', {
        status: res.statusCode,
        requestId,
      });
    });

    await next();
  });

  app.use(mount('/static', async (context: ParameterizedContext): Promise<void> => {
    await send(context, context.path, { root: path.resolve(__dirname, '../static') });
  }));
  app.use(router.middleware());

  app.on('error', (error) => logger('error', 'Unhandled Error', { error }));

  // eslint-disable-next-line @typescript-eslint/no-misused-promises -- https://github.com/DefinitelyTyped/DefinitelyTyped/issues/40070
  const server = createServer(app.callback());

  server.on('listening', (): void => logger('debug', 'Server running'));
  server.on('close', (): void => logger('debug', 'Server stopping'));

  return server;
};

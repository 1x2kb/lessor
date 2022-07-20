import { stdout } from 'process';
import createError from 'http-errors';
import express, { Request, Response, NextFunction } from 'express';
import logger from 'morgan';

import root from './routes';
import numbers from './routes/numbers';

import Twilio from './modules/twilio';

interface ErrorBody {
  message: string;
  env?: string;
  stack?: string[];
}

const app = express();

app.set('external-base-url', process.env.EXTERNAL_BASE_URL);

app.use(logger(stdout.isTTY ? 'dev' : 'common'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', root);
app.use(
  '/numbers',
  numbers(
    new Twilio(
      process.env.TWILIO_ACCOUNT_SID || '',
      process.env.TWILIO_AUTH_TOKEN || ''
    )
  )
);

// catch 404 and forward to error handler
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(createError(404));
});

// error handler
app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err && !err.status) console.error('Unexpected error:', err);

  // set body, only providing error in development
  const body: ErrorBody = {
    message: err.message,
  };

  if (req.app.get('env') === 'development') {
    body.env = req.app.get('env');
    if (err.stack) body.stack = err.stack.split('\n');
  }

  // render the error page
  res.status(err.status || 500);
  res.send(body);
});

export default app;

import 'dotenv/config';
import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import passport from 'passport';
import pluralize from 'pluralize';
import { fileURLToPath } from 'url';

import session from 'express-session';
import connectSequelize from 'connect-session-sequelize';

import indexRouter from './src/routes/index.js';
import authRouter from './src/routes/auth.js';

import apiTodoRouter from './src/routes/api/todos.js';
import apiAuthRouter from './src/routes/api/authentication.js';
import sequelize from './src/models/index.js';

const SequelizeStore = connectSequelize(session.Store);
const app = express();

const port = 3000;

app.use(
  session({
    secret: process.env.SECRET_KEY,
    store: new SequelizeStore({
      db: sequelize,
    }),
    resave: true,
    proxy: true, // if you do SSL outside of node.
  }),
);
app.locals.pluralize = pluralize;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(passport.authenticate('session'));

app.use('/', indexRouter);
app.use('/', authRouter);
app.use('/api', apiTodoRouter);
app.use('/api', apiAuthRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, async (err) => {
  // eslint-disable-next-line no-console
  try {
    await sequelize.sync()  //{force: true}
    console.log('Connected to database');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
  console.log(`running server on from port:${port}`, err);
});

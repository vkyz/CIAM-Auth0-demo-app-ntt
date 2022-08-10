const dotenv = require('dotenv');
const express = require('express');
const http = require('http');
const logger = require('morgan');
const bodyParser = require('body-parser');
const path = require('path');
const router = require('./routes/index');
const { auth } = require('express-openid-connect');


dotenv.load();

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const config = {
  authRequired: false,
  auth0Logout: true,
  authorizationParams: {
    response_type: 'code',
    audience: process.env.AUDIENCE,
    scope: 'openid profile email read:current_user view:balance transfer:funds',
    //screen_hint: 'signup'
  }
};

const port = process.env.PORT || 9999;
if (!config.baseURL && !process.env.BASE_URL && process.env.PORT && process.env.NODE_ENV !== 'production') {
  config.baseURL = `http://localhost:${port}`;
}

app.use(auth(config));
/* 
// USE YOUR OWN /LOGIN ROUTE 
app.use(
  auth({
    authRequired: false,
    routes: {
      // Pass custom options to the login method by overriding the default login route
      login: false,
      // Pass a custom path to the postLogoutRedirect to redirect users to a different
      // path after login, this should be registered on your authorization server.
      postLogoutRedirect: '/custom-logout',
    },
  })
);
app.get('/login', (req, res) => res.oidc.login({ returnTo: '/profile' }));
*/

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  //console.log("req.oidc.user: ",req.oidc.user);
  res.locals.user = req.oidc.user;
  res.locals.isAuthenticated = req.oidc.isAuthenticated;
  next();
});

app.use('/', router);

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Error handlers
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: process.env.NODE_ENV !== 'production' ? err : {}
  });
});

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store')
  next()
})
app.disable('view cache');

http.createServer(app)
  .listen(port, () => {
    console.log(`Listening on ${config.baseURL}`);
  });

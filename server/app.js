const config = require('../config');
const colors = require('colors/safe');
const path = require('path');

const express = require('express');
const webpack = require('webpack');

const webpackConfig = require('../build/webpack.dev.conf');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const connectHistoryAPIFallback = require('connect-history-api-fallback');

const morgan = require('morgan');
const favicon = require('serve-favicon');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const shrinkRay = require('shrink-ray');
const session = require('express-session');
const cookieParser = require('cookie-parser');

function padStringSpace(s, length) {
  if (s.length >= length) {
    return s;
  }
  return `        ${s}`.slice(-length);
}

class HomeFinderServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || config.dev.port || 8080;
    this.host = process.env.HOST || config.dev.host || '0.0.0.0';

    this.devMiddleware = null;
    this.hotMiddleware = null;

    this.server = null;

    this._installMorgan();
    this._installWebpack();
    this._installShrinkRay();
    this._installFavicon();
    this._installMethodOverride();
    this._installCookieParser();
    this._installSession();
    this._installStatic();
    this._installBodyParser();
  }

  _installMorgan() {
    this.app.use(morgan((tokens, req, res) => {
      let retCode;
      let respTime = tokens['response-time'](req, res);

      if (res.statusCode >= 400) {
        retCode = colors.red(res.statusCode.toString());
      } else if (res.statusCode >= 300) {
        retCode = colors.yellow(res.statusCode.toString());
      } else {
        retCode = colors.green(res.statusCode.toString());
      }

      if (respTime !== '-') {
        const t = parseFloat(respTime);
        if (t < 10) {
          respTime = colors.green(`${padStringSpace(respTime, 6)}ms`);
        } else if (t < 50) {
          respTime = colors.yellow(`${padStringSpace(respTime, 6)}ms`);
        } else {
          respTime = colors.red(`${padStringSpace(respTime, 6)}ms`);
        }
      } else {
        respTime = colors.red('NO RESPONSE');
      }

      return [
        `[${colors.gray((new Date()).toLocaleTimeString())}]`,
        colors.gray('HTTP'),
        retCode,
        colors.gray('-'),
        respTime,
        colors.gray('-'),
        colors.magenta(tokens.method(req, res)),
        tokens.url(req, res),
        colors.gray('-'),
        tokens.res(req, res, 'content-length'),
        colors.gray('bytes'),
      ].join(' ');
    }));
  }

  _installWebpack() {
    const compiler = webpack(webpackConfig);

    this.devMiddleware = webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      quiet: true,
    });

    this.hotMiddleware = webpackHotMiddleware(compiler, {
      log: () => {},
    });

    compiler.plugin('compilation', (compilation) => {
      compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
        this.hotMiddleware.publish({ action: 'reload' });
        cb();
      });
    });

    this.app.use(connectHistoryAPIFallback());

    this.app.use(this.devMiddleware);
    this.app.use(this.hotMiddleware);
  }

  _installShrinkRay() {
    this.app.use(shrinkRay());
  }

  _installFavicon() {
    this.app.use(favicon(config.favicon));
  }

  _installMethodOverride() {
    this.app.use(methodOverride());
  }

  _installCookieParser() {
    this.app.use(cookieParser());
  }

  _installSession() {
    this.app.use(session({
      resave: false,
      saveUninitialized: true,
      secret: config.sessionSecret,
    }));
  }

  _installStatic() {
    const staticPath = path.posix.join(
      config.dev.assetsPublicPath,
      config.dev.assetsSubDirectory);
    this.app.use(staticPath, express.static('./static'));
  }

  _installBodyParser() {
    this.app.use(bodyParser.urlencoded({ extended: false }));
    this.app.use(bodyParser.json());
  }

  run() {
    const uri = `http://${this.host}:${this.port}`;

    console.log('> Starting HomeFinder Server...');
    this.server = this.app.listen(this.port, this.host);

    return new Promise((resolve) => {
      this.devMiddleware.waitUntilValid(() => {
        console.info(`Listening at ${uri}\n`);
        resolve();
      });
    });
  }

  stop() {
    this.server.close();
  }
}

module.exports = {
  HomeFinderServer,
};

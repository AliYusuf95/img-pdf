// eslint-disable-next-line import/no-extraneous-dependencies,@typescript-eslint/no-var-requires
const { createProxyMiddleware } = require('http-proxy-middleware');

const ApiTarget = 'https://gh-trending-api.herokuapp.com';
module.exports = function proxyMiddleware(app) {
  app.use('/api', (req, res, next) =>
    createProxyMiddleware({
      target: ApiTarget,
      onProxyReq: (proxyReq) => {
        // Browsers may send Origin headers even with same-origin
        // requests. To prevent CORS issues, we have to change
        // the Origin to match the target URL.
        if (proxyReq.getHeader('origin')) {
          proxyReq.setHeader('origin', ApiTarget);
        }
        // remove router baseUrl (e.g. /api)
        // eslint-disable-next-line no-param-reassign
        proxyReq.path = proxyReq.path.substring(req.baseUrl.length);
      },
      secure: false,
      changeOrigin: true,
      // ws: true,
      // xfwd: true,
      logLevel: 'warn',
    })(req, res, next),
  );
};

/* craco.config.js */
const { getLoaders, loaderByName } = require('@craco/craco');
const path = require('path');


// const { inspect } = require('util');

// const DbuxEnabled = false;
const DbuxEnabled = true;

/**
 * NOTE: update this version to force a cache flush.
 */
const BabelCacheVersion = 3;

const dbuxOptions = {
  moduleFilter: {
    /**
     * 1. we want redux and friends.
     * 2. we want `immer` so we can actually properly observe the drafted objects it produces and its children.
     */
    packageWhitelist: '.*redux.*,immer',
    // packageWhitelist: '.*', // NOTE: quite slow

    /**
     * NOTEs:
     * 1. we blacklist some of these since they mostly muddy the search space.
     * 2. Some of these are polyfills (probably brought in by CRA) and their libraries (loaded when first requiring things, and before `@dbux/runtime`?)
     * 3. react-error-overlay brings in `async-generator-runtime`
     */
    packageBlacklist: 'react-dev-utils,react-refresh,react-error-overlay,process,buffer,isarray,ieee754,base64-js',
    fileWhitelist: '.*',
    // we generally do not want to mess with production or webpack code
    fileBlacklist: '.*production.*,.*[wW]ebpack.*'
  }
};

module.exports = {
  devServer: (devServerConfig, { env, paths, proxy, allowedHost }) => {
    // enable writeToDisk
    devServerConfig.writeToDisk = true;


    /**
     * Start watching changes on redux (and possibly other modules).
     * NOTE: CRA has `watchOptions` on `devServer`, not on root.
     * 
     * @see https://github.com/facebook/create-react-app/blob/eadfad28f448fffd581c36b8769b32b51474962b/packages/react-scripts/config/webpackDevServer.config.js#L78
     * @see https://stackoverflow.com/questions/41522721/how-to-watch-certain-node-modules-changes-with-webpack-dev-server
     */
    const ignored = devServerConfig.watchOptions?.ignored;
    if (ignored) {
      console.warn('ignored:\n  ', devServerConfig.watchOptions.ignored);
    }

    devServerConfig.watchOptions.ignored = [
      /node_modules(?:[\\/]+)(?!@reduxjs|redux)/,
      // /.*(?!@reduxjs|redux).*/
    ];

    return devServerConfig;
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // add aliases
      const resolve = webpackConfig.resolve ||= {};
      const alias = resolve.alias ||= {};

      // hackfix: use no-type version of RTK
      alias['@reduxjs/toolkit'] = path.resolve(`./node_modules/@reduxjs/toolkit/src-no-types/index.js`);

      if (DbuxEnabled) {
        const { hasFoundAny, matches } = getLoaders(webpackConfig, loaderByName("babel-loader"));
        // // TODO: write output files (this won't work, `devServer` does not exit)
        // webpackConfig.devServer.devMiddleware.writeToDisk = true;

        // // exclude dbux from all rules
        // const reported = new Set();
        // webpackConfig.module.rules.forEach(rule => {
        //   if (rule.exclude && !Array.isArray(rule.exclude)) {
        //     rule.exclude = [rule.exclude];
        //   }
        //   if (!rule.exclude) {
        //     rule.exclude = [];
        //   }
        //   rule.exclude.push((modulePath) => {
        //     const exclude = modulePath.includes('@dbux');
        //     if (!reported.has(modulePath)) {
        //       reported.add(modulePath);
        //       console.debug(`[WEBPACK]`, modulePath, !exclude);
        //     }
        //     return exclude;
        //   });
        // });

        // TODO: we might have to remove preset-env and add ts-only, and before Dbux?

        // add dbux to loader
        if (hasFoundAny) {
          matches.forEach(match => {
            const babelOptions = match.loader.options;

            babelOptions.cacheIdentifier += 'v' + BabelCacheVersion;

            // console.log(`[craco] babelOptions: ${inspect(babelOptions)}`);

            if (!babelOptions.plugins) {
              babelOptions.plugins = [];
            }
            babelOptions.plugins.push(['@babel/preset-typescript', {}]);
            babelOptions.plugins.push(['@dbux/babel-plugin', dbuxOptions]);
          });
          console.debug(`Added @dbux/babel-plugin to babel-loaders.`);
        }
        else {
          throw new Error(`Could not inject Dbux: 'babel-loader' found`);
        }

        // throw new Error('STOP');
      }

      return webpackConfig;
    }
  },
};

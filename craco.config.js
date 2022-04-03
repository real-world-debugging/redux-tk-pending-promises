/* craco.config.js */

const { getLoaders, loaderByName } = require('@craco/craco');

const { inspect } = require('util');

// const DbuxEnabled = false;
const DbuxEnabled = true;

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
     * 3. react-error-overlay brings in `async-generator-runtime`, and... reasons...?
     */
    packageBlacklist: 'react-dev-utils,react-refresh,react-error-overlay,process,buffer,isarray,ieee754,base64-js',
    fileWhitelist: '.*',
    // we generally do not want to mess with production or webpack code
    fileBlacklist: '.*production.*,.*[wW]ebpack.*'
  }
};

module.exports = {
  devServer: {
    writeToDisk: true
  },
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
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

            // console.log(`[craco] match ${inspect(
            //   match.loader.options.presets
            // )}`);

            if (!babelOptions.plugins) {
              babelOptions.plugins = [];
            }
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

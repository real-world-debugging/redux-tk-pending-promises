/* craco.config.js */

const { getLoaders, loaderByName } = require('@craco/craco');

const dbuxOptions = {
  moduleFilter: {
    packageWhitelist: '.*redux.*',
    // packageWhitelist: '.*', // NOTE: quite slow

    /**
     * NOTE: we blacklist some of these since they mostly muddy the search space.
     * 1. Some of these are polyfills (probably brought in by CRA) and their libraries (loaded when first requiring things, and before `@dbux/runtime`?)
     */
    packageBlacklist: 'react-dev-utils,react-refresh,react-error-overlay,process,buffer,isarray,ieee754,base64-js',
    fileWhitelist: '.*',
    // we generally do not want to mess with production or webpack code
    fileBlacklist: '.*production.*,.*[wW]ebpack.*'
  }
};

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
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
          if (!babelOptions.plugins) {
            babelOptions.plugins = [];
          }
          // // NOTE: weird bug with a class having public fields (in @dbux/runtime) that Babel complains about
          // babelOptions.plugins.push(['@babel/plugin-proposal-class-properties', { loose: true }]);
          babelOptions.plugins.push(['@dbux/babel-plugin', dbuxOptions]);
        });
        console.debug(`Added @dbux/babel-plugin to babel-loaders.`);
      }
      else {
        throw new Error(`Could not inject Dbux: 'babel-loader' found`);
      }

      return webpackConfig;
    }
  },
};

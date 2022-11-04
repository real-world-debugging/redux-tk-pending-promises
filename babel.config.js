// const loadBabel = require('./loadBabel');

console.log('babel.config HI')

module.exports = {
  /**
   * NOTE: Babel glob is very limited, must use regex or function for most scenarios
   * @see https://github.com/babel/babel/issues/12008
   */
  ignore: [
    /\..*test\..*/,
    /[\/\\]tests[\/\\]/
    // (fpath) => {
    //   // console.log(`[babel ignore] ${args}`);
    //   return false;
    // }
  ]
};
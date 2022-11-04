set -e # cancel on error
set -x # verbose echo mode

ROOT="$( pwd; )"

cd ./node_modules/@reduxjs/toolkit
npx babel --config-file="$ROOT/babel.config.js" --out-dir src-no-types --plugins=@babel/plugin-transform-typescript --source-maps inline --retain-lines -x ".js,.jsx,.es6,.es,.mjs,.cjs,.ts" --no-copy-ignored src
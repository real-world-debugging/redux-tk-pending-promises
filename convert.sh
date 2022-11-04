set -e # cancel on error
set -x # verbose echo mode

ROOT="$( pwd; )"

cd ./node_modules/@reduxjs/toolkit
npx babel --config-file="$ROOT/no-types.babel.config.js" --source-maps inline --retain-lines --extensions=".js,.jsx,.es6,.es,.mjs,.cjs,.ts,.tsx" --no-copy-ignored --out-dir src-no-types src
## Repro

This is what we did to reproduce this bug:

* Download from https://codesandbox.io/s/flamboyant-benz-jhm3wj?file=/package.json
* remove `types.ts`
  * remove types from `store.ts`
* add `.env`:
  ```ini
  TSC_COMPILE_ON_ERROR=true
  ```
* fix up `package.json`
  * remove `parcel`
  * change `react-scripts` to `^4` (because as of now, `craco` does not support 5)
* ```bash
  npx msw init public # setup msw
  npm install
  npm i -D @craco/craco
  yalc add --dev @dbux/babel-plugin @dbux/runtime @dbux/cli @dbux/common @dbux/common-node @dbux/babel-register-fork
  ```
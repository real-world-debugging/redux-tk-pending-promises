## Getting Started

1. Make sure, you have `Dbux` repository on this machine, and pushed to `yalc`.
   * (→ run `yarn yalc` in the Dbux folder)
2. Make sure, you have `redux-toolkit@1.8.0` on this machine, and pushed to `yalc`.
   * (→ https://github.com/reduxjs/redux-toolkit/blob/master/CONTRIBUTING.md#getting-started)
   * ```bash
     git clone https://github.com/reduxjs/redux-toolkit.git &&\
     cd ./redux-toolkit &&\
     git checkout tags/v1.8.0 &&\
     yarn
   ```
3. ```bash
   npm install
   npm start
   ```
4. Other things
   * → need to manually define `SkipToken = undefined` (it is an exported type that got removed, but should not have)

## What is the bug?

* In the interface, press the `Foobar` button.
* Observe console.
* → The two results are pending, but should not be.


## Origin

NOTE: This is based on a report from the `#redux` Discord channel.

What we did to create this test case:


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
* Fix some build settings (because old `react-scripts` does supports less modern syntax)
* ```bash
  npx msw init public # setup msw
  npm install
  npm i -D @craco/craco yalc
  npm i -D @dbux/babel-plugin @dbux/runtime @dbux/cli @dbux/common @dbux/common-node @dbux/babel-register-fork
  ```
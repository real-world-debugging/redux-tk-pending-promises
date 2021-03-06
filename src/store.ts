import { configureStore } from "@reduxjs/toolkit";
import * as _ from "lodash";
import { apiSlice } from "./api/apiSlice";

export const reducer = {
  [apiSlice.reducerPath]: apiSlice.reducer
};

const preloadedState = {};

export const createStore = () =>
  configureStore({
    reducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware)
  });

// export type StoreType = ReturnType<typeof createStore>;
// export type RootState = ReturnType<StoreType["getState"]>;
// export type AppDispatch = StoreType["dispatch"];

export const getStoreInstance = ()/* : StoreType */ => {
  if (global.ttcStore !== undefined) {
    return global.ttcStore;
  }
  const store = createStore();
  global.ttcStore = store;

  return global.ttcStore;
};

export const observeStore = <T = any>(
  select: (state/* : RootState */) => T,
  onChange: (currentState: T, newState: T) => void
) => {
  let currentState: T;
  const store = getStoreInstance();

  function handleChange() {
    const nextState = select(store.getState());
    if (!_.isEqual(nextState, currentState)) {
      onChange(currentState, nextState);
      currentState = nextState;
    }
  }

  const unsubscribe = store.subscribe(handleChange);
  handleChange();
  return unsubscribe;
};

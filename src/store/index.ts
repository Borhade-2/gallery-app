import { createStore, applyMiddleware } from "redux";
import rootReducer from "./reducers";
import { thunk } from "redux-thunk";

const store = createStore(rootReducer, applyMiddleware(thunk));

export default store;

// Types for hooks (if using TS)
export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

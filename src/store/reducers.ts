// src/redux/reducers.ts
import { combineReducers } from "redux";
import * as types from "./types";

// 🔹 Data reducer (your existing one)
const initialDataState = {
  networkStatus: true,
};

const dataReducer = (state = initialDataState, action: any) => {
  switch (action.type) {
    case types.NETWORKSTATUS:
      return { ...state, networkStatus: action.payload };
    default:
      return state;
  }
};

// 🔹 Theme reducer
const initialThemeState = {
  isDark: false,
};

const themeReducer = (state = initialThemeState, action: any) => {
  switch (action.type) {
    case types.TOGGLE_THEME:
      return { ...state, isDark: !state.isDark };
    case types.SET_THEME:
      return { ...state, isDark: action.payload };
    default:
      return state;
  }
};

// 🔹 Root reducer
const rootReducer = combineReducers({
  data: dataReducer,
  theme: themeReducer,
});

export default rootReducer;

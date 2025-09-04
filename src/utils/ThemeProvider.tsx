import React, { createContext, useContext, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { lightTheme, darkTheme } from "../styles/color";
import NetInfo from "@react-native-community/netinfo";
import { NETWORKSTATUS } from "../store/types";


const ThemeContext = createContext<any>(null);

export const ThemeProvider = ({ children }: any) => {
  const dispatch = useDispatch();
  const isDark = useSelector((state: RootState) => state.theme.isDark);
  const networkStatus = useSelector((state: RootState) => state.data.networkStatus);
  const theme = isDark ? darkTheme : lightTheme;

  // Track network changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      dispatch({ type: NETWORKSTATUS, payload: state.isConnected });
    });
    return () => unsubscribe();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, isConnected: networkStatus }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

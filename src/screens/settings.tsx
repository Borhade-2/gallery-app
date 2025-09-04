import React from "react";
import { SafeAreaView, Text, TouchableOpacity } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "../store/actions";
import { RootState } from "../store";
import { useTheme } from "../utils/ThemeProvider";

const SettingsScreen = () => {
  const dispatch = useDispatch();
   const { theme, isConnected } = useTheme();

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.background
      }}
    >
      <TouchableOpacity
        onPress={() => dispatch(toggleTheme())}
        style={{
          padding: 12,
          borderRadius: 8,
          backgroundColor: theme.text
        }}
      >
        <Text style={{ color: theme.background, fontSize: 16 }}>
          Switch to  Mode
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default SettingsScreen;

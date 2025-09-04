import React from "react";
import { Modal, StatusBar, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import { useTheme } from "../utils/ThemeProvider";

const Viewer = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { images = [], startIndex = 0, id } = route.params || {};

  // if opened via deep link, use id to find the image
  const currentIndex =
    id && images.length > 0
      ? images.findIndex((img: any) => img.id.toString() === id.toString())
      : startIndex;

  const safeIndex = currentIndex >= 0 ? currentIndex : 0;

  return (
    <Modal visible={true} transparent={true}>
      <StatusBar
        hidden
        backgroundColor={theme.background}
        barStyle={theme.text === "#000" ? "light-content" : "dark-content"}
      />
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <TouchableOpacity style={{paddingTop:20, paddingLeft:20}} onPress={()=>navigation.goBack()}>
        <Text> Back</Text>
      </TouchableOpacity>
        <ImageViewer
          imageUrls={images.map((img: any) => ({
            url: img.high_url || img.img_url,
          }))}
          index={safeIndex}
          enableSwipeDown={true}
          onSwipeDown={() => navigation.goBack()}
          saveToLocalByLongPress={false}
          backgroundColor={theme.background}
          renderIndicator={(currentIndex,allSize) =>(
            <Text style={{
            position: "absolute",
            top: 40,
            alignSelf: "center",
            color: theme.text,
            fontWeight: "600",
            fontSize: 16,
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            }}>
 {currentIndex} / {allSize}
            </Text>
          )}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 40,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 999,
  },
  counter: {
    fontSize: 16,
    fontWeight: "600",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
});

export default Viewer;

import React, { useEffect, useState } from "react";
import { View, FlatList, Image, Text, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../utils/ThemeProvider";

const FAVORITES_KEY = "favorites";

const Favorites = ({ navigation }: any) => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const { theme, isConnected } = useTheme();
  useEffect(() => {
    const loadFavorites = async () => {
      const favs = JSON.parse((await AsyncStorage.getItem(FAVORITES_KEY)) || "[]");
      setFavorites(favs);    
    };
    const unsubscribe = navigation.addListener("focus", loadFavorites); // reload when screen comes into focus
    loadFavorites();
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1, padding: 10 }}>
      {favorites.length === 0 ? (
        <Text style={{ textAlign: "center", marginTop: 20 }}>No favorites yet</Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item, index) => item.id?.toString() || index.toString()}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Viewer", {
                  images: favorites, // pass favorites list
                  startIndex: index, // open correct image
                })
              }
              style={{ marginBottom: 12 }}
            >
              <Image
                source={{ uri: item.img_url }}
                style={{
                  width: "100%",
                  height: 200,
                  borderRadius: 10,
                  backgroundColor: "#ccc",
                }}
                resizeMode='cover'
              />
              <Text
                numberOfLines={1}
                style={{ fontWeight: "600", fontSize: 14, marginTop: 4 ,color:theme.text}}
              >
                {item.name || "Unnamed"}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

export default Favorites;

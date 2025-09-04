import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Text,
  SafeAreaView,
  TextInput,
  Alert,
  Share,
  StyleSheet,
} from 'react-native';
import { fetchImages } from '../networking/ApiConnections';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTheme } from '../utils/ThemeProvider';

interface ImageItem {
  id: string;
  img_url: string;
  name: string;
}

const FAVORITES_KEY = 'favorites';
const LAST_PAGE_KEY = 'last_page';
const SCROLL_OFFSET_KEY = 'scroll_offset';
const CACHE_KEY = 'cached_images';

const PAGE_SIZE = 20;

const Gallery = ({ navigation }: { navigation: any }) => {
  const { theme, isConnected } = useTheme();
  const [images, setImages] = useState<ImageItem[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [orderAsc, setOrderAsc] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasMore, setHasMore] = useState(true);

  const flatListRef = useRef<FlatList>(null);

  // Load persisted state
  useEffect(() => {
    (async () => {
      const favs = JSON.parse((await AsyncStorage.getItem(FAVORITES_KEY)) || '[]');
      const cached = JSON.parse((await AsyncStorage.getItem(CACHE_KEY)) || '[]');
      const lastPage = Number(await AsyncStorage.getItem(LAST_PAGE_KEY)) || 0;
      const savedOffset = Number(await AsyncStorage.getItem(SCROLL_OFFSET_KEY)) || 0;

      setFavorites(favs);
      setImages(cached);
      setPage(lastPage);
      if (flatListRef.current && savedOffset) {
        flatListRef.current.scrollToOffset({ offset: savedOffset, animated: false });
      }
    })();
  }, []);

  // Persist state changes
  useEffect(() => { AsyncStorage.setItem(LAST_PAGE_KEY, page.toString()); }, [page]);
  useEffect(() => { AsyncStorage.setItem(SCROLL_OFFSET_KEY, scrollOffset.toString()); }, [scrollOffset]);
  useEffect(() => { AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites)); }, [favorites]);
  useEffect(() => { AsyncStorage.setItem(CACHE_KEY, JSON.stringify(images)); }, [images]);

  // Load images with pagination
  const loadImages = async (reset = false, searchQuery = '') => {
  if (loading || !isConnected) return;
  setLoading(true);
  setError(null);

  try {
    const nextPage = reset ? 0 : page;
    const result = await fetchImages({
      page: nextPage,
      pageSize: 20,
      orderBy: 2,
      orderAsc,
      search: searchQuery, // <-- pass the search query
    });

    const newImages = result?.data?.image_list || [];
    setImages(prev => (reset ? newImages : [...prev, ...newImages]));
    if (newImages.length > 0) setPage(prev => (reset ? 1 : prev + 1));
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};


  // Trigger initial load
  useEffect(() => {
    loadImages(true, searchQuery);
  }, [orderAsc, isConnected, searchQuery]);

  // Toggle favorite
  const toggleFavorite = (item: ImageItem) => {
    if (!item.id) return;
    setFavorites((prev) => {
      const updated = prev.includes(item.id) ? prev.filter(f => f !== item.id) : [...prev, item.id];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)).catch(err =>
        console.log('Error saving favorites:', err)
      );
      return updated;
    });
  };

  // Apply watermark
  const applyWatermark = async (uri: string) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ overlay: require('../assets/images/watermark.png') as any }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch {
      return uri;
    }
  };

  // Share image
  const shareImage = async (imgUrl: string) => {
    try {
      const watermarked = await applyWatermark(imgUrl);
      await Share.share({ message: `Check out this image: ${watermarked}`, url: watermarked });
    } catch {
      Alert.alert('Error', 'Unable to share image.');
    }
  };

  // Save image
  const saveImage = async (item: ImageItem) => {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow access to save images.');
      return;
    }
    try {
      const filename = item.name || `image_${item.id}.jpg`;
      const fileUri = FileSystem.documentDirectory + filename;
      const downloaded = await FileSystem.downloadAsync(item.img_url, fileUri);
      const watermarked = await applyWatermark(downloaded.uri);
      await MediaLibrary.saveToLibraryAsync(watermarked);
      Alert.alert('Saved', 'Image saved with watermark!');
    } catch {
      Alert.alert('Error', 'Failed to save image.');
    }
  };
const filteredImages = React.useMemo(() => {
  if (!searchQuery) return images;
  return images.filter((img) =>
    img.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [images, searchQuery]);
  // Memoized render item
  const renderItem = useCallback(({ item }: { item: ImageItem }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => navigation.navigate('Viewer', { images, startIndex: images.indexOf(item) })}
    >
      <Image
        source={{ uri: item.img_url }}
        style={[styles.image, { backgroundColor: theme.backgroundColor }]}
        cachePolicy="disk"
      />
      <TouchableOpacity onPress={() => toggleFavorite(item)} style={styles.favButton}>
        <Text style={styles.favText}>{favorites.includes(item.id) ? '❤️' : '🤍'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => shareImage(item.img_url)} style={styles.shareButton}>
        <Text style={styles.actionText}>📤</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => saveImage(item)} style={styles.saveButton}>
        <Text style={styles.actionText}>💾</Text>
      </TouchableOpacity>
      <Text numberOfLines={1} style={[styles.filename, { color: theme.text }]}>{item.name}</Text>
    </TouchableOpacity>
  ), [images, favorites, theme]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <View style={styles.searchBar}>
        <TextInput
          placeholder="Search by filename..."
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            loadImages(true, text); // reset and search
          }}
          placeholderTextColor={theme.text}
          style={[styles.input, { color: theme.text, backgroundColor: theme.background, borderColor: theme.border }]}
        />
        <TouchableOpacity onPress={() => setOrderAsc(!orderAsc)} style={[styles.sortButton, { backgroundColor: theme.primary }]}>
          <Text style={[styles.sortText, { color: theme.textColor }]}>Sort: {orderAsc ? 'Asc' : 'Desc'}</Text>
        </TouchableOpacity>
      </View>

      {!isConnected && <View style={[styles.offlineBanner, { backgroundColor: theme.warningColor }]}>
        <Text style={[styles.offlineText, { color: theme.textColor }]}>Offline Mode: Showing cached images</Text>
      </View>}

      {error && images.length === 0 ? (
        <View style={styles.errorContainer}>
          <Text style={{ color: theme.textColor }}>{error}</Text>
          <TouchableOpacity onPress={() => loadImages(true, searchQuery)}><Text style={[styles.retryText, { color: theme.primaryColor }]}>Retry</Text></TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredImages}
          ref={flatListRef}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          numColumns={2}
          renderItem={renderItem}
          onEndReached={() => loadImages()}
          onEndReachedThreshold={0.5}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadImages(true)}
              tintColor={theme.primaryColor}
            />
          }
          getItemLayout={(data, index) => ({ length: 180, offset: 180 * index, index })}
          ListFooterComponent={loading ? <ActivityIndicator style={styles.loader} color={theme.primary} /> : null}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  searchBar: { 
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 10
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    width: '70%'
  },
  sortButton: { 
    padding: 8,
    borderRadius: 8,
    width: '24%',
    justifyContent: 'center'
  },
  sortText: { 
    textAlign: 'center'
  },
  offlineBanner: {
    padding: 6
  },
  offlineText: { 
    textAlign: 'center'
  },
  errorContainer: { 
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  retryText: {
    marginTop: 10
  },
  itemContainer: { 
    flex: 1,
    margin: 5 
  },
  image: { 
    width: '100%',
    height: 180,
    borderRadius: 10
  },
  favButton: { 
    position: 'absolute',
    bottom: 25,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 15
  },
  favText: { 
    color: 'white'
  },
  shareButton: { 
    position: 'absolute',
    top: 10,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 15
  },
  saveButton: { 
    position: 'absolute',
    top: 10,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 15
  },
  actionText: { 
    color: 'white'
  },
  filename: { 
    fontWeight: '600',
    fontSize: 12,
    marginTop: 4
  },
  loader: { 
    margin: 20
  },
  emptyText: { 
    textAlign: 'center',
    marginTop: 20
  },
});
export default Gallery;
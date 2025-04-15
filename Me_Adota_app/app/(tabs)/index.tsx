import React, { useState } from 'react';
import { Image } from 'react-native';
import {
  StyleSheet,
  Pressable,
  FlatList,
  ActivityIndicator,
  Alert,
  Text,
  View,
  TextInput,
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Ionicons } from '@expo/vector-icons';

// Gera dados simulados
const generateMockData = (startId: number, count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: (startId + i).toString(),
    name: `Item ${startId + i}`,
  }));
};

export default function HomeScreen() {
  const [data, setData] = useState(generateMockData(1, 10));
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Image
        source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardDescription} numberOfLines={3}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac erat at dui tempus 
          condimentum. Suspendisse potenti.
        </Text>
      </View>
    </View>
  );

  const fetchMoreData = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const nextId = data.length + 1;
        const moreItems = generateMockData(nextId, 10);
        resolve(moreItems);
      }, 1000);
    });
  };

  const loadMoreItems = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const newData = await fetchMoreData();
      setData((prevData) => [...prevData, ...newData]);
    } catch (error) {
      Alert.alert('Oops', 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ThemedView style={styles.headerContainer}>
        <Pressable onPress={() => console.log('Voltar')} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Explorar</ThemedText>
        <View style={{ width: 24 }} /> {/* espaço igual ao botão, para centralizar título */}
      </ThemedView>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#888" style={{ marginRight: 8 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar item..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>


      <FlatList
        contentContainerStyle={styles.listContainer}
        data={data.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase())
        )}        
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.3}
        ListFooterComponent={isLoading ? <ActivityIndicator style={{ margin: 16 }} /> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'purple',
    padding: 12,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    alignItems: 'center',
  },
  
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  
  cardContent: {
    flex: 1,
  },
  
  cardTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  
  cardDescription: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  
  searchInput: {
    flex: 1,
    fontSize: 16,
  }
  
});
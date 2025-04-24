import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TelaDetalhesPet() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerImageContainer}>
        <Image source={{ uri: 'logo.png' }} style={styles.image} />
        <View style={styles.topIcons}>
          <TouchableOpacity style={styles.iconBtn}>
            <Feather name="share-2" size={20} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="heart" size={20} color="red" />
          </TouchableOpacity>
        </View>
        <View style={styles.petInfoOverlay}>
          <View>
            <Text style={styles.petName}>Bidu</Text>
            <Text style={styles.petSubtitle}>Filhote, SRD</Text>
          </View>
          <Ionicons name="male" size={24} color="white" />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <Text style={styles.activeTab}>Resumo</Text>
        <Text style={styles.tab}>Sobre Mim</Text>
        <Text style={styles.tab}>Saúde</Text>
        <Text style={styles.tab}>Histórico</Text>
      </View>

      <View style={styles.summaryBox}>
        <View style={styles.summaryItem}>
          <FontAwesome5 name="birthday-cake" size={16} />
          <Text style={styles.summaryText}>3 meses</Text>
        </View>
        <View style={styles.summaryItem}>
          <MaterialCommunityIcons name="paw" size={16} />
          <Text style={styles.summaryText}>Sem raça definida</Text>
        </View>
        <View style={styles.summaryItem}>
          <Feather name="maximize" size={16} />
          <Text style={styles.summaryText}>Pequeno</Text>
        </View>
        <View style={styles.summaryItem}>
          <Ionicons name="male" size={16} />
          <Text style={styles.summaryText}>Macho</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.adotarBtn}>
        <Text style={styles.adotarText}>Adotar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contatarBtn}>
        <Text style={styles.contatarText}>Contatar Protetor</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    backgroundColor: '#fff'
  },
  headerImageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 300,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  topIcons: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 16,
  },
  iconBtn: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 20,
  },
  petInfoOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  petSubtitle: {
    fontSize: 16,
    color: 'white',
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  activeTab: {
    fontWeight: 'bold',
    color: 'black',
  },
  tab: {
    color: '#888',
  },
  summaryBox: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 15,
  },
  adotarBtn: {
    marginHorizontal: 16,
    backgroundColor: '#A2DADC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  adotarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  contatarBtn: {
    marginHorizontal: 16,
    backgroundColor: '#D3D3D3',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  contatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
});
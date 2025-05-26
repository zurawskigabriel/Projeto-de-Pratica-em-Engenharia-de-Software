// Em TelaDetalhesPet.tsx

import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform // Adicionado para SafeAreaView ou ajustes de padding
} from 'react-native';
import { Ionicons, Feather, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router'; // Para botão voltar e receber parâmetros

export default function TelaDetalhesPet() {
  const router = useRouter();
  const params = useLocalSearchParams(); // Para receber parâmetros, ex: petName

  // Use o nome do pet dos parâmetros se disponível, senão fallback para "Bidu"
  const petNameFromParams = typeof params.petName === 'string' ? params.petName : "Bidu";


  return (
    // Adicionado um View principal e botão de voltar
    // Considere SafeAreaView se necessário
    <View style={{flex: 1, backgroundColor: '#fff'}}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Botão Voltar */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonDetalhes}>
          <Ionicons name="arrow-back" size={28} color="black" />
        </TouchableOpacity>

        <View style={styles.headerImageContainer}>
          {/* Corrigido o carregamento da imagem. Assumindo que 'logo.png' está em '../../assets/'
              como em PetCard. Ajuste o caminho se necessário. */}
          <Image source={require('../../assets/logo.png')} style={styles.image} />
          <View style={styles.topIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Feather name="share-2" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="heart" size={20} color="red" /> {/* Corrigido: heart outline para heart (já estava)*/}
            </TouchableOpacity>
          </View>
          <View style={styles.petInfoOverlay}>
            <View>
              <Text style={styles.petName}>{petNameFromParams}</Text> {/* Usando nome dos parâmetros */}
              <Text style={styles.petSubtitle}>Filhote, SRD</Text>
            </View>
            <Ionicons name="male-outline" size={24} color="white" /> {/* Corrigido: male para male-outline ou male-female-outline */}
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
            <Ionicons name="male-outline" size={16} />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { // Este é o contentContainerStyle do ScrollView
    paddingBottom: 40,
    backgroundColor: '#fff'
  },
  backButtonDetalhes: { // Estilo para o botão voltar
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50, // Ajuste para status bar
    left: 20,
    zIndex: 10, // Para garantir que fique sobre a imagem
    backgroundColor: 'rgba(255,255,255,0.7)', // Fundo semi-transparente
    padding: 8,
    borderRadius: 20,
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
  // ... (restante dos seus estilos de TelaDetalhesPet)
  topIcons: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 20 : 50, // Ajustado
    right: 20,
    flexDirection: 'row',
    gap: 16,
    zIndex: 10,
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
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  petSubtitle: {
    fontSize: 16,
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16, // Aumentado
    borderBottomWidth: 1,
    borderColor: '#eee', // Mais suave
    backgroundColor: '#f9f9f9', // Leve fundo
  },
  activeTab: {
    fontWeight: 'bold',
    color: '#A2DADC', // Cor de destaque
  },
  tab: {
    color: '#555', // Cor mais escura para melhor leitura
  },
  summaryBox: {
    backgroundColor: '#fdfdfd', // Quase branco
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2, // Sombra sutil
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // Sombra bem leve
    shadowRadius: 2,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12, // Aumentado
    marginBottom: 14, // Aumentado
  },
  summaryText: {
    fontSize: 15,
    color: '#333', // Cor mais escura
  },
  adotarBtn: {
    marginHorizontal: 16,
    backgroundColor: '#A2DADC',
    paddingVertical: 16, // Aumentado
    borderRadius: 25, // Mais arredondado
    alignItems: 'center',
    marginTop: 16, // Aumentado
    elevation: 2,
  },
  adotarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  contatarBtn: {
    marginHorizontal: 16,
    backgroundColor: '#f0f0f0', // Fundo mais claro
    borderColor: '#ccc', // Borda sutil
    borderWidth: 1,
    paddingVertical: 16, // Aumentado
    borderRadius: 25, // Mais arredondado
    alignItems: 'center',
    marginTop: 10,
  },
  contatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555', // Cor do texto
  },
});
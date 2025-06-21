import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import Footer from '../components/Footer';
import { listarPets, buscarStatusPet, buscarSolicitacoesUsuario } from '../api/api';

const { width, height } = Dimensions.get('window');

export default function MeusPetsScreen() {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [adotandoPets, setAdotandoPets] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPets = async () => {
      try {
        const uid = Number(await AsyncStorage.getItem('userId'));
        if (!uid) return console.warn('Usuário não identificado.');

        const all = await listarPets();
        const meus = all.filter(p => p.idUsuario === uid);
        const petsComStatus = await Promise.all(meus.map(async pet => ({
          ...pet,
          situacao: await buscarStatusPet(pet.id).catch(() => undefined)
        })));
        setPets(petsComStatus);

        const solicit = await buscarSolicitacoesUsuario(uid);
        setAdotandoPets(solicit.map(s => ({ ...s.pet, situacao: s.situacao })));
      } catch (e) {
        console.error(e);
      } finally {
        setCarregando(false);
      }
    };
    carregarPets();
  }, []);

  const getPetImage = especie => {
    if (especie.toLowerCase() === 'gato') return require('../../assets/cat.jpg');
    if (especie.toLowerCase() === 'cachorro') return require('../../assets/dog.jpg');
    return require('../../assets/cat.jpg');
  };

  const formatarIdade = (an, ms) => {
    if (an && ms) return `${an} ano${an>1?'s':''} e ${ms} mês${ms>1?'es':''}`;
    if (an) return `${an} ano${an>1?'s':''}`;
    if (ms) return `${ms} mês${ms>1?'es':''}`;
    return '0 meses';
  };

  const exibirSituacao = s => (s?.trim() ? s : 'Disponível');

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome name="paw" size={64} color="#B6E1FA" />
      <Text style={styles.emptyTitle}>Nada por aqui...</Text>
      <Text style={styles.emptySubtitle}>
        Você ainda não cadastrou nenhum pet.
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('CadastrarPet')}>
        <Text style={styles.emptyBtnText}>Adicionar primeiro pet</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pets</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CadastrarPet')}>
          <Icon name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {carregando ? (
          <ActivityIndicator size="large" color="#2AA5FF" style={{ marginTop: 40 }} />
        ) : adotandoPets.length === 0 && pets.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {adotandoPets.length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Adotando</Text>
                {adotandoPets.map(pet =>
                  <PetCard key={pet.id} pet={pet} adotando />
                )}
              </>
            )}
            {pets.length > 0 && <Text style={styles.sectionTitle}>Seus Pets</Text>}
            {pets.map(pet =>
              <PetCard key={pet.id} pet={pet} />
            )}
          </>
        )}
      </ScrollView>

      <Footer />
    </View>
  );
}

function PetCard({ pet, adotando }) {
  return (
    <TouchableOpacity style={[styles.card, adotando && styles.cardAdotando]}>
      <Image source={getPetImage(pet.especie)} style={styles.petImage} />
      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={styles.petName}>{pet.nome}</Text>
          <FontAwesome
            name={pet.sexo?.toLowerCase() === 'm' ? 'mars' : 'venus'}
            size={18}
            style={styles.petSexIcon}
          />
        </View>
        <Text style={styles.petDetails}>
          {pet.raca}, {formatarIdade(pet.idadeAno, pet.idadeMes)}
        </Text>
        <Text style={styles.petStatus}>Situação: {exibirSituacao(pet.situacao)}</Text>
      </View>
    </TouchableOpacity>
  );
}

// Styles
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F6F9' },
  header: {
    height: 60, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 16, backgroundColor: '#FFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  addButton: {
    position: 'absolute', right: 16,
    backgroundColor: '#2AA5FF', width: 44, height: 44,
    borderRadius: 22, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2AA5FF', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3, shadowRadius: 4, elevation: 3,
  },
  listContainer: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },

  sectionTitle: {
    fontSize: 20, marginTop: 16, marginBottom: 8,
    fontWeight: '600', color: '#555',
  },

  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 12,
    padding: 12, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  cardAdotando: { backgroundColor: '#E0F7FA' },

  petImage: {
    width: 68, height: 68, borderRadius: 34,
    marginRight: 12, backgroundColor: '#DDD',
  },
  info: { flex: 1, justifyContent: 'center' },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  petName: { fontSize: 18, fontWeight: '600', color: '#222' },
  petSexIcon: { marginLeft: 6, color: '#888' },
  petDetails: { fontSize: 14, color: '#666', marginTop: 2 },
  petStatus: { fontSize: 13, color: '#007AFF', marginTop: 2 },

  emptyState: {
    alignItems: 'center',
    marginTop: height * 0.2,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: width * 0.06,
    fontWeight: '600',
    marginTop: 20,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
  },
  emptyBtn: {
    marginTop: 24,
    backgroundColor: '#2AA5FF',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    shadowColor: '#2AA5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  emptyBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

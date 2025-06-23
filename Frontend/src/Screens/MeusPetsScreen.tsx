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
import { listarPets } from '../api/api'; // buscarStatusPet e buscarSolicitacoesUsuario removidas
import { useRouter } from 'expo-router'; // Adicionado na última modificação, mas garantindo

const { width, height } = Dimensions.get('window');

export default function MeusPetsScreen() {
  const navigation = useNavigation(); // Será substituído por useRouter de expo-router
  const router = useRouter(); // Usar useRouter para navegação
  const [pets, setPets] = useState([]);
  // const [adotandoPets, setAdotandoPets] = useState([]); // Removido
  const [carregando, setCarregando] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const loadUserIdAndPets = async () => {
      setCarregando(true);
      try {
        const idSalvo = await AsyncStorage.getItem('userId');
        if (!idSalvo) {
          Alert.alert("Erro", "Usuário não autenticado.");
          // router.replace('/Login'); // Idealmente redirecionar
          setCarregando(false);
          return;
        }
        const currentUserId = parseInt(idSalvo, 10);
        setUserId(currentUserId);

        const todosOsPets = await listarPets();
        const meusPetsFiltrados = todosOsPets.filter(p => p.idUsuario === currentUserId);

        // Remover a lógica de buscarStatusPet, pois não existe e o status de adoção não é o foco aqui.
        // A tela de solicitações do protetor lidará com status de adoção.
        setPets(meusPetsFiltrados);

      } catch (e) {
        console.error("Erro ao carregar pets:", e);
        Alert.alert("Erro", "Não foi possível carregar seus pets. Tente novamente.");
      } finally {
        setCarregando(false);
      }
    };
    loadUserIdAndPets();
  }, []);

  const getPetImage = (especie: string) => {
    if (especie.toLowerCase() === 'gato') return require('../../assets/cat.jpg');
    if (especie.toLowerCase() === 'cachorro') return require('../../assets/dog.jpg');
    return require('../../assets/cat.jpg');
  };

  const formatarIdade = (anos: number = 0, meses: number = 0): string => {
    if (anos > 1 && meses === 0) return `${anos} anos`;
    if (anos === 1 && meses === 0) return `1 ano`;
    if (anos > 0 && meses > 0) {
      const anoTexto = `${anos} ano${anos > 1 ? 's' : ''}`;
      const mesTexto = `${meses} mês${meses > 1 ? 'es' : ''}`;
      return `${anoTexto} e ${mesTexto}`;
    }
    if (anos === 0 && meses > 0) return `${meses} mês${meses > 1 ? 'es' : ''}`;
    return `${anos} anos ${meses} meses`; // Default or fallback
  };

  // const exibirSituacao = s => (s?.trim() ? s : 'Disponível'); // Removido, não aplicável aqui

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome name="paw" size={width * 0.15} color="#B6E1FA" />
      <Text style={styles.emptyTitle}>Nada por aqui...</Text>
      <Text style={styles.emptySubtitle}>
        Você ainda não cadastrou nenhum pet para adoção.
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => router.push('/CadastrarPet')} // Usar router e verificar se a rota /CadastrarPet existe em app/
      >
        <Text style={styles.emptyBtnText}>Adicionar Primeiro Pet</Text>
      </TouchableOpacity>
    </View>
  );

  // Adicionar estado para o menu de opções
  const [menuVisible, setMenuVisible] = useState<number | null>(null); // Armazena o ID do pet com menu ativo

  const PetCard = ({ pet }) => {
    // A função PetCard agora é um componente interno ou pode ser movida para fora se preferir
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push({ pathname: `/PerfilPet`, params: { id: pet.id } })}
        >
          <Image source={getPetImage(pet.especie)} style={styles.petImage} />
          <View style={styles.info}>
            <Text style={styles.petName}>{pet.nome}</Text>
            <Text style={styles.petDetails}>
              {pet.raca}, {formatarIdade(pet.idadeAno, pet.idadeMes)}
            </Text>
             <FontAwesome
                name={pet.sexo?.toLowerCase() === 'm' ? 'mars' : 'venus'}
                size={18}
                style={[styles.petSexIcon, {color: pet.sexo?.toLowerCase() === 'm' ? '#60A5FA' : '#F472B6' }]}
             />
            {/* <Text style={styles.petStatus}>Situação: {exibirSituacao(pet.situacao)}</Text> // Removido */}
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMenuVisible(menuVisible === pet.id ? null : pet.id)} style={styles.menuButton}>
          <Icon name="more-vert" size={24} color="#555" />
        </TouchableOpacity>

        {menuVisible === pet.id && (
          <View style={styles.menuOptions}>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setMenuVisible(null);
              router.push({ pathname: `/PerfilPet`, params: { id: pet.id } });
            }}>
              <Text style={styles.menuItemText}>Ver Detalhes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setMenuVisible(null);
              router.push({ pathname: `/EditarPet`, params: { id: pet.id } }); // Verificar se a rota /EditarPet existe em app/
            }}>
              <Text style={styles.menuItemText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem} onPress={() => {
              setMenuVisible(null);
              router.push({ pathname: `/DetalhesSolicitacaoProtetor`, params: { petId: pet.id, nomePet: pet.nome } });
            }}>
              <Text style={styles.menuItemText}>Ver Solicitações</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };


  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Pets Cadastrados</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/CadastrarPet')} // Usar router
        >
          <Icon name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        onScrollBeginDrag={() => { if(menuVisible) setMenuVisible(null);}} // Fecha o menu ao rolar
        scrollEventThrottle={16}
      >
        {carregando ? (
          <ActivityIndicator size="large" color="#2AA5FF" style={{ marginTop: height * 0.1 }} />
        ) : pets.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Removida a seção "Adotando" */}
            {/* {pets.length > 0 && <Text style={styles.sectionTitle}>Meus Pets para Adoção</Text>} */}
            {pets.map(pet => (
              <PetCard key={pet.id.toString()} pet={pet} />
            ))}
          </>
        )}
      </ScrollView>

      <Footer />
    </View>
  );
}


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
  // Estilos para o PetCard e Menu de Opções
  cardContent: { // Novo container para o conteúdo clicável do card, excluindo o botão de menu
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Para ocupar o espaço disponível
  },
  menuButton: {
    padding: 8, // Área de clique maior para o ícone
    marginLeft: 'auto', // Empurra o botão para a direita
  },
  menuOptions: {
    position: 'absolute',
    right: width * 0.03, // Posiciona perto do ícone de menu
    top: height * 0.05, // Ajustar conforme necessário
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 10, // Para garantir que apareça sobre outros elementos
  },
  menuItem: {
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
  },
});

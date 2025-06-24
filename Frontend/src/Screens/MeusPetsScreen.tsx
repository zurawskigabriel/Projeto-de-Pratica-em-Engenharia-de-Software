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
import { listarPets } from '../api/api';
import { useRouter } from 'expo-router';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

const { width, height } = Dimensions.get('window'); // Manter por enquanto, pode ser substituído por SIZES.wp/hp

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
            <View style={styles.nameContainer}>
              <Text style={styles.petName} numberOfLines={1} ellipsizeMode="tail">{pet.nome}</Text>
              {pet.sexo && ( // Renderiza o ícone apenas se o sexo estiver definido
                <FontAwesome
                  name={pet.sexo.toLowerCase() === 'm' ? 'mars' : 'venus'}
                  size={FONTS.sizeMedium} // Ajustar tamanho conforme FONTS
                  style={[
                    styles.petSexIcon,
                    { color: pet.sexo.toLowerCase() === 'm' ? COLORS.info : COLORS.danger } // Usar cores do tema
                  ]}
                />
              )}
            </View>
            <Text style={styles.petDetails}>
              {pet.raca}, {formatarIdade(pet.idadeAno, pet.idadeMes)}
            </Text>
            {/* O ícone de sexo foi movido para cima */}
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
      {/* Header removido ou modificado para não ter título nem botão add */}
      {/* <View style={styles.header}>
        <Text style={styles.title}>Meus Pets Cadastrados</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/CadastrarPet')}
        >
          <Icon name="add" size={28} color="#FFF" />
        </TouchableOpacity>
      </View> */}

      <View style={styles.headerPlaceholder} /> {/* Espaço para o conteúdo não colar no topo */}

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

      {/* FAB para Adicionar Novo Pet */}
      <TouchableOpacity
        style={styles.fabStyle}
        onPress={() => router.push('/CadastrarPet')}
      >
        <Icon name="add" size={SIZES.iconLarge} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  // header: { // Estilo do header original, comentado pois o header foi removido/simplificado
  //   height: SIZES.headerHeight,
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'center',
  //   paddingHorizontal: SIZES.spacingRegular,
  //   backgroundColor: COLORS.cardBackground,
  //   ...SHADOWS.light,
  // },
  headerPlaceholder: { // Novo estilo para o espaço no topo
    height: SIZES.hp(4), // Altura pequena, apenas para dar um respiro. Ajustar conforme necessário.
    // Pode adicionar um paddingTop na ScrollView/FlatList em vez disso.
  },
  title: {
    fontSize: FONTS.sizeLarge, // Ajustado para um tamanho de título mais padrão
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o título
    paddingHorizontal: SIZES.spacingRegular,
    backgroundColor: COLORS.cardBackground, // Fundo branco para o header
    ...SHADOWS.light, // Sombra sutil no header
  },
  title: {
    fontSize: FONTS.sizeLarge, // Ajustado para um tamanho de título mais padrão
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  addButton: {
    position: 'absolute',
    right: SIZES.spacingRegular,
    backgroundColor: COLORS.primary,
    width: SIZES.iconLarge, // Tamanho do ícone como base
    height: SIZES.iconLarge,
    borderRadius: SIZES.iconLarge / 2, // Circular
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.regular, // Sombra para o botão de adicionar
  },
  listContainer: {
    paddingHorizontal: SIZES.spacingRegular,
    paddingTop: SIZES.spacingRegular,
    paddingBottom: SIZES.spacingLarge, // Mais padding no final da lista
  },
  // sectionTitle: { // Removido pois não há mais seções separadas
  //   fontSize: FONTS.sizeLarge,
  //   fontFamily: FONTS.familyBold,
  //   marginTop: SIZES.spacingRegular,
  //   marginBottom: SIZES.spacingSmall,
  //   color: COLORS.textSecondary,
  // },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    marginBottom: SIZES.spacingRegular,
    ...SHADOWS.regular,
    // O flexDirection: 'row' e alignItems: 'center' estão implícitos pelo cardContent e menuButton
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacingMedium, // Padding dentro do conteúdo clicável
    flex: 1,
  },
  petImage: {
    width: SIZES.wp(18),
    height: SIZES.wp(18),
    borderRadius: SIZES.borderRadiusCircle, // Para garantir circularidade
    marginRight: SIZES.spacingMedium,
    backgroundColor: COLORS.borderColorLight, // Placeholder visual
  },
  info: {
    flex: 1,
    justifyContent: 'center'
  },
  nameContainer: { // Novo container para nome e ícone de sexo
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingTiny / 2, // Pequena margem abaixo da linha do nome
  },
  petName: {
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    flexShrink: 1, // Permite que o nome encolha se for muito longo, evitando que empurre o ícone
  },
  petSexIcon: {
    marginLeft: SIZES.spacingSmall,
    // A cor é definida inline agora usando COLORS.info e COLORS.danger
  },
  petDetails: {
    fontSize: FONTS.sizeSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacingTiny,
  },
  menuButton: {
    padding: SIZES.spacingSmall,
    position: 'absolute', // Posiciona o botão de menu no canto do card
    top: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    zIndex: 1, // Garante que o botão de menu esteja acima do conteúdo do card
  },
  menuOptions: {
    position: 'absolute',
    right: SIZES.spacingMedium + SIZES.spacingTiny, // Ajustado para alinhar melhor com o ícone
    top: SIZES.spacingMedium + SIZES.spacingSmall,      // Ajustado
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusRegular,
    paddingVertical: SIZES.spacingSmall,
    ...SHADOWS.strong, // Sombra mais forte para o menu
    zIndex: 100, // Para garantir que o menu apareça sobre tudo
  },
  menuItem: {
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingMedium,
  },
  menuItemText: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: SIZES.hp(15), // Porcentagem da altura da tela
    paddingHorizontal: SIZES.wp(10), // Porcentagem da largura da tela
  },
  emptyTitle: {
    fontSize: FONTS.sizeXLarge,
    fontFamily: FONTS.familyBold,
    marginTop: SIZES.spacingLarge,
    color: COLORS.text,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.spacingSmall,
    lineHeight: FONTS.sizeRegular * 1.5, // Melhorar legibilidade
  },
  emptyBtn: {
    marginTop: SIZES.spacingXLarge,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadiusCircle, // Botão bem arredondado
    ...SHADOWS.regular,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
  },
  fabStyle: { // Estilo para o FAB de adicionar pet
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(10), // Ajustar para ficar acima do Footer
    backgroundColor: COLORS.primary,
    width: SIZES.hp(7.5),
    height: SIZES.hp(7.5),
    borderRadius: SIZES.hp(3.75),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.strong,
    zIndex: 10,
  },
});

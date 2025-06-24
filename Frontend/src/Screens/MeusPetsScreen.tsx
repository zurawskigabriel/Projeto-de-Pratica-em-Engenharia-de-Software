import React, { useEffect, useState } from 'react';
import {
  View, Text, Image, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Dimensions, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { FontAwesome } from '@expo/vector-icons';
import Footer from '../components/Footer';
import { listarPets } from '../api/api';
import { useRouter } from 'expo-router';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

const { width, height } = Dimensions.get('window');

export default function MeusPetsScreen() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const [menuVisible, setMenuVisible] = useState<number | null>(null);

  // Usando addListener para recarregar quando a tela ganha foco
  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserIdAndPets();
    });

    return unsubscribe;
  }, [navigation]);


  const loadUserIdAndPets = async () => {
    setCarregando(true);
    try {
      const idSalvo = await AsyncStorage.getItem('userId');
      if (!idSalvo) {
        Alert.alert("Erro", "Usuário não autenticado.");
        setCarregando(false);
        router.replace('/Login');
        return;
      }
      const currentUserId = parseInt(idSalvo, 10);
      setUserId(currentUserId);

      const todosOsPets = await listarPets();
      const meusPetsFiltrados = todosOsPets.filter(p => p.idUsuario === currentUserId);
      
      setPets(meusPetsFiltrados);

    } catch (e) {
      console.error("Erro ao carregar pets:", e);
      Alert.alert("Erro", "Não foi possível carregar seus pets. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const getPetImage = (especie: string) => {
    if (especie && especie.toLowerCase() === 'gato') return require('../../assets/cat.jpg');
    if (especie && especie.toLowerCase() === 'cachorro') return require('../../assets/dog.jpg');
    return require('../../assets/cat.jpg'); // Imagem padrão
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
    return 'Idade não informada';
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome name="paw" size={width * 0.15} color="#B6E1FA" />
      <Text style={styles.emptyTitle}>Nada por aqui...</Text>
      <Text style={styles.emptySubtitle}>
        Você ainda não cadastrou nenhum pet para adoção.
      </Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => router.push('/CadastrarPet')}
      >
        <Text style={styles.emptyBtnText}>Adicionar Primeiro Pet</Text>
      </TouchableOpacity>
    </View>
  );

  const PetCard = ({ pet }) => {
    return (
      <View style={styles.card}>
        <TouchableOpacity
          style={styles.cardContent}
          onPress={() => router.push({ pathname: `/PerfilPet`, params: { id: pet.id } })}
        >
          <Image source={getPetImage(pet.especie)} style={styles.petImage} />
          <View style={styles.info}>
            <View style={styles.nameContainer}>
              {/* CORREÇÃO 2: Removida a quebra de linha entre o Text e a lógica do ícone */}
              <Text style={styles.petName} numberOfLines={1} ellipsizeMode="tail">{pet.nome}</Text>{pet.sexo && (
                <FontAwesome
                  name={pet.sexo.toLowerCase() === 'm' ? 'mars' : 'venus'}
                  size={FONTS.sizeMedium}
                  style={[
                    styles.petSexIcon,
                    { color: pet.sexo.toLowerCase() === 'm' ? COLORS.info : COLORS.danger }
                  ]}
                />
              )}
            </View>
            {/* CORREÇÃO 1: Vírgula e espaço colocados dentro da template string */}
            <Text style={styles.petDetails}>
              {`${pet.raca}, ${formatarIdade(pet.idadeAno, pet.idadeMes)}`}
            </Text>
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
              router.push({ pathname: `/EditarPet`, params: { id: pet.id } });
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
      <View style={styles.headerPlaceholder}>
        <Text style={styles.title}>Meus Pets</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.listContainer}
        onScrollBeginDrag={() => { if(menuVisible) setMenuVisible(null);}}
        scrollEventThrottle={16}
      >
        {carregando ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: height * 0.1 }} />
        ) : pets.length === 0 ? (
          <EmptyState />
        ) : (
          pets.map(pet => (
              <PetCard key={pet.id.toString()} pet={pet} />
          ))
        )}
      </ScrollView>

      <Footer />

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
  headerPlaceholder: {
    paddingTop: Platform.OS === 'android' ? SIZES.hp(2) : SIZES.hp(5),
    paddingBottom: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingRegular,
    backgroundColor: COLORS.cardBackground,
    ...SHADOWS.light,
    alignItems: 'center',
  },
  title: {
    fontSize: FONTS.sizeLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  listContainer: {
    paddingHorizontal: SIZES.spacingRegular,
    paddingTop: SIZES.spacingRegular,
    paddingBottom: SIZES.hp(12), // Padding para não ficar atrás do footer/FAB
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    marginBottom: SIZES.spacingRegular,
    ...SHADOWS.regular,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacingMedium,
    flex: 1,
  },
  petImage: {
    width: SIZES.wp(18),
    height: SIZES.wp(18),
    borderRadius: SIZES.borderRadiusCircle,
    marginRight: SIZES.spacingMedium,
    backgroundColor: COLORS.borderColorLight,
  },
  info: {
    flex: 1,
    justifyContent: 'center'
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingTiny / 2,
  },
  petName: {
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    flexShrink: 1,
  },
  petSexIcon: {
    marginLeft: SIZES.spacingSmall,
  },
  petDetails: {
    fontSize: FONTS.sizeSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    marginTop: SIZES.spacingTiny,
  },
  menuButton: {
    padding: SIZES.spacingSmall,
    position: 'absolute',
    top: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    zIndex: 1,
  },
  menuOptions: {
    position: 'absolute',
    right: SIZES.spacingMedium + SIZES.spacingTiny,
    top: SIZES.spacingMedium + SIZES.spacingSmall,
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusRegular,
    paddingVertical: SIZES.spacingSmall,
    ...SHADOWS.strong,
    zIndex: 100,
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
    marginTop: SIZES.hp(15),
    paddingHorizontal: SIZES.wp(10),
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
    lineHeight: FONTS.sizeRegular * 1.5,
  },
  emptyBtn: {
    marginTop: SIZES.spacingXLarge,
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingLarge,
    borderRadius: SIZES.borderRadiusCircle,
    ...SHADOWS.regular,
  },
  emptyBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
  },
  fabStyle: {
    position: 'absolute',
    right: SIZES.spacingLarge,
    bottom: SIZES.hp(10),
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
import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, FlatList, Image,
  TouchableOpacity, ActivityIndicator,
  Modal, Pressable, StyleSheet, Alert, Platform
} from 'react-native';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { desfavoritarPet, listarFavoritosDoUsuario } from '../api/api';
import { LinearGradient } from 'expo-linear-gradient';
import Footer from '../components/Footer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme';

const SEX_FILTERS = ['todos', 'M', 'F'];

const cardSpacing = SIZES.spacingRegular;
const cardWidth = (SIZES.wp(100) - cardSpacing * 3) / 2;
const cardHeight = SIZES.hp(28);

export default function FavoritoScreen() {
  const navigation = useNavigation();
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchPets();
    });
    return unsubscribe;
  }, [navigation]);

  const fetchPets = async () => {
    setLoading(true);
    try {
      const uid = await AsyncStorage.getItem('userId');
      if (!uid) {
        Alert.alert("Usuário não autenticado", "Por favor, faça login para ver seus favoritos.");
        setLoading(false);
        return;
      }
      const favs = await listarFavoritosDoUsuario(Number(uid));
      const pets = favs.map(f => f.pet).filter(p => p);
      setData(pets);
    } catch (e) {
      console.error("Erro ao buscar favoritos:", e);
      Alert.alert("Erro ao carregar", "Não foi possível buscar seus pets favoritos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorito = (idPet: number) => {
    Alert.alert(
      'Remover dos favoritos?',
      'Tem certeza que deseja remover este pet dos seus favoritos?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, remover', style: 'destructive', onPress: async () => {
            const uid = await AsyncStorage.getItem('userId');
            if (!uid) {
              Alert.alert("Erro", "Usuário não autenticado.");
              return;
            }
            try {
              await desfavoritarPet(Number(uid), idPet);
              setData(prev => prev.filter(p => p.id !== idPet));
              Alert.alert("Sucesso", "Pet removido dos favoritos.");
            } catch (error) {
              console.error("Erro ao desfavoritar pet:", error);
              Alert.alert("Erro", "Não foi possível remover o pet dos favoritos no momento.");
            }
          }
        }
      ]
    );
  };

  const filtered = data.filter(p => {
    if (!p) return false;
    const termo = searchTerm.toLowerCase();
    const idadeAno = typeof p.idadeAno === 'number' ? p.idadeAno : 0;
    const idadeMes = typeof p.idadeMes === 'number' ? p.idadeMes : 0;
    const ageStr = `${idadeAno}a ${idadeMes}m`.toLowerCase();

    const nomeMatch = p.nome?.toLowerCase().includes(termo);
    const racaMatch = p.raca?.toLowerCase().includes(termo);
    const ageMatch = ageStr.includes(termo);

    if (!nomeMatch && !racaMatch && !ageMatch) return false;
    if (selectedFilter !== 'todos' && p.sexo !== selectedFilter) return false;
    return true;
  });

  const PetCard = ({ item }: { item: any }) => {
    if (!item) return null;

    const idadeAno = typeof item.idadeAno === 'number' ? item.idadeAno : 0;
    const idadeMes = typeof item.idadeMes === 'number' ? item.idadeMes : 0;
    const raca = item.raca || "Não informada";


    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PerfilPet', { id: item.id })}
      >
        <Image
          source={item.especie?.toLowerCase().includes('cachorro') ? require('../../assets/dog.jpg') : require('../../assets/cat.jpg')}
          style={styles.image}
        />
        <LinearGradient colors={['transparent', 'rgba(0,0,0,0.85)']} style={styles.shadow} />
        <View style={styles.petDescription}>
          <View style={styles.nameContainer}>
            <Text style={styles.name} numberOfLines={1}>{item.nome || "Nome Indisponível"}</Text>{item.sexo && (
              <FontAwesome
                name={item.sexo === 'M' ? 'mars' : 'venus'}
                size={SIZES.iconSmall}
                color={COLORS.white}
                style={styles.sexIcon}
              />
            )}
          </View>
          <Text style={styles.info} numberOfLines={1}>
            {`${idadeAno}a ${idadeMes}m • ${raca.charAt(0).toUpperCase() + raca.slice(1).toLowerCase()}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.favIconContainer} onPress={() => toggleFavorito(item.id)}>
          <FontAwesome name="heart" size={SIZES.iconSmall} color={COLORS.danger} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => {
    if (loading) return null;

    if (data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome name="heart-o" size={SIZES.iconLarge * 2} color={COLORS.primary} style={{ opacity: 0.6 }} />
          <Text style={styles.emptyTitle}>Sem favoritos por aqui.</Text>
          <Text style={styles.emptySubtitle}>Adicione pets que você ama para vê-los aqui!</Text>
        </View>
      );
    }
    return (
      <View style={styles.emptyState}>
        <FontAwesome name="search" size={SIZES.iconLarge * 1.5} color={COLORS.textSecondary} style={{ opacity: 0.8 }} />
        <Text style={styles.emptyTitle}>Nenhum resultado.</Text>
        <Text style={styles.emptySubtitle}>Tente ajustar sua busca ou filtros.</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBarContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={SIZES.iconMedium} color={COLORS.textSecondary} />
          <TextInput
            placeholder="Buscar por nome, raça ou idade"
            value={searchTerm}
            onChangeText={setSearchTerm}
            style={styles.input}
            placeholderTextColor={COLORS.textSecondary}
          />
          <TouchableOpacity style={styles.filterBtn} onPress={() => setShowFilter(true)}>
            <Ionicons name="filter" size={SIZES.iconMedium} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={showFilter} transparent animationType="fade" onRequestClose={() => setShowFilter(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filtrar por sexo</Text>
            {SEX_FILTERS.map(opt => (
              <Pressable key={opt} style={styles.filterOption} onPress={() => { setSelectedFilter(opt); setShowFilter(false); }}>
                <Text style={styles.filterOptionText}>
                  {opt === 'todos' ? 'Todos' : opt === 'M' ? 'Machos' : 'Fêmeas'}
                </Text>
              </Pressable>
            ))}
            <Pressable style={[styles.filterOption, styles.cancelButton]} onPress={() => setShowFilter(false)}>
              <Text style={[styles.filterOptionText, styles.cancelButtonText]}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {loading && data.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ flex:1, justifyContent:'center' }} />
      ) : (
        <FlatList
          data={filtered}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={PetCard}
          ListEmptyComponent={renderEmptyList}
        />
      )}
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  topBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacingRegular,
    paddingTop: Platform.OS === 'android' ? SIZES.spacingLarge : SIZES.hp(5),
    paddingBottom: SIZES.spacingSmall,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    backgroundColor: COLORS.background,
    ...SHADOWS.light,
  },
  searchBox: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: SIZES.spacingMedium,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SIZES.borderRadiusCircle,
    height: SIZES.inputHeight,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  input: {
    flex: 1,
    fontSize: FONTS.sizeRegular,
    marginLeft: SIZES.spacingSmall,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
  },
  filterBtn: {
    padding: SIZES.spacingSmall
  },
  listContainer: {
    paddingHorizontal: cardSpacing / 2,
    paddingTop: SIZES.hp(12),
    paddingBottom: SIZES.hp(10),
  },
  card: {
    width: cardWidth,
    height: cardHeight,
    borderRadius: SIZES.borderRadiusMedium,
    overflow: 'hidden',
    backgroundColor: COLORS.borderColorLight,
    ...SHADOWS.regular,
    marginBottom: cardSpacing,
    marginHorizontal: cardSpacing / 2,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: cardHeight * 0.5,
    borderBottomLeftRadius: SIZES.borderRadiusMedium,
    borderBottomRightRadius: SIZES.borderRadiusMedium,
  },
  petDescription: {
    position: 'absolute',
    bottom: SIZES.spacingSmall,
    left: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingTiny / 3,
  },
  name: {
    color: COLORS.white,
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
    flexShrink: 1,
  },
  sexIcon: {
    marginLeft: SIZES.spacingTiny,
  },
  info: {
    color: COLORS.white,
    fontSize: FONTS.sizeSmall,
    fontFamily: FONTS.familyRegular,
  },
  favIconContainer: {
    position: 'absolute',
    top: SIZES.spacingSmall,
    right: SIZES.spacingSmall,
    backgroundColor: `${COLORS.white}e6`,
    padding: SIZES.spacingTiny,
    borderRadius: SIZES.borderRadiusCircle,
    ...SHADOWS.light,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SIZES.wp(10),
    minHeight: SIZES.hp(50),
  },
  emptyTitle: {
    fontSize: FONTS.sizeLarge,
    fontFamily: FONTS.familyBold,
    marginTop: SIZES.spacingRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.spacingSmall,
    lineHeight: FONTS.sizeRegular * 1.4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusLarge,
    paddingVertical: SIZES.spacingRegular,
    width: SIZES.wp(85),
    ...SHADOWS.strong,
  },
  modalTitle: {
    fontSize: FONTS.sizeLarge,
    fontFamily: FONTS.familyBold,
    marginBottom: SIZES.spacingSmall,
    color: COLORS.text,
    textAlign: 'center',
    paddingHorizontal: SIZES.spacingLarge,
  },
  filterOption: {
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingLarge,
    borderBottomWidth: SIZES.borderWidthThin,
    borderBottomColor: COLORS.borderColorLight,
  },
  filterOptionText: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
    textAlign: 'center',
  },
  cancelButton: {
    borderBottomWidth: 0,
    paddingTop: SIZES.spacingSmall,
    marginTop: SIZES.spacingTiny,
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontFamily: FONTS.familyBold,
  }
});
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  // SafeAreaView, // Considere adicionar para iOS
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
// Certifique-se que está usando useRouter de expo-router se FooterNav usa
// import { useRouter } from 'expo-router'; // Se precisar para navegação interna na tela
import { useNavigation } from '@react-navigation/native'; // Você está usando este

import FooterNav from './Components/FooterNav'; // Confirme se o caminho está correto
import { router, useRouter } from 'expo-router';


// Dentro de TelaPesquisarAnimais.tsx e TelaPetsFavoritos.tsx
const PetCard = ({ name, gender, onPress, style }: { name: string; gender: 'male' | 'female'; onPress: () => void; style?: object }) => (
  <TouchableOpacity onPress={onPress} style={[styles.petCardTouchable, style]}>
    <View style={styles.card}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.image}
      />
      <View style={styles.overlay}>
        <Text style={styles.name}>{name}</Text>
        <FontAwesome5
          name={gender === 'male' ? 'mars' : 'venus'}
          size={16}
          color="white"
        />
      </View>
    </View>
  </TouchableOpacity>
);

export default function TelaPetsFavoritos() { // Em TelaPetsFavoritos.tsx, o nome será TelaPetsFavoritos
  const navigation = useNavigation(); // Para o botão voltar da tela
  const router = useRouter(); // Para navegação para detalhes (consistente com FooterNav)

  const [searchTerm, setSearchTerm] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchMoreData();
  }, []);

  const fetchMoreData = async () => {
    if (isFetching || !hasMore) return;
    setIsFetching(true);

    setTimeout(() => {
      const newItems = Array.from({ length: 6 }, (_, i) => ({
        id: `${(page - 1) * 6 + i + 1}`,
        name: i % 2 === 0 ? 'Bidu' : 'Ariana',
        gender: i % 2 === 0 ? 'male' : 'female',
      }));

      setData(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
      if (page >= 5) setHasMore(false); // Simula fim dos dados
      setIsFetching(false);
    }, 1000);
  };

  const filteredData = data.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.screenWrapper}>
      <View style={styles.contentArea}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="black" style={styles.backButton} />
        </TouchableOpacity>

        <Text style={styles.title}>Pesquisar Pet</Text>

        {/* INÍCIO DA BARRA DE PESQUISA CORRIGIDA */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Procurar"
            style={styles.input}
            value={searchTerm} // Certifique-se que searchTerm está definido no seu estado
            onChangeText={setSearchTerm} // Certifique-se que setSearchTerm está definido no seu estado
          />
          <TouchableOpacity>
            <Ionicons name="filter" size={24} color="black" />
          </TouchableOpacity>
        </View>
        {/* FIM DA BARRA DE PESQUISA CORRIGIDA */}


        <View style={styles.searchContainer}>
          {/* ... TextInput e botão de filtro ... */}
        </View>

        {filteredData.length > 0 ? (
          <FlatList
            style={{ flex: 1 }}
            data={filteredData}
            numColumns={2}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
                <PetCard // Removido o TouchableOpacity externo
                    name={item.name}
                    gender={item.gender as 'male' | 'female'}
                    onPress={() => {
                    // Certifique-se que a rota '/TelaDetalhesPet' corresponde ao nome do seu arquivo de detalhes do pet
                    // Se o arquivo for TelaDetalhesPet.tsx na raiz de app/, a rota é /TelaDetalhesPet
                    router.push({ pathname: '/DetalhesPet', params: { petId: item.id, petName: item.name } });
                    console.log("Navegando para detalhes do pet:", item.id);
                    }}
                    // O estilo que estava no TouchableOpacity externo (flex: 1/2, margin: 3)
                    // geralmente não é mais necessário aqui, pois o FlatList com numColumns={2}
                    // e o estilo 'styles.card' (com flex:1 e margin) devem cuidar do layout da grade.
                    // Se precisar de ajuste fino, pode passar uma prop de estilo para o PetCard.
                />
            )}
            onEndReached={fetchMoreData}
            onEndReachedThreshold={0.2}
            contentContainerStyle={styles.listContentContainer}
            ListFooterComponent={
              isFetching ? (
                <View style={styles.spinnerContainer}>
                  <ActivityIndicator size="large" color="#999" />
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResults}>Nenhum pet encontrado.</Text>
          </View>
        )}
      </View>
      <FooterNav />
    </View>
  );
}

const styles = StyleSheet.create({
  // ... screenWrapper, contentArea, backButton, title ...
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eee',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  input: { // Estilo para o TextInput da busca
    flex: 1,
    height: 40,
    fontSize: 16, // Exemplo
    paddingLeft: 8, // Exemplo
  },
  petCardItemContainer: { // Estilo para o TouchableOpacity que agora é a raiz do PetCard na lista
    flex: 1 / 2, // Para duas colunas
    // Adicione margens aqui se o styles.card não as tiver mais,
    // ou se precisar de espaçamento entre os itens da grade.
    // Exemplo: margin: 3 (como estava no seu TouchableOpacity externo)
    // No entanto, styles.card já tem margin: 6, o que pode ser suficiente.
    // Se styles.card tem margin: 6, e você quer 2 colunas,
    // não precisa de margin aqui, a menos que queira um espaçamento adicional.
  },
  petCardTouchable: {
    flex: 1, // Faz com que a área tocável preencha o espaço da coluna fornecido pela FlatList.
             // A FlatList com numColumns={2} gerencia a largura da coluna.
    // As margens visuais ENTRE os cards serão efetivamente o resultado
    // da soma das margens de `styles.card` adjacentes.
    // Ex: se styles.card tem margin: 6, o espaço visual entre dois cards lado a lado será de 12 (6+6).
  },
  card: {
    flex: 1, // O conteúdo visual preenche a área tocável (respeitando sua própria margem).
    margin: 6, // Espaçamento interno do conteúdo visual em relação à área de toque.
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#ccc',
    aspectRatio: 1, // Mantém o card quadrado.
  },
  screenWrapper: { // Novo estilo para o container da tela toda
    flex: 1,
    backgroundColor: '#fff',
  },
  contentArea: { // O antigo 'styles.container', agora para o conteúdo acima do rodapé
    flex: 1, // Crucial: faz esta área expandir
    paddingHorizontal: 16,
    paddingTop: 50, // Ou ajuste se usar SafeAreaView
  },
  backButton: {
    marginBottom: 8,
    // Se o paddingTop da contentArea for suficiente, talvez não precise de margin
    // Ou posicione absolutamente se preferir, mas ajuste em relação à contentArea
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 12,
  },
  listContentContainer: { // Estilo para o conteúdo interno da FlatList
    paddingBottom: 16, // Espaço no final da lista, antes do fim da FlatList em si
  },
  noResultsContainer: { // Para centralizar a mensagem de "Nenhum pet" no espaço disponível
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinnerContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  name: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  noResults: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    // marginTop: 20, // Não é mais necessário se o noResultsContainer centraliza
  },
});
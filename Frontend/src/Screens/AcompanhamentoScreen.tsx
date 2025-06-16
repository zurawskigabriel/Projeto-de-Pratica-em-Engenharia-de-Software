import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { buscarPet } from '../api/api';

const { width, height } = Dimensions.get('window');

export default function Acompanhamento() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [nomePet, setNomePet] = useState('...');
  const [registros, setRegistros] = useState([]);
  const [filtroAtivo, setFiltroAtivo] = useState<'Todos' | 'Saúde' | 'Visita'>('Todos');

  useEffect(() => {
    const carregar = async () => {
      try {
        if (id) {
          const pet = await buscarPet(parseInt(id));
          setNomePet(typeof pet?.nome === 'string' ? pet.nome : 'Sem nome');

          setRegistros([
            { titulo: "Saúde", data: "21/12/2024", cor: "#3AD27E", descricao: "Aplicação de antipulgas realizada com sucesso." },
            { titulo: "Saúde", data: "15/12/2024", cor: "#3AD27E", descricao: "Pet apresentou vômito e foi medicado." },
            { titulo: "Visita", data: "10/12/2024", cor: "#EA4CC0", descricao: "Visita realizada, tudo normal." },
            { titulo: "Visita", data: "05/12/2024", cor: "#EA4CC0", descricao: "Pet estava animado e brincando bastante." },
            { titulo: "Saúde", data: "01/12/2024", cor: "#3AD27E", descricao: "Consulta de rotina feita, sem anormalidades." },
            { titulo: "Visita", data: "28/11/2024", cor: "#EA4CC0", descricao: "Pet um pouco tímido, mas saudável." },
            { titulo: "Visita", data: "28/11/2024", cor: "#EA4CC0", descricao: "Pet um pouco tímido, mas saudável." },
            { titulo: "Visita", data: "28/11/2024", cor: "#EA4CC0", descricao: "Pet um pouco tímido, mas saudável." },

            { titulo: "Visita", data: "28/11/2024", cor: "#EA4CC0", descricao: "Pet um pouco tímido, mas saudável." },

          ]);
        }
      } catch (error) {
        console.error('Erro ao buscar pet:', error);
        Alert.alert('Erro', 'Não foi possível carregar os dados do pet.');
      }
    };

    carregar();
  }, [id]);

  return (
    <View style={styles.container}>
      {/* Cabeçalho */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Acompanhamento{'\n'}{nomePet}</Text>
      </View>

      {/* Subtítulo e filtro */}
      <View style={styles.filtroContainer}>
        <Text style={styles.subtitulo}>Eventos Registrados:</Text>
        <View style={styles.filtroBotoes}>
          <TouchableOpacity
            style={[styles.botaoFiltro, filtroAtivo === 'Todos' && styles.botaoFiltroAtivo]}
            onPress={() => setFiltroAtivo('Todos')}
          >
            <Text style={styles.filtroTexto}>Todos</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoFiltro, filtroAtivo === 'Saúde' && styles.botaoFiltroAtivo]}
            onPress={() => setFiltroAtivo('Saúde')}
          >
            <Text style={styles.filtroTexto}>Saúde</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.botaoFiltro, filtroAtivo === 'Visita' && styles.botaoFiltroAtivo]}
            onPress={() => setFiltroAtivo('Visita')}
          >
            <Text style={styles.filtroTexto}>Visita</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Card com registros */}
      <View style={styles.card}>
        <ScrollView
          style={styles.cardScroll}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          {registros.length > 0 ? (
            registros
              .filter((item) => filtroAtivo === 'Todos' || item.titulo === filtroAtivo)
              .map((item, index) => (
                <Item
                  key={index}
                  titulo={item.titulo}
                  data={item.data}
                  cor={item.cor}
                  descricao={item.descricao}
                />
              ))
          ) : (
            <Text style={styles.cardVazio}>Nenhum registro encontrado.</Text>
          )}
        </ScrollView>
      </View>

      {/* Botões inferiores */}
      <TouchableOpacity
        style={styles.botao}
        onPress={() => Alert.alert('Ir para Visitas', 'Você será redirecionado para a tela de visitas.')}
      >
        <Text style={styles.botaoTextoBranco}>Adicionar Novo Evento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoCinza}
        onPress={() => Alert.alert('Emitir Relatório', 'Você será redirecionado para a tela de emissão de relatório.')}
      >
        <Text style={styles.botaoTextoBranco}>Emitir relatório</Text>
      </TouchableOpacity>
    </View>
  );

  function Item({ titulo, data, descricao, cor }: any) {
    return (
      <TouchableOpacity
        onPress={() => Alert.alert('Evento', `Indo para evento "${titulo}"`)}
        style={styles.itemLinha}
        activeOpacity={0.7}
      >
        <View style={styles.itemCabecalho}>
          <View style={[styles.dot, { backgroundColor: cor }]} />
          <Text style={[styles.itemTitulo, { color: cor }]}>{titulo}</Text>
          <Text style={styles.itemData}>{data}</Text>
        </View>
        <Text style={styles.itemDescricao}>{descricao}</Text>
      </TouchableOpacity>
    );
  }
}

// Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04,
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.015,
  },
  voltar: {
    position: 'absolute',
    left: 0,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    textAlign: 'center',
    maxWidth: width * 0.7, // limita a largura para evitar overflow
    lineHeight: width * 0.07,
    flexWrap: 'wrap',
  },
  subtitulo: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    marginBottom: height * 0.01,
    color: '#333',
  },
  filtroContainer: {
    marginBottom: 0,
  },
  filtroBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: height * 0.02,
  },
  botaoFiltro: {
    flex: 1,
    marginHorizontal: height * 0.003,
    backgroundColor: '#E0E0E0',
    paddingVertical: height * 0.01,
    borderRadius: height * 0.01,
    alignItems: 'center',
  },
  botaoFiltroAtivo: {
    backgroundColor: '#7FCAD2',
  },
  filtroTexto: {
    fontSize: width * 0.04,
    color: '#333',
    fontWeight: 'bold',
  },
  
  card: {
    backgroundColor: '#F8F8F8',
    borderRadius: height * 0.015,
    borderWidth: height * 0.001,
    borderColor: '#DEDEDE',
    padding: width * 0.04,
    marginBottom: height * 0.02,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cardScroll: {
    maxHeight: height * 0.45,
  },
  cardVazio: {
    textAlign: 'center',
    color: '#888',
    fontSize: width * 0.04,
    paddingVertical: height * 0.01,
  },
  itemLinha: {
    borderBottomWidth: height * 0.003,
    borderBottomColor: '#eee',
    paddingVertical: height * 0.008,
  },
  itemCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dot: {
    width: height * 0.01,
    height: height * 0.01,
    borderRadius: height * 0.01,
    marginRight: height * 0.01,
  },
  itemTitulo: {
    fontWeight: 'bold',
    fontSize: width * 0.04,
    flex: 1,
    marginLeft:height * 0.00,
  },
  itemData: {
    fontSize: width * 0.03,
    color: '#666',
  },
  itemDescricao: {
    marginTop: height * 0.005,
    color: '#444',
    fontSize: width * 0.035,
  },
  botao: {
    backgroundColor: '#7FCAD2',
    paddingVertical: height * 0.02,
    borderRadius: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  botaoCinza: {
    backgroundColor: '#9A9A9A',
    paddingVertical: height * 0.02,
    borderRadius: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  botaoTextoBranco: {
    fontSize: width * 0.045,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

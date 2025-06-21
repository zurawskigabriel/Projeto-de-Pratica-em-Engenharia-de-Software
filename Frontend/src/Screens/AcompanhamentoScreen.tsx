import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Dimensions, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { buscarPet } from '../api/api';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

const { width, height } = Dimensions.get('window');

export default function Acompanhamento() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [nomePet, setNomePet] = useState('...');
  const [registros, setRegistros] = useState<any[]>([]);
  const [filtroAtivo, setFiltroAtivo] = useState<'Todos' | 'Saúde' | 'Visita'>('Todos');

  useEffect(() => {
    (async () => {
      if (id) {
        try {
          const pet = await buscarPet(parseInt(id));
          setNomePet(pet?.nome ?? 'Sem nome');
          setRegistros([
            /* simulação de registros */
          ]);
        } catch {
          Alert.alert('Erro', 'Não foi possível carregar os dados do pet.');
        }
      }
    })();
  }, [id]);

  const gerarPDF = async () => {
    try {
      const dataAtual = new Date().toLocaleDateString('pt-BR');
      const filtrados = registros.filter(it =>
        filtroAtivo === 'Todos' || it.titulo === filtroAtivo
      );
      const htmlEntries = filtrados.map(it => `
        <div style="margin-bottom:12px;">
           <strong>${it.titulo}</strong> (${it.data})<br/>${it.descricao}
        </div>`).join('');
      const html = `
        <div style="font-family:Arial,sans-serif;padding:24px;">
          <h1 style="text-align:center;">Relatório de Acompanhamento</h1>
          <h2>${nomePet}</h2>
          <p><strong>Data de emissão:</strong> ${dataAtual}</p>
          <hr/>
          ${htmlEntries || '<p>Sem registros para exibir.</p>'}
        </div>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e: any) {
      Alert.alert('Erro ao gerar PDF', e.message);
    }
  };

  function Item({ titulo, data, cor, descricao }: any) {
    return (
      <TouchableOpacity
        style={styles.itemLinha}
        onPress={() => Alert.alert('Evento', `${titulo} em ${data}`)}
        activeOpacity={0.7}
      >
        <View style={styles.itemCabecalho}>
          <View style={[styles.dot, { backgroundColor: cor }]} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.itemTitulo, { color: cor }]}>{titulo}</Text>
            <Text style={styles.itemData}>{data}</Text>
          </View>
        </View>
        <Text style={styles.itemDescricao}>{descricao}</Text>
      </TouchableOpacity>
    );
  }

  const filtrados = registros.filter(it =>
    filtroAtivo === 'Todos' || it.titulo === filtroAtivo
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Acompanhamento{"\n"}{nomePet}</Text>
      </View>

      <View style={styles.filtroContainer}>
        <Text style={styles.subtitulo}>Eventos Registrados</Text>
        <View style={styles.filtroBotoes}>
          {['Todos', 'Saúde', 'Visita'].map(opt => (
            <TouchableOpacity
              key={opt}
              style={[
                styles.botaoFiltro,
                filtroAtivo === opt && styles.botaoFiltroAtivo
              ]}
              onPress={() => setFiltroAtivo(opt as any)}
            >
              <Text style={[
                styles.filtroTexto,
                filtroAtivo === opt && { color: '#FFF' }
              ]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        {filtrados.length > 0 ? (
          <ScrollView style={styles.cardScroll} nestedScrollEnabled>
            {filtrados.map((it, idx) => <Item key={idx} {...it} />)}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="alert-circle-outline" size={64} color="#B6E1FA" />
            <Text style={styles.emptyTitle}>Nenhum registro encontrado</Text>
            <Text style={styles.emptySubtitle}>
              Ainda não há eventos do tipo "{filtroAtivo}" registrados.
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity
        style={styles.botao}
        onPress={() => Alert.alert('Adicionar Evento', 'Funcionalidade em breve')}
      >
        <Text style={styles.botaoTextoBranco}>Adicionar Novo Evento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.botaoCinza}
        onPress={gerarPDF}
      >
        <Text style={styles.botaoTextoBranco}>Emitir relatório</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    paddingHorizontal: width * 0.06,
    paddingTop: height * 0.04
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
  },
  voltar: { position: 'absolute', left: 0 },
  title: {
    fontSize: width * 0.065,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    lineHeight: width * 0.075
  },
  subtitulo: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#333',
    marginBottom: height * 0.01
  },
  filtroContainer: { marginBottom: height * 0.02 },
  filtroBotoes: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  botaoFiltro: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    alignItems: 'center',
  },
  botaoFiltroAtivo: {
    backgroundColor: '#2AA5FF',
  },
  filtroTexto: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#333',
  },
  card: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: height * 0.02,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  cardScroll: { maxHeight: height * 0.45 },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: height * 0.25,
  },
  emptyTitle: {
    fontSize: width * 0.05,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: width * 0.04,
    color: '#666',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
  },
  itemLinha: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#EEE',
  },
  itemCabecalho: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  itemTitulo: {
    fontSize: width * 0.045,
    fontWeight: '600',
  },
  itemData: {
    fontSize: width * 0.035,
    color: '#666'
  },
  itemDescricao: {
    marginTop: 6,
    fontSize: width * 0.04,
    color: '#444',
    lineHeight: 20
  },
  botao: {
    backgroundColor: '#2AA5FF',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginBottom: height * 0.015,
    shadowColor: '#2AA5FF', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 3,
  },
  botaoCinza: {
    backgroundColor: '#9A9A9A',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 2,
  },
  botaoTextoBranco: {
    color: '#FFF',
    fontSize: width * 0.045,
    fontWeight: '600'
  },
});

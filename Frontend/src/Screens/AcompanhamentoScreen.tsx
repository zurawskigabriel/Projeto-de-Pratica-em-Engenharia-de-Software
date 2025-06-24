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
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme'; // Importar o tema

const { width, height } = Dimensions.get('window'); // Manter por enquanto

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
          <Ionicons name="arrow-back" size={SIZES.iconMedium} color={COLORS.text} />
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
                filtroAtivo === opt && styles.filtroTextoAtivo // Aplicando estilo de texto ativo
              ]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        {/* Adicionar ActivityIndicator se 'registros' estiver carregando, não apenas no geral */}
        {registros.length === 0 && !loading && ( // Se não há registros E não está carregando
             <View style={styles.emptyContainer}>
             <Ionicons name="documents-outline" size={SIZES.iconLarge * 1.5} color={COLORS.textSecondary} />
             <Text style={styles.emptyTitle}>Nenhum evento registrado</Text>
             <Text style={styles.emptySubtitle}>
                Os eventos de saúde e visitas do pet aparecerão aqui.
             </Text>
           </View>
        )}
        {/* Se há registros filtrados (ou todos), exibe a lista */}
        {filtrados.length > 0 && (
          <ScrollView style={styles.cardScroll} nestedScrollEnabled>
            {filtrados.map((it, idx) => <Item key={idx} {...it} />)}
          </ScrollView>
        )}
        {/* Se há registros mas o filtro não retorna nada */}
        {registros.length > 0 && filtrados.length === 0 && !loading && (
             <View style={styles.emptyContainer}>
             <Ionicons name="filter-outline" size={SIZES.iconLarge * 1.5} color={COLORS.textSecondary} />
             <Text style={styles.emptyTitle}>Nenhum evento para "{filtroAtivo}"</Text>
             <Text style={styles.emptySubtitle}>
               Tente selecionar outro filtro.
             </Text>
           </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.actionButton, styles.addEventButton]}
        onPress={() => Alert.alert('Adicionar Evento', 'Funcionalidade em breve')}
      >
        <Text style={styles.buttonText}>Adicionar Novo Evento</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.actionButton, styles.reportButton]}
        onPress={gerarPDF}
      >
        <Text style={styles.buttonText}>Emitir relatório</Text>
      </TouchableOpacity>
    </View>
  );
}

// O ActivityIndicator global pode ser removido se a lógica de loading for apenas para os registros
// if (loading) {
//   return (
//     <View style={styles.loadingContainer}>
//       <ActivityIndicator size="large" color={COLORS.primary} />
//     </View>
//   );
// }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SIZES.spacingRegular,
    paddingTop: SIZES.hp(2), // Ajustado para SafeAreaView ou similar se usado no _layout
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o título
    marginBottom: SIZES.spacingLarge,
    position: 'relative', // Para o botão voltar
    height: SIZES.headerHeight,
  },
  voltar: {
    position: 'absolute',
    left: 0,
    padding: SIZES.spacingSmall, // Área de toque
  },
  title: {
    fontSize: FONTS.sizeXLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    textAlign: 'center',
    lineHeight: FONTS.sizeXLarge * 1.2, // Melhorar espaçamento entre linhas se o título quebrar
  },
  subtitulo: { // Label para "Eventos Registrados"
    fontSize: FONTS.sizeLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginBottom: SIZES.spacingRegular,
  },
  filtroContainer: {
    marginBottom: SIZES.spacingRegular
  },
  filtroBotoes: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Removido para usar gap se houver poucos botões ou flex:1
    gap: SIZES.spacingSmall, // Espaço entre botões de filtro
  },
  botaoFiltro: {
    flex: 1, // Para distribuir o espaço
    // marginHorizontal: SIZES.spacingTiny, // Substituído por gap
    paddingVertical: SIZES.spacingSmall,
    backgroundColor: COLORS.light, // Cor de fundo para filtro não ativo
    borderRadius: SIZES.borderRadiusCircle, // Botões de filtro bem arredondados
    alignItems: 'center',
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
  },
  botaoFiltroAtivo: {
    backgroundColor: COLORS.primary, // Cor primária para filtro ativo
    borderColor: COLORS.primary,
  },
  filtroTexto: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular, // Regular para não ativo
    color: COLORS.textSecondary,
  },
  filtroTextoAtivo: { // Estilo adicional para texto do filtro ativo
    fontFamily: FONTS.familyBold,
    color: COLORS.white,
  },
  card: { // Card que contém a lista de eventos
    flex: 1, // Para ocupar o espaço restante
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular,
    ...SHADOWS.regular,
  },
  cardScroll: {
    // maxHeight: SIZES.hp(45), // Removido, flex:1 no card deve controlar
  },
  emptyContainer: { // Para quando não há registros
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1, // Para centralizar no espaço do card
    padding: SIZES.spacingRegular,
  },
  emptyTitle: {
    fontSize: FONTS.sizeLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginTop: SIZES.spacingMedium,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.spacingSmall,
    paddingHorizontal: SIZES.spacingRegular,
  },
  itemLinha: { // Cada item na lista de acompanhamento
    paddingVertical: SIZES.spacingRegular,
    borderBottomWidth: SIZES.borderWidthThin,
    borderColor: COLORS.borderColorLight,
  },
  itemCabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingTiny, // Espaço entre cabeçalho e descrição
  },
  dot: { // Ponto colorido indicando tipo de evento
    width: SIZES.wp(3), // ~12px
    height: SIZES.wp(3),
    borderRadius: SIZES.wp(1.5),
    marginRight: SIZES.spacingSmall,
  },
  itemTitulo: {
    fontSize: FONTS.sizeMedium, // Título do evento
    fontFamily: FONTS.familyBold,
    // A cor é definida inline
  },
  itemData: {
    fontSize: FONTS.sizeSmall, // Data menor
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
  },
  itemDescricao: {
    marginTop: SIZES.spacingTiny, // Ajustado
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textLight,
    lineHeight: FONTS.sizeRegular * 1.4, // Melhorar legibilidade
  },
  // Botões de Ação (Adicionar Evento, Emitir Relatório)
  actionButton: { // Estilo base para os botões
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusCircle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingRegular,
    height: SIZES.buttonHeight,
    ...SHADOWS.regular,
  },
  buttonText: { // Texto para os botões
    color: COLORS.white,
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
  },
  addEventButton: {
    backgroundColor: COLORS.primary,
  },
  reportButton: {
    backgroundColor: COLORS.secondary, // Cor secundária para o relatório
  },
  loadingContainer: { // Para ActivityIndicator (se necessário)
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // Importação principal para a correção
import { buscarPerfilMatch, salvarPerfilMatch, excluirPerfilMatch } from '../api/api'; // Ajuste o caminho se necessário
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

const { width, height } = Dimensions.get('window'); // Manter por enquanto

// Estado inicial para o formulário (usado para preencher e limpar)
const initialState = {
  gato: false,
  cachorro: false,
  macho: false,
  femea: false,
  pequeno: false,
  medio: false,
  grande: false,
  convive: false,
  necessidades: false,
  raca: '',
};

export default function PerfilDeMatch() {
  const [form, setForm] = useState(initialState);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hook que executa toda vez que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        setLoading(true); // Ativa o loading a cada foco
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          if (!storedUserId) {
            Alert.alert("Erro", "Usuário não identificado. Por favor, faça login novamente.");
            router.back(); // Volta para a tela anterior
            return;
          }
          
          const id = parseInt(storedUserId, 10);
          setUserId(id);

          const perfil = await buscarPerfilMatch(id);
          
          if (perfil) {
            // Se um perfil for encontrado, preenche o formulário
            setForm({
              gato: perfil.gato,
              cachorro: perfil.cachorro,
              macho: perfil.macho,
              femea: perfil.femea,
              pequeno: perfil.pequeno,
              medio: perfil.medio,
              grande: perfil.grande,
              convive: perfil.conviveBem, // Nome diferente no backend
              necessidades: perfil.necessidadesEspeciais, // Nome diferente no backend
              raca: perfil.raca || '',
            });
          } else {
            // Se nenhum perfil for encontrado, reseta para o estado inicial
            setForm(initialState);
          }
        } catch (error) {
           // Um erro 404 (Não encontrado) é esperado se o usuário ainda não salvou um perfil.
           // Nesse caso, apenas garantimos que o formulário esteja limpo.
          if (error.message.includes("404")) {
             setForm(initialState);
          } else {
            console.error("Erro ao carregar perfil de match:", error);
            Alert.alert("Erro", "Não foi possível carregar seu perfil de match.");
          }
        } finally {
          setLoading(false); // Desativa o loading ao final
        }
      };

      fetchUserData();
    }, []) // O array vazio no useCallback garante que a função de fetch não seja recriada desnecessariamente
  );

  const toggle = (key: keyof typeof initialState) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    if (!userId) return;

    // Mapeia os nomes do formulário para os nomes esperados pelo DTO do backend
    const dadosParaSalvar = {
      gato: form.gato,
      cachorro: form.cachorro,
      macho: form.macho,
      femea: form.femea,
      pequeno: form.pequeno,
      medio: form.medio,
      grande: form.grande,
      conviveBem: form.convive,
      necessidadesEspeciais: form.necessidades,
      raca: form.raca,
      usuarioId: userId,
    };
    try {
      await salvarPerfilMatch(userId, dadosParaSalvar);
      Alert.alert("Sucesso", "Seu perfil de match foi salvo!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", "Não foi possível salvar seu perfil.");
    }
  };

  const handleDelete = () => {
    if (!userId) return;
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir seu perfil de match?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
          try {
            await excluirPerfilMatch(userId);
            setForm(initialState); // Limpa o formulário na tela
            Alert.alert("Sucesso", "Perfil excluído.");
          } catch (error) {
            console.error("Erro ao excluir:", error);
            Alert.alert("Erro", "Não foi possível excluir o perfil.");
          }
        }},
      ]
    );
  };

  const limparPerfil = () => setForm(initialState);

  // Exibe um indicador de carregamento enquanto busca os dados
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={SIZES.iconMedium} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil de Match</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Espécie de preferência:</Text>
        <Checkbox label="Gato" value={form.gato} onPress={() => toggle('gato')} />
        <Checkbox label="Cachorro" value={form.cachorro} onPress={() => toggle('cachorro')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Sexo de preferência:</Text>
        <Checkbox label="Macho" value={form.macho} onPress={() => toggle('macho')} />
        <Checkbox label="Fêmea" value={form.femea} onPress={() => toggle('femea')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Porte de preferência:</Text>
        <Checkbox label="Pequeno" value={form.pequeno} onPress={() => toggle('pequeno')} />
        <Checkbox label="Médio" value={form.medio} onPress={() => toggle('medio')} />
        <Checkbox label="Grande" value={form.grande} onPress={() => toggle('grande')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Outras características:</Text>
        <Checkbox label="Convive bem com outros Pets" value={form.convive} onPress={() => toggle('convive')} />
        <Checkbox label="Possui Necessidades Especiais" value={form.necessidades} onPress={() => toggle('necessidades')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Raças de preferência (separadas por vírgula):</Text>
        <TextInput
          style={styles.input}
          value={form.raca}
          onChangeText={text => setForm({ ...form, raca: text })}
          placeholder="Ex: Poodle, Viralata, Bulldog"
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      <TouchableOpacity style={[styles.actionButton, styles.salvarBtn]} onPress={handleSave}>
        <Text style={styles.buttonText}>Salvar Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.limparBtn]} onPress={limparPerfil}>
        <Text style={styles.buttonText}>Limpar Perfil</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.excluirBtn]} onPress={handleDelete}>
        <Text style={styles.buttonText}>Excluir Perfil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Checkbox({ label, value, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      <Ionicons
        name={value ? 'checkbox' : 'square-outline'}
        size={SIZES.iconMedium} // Tamanho do ícone do checkbox
        style={styles.checkboxIcon}
      />
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // Para o ScrollView ocupar a tela toda
    padding: SIZES.spacingRegular,
    backgroundColor: COLORS.background, // Fundo da tela
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o título
    marginBottom: SIZES.spacingLarge,
    position: 'relative', // Para o ícone de voltar
    height: SIZES.headerHeight,
  },
  headerIcon: { // Ícone de voltar
    position: 'absolute',
    left: 0,
    padding: SIZES.spacingSmall,
  },
  title: {
    fontSize: FONTS.sizeXLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  section: { // Container para cada grupo de checkboxes ou input
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular,
    ...SHADOWS.light,
  },
  label: { // Label para cada seção ou input
    fontSize: FONTS.sizeMedium, // Tamanho um pouco maior para labels de seção
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
    marginBottom: SIZES.spacingRegular, // Mais espaço abaixo do label da seção
  },
  input: { // Para o input de Raças
    backgroundColor: COLORS.light,
    fontFamily: FONTS.familyRegular,
    fontSize: FONTS.sizeRegular,
    color: COLORS.text,
    borderRadius: SIZES.borderRadiusRegular,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular, // Espaço abaixo do input
    height: SIZES.inputHeight,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacingSmall, // Espaçamento vertical para cada checkbox
    // marginBottom: SIZES.spacingTiny, // Removido, paddingVertical já espaça
  },
  checkboxIcon: { // Estilo para o ícone do checkbox
    color: COLORS.primary, // Ícone do checkbox na cor primária
    marginRight: SIZES.spacingSmall,
  },
  checkboxLabel: {
    marginLeft: SIZES.spacingSmall, // Mantido, mas pode ser ajustado com marginRight no ícone
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textLight,
    flex: 1, // Para o texto quebrar se necessário
  },
  // Botões de Ação
  actionButton: { // Estilo base para os botões Salvar, Limpar, Excluir
    borderRadius: SIZES.borderRadiusCircle,
    paddingVertical: SIZES.spacingMedium,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacingRegular,
    height: SIZES.buttonHeight,
    ...SHADOWS.regular,
  },
  buttonText: { // Texto para os botões de ação
    fontSize: FONTS.sizeMedium,
    color: COLORS.white,
    fontFamily: FONTS.familyBold,
  },
  salvarBtn: {
    backgroundColor: COLORS.primary,
  },
  limparBtn: {
    backgroundColor: COLORS.secondary,
  },
  excluirBtn: {
    backgroundColor: COLORS.danger,
  },
  loadingContainer: { // Estilo para o container do ActivityIndicator
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
});
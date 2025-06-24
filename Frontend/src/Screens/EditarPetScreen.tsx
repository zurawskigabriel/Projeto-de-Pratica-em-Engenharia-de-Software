import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, Image, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { buscarPet, atualizarPet } from '../api/api';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

export default function EditarPetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [petId, setPetId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({
    nome: '',
    raca: '',
    especie: '',
    sexo: '',
    porte: '', // Adicionado porte
    peso: '',
    bio: '',
    idadeAno: 0,
    idadeMes: 0,
  });
  const [imagemUri, setImagemUri] = useState<string | null>(null); // URI para preview
  const [imagemBase64, setImagemBase64] = useState<string | null>(null); // Base64 para envio
  const [imagemOriginalBase64, setImagemOriginalBase64] = useState<string | null>(null); // Base64 original do pet


  useEffect(() => {
    if (id) {
      const numericId = Number(id);
      setPetId(numericId);
      carregarDadosPet(numericId);
    } else {
      Alert.alert('Erro', 'ID do pet não fornecido.');
      router.back();
      setLoading(false);
    }
  }, [id]);

  const carregarDadosPet = async (currentPetId: number) => {
    setLoading(true);
    try {
      const pet = await buscarPet(currentPetId);
      setForm({
        nome: pet.nome || '',
        raca: pet.raca || '',
        especie: pet.especie || '',
        sexo: pet.sexo || '',
        porte: pet.porte || '', // Carregar porte
        peso: String(pet.peso || ''),
        bio: pet.bio || '',
        idadeAno: pet.idadeAno || 0,
        idadeMes: pet.idadeMes || 0,
      });
      if (pet.fotos) {
        setImagemOriginalBase64(pet.fotos); // Armazena a foto original
        setImagemUri(`data:image/jpeg;base64,${pet.fotos}`); // Exibe a foto original
      }
    } catch (error) {
      console.error("Erro ao carregar dados do pet:", error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do pet.');
      router.back();
    } finally {
      setLoading(false);
    }
  };


  const selecionarImagem = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "É preciso permitir o acesso à galeria para selecionar uma foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImagemUri(uri); // Preview com a nova imagem
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setImagemBase64(base64); // Nova imagem Base64 para envio
      } catch (error) {
        console.error("Erro ao converter imagem para Base64:", error);
        Alert.alert("Erro", "Não foi possível processar a imagem selecionada.");
        // Reverter para a imagem original ou nenhuma se não houver nova seleção
        setImagemUri(imagemOriginalBase64 ? `data:image/jpeg;base64,${imagemOriginalBase64}` : null);
        setImagemBase64(null);
      }
    }
  };

  const handleSalvar = async () => {
    if (!petId) {
      Alert.alert('Erro', 'ID do pet não está definido.');
      return;
    }
    const { nome, raca, especie, sexo, peso, bio, porte } = form;
    if (!nome || !raca || !especie || !sexo || !peso || !bio || !porte) {
      Alert.alert('Campos incompletos', 'Preencha todos os campos obrigatórios.');
      return;
    }
     if (form.idadeAno === 0 && form.idadeMes === 0) {
      Alert.alert('Idade inválida', 'A idade do pet não pode ser zero anos e zero meses.');
      return;
    }

    setSalvando(true);
    try {
      const idUsuario = Number(await AsyncStorage.getItem('userId'));
      if (!idUsuario) {
        Alert.alert('Erro de Autenticação', 'Usuário não identificado.');
        setSalvando(false);
        return;
      }

      // Se uma nova imagem foi selecionada (imagemBase64 não é null), use-a.
      // Caso contrário, mantenha a imagem original (imagemOriginalBase64).
      // Se nenhuma imagem original existia e nenhuma nova foi selecionada, fotos será null.
      const fotosParaEnviar = imagemBase64 || imagemOriginalBase64 || null;

      await atualizarPet(petId, {
        ...form,
        peso: parseFloat(peso.replace(',', '.')),
        idUsuario, // API pode precisar ou não, mas é bom ter
        fotos: fotosParaEnviar, // Envia a nova imagem Base64 ou a original
      });
      Alert.alert('Sucesso!', 'Pet atualizado com sucesso!');
      router.replace('/MeusPets'); // Usar replace para recarregar a lista em MeusPets
    } catch (e: any) {
      console.error("Erro ao atualizar pet:", e);
      Alert.alert('Erro ao Salvar', e.message || 'Falha ao atualizar os dados do pet.');
    } finally {
      setSalvando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: SIZES.spacingLarge }}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={SIZES.iconMedium} color={COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.cardTitle}>Editar Pet</Text>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={form.nome}
          onChangeText={text => setForm(f => ({ ...f, nome: text }))}
          placeholder="Nome do pet"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Raça</Text>
        <TextInput
          style={styles.input}
          value={form.raca}
          onChangeText={text => setForm(f => ({ ...f, raca: text }))}
          placeholder="Ex: SRD, Poodle, Siamês"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Espécie</Text>
        <View style={styles.row}>
          {['Gato', 'Cachorro'].map(o => (
            <TouchableOpacity
              key={o}
              style={[styles.pickerOption, form.especie === o && styles.pickerSelected, salvando && styles.pickerDisabled]}
              onPress={() => setForm(f => ({ ...f, especie: o }))}
              disabled={salvando}
            >
              <Text style={[styles.pickerText, form.especie === o && styles.pickerTextSelected]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Sexo</Text>
        <View style={styles.row}>
          {['Macho', 'Fêmea'].map(o => (
            <TouchableOpacity
              key={o}
              style={[styles.pickerOption, form.sexo === o.charAt(0) && styles.pickerSelected, salvando && styles.pickerDisabled]}
              onPress={() => setForm(f => ({ ...f, sexo: o.charAt(0) }))}
              disabled={salvando}
            >
              <Text style={[styles.pickerText, form.sexo === o.charAt(0) && styles.pickerTextSelected]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Porte</Text>
        <View style={styles.row}>
          {['Pequeno', 'Medio', 'Grande'].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.pickerOption, form.porte === p && styles.pickerSelected, salvando && styles.pickerDisabled]}
              onPress={() => setForm(f => ({ ...f, porte: p }))}
              disabled={salvando}
            >
              <Text style={[styles.pickerText, form.porte === p && styles.pickerTextSelected]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={form.peso}
          onChangeText={text => setForm(f => ({ ...f, peso: text }))}
          keyboardType="decimal-pad"
          placeholder="Ex: 5.5"
          placeholderTextColor={COLORS.textSecondary}
          editable={!salvando}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Idade</Text>
        <View style={styles.row}>
          {['Anos', 'Meses'].map((lbl, i) => {
            const val = i === 0 ? form.idadeAno : form.idadeMes;
            const setVal = i === 0
              ? (v: number) => setForm(f => ({ ...f, idadeAno: v }))
              : (v: number) => setForm(f => ({ ...f, idadeMes: v }));
            const max = i === 0 ? 99 : 11; // Máximo de 99 anos e 11 meses
            return (
              <View key={lbl} style={styles.ageBox}>
                <Text style={styles.ageLabel}>{lbl}</Text>
                <View style={styles.ageControl}>
                  <TouchableOpacity onPress={() => setVal(Math.max(0, val - 1))}>
                    <Ionicons name="remove-circle-outline" size={SIZES.iconLarge} style={styles.ageIcon} />
                  </TouchableOpacity>
                  <TextInput
                    style={styles.ageInput}
                    keyboardType="numeric"
                    value={String(val)}
                    onChangeText={t => {
                      const n = parseInt(t.replace(/\D/g, ''), 10);
                      setVal(isNaN(n) ? 0 : Math.min(n, max));
                    }}
                  />
                  <TouchableOpacity onPress={() => setVal(Math.min(max, val + 1))}>
                    <Ionicons name="add-circle-outline" size={SIZES.iconLarge} style={styles.ageIcon} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Bio / Informações</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          value={form.bio}
          onChangeText={text => setForm(f => ({ ...f, bio: text }))}
          placeholder="Conte um pouco sobre o pet, sua personalidade, história, etc."
          placeholderTextColor={COLORS.textSecondary}
          multiline
          editable={!salvando}
        />

        <TouchableOpacity
          style={[styles.imageBtn, salvando && styles.imageBtnDisabled]}
          onPress={selecionarImagem}
          disabled={salvando}
        >
          <Text style={styles.imageBtnText}>{imagemUri ? (imagemBase64 ? 'Nova Foto Selecionada' : 'Manter Foto Atual') : 'Adicionar foto'}</Text>
        </TouchableOpacity>
        {imagemUri && <Image source={{ uri: imagemUri }} style={styles.preview} />}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, salvando && styles.saveBtnDisabled]}
        onPress={handleSalvar}
        disabled={salvando}
      >
        {salvando ? (
          <ActivityIndicator size="small" color={COLORS.white} />
        ) : (
          <Text style={styles.saveBtnText}>Salvar Alterações</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  card: {
    margin: SIZES.spacingRegular, // Margem ao redor do card
    backgroundColor: COLORS.cardBackground,
    borderRadius: SIZES.borderRadiusMedium,
    padding: SIZES.spacingMedium,
    ...SHADOWS.regular,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center', // Centraliza o título
    alignItems: 'center', // Alinha o ícone de voltar com o título
    marginBottom: SIZES.spacingLarge, // Espaço abaixo do header do card
    position: 'relative', // Para o backBtn
    height: SIZES.headerHeight / 1.5, // Header do card um pouco menor
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    padding: SIZES.spacingTiny, // Área de toque
  },
  cardTitle: {
    fontSize: FONTS.sizeLarge, // Título do card
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  label: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
    color: COLORS.textLight,
    marginBottom: SIZES.spacingSmall,
  },
  input: {
    backgroundColor: COLORS.light,
    fontFamily: FONTS.familyRegular,
    fontSize: FONTS.sizeRegular,
    color: COLORS.text,
    borderRadius: SIZES.borderRadiusRegular,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    padding: SIZES.spacingMedium,
    marginBottom: SIZES.spacingRegular,
    height: SIZES.inputHeight,
  },
  row: {
    flexDirection: 'row',
    // justifyContent: 'space-between', // Removido para usar gap
    gap: SIZES.spacingSmall,
    marginBottom: SIZES.spacingRegular,
  },
  pickerOption: {
    flex: 1,
    padding: SIZES.spacingMedium,
    backgroundColor: COLORS.light,
    borderRadius: SIZES.borderRadiusRegular,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    height: SIZES.inputHeight,
  },
  pickerSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  pickerDisabled: {
    backgroundColor: COLORS.borderColorLight, // Cor de fundo para picker desabilitado
    borderColor: COLORS.borderColor,
  },
  pickerText: { // Estilo base para texto do picker
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
  },
  pickerTextSelected: { // Estilo para texto do picker quando selecionado
     fontFamily: FONTS.familyBold,
     color: COLORS.white,
  },
  ageBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SIZES.spacingSmall, // Padding vertical para o box
    paddingHorizontal: SIZES.spacingTiny, // Padding horizontal menor
    backgroundColor: COLORS.light,
    borderRadius: SIZES.borderRadiusRegular,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
  },
  ageLabel: {
    fontSize: FONTS.sizeSmall,
    fontFamily: FONTS.familyBold,
    color: COLORS.textLight,
    marginBottom: SIZES.spacingTiny
  },
  ageControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  ageInput: {
    width: SIZES.wp(10), // Largura responsiva menor
    textAlign: 'center',
    fontFamily: FONTS.familyRegular,
    fontSize: FONTS.sizeRegular,
    color: COLORS.text,
    marginHorizontal: SIZES.spacingTiny,
    borderBottomWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    paddingVertical: SIZES.spacingTiny,
  },
  ageIcon: { // Estilo para os ícones de +/- da idade
    color: COLORS.primary,
  },
  bioInput: {
    height: SIZES.hp(15),
    textAlignVertical: 'top',
    paddingTop: SIZES.spacingMedium,
  },
  imageBtn: {
    backgroundColor: COLORS.info,
    padding: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusRegular,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.info,
    alignItems: 'center',
    marginBottom: SIZES.spacingRegular, // Aumentado espaço abaixo
    ...SHADOWS.light,
  },
  imageBtnText: {
    color: COLORS.white,
    fontFamily: FONTS.familyBold,
    fontSize: FONTS.sizeRegular,
  },
  imageBtnDisabled: {
    backgroundColor: COLORS.buttonDisabledBackground,
    borderColor: COLORS.buttonDisabledBackground,
  },
  preview: {
    width: '100%',
    height: SIZES.hp(25),
    borderRadius: SIZES.borderRadiusMedium,
    marginTop: SIZES.spacingSmall, // Espaço acima do preview
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    alignSelf: 'center',
    backgroundColor: COLORS.borderColorLight,
  },
  saveBtn: {
    backgroundColor: COLORS.primary, // Botão de salvar com cor primária
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusCircle,
    alignItems: 'center',
    margin: SIZES.spacingRegular, // Margem ao redor do botão
    ...SHADOWS.regular,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.buttonDisabledBackground,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background, // Fundo consistente no loading
  },
});

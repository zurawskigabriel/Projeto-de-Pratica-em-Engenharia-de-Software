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
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme'; // Importar o tema

export default function EditarPetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    nome: '', raca: '', especie: '', sexo: '',
    peso: '', bio: '', idadeAno: 0, idadeMes: 0
  });
  const [imagem, setImagem] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const pet = await buscarPet(Number(id));
        setForm({
          nome: pet.nome,
          raca: pet.raca,
          especie: pet.especie,
          sexo: pet.sexo,
          peso: String(pet.peso),
          bio: pet.bio,
          idadeAno: pet.idadeAno,
          idadeMes: pet.idadeMes
        });
        // opcional: load imagem existente...
      } catch {
        Alert.alert('Erro', 'Não foi possível carregar dados do pet.');
        router.back();
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const selecionarImagem = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!res.canceled) setImagem(res.assets[0].uri);
  };

  const handleSalvar = async () => {
    const { nome, raca, especie, sexo, peso, bio } = form;
    if (!nome || !raca || !especie || !sexo || !peso || !bio) {
      return Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
    }
    try {
      const idUsuario = Number(await AsyncStorage.getItem('userId'));
      const fotos = imagem
        ? await FileSystem.readAsStringAsync(imagem, { encoding: FileSystem.EncodingType.Base64 })
        : null;
      await atualizarPet(Number(id), {
        ...form,
        peso: parseFloat(peso),
        idadeAno: form.idadeAno,
        idadeMes: form.idadeMes,
        idUsuario,
        fotos
      });
      Alert.alert('Sucesso', 'Pet atualizado com sucesso!');
      router.back();
    } catch (e: any) {
      Alert.alert('Erro', e.message || 'Falha ao salvar.');
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
              style={[styles.pickerOption, form.especie === o && styles.pickerSelected]}
              onPress={() => setForm(f => ({ ...f, especie: o }))}
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
              style={[styles.pickerOption, form.sexo === o.charAt(0) && styles.pickerSelected]}
              onPress={() => setForm(f => ({ ...f, sexo: o.charAt(0) }))}
            >
              <Text style={[styles.pickerText, form.sexo === o.charAt(0) && styles.pickerTextSelected]}>{o}</Text>
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
        />

        <TouchableOpacity style={styles.imageBtn} onPress={selecionarImagem}>
          <Text style={styles.imageBtnText}>{imagem ? 'Trocar foto' : 'Adicionar foto'}</Text>
        </TouchableOpacity>
        {imagem && <Image source={{ uri: imagem }} style={styles.preview} />}
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSalvar}>
        <Text style={styles.saveBtnText}>Salvar Alterações</Text>
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
  preview: {
    width: '100%',
    height: SIZES.hp(25),
    borderRadius: SIZES.borderRadiusMedium,
    marginTop: SIZES.spacingSmall, // Espaço acima do preview
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
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

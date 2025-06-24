import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { criarPet } from '../api/api';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

export default function CadastrarPetScreen() {
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [especie, setEspecie] = useState('');
  const [idadeAno, setIdadeAno] = useState(0);
  const [idadeMes, setIdadeMes] = useState(0);
  const [porte, setPorte] = useState(''); // Adicionado estado para porte
  const [peso, setPeso] = useState('');
  const [sexo, setSexo] = useState('');
  const [bio, setBio] = useState('');
  const [imagemUri, setImagemUri] = useState<string | null>(null); // URI local da imagem
  const [imagemBase64, setImagemBase64] = useState<string | null>(null); // Imagem em Base64
  const [salvando, setSalvando] = useState(false);


  const router = useRouter();

  const selecionarImagem = async () => {
    // Pedir permissão para acessar a galeria
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permissão necessária", "É preciso permitir o acesso à galeria para selecionar uma foto.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3], // Proporção da imagem
      quality: 0.5, // Qualidade reduzida para uploads mais rápidos
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const uri = result.assets[0].uri;
      setImagemUri(uri); // Guarda o URI para preview
      try {
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        setImagemBase64(base64); // Guarda a string Base64 para envio
      } catch (error) {
        console.error("Erro ao converter imagem para Base64:", error);
        Alert.alert("Erro", "Não foi possível processar a imagem selecionada.");
        setImagemUri(null);
        setImagemBase64(null);
      }
    }
  };

  const handleFinalizar = async () => {
    if (!nome || !raca || !especie || !porte || !peso || !sexo || !bio) {
      Alert.alert('Campos incompletos', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    if (idadeAno === 0 && idadeMes === 0) {
      Alert.alert('Idade inválida', 'A idade do pet não pode ser zero anos e zero meses.');
      return;
    }

    setSalvando(true);
    try {
      const userIdStr = await AsyncStorage.getItem('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;
      if (!userId) {
        Alert.alert('Erro de Autenticação', 'Usuário não identificado. Faça login novamente.');
        setSalvando(false);
        router.replace('/Login'); // Redireciona para o login se não houver ID
        return;
      }

      const petDTO = {
        idUsuario: userId,
        nome,
        especie,
        raca,
        idadeAno,
        idadeMes,
        porte, // Incluído porte
        peso: parseFloat(peso.replace(',', '.')), // Trata vírgula no peso
        sexo,
        bio,
        fotos: imagemBase64, // Envia a string Base64
      };

      await criarPet(petDTO);

      Alert.alert('Sucesso!', 'Pet cadastrado com sucesso.', [
        { text: 'OK', onPress: () => router.replace('/MeusPets') },
      ]);
    } catch (e: any) {
      console.error("Erro ao cadastrar pet:", e);
      Alert.alert('Erro no Cadastro', e.message || 'Não foi possível cadastrar o pet. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={{paddingBottom:60}}>
      <View style={styles.container}>

        {/* Dados básicos */}
        <View style={styles.sectionCard}>

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={()=>router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={SIZES.iconMedium} color={COLORS.text}/>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cadastro de Pet</Text>
          </View>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome do pet" placeholderTextColor={COLORS.textSecondary}/>

          <Text style={styles.label}>Raça</Text>
          <TextInput style={styles.input} value={raca} onChangeText={setRaca} placeholder="Ex: SRD, Poodle, Siamês" placeholderTextColor={COLORS.textSecondary}/>

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput style={styles.input} value={peso} onChangeText={setPeso} placeholder="Ex: 5.5" keyboardType="decimal-pad" placeholderTextColor={COLORS.textSecondary}/>

          <Text style={styles.label}>Espécie</Text>
          <View style={styles.row}>
            {['Gato','Cachorro'].map(o=>(
              <TouchableOpacity
                key={o}
                style={[styles.pickerOption, especie===o && styles.pickerOptionSelected]}
                onPress={()=>setEspecie(o)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerText, especie===o && styles.pickerTextSelected]}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Sexo</Text>
          <View style={styles.row}>
            {['M','F'].map(s=>(
              <TouchableOpacity
                key={s}
                style={[styles.pickerOption, sexo===s && styles.pickerOptionSelected]}
                onPress={()=>setSexo(s)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pickerText, sexo===s && styles.pickerTextSelected]}>{s==='M'?'Macho':'Fêmea'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Idade */}
        <View style={styles.sectionCard}>
          <Text style={styles.label}>Idade</Text>
          <View style={styles.row}>
            {['Anos','Meses'].map((lbl,i)=>{
              const val = i===0?idadeAno:idadeMes;
              const setVal = i===0?setIdadeAno:setIdadeMes;
              const max = i===1?11:999;
              return (
                <View key={lbl} style={styles.ageBox}>
                  <Text style={styles.ageLabel}>{lbl}</Text>
                  <View style={styles.ageControl}>
                    <TouchableOpacity onPress={()=>setVal(Math.max(0,val-1))} activeOpacity={0.7}>
                      <Ionicons name="remove-circle-outline" size={SIZES.iconLarge} style={styles.ageIcon}/>
                    </TouchableOpacity>
                    <TextInput
                      style={styles.ageInput}
                      value={val.toString()}
                      keyboardType="numeric"
                      onChangeText={text=>{
                        const num = parseInt(text.replace(/\D/g,''),10);
                        setVal(isNaN(num)?0:Math.min(num,max));
                      }}
                    />
                    <TouchableOpacity onPress={()=>setVal(Math.min(max,val+1))} activeOpacity={0.7}>
                      <Ionicons name="add-circle-outline" size={SIZES.iconLarge} style={styles.ageIcon}/>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Bio + Foto */}
        <View style={styles.sectionCard}>
          <Text style={styles.label}>Bio / Informações</Text>
          <TextInput
            style={[styles.input, styles.bioInput]}
            value={bio}
            onChangeText={setBio}
            placeholder="Conte um pouco sobre o pet, sua personalidade, história, etc."
            placeholderTextColor={COLORS.textSecondary}
            multiline
          />
          <TouchableOpacity style={styles.imageBtn} onPress={selecionarImagem} activeOpacity={0.7} disabled={salvando}>
            <Text style={styles.imageBtnText}>{imagemUri ? 'Trocar foto' : 'Adicionar foto'}</Text>
          </TouchableOpacity>
          {imagemUri && <Image source={{uri:imagemUri}} style={styles.preview}/>}
        </View>

        {/* Botão finalizar */}
        <TouchableOpacity
          style={[styles.saveBtn, salvando && styles.saveBtnDisabled]}
          onPress={handleFinalizar}
          activeOpacity={0.8}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <Text style={styles.saveBtnText}>Finalizar</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SIZES.spacingRegular,
    paddingTop: SIZES.hp(6), // Mais espaço no topo para o header
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o título
    marginBottom: SIZES.spacingXLarge, // Mais espaço abaixo do header
    position: 'relative', // Para o backBtn
    height: SIZES.headerHeight,
  },
  backBtn: {
    position: 'absolute',
    left: 0,
    padding: SIZES.spacingSmall, // Área de toque
  },
  headerTitle: {
    fontSize: FONTS.sizeXLarge,
    fontFamily: FONTS.familyBold,
    color: COLORS.text,
  },
  sectionCard: {
    backgroundColor: COLORS.cardBackground,
    marginVertical: SIZES.spacingSmall,
    padding: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusMedium,
    ...SHADOWS.regular,
  },
  label: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
    color: COLORS.textLight,
    marginBottom: SIZES.spacingSmall, // Mais espaço para o label
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
    marginBottom: SIZES.spacingRegular, // Espaço padrão abaixo dos inputs
    height: SIZES.inputHeight,
  },
  row: {
    flexDirection: 'row',
    gap: SIZES.spacingSmall, // Espaço entre elementos na linha
    marginBottom: SIZES.spacingRegular,
  },
  pickerOption: {
    flex: 1, // Para ocupar espaço igual
    padding: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusRegular,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    backgroundColor: COLORS.light,
    alignItems: 'center',
    justifyContent: 'center', // Centraliza texto no picker
    height: SIZES.inputHeight, // Altura consistente com inputs
  },
  pickerOptionSelected: {
    backgroundColor: COLORS.primary, // Cor primária para selecionado
    borderColor: COLORS.primary,
  },
  pickerText: { // Estilo base para texto do picker
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary, // Cor padrão do texto
  },
  pickerTextSelected: { // Estilo para texto do picker quando selecionado
    fontFamily: FONTS.familyBold,
    color: COLORS.white, // Texto branco quando selecionado
  },
  ageBox: { // Container para cada seletor de idade (Anos/Meses)
    flex: 1,
    alignItems: 'center',
    padding: SIZES.spacingSmall, // Menos padding interno
    borderRadius: SIZES.borderRadiusRegular,
    backgroundColor: COLORS.light,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
  },
  ageLabel: {
    fontSize: FONTS.sizeSmall, // Label menor
    fontFamily: FONTS.familyBold,
    color: COLORS.textLight,
    marginBottom: SIZES.spacingTiny,
  },
  ageControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around', // Distribui os controles de idade
    width: '100%', // Para que o justify funcione bem
  },
  ageInput: {
    width: SIZES.wp(12), // Largura responsiva
    textAlign: 'center',
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
    marginHorizontal: SIZES.spacingTiny, // Menos margem
    borderBottomWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    paddingVertical: SIZES.spacingTiny, // Menos padding vertical
  },
  ageIcon: { // Estilo para os ícones de +/- da idade
    color: COLORS.primary, // Cor primária para os ícones
  },
  bioInput: {
    height: SIZES.hp(15), // Altura responsiva para o campo de bio
    textAlignVertical: 'top', // Alinha o texto no topo para multiline
    paddingTop: SIZES.spacingMedium, // Padding no topo para multiline
  },
  imageBtn: {
    backgroundColor: COLORS.info, // Cor info para o botão de imagem
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.info, // Borda da mesma cor
    borderRadius: SIZES.borderRadiusRegular,
    paddingVertical: SIZES.spacingMedium,
    alignItems: 'center',
    marginTop: SIZES.spacingSmall,
    marginBottom: SIZES.spacingSmall,
    ...SHADOWS.light,
  },
  imageBtnText: {
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyBold,
    color: COLORS.white, // Texto branco para contraste
  },
  preview: {
    width: '100%',
    height: SIZES.hp(25), // Altura responsiva para o preview
    borderRadius: SIZES.borderRadiusMedium, // Bordas consistentes
    marginTop: SIZES.spacingSmall,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColor,
    alignSelf: 'center', // Centraliza a imagem se ela for menor que o container
    backgroundColor: COLORS.borderColorLight, // Fundo para o preview
  },
  saveBtn: {
    backgroundColor: COLORS.success, // Cor de sucesso para o botão Finalizar
    paddingVertical: SIZES.spacingMedium,
    borderRadius: SIZES.borderRadiusCircle,
    alignItems: 'center',
    marginTop: SIZES.spacingLarge, // Mais espaço acima do botão
    ...SHADOWS.regular,
    height: SIZES.buttonHeight,
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.buttonDisabledBackground, // Cor para botão desabilitado
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
  },
});

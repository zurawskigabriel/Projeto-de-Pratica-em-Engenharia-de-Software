import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { criarPet } from '../api/api';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CadastrarPetScreen() {
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [especie, setEspecie] = useState('');
  const [idade, setIdade] = useState('');
  const [porte, setPorte] = useState('');
  const [peso, setPeso] = useState('');
  const [sexo, setSexo] = useState('');
  const [bio, setBio] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  const router = useRouter();

  const selecionarImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const handleFinalizar = async () => {
    if (!nome || !raca || !especie || !idade || !porte || !peso || !sexo || !bio) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios.');
      return;
    }

    try {
      const userIdStr = await AsyncStorage.getItem('userId');
      const userId = userIdStr ? parseInt(userIdStr, 10) : null;

      if (!userId) {
        Alert.alert('Erro', 'Não foi possível identificar o usuário logado.');
        return;
      }

      const base64 = imagem
        ? await FileSystem.readAsStringAsync(imagem, { encoding: FileSystem.EncodingType.Base64 })
        : null;

      const petDTO = {
        idUsuario: userId,
        nome,
        especie,
        raca,
        idade: parseInt(idade),
        porte,
        peso: parseFloat(peso),
        sexo,
        bio,
        fotos: base64,
      };

      const resposta = await criarPet(petDTO);
      console.log("Pet criado:", resposta);
      Alert.alert('Sucesso', 'Pet cadastrado com sucesso!', [
        { text: 'OK', onPress: () => router.replace('/MeusPets') },
      ]);
    } catch (e: any) {
      Alert.alert('Erro ao cadastrar pet', e.message || 'Erro desconhecido.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.container}>
      <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Cadastro de novo Pet</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholderTextColor="#aaa" />

      <Text style={styles.label}>Raça</Text>
      <TextInput style={styles.input} value={raca} onChangeText={setRaca} placeholderTextColor="#aaa" />

      <Text style={styles.label}>Espécie</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[styles.pickerOption, especie === 'Gato' && styles.pickerOptionSelected]}
          onPress={() => setEspecie('Gato')}
        >
          <Text style={styles.pickerOptionText}>Gato</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickerOption, especie === 'Cachorro' && styles.pickerOptionSelected]}
          onPress={() => setEspecie('Cachorro')}
        >
          <Text style={styles.pickerOptionText}>Cachorro</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Idade</Text>
      <TextInput style={styles.input} value={idade} onChangeText={setIdade} keyboardType="numeric" placeholderTextColor="#aaa" />

      <Text style={styles.label}>Porte</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[styles.pickerOption, porte === 'PEQUENO' && styles.pickerOptionSelected]}
          onPress={() => setPorte('PEQUENO')}
        >
          <Text style={styles.pickerOptionText}>Pequeno</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickerOption, porte === 'MÉDIO' && styles.pickerOptionSelected]}
          onPress={() => setPorte('MÉDIO')}
        >
          <Text style={styles.pickerOptionText}>Médio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickerOption, porte === 'GRANDE' && styles.pickerOptionSelected]}
          onPress={() => setPorte('GRANDE')}
        >
          <Text style={styles.pickerOptionText}>Grande</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Peso (kg)</Text>
      <TextInput style={styles.input} value={peso} onChangeText={setPeso} keyboardType="decimal-pad" placeholderTextColor="#aaa" />

      <Text style={styles.label}>Sexo</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[styles.pickerOption, sexo === 'M' && styles.pickerOptionSelected]}
          onPress={() => setSexo('M')}
        >
          <Text style={styles.pickerOptionText}>Macho</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickerOption, sexo === 'F' && styles.pickerOptionSelected]}
          onPress={() => setSexo('F')}
        >
          <Text style={styles.pickerOptionText}>Fêmea</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Bio / Informações adicionais</Text>
      <TextInput
        style={[styles.input, styles.inputBio]}
        value={bio}
        onChangeText={setBio}
        multiline
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity style={styles.botaoImagem} onPress={selecionarImagem}>
        <Text style={styles.botaoTexto}>
          {imagem ? 'Trocar imagem' : 'Adicionar Foto'}
        </Text>
      </TouchableOpacity>

      {imagem && (
        <Image source={{ uri: imagem }} style={styles.preview} />
      )}

      <TouchableOpacity style={styles.botaoFinalizar} onPress={handleFinalizar}>
        <Text style={styles.botaoTextoBranco}>Finalizar</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 60,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    paddingTop: 60,
  },
  voltar: {
    position: 'absolute',
    top: 48,
    left: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
    marginTop: 8,
    color: '#333',
  },
  input: {
    width: '100%',
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
    fontSize: 16,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
  },
  inputBio: {
    height: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  pickerOption: {
    flex: 1,
    backgroundColor: '#F6F6F6',
    paddingVertical: 14,
    marginHorizontal: 4,
    borderRadius: 10,
    alignItems: 'center',
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
  },
  pickerOptionSelected: {
    backgroundColor: '#D0E8FF',
    borderColor: '#007AFF',
  },
  pickerOptionText: {
    fontSize: 16,
  },
  botaoImagem: {
    backgroundColor: '#EAEAEA',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
  },
  botaoFinalizar: {
    backgroundColor: '#7FCAD2',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 8,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
  },
  botaoTexto: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  botaoTextoBranco: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF'
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
  },
});

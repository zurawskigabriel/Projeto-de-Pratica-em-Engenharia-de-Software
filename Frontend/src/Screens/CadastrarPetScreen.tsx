import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { criarPet } from '../api/api';
import * as FileSystem from 'expo-file-system';

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
      const base64 = imagem
        ? await FileSystem.readAsStringAsync(imagem, { encoding: FileSystem.EncodingType.Base64 })
        : null;

      const petDTO = {
        idUsuario: 1, // ajuste para usar o usuário logado
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
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (e: any) {
      Alert.alert('Erro ao cadastrar pet', e.message || 'Erro desconhecido.');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>

      <Text style={styles.title}>Cadastro de novo Pet</Text>

      <TextInput style={styles.input} placeholder="Nome" value={nome} onChangeText={setNome} placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Raça" value={raca} onChangeText={setRaca} placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Espécie" value={especie} onChangeText={setEspecie} placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Idade" value={idade} onChangeText={setIdade} keyboardType="numeric" placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Porte" value={porte} onChangeText={setPorte} placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Peso (kg)" value={peso} onChangeText={setPeso} keyboardType="decimal-pad" placeholderTextColor="#aaa" />
      <TextInput style={styles.input} placeholder="Sexo (M ou F)" value={sexo} onChangeText={setSexo} maxLength={1} placeholderTextColor="#aaa" />
      <TextInput
        style={[styles.input, styles.inputBio]}
        placeholder="Bio / Informações adicionais"
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
        <Text style={styles.botaoTexto}>Finalizar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#F6F6F6',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 8,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
  },
  botaoTexto: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  preview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    marginBottom: 16,
  },
});

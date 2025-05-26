import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ScrollView, Platform } from 'react-native'; // Adicione ScrollView e Platform
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { criarPet } from '../api/api';
import * as FileSystem from 'expo-file-system';

import FooterNav from './Components/FooterNav'; // Verifique se este caminho está correto

export default function TelaCadastrarPet() {
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
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

  return (
    // Use um View principal para englobar o ScrollView e o FooterNav
    <View style={styles.screenWrapper}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled" // Boa prática para formulários em ScrollView
      >
        <TouchableOpacity style={styles.voltar} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.title}>Cadastro Novo Pet</Text>

        <TextInput
          style={styles.input}
          placeholder="Nome"
          value={nome}
          onChangeText={setNome}
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Raça"
          value={raca}
          onChangeText={setRaca}
          placeholderTextColor="#aaa"
        />
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
            {imagem ? 'Trocar imagem' : 'Adicionar Fotos'}
          </Text>
        </TouchableOpacity>

        {imagem && (
          <Image source={{ uri: imagem }} style={styles.preview} />
        )}

        <TouchableOpacity
          style={styles.botaoFinalizar}
          onPress={async () => {
            try {
              const base64 = imagem
                ? await FileSystem.readAsStringAsync(imagem, { encoding: FileSystem.EncodingType.Base64 })
                : null;

              const petDTO = {
                idUsuario: 1,
                nome: nome,
                especie: "Cachorro",
                idade: 3,
                porte: "PEQUENO",
                peso: 5.2,
                sexo: "M",
                bio: bio,
                fotos: base64
              };

              const resposta = await criarPet(petDTO);
              console.log("Pet criado:", resposta);
              alert("Pet cadastrado com sucesso!");
            } catch (e) {
              // Idealmente, trate o tipo do erro melhor
              if (e instanceof Error) {
                alert(e.message);
              } else {
                alert("Ocorreu um erro desconhecido.");
              }
            }
          }}
        >
          <Text style={styles.botaoTexto}>Finalizar</Text>
        </TouchableOpacity>
      </ScrollView> {/* Fim do ScrollView */}

      <FooterNav />
    </View> // Fim do screenWrapper
  );
}

const styles = StyleSheet.create({
  screenWrapper: { // Novo estilo para o container principal da tela
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: { // Estilo para o ScrollView em si, se necessário (geralmente não precisa de muito)
    flex: 1, // Importante para que o ScrollView tente ocupar o espaço
  },
  contentContainer: { // Estilo para o conteúdo DENTRO do ScrollView
    padding: 24,
    paddingTop: 60, // Mantém o padding original da sua tela
    paddingBottom: 24, // Adiciona um padding inferior para não colar no rodapé se o conteúdo for curto
  },
  // Seus estilos existentes (voltar, title, input, etc.) permanecem os mesmos
  voltar: {
    position: 'absolute', // Se 'voltar' é absoluto, ele se posiciona em relação ao 'contentContainer' ou o primeiro pai posicionado
    top: 24, // Ajustado para o padding do contentContainer
    left: 24, // Ajustado para o padding do contentContainer
    zIndex: 1, // Para garantir que fique por cima se houver sobreposição
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    alignSelf: 'center',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 40, // Adiciona um espaço para o botão 'voltar' absoluto
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
    // marginBottom: 24, // Adicione se quiser um espaço antes do final do scroll/rodapé
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
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buscarPet, atualizarPet } from '../api/api';

export default function EditarPet() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [userId, setUserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: '',
    idade: '',
    raca: '',
    porte: '',
    sexo: '',
    especie: '',
    peso: '',
    bio: '',
  });
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarPet = async () => {
      try {
        const idSalvo = await AsyncStorage.getItem('userId');
        setUserId(idSalvo ? parseInt(idSalvo, 10) : null);

        const pet = await buscarPet(parseInt(id));
        setForm({
          nome: pet.nome || '',
          idade: String(pet.idade || ''),
          raca: pet.raca || '',
          porte: pet.porte || '',
          sexo: pet.sexo || '',
          especie: pet.especie || '',
          peso: String(pet.peso || ''),
          bio: pet.bio || '',
        });
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível carregar os dados do pet.');
      } finally {
        setCarregando(false);
      }
    };

    carregarPet();
  }, [id]);

  const handleSalvar = async () => {
    try {
      if (!userId) throw new Error("ID do usuário não encontrado.");

      await atualizarPet(parseInt(id), {
        idUsuario: userId,
        nome: form.nome,
        idade: parseInt(form.idade),
        raca: form.raca,
        porte: form.porte,
        sexo: form.sexo,
        especie: form.especie,
        peso: parseFloat(form.peso),
        bio: form.bio,
        fotos: null, // você pode implementar isso depois
      });

      Alert.alert('Sucesso', 'Pet atualizado com sucesso!');
      router.back();
    } catch (error) {
      Alert.alert('Erro', error.message || 'Erro ao salvar alterações.');
    }
  };

  const handleCancelar = () => {
    Alert.alert(
      'Cancelar alterações?',
      'Você quer cancelar mesmo?',
      [
        { text: 'Não', style: 'cancel' },
        { text: 'Sim', onPress: () => router.back(), style: 'destructive' },
      ]
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>Editar Pet</Text>

      {[
        { campo: 'nome', label: 'Nome' },
        { campo: 'idade', label: 'Idade (em anos)' },
        { campo: 'raca', label: 'Raça' },
        { campo: 'porte', label: 'Porte' },
        { campo: 'sexo', label: 'Sexo (M ou F)' },
        { campo: 'especie', label: 'Espécie (Cachorro ou Gato)' },
        { campo: 'peso', label: 'Peso (kg)' },
        { campo: 'bio', label: 'Bio' },
      ].map(({ campo, label }) => (
        <View key={campo} style={styles.inputContainer}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={form[campo]}
            onChangeText={(text) => setForm({ ...form, [campo]: text })}
            placeholder={`Digite o ${label.toLowerCase()}`}
            keyboardType={['idade', 'peso'].includes(campo) ? 'numeric' : 'default'}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
        <Text style={styles.botaoTexto}>Salvar Alterações</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.botaoCancelar} onPress={handleCancelar}>
        <Text style={styles.botaoTexto}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#F0F0F0',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
  },
  botaoSalvar: {
    backgroundColor: '#4CAF50',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  botaoCancelar: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

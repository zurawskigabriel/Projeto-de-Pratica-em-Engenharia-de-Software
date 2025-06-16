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
import { Ionicons } from '@expo/vector-icons';

export default function EditarPet() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [userId, setUserId] = useState<number | null>(null);
  const [form, setForm] = useState({
    nome: '',
    idadeAno: 0,
    idadeMes: 0,
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
          idadeAno: pet.idadeAno || 0,
          idadeMes: pet.idadeMes || 0,
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
        idadeAno: form.idadeAno,
        idadeMes: form.idadeMes,
        raca: form.raca,
        porte: form.porte,
        sexo: form.sexo,
        especie: form.especie,
        peso: parseFloat(form.peso),
        bio: form.bio,
        fotos: null,
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={form.nome}
          onChangeText={(text) => setForm({ ...form, nome: text })}
          placeholder="Digite o nome"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Raça</Text>
        <TextInput
          style={styles.input}
          value={form.raca}
          onChangeText={(text) => setForm({ ...form, raca: text })}
          placeholder="Digite a raça"
        />
      </View>

      <Text style={styles.label}>Espécie</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[styles.pickerOption, form.especie === 'Gato' && styles.pickerOptionSelected]}
          onPress={() => setForm({ ...form, especie: 'Gato' })}>
          <Text style={styles.pickerOptionText}>Gato</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickerOption, form.especie === 'Cachorro' && styles.pickerOptionSelected]}
          onPress={() => setForm({ ...form, especie: 'Cachorro' })}>
          <Text style={styles.pickerOptionText}>Cachorro</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Idade</Text>
      <View style={styles.idadeContainer}>
        <View style={styles.idadeBox}>
          <Text style={styles.idadeTitulo}>Anos</Text>
          <View style={styles.controleIdade}>
            <TouchableOpacity onPress={() => setForm({ ...form, idadeAno: Math.max(0, form.idadeAno - 1) })}>
              <Ionicons name="remove-circle-outline" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.idadeValor}>{form.idadeAno}</Text>
            <TouchableOpacity onPress={() => setForm({ ...form, idadeAno: form.idadeAno + 1 })}>
              <Ionicons name="add-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.idadeBox}>
          <Text style={styles.idadeTitulo}>Meses</Text>
          <View style={styles.controleIdade}>
            <TouchableOpacity onPress={() => setForm({ ...form, idadeMes: Math.max(0, form.idadeMes - 1) })}>
              <Ionicons name="remove-circle-outline" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.idadeValor}>{form.idadeMes}</Text>
            <TouchableOpacity onPress={() => setForm({ ...form, idadeMes: Math.min(11, form.idadeMes + 1) })}>
              <Ionicons name="add-circle-outline" size={24} color="black" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Demais campos */}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={form.peso}
          onChangeText={(text) => setForm({ ...form, peso: text })}
          placeholder="Digite o peso"
          keyboardType="decimal-pad"
        />
      </View>

      <Text style={styles.label}>Sexo</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[styles.pickerOption, form.sexo === 'M' && styles.pickerOptionSelected]}
          onPress={() => setForm({ ...form, sexo: 'M' })}>
          <Text style={styles.pickerOptionText}>Macho</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickerOption, form.sexo === 'F' && styles.pickerOptionSelected]}
          onPress={() => setForm({ ...form, sexo: 'F' })}>
          <Text style={styles.pickerOptionText}>Fêmea</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={styles.input}
          value={form.bio}
          onChangeText={(text) => setForm({ ...form, bio: text })}
          placeholder="Digite a bio"
          multiline
        />
      </View>

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
  idadeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  idadeBox: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 12,
    backgroundColor: '#F6F6F6',
    borderRadius: 10,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderWidth: 1,
  },
  idadeTitulo: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  controleIdade: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '70%',
  },
  idadeValor: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  botaoSalvar: {
    backgroundColor: '#7FCAD2',
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

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
        { campo: 'raca', label: 'Raça' },
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Idade (em anos)</Text>
        <TextInput
          style={styles.input}
          value={form.idade}
          onChangeText={(text) => setForm({ ...form, idade: text })}
          placeholder="Digite a idade"
          keyboardType="numeric"
        />
      </View>

      <Text style={styles.label}>Porte</Text>
      <View style={styles.pickerContainer}>
        <TouchableOpacity
          style={[styles.pickerOption, form.porte === 'PEQUENO' && styles.pickerOptionSelected]}
          onPress={() => setForm({ ...form, porte: 'PEQUENO' })}>
          <Text style={styles.pickerOptionText}>Pequeno</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickerOption, form.porte === 'MÉDIO' && styles.pickerOptionSelected]}
          onPress={() => setForm({ ...form, porte: 'MEDIO' })}>
          <Text style={styles.pickerOptionText}>Médio</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.pickerOption, form.porte === 'GRANDE' && styles.pickerOptionSelected]}
          onPress={() => setForm({ ...form, porte: 'GRANDE' })}>
          <Text style={styles.pickerOptionText}>Grande</Text>
        </TouchableOpacity>
      </View>

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

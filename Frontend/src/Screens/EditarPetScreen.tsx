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
        <ActivityIndicator size="large" color="#219CD9" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.card}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.cardTitle}>Editar Pet</Text>
        </View>

        <Text style={styles.label}>Nome</Text>
        <TextInput
          style={styles.input}
          value={form.nome}
          onChangeText={text => setForm(f => ({ ...f, nome: text }))}
          placeholder="Nome"
        />

        <Text style={styles.label}>Raça</Text>
        <TextInput
          style={styles.input}
          value={form.raca}
          onChangeText={text => setForm(f => ({ ...f, raca: text }))}
          placeholder="Raça"
        />

        <Text style={styles.label}>Espécie</Text>
        <View style={styles.row}>
          {['Gato', 'Cachorro'].map(o => (
            <TouchableOpacity
              key={o}
              style={[styles.pickerOption, form.especie === o && styles.pickerSelected]}
              onPress={() => setForm(f => ({ ...f, especie: o }))}
            >
              <Text style={styles.pickerText}>{o}</Text>
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
              <Text style={styles.pickerText}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          style={styles.input}
          value={form.peso}
          onChangeText={text => setForm(f => ({ ...f, peso: text }))}
          keyboardType="decimal-pad"
          placeholder="Peso"
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
            const max = i === 0 ? 99 : 11;
            return (
              <View key={lbl} style={styles.ageBox}>
                <Text style={styles.ageLabel}>{lbl}</Text>
                <View style={styles.ageControl}>
                  <TouchableOpacity onPress={() => setVal(Math.max(0, val - 1))}>
                    <Ionicons name="remove-circle-outline" size={28} color="#219CD9" />
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
                    <Ionicons name="add-circle-outline" size={28} color="#219CD9" />
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
          placeholder="Sobre o pet..."
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
  screen: { flex: 1, backgroundColor: '#F1F9FA' },

  card: {
    margin: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    // sombra cross-platform
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4, // Android :contentReference[oaicite:1]{index=1}
  },

  header: { flexDirection: 'row', justifyContent: 'center', marginBottom: 12 },
  backBtn: { position: 'absolute', left: 0 },
  cardTitle: { fontSize: 20, fontWeight: '700', color: '#333' },

  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 12,
  },

  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  pickerOption: {
    flex: 1,
    padding: 12,
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DDD',
    marginHorizontal: 4,
  },
  pickerSelected: {
    backgroundColor: '#B6E3F2',
    borderColor: '#219CD9',
  },
  pickerText: { fontSize: 16, fontWeight: '500', color: '#333' },

  ageBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F6F6F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
  },
  ageLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  ageControl: { flexDirection: 'row', alignItems: 'center' },
  ageInput: {
    width: 50,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderColor: '#CCC',
    fontSize: 16,
    marginHorizontal: 8,
  },

  bioInput: { height: 100 },
  imageBtn: {
    backgroundColor: '#E5F3FF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ADD8E6',
    alignItems: 'center',
    marginBottom: 12,
  },
  imageBtnText: { color: '#333', fontWeight: '600' },
  preview: { width: '100%', height: 180, borderRadius: 12, marginTop: 8 },

  saveBtn: {
    backgroundColor: '#219CD9',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    margin: 12,
    shadowColor: '#2AA5FF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600' },

  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

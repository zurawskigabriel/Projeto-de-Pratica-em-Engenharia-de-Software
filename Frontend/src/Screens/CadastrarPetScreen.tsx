import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Image, Alert
} from 'react-native';
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
  const [idadeAno, setIdadeAno] = useState(0);
  const [idadeMes, setIdadeMes] = useState(0);
  const [porte, setPorte] = useState('');
  const [peso, setPeso] = useState('');
  const [sexo, setSexo] = useState('');
  const [bio, setBio] = useState('');
  const [imagem, setImagem] = useState<string | null>(null);

  const router = useRouter();

  const selecionarImagem = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!res.canceled) setImagem(res.assets[0].uri);
  };

  const handleFinalizar = async () => {
    if (!nome||!raca||!especie||!porte||!peso||!sexo||!bio) {
      return Alert.alert('Erro','Preencha todos os campos obrigatórios');
    }
    try {
      const userIdStr = await AsyncStorage.getItem('userId');
      const userId = userIdStr ? parseInt(userIdStr,10) : null;
      if (!userId) return Alert.alert('Erro','Usuário não identificado');

      const fotos = imagem
        ? await FileSystem.readAsStringAsync(imagem,{ encoding: FileSystem.EncodingType.Base64 })
        : null;

      const petDTO = { idUsuario:userId,nome,especie,raca,idadeAno,idadeMes,porte,peso:parseFloat(peso),sexo,bio,fotos };
      await criarPet(petDTO);

      Alert.alert('Sucesso','Pet cadastrado!',[
        { text:'OK', onPress:()=>router.replace('/MeusPets') }
      ]);
    } catch(e:any) {
      Alert.alert('Erro','Erro ao cadastrar pet');
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
              <Ionicons name="arrow-back" size={24} color="#333"/>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Cadastro de Pet</Text>
          </View>
          <Text style={styles.label}>Nome</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome" placeholderTextColor="#aaa"/>

          <Text style={styles.label}>Raça</Text>
          <TextInput style={styles.input} value={raca} onChangeText={setRaca} placeholder="Raça" placeholderTextColor="#aaa"/>

          <Text style={styles.label}>Peso (kg)</Text>
          <TextInput style={styles.input} value={peso} onChangeText={setPeso} placeholder="Peso" keyboardType="decimal-pad" placeholderTextColor="#aaa"/>

          <Text style={styles.label}>Espécie</Text>
          <View style={styles.row}>
            {['Gato','Cachorro'].map(o=>(
              <TouchableOpacity
                key={o}
                style={[styles.pickerOption, especie===o && styles.pickerOptionSelected]}
                onPress={()=>setEspecie(o)}
                activeOpacity={0.7}
              >
                <Text style={styles.pickerText}>{o}</Text>
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
                <Text style={styles.pickerText}>{s==='M'?'Macho':'Fêmea'}</Text>
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
                      <Ionicons name="remove-circle-outline" size={28} color="#2AA5FF"/>
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
                      <Ionicons name="add-circle-outline" size={28} color="#2AA5FF"/>
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
            placeholder="Conte um pouco sobre o pet..."
            placeholderTextColor="#aaa"
            multiline
          />
          <TouchableOpacity style={styles.imageBtn} onPress={selecionarImagem} activeOpacity={0.7}>
            <Text style={styles.imageBtnText}>{imagem ? 'Trocar foto' : 'Adicionar foto'}</Text>
          </TouchableOpacity>
          {imagem && <Image source={{uri:imagem}} style={styles.preview}/>}
        </View>

        {/* Botão finalizar */}
        <TouchableOpacity style={styles.saveBtn} onPress={handleFinalizar} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Finalizar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { backgroundColor:'#F9F9F9' },
  container: { padding:16, paddingTop:48 },
  header: { flexDirection:'row', alignItems:'center', justifyContent:'center', marginBottom:24 },
  backBtn: { position:'absolute', left:0 },
  headerTitle: { fontSize:24, fontWeight:'bold', color:'#333' },

  sectionCard: {
    backgroundColor:'#fff',
    marginVertical:8,
    padding:16,
    borderRadius:12,
    shadowColor:'#000',
    shadowOffset:{width:0,height:2},
    shadowOpacity:0.05,
    shadowRadius:4,
    elevation:2
  },
  label: { fontSize:14, fontWeight:'600', color:'#333', marginBottom:4 },
  input: {
    backgroundColor:'#F6F6F6',
    borderRadius:8,
    borderWidth:1,
    borderColor:'#DDD',
    padding:12,
    fontSize:16,
    marginBottom:12
  },
  row: { flexDirection:'row', gap:8, marginBottom:12 },

  pickerOption: {
    flex:1,
    padding:12,
    borderRadius:8,
    borderWidth:1,
    borderColor:'#DDD',
    backgroundColor:'#F6F6F6',
    alignItems:'center'
  },
  pickerOptionSelected: {
    backgroundColor:'#B6E1FA',
    borderColor:'#2AA5FF'
  },
  pickerText: { fontSize:16, fontWeight:'500', color:'#333' },

  ageBox: {
    flex:1,
    alignItems:'center',
    padding:12,
    borderRadius:8,
    backgroundColor:'#F6F6F6',
    borderWidth:1,
    borderColor:'#DDD'
  },
  ageLabel: { fontSize:14, fontWeight:'600', color:'#333', marginBottom:4 },
  ageControl: { flexDirection:'row', alignItems:'center' },
  ageInput: {
    width:48,
    textAlign:'center',
    fontSize:16,
    marginHorizontal:8,
    borderBottomWidth:1,
    borderColor:'#CCC',
    paddingVertical:0,
    color:'#333'
  },

  bioInput: { height:100, textAlignVertical:'top' },
  imageBtn: {
    backgroundColor:'#E5F3FF',
    borderWidth:1,
    borderColor:'#ADD8E6',
    borderRadius:8,
    paddingVertical:12,
    alignItems:'center',
    marginTop:8,
    marginBottom:8
  },
  imageBtnText: { fontSize:16, fontWeight:'600', color:'#333' },
  preview: { width:'100%', height:180, borderRadius:12, marginTop:8 },

  saveBtn: {
    backgroundColor:'#2AA5FF',
    paddingVertical:16,
    borderRadius:50,
    alignItems:'center',
    marginTop:16,
    shadowColor:'#2AA5FF',
    shadowOffset:{width:0,height:4},
    shadowOpacity:0.2,
    shadowRadius:6,
    elevation:4
  },
  saveBtnText: { color:'#FFF', fontSize:16, fontWeight:'600' },
});

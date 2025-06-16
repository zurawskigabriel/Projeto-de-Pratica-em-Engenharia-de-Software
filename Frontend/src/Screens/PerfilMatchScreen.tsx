import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

export default function PerfilDeMatch() {
  const [form, setForm] = useState({
    gato: true,
    cachorro: true,
    macho: true,
    femea: true,
    pequeno: true,
    medio: true,
    grande: true,
    convive: true,
    necessidades: true,
    raca: '',
  });

  const router = useRouter();

  const toggle = key => setForm({ ...form, [key]: !form[key] });

  const limparPerfil = () => {
    setForm({
      gato: false,
      cachorro: false,
      macho: false,
      femea: false,
      pequeno: false,
      medio: false,
      grande: false,
      convive: false,
      necessidades: false,
      raca: '',
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerWrapper}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerIcon}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Perfil de Match</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Espécie</Text>
        <Checkbox label="Gato" value={form.gato} onPress={() => toggle('gato')} />
        <Checkbox label="Cachorro" value={form.cachorro} onPress={() => toggle('cachorro')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Sexo</Text>
        <Checkbox label="Macho" value={form.macho} onPress={() => toggle('macho')} />
        <Checkbox label="FêMEA" value={form.femea} onPress={() => toggle('femea')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Porte</Text>
        <Checkbox label="Pequeno" value={form.pequeno} onPress={() => toggle('pequeno')} />
        <Checkbox label="Médio" value={form.medio} onPress={() => toggle('medio')} />
        <Checkbox label="Grande" value={form.grande} onPress={() => toggle('grande')} />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Outros</Text>
        <Checkbox label="Convive bem com outros Pets" value={form.convive} onPress={() => toggle('convive')} />
        <Checkbox label="Possui Necessidades Especiais" value={form.necessidades} onPress={() => toggle('necessidades')} />
      </View>

      <Text style={styles.label}>Raças</Text>
      <TextInput
        style={styles.input}
        value={form.raca}
        onChangeText={text => setForm({ ...form, raca: text })}
      />

      <TouchableOpacity style={styles.salvarBtn}><Text style={styles.buttonTxt}>Salvar Perfil</Text></TouchableOpacity>
      <TouchableOpacity style={styles.limparBtn} onPress={limparPerfil}><Text style={styles.buttonTxt}>Limpar Perfil</Text></TouchableOpacity>
      <TouchableOpacity style={styles.excluirBtn}><Text style={styles.buttonTxt}>Excluir Perfil</Text></TouchableOpacity>
    </ScrollView>
  );
}

function Checkbox({ label, value, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      <Text style={styles.checkbox}>{value ? '☑' : '☐'}</Text>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: width * 0.05,
    backgroundColor: '#fff',
  },
  headerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: height * 0.02,
    position: 'relative',
  },
  headerIcon: {
    position: 'absolute',
    left: 0,
  },
  title: {
    fontSize: width * 0.07,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: height * 0.015,
  },
  label: {
    fontSize: width * 0.05,
    fontWeight: '600',
    marginBottom: height * 0.005,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.015,
    marginBottom: height * 0.02,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.005,
  },
  checkbox: {
    fontSize: width * 0.05,
  },
  checkboxLabel: {
    marginLeft: width * 0.02,
    fontSize: width * 0.045,
  },
  salvarBtn: {
    backgroundColor: '#7FCAD2',
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
    elevation: 4,
  },
  limparBtn: {
    backgroundColor: '#9A9A9A',
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
    elevation: 4,
  },
  excluirBtn: {
    backgroundColor: '#FF5C5C',
    borderRadius: height * 0.02,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
    elevation: 4,
  },
  buttonTxt: {
    fontSize: width * 0.05,
    color: 'white',
    fontWeight: 'bold',
  },
});

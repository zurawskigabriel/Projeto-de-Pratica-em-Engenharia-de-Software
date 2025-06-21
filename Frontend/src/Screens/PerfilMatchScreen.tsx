import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native'; // Importação principal para a correção
import { buscarPerfilMatch, salvarPerfilMatch, excluirPerfilMatch } from '../api/api'; // Ajuste o caminho se necessário
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

// Estado inicial para o formulário (usado para preencher e limpar)
const initialState = {
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
};

export default function PerfilDeMatch() {
  const [form, setForm] = useState(initialState);
  const [userId, setUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Hook que executa toda vez que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      const fetchUserData = async () => {
        setLoading(true); // Ativa o loading a cada foco
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          if (!storedUserId) {
            Alert.alert("Erro", "Usuário não identificado. Por favor, faça login novamente.");
            router.back(); // Volta para a tela anterior
            return;
          }
          
          const id = parseInt(storedUserId, 10);
          setUserId(id);

          const perfil = await buscarPerfilMatch(id);
          
          if (perfil) {
            // Se um perfil for encontrado, preenche o formulário
            setForm({
              gato: perfil.gato,
              cachorro: perfil.cachorro,
              macho: perfil.macho,
              femea: perfil.femea,
              pequeno: perfil.pequeno,
              medio: perfil.medio,
              grande: perfil.grande,
              convive: perfil.conviveBem, // Nome diferente no backend
              necessidades: perfil.necessidadesEspeciais, // Nome diferente no backend
              raca: perfil.raca || '',
            });
          } else {
            // Se nenhum perfil for encontrado, reseta para o estado inicial
            setForm(initialState);
          }
        } catch (error) {
           // Um erro 404 (Não encontrado) é esperado se o usuário ainda não salvou um perfil.
           // Nesse caso, apenas garantimos que o formulário esteja limpo.
          if (error.message.includes("404")) {
             setForm(initialState);
          } else {
            console.error("Erro ao carregar perfil de match:", error);
            Alert.alert("Erro", "Não foi possível carregar seu perfil de match.");
          }
        } finally {
          setLoading(false); // Desativa o loading ao final
        }
      };

      fetchUserData();
    }, []) // O array vazio no useCallback garante que a função de fetch não seja recriada desnecessariamente
  );

  const toggle = (key: keyof typeof initialState) => setForm(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSave = async () => {
    if (!userId) return;

    // Mapeia os nomes do formulário para os nomes esperados pelo DTO do backend
    const dadosParaSalvar = {
      gato: form.gato,
      cachorro: form.cachorro,
      macho: form.macho,
      femea: form.femea,
      pequeno: form.pequeno,
      medio: form.medio,
      grande: form.grande,
      conviveBem: form.convive,
      necessidadesEspeciais: form.necessidades,
      raca: form.raca,
      usuarioId: userId,
    };
    try {
      await salvarPerfilMatch(userId, dadosParaSalvar);
      Alert.alert("Sucesso", "Seu perfil de match foi salvo!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      Alert.alert("Erro", "Não foi possível salvar seu perfil.");
    }
  };

  const handleDelete = () => {
    if (!userId) return;
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir seu perfil de match?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Excluir", style: "destructive", onPress: async () => {
          try {
            await excluirPerfilMatch(userId);
            setForm(initialState); // Limpa o formulário na tela
            Alert.alert("Sucesso", "Perfil excluído.");
          } catch (error) {
            console.error("Erro ao excluir:", error);
            Alert.alert("Erro", "Não foi possível excluir o perfil.");
          }
        }},
      ]
    );
  };

  const limparPerfil = () => setForm(initialState);

  // Exibe um indicador de carregamento enquanto busca os dados
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#7FCAD2" />
      </View>
    );
  }

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
        <Checkbox label="Fêmea" value={form.femea} onPress={() => toggle('femea')} />
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

      <Text style={styles.label}>Raças (separadas por vírgula)</Text>
      <TextInput
        style={styles.input}
        value={form.raca}
        onChangeText={text => setForm({ ...form, raca: text })}
        placeholder="Ex: Poodle, Viralata, Bulldog"
      />

      <TouchableOpacity style={styles.salvarBtn} onPress={handleSave}><Text style={styles.buttonTxt}>Salvar Perfil</Text></TouchableOpacity>
      <TouchableOpacity style={styles.limparBtn} onPress={limparPerfil}><Text style={styles.buttonTxt}>Limpar Perfil</Text></TouchableOpacity>
      <TouchableOpacity style={styles.excluirBtn} onPress={handleDelete}><Text style={styles.buttonTxt}>Excluir Perfil</Text></TouchableOpacity>
    </ScrollView>
  );
}

function Checkbox({ label, value, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.checkboxContainer}>
      <Ionicons name={value ? 'checkbox' : 'square-outline'} size={24} color="#333" />
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
    fontSize: width * 0.04,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  checkboxLabel: {
    marginLeft: width * 0.03,
    fontSize: width * 0.045,
  },
  salvarBtn: {
    backgroundColor: '#7FCAD2',
    borderRadius: 8,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
    elevation: 4,
  },
  limparBtn: {
    backgroundColor: '#9A9A9A',
    borderRadius: 8,
    paddingVertical: height * 0.02,
    alignItems: 'center',
    marginBottom: height * 0.015,
    elevation: 4,
  },
  excluirBtn: {
    backgroundColor: '#FF5C5C',
    borderRadius: 8,
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
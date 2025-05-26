import React, { useState } from 'react';

import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Switch,
    Modal,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { criarUsuario } from '../api/api';


export default function CadastrarScreen() {
    const [senhaVisivel, setSenhaVisivel] = useState(false);
    const [senhaRepetidaVisivel, setSenhaRepetidaVisivel] = useState(false);
    const [promocoes, setPromocoes] = useState(false);
    const [tipoPessoa, setTipoPessoa] = useState<'queroAdotar' | 'queroDoar' | null>(null);
    const [nome, setNome] = useState('');
    
    const [cpf, setCpf] = useState('');
    const [email, setEmail] = useState('');
    const [telefone, setTelefone] = useState('');
    const [senha, setSenha] = useState('');
    const [senhaRepetida, setSenhaRepetida] = useState('');

    const [modalVisivel, setModalVisivel] = useState(false);
    const router = useRouter();

    const camposQueroAdotar = ['Nome', 'CPF', 'Email', 'Telefone'];
    const camposQueroDoar = ['Nome', 'CPF', 'Email', 'Telefone'];

    const handleCadastro = async () => {
        if (senha !== senhaRepetida) {
          alert("As senhas não coincidem.");
          return;
        }
      
        const usuarioDTO = {
          nome,
          telefone,
          email,
          senha,
          tipo: tipoPessoa === "queroAdotar" ? "PESSOA" : "ONG"
        };
      
        try {
          const resposta = await criarUsuario(usuarioDTO);
          console.log("Usuário criado:", resposta);
          setModalVisivel(true);
        } catch (error) {
          alert(error.message);
        }
      };
      

    const renderFormulario = () => (
        <>
            <TouchableOpacity style={styles.voltar} onPress={() => setTipoPessoa(null)}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.title}>Cadastrar</Text>

            <TextInput
                style={styles.input}
                placeholder="Nome"
                value={nome}
                onChangeText={setNome}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="CPF"
                value={cpf}
                onChangeText={setCpf}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                placeholderTextColor="#aaa"
            />
            <TextInput
                style={styles.input}
                placeholder="Telefone"
                value={telefone}
                onChangeText={setTelefone}
                placeholderTextColor="#aaa"
            />

            <TextInput
                style={styles.inputInterno}
                placeholder="Senha"
                value={senha}
                onChangeText={setSenha}
                placeholderTextColor="#aaa"
                secureTextEntry={!senhaVisivel}
            />
        
            <TextInput
                style={styles.inputInterno}
                placeholder="Repita a senha"
                value={senhaRepetida}
                onChangeText={setSenhaRepetida}
                placeholderTextColor="#aaa"
                secureTextEntry={!senhaRepetidaVisivel}
            />

            <View style={styles.checkboxRow}>
                <Switch
                    value={promocoes}
                    onValueChange={setPromocoes}
                    trackColor={{ false: '#ccc', true: '#000' }}
                    thumbColor={promocoes ? '#fff' : '#fff'}
                />
                <Text style={styles.checkboxLabel}>
                    Eu gostaria de receber novidades e outras informações promocionais.
                </Text>
            </View>

            <Text style={styles.labelSocial}>Cadastrar com:</Text>
            <View style={styles.socialIcons}>
                <TouchableOpacity style={styles.icon}><FontAwesome name="facebook-f" size={18} color="white" /></TouchableOpacity>
                <TouchableOpacity style={styles.icon}><FontAwesome5 name="google" size={18} color="white" /></TouchableOpacity>
                <TouchableOpacity style={styles.icon}><FontAwesome name="instagram" size={18} color="white" /></TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.botaoCadastrar} onPress={handleCadastro}>
                <Text style={styles.botaoCadastrarTexto}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity>
                <Text style={styles.link}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <Modal visible={modalVisivel} transparent animationType="fade">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTexto}>Cadastro concluído com sucesso!</Text>
                        <TouchableOpacity style={styles.botaoOK} onPress={() => router.replace('/')}>
                            <Text style={styles.botaoCadastrarTexto}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </>
    );

    if (!tipoPessoa) {
        return (

            <View style={styles.selectorContainer}>

                <Text style={styles.botaoCadastrarTexto}>Inicialmente o que você pretende?</Text>
                <TouchableOpacity style={styles.selectorButton} onPress={() => setTipoPessoa('queroAdotar')}>
                    <Text style={styles.selectorButtonText}>Quero Adotar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.selectorButton} onPress={() => setTipoPessoa('queroDoar')}>
                    <Text style={styles.selectorButtonText}>Quero Doar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            {modalVisivel ? (
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTexto}>Cadastro concluído com sucesso!</Text>
                        <TouchableOpacity style={styles.botaoOK} onPress={() => router.replace('/')}>
                            <Text style={styles.botaoCadastrarTexto}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                    {renderFormulario()}
                </ScrollView>
            )}
        </KeyboardAvoidingView>
    );


}

const styles = StyleSheet.create({
    selectorContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        borderRadius: 12,
    },
    selectorButton: {
        backgroundColor: '#F6F6F6',
        borderRadius: 50,
        paddingVertical: 12,
        paddingHorizontal: 24,
        width: '100%',
        alignItems: 'center',
        marginVertical: 8,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
    },
    selectorButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scroll: {
        padding: 20,
    },
    voltar: {
        alignSelf: 'flex-start',
        marginBottom: 10,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 20,
        alignSelf: 'center',
    },
    input: {
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
        paddingVertical: 14,
        paddingHorizontal: 16,
        fontSize: 16,
        marginBottom: 16,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        minHeight: 52,

    },

    inputComIcone: {
        flexDirection: 'row',
        backgroundColor: '#F6F6F6',
        borderRadius: 10,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
        height: 52,
    },

    inputInterno: {
        flex: 1,
        fontSize: 16,

    },
    checkboxRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 14,
        flex: 1,
    },
    labelSocial: {
        alignSelf: 'center',
        fontSize: 14,
        marginBottom: 10,
    },
    socialIcons: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 20,
    },
    icon: {
        width: 36,
        height: 36,
        backgroundColor: '#000',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 4,
    },
    botaoCadastrar: {
        width: '100%',
        backgroundColor: '#F6F6F6',
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: 'center',
        marginBottom: 16,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
    },
    botaoCadastrarTexto: {
        fontSize: 18,
        fontWeight: '600',
    },
    link: {
        alignSelf: 'center',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        width: '80%',
    },
    modalTexto: {
        fontSize: 18,
        fontWeight: '500',
        marginBottom: 16,
    },
    botaoOK: {
        backgroundColor: 'white',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 50,
        borderColor: 'black',
        borderWidth: 3,
    },
});

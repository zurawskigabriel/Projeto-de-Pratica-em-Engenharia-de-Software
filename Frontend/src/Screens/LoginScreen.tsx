import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';


export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const router = useRouter();


    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
                <Text style={styles.admin}>Admin</Text>

                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />

                <Text style={styles.title}>Entrar</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Email/CPF/CNPJ"
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                />

                <TextInput
                    style={styles.input}
                    placeholder="Senha"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={senha}
                    onChangeText={setSenha}
                />

                <View style={styles.rowSocial}>
                    <Text style={styles.labelSocial}>Entrar com:</Text>
                    <View style={styles.socialIcons}>
                        <TouchableOpacity style={styles.icon}><FontAwesome name="facebook-f" size={18} color="white" /></TouchableOpacity>
                        <TouchableOpacity style={styles.icon}><FontAwesome5 name="google" size={18} color="white" /></TouchableOpacity>
                        <TouchableOpacity style={styles.icon}><FontAwesome name="instagram" size={18} color="white" /></TouchableOpacity>
                    </View>
                    <TouchableOpacity><Text style={styles.visitante}>Entrar como visitante</Text></TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.botaoEntrar} onPress={() => router.push('/CadastrarPet')}>
                    <Text style={styles.botaoEntrarTexto}>Entrar</Text>
                </TouchableOpacity>


                <View style={styles.linksRow}>
                    <TouchableOpacity><Text style={styles.link}>Esqueceu a senha?</Text></TouchableOpacity>
                    <TouchableOpacity onPress={() => router.push('/Cadastrar')}>
                        <Text style={styles.link}>Cadastrar</Text>
                    </TouchableOpacity>

                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    scroll: {
        alignItems: 'center',
        padding: 20,
    },
    admin: {
        alignSelf: 'flex-end',
        marginRight: 10,
        marginBottom: 5,
        fontSize: 18,
        fontWeight: 'bold',
    },
    logo: {
        width: 120,
        height: 120,
        marginVertical: 12,
        borderRadius: 15,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 20,
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
    rowSocial: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    labelSocial: {
        fontSize: 14,
        marginRight: 10,
    },
    socialIcons: {
        flexDirection: 'row',
        gap: 6,
    },
    icon: {
        width: 36,
        height: 36,
        backgroundColor: '#000',
        borderRadius: 6,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 2,
    },
    visitante: {
        marginLeft: 17,
        fontSize: 15,
        fontWeight: 'bold',
    },
    botaoEntrar: {
        width: '100%',
        backgroundColor: '#F6F6F6',
        paddingVertical: 16,
        borderRadius: 50,
        alignItems: 'center',
        marginBottom: 20,
        borderColor: 'rgba(0, 0, 0, 0.2)',
        borderWidth: 1,
    },
    botaoEntrarTexto: {
        fontSize: 18,
        fontWeight: '600',
    },
    linksRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    link: {
        fontSize: 18,
        fontWeight: 'bold', // ✅ isso sim funciona

    },
});
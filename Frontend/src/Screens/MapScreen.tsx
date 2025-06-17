import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function MenuScreen() {
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.titulo}>Menu</Text>

            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/CadastrarPet')}
            >
                <Text style={styles.botaoTexto}>Cadastrar Pet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/Cadastrar')}
            >
                <Text style={styles.botaoTexto}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/EditarPet')}
            >
                <Text style={styles.botaoTexto}>Editar Pet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/Explorar')}
            >
                <Text style={styles.botaoTexto}>Explorar</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/Favoritos')}
            >
                <Text style={styles.botaoTexto}>Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/Login')}
            >
                <Text style={styles.botaoTexto}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/MeusPets')}
            >
                <Text style={styles.botaoTexto}>Meus Pets</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/PerfilDeUsuario')}
            >
                <Text style={styles.botaoTexto}>Perfil de Usuario</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/PerfilPet')}
            >
                <Text style={styles.botaoTexto}>PerfilPet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/PerfilMatch')}
            >
                <Text style={styles.botaoTexto}>PerfilMatch</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.botao}
                onPress={() => router.push('/Acompanhamento')}
            >
                <Text style={styles.botaoTexto}>Acompanhamento</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    titulo: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center',
    },
    botao: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
    },
    botaoTexto: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

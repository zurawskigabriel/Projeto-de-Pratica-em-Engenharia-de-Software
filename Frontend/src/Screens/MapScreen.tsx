import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'; // Adicionado ScrollView
import { useRouter } from 'expo-router';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../../theme/theme'; // Importar o tema

export default function MenuScreen() { // Renomear para MapScreen ou DebugMenuScreen seria mais claro
    const router = useRouter();

    return (
        <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Menu de Navegação (Debug)</Text>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/CadastrarPet')}
            >
                <Text style={styles.buttonText}>Cadastrar Pet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/Cadastrar')}
            >
                <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/EditarPet')}
            >
                <Text style={styles.buttonText}>Editar Pet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/Explorar')}
            >
                <Text style={styles.buttonText}>Explorar</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/Favoritos')}
            >
                <Text style={styles.buttonText}>Favoritos</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/Login')}
            >
                <Text style={styles.buttonText}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/MeusPets')}
            >
                <Text style={styles.buttonText}>Meus Pets</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/PerfilDeUsuario')}
            >
                <Text style={styles.buttonText}>Perfil de Usuario</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/PerfilPet')}
            >
                <Text style={styles.buttonText}>PerfilPet</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/PerfilMatch')}
            >
                <Text style={styles.buttonText}>PerfilMatch</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/Acompanhamento')}
            >
                <Text style={styles.buttonText}>Acompanhamento</Text>
            </TouchableOpacity>
            {/* Adicionar mais botões aqui se necessário */}
        </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { // Aplicado ao SafeAreaView
        flex: 1,
        backgroundColor: COLORS.background,
    },
    container: { // Aplicado ao ScrollView contentContainerStyle
        flexGrow: 1, // Para o ScrollView ocupar espaço e permitir scroll
        padding: SIZES.spacingRegular,
        // justifyContent: 'center', // Removido para permitir que o conteúdo comece do topo
    },
    title: { // Renomeado de titulo
        fontSize: FONTS.sizeXXLarge,
        fontFamily: FONTS.familyBold,
        color: COLORS.text,
        marginBottom: SIZES.spacingXLarge, // Mais espaço abaixo do título
        textAlign: 'center',
    },
    button: { // Renomeado de botao e estilizado com o tema
        backgroundColor: COLORS.primary,
        paddingVertical: SIZES.spacingMedium,
        borderRadius: SIZES.borderRadiusRegular,
        marginBottom: SIZES.spacingRegular,
        alignItems: 'center',
        ...SHADOWS.light,
        height: SIZES.buttonHeight,
        justifyContent: 'center',
    },
    buttonText: { // Renomeado de botaoTexto
        color: COLORS.white,
        fontSize: FONTS.sizeRegular,
        fontFamily: FONTS.familyBold,
    },
});

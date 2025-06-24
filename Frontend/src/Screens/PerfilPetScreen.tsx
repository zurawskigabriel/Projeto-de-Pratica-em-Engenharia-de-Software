import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  FontAwesome,
  Entypo,
  Feather,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  buscarPet,
  buscarUsuarioPorId,
  deletarPet,
  favoritarPet,
  listarFavoritosDoUsuario,
  desfavoritarPet,
  gerarLinkPet,
  solicitarAdocaoPet,
  buscarSituacaoPet
} from '../api/api';
import theme, { COLORS, FONTS, SIZES, SHADOWS } from '../theme/theme'; // Importar o tema

const { width, height } = Dimensions.get('window'); // Manter por enquanto

export default function PerfilPet() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [pet, setPet] = useState(null);
  const [nomeProtetor, setNomeProtetor] = useState('');
  const [favorito, setFavorito] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('Resumo');
  const [adotando, setAdotando] = useState(false);
  const [meuUsuarioId, setMeuUsuarioId] = useState<number | null>(null);

  useEffect(() => {
    const carregarPet = async () => {
      try {
        const idSalvo = await AsyncStorage.getItem('userId');
        const idUsuarioAtual = idSalvo ? parseInt(idSalvo, 10) : null;
        setMeuUsuarioId(idUsuarioAtual);
  
        if (!id) return;
        const dados = await buscarPet(parseInt(id));
  
        const petNormalizado = {
          ...dados,
          nome: typeof dados.nome === 'string' ? dados.nome : 'Sem nome',
          idade: typeof dados.idade === 'number' ? dados.idade : 0,
          bio: typeof dados.bio === 'string' ? dados.bio : '',
          raca: typeof dados.raca === 'string' ? dados.raca : '',
          porte: typeof dados.porte === 'string' ? dados.porte : '',
          sexo: ['M', 'F'].includes(dados.sexo) ? dados.sexo : 'M',
          especie: typeof dados.especie === 'string' ? dados.especie : '',
          historicoMedico: Array.isArray(dados.historicoMedico) ? dados.historicoMedico : [],
          idUsuario: dados.idUsuario ?? null,
        };
  
        setPet(petNormalizado);
  
        if (petNormalizado.idUsuario) {
          const dono = await buscarUsuarioPorId(petNormalizado.idUsuario);
          setNomeProtetor(dono?.nome ?? '');
        }
  
        if (idUsuarioAtual && petNormalizado?.id) {
          const favoritos = await listarFavoritosDoUsuario(idUsuarioAtual);
          const idsFavoritados = favoritos.map(f => f.idPet);
          if (idsFavoritados.includes(petNormalizado.id)) {
            setFavorito(true);
          }
  
          try {
            const situacoes = await buscarSituacaoPet(petNormalizado.id);
            const jaSolicitou = situacoes.some(
              (s) => s.adotanteId === idUsuarioAtual
            );
            setAdotando(jaSolicitou);
          } catch (error) {
            if (error.message.includes('404')) {
              // Nenhuma solicitação existente — assume que não está adotando
              setAdotando(false);
            } else {
              console.error('Erro ao verificar situação do pet:', error);
            }
          }
          
        }
      } catch (erro) {
        console.error('Erro ao buscar pet, protetor ou situação:', erro);
      }
    };
  
    carregarPet();
  }, [id]);
  

  if (!pet) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Carregando pet...</Text>
      </View>
    );
  }

  function formatarRaca(raca: string): string {
    if (!raca || typeof raca !== 'string' || !raca.trim()) return 'Raça desconhecida';
    if (raca.trim().toUpperCase() === 'SRD') return 'SRD';
    return raca
      .toLowerCase()
      .split(' ')
      .map(palavra => palavra.charAt(0).toUpperCase() + palavra.slice(1))
      .join(' ');
  }
  function formatarIdade(anos: number = 0, meses: number = 0): string {
    if (anos > 1 && meses === 0) return `${anos} anos`;
    if (anos === 1 && meses === 0) return `1 ano`;
    if (anos > 0 && meses > 0) {
      const anoTexto = `${anos} ano${anos > 1 ? 's' : ''}`;
      const mesTexto = `${meses} mês${meses > 1 ? 'es' : ''}`;
      return `${anoTexto} e ${mesTexto}`;
    }
    if (anos === 0 && meses > 0) return `${meses} mês${meses > 1 ? 'es' : ''}`;
    return `${anos} anos ${meses} meses`;
  }

  function InfoItem({ icon, text, lib = 'FontAwesome' }) {
    const IconComponent =
      lib === 'FontAwesome'
        ? FontAwesome
        : lib === 'Feather'
          ? Feather
          : lib === 'Entypo'
            ? Entypo
            : lib === 'MaterialCommunityIcons'
              ? MaterialCommunityIcons
              : FontAwesome;

    return (
      <View style={styles.infoItem}>
        <IconComponent name={icon} size={SIZES.iconSmall} style={styles.infoIcon} />
        <Text style={styles.infoText}>{String(text ?? 'Não informado')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={
            pet.especie?.toLowerCase().includes('cachorro')
              ? require('../../assets/dog.jpg')
              : require('../../assets/cat.jpg')
          }
          style={styles.image}
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.6)']}
          style={styles.imageShadow}
        />
        <TouchableOpacity style={styles.topLeftIcon} onPress={() => router.back()}>
          <Entypo name="chevron-left" size={height * 0.03} color="black" />
        </TouchableOpacity>
        <View style={styles.topRightIconsContainer}>
          <TouchableOpacity
            onPress={async () => {
              if (!meuUsuarioId || !pet?.id) return;
              try {
                if (favorito) {
                  await desfavoritarPet(meuUsuarioId, pet.id);
                  setFavorito(false);
                  Alert.alert('💔 Pet removido dos favoritos!');
                } else {
                  await favoritarPet(meuUsuarioId, pet.id);
                  setFavorito(true);
                  Alert.alert('❤️ Pet adicionado aos favoritos!');
                }
              } catch (error) {
                console.error('Erro ao (des)favoritar:', error);
                Alert.alert('Erro', 'Não foi possível atualizar os favoritos.');
              }
            }}
            style={styles.iconButton}
          >
            <FontAwesome
              name={favorito ? 'heart' : 'heart-o'}
              size={height * 0.03}
              color={favorito ? 'red' : 'black'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={async () => {
              try {
                const link = gerarLinkPet(pet.id)
                await Share.share({
                  message: `Adote o ${pet.nome}! Veja mais detalhes: ${link}`,
                  url: link, // (opcional, melhora compatibilidade em iOS)
                });
              } catch (error) {
                console.error('Erro ao compartilhar:', error);
              }
            }}

            style={styles.iconButton}
          >
            <Entypo name="share" size={height * 0.03} color="black" />
          </TouchableOpacity>
        </View>

        <View style={styles.imageFooter}>
          {/* <View> // View extra removida, petNameContainer já agrupa */}
            <View style={styles.petNameContainer}>
              <Text style={styles.petName}>{pet.nome}</Text>
              <FontAwesome
                name={pet.sexo === 'M' ? 'mars' : 'venus'}
                size={SIZES.hp(3.5)} // Tamanho responsivo para o ícone de sexo
                color={COLORS.white} // Cor branca para o ícone
                style={styles.sexIcon}
              />
            </View>
            <Text style={styles.petDesc}>
              {formatarIdade(pet.idadeAno ?? 0, pet.idadeMes ?? 0)}, {formatarRaca(pet.raca)}
            </Text>
          {/* </View> */}
        </View>
      </View>

      <View style={styles.tabs}>
        {['Resumo', 'Sobre Mim', 'Saúde', 'Histórico'].map(aba => {
          const isAtiva = abaAtiva === aba;
          return (
            <TouchableOpacity
              key={aba}
              onPress={() => setAbaAtiva(aba)}
              style={[styles.tabContainer, isAtiva && styles.activeTab]}
            >
              <Text style={[styles.tabText, isAtiva && styles.activeTabText]}>{aba}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.contentContainer}>
        {abaAtiva === 'Resumo' && (
          <View style={styles.infoCard}>
            <InfoItem icon="calendar" text={formatarIdade(pet.idadeAno ?? 0, pet.idadeMes ?? 0)} />
            <View style={styles.linhaCaderno} />
            <InfoItem icon="dna" text={formatarRaca(pet.raca)} lib="MaterialCommunityIcons" />
            <View style={styles.linhaCaderno} />
            <InfoItem icon="ruler" text={formatarRaca(pet.porte)} lib="Entypo" />
            <View style={styles.linhaCaderno} />
            <InfoItem icon="mars" text={pet.sexo === 'M' ? 'Macho' : 'Fêmea'} />
            <View style={styles.linhaCaderno} />
            {nomeProtetor ? (
              <>
                <InfoItem icon="user" text={`Protetor: ${nomeProtetor}`} />
                {/* <View style={styles.linhaCaderno} /> // Linha extra removida se for o último item */}
              </>
            ) : null}
          </View>
        )}

        {abaAtiva === 'Sobre Mim' && (
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{pet.bio || 'Sem biografia disponível.'}</Text>
          </View>
        )}

        {abaAtiva === 'Saúde' && (
          <View style={styles.infoCard}>
            {(() => {
              const saude = pet.historicoMedico.filter(
                item =>
                  ['ALIMENTACAO', 'TRATAMENTO', 'VACINA'].includes(item.tipo) &&
                  item.descricao?.trim()
              );

              return saude.length > 0 ? (
                saude.map((item, index) => (
                  <Text key={index} style={[styles.infoText, { marginBottom: SIZES.spacingSmall }]}>
                    • {item.descricao}
                  </Text>
                ))
              ) : (
                <Text style={styles.infoText}>Sem informações de saúde.</Text>
              );
            })()}
          </View>
        )}


        {abaAtiva === 'Histórico' && (
          <View style={styles.infoCard}>
            {(() => {
              const historico = pet.historicoMedico.filter(
                item =>
                  ['COMPORTAMENTO', 'RESTRICAO_MOBILIDADE'].includes(item.tipo) &&
                  item.descricao?.trim()
              );

              return historico.length > 0 ? (
                historico.map((item, index) => (
                  <Text key={index} style={[styles.infoText, { marginBottom: SIZES.spacingSmall }]}>
                    • {item.descricao}
                  </Text>
                ))
              ) : (
                <Text style={styles.infoText}>Sem histórico registrado.</Text>
              );
            })()}
          </View>
        )}

      </View>

      {meuUsuarioId === pet.idUsuario ? (
  <>
    <TouchableOpacity
      style={[styles.actionButtonBase, styles.acompanharButton]}
      onPress={() => router.push({ pathname: '/Acompanhamento', params: { id: pet.id } })}
    >
      <Text style={styles.buttonTextBase}>Acompanhar Solicitações</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.actionButtonBase, styles.editarButton]}
      onPress={() => router.push({ pathname: 'EditarPet', params: { id: pet.id } })}
    >
      <Text style={styles.buttonTextBase}>Editar Pet</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.actionButtonBase, styles.excluirButton]}
      onPress={() => {
        Alert.alert(
          'Excluir Pet',
          `Tem certeza que deseja excluir ${pet.nome}?`,
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Sim, excluir',
              style: 'destructive',
              onPress: async () => {
                try {
                  await deletarPet(pet.id);
                  Alert.alert('Pet excluído com sucesso!');
                  router.replace('/MeusPets');
                } catch (err) {
                  Alert.alert('Erro', 'Não foi possível excluir o pet.');
                }
              },
            },
          ]
        );
      }}
    >
      <Text style={styles.buttonTextBase}>Excluir Pet</Text>
    </TouchableOpacity>
  </>
) : (
  <>
    {adotando && ( // Se o usuário já está no processo de adotar este pet, mostra "Acompanhar"
      <TouchableOpacity
        style={[styles.actionButtonBase, styles.acompanharButton]}
        onPress={() => router.push({ pathname: '/Acompanhamento', params: { id: pet.id } })}
      >
        <Text style={styles.buttonTextBase}>Acompanhar Adoção</Text>
      </TouchableOpacity>
    )}

    <TouchableOpacity
      style={[styles.actionButtonBase, adotando ? styles.adotarButtonActive : styles.adotarButton]}
      onPress={async () => {
        if (!pet?.id || !meuUsuarioId) return;

        if (adotando) { // Lógica para cancelar solicitação (se desejado, ou apenas visual)
          // Aqui poderia ter uma chamada para cancelar a solicitação na API se existir
          Alert.alert('Processo de Adoção', `Você já está no processo de adoção de ${pet.nome}. Acompanhe o status!`);
          // setAdotando(false); // Remover se não houver cancelamento real
          return;
        }

        try {
          await solicitarAdocaoPet(pet.id, meuUsuarioId);
          Alert.alert('Adoção Solicitada! 😁', `${pet.nome} e o protetor foram notificados! Você pode acompanhar o status.`);
          setAdotando(true); // Atualiza o estado para refletir a solicitação
        } catch (error) {
          console.error(error);
          Alert.alert('Erro', 'Não foi possível solicitar a adoção. Verifique se já não há uma solicitação pendente.');
        }
      }}
    >
      <Text style={styles.buttonTextBase}>
        {adotando ? 'Solicitação Enviada' : 'Quero Adotar!'}
      </Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={[styles.actionButtonBase, styles.contatarButton]}
      onPress={() => {
        const numeroWhatsApp = nomeProtetor && pet.idUsuario ? 'NUMERO_DO_PROTETOR_AQUI' : '5555996168060'; // Idealmente buscar o telefone do protetor
        const mensagem = `Olá, ${nomeProtetor || 'protetor(a)'}! Tenho interesse no pet ${pet.nome} (ID: ${pet.id}) que vi no Me Adota.`;
        const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
        Linking.openURL(url).catch(err => Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Verifique se está instalado.'));
      }}
    >
      <Text style={styles.buttonTextBase}>Contatar Protetor</Text>
    </TouchableOpacity>
  </>
)}


      <View style={{ height: SIZES.hp(3) }} />
    </ScrollView>
  );
}

function InfoItem({ icon, text, lib = 'FontAwesome' }) {
  const IconComponent =
    lib === 'FontAwesome'
      ? FontAwesome
      : lib === 'Feather'
        ? Feather
        : lib === 'Entypo'
          ? Entypo
          : lib === 'MaterialCommunityIcons'
            ? MaterialCommunityIcons
            : FontAwesome;

  return (
    <View style={styles.infoItem}>
      <IconComponent name={icon} size={16} color="#000" />
      <Text style={styles.infoText}>{String(text ?? '')}</Text>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1, // Para garantir que o ScrollView ocupe a tela
    backgroundColor: COLORS.background, // Fundo geral da tela
  },
  imageContainer: {
    position: 'relative', // Para posicionamento absoluto dos ícones e footer da imagem
  },
  image: {
    width: '100%',
    height: SIZES.hp(50), // 50% da altura da tela
    borderBottomLeftRadius: SIZES.borderRadiusLarge, // Bordas arredondadas na parte inferior
    borderBottomRightRadius: SIZES.borderRadiusLarge,
  },
  imageShadow: { // Gradiente sobre a imagem
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SIZES.hp(30), // Altura do gradiente
    borderBottomLeftRadius: SIZES.borderRadiusLarge,
    borderBottomRightRadius: SIZES.borderRadiusLarge,
  },
  // Ícones no Header da Imagem
  topLeftIcon: { // Botão de voltar
    position: 'absolute',
    top: SIZES.hp(5), // Mais espaço do topo (considerar SafeArea)
    left: SIZES.wp(4),
    padding: SIZES.spacingSmall,
    borderRadius: SIZES.borderRadiusCircle,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Fundo semi-transparente
    ...SHADOWS.regular,
  },
  topRightIconsContainer: {
    position: 'absolute',
    top: SIZES.hp(5),
    right: SIZES.wp(4),
    flexDirection: 'row',
    gap: SIZES.spacingRegular,
  },
  iconButton: { // Para botões de favoritar e compartilhar
    padding: SIZES.spacingSmall,
    borderRadius: SIZES.borderRadiusCircle,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    ...SHADOWS.regular,
  },
  // Footer da Imagem (Nome do Pet, etc.)
  imageFooter: {
    position: 'absolute',
    bottom: SIZES.hp(2),
    left: SIZES.wp(4),
    right: SIZES.wp(4),
    // flexDirection: 'row', // Removido para permitir que o nome e a descrição fiquem empilhados
    // justifyContent: 'space-between',
    // alignItems: 'flex-end',
  },
  petNameContainer: { // Novo container para nome e ícone de sexo
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacingTiny,
  },
  petName: {
    fontSize: FONTS.sizeXXLarge, // Nome do pet bem grande
    fontFamily: FONTS.familyBold,
    color: COLORS.white,
    // fontWeight: 'bold', // Já coberto por fontFamilyBold
  },
  sexIcon: { // Estilo para o ícone de sexo ao lado do nome
    marginLeft: SIZES.spacingSmall,
    // color: COLORS.white, // Definido inline
  },
  petDesc: { // Para idade e raça abaixo do nome
    fontSize: FONTS.sizeLarge,
    fontFamily: FONTS.familyRegular,
    color: COLORS.white,
  },
  // Abas de Navegação (Resumo, Sobre Mim, etc.)
  tabs: {
    marginTop: SIZES.spacingRegular,
    flexDirection: 'row',
    // justifyContent: 'space-between', // Removido para permitir que as abas tenham largura flexível
    alignSelf: 'stretch', // Para ocupar a largura disponível se necessário
    marginHorizontal: SIZES.wp(4), // Margens laterais para as abas
  },
  tabContainer: {
    flex: 1, // Distribui o espaço igualmente entre as abas
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.spacingRegular,
    paddingHorizontal: SIZES.spacingSmall, // Menos padding horizontal para mais abas
    borderTopLeftRadius: SIZES.borderRadiusRegular,
    borderTopRightRadius: SIZES.borderRadiusRegular,
    backgroundColor: COLORS.cardBackground,
    borderWidth: SIZES.borderWidth,
    borderColor: COLORS.borderColorLight, // Borda mais sutil
    // maxHeight: SIZES.hp(5), // Altura responsiva para as abas // Removido maxHeight, padding controla altura
  },
  activeTab: {
    backgroundColor: COLORS.light, // Fundo da aba ativa
    borderColor: COLORS.borderColor, // Borda mais forte para aba ativa
    borderBottomWidth: 0, // Remove a borda inferior da aba ativa
    // fontWeight: '500', // Aplicar fontFamilyBold no Text diretamente
  },
  tabText: { // Renomeado de 'tab' para 'tabText'
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    fontFamily: FONTS.familyBold,
    color: COLORS.primary, // Cor primária para texto da aba ativa
  },
  // Conteúdo das Abas
  contentContainer: { // Container para o conteúdo abaixo das abas
    paddingHorizontal: SIZES.wp(2), // Padding geral para o conteúdo das abas
    // marginTop: 0, // Já tratado pelo layout
    // borderRadius: SIZES.borderRadiusMedium, // Não necessário aqui
    // justifyContent: 'center', // Não necessário aqui
  },
  infoCard: {
    marginHorizontal: SIZES.wp(2), // Mantido
    marginTop: SIZES.spacingTiny, // Pequena margem acima do card de info
    padding: SIZES.spacingMedium, // Padding interno do card
    borderWidth: SIZES.borderWidth,
    borderRadius: SIZES.borderRadiusMedium, // Bordas arredondadas consistentes
    backgroundColor: COLORS.cardBackground, // Fundo do card
    ...SHADOWS.light, // Sombra leve
    marginBottom: SIZES.spacingRegular,
    borderColor: COLORS.borderColor,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SIZES.spacingSmall, // Espaçamento vertical para itens de info
  },
  infoText: {
    marginLeft: SIZES.spacingRegular, // Maior margem para o texto do ícone
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.text,
    flexShrink: 1, // Permite que o texto quebre a linha se for muito longo
  },
  infoIcon: { // Estilo para os ícones dentro de InfoItem
     color: COLORS.primary, // Cor primária para ícones de informação
  },
  linhaCaderno: { // Divisor entre itens de informação
    height: SIZES.borderWidthThin,
    backgroundColor: COLORS.borderColorLight,
    marginVertical: SIZES.spacingTiny, // Espaço vertical menor para a linha
    // marginHorizontal: 0, // Não necessário se o card já tem padding
    opacity: 0.8,
  },
  // Botões de Ação (Adotar, Contatar, Excluir, etc.)
  actionButtonBase: { // Estilo base para todos os botões de ação
    marginHorizontal: SIZES.wp(4), // Margens laterais consistentes
    borderRadius: SIZES.borderRadiusCircle, // Botões bem arredondados
    paddingVertical: SIZES.spacingMedium,
    alignItems: 'center',
    justifyContent: 'center', // Centraliza o texto do botão
    marginBottom: SIZES.spacingRegular,
    height: SIZES.buttonHeight, // Altura padronizada
    ...SHADOWS.regular,
  },
  buttonTextBase: { // Estilo base para o texto dos botões
    fontSize: FONTS.sizeMedium,
    fontFamily: FONTS.familyBold,
    color: COLORS.white,
  },
  // Botões específicos
  adotarButton: {
    backgroundColor: COLORS.primary,
  },
  adotarButtonActive: { // Quando "Cancelar Adoção"
    backgroundColor: COLORS.warning, // Laranja/Amarelo para cancelar
  },
  acompanharButton: { // Novo estilo para o botão "Acompanhar"
    backgroundColor: COLORS.info, // Ciano/Azul claro
  },
  editarButton: {
    backgroundColor: COLORS.secondary, // Cinza para editar
  },
  excluirButton: {
    backgroundColor: COLORS.danger, // Vermelho para excluir
  },
  contatarButton: {
    backgroundColor: COLORS.success, // Verde para contatar
  },
  // Loading state (se houver)
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.spacingRegular,
    fontSize: FONTS.sizeRegular,
    fontFamily: FONTS.familyRegular,
    color: COLORS.textSecondary,
  }
});

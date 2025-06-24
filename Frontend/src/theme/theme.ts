import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Guideline base width, A common guideline base width is 375 (iPhone 6/7/8 size)
// const guidelineBaseWidth = 375;
// const scale = (size: number) => (width / guidelineBaseWidth) * size;
// const moderateScale = (size: number, factor = 0.5) => size + (scale(size) - size) * factor;

// Simpler scaling for now, can be refined with PixelRatio or moderateScale if needed.
const wp = (percentage: number) => (width * percentage) / 100;
const hp = (percentage: number) => (height * percentage) / 100;

export const COLORS = {
  primary: '#007bff', // Azul principal para botões, links, ícones ativos
  secondary: '#6c757d', // Cinza para texto secundário, bordas sutis
  success: '#28a745', // Verde para ações de sucesso, confirmação
  danger: '#dc3545', // Vermelho para ações de erro, exclusão
  warning: '#ffc107', // Amarelo/Laranja para alertas, pendências
  info: '#17a2b8', // Azul claro/Ciano para informações, badges

  light: '#f8f9fa', // Cinza muito claro, quase branco, para fundos sutis
  dark: '#343a40', // Cinza escuro, quase preto, para texto forte ou fundos escuros

  white: '#ffffff',
  black: '#000000',

  text: '#212529', // Cor principal de texto
  textSecondary: '#6c757d', // Texto secundário, placeholders
  textLight: '#495057',

  background: '#f4f6f8', // Fundo geral das telas (um cinza muito claro)
  cardBackground: '#ffffff', // Fundo de cards, modais

  borderColor: '#dee2e6', // Cor padrão para bordas
  borderColorLight: '#efefef',

  // Cores específicas da aplicação (exemplos, podem ser ajustadas)
  petCardShadow: 'rgba(0,0,0,0.1)',
  buttonDisabledBackground: '#ced4da',
  buttonDisabledText: '#6c757d',

  // Cores de status (já usadas)
  statusPendente: '#f39c12', // Laranja
  statusAceita: '#2ecc71',   // Verde
  statusRecusada: '#e74c3c', // Vermelho
};

export const FONTS = {
  familyRegular: 'Afacad_400Regular',
  familyBold: 'Afacad_700Bold',

  sizeXXSmall: wp(2.8), // ~10-11px
  sizeXSmall: wp(3.2),  // ~12-13px
  sizeSmall: wp(3.7),   // ~14px
  sizeRegular: wp(4.2), // ~16px
  sizeMedium: wp(4.8),  // ~18px
  sizeLarge: wp(5.3),   // ~20px
  sizeXLarge: wp(6.4),  // ~24px
  sizeXXLarge: wp(7.5), // ~28px

  // Baseado em valores fixos se preferir não escalar tudo
  // staticSizeSmall: 12,
  // staticSizeRegular: 14,
  // staticSizeMedium: 16,
  // staticSizeLarge: 18,
  // staticSizeTitle: 24,
};

export const SIZES = {
  // Baseado em porcentagem da largura/altura da tela
  wp, // width percentage
  hp, // height percentage

  // Radii
  borderRadiusSmall: 4,
  borderRadiusRegular: 8,
  borderRadiusMedium: 12,
  borderRadiusLarge: 16,
  borderRadiusXLarge: 20,
  borderRadiusCircle: 999, // Para botões circulares, etc.

  // Bordas
  borderWidth: 1,
  borderWidthThin: 0.5,

  // Espaçamento (padding, margin)
  spacingMicro: wp(1),    // ~4px
  spacingTiny: wp(1.5),   // ~6px
  spacingSmall: wp(2.5),  // ~8-10px
  spacingRegular: wp(3.5),// ~12-14px
  spacingMedium: wp(4.5), // ~16-18px
  spacingLarge: wp(6),    // ~22-24px
  spacingXLarge: wp(8),   // ~30px

  // Icon sizes
  iconSmall: wp(4.5), // ~18px
  iconMedium: wp(6),  // ~24px
  iconLarge: wp(8),   // ~30px

  // Altura de elementos comuns
  inputHeight: hp(6), // Altura padrão para inputs
  buttonHeight: hp(6), // Altura padrão para botões
  headerHeight: hp(8), // Altura para cabeçalhos de tela
};

export const SHADOWS = {
  light: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  regular: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  strong: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
};

const theme = {
  COLORS,
  FONTS,
  SIZES,
  SHADOWS,
};

export default theme;

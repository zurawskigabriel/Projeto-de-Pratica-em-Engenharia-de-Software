import { Text, TextInput, StyleProp, TextStyle } from 'react-native';

const getFontFamily = (style: StyleProp<TextStyle>): string => {
  const flatten = Array.isArray(style) ? Object.assign({}, ...style) : style;

  const weight = flatten?.fontWeight || 'normal';

  if (weight === 'bold' || weight === '700') return 'Afacad_700Bold';
  return 'Afacad_400Regular';
};

export function overrideTextFont(defaultFont: string) {
  const oldTextRender = Text.render;
  Text.render = function (...args) {
    const origin = oldTextRender.call(this, ...args);
    const originalStyle = origin.props?.style;

    return {
      ...origin,
      props: {
        ...origin.props,
        style: [
          { fontFamily: getFontFamily(originalStyle) || defaultFont },
          originalStyle,
        ],
      },
    };
  };

  const oldInputRender = TextInput.render;
  TextInput.render = function (...args) {
    const origin = oldInputRender.call(this, ...args);
    const originalStyle = origin.props?.style;

    return {
      ...origin,
      props: {
        ...origin.props,
        style: [
          { fontFamily: getFontFamily(originalStyle) || defaultFont },
          originalStyle,
        ],
      },
    };
  };
}

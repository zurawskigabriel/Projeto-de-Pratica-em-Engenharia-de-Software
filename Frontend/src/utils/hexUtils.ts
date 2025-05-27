// src/utils/hexUtils.ts
import { Buffer } from 'buffer';

/**
 * Converte uma string hexadecimal com prefixo 'X' e sufixo ''' (formato H2 BLOB) para Base64.
 * Exemplo de entrada: "X'FFD8FFE0...'"
 * @param hexWithPrefix A string hexadecimal com prefixo e sufixo.
 * @returns A string Base64 ou null se a entrada for inválida ou a conversão falhar.
 */
export function hexWithPrefixToBase64(hexWithPrefix: string | null | undefined): string | null {
  if (!hexWithPrefix || typeof hexWithPrefix !== 'string') {
    return null;
  }

  let pureHex = hexWithPrefix.trim();

  // 1. Remover o prefixo "X'" e o sufixo "'"
  if (pureHex.toUpperCase().startsWith("X'") && pureHex.endsWith("'")) {
    pureHex = pureHex.substring(2, pureHex.length - 1);
  } else {
    // Se não estiver no formato esperado "X'...'".
    // Pode ser que, em alguns casos, a API envie apenas o hexadecimal puro.
    // Se for esse o caso, você pode remover este 'else' ou adaptar a lógica.
    // Por ora, se não tiver o prefixo/sufixo, consideramos inválido para esta função específica.
    console.warn(`Formato hexadecimal esperado "X'...' não encontrado para: ${hexWithPrefix}`);
    // Se a string já for hexadecimal pura (sem X''), você pode tentar converter direto,
    // mas esta função é específica para o formato "X'...'".
    // Se for um hexadecimal puro, a verificação abaixo de caracteres não hexadecimais
    // e comprimento par ainda será útil.
    // return null; // Ou tentar processar como hex puro se essa for uma possibilidade
  }

  // Verificar se a string resultante contém apenas caracteres hexadecimais válidos
  if (!/^[0-9A-Fa-f]*$/i.test(pureHex)) {
    console.warn(`String contém caracteres não hexadecimais: ${pureHex}`);
    return null;
  }

  // Strings hexadecimais devem ter um comprimento par
  if (pureHex.length % 2 !== 0) {
    console.warn(`Comprimento ímpar da string hexadecimal não é válido: ${pureHex}`);
    return null;
  }

  if (!pureHex.length) {
    return null;
  }

  try {
    // 2. Converter a string hexadecimal pura para Base64
    return Buffer.from(pureHex, 'hex').toString('base64');
  } catch (error) {
    console.error('Erro ao converter hexadecimal para Base64:', error, 'Input Hex (após trim):', pureHex);
    return null;
  }
}
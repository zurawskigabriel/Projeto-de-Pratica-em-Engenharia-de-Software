package com.timebravo.match;

import java.io.IOException;
import java.util.Map;

import okhttp3.*;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

public class ChatGptClient {
    // Endpoint da OpenAI
    private static final String API_URL = "https://api.openai.com/v1/chat/completions";

    private final String apiKey = "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";
    private final OkHttpClient httpClient = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    /**
     * Monta e envia a requisição para o ChatGPT, pedindo que retorne APENAS
     * um JSON com {"score":<0.0–1.0>,"explanation":"texto"}.
     * Se der certo, devolve score*100; senão lança IOException.
     */
    public double calcularCompatibilidade(String prompt) throws IOException {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("sk-VOCÊ")) {
            throw new IllegalStateException("Você precisa substituir apiKey pela sua chave real.");
        }

        MediaType JSON = MediaType.parse("application/json; charset=utf-8");
        String requestBodyJson = mapper.writeValueAsString(Map.of(
            "model", "gpt-3.5-turbo",
            "messages", new Object[] {
                Map.of("role", "system",
                    "content", "Você é um assistente que retorna APENAS um valor numérico de compatibilidade entre 0.0 e 1.0, sem texto adicional."),
                Map.of("role", "user", "content", prompt)
            },
            "temperature", 0.0
        ));

        RequestBody body = RequestBody.create(requestBodyJson, JSON);
        Request request = new Request.Builder()
            .url(API_URL)
            .addHeader("Authorization", "Bearer " + apiKey)
            .post(body)
            .build();

        try (Response response = httpClient.newCall(request).execute()) {
            int status = response.code();
            ResponseBody respBody = response.body();
            String corpo = respBody != null ? respBody.string() : "";
            System.err.println("HTTP Status: " + status);
            System.err.println("Corpo da resposta: " + corpo);

            if (!response.isSuccessful()) {
                throw new IOException("Erro da OpenAI (HTTP " +
                                    status + "): " + corpo);
            }

            // parse apenas uma vez
            JsonNode raiz = mapper.readTree(corpo);
            String content = raiz
                .path("choices").get(0)
                .path("message").path("content")
                .asText().trim();

            double scoreRaw = Double.parseDouble(content);
            return scoreRaw * 100.0;
        }
    }
}
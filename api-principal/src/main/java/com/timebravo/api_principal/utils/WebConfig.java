package com.timebravo.api_principal.utils;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Aplica CORS para todos os endpoints sob /api
            .allowedOrigins(
                "http://localhost:8081", // Para Expo Web/React Native Web em desenvolvimento
                "http://localhost:19000", // Porta comum do Metro Bundler
                "http://localhost:19001", // Outra porta comum do Expo
                "http://localhost:19002", // Outra porta comum do Expo
                // Para desenvolvimento no Expo Go, você pode precisar adicionar o IP da sua máquina
                // ex: "http://192.168.X.X:8081" (substitua 192.168.X.X pelo IP da sua máquina na rede local)
                // Para produção, especifique os domínios do seu frontend.
                // Para testes iniciais, pode-se usar "*" mas não é recomendado para produção.
                "*" // PERMITE TODAS AS ORIGENS - USE APENAS PARA TESTES INICIAIS
            )
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*") // Permite todos os cabeçalhos
            .allowCredentials(false); // Mude para true se você estiver usando cookies/sessões (não comum com JWT)
    }
}
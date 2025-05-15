package com.timebravo.api_principal.config;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import javax.crypto.spec.SecretKeySpec;
import java.util.Date;

public class JwtUtil {
    private static final long EXPIRATION_MS = 3600_000;

    public static String generateToken(String username, Long userId, String secret) {
        SecretKeySpec keySpec = new SecretKeySpec(secret.getBytes(), SignatureAlgorithm.HS256.getJcaName());

        return Jwts.builder()
            .setSubject(username)
            .claim("userId", userId)
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_MS))
            .signWith(keySpec, SignatureAlgorithm.HS256)
            .compact();
    }
}
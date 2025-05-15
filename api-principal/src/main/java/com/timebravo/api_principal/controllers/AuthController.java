package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.config.JwtUtil;
import com.timebravo.api_principal.dtos.CredenciaisDTO;
import com.timebravo.api_principal.services.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.timebravo.api_principal.entities.Usuario;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final UsuarioService usuarioService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String,String>> login(@RequestBody CredenciaisDTO creds) {
        if (!usuarioService.validarCredenciais(creds.getUsername(), creds.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Usuario usuario = this.usuarioService.findUserByEmail(creds.getUsername());
        
        if (usuario != null) {
            String token = JwtUtil.generateToken(creds.getUsername(), usuario.getId(), jwtSecret);
            return ResponseEntity.ok(Map.of("token", token));
        }

        return ResponseEntity
            .status(HttpStatus.FORBIDDEN)
            .body(Map.of("message", "Ocorreu algum erro. Não foi possível efetuar o login"));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.noContent().build();
    }
}

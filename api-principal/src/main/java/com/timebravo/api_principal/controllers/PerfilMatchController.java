package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.dtos.PerfilMatchDTO;
import com.timebravo.api_principal.services.PerfilMatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/perfil-match")
public class PerfilMatchController {

    private final PerfilMatchService perfilMatchService;

    @Autowired
    public PerfilMatchController(PerfilMatchService perfilMatchService) {
        this.perfilMatchService = perfilMatchService;
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilMatchDTO> getPerfilByUsuarioId(@PathVariable Long usuarioId) {
        PerfilMatchDTO perfil = perfilMatchService.buscarPerfilPorUsuarioId(usuarioId);
        return ResponseEntity.ok(perfil);
    }

    @PutMapping("/usuario/{usuarioId}")
    public ResponseEntity<PerfilMatchDTO> createOrUpdatePerfil(
            @PathVariable Long usuarioId,
            @RequestBody PerfilMatchDTO perfilMatchDTO) {
        PerfilMatchDTO perfilSalvo = perfilMatchService.criarOuAtualizarPerfil(usuarioId, perfilMatchDTO);
        return ResponseEntity.ok(perfilSalvo);
    }

    @DeleteMapping("/usuario/{usuarioId}")
    public ResponseEntity<Map<String, String>> deletePerfil(@PathVariable Long usuarioId) {
        perfilMatchService.deletarPerfil(usuarioId);
        return ResponseEntity.ok(Map.of("message", "Perfil de match deletado com sucesso."));
    }
}
package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.dtos.AdocaoDTO;
import com.timebravo.api_principal.services.AdocaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/adocoes")
public class AdocaoController {

    @Autowired
    private AdocaoService adocaoService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<AdocaoDTO> atualizarStatus(@PathVariable Long id, @RequestBody @Valid AdocaoDTO dto) {
        AdocaoDTO atualizado = adocaoService.atualizarStatus(id, dto);

        return ResponseEntity.ok(atualizado);
    }
}

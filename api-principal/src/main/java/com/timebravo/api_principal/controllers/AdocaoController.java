package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.dtos.AdocaoDTO;
import com.timebravo.api_principal.services.AdocaoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/adocoes")
public class AdocaoController {

    @Autowired
    private AdocaoService adocaoService;

    @GetMapping("/{idPet}")
    public ResponseEntity<List<AdocaoDTO>> getAdocaoByIdPet(@PathVariable  Long idPet) {
        List<AdocaoDTO> listaAdocoes = this.adocaoService.getAdocaoByIdPet(idPet);

        if (listaAdocoes.size() == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(listaAdocoes);
    }

    @PatchMapping("/status")
    public ResponseEntity<AdocaoDTO> atualizarStatus(@RequestBody @Valid AdocaoDTO dto) {
        AdocaoDTO atualizado = adocaoService.atualizarStatus(dto.getIdPet(), dto);

        return ResponseEntity.ok(atualizado);
    }
}

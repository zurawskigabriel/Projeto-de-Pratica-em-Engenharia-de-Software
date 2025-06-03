package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.dtos.HistoricoMedicoDTO;
import com.timebravo.api_principal.utils.AuthUtil;
import com.timebravo.api_principal.services.HistoricoMedicoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pets/historico-medico")
public class HistoricoMedicoController {

    private final HistoricoMedicoService historicoMedicoService;
    private final AuthUtil authUtil;

    @Autowired
    public HistoricoMedicoController(HistoricoMedicoService historicoMedicoService, AuthUtil authUtil) {
        this.historicoMedicoService = historicoMedicoService;
        this.authUtil = authUtil;
    }

    @PostMapping
    public ResponseEntity<HistoricoMedicoDTO> criarHistoricoMedico(@Valid @RequestBody HistoricoMedicoDTO historicoMedicoDTO) {
        HistoricoMedicoDTO novoHistorico = historicoMedicoService.criarHistoricoMedico(historicoMedicoDTO);
        return new ResponseEntity<>(novoHistorico, HttpStatus.CREATED);
    }

}
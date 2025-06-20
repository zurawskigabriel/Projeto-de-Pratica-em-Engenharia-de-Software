package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.dtos.SolicitacaoAdocaoDTO;
import com.timebravo.api_principal.services.SolicitacaoAdocaoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitacoes-adocao")
public class SolicitacaoAdocaoController {

    @Autowired
    private SolicitacaoAdocaoService solicitacaoAdocaoService;

    @PostMapping("/adotante")
    public ResponseEntity<SolicitacaoAdocaoDTO> criarSolicitacao(@RequestBody SolicitacaoAdocaoDTO dto) {
        SolicitacaoAdocaoDTO criada = solicitacaoAdocaoService.criarSolicitacao(dto);
        return ResponseEntity.status(HttpStatus.CREATED).build(); 
    }

    @PutMapping("/{id}/situacao")
    public ResponseEntity<SolicitacaoAdocaoDTO> atualizarSituacao(
            @PathVariable Long id,
            @RequestBody SolicitacaoAdocaoDTO novaSituacao) {
        
        SolicitacaoAdocaoDTO atualizada = solicitacaoAdocaoService.atualizarSituacao(id, novaSituacao.getSituacao());
        return ResponseEntity.status(HttpStatus.OK).build(); 
    }

    @GetMapping("/pet/{idPet}/situacao")
    public ResponseEntity<List<SolicitacaoAdocaoDTO>> buscarPorIdPet(@PathVariable Long idPet) {
        List<SolicitacaoAdocaoDTO> listaSolicitacoes = solicitacaoAdocaoService.buscarPorIdPet(idPet);
        if (listaSolicitacoes.size() == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(listaSolicitacoes);
    }

    @GetMapping("/adotante/{id}")
    public ResponseEntity<List<SolicitacaoAdocaoDTO>> buscarPorIdAdotante(@PathVariable Long id) {
        List<SolicitacaoAdocaoDTO> lista = solicitacaoAdocaoService.buscarPorIdAdotante(id);
        if (lista.size() == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(lista);
    }

    @GetMapping("/protetor/{id}")
    public ResponseEntity<List<SolicitacaoAdocaoDTO>> buscarPorIdProtetor(@PathVariable Long id) {
        List<SolicitacaoAdocaoDTO> listaSolicitacoes = solicitacaoAdocaoService.buscarPorIdProtetor(id);
        if (listaSolicitacoes.size() == 0) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(listaSolicitacoes);
    }
}

package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.SolicitacaoAdocaoDTO;
import com.timebravo.api_principal.mappers.SolicitacaoAdocaoMapper;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.SolicitacaoAdocao;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.repositories.PetRepository;
import com.timebravo.api_principal.repositories.SolicitacaoAdocaoRepository;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SolicitacaoAdocaoService {

    @Autowired
    private SolicitacaoAdocaoRepository solicitacaoAdocaoRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PetRepository petRepository;

   public SolicitacaoAdocaoDTO criarSolicitacao(SolicitacaoAdocaoDTO dto) {
        Pet pet = petRepository.findById(dto.getIdPet())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pet com ID " + dto.getIdPet() + " não encontrado"));

        Usuario adotante = usuarioRepository.findById(dto.getIdAdotante())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário com ID " + dto.getIdAdotante() + " não encontrado"));

        Usuario protetor = pet.getUsuario();

        SolicitacaoAdocao entity = new SolicitacaoAdocao();
        entity.setPet(pet);
        entity.setAdotante(adotante);
        entity.setProtetor(protetor);
        entity.setSituacao("Pendente");

        solicitacaoAdocaoRepository.save(entity);
        return SolicitacaoAdocaoMapper.toDTO(entity);
    }

    public SolicitacaoAdocaoDTO atualizarSituacao(Long idSolicitacao, String novaSituacao) {
        SolicitacaoAdocao solicitacao = solicitacaoAdocaoRepository.findById(idSolicitacao)
            .orElseThrow(() -> new RuntimeException("Solicitação não encontrada"));

        if (!novaSituacao.equalsIgnoreCase("Aceita") && !novaSituacao.equalsIgnoreCase("Recusada") && !novaSituacao.equalsIgnoreCase("Pendente")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Situação inválida");
        }

        solicitacao.setSituacao(novaSituacao);
        solicitacaoAdocaoRepository.save(solicitacao);

        return SolicitacaoAdocaoMapper.toDTO(solicitacao);
    }


    public List<SolicitacaoAdocaoDTO> buscarPorIdAdotante(Long id) {
        return solicitacaoAdocaoRepository.findByAdotanteId(id)
                .stream()
                .map(SolicitacaoAdocaoMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<SolicitacaoAdocaoDTO> buscarPorIdProtetor(Long id) {
        return solicitacaoAdocaoRepository.findByProtetorId(id)
                .stream()
                .map(SolicitacaoAdocaoMapper::toDTO)
                .collect(Collectors.toList());
    }
}

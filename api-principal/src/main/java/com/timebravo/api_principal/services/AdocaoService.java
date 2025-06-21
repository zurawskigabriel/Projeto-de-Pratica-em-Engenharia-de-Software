package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.AdocaoDTO;
import com.timebravo.api_principal.entities.Adocao;

import com.timebravo.api_principal.entities.SolicitacaoAdocao;
import com.timebravo.api_principal.mappers.AdocaoMapper;
import com.timebravo.api_principal.repositories.AdocaoRepository;
import com.timebravo.api_principal.repositories.PetRepository;
import com.timebravo.api_principal.repositories.SolicitacaoAdocaoRepository;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AdocaoService {

    @Autowired
    private AdocaoRepository adocaoRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private SolicitacaoAdocaoRepository solicitacaoAdocaoRepository;

    public List<AdocaoDTO> getAdocaoByIdPet(Long idPet) {
        return adocaoRepository.findByPetId(idPet)
                .stream()
                .map(AdocaoMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public AdocaoDTO atualizarStatus(Long idAdocao, AdocaoDTO dto) {
        Adocao adocao = adocaoRepository.findById(idAdocao)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Adoção não encontrada"));

        adocao.setStatus(dto.getStatus());
        adocaoRepository.save(adocao);

        if ("Adotado".equalsIgnoreCase(adocao.getStatus().toString())) {
            Long idPet = adocao.getPet().getId();
            Long idAdotante = dto.getIdAdotante();
            Long idProtetor = adocao.getProtetor().getId();

            Optional<SolicitacaoAdocao> solicitacaoOpt =
                    solicitacaoAdocaoRepository.findByPetIdAndAdotanteIdAndProtetorId(idPet, idAdotante, idProtetor);

            if (solicitacaoOpt.isPresent()) {
                SolicitacaoAdocao solicitacao = solicitacaoOpt.get();
                solicitacao.setSituacao("Aceita");
                solicitacaoAdocaoRepository.save(solicitacao);
            }
        }

        return dto;
    }
}

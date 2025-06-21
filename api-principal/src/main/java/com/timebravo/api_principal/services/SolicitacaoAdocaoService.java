package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.SolicitacaoAdocaoDTO;
import com.timebravo.api_principal.entities.Adocao;
import com.timebravo.api_principal.mappers.SolicitacaoAdocaoMapper;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.SolicitacaoAdocao;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.repositories.PetRepository;
import com.timebravo.api_principal.repositories.SolicitacaoAdocaoRepository;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import com.timebravo.api_principal.repositories.AdocaoRepository;
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

    @Autowired
    private AdocaoRepository adocaoRepository;

   public SolicitacaoAdocaoDTO criarSolicitacao(SolicitacaoAdocaoDTO dto) {
        Pet pet = petRepository.findById(dto.getIdPet())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pet com ID " + dto.getIdPet() + " não encontrado"));

        Usuario adotante = usuarioRepository.findById(dto.getIdAdotante())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário com ID " + dto.getIdAdotante() + " não encontrado"));

        List<SolicitacaoAdocao> solicitacaoDoUsuarioAdotante =
                this.solicitacaoAdocaoRepository.findByAdotanteId(adotante.getId());

        // se usuário ja tem solicitação de adoção não deixa ele solicitar outra (se tiver ACEITA/PENDENTE), se tiver em recusada então pode
       for (SolicitacaoAdocao solicitacao : solicitacaoDoUsuarioAdotante) {
           if (solicitacao.getSituacao().equalsIgnoreCase("ACEITA") || solicitacao.getSituacao().equalsIgnoreCase("PENDENTE")) {
               throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Usuário já possui uma solicitação de adoção!");
           }
       }

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

        if (novaSituacao.equalsIgnoreCase("Aceita") || novaSituacao.equalsIgnoreCase("Recusada")) {
            Adocao adocao = adocaoRepository.findByPetAndAdotanteAndProtetor(
                            solicitacao.getPet(), solicitacao.getAdotante(), solicitacao.getProtetor())
                    .orElse(new Adocao()); // só vai criar o novo registro se não existe a adoção (lógico)

            adocao.setPet(solicitacao.getPet());
            adocao.setAdotante(solicitacao.getAdotante());
            adocao.setProtetor(solicitacao.getProtetor());

            if (novaSituacao.equalsIgnoreCase("Aceita")) {
                adocao.setStatus(Adocao.StatusAdocao.Adotado);
            } else {
                adocao.setStatus(Adocao.StatusAdocao.Disponivel);
            }

            adocaoRepository.save(adocao);
        }

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

    public List<SolicitacaoAdocaoDTO> buscarPorIdPet(Long id) {
        return solicitacaoAdocaoRepository.findByPetId(id)
            .stream()
            .map(SolicitacaoAdocaoMapper::toDTO)
            .collect(Collectors.toList());
    }
}

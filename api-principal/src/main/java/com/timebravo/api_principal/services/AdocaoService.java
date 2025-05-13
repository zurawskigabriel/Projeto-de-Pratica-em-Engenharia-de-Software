package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.AdocaoDTO;
import com.timebravo.api_principal.entities.Adocao;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.repositories.AdocaoRepository;
import com.timebravo.api_principal.repositories.PetRepository;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AdocaoService {

    @Autowired
    private AdocaoRepository adocaoRepository;

    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Transactional
    public AdocaoDTO atualizarStatus(Long idAdocao, AdocaoDTO dto) {
        Adocao adocao = adocaoRepository.findById(idAdocao)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Adoção não encontrada"));

        Usuario usuario = usuarioRepository.findById(dto.getIdAdotante())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Pet pet = adocao.getPet();

        if (!(usuario.getPerfilUsuario() == Usuario.PerfilUsuario.PROTETOR 
            || usuario.getPerfilUsuario() == Usuario.PerfilUsuario.AMBOS)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Para atualizar o status de um pet, é necessário ser um protetor.");
        }

        if (!pet.getUsuario().getId().equals(usuario.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Apenas o protetor responsável pelo pet pode atualizar o status.");
        }

        adocao.setStatus(dto.getStatus());
        adocaoRepository.save(adocao);

        dto.setId(adocao.getId());
        dto.setIdPet(adocao.getPet().getId());

        return dto;
    }
}

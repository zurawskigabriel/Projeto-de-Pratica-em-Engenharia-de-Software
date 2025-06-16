package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.dtos.SolicitacaoAdocaoDTO;
import com.timebravo.api_principal.entities.SolicitacaoAdocao;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.Usuario;

import com.timebravo.api_principal.dtos.PetDTO;
import com.timebravo.api_principal.dtos.UsuarioDTO;

public class SolicitacaoAdocaoMapper 
{
    public static SolicitacaoAdocaoDTO toDTO(SolicitacaoAdocao entity) {
        SolicitacaoAdocaoDTO dto = new SolicitacaoAdocaoDTO();
        dto.setId(entity.getId());

        dto.setPet(PetMapper.toDTO(entity.getPet()));
        dto.setProtetor(UsuarioMapper.toDTO(entity.getProtetor()));
        dto.setAdotante(UsuarioMapper.toDTO(entity.getAdotante()));

        dto.setIdPet(entity.getPet() != null ? entity.getPet().getId() : null);
        dto.setIdAdotante(entity.getAdotante() != null ? entity.getAdotante().getId() : null);

        dto.setSituacao(entity.getSituacao());
        return dto;
    }


    public static SolicitacaoAdocao toEntity(SolicitacaoAdocaoDTO dto, Pet pet, Usuario protetor, Usuario adotante) {
        SolicitacaoAdocao entity = new SolicitacaoAdocao();
        entity.setId(dto.getId());
        entity.setPet(pet);
        entity.setProtetor(protetor);
        entity.setAdotante(adotante);
        entity.setSituacao(dto.getSituacao());

        return entity;
    }
}

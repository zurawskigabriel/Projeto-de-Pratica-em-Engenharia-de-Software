package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.dtos.AdocaoDTO;
import com.timebravo.api_principal.entities.Adocao;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.Usuario;

public class AdocaoMapper {

    public static AdocaoDTO toDTO(Adocao entity) {
        AdocaoDTO dto = new AdocaoDTO();
        dto.setId(entity.getId());
        dto.setIdProtetor(entity.getProtetor().getId());
        dto.setIdAdotante(entity.getAdotante().getId());
        dto.setIdPet(entity.getPet().getId());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    public static Adocao toEntity(AdocaoDTO dto, Pet pet, Usuario adotante, Usuario protetor) {
        Adocao entity = new Adocao();
        entity.setId(dto.getId());
        entity.setPet(pet);
        entity.setAdotante(adotante);
        entity.setProtetor(protetor);
        entity.setStatus(dto.getStatus());

        return entity;
    }
}

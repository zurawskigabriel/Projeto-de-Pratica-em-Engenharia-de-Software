package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.dtos.PetFavoritoDTO;
import com.timebravo.api_principal.entities.PetFavorito;

public class PetFavoritoMapper {

    public static PetFavoritoDTO toDTO(PetFavorito entity) {
        PetFavoritoDTO dto = new PetFavoritoDTO();
        dto.setId(entity.getId());
        dto.setIdUsuario(entity.getUsuario().getId());
        dto.setPet(PetMapper.toDTO(entity.getPet()));
        return dto;
    }
}

package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.dtos.PetFavoritoDTO;
import com.timebravo.api_principal.entities.PetFavorito;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.entities.Pet;

public class PetFavoritoMapper {

    public static PetFavoritoDTO toDTO(PetFavorito entity) {
        PetFavoritoDTO dto = new PetFavoritoDTO();
        dto.setId(entity.getId());
        dto.setIdUsuario(entity.getUsuario().getId());
        dto.setIdPet(entity.getPet().getId());
        
        return dto;
    }

    public static PetFavorito toEntity(PetFavoritoDTO dto, Usuario usuario, Pet pet) {
        PetFavorito petFavorito = new PetFavorito();
        petFavorito.setId(dto.getId()); 
        petFavorito.setUsuario(usuario);
        petFavorito.setPet(pet);
        
        return petFavorito;
    }
}

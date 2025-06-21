package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.dtos.PerfilMatchDTO;
import com.timebravo.api_principal.entities.PerfilMatch;
import com.timebravo.api_principal.entities.Usuario;

public class PerfilMatchMapper {

    public static PerfilMatchDTO toDTO(PerfilMatch entity) {
        if (entity == null) {
            return null;
        }

        PerfilMatchDTO dto = new PerfilMatchDTO();
        dto.setId(entity.getId());
        if (entity.getUsuario() != null) {
            dto.setUsuarioId(entity.getUsuario().getId());
        }
        dto.setGato(entity.isGato());
        dto.setCachorro(entity.isCachorro());
        dto.setMacho(entity.isMacho());
        dto.setFemea(entity.isFemea());
        dto.setPequeno(entity.isPequeno());
        dto.setMedio(entity.isMedio());
        dto.setGrande(entity.isGrande());
        dto.setConviveBem(entity.isConviveBem());
        dto.setNecessidadesEspeciais(entity.isNecessidadesEspeciais());
        dto.setRaca(entity.getRaca());

        return dto;
    }

    public static PerfilMatch toEntity(PerfilMatchDTO dto, Usuario usuario) {
        if (dto == null) {
            return null;
        }

        PerfilMatch entity = new PerfilMatch();
        entity.setUsuario(usuario);
        // O ID da entidade é gerenciado pelo banco, não setamos a partir do DTO
        updateEntityFromDTO(dto, entity);
        return entity;
    }
    
    public static void updateEntityFromDTO(PerfilMatchDTO dto, PerfilMatch entity) {
        entity.setGato(dto.isGato());
        entity.setCachorro(dto.isCachorro());
        entity.setMacho(dto.isMacho());
        entity.setFemea(dto.isFemea());
        entity.setPequeno(dto.isPequeno());
        entity.setMedio(dto.isMedio());
        entity.setGrande(dto.isGrande());
        entity.setConviveBem(dto.isConviveBem());
        entity.setNecessidadesEspeciais(dto.isNecessidadesEspeciais());
        entity.setRaca(dto.getRaca());
    }
}
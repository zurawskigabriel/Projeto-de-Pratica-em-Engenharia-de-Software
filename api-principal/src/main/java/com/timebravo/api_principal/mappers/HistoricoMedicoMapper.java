package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.dtos.HistoricoMedicoDTO;
import com.timebravo.api_principal.entities.HistoricoMedicoPet;
import com.timebravo.api_principal.entities.Pet;

public class HistoricoMedicoMapper {

    public static HistoricoMedicoDTO toDTO(HistoricoMedicoPet entity) {
        HistoricoMedicoDTO dto = new HistoricoMedicoDTO();
        dto.setId(entity.getId());
        dto.setIdPet(entity.getPet().getId());
        dto.setDescricao(entity.getDescricao());
        dto.setTipo(entity.getTipo());
        dto.setDocumento(entity.getDocumento());
        dto.setData(entity.getData());
        return dto;
    }

    public static HistoricoMedicoPet toEntity(HistoricoMedicoDTO dto, Pet pet) {
        HistoricoMedicoPet entity = new HistoricoMedicoPet();
        entity.setPet(pet);
        entity.setTipo(dto.getTipo());
        entity.setDescricao(dto.getDescricao());
        entity.setDocumento(dto.getDocumento());
        entity.setData(dto.getData());
        return entity;
    }
}



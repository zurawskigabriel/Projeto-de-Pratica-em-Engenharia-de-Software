package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.dtos.PetDTO;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.mappers.HistoricoMedicoMapper;
import java.util.stream.Collectors;

public class PetMapper {

    public static PetDTO toDTO(Pet pet) {
        PetDTO dto = new PetDTO();
        dto.setId(pet.getId());
        dto.setIdUsuario(pet.getUsuario().getId());
        dto.setNome(pet.getNome());
        dto.setEspecie(pet.getEspecie());
        dto.setRaca(pet.getRaca());
        dto.setIdadeAno(pet.getIdadeAno());
        dto.setIdadeMes(pet.getIdadeMes());
        dto.setPeso(pet.getPeso());
        dto.setBio(pet.getBio());
        dto.setFotos(pet.getFotos());
        dto.setSexo(pet.getSexo());

        if (pet.getPorte() != null) {
            dto.setPorte(pet.getPorte().name());
        }

        dto.setHistoricoMedico(
            pet.getHistoricoMedico()
                .stream()
                .map(HistoricoMedicoMapper::toDTO)
                .collect(Collectors.toList())
        );

        return dto;
    }

    public static Pet toEntity(PetDTO dto, Usuario usuario) {
        Pet pet = new Pet();
        pet.setUsuario(usuario);
        pet.setNome(dto.getNome());
        pet.setEspecie(dto.getEspecie());
        pet.setRaca(dto.getRaca());
        pet.setIdadeAno(dto.getIdadeAno());
        pet.setIdadeMes(dto.getIdadeMes());
        pet.setPeso(dto.getPeso());
        pet.setBio(dto.getBio());
        pet.setFotos(dto.getFotos());
        pet.setSexo(dto.getSexo());

        if (dto.getPorte() != null) {
            pet.setPorte(Pet.PetPorte.valueOf(dto.getPorte()));
        }

        return pet;
    }
}
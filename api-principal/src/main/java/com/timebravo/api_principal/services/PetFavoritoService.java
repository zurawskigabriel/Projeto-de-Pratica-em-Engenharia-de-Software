package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.PetFavoritoDTO;
import com.timebravo.api_principal.entities.PetFavorito;
import com.timebravo.api_principal.mappers.PetFavoritoMapper;
import com.timebravo.api_principal.repositories.PetFavoritoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetFavoritoService {

    private final PetFavoritoRepository favoritoRepository;

    @Autowired
    public PetFavoritoService(PetFavoritoRepository favoritoRepository) {
        this.favoritoRepository = favoritoRepository;
    }

    public List<PetFavoritoDTO> listarPetsFavoritos(Long idUsuario) {
        return favoritoRepository.findByUsuarioId(idUsuario).stream()
                .map(PetFavoritoMapper::toDTO)
                .collect(Collectors.toList());
    }
}

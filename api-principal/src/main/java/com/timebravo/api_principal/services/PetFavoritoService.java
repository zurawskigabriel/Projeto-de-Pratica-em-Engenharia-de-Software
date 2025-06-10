package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.PetFavoritoDTO;
import com.timebravo.api_principal.entities.PetFavorito;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.mappers.PetFavoritoMapper;
import com.timebravo.api_principal.mappers.PetMapper;
import com.timebravo.api_principal.repositories.PetFavoritoRepository;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import com.timebravo.api_principal.repositories.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetFavoritoService {

    private final PetFavoritoRepository favoritoRepository;
    private UsuarioRepository usuarioRepository;
    private PetRepository petRepository;

    @Autowired
    public PetFavoritoService(PetFavoritoRepository favoritoRepository, UsuarioRepository usuarioRepository, PetRepository petRepository) {
        this.favoritoRepository = favoritoRepository;
        this.usuarioRepository = usuarioRepository;
        this.petRepository = petRepository; 
    }

    public List<PetFavoritoDTO> listarPetsFavoritos(Long idUsuario) {
        List<PetFavoritoDTO> favoritos = favoritoRepository.findByUsuarioId(idUsuario)
            .stream()
            .map(PetFavoritoMapper::toDTO)
            .collect(Collectors.toList());

        for (PetFavoritoDTO dto : favoritos) {
            Pet pet = petRepository.findById(dto.getIdPet()).orElse(null);
            if (pet != null) {
                dto.setPet(PetMapper.toDTO(pet)); 
            }
        }

        return favoritos;
    }

    @Transactional
    public PetFavoritoDTO favoritarPet(PetFavoritoDTO favoritoDTO) {
        Usuario usuario = usuarioRepository.findById(favoritoDTO.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário com ID " + favoritoDTO.getIdUsuario() + " não encontrado"));

        Pet pet = petRepository.findById(favoritoDTO.getIdPet())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Pet com ID " + favoritoDTO.getIdPet() + " não encontrado"));

        PetFavorito petFavorito = PetFavoritoMapper.toEntity(favoritoDTO, usuario, pet);
        PetFavorito salvo = favoritoRepository.save(petFavorito);
        return PetFavoritoMapper.toDTO(salvo);
    }
}

package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.dtos.PetFavoritoDTO;
import com.timebravo.api_principal.services.PetFavoritoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pets-favoritos")
public class PetFavoritoController 
{
    private PetFavoritoService petFavoritoService;
    
    @Autowired
    public PetFavoritoController(PetFavoritoService petFavoritoService) {
        this.petFavoritoService = petFavoritoService;
    }

    @GetMapping("/{idUsuario}")
    public ResponseEntity<List<PetFavoritoDTO>> listarFavoritos(@PathVariable Long idUsuario) {
        List<PetFavoritoDTO> favoritos = petFavoritoService.listarPetsFavoritos(idUsuario);
        return ResponseEntity.ok(favoritos);
    }

    @PostMapping
    public ResponseEntity<Void> favoritarPet(@Valid @RequestBody PetFavoritoDTO petDTO) {
        petFavoritoService.favoritarPet(petDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build(); 
    }

    @DeleteMapping("/{idUsuario}/{idPet}")
    public ResponseEntity<Void> desfavoritarPet(
            @PathVariable Long idUsuario,
            @PathVariable Long idPet
    ) {
        petFavoritoService.desfavoritarPet(idUsuario, idPet);
        return ResponseEntity.noContent().build(); 
    }
}
package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.dtos.PetDTO;
import com.timebravo.api_principal.services.PetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;

    @Autowired
    public PetController(PetService petService) {
        this.petService = petService;
    }

    @PostMapping
    public ResponseEntity<PetDTO> criarPet(@Valid @RequestBody PetDTO petDTO) {
        PetDTO novoPet = petService.criarPet(petDTO);
        return new ResponseEntity<>(novoPet, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<PetDTO>> listarTodosPets() {
        List<PetDTO> pets = petService.listarTodos();
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PetDTO> buscarPetPorId(@PathVariable Long id) {
        PetDTO pet = petService.buscarPorId(id);
        return ResponseEntity.ok(pet);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PetDTO> atualizarPet(
            @PathVariable Long id,
            @Valid @RequestBody PetDTO petDTO) {
        PetDTO petAtualizado = petService.atualizarPet(id, petDTO);
        return ResponseEntity.ok(petAtualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletarPet(@PathVariable Long id) {
        petService.deletarPet(id);
        return ResponseEntity.noContent().build();
    }
}

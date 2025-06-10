package com.timebravo.api_principal.controllers;

import com.timebravo.api_principal.dtos.PetDTO;
import com.timebravo.api_principal.utils.AuthUtil;
import com.timebravo.api_principal.services.PetService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/pets")
public class PetController {

    private final PetService petService;
    private final AuthUtil authUtil;

    @Autowired
    public PetController(PetService petService, AuthUtil authUtil) {
        this.petService = petService;
        this.authUtil = authUtil;
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

    @GetMapping("/petsDoUsuario/{idUsuario}")
    public ResponseEntity<List<PetDTO>> buscarPetsRegistradosPorUsuario(
            @PathVariable Long idUsuario
    ) {
        // aqui ele verifica se o ID do usuário passado na URL é igual ao do usuário
        // pq se não for, ele não pode consultar os pets de outro usuário!
        Long loggedId = authUtil.getLoggedUserId();
        if (!loggedId.equals(idUsuario)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST, 
                "Usuário logado não corresponde com ID especificado."
            );
        }

        List<PetDTO> petsDoUsuario = petService.buscarPetsRegistradosPorUsuario(idUsuario);
        return ResponseEntity.ok(petsDoUsuario);
    }

    @GetMapping("/petsDisponiveis")
    public ResponseEntity<List<PetDTO>> buscarPetsDisponiveis() {
        List<PetDTO> petsDisponiveis = petService.buscarPetsDisponiveis();
        return ResponseEntity.ok(petsDisponiveis);
    }

    @GetMapping("/petsPorFiltro")
    public ResponseEntity<List<PetDTO>> buscarPetsPorFiltro(
        @RequestParam(required = false) String especie, 
        @RequestParam(required = false) String raca, 
        @RequestParam(required = false) Integer idadeMinima, 
        @RequestParam(required = false) Integer idadeMaxima,
        @RequestParam(required = false) String porte, 
        @RequestParam(required = false) Character sexo,
        @RequestParam(required = false) Boolean temHistoricoMedico) {
        
        List<PetDTO> petsFiltrados = petService.buscarPetsPorFiltro(especie, raca, idadeMinima, idadeMaxima, porte, sexo, temHistoricoMedico);
        return ResponseEntity.ok(petsFiltrados);
    }
}
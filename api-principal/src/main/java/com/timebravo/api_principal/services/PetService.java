package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.PetDTO;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.mappers.PetMapper;
import com.timebravo.api_principal.repositories.PetRepository;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PetService {

    private final PetRepository petRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public PetService(PetRepository petRepository, UsuarioRepository usuarioRepository) {
        this.petRepository = petRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public PetDTO criarPet(PetDTO petDTO) {
        Usuario usuario = usuarioRepository.findById(petDTO.getIdUsuario())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário com ID " + petDTO.getIdUsuario() + " não encontrado"));

        Pet pet = PetMapper.toEntity(petDTO, usuario);
        Pet salvo = petRepository.save(pet);
        return PetMapper.toDTO(salvo);
    }

    public List<PetDTO> listarTodos() {
        return petRepository.findAll()
                .stream()
                .map(PetMapper::toDTO)
                .collect(Collectors.toList());
    }

    public PetDTO buscarPorId(Long id) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado"));

        return PetMapper.toDTO(pet);
    }

    public List<PetDTO> buscarPetsRegistradosPorUsuario(Long idUsuario) {
        Usuario usuario = usuarioRepository.findById(idUsuario)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        List<Pet> pets = petRepository.findByUsuarioId(idUsuario);

        if (pets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não possui pets registrados");
        }

        return pets.stream()
            .map(PetMapper::toDTO)
            .collect(Collectors.toList());
    }

    public List<PetDTO> buscarPetsDisponiveis() {
        List<Pet> pets = petRepository.findPetsDisponiveis();

        if (pets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum pet disponível encontrado");
        }

        return pets.stream()
                .map(PetMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<PetDTO> buscarPetsPorFiltro(String especie, String raca, Integer idadeMinima, Integer idadeMaxima, String porte, Character sexo, Boolean temHistoricoMedico) {

        List<Pet> pets = petRepository.findPetsByFilter(especie, raca, idadeMinima, idadeMaxima, porte, sexo, temHistoricoMedico);

        if (pets.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Nenhum pet encontrado com os critérios especificados");
        }
        return pets.stream()
                .map(PetMapper::toDTO)
                .collect(Collectors.toList());

    }

    @Transactional
    public PetDTO atualizarPet(Long id, PetDTO petDTO) {
        Pet pet = petRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado"));

        pet.setNome(petDTO.getNome());
        pet.setEspecie(petDTO.getEspecie());
        pet.setRaca(petDTO.getRaca());
        pet.setIdadeAno(petDTO.getIdadeAno());
        pet.setIdadeMes(petDTO.getIdadeMes());
        pet.setPeso(petDTO.getPeso());
        pet.setBio(petDTO.getBio());
        pet.setFotos(petDTO.getFotos());
        pet.setSexo(petDTO.getSexo());

        if (petDTO.getPorte() != null) {
            pet.setPorte(Pet.PetPorte.valueOf(petDTO.getPorte()));
        }

        return PetMapper.toDTO(petRepository.save(pet));
    }

    @Transactional
    public void deletarPet(Long id) {
        if (!petRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado");
        }
        petRepository.deleteById(id);
    }
}
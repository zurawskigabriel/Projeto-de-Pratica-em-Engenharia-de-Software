package com.timebravo.api_principal.repositories;

import com.timebravo.api_principal.dtos.AdocaoDTO;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import com.timebravo.api_principal.entities.Adocao;

import java.util.List;
import java.util.Optional;

public interface AdocaoRepository extends JpaRepository<Adocao, Long> {
    Optional<Adocao> findByPetAndAdotanteAndProtetor(Pet pet, Usuario adotante, Usuario protetor);
    List<Adocao> findByPetId(Long idPet);
}

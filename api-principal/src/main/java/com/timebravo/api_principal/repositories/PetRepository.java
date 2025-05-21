package com.timebravo.api_principal.repositories;

import com.timebravo.api_principal.entities.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByUsuarioId(Long idUsuario);
    
    @Query(value = "SELECT p.* FROM pet p, adocao a WHERE p.id_pet = a.id_pet AND a.status = 'Disponível'", nativeQuery = true)
    List<Pet> findPetsDisponiveis();
}


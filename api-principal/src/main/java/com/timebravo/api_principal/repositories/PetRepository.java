package com.timebravo.api_principal.repositories;

import com.timebravo.api_principal.entities.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByUsuarioId(Long idUsuario);
    
    @Query(value = "SELECT p.*, hm.tipo, hm.descricao" + 
                    "FROM pet p" +
                    "JOIN adocao a ON p.id_pet = a.id_pet" +
                    "LEFT JOIN historico_medico_pet hm ON p.id_pet = hm.id_pet" + 
                    "WHERE a.status = 'Disponivel'", 
                    nativeQuery = true)
    List<Pet> findPetsDisponiveis();

    @Query(value = "SELECT p.* FROM pet p " +
                "JOIN adocao a ON p.id_pet = a.id_pet " +
                "WHERE a.status = 'Disponivel' " +
                "AND (:especie IS NULL OR p.especie ILIKE %:especie%) " + // ILIKE para busca case-insensitive (PostgreSQL/H2)
                "AND (:raca IS NULL OR p.raca ILIKE %:raca%) " +
                "AND (:idadeMinima IS NULL OR p.idade >= :idadeMinima) " +
                "AND (:idadeMaxima IS NULL OR p.idade <= :idadeMaxima) " +
                "AND (:porte IS NULL OR p.porte = UPPER(:porte)) " + 
                "AND (:sexo IS NULL OR p.sexo = :sexo)" +
                "AND ((:temHistoricoMedico IS NULL) " +
                "OR (:temHistoricoMedico = TRUE AND EXISTS (SELECT 1 FROM historico_medico_pet hm WHERE hm.id_pet = p.id_pet))" +
                "OR (:temHistoricoMedico = FALSE AND NOT EXISTS (SELECT 1 FROM historico_medico_pet hm WHERE hm.id_pet = p.id_pet)))",
                nativeQuery = true)
    List<Pet> findPetsByFilter(
            @Param("especie") String especie,
            @Param("raca") String raca,
            @Param("idadeMinima") Integer idadeMinima,
            @Param("idadeMaxima") Integer idadeMaxima,
            @Param("porte") String porte,
            @Param("sexo") Character sexo,
            @Param("temHistoricoMedico") Boolean temHistoricoMedico);
}


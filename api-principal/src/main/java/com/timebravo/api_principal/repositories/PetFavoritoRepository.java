package com.timebravo.api_principal.repositories;

import com.timebravo.api_principal.entities.PetFavorito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetFavoritoRepository extends JpaRepository<PetFavorito, Long> {
    List<PetFavorito> findByUsuarioId(Long idUsuario);
}

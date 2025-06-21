package com.timebravo.api_principal.repositories;

import com.timebravo.api_principal.entities.PerfilMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PerfilMatchRepository extends JpaRepository<PerfilMatch, Long> {
    Optional<PerfilMatch> findByUsuarioId(Long usuarioId);
    void deleteByUsuarioId(Long usuarioId);
}
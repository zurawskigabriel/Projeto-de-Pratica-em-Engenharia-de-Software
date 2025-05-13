package com.timebravo.api_principal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.timebravo.api_principal.entities.Adocao;

public interface AdocaoRepository extends JpaRepository<Adocao, Long> {
}

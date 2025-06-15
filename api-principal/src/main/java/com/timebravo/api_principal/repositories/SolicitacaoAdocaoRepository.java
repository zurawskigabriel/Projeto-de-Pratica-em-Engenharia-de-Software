package com.timebravo.api_principal.repositories;

import com.timebravo.api_principal.entities.SolicitacaoAdocao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SolicitacaoAdocaoRepository extends JpaRepository<SolicitacaoAdocao, Long> {
    List<SolicitacaoAdocao> findByAdotanteId(Long adotanteId);
    List<SolicitacaoAdocao> findByProtetorId(Long protetorId);
    List<SolicitacaoAdocao> findByPetId(Long petId);
}

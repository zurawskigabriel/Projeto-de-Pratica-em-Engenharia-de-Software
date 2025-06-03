package com.timebravo.api_principal.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.timebravo.api_principal.entities.HistoricoMedicoPet;

public interface HistoricoMedicoRepository extends JpaRepository<HistoricoMedicoPet, Long> {
    
}

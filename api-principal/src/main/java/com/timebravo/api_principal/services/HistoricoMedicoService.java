package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.HistoricoMedicoDTO;
import com.timebravo.api_principal.entities.Adocao;
import com.timebravo.api_principal.entities.Pet;
import com.timebravo.api_principal.entities.HistoricoMedicoPet;
import com.timebravo.api_principal.repositories.AdocaoRepository;
import com.timebravo.api_principal.repositories.PetRepository;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import com.timebravo.api_principal.repositories.HistoricoMedicoRepository;
import jakarta.transaction.Transactional;
import com.timebravo.api_principal.mappers.HistoricoMedicoMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HistoricoMedicoService 
{
    @Autowired
    private PetRepository petRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private HistoricoMedicoRepository historicoMedicoRepository;

    @Transactional
    public HistoricoMedicoDTO criarHistoricoMedico(HistoricoMedicoDTO dto) {
        Pet pet = petRepository.findById(dto.getIdPet())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pet não encontrado"));

        HistoricoMedicoPet historicoMedicoPet = HistoricoMedicoMapper.toEntity(dto, pet);
        HistoricoMedicoPet salvo = historicoMedicoRepository.save(historicoMedicoPet);
        return HistoricoMedicoMapper.toDTO(salvo);
    }

}

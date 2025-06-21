package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.PerfilMatchDTO;
import com.timebravo.api_principal.entities.PerfilMatch;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.mappers.PerfilMatchMapper;
import com.timebravo.api_principal.repositories.PerfilMatchRepository;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PerfilMatchService {

    private final PerfilMatchRepository perfilMatchRepository;
    private final UsuarioRepository usuarioRepository;

    @Autowired
    public PerfilMatchService(PerfilMatchRepository perfilMatchRepository, UsuarioRepository usuarioRepository) {
        this.perfilMatchRepository = perfilMatchRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional(readOnly = true)
    public PerfilMatchDTO buscarPerfilPorUsuarioId(Long usuarioId) {
        return perfilMatchRepository.findByUsuarioId(usuarioId)
                .map(PerfilMatchMapper::toDTO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Perfil de match não encontrado para este usuário."));
    }

    @Transactional
    public PerfilMatchDTO criarOuAtualizarPerfil(Long usuarioId, PerfilMatchDTO dto) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        PerfilMatch perfil = perfilMatchRepository.findByUsuarioId(usuarioId)
                .orElse(new PerfilMatch()); // Cria um novo se não existir

        perfil.setUsuario(usuario);
        PerfilMatchMapper.updateEntityFromDTO(dto, perfil);

        PerfilMatch perfilSalvo = perfilMatchRepository.save(perfil);
        return PerfilMatchMapper.toDTO(perfilSalvo);
    }

    @Transactional
    public void deletarPerfil(Long usuarioId) {
        if (!perfilMatchRepository.findByUsuarioId(usuarioId).isPresent()) {
            // Se o perfil não existe, consideramos a operação um sucesso silencioso.
            return;
        }
        perfilMatchRepository.deleteByUsuarioId(usuarioId);
    }
}
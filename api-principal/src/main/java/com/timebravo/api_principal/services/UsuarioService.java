package com.timebravo.api_principal.services;

import com.timebravo.api_principal.dtos.UsuarioDTO;
import com.timebravo.api_principal.dtos.UsuarioResponseDTO;
import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.entities.Usuario.PerfilUsuario;
import com.timebravo.api_principal.entities.Usuario.TipoUsuario;
import com.timebravo.api_principal.repositories.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UsuarioService(UsuarioRepository usuarioRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public UsuarioResponseDTO criarUsuario(UsuarioDTO usuarioDTO) {
        if (usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já está em uso");
        }

        validarRegraOng(usuarioDTO.getTipo(), usuarioDTO.getPerfilUsuario());

        Usuario usuario = new Usuario();
        usuario.setNome(usuarioDTO.getNome());
        usuario.setTelefone(usuarioDTO.getTelefone());
        usuario.setEmail(usuarioDTO.getEmail());
        usuario.setSenhaHash(passwordEncoder.encode(usuarioDTO.getSenha()));
        usuario.setTipo(usuarioDTO.getTipo());
        usuario.setPerfilUsuario(usuarioDTO.getPerfilUsuario());
        usuario.setDataCadastro(LocalDateTime.now());

        Usuario usuarioSalvo = usuarioRepository.save(usuario);
        return convertToResponseDTO(usuarioSalvo);
    }

    public boolean validarCredenciais(String username, String rawPassword) {
        Usuario usuario = usuarioRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Usuário ou senha inválidos"));

        return passwordEncoder.matches(rawPassword, usuario.getSenhaHash());
    }

    public Usuario findUserByEmail(String username) {
        Usuario usuario = usuarioRepository.findByEmail(username)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Usuário não encontrado"));

        return usuario;
    }

    public List<UsuarioResponseDTO> listarTodosUsuarios() {
        return usuarioRepository.findAll().stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    public UsuarioResponseDTO buscarUsuarioPorId(Long id) {
        Optional<Usuario> usuarioOptional = usuarioRepository.findById(id);
        if (usuarioOptional.isEmpty()) {
            throw new RuntimeException("Usuário não encontrado");
        }
        return convertToResponseDTO(usuarioOptional.get());
    }

    @Transactional
    public UsuarioResponseDTO atualizarUsuario(Long id, UsuarioDTO usuarioDTO) {
        Usuario usuario = usuarioRepository.findById(id)
            .orElseThrow(() ->
                new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado")
            );

        if (!usuario.getEmail().equals(usuarioDTO.getEmail())
            && usuarioRepository.existsByEmail(usuarioDTO.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email já está em uso");
        }

        validarRegraOng(usuarioDTO.getTipo(), usuarioDTO.getPerfilUsuario());

        usuario.setNome(usuarioDTO.getNome());
        usuario.setTelefone(usuarioDTO.getTelefone());
        usuario.setEmail(usuarioDTO.getEmail());
        
        if (usuarioDTO.getSenha() != null && !usuarioDTO.getSenha().isEmpty()) {
            usuario.setSenhaHash(passwordEncoder.encode(usuarioDTO.getSenha()));
        }
        
        usuario.setTipo(usuarioDTO.getTipo());
        usuario.setPerfilUsuario(usuarioDTO.getPerfilUsuario());

        Usuario atualizado = usuarioRepository.save(usuario);
        return convertToResponseDTO(atualizado);
    }

    @Transactional
    public void deletarUsuario(Long id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResponseStatusException(
            HttpStatus.NOT_FOUND,
            "Usuário não encontrado"
        );
        }
        usuarioRepository.deleteById(id);
    }

    private void validarRegraOng(TipoUsuario tipo, PerfilUsuario perfil) {
        if (TipoUsuario.ONG.equals(tipo) && !PerfilUsuario.PROTETOR.equals(perfil)) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Usuários do tipo ONG só podem ter perfil PROTETOR"
            );
        }
    }

    private UsuarioResponseDTO convertToResponseDTO(Usuario usuario) {
        UsuarioResponseDTO responseDTO = new UsuarioResponseDTO();
        responseDTO.setId(usuario.getId());
        responseDTO.setNome(usuario.getNome());
        responseDTO.setTelefone(usuario.getTelefone());
        responseDTO.setEmail(usuario.getEmail());
        responseDTO.setDataCadastro(usuario.getDataCadastro());
        responseDTO.setTipo(usuario.getTipo());
        responseDTO.setPerfilUsuario(usuario.getPerfilUsuario());
        return responseDTO;
    }
}

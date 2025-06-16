package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.dtos.UsuarioDTO;

public class UsuarioMapper 
{
    public static UsuarioDTO toDTO(Usuario usuario) {
        if (usuario == null) return null;

        UsuarioDTO dto = new UsuarioDTO();
        dto.setId(usuario.getId());
        dto.setNome(usuario.getNome());
        dto.setTelefone(usuario.getTelefone());
        dto.setEmail(usuario.getEmail());
        dto.setTipo(usuario.getTipo());
        dto.setPerfilUsuario(usuario.getPerfilUsuario());

        return dto;
    }
}


package com.timebravo.api_principal.mappers;

import com.timebravo.api_principal.entities.Usuario;
import com.timebravo.api_principal.dtos.UsuarioDTO;

public class UsuarioMapper 
{
    public static UsuarioDTO toDTO(Usuario usuario) {
        if (usuario == null) return null;

        UsuarioDTO dto = new UsuarioDTO();
        dto.setTelefone(usuario.getTelefone());
        dto.setTipo(usuario.getTipo());
        dto.setPerfilUsuario(usuario.getPerfilUsuario());

        return dto;
    }
}

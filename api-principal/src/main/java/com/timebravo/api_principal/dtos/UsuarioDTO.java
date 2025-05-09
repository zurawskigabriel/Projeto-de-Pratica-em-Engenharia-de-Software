package com.timebravo.api_principal.dtos;

import com.timebravo.api_principal.entities.Usuario.PerfilUsuario;
import com.timebravo.api_principal.entities.Usuario.TipoUsuario;
import jakarta.validation.constraints.*;

public class UsuarioDTO {
    
    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
    private String nome;
    
    @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres")
    private String telefone;
    
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "O email deve ser válido")
    @Size(max = 100, message = "O email deve ter no máximo 100 caracteres")
    private String email;
    
    @NotBlank(message = "A senha é obrigatória")
    private String senha;
    
    @NotNull(message = "O tipo é obrigatório")
    private TipoUsuario tipo;

    @NotNull(message = "O perfil de usuário é obrigatório")
    private PerfilUsuario perfilUsuario;

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getTelefone() {
        return telefone;
    }

    public void setTelefone(String telefone) {
        this.telefone = telefone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getSenha() {
        return senha;
    }

    public void setSenha(String senha) {
        this.senha = senha;
    }

    public TipoUsuario getTipo() {
        return tipo;
    }

    public void setTipo(TipoUsuario tipo) {
        this.tipo = tipo;
    }

    public PerfilUsuario getPerfilUsuario() {
        return perfilUsuario;
    }

    public void setPerfilUsuario(PerfilUsuario perfilUsuario) {
        this.perfilUsuario = perfilUsuario;
    }
}
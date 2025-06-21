package com.timebravo.match;

import java.time.LocalDateTime;

public class Usuario {
    private Long id;
    private String nome;
    private String email;
    private String telefone;
    private String senhaHash;
    private LocalDateTime dataCadastro;
    private TipoUsuario tipo;
    private PerfilUsuario perfilUsuario;

    public enum TipoUsuario {
        PESSOA, ONG
    }

    public enum PerfilUsuario {
        ADOTANTE, PROTETOR, AMBOS
    }

    // Construtor vazio obrigatório para o Jackson
    public Usuario() {
    }

    // Construtor usado no Main (exemplo de parâmetros; ajuste conforme quiser)
    public Usuario(Long id, String nome, String email, String telefone,
                   String senhaHash, LocalDateTime dataCadastro,
                   TipoUsuario tipo, PerfilUsuario perfilUsuario) {
        this.id = id;
        this.nome = nome;
        this.email = email;
        this.telefone = telefone;
        this.senhaHash = senhaHash;
        this.dataCadastro = dataCadastro;
        this.tipo = tipo;
        this.perfilUsuario = perfilUsuario;
    }

    // Getters
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEmail() { return email; }
    public String getTelefone() { return telefone; }
    public String getSenhaHash() { return senhaHash; }
    public LocalDateTime getDataCadastro() { return dataCadastro; }
    public TipoUsuario getTipo() { return tipo; }
    public PerfilUsuario getPerfilUsuario() { return perfilUsuario; }

    // Setters
    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEmail(String email) { this.email = email; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public void setSenhaHash(String senhaHash) { this.senhaHash = senhaHash; }
    public void setDataCadastro(LocalDateTime dataCadastro) { this.dataCadastro = dataCadastro; }
    public void setTipo(TipoUsuario tipo) { this.tipo = tipo; }
    public void setPerfilUsuario(PerfilUsuario perfilUsuario) { this.perfilUsuario = perfilUsuario; }
}

package com.timebravo.api_principal.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Usuario")
public class Usuario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_usuario")
    private Long id;
    
    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
    @Column(name = "Nome", nullable = false, length = 100)
    private String nome;
    
    @Size(max = 20, message = "O telefone deve ter no máximo 20 caracteres")
    @Column(name = "Telefone", length = 20)
    private String telefone;
    
    @NotBlank(message = "O email é obrigatório")
    @Email(message = "O email deve ser válido")
    @Size(max = 100, message = "O email deve ter no máximo 100 caracteres")
    @Column(name = "Email", nullable = false, unique = true, length = 100)
    private String email;
    
    @NotBlank(message = "A senha é obrigatória")
    @Column(name = "Senha_hash", nullable = false, length = 255)
    private String senhaHash;
    
    @CreationTimestamp
    @Column(name = "Data_cadastro", updatable = false)
    private LocalDateTime dataCadastro;
    
    @NotNull(message = "O tipo é obrigatório")
    @Column(name = "Tipo", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private TipoUsuario tipo;

    @OneToMany(
        mappedBy = "adotante",
        cascade = CascadeType.REMOVE,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<Adocao> adocoesComoAdotante = new ArrayList<>();
    
    public enum TipoUsuario {
        PESSOA("Pessoa"),
        ONG("ONG");
        
        private final String descricao;
        
        TipoUsuario(String descricao) {
            this.descricao = descricao;
        }
        
        public String getDescricao() {
            return descricao;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getSenhaHash() {
        return senhaHash;
    }

    public void setSenhaHash(String senhaHash) {
        this.senhaHash = senhaHash;
    }

    public LocalDateTime getDataCadastro() {
        return dataCadastro;
    }

    public void setDataCadastro(LocalDateTime dataCadastro) {
        this.dataCadastro = dataCadastro;
    }

    public TipoUsuario getTipo() {
        return tipo;
    }

    public void setTipo(TipoUsuario tipo) {
        this.tipo = tipo;
    }

    public List<Adocao> getAdocoesComoAdotante() {
        return adocoesComoAdotante;
    }

    public void setAdocoesComoAdotante(List<Adocao> adocoesComoAdotante) {
        this.adocoesComoAdotante = adocoesComoAdotante;
    }
}
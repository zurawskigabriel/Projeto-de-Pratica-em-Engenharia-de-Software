package com.timebravo.api_principal.entities;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "historico_usuario")
public class HistoricoUsuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_historico_usuario")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "Id_usuario", nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_historico_usuario",
            foreignKeyDefinition = "FOREIGN KEY (Id_usuario) REFERENCES usuario(Id_usuario) ON DELETE CASCADE"
        )
    )
    private Usuario usuario;

    @Lob
    @Column(name = "Mensagem")
    private String mensagem;

    @CreationTimestamp
    @Column(name = "Data", updatable = false)
    private LocalDateTime data;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getMensagem() { return mensagem; }
    public void setMensagem(String mensagem) { this.mensagem = mensagem; }

    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }
}
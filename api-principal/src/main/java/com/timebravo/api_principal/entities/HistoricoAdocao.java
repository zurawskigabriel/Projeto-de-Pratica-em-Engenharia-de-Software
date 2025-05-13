package com.timebravo.api_principal.entities;

import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "historico_adocao")
public class HistoricoAdocao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_historico_adocao")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "Id_adocao", nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_historico_adocao_adocao",
            foreignKeyDefinition = "FOREIGN KEY (Id_adocao) REFERENCES adocao(Id_adocao) ON DELETE CASCADE"
        )
    )
    private Adocao adocao;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "Id_protetor", nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_historico_adocao_protetor",
            foreignKeyDefinition = "FOREIGN KEY (Id_protetor) REFERENCES usuario(Id_usuario)"
        )
    )
    private Usuario protetor;

    @CreationTimestamp
    @Column(name = "Data", updatable = false)
    private LocalDateTime data;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Adocao getAdocao() { return adocao; }
    public void setAdocao(Adocao adocao) { this.adocao = adocao; }

    public Usuario getProtetor() { return protetor; }
    public void setProtetor(Usuario protetor) { this.protetor = protetor; }

    public LocalDateTime getData() { return data; }
    public void setData(LocalDateTime data) { this.data = data; }
}


package com.timebravo.api_principal.entities;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "Adocao")
public class Adocao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_adocao")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Id_pet", nullable = false)
    private Pet pet;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Id_adotante", nullable = false)
    private Usuario adotante;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Id_protetor", nullable = false)
    private Usuario protetor;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false, length = 20)
    private StatusAdocao status;

    @OneToMany(
         mappedBy = "adocao",
         cascade = CascadeType.REMOVE,
         orphanRemoval = true,
         fetch = FetchType.LAZY
     )
    private List<HistoricoAdocao> historicoAdocao = new ArrayList<>();

    public enum StatusAdocao {
        Disponivel,
        Adotado,
        Indisponivel
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public Usuario getAdotante() { return adotante; }
    public void setAdotante(Usuario adotante) { this.adotante = adotante; }

    public Usuario getProtetor() {
        return protetor;
    }

    public void setProtetor(Usuario protetor) {
        this.protetor = protetor;
    }

    public StatusAdocao getStatus() { return status; }
    public void setStatus(StatusAdocao status) { this.status = status; }

    public List<HistoricoAdocao> getHistoricoAdocao() { return historicoAdocao; }
    public void setHistoricoAdocao(List<HistoricoAdocao> historicoAdocao) { this.historicoAdocao = historicoAdocao; }
}
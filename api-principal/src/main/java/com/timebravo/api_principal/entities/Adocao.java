package com.timebravo.api_principal.entities;

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
    @Column(name = "Id_pet", nullable = false)
    private Long idPet;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Id_adotante", nullable = false)
    private Usuario adotante;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false, length = 20)
    private StatusAdocao status;

    public enum StatusAdocao {
        Pendente,
        Aceita,
        Rejeitada,
        Finalizada
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdPet() {
        return idPet;
    }

    public void setIdPet(Long idPet) {
        this.idPet = idPet;
    }

    public Usuario getAdotante() {
        return adotante;
    }

    public void setAdotante(Usuario adotante) {
        this.adotante = adotante;
    }

    public StatusAdocao getStatus() {
        return status;
    }

    public void setStatus(StatusAdocao status) {
        this.status = status;
    }
}
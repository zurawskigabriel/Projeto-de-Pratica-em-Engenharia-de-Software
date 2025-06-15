package com.timebravo.api_principal.entities;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitacao_adocao")
public class SolicitacaoAdocao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_solicitacao_adocao")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_pet", nullable = false)
    private Pet pet;

    @ManyToOne
    @JoinColumn(name = "id_protetor", nullable = false)
    private Usuario protetor;

    @ManyToOne
    @JoinColumn(name = "id_adotante", nullable = false)
    private Usuario adotante;

    @Column(nullable = false)
    private String situacao;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public Usuario getProtetor() {
        return protetor;
    }

    public void setProtetor(Usuario protetor) {
        this.protetor = protetor;
    }

    public Usuario getAdotante() {
        return adotante;
    }

    public void setAdotante(Usuario adotante) {
        this.adotante = adotante;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }
}

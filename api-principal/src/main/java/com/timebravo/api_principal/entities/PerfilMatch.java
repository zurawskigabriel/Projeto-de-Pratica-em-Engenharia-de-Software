package com.timebravo.api_principal.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "perfil_match")
public class PerfilMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_perfil_match")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_usuario", referencedColumnName = "Id_usuario", unique = true, nullable = false)
    private Usuario usuario;

    private boolean gato;
    private boolean cachorro;
    private boolean macho;
    private boolean femea;
    private boolean pequeno;
    private boolean medio;
    private boolean grande;

    @Column(name = "convive_bem")
    private boolean conviveBem;

    @Column(name = "necessidades_especiais")
    private boolean necessidadesEspeciais;

    private String raca;

    // Getters e Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public boolean isGato() {
        return gato;
    }

    public void setGato(boolean gato) {
        this.gato = gato;
    }

    public boolean isCachorro() {
        return cachorro;
    }

    public void setCachorro(boolean cachorro) {
        this.cachorro = cachorro;
    }

    public boolean isMacho() {
        return macho;
    }

    public void setMacho(boolean macho) {
        this.macho = macho;
    }

    public boolean isFemea() {
        return femea;
    }

    public void setFemea(boolean femea) {
        this.femea = femea;
    }

    public boolean isPequeno() {
        return pequeno;
    }

    public void setPequeno(boolean pequeno) {
        this.pequeno = pequeno;
    }

    public boolean isMedio() {
        return medio;
    }

    public void setMedio(boolean medio) {
        this.medio = medio;
    }

    public boolean isGrande() {
        return grande;
    }

    public void setGrande(boolean grande) {
        this.grande = grande;
    }

    public boolean isConviveBem() {
        return conviveBem;
    }

    public void setConviveBem(boolean conviveBem) {
        this.conviveBem = conviveBem;
    }

    public boolean isNecessidadesEspeciais() {
        return necessidadesEspeciais;
    }

    public void setNecessidadesEspeciais(boolean necessidadesEspeciais) {
        this.necessidadesEspeciais = necessidadesEspeciais;
    }

    public String getRaca() {
        return raca;
    }

    public void setRaca(String raca) {
        this.raca = raca;
    }
}
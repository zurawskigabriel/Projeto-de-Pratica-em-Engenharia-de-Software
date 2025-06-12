package com.timebravo.match;

import java.util.List;

public class MatchRequest {
    private Usuario usuario;
    private List<Pet> pets;

    public MatchRequest() {}

    public MatchRequest(Usuario usuario, List<Pet> pets) {
        this.usuario = usuario;
        this.pets = pets;
    }

    public Usuario getUsuario() {
        return usuario;
    }

    public void setUsuario(Usuario usuario) {
        this.usuario = usuario;
    }

    public List<Pet> getPets() {
        return pets;
    }

    public void setPets(List<Pet> pets) {
        this.pets = pets;
    }
}

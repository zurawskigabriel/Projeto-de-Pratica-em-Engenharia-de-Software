package com.timebravo.api_principal.dtos;

public class PetFavoritoDTO {

    private Long id;
    private Long idUsuario;
    private PetDTO pet;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public PetDTO getPet() { return pet; }
    public void setPet(PetDTO pet) { this.pet = pet; }
}

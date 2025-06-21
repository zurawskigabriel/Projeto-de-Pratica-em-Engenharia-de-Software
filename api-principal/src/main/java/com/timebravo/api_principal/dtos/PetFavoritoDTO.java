package com.timebravo.api_principal.dtos;

import jakarta.validation.constraints.*;

public class PetFavoritoDTO {

    private Long id;

    @NotNull
    private Long idUsuario;

    @NotNull
    private Long idPet;

    private PetDTO pet;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Long idUsuario) { this.idUsuario = idUsuario; }

    public Long getIdPet() { return idPet; }
    public void setIdPet(Long idPet) { this.idPet = idPet; }

    public PetDTO getPet() { return pet; }
    public void setPet(PetDTO petDTO) { this.pet = petDTO; }
}

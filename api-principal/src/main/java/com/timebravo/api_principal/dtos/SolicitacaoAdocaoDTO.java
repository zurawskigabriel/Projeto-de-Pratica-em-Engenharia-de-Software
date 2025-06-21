package com.timebravo.api_principal.dtos;

public class SolicitacaoAdocaoDTO 
{
    private Long id;

    private PetDTO pet;
    private UsuarioDTO protetor;
    private UsuarioDTO adotante;

    private String situacao;

    private Long idPet;
    private Long idAdotante;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PetDTO getPet() { return pet; }
    public void setPet(PetDTO pet) { this.pet = pet; }

    public UsuarioDTO getProtetor() { return protetor; }
    public void setProtetor(UsuarioDTO protetor) { this.protetor = protetor; }

    public UsuarioDTO getAdotante() { return adotante; }
    public void setAdotante(UsuarioDTO adotante) { this.adotante = adotante; }

    public Long getPetId() {
        return pet != null ? pet.getId() : null;
    }

    public Long getProtetorId() {
        return protetor != null ? protetor.getId() : null;
    }

    public Long getAdotanteId() {
        return adotante != null ? adotante.getId() : null;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public Long getIdPet() { return idPet; }
    public void setIdPet(Long idPet) { this.idPet = idPet; }

    public Long getIdAdotante() { return idAdotante; }
    public void setIdAdotante(Long idAdotante) { this.idAdotante = idAdotante; }
}

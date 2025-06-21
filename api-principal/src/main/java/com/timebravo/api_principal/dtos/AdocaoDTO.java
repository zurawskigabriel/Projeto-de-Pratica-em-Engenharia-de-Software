package com.timebravo.api_principal.dtos;

import com.timebravo.api_principal.entities.Adocao;
import com.timebravo.api_principal.entities.Adocao.StatusAdocao;
import jakarta.validation.constraints.NotNull;

public class AdocaoDTO {

    private Long id;

    private Long idPet;

    @NotNull(message = "O ID do adotante é obrigatório")
    private Long idAdotante;

    @NotNull(message = "O ID do protetor é obrigatório")
    private Long idProtetor;

    @NotNull(message = "O status da adoção é obrigatório")
    private StatusAdocao status;

    public AdocaoDTO() {}

    public AdocaoDTO(Adocao adocao) {
        this.id = adocao.getId();
        this.idPet = adocao.getId();
        this.idAdotante = adocao.getAdotante().getId();
        this.idProtetor = adocao.getProtetor().getId();
        this.status = adocao.getStatus();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdPet() { return idPet; }
    public void setIdPet(Long idPet) { this.idPet = idPet; }

    public Long getIdAdotante() { return idAdotante; }
    public void setIdAdotante(Long idAdotante) { this.idAdotante = idAdotante; }

    public Long getIdProtetor() {
        return idProtetor;
    }

    public void setIdProtetor(Long idProtetor) {
        this.idProtetor = idProtetor;
    }

    public StatusAdocao getStatus() { return status; }
    public void setStatus(StatusAdocao status) { this.status = status; }
}

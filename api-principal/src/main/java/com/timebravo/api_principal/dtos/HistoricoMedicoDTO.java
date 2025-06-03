package com.timebravo.api_principal.dtos;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import com.timebravo.api_principal.entities.HistoricoMedicoPet.Tipo;

import java.time.LocalDate;

public class HistoricoMedicoDTO {

    private Long id;

    @NotNull(message = "O ID do pet é obrigatório")
    private Long idPet;

    @Size(max = 200, message = "A descrição deve ter no máximo 200 caracteres")
    private String descricao;

    @Size(max = 255, message = "O nome do documento deve ter no máximo 255 caracteres")
    private String documento;

    @NotNull(message = "O tipo é obrigatório")
    private Tipo tipo;

    private LocalDate data;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getIdPet() { return idPet; }
    public void setIdPet(Long idPet) { this.idPet = idPet; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }

    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}

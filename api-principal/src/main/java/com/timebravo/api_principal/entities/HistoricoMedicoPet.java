package com.timebravo.api_principal.entities;

import java.time.LocalDate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.persistence.*;

@Entity
@Table(name = "historico_medico_pet")
public class HistoricoMedicoPet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_historico_medico_pet")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "Id_pet", nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_historico_medico_pet",
            foreignKeyDefinition = "FOREIGN KEY (Id_pet) REFERENCES pet(Id_pet) ON DELETE CASCADE"
        )
    )
    private Pet pet;

    @Size(max = 100)
    @Column(name = "Hospital", length = 100)
    private String hospital;

    @Lob
    @Column(name = "Resultado")
    private String resultado;

    @Lob
    @Column(name = "Tratamento")
    private String tratamento;

    @Size(max = 255)
    @Column(name = "Documento", length = 255)
    private String documento;

    @Column(name = "Data")
    private LocalDate data;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public String getHospital() { return hospital; }
    public void setHospital(String hospital) { this.hospital = hospital; }

    public String getResultado() { return resultado; }
    public void setResultado(String resultado) { this.resultado = resultado; }

    public String getTratamento() { return tratamento; }
    public void setTratamento(String tratamento) { this.tratamento = tratamento; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }
}


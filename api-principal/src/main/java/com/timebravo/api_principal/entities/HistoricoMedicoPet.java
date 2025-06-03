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

    public enum Tipo {
        VACINA("Vacina"),
        REMEDIO("Remédio"),
        DOENCA("Doença"),
        TRATAMENTO("Tratamento"),
        RESULTADO_EXAME("Resultado exame"),
        HISTORICO("Histórico"),
        RESTRICAO_MOBILIDADE("Restrição Mobilidade"),
        COMPORTAMENTO("Comportamento"),
        ALIMENTACAO("Alimentação"),
        OUTROS("Outros");
        
        private final String descricao;
        
        Tipo(String descricao) {
            this.descricao = descricao;
        }
        
        public String getDescricao() {
            return descricao;
        }
    }

    @NotNull(message = "O tipo é obrigatório")
    @Column(name = "Tipo", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private Tipo tipo;
    
    @Size(max = 200)
    @Column(name = "Descricao", length = 200)
    private String descricao;

    @Column(name = "Data")
    private LocalDate data;

    @Size(max = 255)
    @Column(name = "Documento", length = 255)
    private String documento;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public Tipo getTipo() { return tipo; }
    public void setTipo(Tipo tipo) { this.tipo = tipo; }

    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) {  this.descricao = descricao; }

    public LocalDate getData() { return data; }
    public void setData(LocalDate data) { this.data = data; }

    public String getDocumento() { return documento; }
    public void setDocumento(String documento) { this.documento = documento; }
}


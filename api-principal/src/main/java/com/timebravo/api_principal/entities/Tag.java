package com.timebravo.api_principal.entities;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_tag")
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(name = "Nome", nullable = false, length = 50)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "Id_categoria",
        foreignKey = @ForeignKey(
            name = "fk_tag_categoria",
            foreignKeyDefinition = "FOREIGN KEY (Id_categoria) REFERENCES categorias(Id_categoria) ON DELETE SET NULL"
        )
    )
    private Categoria categoria;

    @OneToMany(
         mappedBy = "tag",
         cascade = CascadeType.REMOVE,
         orphanRemoval = true,
         fetch = FetchType.LAZY
     )
     private List<TagsPet> tagsPet = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
}

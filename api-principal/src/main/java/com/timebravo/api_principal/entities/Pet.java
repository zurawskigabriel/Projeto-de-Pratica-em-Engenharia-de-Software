package com.timebravo.api_principal.entities;

import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.*;

@Entity
@Table(name = "Pet")
public class Pet {

    public enum PetPorte {
        ANAO, PEQUENO, MEDIO, GRANDE, GIGANTE
    }

    @Column(name = "Sexo", length = 1)
    private char sexo;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id_pet")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "Id_usuario", nullable = false)
    private Usuario usuario;

    @Column(name = "Nome", nullable = false, length = 100)
    private String nome;

    @Column(name = "Especie", nullable = false, length = 50)
    private String especie;

    @Column(name = "Idade")
    private Integer idade;

    @Enumerated(EnumType.STRING)
    @Column(name = "Porte", length = 20)
    private PetPorte porte;

    @Column(name = "Peso")
    private Double peso;

    @Lob
    @Column(name = "Bio")
    private String bio;

    @Lob
    @Column(name = "Fotos")
    private byte[] fotos;

    @OneToMany(
    mappedBy = "pet",
    cascade = CascadeType.REMOVE,
    orphanRemoval = true
    )
    private List<Adocao> adocoes = new ArrayList<>();

    @OneToMany(
         mappedBy = "pet",
         cascade = CascadeType.REMOVE,
         orphanRemoval = true,
         fetch = FetchType.LAZY
     )
     private List<HistoricoMedicoPet> historicoMedico = new ArrayList<>();

     @OneToMany(
         mappedBy = "pet",
         cascade = CascadeType.REMOVE,
         orphanRemoval = true,
         fetch = FetchType.LAZY
     )
     private List<TagsPet> tagsPet = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Usuario getUsuario() { return usuario; }
    public void setUsuario(Usuario usuario) { this.usuario = usuario; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public String getEspecie() { return especie; }
    public void setEspecie(String especie) { this.especie = especie; }

    public Integer getIdade() { return idade; }
    public void setIdade(Integer idade) { this.idade = idade; }

    public PetPorte getPorte() { return porte; }
    public void setPorte(PetPorte porte) { this.porte = porte; }

    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }

    public char getSexo() { return sexo; }
    public void setSexo(char sexo) { this.sexo = sexo; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public byte[] getFotos() { return fotos; }
    public void setFotos(byte[] fotos) { this.fotos = fotos; }

    public List<Adocao> getAdocoes() { return adocoes; }
    public void setAdocoes(List<Adocao> adocoes) { this.adocoes = adocoes; }

    public List<HistoricoMedicoPet> getHistoricoMedico() { return historicoMedico; }
    public void setHistoricoMedico(List<HistoricoMedicoPet> historicoMedico) { this.historicoMedico = historicoMedico; }

     public List<TagsPet> getTagsPet() { return tagsPet; }
     public void setTagsPet(List<TagsPet> tagsPet) { this.tagsPet = tagsPet; }
}

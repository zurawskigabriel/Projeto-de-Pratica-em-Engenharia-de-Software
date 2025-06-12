package com.timebravo.match;

public class PetDto {
    private Long id;
    private String nome;
    private String especie;
    private String raca;
    private Integer idade;
    private Pet.PetPorte porte;

    public PetDto() {}

    public PetDto(Long id, String nome, String especie, String raca,
                  Integer idade, Pet.PetPorte porte) {
        this.id = id;
        this.nome = nome;
        this.especie = especie;
        this.raca = raca;
        this.idade = idade;
        this.porte = porte;
    }

    public static PetDto from(Pet p) {
        return new PetDto(
            p.getId(),
            p.getNome(),
            p.getEspecie(),
            p.getRaca(),
            p.getIdade(),
            p.getPorte()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public String getRaca() {
        return raca;
    }

    public void setRaca(String raca) {
        this.raca = raca;
    }

    public Integer getIdade() {
        return idade;
    }

    public void setIdade(Integer idade) {
        this.idade = idade;
    }

    public Pet.PetPorte getPorte() {
        return porte;
    }

    public void setPorte(Pet.PetPorte porte) {
        this.porte = porte;
    }
}

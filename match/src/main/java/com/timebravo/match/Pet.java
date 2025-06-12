package com.timebravo.match;

public class Pet {
    private Long id;
    private String nome;
    private String especie;
    private String raca;
    private Integer idade;
    private PetPorte porte;

    public enum PetPorte {
        ANAO, PEQUENO, MEDIO, GRANDE, GIGANTE
    }

    // Construtor usado no Main (ajuste os parâmetros conforme a chamada em Main.java)
    public Pet(Long id, String nome, String especie, String raca,
               Integer idade, PetPorte porte) {
        this.id = id;
        this.nome = nome;
        this.especie = especie;
        this.raca = raca;
        this.idade = idade;
        this.porte = porte;
    }

    // Getters (pelo menos os que o MatchService/Main precisa)
    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getEspecie() { return especie; }
    public String getRaca() { return raca; }
    public Integer getIdade() { return idade; }
    public PetPorte getPorte() { return porte; }

    // Se quiser setters (opcional)
    public void setId(Long id) { this.id = id; }
    public void setNome(String nome) { this.nome = nome; }
    public void setEspecie(String especie) { this.especie = especie; }
    public void setRaca(String raca) { this.raca = raca; }
    public void setIdade(Integer idade) { this.idade = idade; }
    public void setPorte(PetPorte porte) { this.porte = porte; }
}

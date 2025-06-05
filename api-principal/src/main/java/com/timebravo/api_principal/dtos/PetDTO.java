package com.timebravo.api_principal.dtos;

import jakarta.validation.constraints.*;
import java.util.List;

public class PetDTO {

    private Long id;

    @NotNull(message = "O ID do usuário é obrigatório")
    private Long idUsuario;

    @NotBlank(message = "O nome é obrigatório")
    @Size(max = 100, message = "O nome deve ter no máximo 100 caracteres")
    private String nome;

    @NotBlank(message = "A espécie é obrigatória")
    @Size(max = 50, message = "A espécie deve ter no máximo 50 caracteres")
    private String especie;

    @NotBlank(message = "A raça é obrigatória")
    @Size(max = 70, message = "A raça deve ter no máximo 70 caracteres")
    private String raca;

    private Integer idade;

    @Pattern(
        regexp = "^(ANAO|PEQUENO|MEDIO|GRANDE|GIGANTE)?$", 
        message = "O porte deve ser um dos valores: ANAO, PEQUENO, MEDIO, GRANDE, GIGANTE"
    )
    private String porte;

    private Double peso;

    private char sexo;

    private String bio;

    private byte[] fotos;

    private List<HistoricoMedicoDTO> historicoMedico;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getIdUsuario() {
        return idUsuario;
    }

    public void setIdUsuario(Long idUsuario) {
        this.idUsuario = idUsuario;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getRaca() {
        return raca;
    }

    public void setRaca(String raca) {
        this.raca = raca;
    }

    public String getEspecie() {
        return especie;
    }

    public void setEspecie(String especie) {
        this.especie = especie;
    }

    public Integer getIdade() {
        return idade;
    }

    public void setIdade(Integer idade) {
        this.idade = idade;
    }

    public String getPorte() {
        return porte;
    }

    public void setPorte(String porte) {
        this.porte = porte;
    }

    public Double getPeso() {
        return peso;
    }

    public void setPeso(Double peso) {
        this.peso = peso;
    }

    public char getSexo() {
        return sexo;
    }

    public void setSexo(char sexo) {
        this.sexo = sexo;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public byte[] getFotos() {
        return fotos;
    }

    public void setFotos(byte[] fotos) {
        this.fotos = fotos;
    }

    public List<HistoricoMedicoDTO> getHistoricoMedico() {
        return this.historicoMedico;
    }

    public void setHistoricoMedico(List<HistoricoMedicoDTO> historicoMedico) {
        this.historicoMedico = historicoMedico;
    }
}

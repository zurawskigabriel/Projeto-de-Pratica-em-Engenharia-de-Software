package com.timebravo.match;

public class MatchDto {
    private Long usuarioId;
    private PetDto pet;      // antes: petId
    private double score;

    public MatchDto() {}

    public MatchDto(Long usuarioId, PetDto pet, double score) {
        this.usuarioId = usuarioId;
        this.pet       = pet;
        this.score     = score;
    }

    public static MatchDto from(MatchResult mr) {
        return new MatchDto(
            mr.getUsuario().getId(),
            PetDto.from(mr.getPet()),   // agora todo o PetDto
            mr.getScore()
        );
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public PetDto getPet() {
        return pet;
    }

    public void setPet(PetDto pet) {
        this.pet = pet;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }
}

package com.timebravo.match;

public class MatchDto {
    private Long usuarioId;
    private Long petId;
    private double score;

    public MatchDto() {}

    public MatchDto(Long usuarioId, Long petId, double score) {
        this.usuarioId = usuarioId;
        this.petId = petId;
        this.score = score;
    }

    public static MatchDto from(MatchResult mr) {
        return new MatchDto(
            mr.getUsuario().getId(),
            mr.getPet().getId(),
            mr.getScore()
        );
    }

    public Long getUsuarioId() {
        return usuarioId;
    }

    public void setUsuarioId(Long usuarioId) {
        this.usuarioId = usuarioId;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public double getScore() {
        return score;
    }

    public void setScore(double score) {
        this.score = score;
    }
}

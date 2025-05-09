package com.timebravo.api_principal.entities;

import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Objects;

@Entity
@Table(name = "tags_pet")
@IdClass(TagsPet.TagsPetId.class)
public class TagsPet {

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "Id_pet", nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_tagspet_pet",
            foreignKeyDefinition = 
                "FOREIGN KEY (Id_pet) REFERENCES pet(Id_pet) ON DELETE CASCADE"
        )
    )
    private Pet pet;

    @Id
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "Id_tag", nullable = false,
        foreignKey = @ForeignKey(
            name = "fk_tagspet_tag",
            foreignKeyDefinition = 
                "FOREIGN KEY (Id_tag) REFERENCES tags(Id_tag) ON DELETE CASCADE"
        )
    )
    private Tag tag;

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public Tag getTag() { return tag; }
    public void setTag(Tag tag) { this.tag = tag; }

    public static class TagsPetId implements Serializable {
        private Long pet;
        private Long tag;
        public TagsPetId() {}
        public TagsPetId(Long pet, Long tag) { this.pet = pet; this.tag = tag; }
        @Override public boolean equals(Object o) {
            if (this == o) return true;
            if (!(o instanceof TagsPetId)) return false;
            TagsPetId that = (TagsPetId) o;
            return Objects.equals(pet, that.pet) && Objects.equals(tag, that.tag);
        }
        @Override public int hashCode() {
            return Objects.hash(pet, tag);
        }
    }
}

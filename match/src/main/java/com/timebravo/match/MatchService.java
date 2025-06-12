package com.timebravo.match;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class MatchService {
    private final ChatGptClient client = new ChatGptClient();

    /**
     * Gera relatório de compatibilidade entre um único usuário e vários pets.
     *
     * @param usuario o adotante a ser avaliado
     * @param pets    a lista de pets a comparar
     * @return lista de MatchResult ordenada por score decrescente
     */
    public List<MatchResult> geraRelatorioCompatibilidade(
            Usuario usuario,
            List<Pet> pets
    ) {
        List<MatchResult> resultados = new ArrayList<>();

        for (Pet p : pets) {
            // Monta o prompt incluindo dados do único usuário e do pet atual
            String prompt = String.format(
                "Avalie a compatibilidade entre adotante:\n" +
                "Nome: %s, Tipo: %s, Perfil: %s,\n" +
                "e pet:\n" +
                "Nome: %s, Espécie: %s, Raça: %s, Idade: %d, Porte: %s.\n" +
                "Retorne um número (0.0 a 1.0) indicando a chance de adoção bem-sucedida.",
                usuario.getNome(),
                usuario.getTipo(),
                usuario.getPerfilUsuario(),
                p.getNome(),
                p.getEspecie(),
                p.getRaca(),
                p.getIdade(),
                p.getPorte()
            );

            try {
                double score = client.calcularCompatibilidade(prompt);
                resultados.add(new MatchResult(usuario, p, score));
            } catch (IOException e) {
                // Em caso de falha na chamada ao GPT, atribui score mínimo
                resultados.add(new MatchResult(usuario, p, 0.0));
            }
        }

        // Ordena do maior para o menor score
        resultados.sort(Comparator.comparingDouble(MatchResult::getScore).reversed());
        return resultados;
    }
}

// Classe para guardar o resultado de compatibilidade
class MatchResult {
    private final Usuario usuario;
    private final Pet pet;
    private final double score;

    public MatchResult(Usuario usuario, Pet pet, double score) {
        this.usuario = usuario;
        this.pet = pet;
        this.score = score;
    }

    public Usuario getUsuario() { return usuario; }
    public Pet getPet() { return pet; }
    public double getScore() { return score; }
}

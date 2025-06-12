package com.timebravo.match;

import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/matches")
public class MatchController {

    private final MatchService matchService;

    public MatchController(MatchService matchService) {
        this.matchService = matchService;
    }

    @PostMapping
    public List<MatchDto> calculaMatches(@RequestBody MatchRequest request) {
        return matchService
            .geraRelatorioCompatibilidade(request.getUsuario(), request.getPets())
            .stream()
            .map(MatchDto::from)
            .collect(Collectors.toList());
    }
}

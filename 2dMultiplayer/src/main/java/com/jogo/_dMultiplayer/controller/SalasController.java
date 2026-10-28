package com.jogo._dMultiplayer.controller;

import com.jogo._dMultiplayer.event.SalasMudaramEvent;
import com.jogo._dMultiplayer.model.Salas;
import com.jogo._dMultiplayer.service.SalasService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/salas")
@RequiredArgsConstructor
public class SalasController {
    private final SalasService salasService;
    private final ApplicationEventPublisher publisher;
    @GetMapping
    public List<Salas> findAll() {
        return salasService.findAll();
    }

    @PostMapping
    public Salas criar(@RequestBody CriarSalaRequest request) {
        if (request.capacidade() < 2 || request.capacidade() > 8) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "A capacidade da sala deve ser entre 2 e 8 jogadores"
            );
        }
        Salas salva = salasService.criar(request.capacidade());
        publisher.publishEvent(new SalasMudaramEvent());
        return salva;
    }

    public record CriarSalaRequest(int capacidade) {}

    @DeleteMapping
    public void delete(@RequestBody Salas salas) {
        salasService.delete(salas);
    }

    @GetMapping("/{id}")
    public Salas findById(@PathVariable int id) {
        return salasService.findById(id);
    }

    @GetMapping("/{codigo}")
    public Salas findByCodigo(@PathVariable String codigo) {
        return salasService.findByCodigo(codigo);
    }
}

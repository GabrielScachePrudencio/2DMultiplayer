package com.jogo._dMultiplayer.service;

import com.jogo._dMultiplayer.model.Salas;
import com.jogo._dMultiplayer.repository.SalaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SalasService {
    private final SalaRepository salaRepository;

    public List<Salas> findAll() {
        return salaRepository.findAll();
    }

    public Salas save(Salas salas) {
        return salaRepository.save(salas);
    }

    public Salas criar(int capacidade) {
        Salas sala = new Salas();
        sala.setCapacidade(capacidade);
        sala.setDatacriacao(LocalDateTime.now());

        String codigo;
        do {
            codigo = UUID.randomUUID().toString().replace("-", "")
                    .substring(0, 6).toUpperCase(Locale.ROOT);
        } while (findByCodigo(codigo) != null);

        sala.setCodigo(codigo);
        sala.setNome("Sala " + codigo);
        return salaRepository.save(sala);
    }

    public void delete(Salas salas) {
        salaRepository.delete(salas);
    }

    public Salas findById(int id) {
        return salaRepository.findById(id).orElse(null);
    }

    public Salas findByCodigo(String codigo) {
        return salaRepository.findByCodigo(codigo).orElse(null);
    }


}

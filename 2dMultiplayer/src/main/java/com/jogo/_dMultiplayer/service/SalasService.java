package com.jogo._dMultiplayer.service;

import com.jogo._dMultiplayer.model.Salas;
import com.jogo._dMultiplayer.repository.SalaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

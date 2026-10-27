package com.jogo._dMultiplayer.service;

import com.jogo._dMultiplayer.model.Classes;
import com.jogo._dMultiplayer.model.Salas;
import com.jogo._dMultiplayer.repository.ClassesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ClassesService {
    private final ClassesRepository classesRepository;

    public Optional<Classes> findById(int id) {
        return classesRepository.findById(id);
    }
    public List<Classes> findAll() {
        return classesRepository.findAll();
    }

}

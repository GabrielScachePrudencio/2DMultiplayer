package com.jogo._dMultiplayer.controller;

import com.jogo._dMultiplayer.model.Classes;
import com.jogo._dMultiplayer.service.ClassesService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/classes")
@RequiredArgsConstructor
public class ClassesController {
    private final ClassesService classesService;

    @GetMapping
    public List<Classes> findAll() {
        return classesService.findAll();
    }
}

package com.jogo._dMultiplayer.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;

@Data
@Entity
@RequiredArgsConstructor
@Table(name = "salas")
public class Salas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;
    private String nome;
    private String codigo;
    @Column(name = "datacriacao")
    private LocalDateTime datacriacao;

    private int capacidade;


}

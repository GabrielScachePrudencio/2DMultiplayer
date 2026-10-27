package com.jogo._dMultiplayer.model;


import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "classes")
@RequiredArgsConstructor
@Data
public class Classes {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(name = "dano_fisico")
    private int danoFisico = 0;

    @Column(name = "dano_magico")
    private int danoMagico = 0;

    @Column(name = "defesa_fisica")
    private int defesaFisica = 0;

    @Column(name = "defesa_magica")
    private int defesaMagica = 0;

    private int sorte = 0;

    private int vida = 0;

    @Column(name = "datacriacao", updatable = false,
            insertable = false)
    private LocalDateTime dataCriacao;
}


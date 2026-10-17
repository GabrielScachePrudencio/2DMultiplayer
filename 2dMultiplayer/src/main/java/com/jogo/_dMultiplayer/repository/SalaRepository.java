package com.jogo._dMultiplayer.repository;

import com.jogo._dMultiplayer.model.Salas;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalaRepository extends JpaRepository<Salas, Integer> {
    Optional<Salas> findByCodigo(String codigo);
}

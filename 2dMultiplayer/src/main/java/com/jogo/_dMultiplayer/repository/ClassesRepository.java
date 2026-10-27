package com.jogo._dMultiplayer.repository;

import com.jogo._dMultiplayer.model.Classes;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.hibernate.Internal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ClassesRepository extends JpaRepository<Classes, Integer> {

}

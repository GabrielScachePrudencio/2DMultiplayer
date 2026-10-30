package com.jogo._dMultiplayer.model;

import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "habilidades")
public class Habilidade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoHabilidade tipo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CategoriaHabilidade categoria;

    @JdbcTypeCode(SqlTypes.JSON)

    @Column(columnDefinition = "JSON", nullable = false)
    private JsonNode efeito;

    private Double cooldown = 0.0;

    private Double duracao = 0.0;

    private Boolean ativo = true;

    @Column(name = "datacriacao", updatable = false)
    private LocalDateTime datacriacao;

    @PrePersist
    public void prePersist() {
        if (datacriacao == null) {
            datacriacao = LocalDateTime.now();
        }
    }

    public Habilidade() {
    }

    // Getters e Setters

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public TipoHabilidade getTipo() {
        return tipo;
    }

    public void setTipo(TipoHabilidade tipo) {
        this.tipo = tipo;
    }

    public CategoriaHabilidade getCategoria() {
        return categoria;
    }

    public void setCategoria(CategoriaHabilidade categoria) {
        this.categoria = categoria;
    }

    public JsonNode getEfeito() {
        return efeito;
    }

    public void setEfeito(JsonNode efeito) {
        this.efeito = efeito;
    }

    public Double getCooldown() {
        return cooldown;
    }

    public void setCooldown(Double cooldown) {
        this.cooldown = cooldown;
    }

    public Double getDuracao() {
        return duracao;
    }

    public void setDuracao(Double duracao) {
        this.duracao = duracao;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public LocalDateTime getDatacriacao() {
        return datacriacao;
    }

    public void setDatacriacao(LocalDateTime datacriacao) {
        this.datacriacao = datacriacao;
    }
}
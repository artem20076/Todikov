package ru.example.noir.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "fashion_products")
@Getter @Setter
public class FashionProduct {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;          // "Noir Вечернее платье с вышивкой"
    private String category;      // DRESSES, TOPS, BOTTOMS
    private String season;        // SS2024, FW2024
    private String description;
    private String composition;   // "Шелк 100%, ручная работа"
    private String sizes;         // "XS,S,M,L"
    private String imageUrl;
    private Double price;
}
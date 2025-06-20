package ru.example.edu.controller;

import org.springframework.web.bind.annotation.*;
import ru.example.edu.model.FashionProduct;
import ru.example.edu.repository.FashionCatalogRepository;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/component")
public class BoutiqueManagementController {
    private final FashionCatalogRepository repository;

    public BoutiqueManagementController(FashionCatalogRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<FashionProduct> getAllComponents() {
        return repository.findAll();
    }

    @GetMapping("/{id}")
    public FashionProduct getComponentById(@PathVariable long id) {
        return repository.findById(id).orElse(null);
    }

    @PostMapping
    public long addComponent(@RequestBody FashionProduct component) {
        FashionProduct saved = repository.save(component);
        return saved.getId();
    }

    @PutMapping("/{id}")
    public FashionProduct updateComponent(@PathVariable long id, @RequestBody FashionProduct component) {
        return repository.findById(id)
                .map(existing -> {
                    existing.setName(component.getName());
                    existing.setType(component.getType());
                    existing.setDescription(component.getDescription());
                    existing.setSpecs(component.getSpecs());
                    existing.setImageUrl(component.getImageUrl());
                    return repository.save(existing);
                })
                .orElse(null);
    }

    @DeleteMapping("/{id}")
    public void deleteComponent(@PathVariable long id) {
        repository.deleteById(id);
    }

    // Дополнительный endpoint для поиска
    @GetMapping("/search")
    public List<FashionProduct> searchComponents(@RequestParam String query) {
        return repository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(query, query);
    }
}
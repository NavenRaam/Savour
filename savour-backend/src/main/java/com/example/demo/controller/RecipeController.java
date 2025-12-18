package com.example.demo.controller;

import com.example.demo.model.Recipe;
import com.example.demo.repository.RecipeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin(origins = "http://localhost:3000") // Allow React to access this
public class RecipeController {

    @Autowired
    private RecipeRepository recipeRepository;

    // 1. Save a new recipe (When user clicks "Add to Collection")
    @PostMapping("/save")
    public Recipe saveRecipe(@RequestBody Recipe recipe) {
        return recipeRepository.save(recipe);
    }

    // 2. Get all saved recipes (For the "My Collection" page)
    @GetMapping("/all")
    public List<Recipe> getAllRecipes() {
        return recipeRepository.findAll();
    }
}
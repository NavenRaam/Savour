import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import './Cookbook.css';

function Cookbook() {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // Fetch recipes from Spring Boot on load
    useEffect(() => {
        axios.get('http://localhost:8080/api/recipes/all')
            .then(response => {
                setRecipes(response.data);
            })
            .catch(error => {
                console.error("Error fetching recipes:", error);
            });
    }, []);

    return (
        <div className="cookbook-container">
            {/* Navigation Header */}
            <header className="cookbook-header">
                <Link to="/" className="back-btn">← Back to Kitchen</Link>
                <h1>📖 My Cookbook</h1>
            </header>

            {/* Recipe Grid */}
            <div className="recipe-grid">
                {recipes.length === 0 ? (
                    <div className="empty-book">
                        <h3>Your cookbook is empty!</h3>
                        <Link to="/">Go generate some recipes</Link>
                    </div>
                ) : (
                    recipes.map((recipe) => (
                        <div key={recipe.id} className="book-card" onClick={() => setSelectedRecipe(recipe)}>
                            <div className="card-top">
                                <span className="meal-tag">{recipe.mealType || 'Dish'}</span>
                            </div>
                            <h3>{recipe.title}</h3>
                            <div className="card-info">
                                <span>⏱️ {recipe.cookingTime}</span>
                                <span>👥 {recipe.servings}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Full Recipe Modal (Popup) */}
            {selectedRecipe && (
                <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-btn" onClick={() => setSelectedRecipe(null)}>×</button>
                        
                        <h2>{selectedRecipe.title}</h2>
                        <div className="modal-meta">
                            <span>⏱️ {selectedRecipe.cookingTime}</span>
                            <span>👥 Serves {selectedRecipe.servings}</span>
                        </div>

                        <div className="modal-scroll">
                            <h4>🥕 Ingredients</h4>
                            <ul>
                                {/* Parse the string back to array if needed, or handle string */}
                                {selectedRecipe.ingredients.split(',').map((ing, i) => (
                                    <li key={i}>{ing.trim()}</li>
                                ))}
                            </ul>

                            <h4>📝 Instructions</h4>
                            <p>{selectedRecipe.instructions}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Cookbook;
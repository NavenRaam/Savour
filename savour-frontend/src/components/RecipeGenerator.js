import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RecipeGenerator.css';
import { Link } from 'react-router-dom';

function RecipeGenerator() {
    const [ingredients, setIngredients] = useState('');
    const [mealType, setMealType] = useState('Lunch');
    const [cuisine, setCuisine] = useState('Italian');
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saved, setSaved] = useState(false);

    // Load Google Fonts dynamically
    useEffect(() => {
        const link = document.createElement('link');
        link.href = 'https://fonts.googleapis.com/css2?family=Lato:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap';
        link.rel = 'stylesheet';
        document.head.appendChild(link);
    }, []);

    // Clear messages after timeout
    useEffect(() => {
        if (error || success) {
            const timer = setTimeout(() => {
                setError('');
                setSuccess('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error, success]);

    const generateRecipe = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        setRecipe(null); // Clear previous recipe for dramatic effect
        setSaved(false);

        try {
            const prompt = `Create a recipe using: ${ingredients}.
                            Meal: ${mealType}, Cuisine: ${cuisine}.
                            Return ONLY valid JSON.
                            Format:
                            {
                                "title": "Recipe Name",
                                "ingredients": ["Item 1", "Item 2"],
                                "instructions": "Step 1... Step 2...",
                                "cookingTime": "15 mins",
                                "servings": 2
                            }
                            Make sure 'ingredients' is a simple ARRAY OF STRINGS.`;

            const API_KEY = process.env.REACT_APP_GEMINI_API_KEY; 

            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
                { contents: [{ parts: [{ text: prompt }] }] }
            );

            const rawText = response.data.candidates[0].content.parts[0].text;
            const cleanJson = rawText.replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanJson);

            setRecipe(data);
            setSuccess('✨ Dish is ready!');

        } catch (error) {
            console.error("Error generating recipe:", error);
            
            // CHECK FOR SPECIFIC API ERRORS
            if (error.response) {
                // Status 429 = Too Many Requests (Rate Limit)
                if (error.response.status === 429) {
                    setError("⏳ The Chef is overwhelmed! (Rate limit reached). Please wait 1 minute and try again.");
                } 
                // Status 403 or 400 = Quota Exceeded / Billing Issues
                else if (error.response.status === 403 || error.response.status === 402) {
                    setError("🛑 Daily Quota Exceeded. The free API credits for today are finished.");
                }
                // Status 500 or 503 = Google's Servers are down
                else if (error.response.status === 503) {
                    setError("📡 Google's AI service is temporarily down. Please try again shortly.");
                }
                else {
                    setError(`Error: ${error.response.data.error?.message || "Something went wrong."}`);
                }
            } else {
                // Network error (User is offline, etc.)
                setError("🔌 Network Error. Please check your internet connection.");
            }
        }
        setLoading(false);
    };

    const saveRecipe = async () => {
        if (!recipe || !recipe.title) return;

        setLoading(true);
        const backendData = {
            title: recipe.title,
            ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.join(", ") : recipe.ingredients,
            instructions: recipe.instructions,
            mealType: mealType,
            cookingTime: recipe.cookingTime,
            servings: recipe.servings || 1
        };

        try {
            await axios.post('http://localhost:8080/api/recipes/save', backendData);
            setSuccess("Recipe saved to your cookbook!");
            setSaved(true);
        } catch (error) {
            console.error("Backend Error:", error);
            setError("Could not save to database.");
        }
        setLoading(false);
    };

    return (
        <div className="app-container">
            {/* Background decorative elements */}
            <div className="bg-pattern"></div>
            
            <header className="main-header">
                <div style={{ position: 'absolute', top: '80px', right: '50px' }}>
                    <Link to="/cookbook" className="cookbook-link-btn">
                        📖 My Cookbook
                    </Link>
                </div>
                <h1>Savour <span className="highlight">Kitchen</span></h1>
                <p>Curating AI-powered culinary masterpieces</p>
            </header>

            <div className="main-content">
                {/* Left Panel: The Kitchen (Inputs) */}
                <div className="panel input-panel">
                    <div className="panel-header">
                        <h2>The Pantry</h2>
                        <span className="subtitle">What are we cooking with?</span>
                    </div>

                    <div className="form-content">
                        <div className="input-group">
                            <label>🥕 Ingredients</label>
                            <textarea
                                className="chef-input"
                                placeholder="Chicken, rice, garlic..."
                                value={ingredients}
                                onChange={(e) => setIngredients(e.target.value)}
                            />
                        </div>

                        <div className="row-group">
                            <div className="input-group">
                                <label>🍽️ Meal Type</label>
                                <select 
                                    value={mealType} 
                                    onChange={(e) => setMealType(e.target.value)}
                                    className="chef-select"
                                >
                                    <option value="Breakfast">Breakfast</option>
                                    <option value="Lunch">Lunch</option>
                                    <option value="Snack">Snack</option>
                                    <option value="Dinner">Dinner</option>
                                    <option value="Dessert">Dessert</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label>🌎 Cuisine</label>
                                <select 
                                    value={cuisine} 
                                    onChange={(e) => setCuisine(e.target.value)}
                                    className="chef-select"
                                >
                                    <option value="Indian">🇮🇳 Indian</option>
                                    <option value="Italian">🇮🇹 Italian</option>
                                    <option value="American">🇺🇸 American</option>
                                    <option value="Mexican">🇲🇽 Mexican</option>
                                    <option value="Asian">🥢 Asian</option>
                                    <option value="Mediterranean">🫒 Mediterranean</option>
                                </select>
                            </div>
                        </div>

                        {error && <div className="msg error">{error}</div>}
                        {success && !recipe && <div className="msg success">{success}</div>}

                        <button 
                            className={`chef-btn generate ${loading ? 'cooking' : ''}`}
                            onClick={generateRecipe}
                            disabled={loading || !ingredients.trim()}
                        >
                            {loading ? (
                                <span>👨‍🍳 Chopping & Sautéing...</span>
                            ) : (
                                <span>🔥 Fire up the Stove</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right Panel: The Serving Table (Output) */}
                <div className="panel output-panel">
                    {!recipe && !loading && (
                        <div className="empty-state">
                            <div className="empty-icon">🍽️</div>
                            <h3>Your plate is empty</h3>
                            <p>Fill in the pantry details to cook something special.</p>
                        </div>
                    )}

                    {loading && !recipe && (
                        <div className="cooking-state">
                            <div className="steam-container">
                                <div className="steam s1"></div>
                                <div className="steam s2"></div>
                                <div className="steam s3"></div>
                            </div>
                            <div className="pan-icon">🍳</div>
                            <p>Consulting top chefs...</p>
                        </div>
                    )}

                    {recipe && (
                        <div className="recipe-card-paper">
                            <div className="card-header">
                                <span className="cuisine-tag">{cuisine}</span>
                                <h2>{recipe.title}</h2>
                                <div className="meta-tags">
                                    <span>⏱️ {recipe.cookingTime || 'N/A'}</span>
                                    <span>👥 {recipe.servings || 2} Servings</span>
                                </div>
                            </div>

                            <div className="card-body">
                                <div className="ingredients-list">
                                    <h4>Grocery List</h4>
                                    <ul>
                                        {Array.isArray(recipe.ingredients)
                                            ? recipe.ingredients.map((ing, i) => (
                                                <li key={i}>
                                                    <input type="checkbox" id={`ing-${i}`} />
                                                    <label htmlFor={`ing-${i}`}>
                                                        {typeof ing === 'object' ? `${ing.amount || ''} ${ing.item || ''}` : ing}
                                                    </label>
                                                </li>
                                            ))
                                            : <li>{recipe.ingredients}</li>
                                        }
                                    </ul>
                                </div>

                                <div className="instructions-list">
                                    <h4>Chef's Instructions</h4>
                                    <p>{recipe.instructions}</p>
                                </div>
                            </div>

                            <div className="card-footer">
                                {success && saved && <div className="msg success-sm">{success}</div>}
                                <button 
                                    className={`chef-btn save ${saved ? 'saved' : ''}`}
                                    onClick={saveRecipe}
                                    disabled={loading || saved}
                                >
                                    {saved ? '❤️ Saved to Cookbook' : '📖 Save Recipe'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default RecipeGenerator;
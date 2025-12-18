import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
console.log('API Key loaded:', API_KEY ? 'Yes' : 'No');

const genAI = new GoogleGenerativeAI(API_KEY);

export const fetchRecipesFromGemini = async (ingredients, persons) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash',generationConfig: { responseMimeType: "application/json" } });

    const prompt = `Generate 3 creative recipe suggestions using the following ingredients: ${ingredients}.
    The recipes should be for ${persons} person(s).
    For each recipe, provide:
    1. Recipe name
    2. Ingredients list with quantities scaled for ${persons} person(s)
    3. Step-by-step cooking instructions
    4. Estimated cooking time
    5. Difficulty level (Easy, Medium, Hard)

    Format each recipe clearly with headers and bullet points. Make sure the recipes are practical and use the given ingredients as the main components.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the response into structured recipe objects
    const recipes = parseRecipesFromText(text, persons);

    return recipes;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    console.log('Falling back to mock data...');
    // Fallback to mock data
    return getMockRecipes(ingredients, persons);
  }
};

const parseRecipesFromText = (text, persons) => {
  // Simple parsing logic - split by recipe names or sections
  const lines = text.split('\n').filter(line => line.trim());
  const recipes = [];
  let currentRecipe = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (line.match(/^### \*\*Recipe \d+: (.*)\*\*$/i) || line.match(/^[1-3]\.\s*Recipe\s*\d*:?\s*(.*)$/i) || line.match(/^Recipe\s*\d*:?\s*(.*)$/i) || line.match(/^(.*)\s*Recipe$/i)) {
      // New recipe
      if (currentRecipe) {
        recipes.push(currentRecipe);
      }
      let name = line;
      if (line.match(/^### \*\*Recipe \d+: (.*)\*\*$/i)) {
        name = line.match(/^### \*\*Recipe \d+: (.*)\*\*$/i)[1];
      } else {
        name = line.replace(/^[1-3]\.\s*Recipe\s*\d*:?\s*/i, '').replace(/^Recipe\s*\d*:?\s*/i, '').replace(/\s*Recipe$/i, '').trim();
      }

      currentRecipe = {
        id: recipes.length + 1,
        name: name,
        content: ''
      };
    } else if (currentRecipe) {
      currentRecipe.content += line + '\n';
    } else if (!currentRecipe && recipes.length === 0) {
      // First recipe might not have a clear header
      currentRecipe = {
        id: 1,
        name: 'Generated Recipe 1',
        content: line + '\n'
      };
    }
  }

  if (currentRecipe) {
    recipes.push(currentRecipe);
  }

  // If parsing failed, return the raw text as one recipe
  if (recipes.length === 0) {
    return [{
      id: 1,
      name: 'AI Generated Recipe',
      content: text
    }];
  }

  return recipes.slice(0, 3); // Return up to 3 recipes
};

const getMockRecipes = (ingredients, persons) => {
  // Mock recipe data - in real app, this would come from Gemini API
  const mockRecipes = [
    {
      id: 1,
      name: 'Chicken Fried Rice',
      content: `Ingredients for ${persons} persons:
• ${persons * 2} cups cooked rice
• ${persons * 1} cup cooked chicken, diced
• ${persons * 2} eggs, beaten
• ${persons * 1} cup mixed vegetables (carrots, peas, corn)
• ${persons * 2} tbsp soy sauce
• ${persons * 1} tbsp vegetable oil
• Salt and pepper to taste

Instructions:
1. Heat oil in a large wok or skillet over medium-high heat
2. Add vegetables and cook for 2-3 minutes
3. Push vegetables to one side, add eggs and scramble until cooked
4. Add chicken and cook for 2 minutes
5. Add rice, soy sauce, salt, and pepper
6. Stir-fry for 3-4 minutes until everything is well combined and heated through
7. Serve hot

Cooking time: 15 minutes
Difficulty: Easy`
    },
    {
      id: 2,
      name: 'Vegetable Stir-Fry with Rice',
      content: `Ingredients for ${persons} persons:
• ${persons * 2} cups cooked rice
• ${persons * 2} cups mixed vegetables (broccoli, bell peppers, carrots, snap peas)
• ${persons * 1} tbsp vegetable oil
• ${persons * 2} tbsp soy sauce
• ${persons * 1} tsp ginger, minced
• ${persons * 1} clove garlic, minced
• Salt and pepper to taste

Instructions:
1. Heat oil in a large skillet over medium-high heat
2. Add ginger and garlic, cook for 30 seconds
3. Add vegetables and stir-fry for 4-5 minutes until crisp-tender
4. Add soy sauce, salt, and pepper
5. Serve over rice

Cooking time: 10 minutes
Difficulty: Easy`
    },
    {
      id: 3,
      name: 'Simple Tomato Pasta',
      content: `Ingredients for ${persons} persons:
• ${persons * 4} oz pasta
• ${persons * 2} tomatoes, diced
• ${persons * 1} onion, chopped
• ${persons * 2} cloves garlic, minced
• ${persons * 2} tbsp olive oil
• Salt and pepper to taste
• Fresh basil (optional)

Instructions:
1. Cook pasta according to package directions
2. While pasta cooks, heat olive oil in a skillet
3. Add onion and garlic, cook until softened (3-4 minutes)
4. Add tomatoes, salt, and pepper, cook for 5-7 minutes
5. Drain pasta and toss with tomato sauce
6. Top with fresh basil if available

Cooking time: 15 minutes
Difficulty: Easy`
    }
  ];

  return mockRecipes;
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RecipeGenerator from './components/RecipeGenerator';
import Cookbook from './components/Cookbook'; // We will create this next
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<RecipeGenerator />} />
          <Route path="/cookbook" element={<Cookbook />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
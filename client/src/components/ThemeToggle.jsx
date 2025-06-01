import React from 'react';
import { FaMoon, FaSun } from 'react-icons/fa';
import '../styles/ThemeToggle.css';

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button 
      className={`theme-toggle ${isDarkMode ? 'dark' : 'light'}`} 
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {isDarkMode ? <FaSun /> : <FaMoon />}
    </button>
  );
};

export default ThemeToggle;
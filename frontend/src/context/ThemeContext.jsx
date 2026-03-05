import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Always dark mode - light mode has been removed
  const [isDarkMode] = useState(true);
  
  // Disable theme changes
  const [disableThemeChange, setDisableThemeChange] = useState(false);

  useEffect(() => {
    // Skip theme application if disabled
    if (disableThemeChange) return;
    
    // Always apply dark mode
    const root = window.document.documentElement;
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, [disableThemeChange]);

  // Theme toggle does nothing - kept for UI compatibility
  const toggleTheme = () => {
    // No-op - only dark mode supported
  };

  // Force dark mode (for preview/export)
  const forceLightMode = (force) => {
    // Still force dark mode - light mode removed
    const root = window.document.documentElement;
    root.classList.add('dark');
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode: true, toggleTheme, disableThemeChange, setDisableThemeChange, forceLightMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

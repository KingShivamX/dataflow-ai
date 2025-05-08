import { createContext, useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";

const TutorialContext = createContext();

export const TutorialProvider = ({ children }) => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [visitedPages, setVisitedPages] = useState(() => {
    const savedVisits = localStorage.getItem("visitedPages");
    return savedVisits ? JSON.parse(savedVisits) : {};
  });
  const [tutorialStep, setTutorialStep] = useState(0);
  const location = useLocation();

  // Check if we should show the tutorial on page load
  useEffect(() => {
    const path = location.pathname;
    const hasVisitedCurrentPage = visitedPages[path];
    
    // If this page hasn't been visited before, show the tutorial
    if (!hasVisitedCurrentPage) {
      // Small delay to ensure the page is fully loaded
      const timer = setTimeout(() => {
        setShowTutorial(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [location.pathname, visitedPages]);

  const startTutorial = () => {
    setShowTutorial(true);
    setTutorialStep(0);
  };

  const endTutorial = () => {
    // Mark the current page as visited
    const path = location.pathname;
    const updatedVisitedPages = {
      ...visitedPages,
      [path]: true
    };
    
    setVisitedPages(updatedVisitedPages);
    localStorage.setItem("visitedPages", JSON.stringify(updatedVisitedPages));
    setShowTutorial(false);
  };

  const resetTutorial = () => {
    // Reset all visited pages
    setVisitedPages({});
    localStorage.removeItem("visitedPages");
  };

  // Reset for a specific page
  const resetPageTutorial = (path) => {
    const updatedVisitedPages = { ...visitedPages };
    delete updatedVisitedPages[path];
    setVisitedPages(updatedVisitedPages);
    localStorage.setItem("visitedPages", JSON.stringify(updatedVisitedPages));
  };

  return (
    <TutorialContext.Provider
      value={{
        showTutorial,
        setShowTutorial,
        tutorialStep,
        setTutorialStep,
        startTutorial,
        endTutorial,
        resetTutorial,
        resetPageTutorial,
        visitedPages,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => useContext(TutorialContext); 
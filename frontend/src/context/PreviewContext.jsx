import React, { createContext, useContext, useState } from 'react';

const PreviewContext = createContext();

export const PreviewProvider = ({ children }) => {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('mye3_preview_view') || 'admin';
  });

  const handleSetActiveView = (view) => {
    setActiveView(view);
    localStorage.setItem('mye3_preview_view', view);
  };

  return (
    <PreviewContext.Provider value={{ activeView, setActiveView: handleSetActiveView }}>
      {children}
    </PreviewContext.Provider>
  );
};

export const usePreview = () => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error('usePreview must be used within a PreviewProvider');
  }
  return context;
};

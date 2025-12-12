import React from 'react';

export const Layout: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {children}
    </div>
  );
};
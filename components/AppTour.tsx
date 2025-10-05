import React, { useEffect } from 'react';

interface AppTourProps {
  onClose: () => void;
}

/**
 * AppTour Component
 *
 * Temporarily disabled feature to avoid build errors on Vercel.
 * Automatically triggers onClose when mounted.
 */
export const AppTour: React.FC<AppTourProps> = ({ onClose }) => {
  useEffect(() => {
    // Automatically close the tour when the component mounts
    onClose();
  }, [onClose]);

  // Return null so nothing is rendered on screen
  return null;
};

export default AppTour;

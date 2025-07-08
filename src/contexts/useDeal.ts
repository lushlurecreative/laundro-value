import { useContext } from 'react';
import { DealContext } from './DealContext';

export const useDeal = () => {
  const context = useContext(DealContext);
  if (context === undefined) {
    throw new Error('useDeal must be used within a DealProvider');
  }
  return context;
};
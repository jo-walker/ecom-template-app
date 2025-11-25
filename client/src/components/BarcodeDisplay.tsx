import React from 'react';

interface Props {
  barcode: string;
}

export const BarcodeDisplay: React.FC<Props> = ({ barcode }) => {
  return (
    <div className="bg-blue-50 p-6 rounded-lg mb-8 text-center">
      <p className="text-gray-600 mb-2">Generated Barcode:</p>
      <p className="text-4xl font-bold text-blue-600 font-mono">
        {barcode || 'Select all options'}
      </p>
    </div>
  );
};
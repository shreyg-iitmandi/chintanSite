
import React from 'react';

const Spinner = ({ size = '8' }: { size?: string }) => (
  <div className={`w-${size} h-${size} border-4 border-t-transparent border-blue-500 rounded-full animate-spin`}></div>
);

export default Spinner;

import React from 'react';

export function TailwindTest() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Tailwind CSS Test</h1>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
        <p>If you can see this green box with styled text, Tailwind CSS is working!</p>
      </div>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Styled Button
      </button>
    </div>
  );
}
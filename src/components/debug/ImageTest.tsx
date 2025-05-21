// File: frontend/src/components/debug/ImageTest.tsx
import React, { useState } from 'react';

const ImageTest: React.FC = () => {
  const [imageUrl, setImageUrl] = useState('');
  const [status, setStatus] = useState('');

  const testImage = (url: string) => {
    const img = new Image();
    img.onload = () => setStatus(`Success loading: ${url}`);
    img.onerror = () => setStatus(`Error loading: ${url}`);
    img.src = url;
    setImageUrl(url);
  };

  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Image URL Tester</h3>
      <div className="flex mb-4">
        <input 
          type="text" 
          className="flex-1 p-2 border rounded" 
          placeholder="Enter image URL to test"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />
        <button 
          className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => testImage(imageUrl)}
        >
          Test
        </button>
      </div>
      
      {status && <div className="mb-2 text-sm">{status}</div>}
      
      {imageUrl && (
        <div className="border p-2 rounded">
          <p className="text-sm mb-2">Image preview:</p>
          <img 
            src={imageUrl} 
            alt="Test" 
            className="max-w-full h-auto"
            onError={() => console.log("Error loading image in img tag")}
          />
        </div>
      )}
    </div>
  );
};

export default ImageTest;
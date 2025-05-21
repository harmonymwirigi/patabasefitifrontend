// frontend/src/components/debug/ImageDebugger.tsx
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../../config/constants';

interface ImageDebuggerProps {
  property: any;
}

const ImageDebugger: React.FC<ImageDebuggerProps> = ({ property }) => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  useEffect(() => {
    if (property && property.id) {
      checkPropertyImages(property.id);
    }
  }, [property]);

  const checkPropertyImages = async (propertyId: number) => {
    setLoading(true);
    try {
      // Corrected URL path - debug endpoints are directly on /api/ not /api/v1/
      const response = await fetch(`/api/debug/list-property-images/${propertyId}`);
      const data = await response.json();
      setDebugInfo(data);
    } catch (error) {
      console.error('Error fetching image debug info:', error);
      setDebugInfo({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const checkStaticFiles = async () => {
    setLoading(true);
    try {
      // Corrected URL path - debug endpoints are directly on /api/ not /api/v1/
      const response = await fetch(`/api/debug/check-static-files`);
      const data = await response.json();
      setDebugInfo({ ...debugInfo, staticFiles: data });
    } catch (error) {
      console.error('Error checking static files:', error);
      setDebugInfo({ ...debugInfo, staticFilesError: String(error) });
    } finally {
      setLoading(false);
    }
  };

  const checkImageUrl = async (imageUrl: string) => {
    if (!imageUrl) return;
    
    setLoading(true);
    try {
      // Extract the path without /uploads prefix for the debug endpoint
      const path = imageUrl.startsWith('/uploads/') ? imageUrl.substring(9) : imageUrl;
      // Use the direct API path, not the versioned one
      const response = await fetch(`/api/debug/image-url/${path}`);
      const data = await response.json();
      setDebugInfo({ ...debugInfo, imageCheck: data });
      return data;
    } catch (error) {
      console.error('Error checking image URL:', error);
      setDebugInfo({ ...debugInfo, imageCheckError: String(error) });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const testImage = (url: string) => {
    setExpandedImage(url);
    const img = new Image();
    img.onload = () => console.log(`Success loading: ${url}`);
    img.onerror = (e) => console.error(`Error loading: ${url}`, e);
    img.src = url;
  };

  if (!property) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-xl font-bold mb-2">Image Debugger</h2>
      
      {loading ? (
        <div className="text-center p-4">Loading debug information...</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="font-semibold mb-2">Property Images</h3>
              {property.images && property.images.length > 0 ? (
                <div>
                  <p>Found {property.images.length} images in property object</p>
                  <ul className="mt-2 text-sm">
                    {property.images.map((img: any, index: number) => (
                      <li key={img.id} className="mb-2 p-2 border rounded">
                        <div>ID: {img.id}</div>
                        <div>Path: {img.path}</div>
                        <div>Is Primary: {img.is_primary ? 'Yes' : 'No'}</div>
                        <div className="mt-1">
                          <strong>Constructed URL:</strong> {`/uploads/${img.path}`}
                        </div>
                        <div className="mt-1">
                          <button 
                            className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                            onClick={() => testImage(`/uploads/${img.path}`)}
                          >
                            Test Image
                          </button>
                          <button 
                            className="px-2 py-1 bg-green-500 text-white text-xs rounded ml-2"
                            onClick={() => checkImageUrl(`/uploads/${img.path}`)}
                          >
                            Debug URL
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p>No images found in property object</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Backend Image Check</h3>
              <button 
                className="px-3 py-1 bg-blue-600 text-white rounded mb-4"
                onClick={() => checkPropertyImages(property.id)}
                disabled={loading}
              >
                Refresh Image Info
              </button>
              
              <button 
                className="px-3 py-1 bg-green-600 text-white rounded mb-4 ml-2"
                onClick={checkStaticFiles}
                disabled={loading}
              >
                Check Static Files
              </button>
              
              {debugInfo && (
                <div className="text-sm">
                  {debugInfo.exists === false ? (
                    <div className="text-red-600">
                      Property directory does not exist at {debugInfo.property_dir}
                    </div>
                  ) : debugInfo.error ? (
                    <div className="text-red-600">Error: {debugInfo.error}</div>
                  ) : debugInfo.files ? (
                    <div>
                      <div className="text-green-600 mb-2">
                        Found {debugInfo.file_count} files in {debugInfo.property_dir}
                      </div>
                      <ul className="mt-2">
                        {debugInfo.files.map((file: any, i: number) => (
                          <li key={i} className="mb-2 p-2 border rounded">
                            <div>Filename: {file.filename}</div>
                            <div>Size: {file.size} bytes</div>
                            <div>URL: {file.url}</div>
                            <div className="mt-1">
                              <button 
                                className="px-2 py-1 bg-blue-500 text-white text-xs rounded"
                                onClick={() => testImage(file.url)}
                              >
                                Test Image
                              </button>
                              <button 
                                className="px-2 py-1 bg-green-500 text-white text-xs rounded ml-2"
                                onClick={() => checkImageUrl(file.url)}
                              >
                                Debug URL
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div>No file information available</div>
                  )}
                  
                  {debugInfo.staticFiles && (
                    <div className="mt-4 p-2 border rounded">
                      <h4 className="font-medium mb-1">Static Files Configuration</h4>
                      <div>Upload directory: {debugInfo.staticFiles.upload_directory}</div>
                      <div>Directory exists: {debugInfo.staticFiles.exists ? 'Yes' : 'No'}</div>
                      <div>Readable: {debugInfo.staticFiles.readable ? 'Yes' : 'No'}</div>
                      <div>Writable: {debugInfo.staticFiles.writable ? 'Yes' : 'No'}</div>
                      
                      {debugInfo.staticFiles.subdirectories && (
                        <div className="mt-1">
                          <strong>Subdirectories:</strong> {debugInfo.staticFiles.subdirectories.join(', ')}
                        </div>
                      )}
                      
                      {debugInfo.staticFiles.file_counts && (
                        <div className="mt-1">
                          <strong>File counts:</strong>
                          <ul className="ml-4">
                            {Object.entries(debugInfo.staticFiles.file_counts).map(([dir, count]) => (
                              <li key={dir}>{dir}: {count}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {expandedImage && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Image Preview</h3>
              <div className="border p-2 rounded">
                <p className="mb-2 text-sm break-all">Testing URL: {expandedImage}</p>
                <div className="flex flex-col items-center">
                  <img 
                    src={expandedImage} 
                    alt="Test" 
                    className="max-w-full h-auto max-h-64"
                    onError={(e) => {
                      console.error(`Failed to load image: ${expandedImage}`);
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzg4OCIgZHk9Ii4zZW0iPkVycm9yIExvYWRpbmcgSW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
                  />
                  <p className="mt-2 text-sm">
                    If you don't see an image above, check the console for errors.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-4 text-sm text-gray-600">
            <h3 className="font-semibold mb-1">Image Loading Steps</h3>
            <ol className="list-decimal ml-5">
              <li>Backend uploads files to <code>./uploads/properties/{property.id}/[filename]</code></li>
              <li>Backend mounts static files at <code>/uploads</code> URL path</li>
              <li>Frontend should access images at <code>/uploads/properties/{property.id}/[filename]</code></li>
              <li>If image doesn't load, check network tab for 404 errors and verify URL is correct</li>
            </ol>
          </div>
        </>
      )}
    </div>
  );
};

export default ImageDebugger;
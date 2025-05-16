// File: frontend/src/components/common/FileUploader.tsx
// Status: COMPLETE
// Dependencies: react

import React, { useState, useRef } from 'react';

interface FileUploaderProps {
  onFilesChange: (files: File[]) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  maxSize?: number;
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  onFilesChange,
  multiple = false,
  accept = '*',
  maxFiles = 10,
  maxSize = 5 * 1024 * 1024, // 5MB default
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFiles = (files: FileList | null): File[] => {
    if (!files) return [];
    
    setError(null);
    const validFiles: File[] = [];
    const currentCount = selectedFiles.length;
    
    // Convert FileList to array for easier processing
    const fileArray = Array.from(files);
    
    // Check if too many files are being added
    if (currentCount + fileArray.length > maxFiles) {
      setError(`You can only upload up to ${maxFiles} files`);
      return [];
    }
    
    // Validate each file
    for (const file of fileArray) {
      // Check file size
      if (file.size > maxSize) {
        setError(`File "${file.name}" is too large. Maximum size is ${maxSize / (1024 * 1024)}MB.`);
        continue;
      }
      
      // Check file type if accept is specified
      if (accept !== '*') {
        const acceptTypes = accept.split(',').map(type => type.trim());
        const fileType = file.type;
        
        const isAcceptedType = acceptTypes.some(type => {
          if (type.endsWith('/*')) {
            // Handle wildcard MIME types (e.g., "image/*")
            const baseType = type.split('/')[0];
            return fileType.startsWith(`${baseType}/`);
          }
          return type === fileType;
        });
        
        if (!isAcceptedType) {
          setError(`File "${file.name}" is not an accepted file type.`);
          continue;
        }
      }
      
      validFiles.push(file);
    }
    
    return validFiles;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      if (multiple) {
        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);
        onFilesChange(newFiles);
      } else {
        setSelectedFiles([validFiles[0]]);
        onFilesChange([validFiles[0]]);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const validFiles = validateFiles(files);
    
    if (validFiles.length > 0) {
      if (multiple) {
        const newFiles = [...selectedFiles, ...validFiles];
        setSelectedFiles(newFiles);
        onFilesChange(newFiles);
      } else {
        setSelectedFiles([validFiles[0]]);
        onFilesChange([validFiles[0]]);
      }
    }
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    onFilesChange(newFiles);
  };

  // Format file size for display
  const formatFileSize = (size: number): string => {
    if (size < 1024) {
      return `${size} bytes`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={handleButtonClick}
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className="hidden"
        />
        
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        
        <p className="mt-2 text-sm text-gray-600">
          Drag & drop your files here, or <span className="text-blue-600 font-medium">browse</span>
        </p>
        
        <p className="mt-1 text-xs text-gray-500">
          {multiple ? `Up to ${maxFiles} files` : 'One file'}, max {maxSize / (1024 * 1024)}MB each
        </p>
      </div>
      
      {error && (
        <div className="mt-2 text-sm text-red-600">{error}</div>
      )}
      
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Selected Files ({selectedFiles.length})
          </p>
          
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between bg-gray-50 rounded-md p-2 text-sm">
                <div className="flex items-center space-x-2 truncate">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate">{file.name}</span>
                  <span className="text-gray-500">({formatFileSize(file.size)})</span>
                </div>
                
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
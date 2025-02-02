'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-hot-toast';
import { validateImage, uploadImage, compressImage } from '@/lib/imageUpload';

export default function ImageUpload({ onUpload, value }) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(value);

  const handleUpload = async (file) => {
    try {
      setIsUploading(true);

      // Validate the image
      await validateImage(file);

      // Compress the image
      const compressedFile = await compressImage(file);

      // Upload the compressed image
      const imageUrl = await uploadImage(compressedFile);

      // Update the preview
      setPreview(imageUrl);

      // Call the onUpload callback with the image URL
      onUpload(imageUrl);

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      await handleUpload(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-500'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-2 text-sm text-gray-500">Uploading...</p>
          </div>
        ) : preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="max-h-48 mx-auto rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg">
              <p className="text-white text-sm">Click or drag to replace</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <p className="font-medium">
                {isDragActive ? 'Drop the image here' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs">PNG, JPG, WebP up to 5MB</p>
            </div>
          </div>
        )}
      </div>

      {preview && (
        <button
          type="button"
          onClick={() => {
            setPreview(null);
            onUpload(null);
          }}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Remove image
        </button>
      )}
    </div>
  );
}

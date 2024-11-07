import React, { useRef, useState } from 'react';
import { Camera, X } from 'lucide-react';
import { uploadImage, deleteImage } from '../lib/supabase';

interface ImageUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ImageUpload({ photos, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    setError('');

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload only JPEG, PNG, or WebP images.');
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 2MB.');
      return false;
    }

    return true;
  };

  const handleUpload = async (file: File) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setError('');

    try {
      const publicUrl = await uploadImage(file);
      onChange([...photos, publicUrl]);
    } catch (err: any) {
      console.error('Upload error:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleUpload(file);
    }
    e.target.value = '';
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removePhoto = async (photoUrl: string) => {
    try {
      await deleteImage(photoUrl);
      onChange(photos.filter(photo => photo !== photoUrl));
    } catch (err) {
      console.error('Error removing photo:', err);
      setError('Failed to remove photo. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo, index) => (
          <div key={index} className="relative group aspect-square">
            <img
              src={photo}
              alt={`Car photo ${index + 1}`}
              className="h-full w-full object-cover rounded-lg"
            />
            <button
              type="button"
              onClick={() => removePhoto(photo)}
              className="absolute -top-2 -right-2 bg-red-100 rounded-full p-1 text-red-600 hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer
            ${uploading ? 'bg-gray-50 border-gray-300' : 'border-gray-300 hover:border-indigo-500 hover:bg-indigo-50'}
            transition-colors`}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
              <span className="text-sm text-gray-500">Uploading...</span>
            </>
          ) : (
            <>
              <Camera className="h-8 w-8 text-gray-400" />
              <div className="text-sm text-gray-500 text-center">
                <span className="text-indigo-600 font-medium">
                  Click to upload
                </span>{' '}
                or drag and drop
              </div>
              <p className="text-xs text-gray-500">
                JPEG, PNG, WebP up to 2MB
              </p>
            </>
          )}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
import { ApiError } from './apiError';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export async function validateImage(file) {
  if (!file) {
    throw ApiError.badRequest('No file provided');
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw ApiError.badRequest('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
  }

  if (file.size > MAX_FILE_SIZE) {
    throw ApiError.badRequest('File size too large. Maximum size is 5MB.');
  }

  return true;
}

export async function uploadImage(file) {
  try {
    await validateImage(file);

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Upload to your preferred storage service (e.g., Cloudinary, AWS S3)
    // This is a placeholder for the actual upload implementation
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export function compressImage(file, { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'));
              return;
            }
            resolve(new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            }));
          },
          file.type,
          quality
        );
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    } catch (error) {
      reject(error);
    }
  });
}

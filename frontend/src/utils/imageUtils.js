/**
 * Image utility functions for profile photo handling
 */

/**
 * Validate image file type and size
 * @param {File} file - The image file to validate
 * @param {number} maxSizeInMB - Maximum file size in MB (default: 5)
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateImageFile = (file, maxSizeInMB = 5) => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)' 
    };
  }

  // Check file size
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { 
      isValid: false, 
      error: `Image must be under ${maxSizeInMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB` 
    };
  }

  return { isValid: true, error: null };
};

/**
 * Compress and resize image to optimize for profile photos
 * @param {File} file - The image file to compress
 * @param {number} maxWidth - Maximum width in pixels (default: 400)
 * @param {number} maxHeight - Maximum height in pixels (default: 400)
 * @param {number} quality - Image quality 0-1 (default: 0.8)
 * @returns {Promise<string>} - Promise that resolves to base64 data URI
 */
export const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.8) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      // Set canvas size
      canvas.width = width;
      canvas.height = height;

      // Draw and compress image
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to base64 with compression
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Create object URL and load image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
};

/**
 * Convert file to base64 data URI
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - Promise that resolves to base64 data URI
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Validate base64 image data
 * @param {string} base64Data - Base64 data URI string
 * @returns {Object} - { isValid: boolean, error: string|null, sizeInMB: number }
 */
export const validateBase64Image = (base64Data) => {
  if (!base64Data) {
    return { isValid: false, error: 'No image data provided', sizeInMB: 0 };
  }

  // Check if it's a valid data URI format
  const dataUriRegex = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  if (!dataUriRegex.test(base64Data)) {
    return { 
      isValid: false, 
      error: 'Invalid image format. Please use JPEG, PNG, GIF, or WebP', 
      sizeInMB: 0 
    };
  }

  // Calculate size
  const base64String = base64Data.split(',')[1];
  if (!base64String) {
    return { isValid: false, error: 'Invalid base64 data', sizeInMB: 0 };
  }

  const sizeInBytes = (base64String.length * 3) / 4;
  const sizeInMB = sizeInBytes / (1024 * 1024);
  const maxSizeInMB = 5;

  if (sizeInMB > maxSizeInMB) {
    return { 
      isValid: false, 
      error: `Image must be under ${maxSizeInMB}MB. Current size: ${sizeInMB.toFixed(2)}MB`,
      sizeInMB 
    };
  }

  return { isValid: true, error: null, sizeInMB };
};

/**
 * Get image dimensions from base64 data
 * @param {string} base64Data - Base64 data URI string
 * @returns {Promise<Object>} - Promise that resolves to { width: number, height: number }
 */
export const getImageDimensions = (base64Data) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = base64Data;
  });
};

/**
 * Create a thumbnail from base64 image data
 * @param {string} base64Data - Base64 data URI string
 * @param {number} size - Thumbnail size in pixels (default: 100)
 * @returns {Promise<string>} - Promise that resolves to thumbnail base64 data URI
 */
export const createThumbnail = (base64Data, size = 100) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;

      // Draw image to fit in square maintaining aspect ratio
      const minDimension = Math.min(img.width, img.height);
      const sx = (img.width - minDimension) / 2;
      const sy = (img.height - minDimension) / 2;

      ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size);

      const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnailDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to create thumbnail'));
    };

    img.src = base64Data;
  });
}; 
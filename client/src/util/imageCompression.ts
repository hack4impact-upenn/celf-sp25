/**
 * Image compression utility functions
 */

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

/**
 * Compresses an image file to reduce its size
 * @param file - The image file to compress
 * @param options - Compression options
 * @returns Promise<string> - Base64 data URL of the compressed image
 */
export const compressImage = (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8,
    maxSizeMB = 14
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      // Set canvas dimensions
      canvas.width = width;
      canvas.height = height;

      // Draw the image on canvas with new dimensions
      ctx?.drawImage(img, 0, 0, width, height);

      // Convert to base64 with specified quality
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      
      // Check if the compressed image is still too large
      const base64Size = compressedDataUrl.length * 0.75; // Approximate size in bytes
      const sizeInMB = base64Size / (1024 * 1024);
      
      if (sizeInMB > maxSizeMB) {
        // If still too large, compress further with lower quality
        const furtherCompressed = canvas.toDataURL('image/jpeg', quality * 0.7);
        resolve(furtherCompressed);
      } else {
        resolve(compressedDataUrl);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image for compression'));
    };

    // Create object URL for the image
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;
  });
};

/**
 * Checks if an image file needs compression
 * @param file - The image file to check
 * @param maxSizeMB - Maximum size in MB (default: 14)
 * @returns boolean - True if compression is needed
 */
export const needsCompression = (file: File, maxSizeMB: number = 14): boolean => {
  const sizeInMB = file.size / (1024 * 1024);
  return sizeInMB > maxSizeMB;
};

/**
 * Handles image file upload with automatic compression if needed
 * @param file - The image file to process
 * @param options - Compression options
 * @returns Promise<string> - Base64 data URL of the processed image
 */
export const processImageUpload = async (
  file: File,
  options: CompressionOptions = {}
): Promise<string> => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files are allowed.');
  }

  // Check if compression is needed
  if (needsCompression(file, options.maxSizeMB)) {
    try {
      const compressedImage = await compressImage(file, options);
      return compressedImage;
    } catch (error) {
      throw new Error('Failed to compress image. Please try a smaller image.');
    }
  } else {
    // No compression needed, convert to base64 directly
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to read image file'));
      };
      reader.readAsDataURL(file);
    });
  }
}; 
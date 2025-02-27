
/**
 * Optimizes images for Telegram by resizing them to appropriate dimensions
 * and converting to a suitable format (JPEG with 0.9 quality)
 */
export const optimizeImageForTelegram = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create a canvas to resize the image
        const canvas = document.createElement('canvas');
        
        // Telegram recommends images not larger than 1280x1280
        let width = img.width;
        let height = img.height;
        
        // If image is larger than 1280px in any dimension, scale it down
        const maxSize = 1280;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round(height * (maxSize / width));
            width = maxSize;
          } else {
            width = Math.round(width * (maxSize / height));
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image on the canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get the data URL, using a high quality JPEG (0.9 quality)
        // IMPORTANT: Use the raw data URL without any modifications to avoid encoding issues
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        resolve(dataUrl);
      };
      
      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsDataURL(file);
  });
};

/**
 * Converts a data URL to a Blob object for sending to APIs
 * that require multipart/form-data
 */
export const dataUrlToBlob = (dataUrl: string): Blob => {
  // Extract the MIME type and base64 data
  const arr = dataUrl.split(',');
  // Extract mime type (e.g., "image/jpeg")
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  // Get base64 data
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  // Convert to Uint8Array
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};

/**
 * Utility function to check if a string is a valid base64 encoded value
 */
export const isValidBase64 = (str: string): boolean => {
  // Check if the string is properly base64 encoded
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
};

export async function processProductImage(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const TARGET_SIZE = 1200;
        const canvas = document.createElement('canvas');
        canvas.width = TARGET_SIZE;
        canvas.height = TARGET_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Failed to get canvas context');

        // Fill background with white (or transparent, but standard is white)
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, TARGET_SIZE, TARGET_SIZE);

        const imgWidth = img.width;
        const imgHeight = img.height;
        
        // object-fit: contain logic to prevent stretching and distortion
        const scale = Math.min(TARGET_SIZE / imgWidth, TARGET_SIZE / imgHeight);
        const drawWidth = imgWidth * scale;
        const drawHeight = imgHeight * scale;
        
        // Center the image
        const x = (TARGET_SIZE - drawWidth) / 2;
        const y = (TARGET_SIZE - drawHeight) / 2;

        ctx.drawImage(img, x, y, drawWidth, drawHeight);
        
        // Export as JPEG with 80% quality for optimization
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(dataUrl);
      };
      img.onerror = () => reject('Failed to load image');
      if (event.target?.result) {
        img.src = event.target.result as string;
      } else {
        reject('FileReader result is empty');
      }
    };
    reader.onerror = () => reject('Failed to read file');
    reader.readAsDataURL(file);
  });
}

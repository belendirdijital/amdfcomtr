/** Client-side image resize to a data URL (PNG or JPEG). */
export function resizeImage(file: File, maxSize: number, useJpeg: boolean) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);
    image.onload = () => {
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));
      const context = canvas.getContext("2d");
      if (!context) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Görsel işlenemedi."));
        return;
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);
      resolve(
        canvas.toDataURL(useJpeg ? "image/jpeg" : "image/png", useJpeg ? 0.82 : undefined)
      );
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Görsel okunamadı."));
    };
    image.src = objectUrl;
  });
}

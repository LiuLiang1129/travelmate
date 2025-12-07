import heic2any from 'heic2any';

/**
 * Processes an image file, converting HEIC/HEIF to JPEG if necessary.
 * Returns the original file if no conversion is needed.
 * 
 * @param file The file to process
 * @returns A Promise resolving to the processed File or Blob
 */
export const processImageFile = async (file: File): Promise<File | Blob> => {
    // Check if the file is HEIC/HEIF
    if (file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
        try {
            console.log("Detected HEIC image, converting to JPEG...");
            const convertedBlob = await heic2any({
                blob: file,
                toType: 'image/jpeg',
                quality: 0.8
            });

            // heic2any can return a single blob or an array of blobs. We handle both (taking the first if array).
            const finalBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

            // Create a new File object from the blob to preserve properties like name
            const newFile = new File([finalBlob], file.name.replace(/\.(heic|heif)$/i, '.jpg'), {
                type: 'image/jpeg',
                lastModified: new Date().getTime()
            });

            console.log("Conversion successful:", newFile);
            return newFile;
        } catch (error) {
            console.error("Error converting HEIC image:", error);
            // Fallback: return original file if conversion fails, though it might not display
            return file;
        }
    }

    // Return original file for other formats
    return file;
};

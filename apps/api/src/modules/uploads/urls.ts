import { imageStore } from './storage';

/** Public URL of an uploaded image, wherever the store keeps it. */
export const toUploadUrl = (fileName: string) => imageStore.publicUrl(fileName);

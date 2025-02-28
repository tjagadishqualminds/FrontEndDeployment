import { storage } from '../Services/FireBase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * @param file
 * @param folder 
 * @returns 
 */
export const uploadImage = async (file: File, folder: string = 'images'): Promise<string> => {
  if (!file) throw new Error('No file provided');

  const timestamp = new Date().getTime();
  const uniqueFileName = `${file.name.split('.')[0]}_${timestamp}.${file.name.split('.').pop()}`;

  const imageRef = ref(storage, `${folder}/${uniqueFileName}`);

  try {
    const snapshot = await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    throw new Error(`Error uploading image: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`);
  }
}

/**
 * @param imagePath 
 */
export const deleteImage = async (imagePath: string): Promise<void> => {
  if (!imagePath) throw new Error('No image path provided');

  const imageRef = ref(storage, imagePath);

  try {
    await deleteObject(imageRef);
  } catch (error) {
    throw new Error(`Error deleting image: ${error instanceof Error ? error.message : 'An unexpected error occurred.'}`);
  }
}

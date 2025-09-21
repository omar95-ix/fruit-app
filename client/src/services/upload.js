import api from './api';

// Upload media files
export const uploadMedia = async (formData) => {
  try {
    const response = await api.post('/upload/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete media file
export const deleteMedia = async (filename) => {
  try {
    const response = await api.delete(`/upload/media/${filename}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get media URL
export const getMediaUrl = (type, filename) => {
  // For serverless deployment, files are stored in Vercel Blob
  // The URL should be the direct blob URL stored in the database
  return filename; // filename is already the full URL from Vercel Blob
};

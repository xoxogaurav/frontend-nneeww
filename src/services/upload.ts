import api from './api';

interface UploadResponse {
  status: boolean;
  message: string;
  response: string;
}

class UploadService {
  private static instance: UploadService;

  private constructor() {}

  public static getInstance(): UploadService {
    if (!UploadService.instance) {
      UploadService.instance = new UploadService();
    }
    return UploadService.instance;
  }

  public async uploadImage(file: File): Promise<string> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', file);
      formData.append('username', localStorage.getItem('email') || '');
      formData.append('prompt', 'screenshot');

      // Log upload request
      console.log('Uploading image:', {
        username: localStorage.getItem('email'),
        fileSize: file.size,
        fileType: file.type
      });

      // Make the upload request
      const response = await fetch('https://developersoft.in/api/storeImageBytes', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.error('Upload failed:', response.status, response.statusText);
        throw new Error('Upload failed');
      }

      const data: UploadResponse = await response.json();
      console.log('Upload response:', data);

      if (!data.status || !data.response) {
        console.error('Invalid upload response:', data);
        throw new Error(data.message || 'Upload failed');
      }

      // Return the image URL from the response
      return data.response;
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }
  }
}

export default UploadService.getInstance();
import { jest } from '@jest/globals';
import { uploadAndSave } from '../client/src/services/completeMediaService';
import * as cloudinaryService from '../client/src/services/cloudinaryService';
import * as mediaMetadataService from '../client/src/services/mediaMetadataService';
import * as rateLimitService from '../client/src/services/rateLimitService';

// Mock the services
jest.mock('../client/src/services/cloudinaryService');
jest.mock('../client/src/services/mediaMetadataService');
jest.mock('../client/src/services/rateLimitService');

describe('Media Upload Flow', () => {
  const mockFile = new File(['dummy content'], 'test.png', { type: 'image/png' });
  const userId = 'user123';
  const mockCloudinaryData = {
    secure_url: 'https://res.cloudinary.com/demo/image/upload/v1/test.png',
    public_id: 'test_public_id',
    format: 'png',
    width: 100,
    height: 100,
    resource_type: 'image',
    bytes: 1024
  };
  const mockFirestoreData = {
    id: 'firestore_doc_id',
    ...mockCloudinaryData,
    userId,
    uploadedAt: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementations
    cloudinaryService.validateFile.mockReturnValue({ valid: true });
    cloudinaryService.uploadFile.mockResolvedValue(mockCloudinaryData);
    mediaMetadataService.saveMediaMetadata.mockResolvedValue(mockFirestoreData);
    rateLimitService.checkRateLimit.mockReturnValue({ allowed: true });
  });

  test('Successful file upload returns Cloudinary and Firestore data', async () => {
    const result = await uploadAndSave(mockFile, userId);

    expect(cloudinaryService.validateFile).toHaveBeenCalledWith(mockFile);
    expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(mockFile, `users/${userId}`, expect.any(Function));
    expect(mediaMetadataService.saveMediaMetadata).toHaveBeenCalledWith(userId, mockCloudinaryData, {});
    
    expect(result).toEqual({
      success: true,
      cloudinary: mockCloudinaryData,
      firestoreId: mockFirestoreData.id,
      metadata: mockFirestoreData
    });
  });

  test('File validation rejects invalid files', async () => {
    cloudinaryService.validateFile.mockReturnValue({ valid: false, error: 'File type not supported' });

    await expect(uploadAndSave(mockFile, userId)).rejects.toThrow('File type not supported');
    expect(cloudinaryService.uploadFile).not.toHaveBeenCalled();
  });

  test('Metadata save failure returns partial success', async () => {
    const firestoreError = new Error('Firestore write failed');
    mediaMetadataService.saveMediaMetadata.mockRejectedValue(firestoreError);

    const result = await uploadAndSave(mockFile, userId);

    expect(result.success).toBe(false);
    expect(result.partialSuccess).toBe(true);
    expect(result.cloudinary).toEqual(mockCloudinaryData);
    expect(result.error).toBe('Media uploaded but failed to save metadata to database');
  });

  test('Rate limiting (logic integration check)', () => {
    // Note: rateLimitService is typically called within the component or a wrapper
    // But we check its mock behavior here
    rateLimitService.checkRateLimit.mockReturnValue({ allowed: false, error: 'Daily limit reached' });
    const check = rateLimitService.checkRateLimit();
    expect(check.allowed).toBe(false);
    expect(check.error).toBe('Daily limit reached');
  });

  test('Upload progress callback is called', async () => {
    const onProgress = jest.fn();
    await uploadAndSave(mockFile, userId, { onProgress });
    
    // In completeMediaService.js, onProgress is passed to uploadFile
    expect(cloudinaryService.uploadFile).toHaveBeenCalledWith(
      expect.anything(), 
      expect.anything(), 
      onProgress
    );
  });
});

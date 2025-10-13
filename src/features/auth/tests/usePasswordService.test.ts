import { renderHook, act } from '@testing-library/react';
import { usePasswordService } from '../hooks/usePasswordService';
import { passwordService } from '../services/passwordService';
import { EmailCheckResponse, PasswordServiceResponse } from '../types/password.types';

// Mock the password service
jest.mock('../services/passwordService', () => ({
  passwordService: {
    sendResetPasswordEmail: jest.fn(),
    checkEmailExists: jest.fn(),
    updatePassword: jest.fn()
  }
}));

describe('usePasswordService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should send reset password email', async () => {
    const mockParams = {
      email: 'test@example.com',
      redirectUrl: 'https://example.com/reset-password'
    };
    const mockResponse = { success: true };
    
    (passwordService.sendResetPasswordEmail as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => usePasswordService());
    
    let response!: PasswordServiceResponse;
    
    await act(async () => {
      response = await result.current.sendResetPasswordEmail(mockParams);
    });
    
    expect(response).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(passwordService.sendResetPasswordEmail).toHaveBeenCalledWith(mockParams);
  });

  it('should check if email exists', async () => {
    const mockEmail = 'test@example.com';
    const mockResponse = { exists: true };
    
    (passwordService.checkEmailExists as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => usePasswordService());
    
    let response!: EmailCheckResponse;
    
    await act(async () => {
      response = await result.current.checkEmailExists(mockEmail);
    });
    
    expect(response).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(passwordService.checkEmailExists).toHaveBeenCalledWith(mockEmail);
  });

  it('should update password', async () => {
    const mockParams = { password: 'newPassword123' };
    const mockResponse = { success: true, user: { id: '123' } };
    
    (passwordService.updatePassword as jest.Mock).mockResolvedValueOnce(mockResponse);
    
    const { result } = renderHook(() => usePasswordService());
    
    let response!: PasswordServiceResponse;
    
    await act(async () => {
      response = await result.current.updatePassword(mockParams);
    });
    
    expect(response).toEqual(mockResponse);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(passwordService.updatePassword).toHaveBeenCalledWith(mockParams);
  });

  it('should handle errors when sending reset password email', async () => {
    const mockParams = {
      email: 'test@example.com',
      redirectUrl: 'https://example.com/reset-password'
    };
    const mockError = new Error('Failed to send email');
    
    (passwordService.sendResetPasswordEmail as jest.Mock).mockRejectedValueOnce(mockError);
    
    const { result } = renderHook(() => usePasswordService());
    
    await act(async () => {
      try {
        await result.current.sendResetPasswordEmail(mockParams);
        // Should not reach here
        expect("this line").toBe("not reached");
      } catch (error: unknown) {
        // Expected error path
        expect(error).toBe(mockError);
      }
    });
    
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });
});
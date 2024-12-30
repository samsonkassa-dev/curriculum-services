export const clearAuthData = async () => {
  try {
    // Clear localStorage first
    localStorage.clear();
    
    // Call logout endpoint and wait for it to complete
    const response = await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    // Return success status
    return { success: true };
  } catch (error) {
    console.log('Error during logout:', error);
    return { success: false };
  } finally {
    // Always redirect, regardless of the outcome
    window.location.replace('/');
  }
};

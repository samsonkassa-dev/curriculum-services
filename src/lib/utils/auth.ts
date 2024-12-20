export const clearAuthData = async () => {
  // Clear localStorage
  localStorage.clear();
  
  // Call logout endpoint to clear the cookie
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include', // Important for cookie handling
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }

  // Redirect and clear navigation history
  window.location.replace('/');
};

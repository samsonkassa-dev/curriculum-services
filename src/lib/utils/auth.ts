export const clearAuthData = () => {
  // Clear localStorage
  localStorage.clear();
  
  // Use js-cookie for client-side cookie management
  const cookies = document.cookie.split(';');
  
  cookies.forEach(cookie => {
    const [name] = cookie.split('=');
    // Clear cookie with multiple variations to ensure deletion
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
    document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;
  });

  // For the specific token cookie (if you know its name)
  document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${window.location.hostname};`;
  document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=.${window.location.hostname};`;

  // Redirect and clear navigation history
  window.location.replace('/');
};

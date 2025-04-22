import { setCookie, getCookie, deleteCookie } from '@curriculum-services/auth';

export const PROFILE_PICTURE_KEY = 'profile_picture_url'

export const setProfilePicture = (url: string) => {
  // Set a cookie that expires in 30 days
  setCookie(PROFILE_PICTURE_KEY, url, 30); // 30 days
}

export const getProfilePicture = () => {
  return getCookie(PROFILE_PICTURE_KEY);
}

export const clearProfilePicture = () => {
  deleteCookie(PROFILE_PICTURE_KEY);
} 
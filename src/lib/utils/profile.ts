export const PROFILE_PICTURE_KEY = 'profile_picture_url'

export const setProfilePicture = (url: string) => {
  localStorage.setItem(PROFILE_PICTURE_KEY, url)
}

export const getProfilePicture = () => {
  return localStorage.getItem(PROFILE_PICTURE_KEY)
} 
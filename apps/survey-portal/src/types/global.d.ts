export {}

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: {
          initTokenClient: (...args: unknown[]) => unknown
        }
      }
    }
  }
}



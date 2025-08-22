export const API_CONFIG = {
    BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || "https://165.227.182.17/api",
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
  } as const;
  
  if (!API_CONFIG.BASE_URL) {
    console.warn("NEXT_PUBLIC_API_BASE_URL is not set, using default");
  }
  
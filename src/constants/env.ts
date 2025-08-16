const getRequiredEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`❌ Environment variable ${key} is not defined`);
  }
  return value;
};

const getOptionalEnv = (key: string, defaultValue: string = ""): string => {
  return process.env[key] || defaultValue;
};

export const MONGO_URI = getRequiredEnv("MONGODB_URI");
export const JWT_SECRET = getRequiredEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getRequiredEnv("JWT_REFRESH_SECRET");
export const NODE_ENV = getOptionalEnv("NODE_ENV", "development");
export const PORT = getOptionalEnv("PORT", "5000");
export const EMAIL_SENDER = getOptionalEnv("EMAIL_SENDER");
export const RESEND_API_KEY = getOptionalEnv("RESEND_API_KEY");
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

const MOCK_CAPTCHA = process.env.MOCK_CAPTCHA;
if (!MOCK_CAPTCHA) {
  throw new Error("MOCK_CAPTCHA environment variable is not set");
}

const ENDPOINT_URL = process.env.ENDPOINT_URL;
if (!ENDPOINT_URL) {
  throw new Error("ENDPOINT_URL environment variable is not set");
}

export { JWT_SECRET, MOCK_CAPTCHA, ENDPOINT_URL };

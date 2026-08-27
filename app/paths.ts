// Next's Link/router apply basePath themselves; public image URLs do not.
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
export const assetPath = (path: string) => basePath + path;
export const siteOrigin = basePath
  ? "https://miena1-a2.github.io"
  : "http://localhost:3001";

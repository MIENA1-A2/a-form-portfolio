export const basePath = import.meta.env.BASE_URL.replace(/\/$/,"");
export const assetPath = (path: string) => basePath + path;
export const siteOrigin = basePath
  ? "https://miena1-a2.github.io"
  : window.location.origin;

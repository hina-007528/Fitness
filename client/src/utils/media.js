export const getLocalPath = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  // Cloudinary secure URLs (they work fine, just return them)
  if (url.includes('cloudinary.com')) {
    return url;
  }

  // Intercept old localhost or vercel URLs that have '/uploads' in them
  // Transform "http://localhost:8080/uploads/images/file.jpg" 
  // into "/uploads/images/file.jpg" to pull from the Netlify public folder
  if (url.includes('/uploads/')) {
    const rawPath = url.substring(url.indexOf('/uploads/'));
    return rawPath;
  }

  return url;
};

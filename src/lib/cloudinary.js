// // // lib/cloudinary.js
// // import { v2 as cloudinary } from 'cloudinary';

// // cloudinary.config({
// //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
// //   api_key: process.env.CLOUDINARY_API_KEY,
// //   api_secret: process.env.CLOUDINARY_API_SECRET,
// // });

// // export const cloudinaryService = {
// //   // Upload multiple images
// //   uploadImages: async (files) => {
// //     try {
// //       const uploadPromises = files.map(file => {
// //         return new Promise((resolve, reject) => {
// //           const uploadStream = cloudinary.uploader.upload_stream(
// //             {
// //               folder: 'products',
// //               resource_type: 'image',
// //             },
// //             (error, result) => {
// //               if (error) reject(error);
// //               else resolve(result);
// //             }
// //           );

// //           // Convert file to buffer for upload
// //           if (file instanceof File) {
// //             const reader = file.stream().getReader();
// //             reader.read().then(({ value }) => {
// //               uploadStream.write(value);
// //               uploadStream.end();
// //             });
// //           } else {
// //             // If it's already a buffer
// //             uploadStream.write(file);
// //             uploadStream.end();
// //           }
// //         });
// //       });

// //       const results = await Promise.all(uploadPromises);
// //       return results.map(result => result.secure_url);
// //     } catch (error) {
// //       console.error('Cloudinary upload error:', error);
// //       throw new Error('Failed to upload images');
// //     }
// //   },

// //   // Delete images from Cloudinary
// //   deleteImages: async (imageUrls) => {
// //     try {
// //       const deletePromises = imageUrls.map(url => {
// //         // Extract public_id from URL
// //         const publicId = url.split('/').pop().split('.')[0];
// //         const fullPublicId = `products/${publicId}`;

// //         return cloudinary.uploader.destroy(fullPublicId);
// //       });

// //       await Promise.all(deletePromises);
// //       return true;
// //     } catch (error) {
// //       console.error('Cloudinary delete error:', error);
// //       throw new Error('Failed to delete images');
// //     }
// //   },

// //   // Extract public ID from Cloudinary URL
// //   getPublicId: (url) => {
// //     const parts = url.split('/');
// //     const filename = parts[parts.length - 1];
// //     return `products/${filename.split('.')[0]}`;
// //   }
// // };





// import { v2 as cloudinary } from 'cloudinary';

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });

// export const cloudinaryService = {
//   // Upload single image from base64
//   uploadImage: async (base64Image) => {
//     try {
//       const result = await cloudinary.uploader.upload(base64Image, {
//         folder: 'categories',
//         resource_type: 'image',
//       });
//       return result;
//     } catch (error) {
//       console.error('Cloudinary upload error:', error);
//       throw new Error('Failed to upload image');
//     }
//   },

//   // // Upload multiple images
//   // uploadImages: async (files) => {
//   //   try {
//   //     const uploadPromises = files.map(file => {
//   //       return cloudinary.uploader.upload(file, {
//   //         folder: 'products',
//   //         resource_type: 'image',
//   //       });
//   //     });

//   //     const results = await Promise.all(uploadPromises);
//   //     return results.map(result => ({
//   //       url: result.secure_url,
//   //       publicId: result.public_id
//   //     }));
//   //   } catch (error) {
//   //     console.error('Cloudinary upload error:', error);
//   //     throw new Error('Failed to upload images');
//   //   }
//   // },

//   uploadImages: async (files) => {
//     try {
//       const uploadPromises = files.map(file => {
//         return cloudinary.uploader.upload(file, {
//           folder: 'products',
//           resource_type: 'image',
//         });
//       });

//       const results = await Promise.all(uploadPromises);
//       return results.map(result => result.secure_url); // ✅ Only URL return
//     } catch (error) {
//       console.error('Cloudinary upload error:', error);
//       throw new Error('Failed to upload images');
//     }
//   },


//   // Delete image from Cloudinary
//   deleteImage: async (publicId) => {
//     try {
//       const result = await cloudinary.uploader.destroy(publicId);
//       return result;
//     } catch (error) {
//       console.error('Cloudinary delete error:', error);
//       throw new Error('Failed to delete image');
//     }
//   },

//   // Delete multiple images
//   deleteImages: async (publicIds) => {
//     try {
//       const deletePromises = publicIds.map(publicId =>
//         cloudinary.uploader.destroy(publicId)
//       );

//       await Promise.all(deletePromises);
//       return true;
//     } catch (error) {
//       console.error('Cloudinary delete error:', error);
//       throw new Error('Failed to delete images');
//     }
//   },

//   // Extract public ID from Cloudinary URL
//   getPublicId: (url) => {
//     const parts = url.split('/');
//     const filename = parts[parts.length - 1];
//     return `categories/${filename.split('.')[0]}`;
//   }
// };





// src/lib/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const cloudinaryService = {
  // Upload single image (accepts base64 string OR File-like (Node/Request) object)
  uploadImage: async (base64OrFile, folder = 'categories') => {
    try {
      // if it's already a string (base64 / data uri) pass directly
      if (typeof base64OrFile === 'string') {
        const res = await cloudinary.uploader.upload(base64OrFile, {
          folder,
          resource_type: 'image'
        });
        return res; // caller may expect full result (secure_url, public_id)
      }

      // If it's a File/Blob-like object (from formData on server), convert to buffer + upload via upload_stream
      if (base64OrFile && typeof base64OrFile.arrayBuffer === 'function') {
        const buffer = Buffer.from(await base64OrFile.arrayBuffer());
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder, resource_type: 'image' },
            (err, result) => (err ? reject(err) : resolve(result))
          );
          streamifier.createReadStream(buffer).pipe(uploadStream);
        });
        return uploadResult;
      }

      throw new Error('Unsupported input type for uploadImage');
    } catch (err) {
      console.error('Cloudinary uploadImage error:', err);
      throw err;
    }
  },

  // Upload multiple images
  // Accepts array of either File-like objects (from formData) or base64/data-uris
  // Returns array of secure_url strings (compatible with your schema)
  uploadImages: async (files = [], folder = 'products') => {
    try {
      if (!Array.isArray(files) || files.length === 0) return [];

      // Map files to upload promises
      const uploadPromises = files.map(async (file) => {
        // If string (base64/data-uri)
        if (typeof file === 'string') {
          const res = await cloudinary.uploader.upload(file, {
            folder,
            resource_type: 'image'
          });
          return res.secure_url;
        }

        // If File/Blob-like (in Next.js route handler), convert to buffer then upload via stream
        if (file && typeof file.arrayBuffer === 'function') {
          const buffer = Buffer.from(await file.arrayBuffer());
          const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder, resource_type: 'image' },
              (err, res) => (err ? reject(err) : resolve(res))
            );
            streamifier.createReadStream(buffer).pipe(uploadStream);
          });
          return result.secure_url;
        }

        // If plain Buffer or path string (unlikely here) pass directly
        const res = await cloudinary.uploader.upload(file, { folder, resource_type: 'image' });
        return res.secure_url;
      });

      const results = await Promise.all(uploadPromises);
      return results; // array of URLs (strings)
    } catch (err) {
      console.error('Cloudinary uploadImages error:', err);
      throw err;
    }
  },

  // Delete single image by publicId OR by full URL
  deleteImage: async (publicIdOrUrl) => {
    try {
      if (!publicIdOrUrl) return null;
      const publicId = publicIdOrUrl.includes('/') ? cloudinaryService.getPublicId(publicIdOrUrl) : publicIdOrUrl;
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (err) {
      console.error('Cloudinary deleteImage error:', err);
      throw err;
    }
  },

  // Delete multiple images by publicIds OR URLs
  deleteImages: async (publicIdsOrUrls = []) => {
    try {
      if (!Array.isArray(publicIdsOrUrls) || publicIdsOrUrls.length === 0) return true;

      const publicIds = publicIdsOrUrls.map(idOrUrl => (idOrUrl.includes('/') ? cloudinaryService.getPublicId(idOrUrl) : idOrUrl));
      const deletePromises = publicIds.map(pid => cloudinary.uploader.destroy(pid));
      await Promise.all(deletePromises);
      return true;
    } catch (err) {
      console.error('Cloudinary deleteImages error:', err);
      throw err;
    }
  },

  // Extract public ID from secure_url
  // Works for URLs like: https://res.cloudinary.com/<cloud>/image/upload/v123456/products/abc123.jpg
  // Returns: products/abc123 (suitable for uploader.destroy)
  getPublicId: (url) => {
    try {
      if (!url || typeof url !== 'string') return url;
      const parts = url.split('/');
      // find the segment that is the folder + filename (last two segments)
      // Example: [..., 'upload', 'v123456', 'products', 'abc123.jpg']
      // We'll locate 'upload' then take everything after it except the version
      const uploadIndex = parts.findIndex(p => p === 'upload');
      if (uploadIndex === -1) {
        // fallback: use last 2 parts as folder/filename or last part only
        const last = parts[parts.length - 1];
        return last.split('.')[0];
      }
      const afterUpload = parts.slice(uploadIndex + 1); // e.g. ['v123456', 'products', 'abc123.jpg']
      // Remove version if present (starts with 'v' + digits)
      if (afterUpload[0] && /^v\d+/.test(afterUpload[0])) afterUpload.shift();
      // join remaining path as public id (without extension)
      const filename = afterUpload.join('/'); // e.g. 'products/abc123.jpg'
      const publicId = filename.replace(/\.[^/.]+$/, ""); // remove extension
      return publicId;
    } catch (err) {
      console.warn('getPublicId fallback used for url:', url, err);
      return url;
    }
  }
};

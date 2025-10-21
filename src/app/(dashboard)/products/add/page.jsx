"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';

// Product Preview Component
const ProductPreview = ({ formData }) => {
  const { name, description, costPrice, salePrice, discountedPrice, variants, images, thumbnailIndex, category } = formData;

  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');

  // Calculate prices and profit
  const finalPrice = discountedPrice > 0 ? discountedPrice : salePrice;
  const profit = finalPrice - costPrice;
  const discountPercentage = discountedPrice > 0 ? Math.round(((salePrice - discountedPrice) / salePrice) * 100) : 0;

  // Image logic
  let previewImage = 'https://images.unsplash.com/photo-1571402325950-891d06b69460?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0OTI3MDV8MHwxfHNlYXJjaHw1fHxibGFjayUyMHRzaGlydHxlbnwwfHx8fDE3MTgyNTg5MjF8MA&ixlib=rb-4.0.3&q=80&w=400';

  if (images.length > 0) {
    const imageToShow = thumbnailIndex !== -1 && images[thumbnailIndex] ? images[thumbnailIndex] : images[0];
    if (typeof imageToShow === 'string') {
      previewImage = imageToShow;
    } else {
      previewImage = URL.createObjectURL(imageToShow);
    }
  }

  // Variant logic
  const availableSizes = variants.filter(v => v.size).map(v => v.size);
  const defaultSize = availableSizes.length > 0 ? availableSizes[0] : 'M';
  const selectedVariant = variants.find(v => v.size === selectedSize) || variants.find(v => v.size) || variants[0];
  const availableColors = selectedVariant?.colors.filter(c => c.color) || [];

  useEffect(() => {
    if (availableColors.length > 0 && !availableColors.some(c => c.color === selectedColor)) {
      setSelectedColor(availableColors[0].color);
    } else if (availableColors.length === 0) {
      setSelectedColor('');
    }
  }, [selectedSize, availableColors, selectedColor]);

  useEffect(() => {
    if (!availableSizes.includes(selectedSize)) {
      setSelectedSize(defaultSize);
    }
  }, [defaultSize, availableSizes, selectedSize]);

  const defaultName = "Product Name Preview";
  const defaultDescription = "Short description will appear here...";

  return (
    <div className="p-6 border border-gray-200 rounded-xl shadow-lg bg-white sticky top-4">
      <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Live Preview</h2>

      {/* Product Image */}
      <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden mb-4 border border-gray-200 flex items-center justify-center">
        {images.length > 0 ? (
          <img
            src={previewImage}
            alt={name || defaultName}
            className="w-full h-full object-cover"
          />
        ) : (
           <p className="text-gray-400 text-sm">Upload an image to see the preview</p>
        )}
      </div>

      {/* Product Info */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{name || defaultName}</h3>
        <div className="text-right">
          {discountedPrice > 0 && (
            <p className="text-lg text-gray-500 line-through">${salePrice}</p>
          )}
          <p className="text-2xl font-bold text-blue-600">
            ${finalPrice}
          </p>
          {discountPercentage > 0 && (
            <p className="text-sm text-green-600 font-semibold">
              {discountPercentage}% OFF
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-500 mb-4">{(description || defaultDescription).split('\n')[0]}</p>

      {/* Profit Display */}
      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Cost Price:</span>
          <span className="font-medium">${costPrice || 0}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Profit:</span>
          <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${profit || 0}
          </span>
        </div>
        {profit > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Profit Margin:</span>
            <span className="font-medium text-green-600">
              {Math.round((profit / costPrice) * 100)}%
            </span>
          </div>
        )}
      </div>

      {/* Variants Preview */}
      <div className="space-y-4 mb-6">
        {/* Size Selector */}
        {availableSizes.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Size</p>
            <div className="flex space-x-2 flex-wrap">
              {availableSizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-1 px-3 border rounded-lg text-sm font-medium transition ${
                    size === selectedSize ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Color Selector */}
        {availableColors.length > 0 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Color</p>
            <div className="flex space-x-2 flex-wrap">
              {availableColors.map(color => (
                <button
                  key={color.color}
                  onClick={() => setSelectedColor(color.color)}
                  className={`py-1 px-3 border rounded-lg text-sm font-medium transition ${
                    color.color === selectedColor ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {color.color}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow-md transition duration-200">
        Buy Now
      </button>
    </div>
  );
};

// // Main Add Product Component
// export default function AddProduct() {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     costPrice: "",
//     salePrice: "",
//     discountedPrice: "",
//     category: "",
//     variants: [{ size: "", colors: [{ color: "", stock: "" }], fabric: "" }],
//     images: [],
//     thumbnailIndex: 0,
//     status: "Active"
//   });

//   const [loading, setLoading] = useState(false);
//   const [categories, setCategories] = useState([]);
//   const [selectedCategory, setSelectedCategory] = useState(null);
//   const [showPreview, setShowPreview] = useState(true);
//   const router = useRouter();

//   // Load categories
//   useEffect(() => {
//     loadCategories();
//   }, []);

//   const loadCategories = async () => {
//     try {
//       const response = await categoryService.getAll();
//       if (response.success) {
//         setCategories(response.data);
//       }
//     } catch (error) {
//       console.error('Failed to load categories:', error);
//     }
//   };

//   // Update selected category when category changes
//   useEffect(() => {
//     if (formData.category) {
//       const category = categories.find(cat => cat._id === formData.category);
//       setSelectedCategory(category);
//     } else {
//       setSelectedCategory(null);
//     }
//   }, [formData.category, categories]);

//   // Calculate total stock
//   useEffect(() => {
//     const totalStock = formData.variants.reduce((sum, variant) => {
//       const variantStock = variant.colors.reduce((colorSum, color) => {
//         return colorSum + (parseInt(color.stock) || 0);
//       }, 0);
//       return sum + variantStock;
//     }, 0);
//     setFormData(prev => ({ ...prev, totalStock: totalStock.toString() }));
//   }, [formData.variants]);

//   // Calculate discount percentage
//   useEffect(() => {
//     if (formData.discountedPrice && formData.salePrice) {
//       const discount = ((formData.salePrice - formData.discountedPrice) / formData.salePrice) * 100;
//       setFormData(prev => ({ ...prev, discountPercentage: Math.round(discount) }));
//     }
//   }, [formData.discountedPrice, formData.salePrice]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
    
//     if (name === "category") {
//       setFormData({ ...formData, category: value });
//     } else if (name.startsWith("variants.")) {
//       const parts = name.split(".");
//       const index = parseInt(parts[1]);
//       const key = parts[2];
//       const newVariants = [...formData.variants];
      
//       if (key === "colors") {
//         const colorIndex = parseInt(parts[3]);
//         const subKey = parts[4];
//         if (subKey === "color") {
//           newVariants[index].colors[colorIndex].color = value;
//         } else if (subKey === "stock") {
//           newVariants[index].colors[colorIndex].stock = value;
//         }
//       } else {
//         newVariants[index][key] = value;
//       }
//       setFormData({ ...formData, variants: newVariants });
//     } else {
//       setFormData({ ...formData, [name]: value });
//     }
//   };

//   const addVariant = () => {
//     setFormData({
//       ...formData,
//       variants: [...formData.variants, { size: "", colors: [{ color: "", stock: "" }], fabric: "" }],
//     });
//   };

//   const addColor = (variantIndex) => {
//     const newVariants = [...formData.variants];
//     newVariants[variantIndex].colors.push({ color: "", stock: "" });
//     setFormData({ ...formData, variants: newVariants });
//   };

//   const removeColor = (variantIndex, colorIndex) => {
//     const newVariants = [...formData.variants];
//     newVariants[variantIndex].colors.splice(colorIndex, 1);
//     setFormData({ ...formData, variants: newVariants });
//   };

//   const handleImageChange = (e) => {
//     const files = Array.from(e.target.files || []);
//     setFormData(prev => ({ 
//       ...prev, 
//       images: [...prev.images, ...files],
//     }));
//   };
  
//   const setThumbnail = (index) => {
//     setFormData(prev => ({
//       ...prev,
//       thumbnailIndex: index,
//     }));
//   };
  
//   const removeImage = (indexToRemove) => {
//     setFormData(prev => {
//       const newImages = prev.images.filter((_, index) => index !== indexToRemove);
//       let newThumbnailIndex = prev.thumbnailIndex;

//       if (prev.thumbnailIndex === indexToRemove) {
//         newThumbnailIndex = newImages.length > 0 ? 0 : 0;
//       } else if (prev.thumbnailIndex > indexToRemove) {
//         newThumbnailIndex = prev.thumbnailIndex - 1;
//       }
      
//       return {
//         ...prev,
//         images: newImages,
//         thumbnailIndex: newThumbnailIndex,
//       };
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const formDataToSend = new FormData();
      
//       // Append basic fields
//       formDataToSend.append('name', formData.name);
//       formDataToSend.append('description', formData.description);
//       formDataToSend.append('costPrice', formData.costPrice);
//       formDataToSend.append('salePrice', formData.salePrice);
//       formDataToSend.append('discountedPrice', formData.discountedPrice || '');
//       formDataToSend.append('category', formData.category);
//       formDataToSend.append('variants', JSON.stringify(formData.variants));
//       formDataToSend.append('thumbnailIndex', formData.thumbnailIndex);
//       formDataToSend.append('status', formData.status);
      
//       // Append images
//       formData.images.forEach((file, index) => {
//         formDataToSend.append(`images[${index}]`, file);
//       });

//       // Use productService instead of direct fetch
//       const result = await productService.create(formDataToSend);

//       if (result.success) {
//         alert("Product added successfully!");
//         router.push('/products');
//       } else {
//         alert(result.error || "Failed to add product.");
//       }
//     } catch (error) {
//       console.error('Product creation error:', error);
//       alert("An error occurred during submission.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
//         {/* Top Action Bar */}
//         <div className="flex justify-between items-center bg-white p-4 rounded-t-lg shadow-md border-b border-gray-200">
//           <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
//           <div className="flex space-x-3">
//             <button
//               type="button"
//               onClick={() => router.push('/products')}
//               className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               form="product-form"
//               disabled={loading}
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition shadow-md"
//             >
//               {loading ? "Saving..." : "Save Product"}
//             </button>
//           </div>
//         </div>

//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          
//           {/* Form Column */}
//           <div className="lg:col-span-2 bg-white shadow-lg rounded-xl overflow-hidden p-6">
//             <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
              
//               {/* Base Information */}
//               <div className="border border-gray-200 rounded-lg p-4">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Base Information</h2>
//                 <div className="space-y-4">
//                   <div>
//                     <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
//                       Product Title
//                     </label>
//                     <input
//                       type="text"
//                       id="name"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       required
//                       className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                       placeholder="Enter a descriptive and unique product title"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
//                       Description
//                     </label>
//                     <textarea
//                       id="description"
//                       name="description"
//                       value={formData.description}
//                       onChange={handleChange}
//                       required
//                       rows={5}
//                       className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                       placeholder="Enter a detailed product description, including material, features, and care instructions."
//                     />
//                   </div>

//                   {/* Status Field */}
//                   <div>
//                     <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
//                       Status
//                     </label>
//                     <select
//                       id="status"
//                       name="status"
//                       value={formData.status}
//                       onChange={handleChange}
//                       className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                     >
//                       <option value="Active">Active</option>
//                       <option value="Inactive">Inactive</option>
//                       <option value="Draft">Draft</option>
//                     </select>
//                   </div>
//                 </div>
//               </div>
              
//               {/* Pricing Information */}
//               <div className="border border-gray-200 rounded-lg p-4">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing Information</h2>
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">
//                       Cost Price ($)
//                     </label>
//                     <input
//                       type="number"
//                       id="costPrice"
//                       name="costPrice"
//                       value={formData.costPrice}
//                       onChange={handleChange}
//                       required
//                       min="0"
//                       step="0.01"
//                       className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                       placeholder="0.00"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
//                       Sale Price ($)
//                     </label>
//                     <input
//                       type="number"
//                       id="salePrice"
//                       name="salePrice"
//                       value={formData.salePrice}
//                       onChange={handleChange}
//                       required
//                       min="0"
//                       step="0.01"
//                       className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                       placeholder="0.00"
//                     />
//                   </div>

//                   <div>
//                     <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-1">
//                       Discounted Price ($)
//                     </label>
//                     <input
//                       type="number"
//                       id="discountedPrice"
//                       name="discountedPrice"
//                       value={formData.discountedPrice}
//                       onChange={handleChange}
//                       min="0"
//                       step="0.01"
//                       className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                       placeholder="Optional"
//                     />
//                     {formData.discountedPrice && (
//                       <p className="text-sm text-green-600 mt-1">
//                         {Math.round(((formData.salePrice - formData.discountedPrice) / formData.salePrice) * 100)}% discount
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               </div>

//               {/* Category Selection */}
//               <div className="border border-gray-200 rounded-lg p-4">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Category</h2>
//                 <div>
//                   <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
//                     Select Category
//                   </label>
//                   <select
//                     id="category"
//                     name="category"
//                     value={formData.category}
//                     onChange={handleChange}
//                     required
//                     className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                   >
//                     <option value="">Select a category</option>
//                     {categories.map((category) => (
//                       <option key={category._id} value={category._id}>
//                         {category.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {/* Category Properties Info */}
//                 {selectedCategory && (
//                   <div className="mt-4 p-3 bg-blue-50 rounded-lg">
//                     <h3 className="text-sm font-semibold text-blue-800 mb-2">Category Properties:</h3>
//                     <div className="flex space-x-4 text-sm text-blue-700">
//                       {selectedCategory.requiresSize && (
//                         <span className="bg-blue-100 px-2 py-1 rounded">Requires Size</span>
//                       )}
//                       {selectedCategory.requiresColor && (
//                         <span className="bg-blue-100 px-2 py-1 rounded">Requires Color</span>
//                       )}
//                       {selectedCategory.hasVariants && (
//                         <span className="bg-blue-100 px-2 py-1 rounded">Has Variants</span>
//                       )}
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               {/* Product Images */}
//               <div className="border border-gray-200 rounded-lg p-4">
//                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Images</h2>
//                 <div>
//                   <input
//                     type="file"
//                     id="image"
//                     name="image"
//                     accept="image/*"
//                     multiple
//                     onChange={handleImageChange}
//                     className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
//                   />
                  
//                   {/* Image Preview Thumbnails */}
//                   <div className="flex flex-wrap gap-4 pt-4">
//                     {formData.images.map((file, index) => (
//                       <div key={index} className={`w-36 border-2 rounded-lg p-1 transition ${formData.thumbnailIndex === index ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-300'}`}>
//                         <div className="w-full h-24 overflow-hidden rounded-md mb-2">
//                           <img src={URL.createObjectURL(file)} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" />
//                         </div>
//                         <div className="flex justify-between items-center space-x-2">
//                           <button
//                             type="button"
//                             onClick={() => setThumbnail(index)}
//                             disabled={formData.thumbnailIndex === index}
//                             className={`flex-1 text-xs font-medium py-1 px-1 rounded transition ${formData.thumbnailIndex === index 
//                               ? 'bg-blue-600 text-white cursor-default' 
//                               : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
//                             }`}
//                           >
//                             {formData.thumbnailIndex === index ? 'Thumbnail Set' : 'Set Thumbnail'}
//                           </button>
//                           <button
//                             type="button"
//                             onClick={() => removeImage(index)}
//                             className="text-red-500 hover:text-red-700 p-1"
//                           >
//                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
//                           </button>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>

//               {/* Product Variants - Conditionally Rendered */}
//               {selectedCategory?.hasVariants && (
//                 <div className="border border-gray-200 rounded-lg p-4">
//                   <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Variants</h2>
//                   <div className="space-y-6">
//                     {formData.variants.map((variant, index) => (
//                       <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
//                         <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
//                           Variant {index + 1} ({variant.size || 'New Size'})
//                         </h3>
//                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
//                           {/* Size - Conditionally Rendered */}
//                           {selectedCategory?.requiresSize && (
//                             <div>
//                               <label htmlFor={`variants.${index}.size`} className="block text-sm font-medium text-gray-700 mb-1">
//                                 Size
//                               </label>
//                               <select
//                                 id={`variants.${index}.size`}
//                                 name={`variants.${index}.size`}
//                                 value={variant.size}
//                                 onChange={handleChange}
//                                 className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                               >
//                                 <option value="">Select size</option>
//                                 {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
//                               </select>
//                             </div>
//                           )}
                          
//                           {/* Fabric */}
//                           <div>
//                             <label htmlFor={`variants.${index}.fabric`} className="block text-sm font-medium text-gray-700 mb-1">
//                               Fabric
//                             </label>
//                             <input
//                               type="text"
//                               id={`variants.${index}.fabric`}
//                               name={`variants.${index}.fabric`}
//                               value={variant.fabric}
//                               onChange={handleChange}
//                               className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                               placeholder="e.g., Cotton, Polyester"
//                             />
//                           </div>
                          
//                           {/* Colors and Stock - Conditionally Rendered */}
//                           {selectedCategory?.requiresColor && (
//                             <div className="sm:col-span-3">
//                               <label className="block text-sm font-medium text-gray-700 mb-2">
//                                 Colors & Stock
//                               </label>
//                               <div className="space-y-3">
//                                 {variant.colors.map((color, colorIndex) => (
//                                   <div key={colorIndex} className="flex items-center space-x-3">
//                                     <input
//                                       type="text"
//                                       id={`variants.${index}.colors.${colorIndex}.color`}
//                                       name={`variants.${index}.colors.${colorIndex}.color`}
//                                       value={color.color}
//                                       onChange={handleChange}
//                                       placeholder="Color name (e.g., Red)"
//                                       className="flex-1 border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                                     />
//                                     <input
//                                       type="number"
//                                       id={`variants.${index}.colors.${colorIndex}.stock`}
//                                       name={`variants.${index}.colors.${colorIndex}.stock`}
//                                       value={color.stock}
//                                       onChange={handleChange}
//                                       placeholder="Stock"
//                                       min="0"
//                                       className="w-20 border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
//                                     />
//                                     <button
//                                       type="button"
//                                       onClick={() => removeColor(index, colorIndex)}
//                                       className="text-red-500 hover:text-red-700 p-1"
//                                     >
//                                       <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
//                                     </button>
//                                   </div>
//                                 ))}
//                                 <button
//                                   type="button"
//                                   onClick={() => addColor(index)}
//                                   className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mt-2"
//                                 >
//                                   <span className="mr-1 text-lg leading-none">+</span> Add Color Option
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))}

//                     <button
//                       type="button"
//                       onClick={addVariant}
//                       className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center mt-4"
//                     >
//                       <span className="mr-2">+</span> Add Another Variant
//                     </button>
//                   </div>
//                 </div>
//               )}
//             </form>
//           </div>

//           {/* Preview Column */}
//           <div className="lg:col-span-1">
//             {showPreview && <ProductPreview formData={formData} />}
//           </div>
//         </div>
        
//         {/* Mobile Preview Toggle */}
//         <div className="lg:hidden mt-6">
//           <button
//             type="button"
//             onClick={() => setShowPreview(!showPreview)}
//             className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
//           >
//             {showPreview ? "Hide Preview" : "Show Live Preview"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }





// Main Add Product Component
export default function AddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    costPrice: "",
    salePrice: "",
    discountedPrice: "",
    category: "",
    // NAYE FIELDS ADD KIYE
    requiresSize: false,
    requiresColor: false,
    hasVariants: false,
    variants: [{ size: "", colors: [{ color: "", stock: "" }], fabric: "" }],
    images: [],
    thumbnailIndex: 0,
    status: "Active"
  });

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showPreview, setShowPreview] = useState(true);
  const router = useRouter();

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoryService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Calculate total stock
  useEffect(() => {
    const totalStock = formData.variants.reduce((sum, variant) => {
      const variantStock = variant.colors.reduce((colorSum, color) => {
        return colorSum + (parseInt(color.stock) || 0);
      }, 0);
      return sum + variantStock;
    }, 0);
    setFormData(prev => ({ ...prev, totalStock: totalStock.toString() }));
  }, [formData.variants]);

  // Calculate discount percentage
  useEffect(() => {
    if (formData.discountedPrice && formData.salePrice) {
      const discount = ((formData.salePrice - formData.discountedPrice) / formData.salePrice) * 100;
      setFormData(prev => ({ ...prev, discountPercentage: Math.round(discount) }));
    }
  }, [formData.discountedPrice, formData.salePrice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === "category") {
      setFormData({ ...formData, category: value });
    } else if (name.startsWith("variants.")) {
      const parts = name.split(".");
      const index = parseInt(parts[1]);
      const key = parts[2];
      const newVariants = [...formData.variants];
      
      if (key === "colors") {
        const colorIndex = parseInt(parts[3]);
        const subKey = parts[4];
        if (subKey === "color") {
          newVariants[index].colors[colorIndex].color = value;
        } else if (subKey === "stock") {
          newVariants[index].colors[colorIndex].stock = value;
        }
      } else {
        newVariants[index][key] = value;
      }
      setFormData({ ...formData, variants: newVariants });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: "", colors: [{ color: "", stock: "" }], fabric: "" }],
    });
  };

  const addColor = (variantIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].colors.push({ color: "", stock: "" });
    setFormData({ ...formData, variants: newVariants });
  };

  const removeColor = (variantIndex, colorIndex) => {
    const newVariants = [...formData.variants];
    newVariants[variantIndex].colors.splice(colorIndex, 1);
    setFormData({ ...formData, variants: newVariants });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...files],
    }));
  };
  
  const setThumbnail = (index) => {
    setFormData(prev => ({
      ...prev,
      thumbnailIndex: index,
    }));
  };
  
  const removeImage = (indexToRemove) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, index) => index !== indexToRemove);
      let newThumbnailIndex = prev.thumbnailIndex;

      if (prev.thumbnailIndex === indexToRemove) {
        newThumbnailIndex = newImages.length > 0 ? 0 : 0;
      } else if (prev.thumbnailIndex > indexToRemove) {
        newThumbnailIndex = prev.thumbnailIndex - 1;
      }
      
      return {
        ...prev,
        images: newImages,
        thumbnailIndex: newThumbnailIndex,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      // Append basic fields
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('costPrice', formData.costPrice);
      formDataToSend.append('salePrice', formData.salePrice);
      formDataToSend.append('discountedPrice', formData.discountedPrice || '');
      formDataToSend.append('category', formData.category);
      // NAYE FIELDS ADD KIYE
      formDataToSend.append('requiresSize', formData.requiresSize);
      formDataToSend.append('requiresColor', formData.requiresColor);
      formDataToSend.append('hasVariants', formData.hasVariants);
      formDataToSend.append('variants', JSON.stringify(formData.variants));
      formDataToSend.append('thumbnailIndex', formData.thumbnailIndex);
      formDataToSend.append('status', formData.status);
      
      // Append images
      formData.images.forEach((file, index) => {
        formDataToSend.append(`images[${index}]`, file);
      });

      // Use productService instead of direct fetch
      const result = await productService.create(formDataToSend);

      if (result.success) {
        alert("Product added successfully!");
        router.push('/products');
      } else {
        alert(result.error || "Failed to add product.");
      }
    } catch (error) {
      console.error('Product creation error:', error);
      alert("An error occurred during submission.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Action Bar */}
        <div className="flex justify-between items-center bg-white p-4 rounded-t-lg shadow-md border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => router.push('/products')}
              className="px-4 py-2 text-sm font-medium text-blue-700 bg-white border border-blue-300 rounded-lg hover:bg-blue-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="product-form"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition shadow-md"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          
          {/* Form Column */}
          <div className="lg:col-span-2 bg-white shadow-lg rounded-xl overflow-hidden p-6">
            <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
              
              {/* Base Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Base Information</h2>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Title
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="Enter a descriptive and unique product title"
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="Enter a detailed product description, including material, features, and care instructions."
                    />
                  </div>

                  {/* Status Field */}
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Draft">Draft</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Product Properties Section - YEH NAYA SECTION ADD KIYA */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Properties</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresSize"
                      checked={formData.requiresSize}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Requires Size</div>
                      <div className="text-sm text-gray-500">Product has different sizes</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="requiresColor"
                      checked={formData.requiresColor}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Requires Color</div>
                      <div className="text-sm text-gray-500">Product has different colors</div>
                    </div>
                  </label>

                  <label className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      name="hasVariants"
                      checked={formData.hasVariants}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">Has Variants</div>
                      <div className="text-sm text-gray-500">Product has multiple variants</div>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Pricing Information */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Pricing Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="costPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Cost Price ($)
                    </label>
                    <input
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      value={formData.costPrice}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="salePrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price ($)
                    </label>
                    <input
                      type="number"
                      id="salePrice"
                      name="salePrice"
                      value={formData.salePrice}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="discountedPrice" className="block text-sm font-medium text-gray-700 mb-1">
                      Discounted Price ($)
                    </label>
                    <input
                      type="number"
                      id="discountedPrice"
                      name="discountedPrice"
                      value={formData.discountedPrice}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                      placeholder="Optional"
                    />
                    {formData.discountedPrice && (
                      <p className="text-sm text-green-600 mt-1">
                        {Math.round(((formData.salePrice - formData.discountedPrice) / formData.salePrice) * 100)}% discount
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Category</h2>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Select Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category._id} value={category._id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Product Images */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Images</h2>
                <div>
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 bg-white text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  
                  {/* Image Preview Thumbnails */}
                  <div className="flex flex-wrap gap-4 pt-4">
                    {formData.images.map((file, index) => (
                      <div key={index} className={`w-36 border-2 rounded-lg p-1 transition ${formData.thumbnailIndex === index ? 'border-blue-500 ring-4 ring-blue-200' : 'border-gray-300'}`}>
                        <div className="w-full h-24 overflow-hidden rounded-md mb-2">
                          <img src={URL.createObjectURL(file)} alt={`Product Image ${index + 1}`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex justify-between items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => setThumbnail(index)}
                            disabled={formData.thumbnailIndex === index}
                            className={`flex-1 text-xs font-medium py-1 px-1 rounded transition ${formData.thumbnailIndex === index 
                              ? 'bg-blue-600 text-white cursor-default' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            {formData.thumbnailIndex === index ? 'Thumbnail Set' : 'Set Thumbnail'}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Variants - Conditionally Rendered */}
              {formData.hasVariants && (
                <div className="border border-gray-200 rounded-lg p-4">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Product Variants</h2>
                  <div className="space-y-6">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-900 mb-3 border-b pb-2">
                          Variant {index + 1} ({variant.size || 'New Size'})
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          
                          {/* Size - Conditionally Rendered */}
                          {formData.requiresSize && (
                            <div>
                              <label htmlFor={`variants.${index}.size`} className="block text-sm font-medium text-gray-700 mb-1">
                                Size
                              </label>
                              <select
                                id={`variants.${index}.size`}
                                name={`variants.${index}.size`}
                                value={variant.size}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                              >
                                <option value="">Select size</option>
                                {['S', 'M', 'L', 'XL', 'XXL'].map(s => <option key={s} value={s}>{s}</option>)}
                              </select>
                            </div>
                          )}
                          
                          {/* Fabric */}
                          <div>
                            <label htmlFor={`variants.${index}.fabric`} className="block text-sm font-medium text-gray-700 mb-1">
                              Fabric
                            </label>
                            <input
                              type="text"
                              id={`variants.${index}.fabric`}
                              name={`variants.${index}.fabric`}
                              value={variant.fabric}
                              onChange={handleChange}
                              className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                              placeholder="e.g., Cotton, Polyester"
                            />
                          </div>
                          
                          {/* Colors and Stock - Conditionally Rendered */}
                          {formData.requiresColor && (
                            <div className="sm:col-span-3">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Colors & Stock
                              </label>
                              <div className="space-y-3">
                                {variant.colors.map((color, colorIndex) => (
                                  <div key={colorIndex} className="flex items-center space-x-3">
                                    <input
                                      type="text"
                                      id={`variants.${index}.colors.${colorIndex}.color`}
                                      name={`variants.${index}.colors.${colorIndex}.color`}
                                      value={color.color}
                                      onChange={handleChange}
                                      placeholder="Color name (e.g., Red)"
                                      className="flex-1 border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                                    />
                                    <input
                                      type="number"
                                      id={`variants.${index}.colors.${colorIndex}.stock`}
                                      name={`variants.${index}.colors.${colorIndex}.stock`}
                                      value={color.stock}
                                      onChange={handleChange}
                                      placeholder="Stock"
                                      min="0"
                                      className="w-20 border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 transition duration-200"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeColor(index, colorIndex)}
                                      className="text-red-500 hover:text-red-700 p-1"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => addColor(index)}
                                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center mt-2"
                                >
                                  <span className="mr-1 text-lg leading-none">+</span> Add Color Option
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={addVariant}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-200 flex items-center mt-4"
                    >
                      <span className="mr-2">+</span> Add Another Variant
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Preview Column */}
          <div className="lg:col-span-1">
            {showPreview && <ProductPreview formData={formData} />}
          </div>
        </div>
        
        {/* Mobile Preview Toggle */}
        <div className="lg:hidden mt-6">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg shadow-md transition duration-200"
          >
            {showPreview ? "Hide Preview" : "Show Live Preview"}
          </button>
        </div>
      </div>
    </div>
  );
}
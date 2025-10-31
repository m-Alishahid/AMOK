import { notFound } from 'next/navigation';
import CategoryProductsClient from './CategoryProductsClient';
import { categoryService } from '@/services/categoryService';
import { productService } from '@/services/productService';
export default async function CategoryPage() {
  const idOrSlug = 'noman-alam';
  try {
    const categoryRes = await categoryService.getById(idOrSlug);
    if (!categoryRes?.success || !categoryRes?.data) notFound();
    const category = categoryRes.data;
    const productRes = await productService.getByCategory(category._id, { page:1, limit:12, sort:'createdAt', order:'desc' });
    const initialProducts = productRes?.data?.products || [];
    const initialPagination = productRes?.data?.pagination || {};
    return <CategoryProductsClient categoryId={category._id} initialCategory={category} initialProducts={initialProducts} initialPagination={initialPagination} />;
  } catch(err){ console.error(err); notFound(); }
}
import { notFound } from 'next/navigation';
import CategoryProductsClient from './CategoryProductsClient';

// Generate static params for all existing categories at build time
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'force-cache' // Cache at build time
    });

    if (!response.ok) {
      console.error('Failed to fetch categories for static generation');
      return [];
    }

    
    const data = await response.json();

    if (!data.success || !data.data) {
      console.error('Invalid categories data for static generation');
      return [];
    }

    // Generate params for all active categories
    return data.data
      .filter(category => category.status === 'Active')
      .map((category) => ({
        categoryId: category._id.toString(),
      }));
  } catch (error) {
    console.error('Error generating static params for categories:', error);
    return [];
  }
}

// Server component that fetches initial data
export default async function CategoryProductsPage({ params }) {
  const { categoryId } = params;

  try {
    // Fetch category data
    const categoryResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/categories/${categoryId}`,
      {
        cache: 'force-cache', // Cache for static generation
        next: { revalidate: 3600 } // Revalidate every hour
      }
    );

    if (!categoryResponse.ok) {
      notFound();
    }

    const categoryData = await categoryResponse.json();

    if (!categoryData.success || !categoryData.data) {
      notFound();
    }

    const category = categoryData.data;

    // Fetch initial products (first page)
    const productsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/products/category/${categoryId}?page=1&limit=12&sort=createdAt&order=desc`,
      {
        cache: 'force-cache',
        next: { revalidate: 3600 }
      }
    );

    let initialProducts = [];
    let initialPagination = {};

    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      if (productsData.success) {
        initialProducts = productsData.data.products || [];
        initialPagination = productsData.data.pagination || {};
      }
    }

    // Metadata for SEO
    const title = `${category.name} - TinyFashion`;
    const description = category.seoDescription || `Discover our exquisite collection of ${category.name.toLowerCase()} clothing and accessories, crafted with premium quality and elegant designs.`;

    return (
      <>
        <title>{category.seoTitle || title}</title>
        <meta name="description" content={description} />
        {category.seoKeywords && (
          <meta name="keywords" content={category.seoKeywords} />
        )}
        <meta property="og:title" content={category.seoTitle || title} />
        <meta property="og:description" content={description} />
        {category.image && (
          <meta property="og:image" content={category.image} />
        )}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={category.seoTitle || title} />
        <meta name="twitter:description" content={description} />

        <CategoryProductsClient
          categoryId={categoryId}
          initialCategory={category}
          initialProducts={initialProducts}
          initialPagination={initialPagination}
        />
      </>
    );
  } catch (error) {
    console.error('Error loading category page:', error);
    notFound();
  }
}

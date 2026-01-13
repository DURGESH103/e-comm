import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, clearProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/feedback/Skeleton';

const SubCategoryProducts = () => {
  const { categoryName, subCategoryName } = useParams();
  const dispatch = useDispatch();
  const { products, loading, pagination } = useSelector((state) => state.products);

  useEffect(() => {
    if (categoryName && subCategoryName) {
      dispatch(clearProducts());
      dispatch(fetchProducts({ 
        category: categoryName, 
        subCategory: subCategoryName,
        limit: 20
      }));
    }
  }, [dispatch, categoryName, subCategoryName]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse mb-8">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <Link to={`/category/${categoryName}`} className="hover:text-indigo-600">
              {categoryName}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">{subCategoryName}</span>
          </div>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {subCategoryName} - {categoryName}
          </h1>
          <p className="text-gray-600">
            {pagination.total} products found
          </p>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products found
            </h3>
            <p className="text-gray-600 mb-6">
              We couldn't find any {subCategoryName.toLowerCase()} products in {categoryName.toLowerCase()}.
            </p>
            <div className="space-x-4">
              <Link
                to={`/category/${categoryName}`}
                className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Back to {categoryName}
              </Link>
              <Link
                to="/"
                className="inline-block px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Home
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubCategoryProducts;
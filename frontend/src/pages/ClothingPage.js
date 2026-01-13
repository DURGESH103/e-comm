import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchClothingProducts, clearProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/feedback/Skeleton';
import Card from '../components/ui/cards/Card';

const ClothingPage = () => {
  const dispatch = useDispatch();
  const { products, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(clearProducts());
    dispatch(fetchClothingProducts());
  }, [dispatch]);

  const subCategories = [
    { name: 'Men', icon: '👨', path: '/clothing/men' },
    { name: 'Women', icon: '👩', path: '/clothing/women' },
    { name: 'Kids', icon: '👶', path: '/clothing/kids' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-indigo-600">Home</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Clothing</span>
          </div>
        </nav>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Clothing</h1>
          <p className="text-lg text-gray-600">Discover our complete clothing collection</p>
        </div>

        {/* SubCategory Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {subCategories.map((subCategory) => (
            <Link key={subCategory.name} to={subCategory.path}>
              <Card hover className="text-center p-6 group cursor-pointer">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <span className="text-3xl">{subCategory.icon}</span>
                </div>
                <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">
                  {subCategory.name}
                </h3>
              </Card>
            </Link>
          ))}
        </div>

        {/* Products Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">All Clothing Products</h2>
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👕</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clothing products found</h3>
              <p className="text-gray-600">Check back later for new arrivals!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClothingPage;
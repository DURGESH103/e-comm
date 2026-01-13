import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/features/product/ProductCard';
import Card from '../components/ui/cards/Card';
import Button from '../components/ui/buttons/Button';
import Badge from '../components/ui/feedback/Badge';
import { ProductCardSkeleton } from '../components/ui/feedback/Skeleton';

const Home = () => {
  const dispatch = useDispatch();
  const { products, categories, isLoading } = useSelector((state) => state.products);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroSlides = [
    {
      id: 1,
      title: "Summer Sale",
      subtitle: "Up to 70% Off",
      description: "Discover amazing deals on your favorite products",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop",
      cta: "Shop Now",
      gradient: "from-orange-500 to-pink-500"
    },
    {
      id: 2,
      title: "New Arrivals",
      subtitle: "Fresh Collection",
      description: "Explore the latest trends and styles",
      image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1200&h=400&fit=crop",
      cta: "Explore",
      gradient: "from-blue-500 to-purple-500"
    },
    {
      id: 3,
      title: "Electronics",
      subtitle: "Tech Deals",
      description: "Latest gadgets at unbeatable prices",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&h=400&fit=crop",
      cta: "Shop Tech",
      gradient: "from-indigo-500 to-cyan-500"
    }
  ];

  const categoryIcons = {
    'Electronics': '📱',
    'Clothing': '👕',
    'Books': '📚',
    'Home': '🏠',
    'Sports': '⚽',
    'Beauty': '💄',
    'Toys': '🧸'
  };

  useEffect(() => {
    dispatch(fetchProducts({ limit: 8 }));
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [heroSlides.length]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Carousel */}
      <section className="relative h-[500px] md:h-[600px] overflow-hidden">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
              index === currentSlide ? 'translate-x-0' : 
              index < currentSlide ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className="relative h-full">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80`} />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-4xl mx-auto px-4">
                  <Badge variant="warning" size="lg" className="mb-4 bg-white/20 text-white border border-white/30">
                    {slide.subtitle}
                  </Badge>
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl mb-8 text-white/90">
                    {slide.description}
                  </p>
                  <Link to="/products">
                    <Button size="xl" className="bg-white text-slate-900 hover:bg-slate-100 shadow-xl">
                      {slide.cta}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length)}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroSlides.length)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Shop by Category</h2>
            <p className="text-lg text-slate-600">Discover products across all categories</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="group"
              >
                <Card hover className="text-center p-6 group-hover:border-indigo-200 transition-all duration-300">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span className="text-3xl">{categoryIcons[category] || '📦'}</span>
                  </div>
                  <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors duration-200">
                    {category}
                  </h3>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">Featured Products</h2>
              <p className="text-lg text-slate-600">Handpicked favorites just for you</p>
            </div>
            <Link to="/products">
              <Button variant="outline" size="lg">
                View All
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {isLoading ? (
              Array.from({ length: 8 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))
            ) : (
              products.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Promotional Banner */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <Badge variant="warning" size="lg" className="mb-6 bg-white/20 text-white border border-white/30">
              Limited Time Offer
            </Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Get 50% Off Your First Order
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Join thousands of happy customers and discover amazing products at unbeatable prices
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="xl" className="bg-white text-indigo-600 hover:bg-slate-100">
                  Sign Up Now
                </Button>
              </Link>
              <Link to="/products">
                <Button variant="outline" size="xl" className="border-white text-white hover:bg-white/10">
                  Browse Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
                title: "Free Shipping",
                description: "Free delivery on orders over ₹500. Fast and reliable shipping nationwide."
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: "Quality Guarantee",
                description: "100% authentic products with quality assurance and warranty support."
              },
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                ),
                title: "Easy Returns",
                description: "30-day hassle-free returns with full refund guarantee."
              }
            ].map((feature, index) => (
              <Card key={index} className="text-center p-8 hover:shadow-lg transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center text-indigo-600">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
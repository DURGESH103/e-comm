import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';
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
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-40" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'%3E%3C/circle%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>

        <div className="relative z-10 flex items-center min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-8">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3 animate-pulse"></span>
                  <span className="text-sm font-medium">New Collection Available</span>
                </div>
                
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white mb-6 leading-none">
                  Shop
                  <span className="block bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
                    Smarter
                  </span>
                  <span className="block text-4xl md:text-5xl lg:text-6xl font-light text-white/80">
                    Live Better
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl leading-relaxed">
                  Discover premium products curated for the modern lifestyle. Quality meets innovation in every purchase.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                  <Link to="/products">
                    <Button size="xl" className="bg-white text-gray-900 hover:bg-gray-100 shadow-2xl px-12 py-4 text-lg font-semibold rounded-2xl group">
                      Explore Collection
                      <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    </Button>
                  </Link>
                  <button className="group flex items-center justify-center px-8 py-4 text-white hover:text-pink-300 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center mr-4 group-hover:bg-white/20 transition-all">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <span className="text-lg font-medium">Watch Demo</span>
                  </button>
                </div>
                
                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-8 text-white/60">
                  <div className="flex items-center">
                    <div className="flex -space-x-2 mr-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 border-2 border-white/20"></div>
                      ))}
                    </div>
                    <span className="text-sm">50K+ Happy Customers</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {[1,2,3,4,5].map(i => (
                        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm">4.9/5 Rating</span>
                  </div>
                </div>
              </div>
              
              {/* Right Visual */}
              <div className="relative lg:h-[600px] flex items-center justify-center">
                {/* Floating Product Cards */}
                <div className="relative w-full max-w-md">
                  {/* Main Product Card */}
                  <div className="relative z-20 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                    <div className="w-full h-48 bg-gradient-to-br from-pink-400 to-purple-500 rounded-2xl mb-6 flex items-center justify-center">
                      <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                    </div>
                    <h3 className="text-white text-xl font-bold mb-2">Premium Collection</h3>
                    <p className="text-white/70 text-sm mb-4">Curated for excellence</p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-white">₹2,999</span>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Elements */}
                  <div className="absolute -top-4 -right-4 z-10 w-20 h-20 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                    <span className="text-2xl">🔥</span>
                  </div>
                  
                  <div className="absolute -bottom-4 -left-4 z-10 w-16 h-16 bg-green-400 rounded-2xl flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  
                  {/* Background Cards */}
                  <div className="absolute top-8 -right-8 w-48 h-32 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transform rotate-12"></div>
                  <div className="absolute -top-8 left-8 w-48 h-32 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 transform -rotate-12"></div>
                </div>
                
                {/* Floating Stats */}
                <div className="absolute top-20 -left-4 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">10K+</div>
                  <div className="text-xs text-white/70">Products</div>
                </div>
                
                <div className="absolute bottom-20 -right-4 bg-white/10 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
                  <div className="text-2xl font-bold text-white">24/7</div>
                  <div className="text-xs text-white/70">Support</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 animate-bounce">
          <div className="flex flex-col items-center">
            <span className="text-sm mb-2">Scroll to explore</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
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
                to={category === 'Clothing' ? '/clothing' : `/category/${category}`}
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
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured Collection
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 mb-6">
              Trending
              <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Products
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover our handpicked selection of premium products that everyone's talking about
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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

          <div className="text-center mt-16">
            <Link to="/products">
              <Button size="xl" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-12 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 group">
                Explore All Products
                <svg className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Button>
            </Link>
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
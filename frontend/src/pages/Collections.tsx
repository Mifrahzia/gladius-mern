import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Grid3X3, List } from 'lucide-react';
import gladiusLogo from '@/assets/gladius-logo.png';
import heroBackground from '@/assets/hero-background.jpg';
import { categoriesApi, productsApi } from '@/lib/api';

interface Product {
  _id: string;
  name: string;
  price: number;
  stock: number;
  rating: number;
  numReviews: number;
  description: string;
  category?: { name: string; slug: string };
  images: { url: string; public_id: string }[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

const PLACEHOLDER_IMAGE = '/placeholder.svg';

const Collections = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [knives, setKnives] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoriesApi.getAll()
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    productsApi.getAll({ category: selectedCategory !== 'all' ? selectedCategory : undefined })
      .then((res) => setKnives(res.data.products))
      .catch(() => setKnives([]))
      .finally(() => setLoading(false));
  }, [selectedCategory]);

  const filteredKnives = knives;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section 
        className="py-16 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5)), url(${heroBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <img 
              src={gladiusLogo} 
              alt="Gladius Logo" 
              className="h-12 mx-auto mb-6"
            />
            <h1 className="text-4xl font-bold text-white text-center mb-4">
              Knife Collections
            </h1>
            <p className="text-lg text-gray-200 text-center max-w-2xl mx-auto">
              Discover our complete range of handcrafted knives, each one forged with precision in Wazirabad, Pakistan.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
            <Button
              variant={selectedCategory === 'all' ? "cta" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Knives
            </Button>
            {categories.map((category) => (
              <Button
                key={category._id}
                variant={selectedCategory === category.slug ? "cta" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === 'grid' ? "cta" : "outline"}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? "cta" : "outline"}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground py-12">Loading knives...</p>
        ) : filteredKnives.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">No knives found in this category.</p>
        ) : (
          <div className={`grid gap-6 ${
            viewMode === 'grid'
              ? 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
              : 'grid-cols-1 max-w-4xl mx-auto'
          }`}>
            {filteredKnives.map((knife) => {
              const inStock = knife.stock > 0;
              return (
                <Card
                  key={knife._id}
                  className="group cursor-pointer transition-premium hover:shadow-premium border-border bg-card"
                  onClick={() => window.location.href = `/knife/${knife._id}`}
                >
                  <div className="relative overflow-hidden rounded-t-lg">
                    {!inStock && (
                      <Badge className="absolute top-4 left-4 z-10 bg-red-500 text-white">
                        Out of Stock
                      </Badge>
                    )}
                    <img
                      src={knife.images[0]?.url || PLACEHOLDER_IMAGE}
                      alt={knife.name}
                      className="w-full h-48 object-cover transition-premium group-hover:scale-105"
                    />
                  </div>

                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-foreground mb-2">{knife.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{knife.description}</p>

                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-brown">${knife.price}</span>
                      <div className="flex items-center">
                        <span className="text-sm text-brown font-medium">⭐ {knife.rating}</span>
                        <span className="text-sm text-muted-foreground ml-1">({knife.numReviews})</span>
                      </div>
                    </div>

                    <Button
                      variant="steel"
                      className="w-full group"
                      disabled={!inStock}
                    >
                      {inStock ? 'View Details' : 'Out of Stock'}
                      {inStock && <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Info */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Showing {filteredKnives.length} knives
          </p>
        </div>
      </div>
    </div>
  );
};

export default Collections;
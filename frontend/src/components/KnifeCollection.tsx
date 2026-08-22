import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Star } from 'lucide-react';
import { productsApi } from '@/lib/api';

const PLACEHOLDER_IMAGE = '/placeholder.svg';

interface Product {
  _id: string;
  name: string;
  price: number;
  rating: number;
  description: string;
  specs?: Record<string, string>;
  images: { url: string; public_id: string }[];
}

const KnifeCollection = () => {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productsApi.getFeatured()
      .then((res) => setFeatured(res.data))
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false));
  }, []);

  const specialtyKnives = [
    { name: 'Skinner Knife', description: 'Specialized for precise skinning work' },
    { name: 'Loveless Knife', description: 'Classic design with modern materials' },
    { name: 'Chopper Knife', description: 'Heavy-duty cutting and chopping tasks' },
    { name: 'Fillet Knife', description: 'Flexible blade for fish preparation' },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Handcrafted Excellence
          </h2>
          <p className="text-lg text-muted-foreground">
            Discover our collection of premium knives, each one meticulously crafted 
            with attention to detail and built for a lifetime of performance.
          </p>
        </div>

        {/* Main Collection Grid */}
        {loading ? (
          <p className="text-center text-muted-foreground mb-16">Loading featured knives...</p>
        ) : featured.length === 0 ? (
          <p className="text-center text-muted-foreground mb-16">No featured knives yet — mark some as featured in the admin panel.</p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {featured.map((knife) => (
              <Card
                key={knife._id}
                className="group cursor-pointer transition-premium hover:shadow-premium border-border bg-card"
                onClick={() => window.location.href = `/knife/${knife._id}`}
              >
                <div className="relative overflow-hidden rounded-t-lg">
                  {knife.rating >= 4.8 && (
                    <Badge className="absolute top-4 left-4 z-10 bg-brown text-slate-dark">
                      <Star className="h-3 w-3 mr-1" />
                      Popular
                    </Badge>
                  )}
                  <img
                    src={knife.images[0]?.url || PLACEHOLDER_IMAGE}
                    alt={knife.name}
                    className="w-full h-64 object-cover transition-premium group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-premium" />
                </div>

                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-foreground mb-2">{knife.name}</h3>
                  <p className="text-muted-foreground mb-4 text-sm leading-relaxed line-clamp-2">
                    {knife.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    {Object.entries(knife.specs || {}).slice(0, 3).map(([key, value]) => (
                      <div key={key} className="flex items-center text-sm text-foreground">
                        <div className="w-1.5 h-1.5 rounded-full bg-brown mr-2" />
                        {key}: {value}
                      </div>
                    ))}
                  </div>

                  <Button variant="steel" className="w-full group">
                    Explore Collection — ${knife.price}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Specialty Knives Section */}
        <div className="bg-secondary rounded-2xl p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-2">Specialty Collection</h3>
            <p className="text-muted-foreground">Specialized tools for specific tasks</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {specialtyKnives.map((knife, index) => (
              <div key={index} className="text-center group cursor-pointer">
                <div className="w-16 h-16 rounded-lg gradient-brown mx-auto mb-4 flex items-center justify-center group-hover:shadow-glow transition-premium">
                  <span className="text-slate-dark font-bold text-xl">
                    {knife.name.charAt(0)}
                  </span>
                </div>
                <h4 className="font-semibold text-foreground mb-1">{knife.name}</h4>
                <p className="text-sm text-muted-foreground">{knife.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <Button variant="cta" size="xl" onClick={() => window.location.href = '/collections'}>
            View All Collections
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default KnifeCollection;
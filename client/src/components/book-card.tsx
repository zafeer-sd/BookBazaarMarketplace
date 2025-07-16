import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequestWithAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Star, ShoppingCart } from "lucide-react";
import type { Book } from "@/lib/types";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      return await apiRequestWithAuth('POST', '/api/cart', { bookId: book.id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Added to cart",
        description: `${book.title} has been added to your cart.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'like_new':
        return 'bg-green-100 text-green-800';
      case 'very_good':
        return 'bg-blue-100 text-blue-800';
      case 'good':
        return 'bg-yellow-100 text-yellow-800';
      case 'acceptable':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCondition = (condition: string) => {
    return condition.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow group">
      <Link href={`/book/${book.id}`}>
        <img
          src={book.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=faces"}
          alt={book.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform"
        />
      </Link>
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <Badge className={getConditionColor(book.condition)}>
            {formatCondition(book.condition)}
          </Badge>
          <span className="text-lg font-bold text-primary">${book.price}</span>
        </div>
        
        <Link href={`/book/${book.id}`}>
          <h3 className="font-semibold text-lg mb-2 hover:text-primary transition-colors">
            {book.title}
          </h3>
        </Link>
        
        <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">
          {book.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600 ml-1">4.5 (89)</span>
          </div>
          
          <Button
            onClick={() => addToCartMutation.mutate()}
            disabled={addToCartMutation.isPending || !book.isAvailable}
            className="bg-primary text-white hover:bg-blue-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

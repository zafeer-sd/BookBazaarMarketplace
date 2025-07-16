import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AuthGuard } from "@/components/auth-guard";
import { apiRequestWithAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Eye, DollarSign, Package, TrendingUp } from "lucide-react";
import { BOOK_CATEGORIES, BOOK_CONDITIONS } from "@/lib/types";
import type { Book } from "@/lib/types";

const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  author: z.string().min(1, "Author is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  condition: z.string().min(1, "Condition is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().optional(),
});

type BookFormData = z.infer<typeof bookSchema>;

export default function SellerDashboard() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const { data: books = [], isLoading } = useQuery<Book[]>({
    queryKey: ['/api/seller/books'],
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
  });

  const createBookMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      return await apiRequestWithAuth('POST', '/api/books', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Book created",
        description: "Your book listing has been created successfully.",
      });
      setIsCreateDialogOpen(false);
      reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: async (data: BookFormData) => {
      return await apiRequestWithAuth('PUT', `/api/books/${editingBook?.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Book updated",
        description: "Your book listing has been updated successfully.",
      });
      setEditingBook(null);
      reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: number) => {
      return await apiRequestWithAuth('DELETE', `/api/books/${bookId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/seller/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/books'] });
      toast({
        title: "Book deleted",
        description: "Your book listing has been deleted successfully.",
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

  const onSubmit = async (data: BookFormData) => {
    if (editingBook) {
      await updateBookMutation.mutateAsync(data);
    } else {
      await createBookMutation.mutateAsync(data);
    }
  };

  const handleEdit = (book: Book) => {
    setEditingBook(book);
    setValue("title", book.title);
    setValue("author", book.author);
    setValue("description", book.description);
    setValue("price", book.price);
    setValue("condition", book.condition);
    setValue("category", book.category);
    setValue("imageUrl", book.imageUrl || "");
  };

  const handleDelete = (bookId: number) => {
    if (confirm("Are you sure you want to delete this book listing?")) {
      deleteBookMutation.mutate(bookId);
    }
  };

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

  const totalBooks = books.length;
  const availableBooks = books.filter(book => book.isAvailable).length;
  const soldBooks = books.filter(book => !book.isAvailable).length;
  const totalValue = books.reduce((sum, book) => sum + parseFloat(book.price), 0);

  return (
    <AuthGuard requiredRole="seller">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage your book listings and track your sales</p>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-primary text-white hover:bg-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Book
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Book</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        {...register("title")}
                        placeholder="Enter book title"
                      />
                      {errors.title && (
                        <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="author">Author</Label>
                      <Input
                        id="author"
                        {...register("author")}
                        placeholder="Enter author name"
                      />
                      {errors.author && (
                        <p className="text-red-600 text-sm mt-1">{errors.author.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        {...register("price")}
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="condition">Condition</Label>
                      <Select onValueChange={(value) => setValue("condition", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                        <SelectContent>
                          {BOOK_CONDITIONS.map((condition) => (
                            <SelectItem key={condition.value} value={condition.value}>
                              {condition.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.condition && (
                        <p className="text-red-600 text-sm mt-1">{errors.condition.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select onValueChange={(value) => setValue("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {BOOK_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Describe the book's condition and any additional details..."
                      rows={4}
                    />
                    {errors.description && (
                      <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="imageUrl">Image URL (optional)</Label>
                    <Input
                      id="imageUrl"
                      {...register("imageUrl")}
                      placeholder="https://example.com/book-image.jpg"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false);
                        reset();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createBookMutation.isPending}
                      className="bg-primary text-white hover:bg-blue-700"
                    >
                      {createBookMutation.isPending ? "Creating..." : "Create Book"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="listings">My Listings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Books</p>
                        <p className="text-2xl font-bold text-gray-900">{totalBooks}</p>
                      </div>
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Available</p>
                        <p className="text-2xl font-bold text-green-600">{availableBooks}</p>
                      </div>
                      <Eye className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sold</p>
                        <p className="text-2xl font-bold text-red-600">{soldBooks}</p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Value</p>
                        <p className="text-2xl font-bold text-primary">${totalValue.toFixed(2)}</p>
                      </div>
                      <DollarSign className="h-8 w-8 text-primary" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      onClick={() => setIsCreateDialogOpen(true)}
                      className="bg-primary text-white hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add New Book
                    </Button>
                    <Button
                      onClick={() => navigate("/browse")}
                      variant="outline"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View Marketplace
                    </Button>
                    <Button
                      onClick={() => navigate("/messages")}
                      variant="outline"
                    >
                      Messages
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="listings">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : books.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No books listed yet</h3>
                  <p className="text-gray-600 mb-6">Start selling by adding your first book listing.</p>
                  <Button
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-primary text-white hover:bg-blue-700"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Book
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {books.map((book) => (
                    <Card key={book.id} className="overflow-hidden">
                      <img
                        src={book.imageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&crop=faces"}
                        alt={book.title}
                        className="w-full h-48 object-cover"
                      />
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className={getConditionColor(book.condition)}>
                            {formatCondition(book.condition)}
                          </Badge>
                          <span className="text-lg font-bold text-primary">${book.price}</span>
                        </div>
                        
                        <h3 className="font-semibold text-lg mb-1">{book.title}</h3>
                        <p className="text-gray-600 text-sm mb-3">by {book.author}</p>
                        
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant={book.isAvailable ? "default" : "secondary"}>
                            {book.isAvailable ? "Available" : "Sold"}
                          </Badge>
                          <span className="text-sm text-gray-500 capitalize">
                            {book.category.replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => navigate(`/book/${book.id}`)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            onClick={() => handleEdit(book)}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleDelete(book.id)}
                            variant="destructive"
                            size="sm"
                            disabled={deleteBookMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Edit Dialog */}
          <Dialog open={!!editingBook} onOpenChange={(open) => !open && setEditingBook(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Book</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Enter book title"
                    />
                    {errors.title && (
                      <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      {...register("author")}
                      placeholder="Enter author name"
                    />
                    {errors.author && (
                      <p className="text-red-600 text-sm mt-1">{errors.author.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Price ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      {...register("price")}
                      placeholder="0.00"
                    />
                    {errors.price && (
                      <p className="text-red-600 text-sm mt-1">{errors.price.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select
                      defaultValue={editingBook?.condition}
                      onValueChange={(value) => setValue("condition", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select condition" />
                      </SelectTrigger>
                      <SelectContent>
                        {BOOK_CONDITIONS.map((condition) => (
                          <SelectItem key={condition.value} value={condition.value}>
                            {condition.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.condition && (
                      <p className="text-red-600 text-sm mt-1">{errors.condition.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    defaultValue={editingBook?.category}
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {BOOK_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Describe the book's condition and any additional details..."
                    rows={4}
                  />
                  {errors.description && (
                    <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="imageUrl">Image URL (optional)</Label>
                  <Input
                    id="imageUrl"
                    {...register("imageUrl")}
                    placeholder="https://example.com/book-image.jpg"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setEditingBook(null);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateBookMutation.isPending}
                    className="bg-primary text-white hover:bg-blue-700"
                  >
                    {updateBookMutation.isPending ? "Updating..." : "Update Book"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </AuthGuard>
  );
}

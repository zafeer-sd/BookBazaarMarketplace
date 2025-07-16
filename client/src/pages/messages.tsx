import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AuthGuard } from "@/components/auth-guard";
import { apiRequestWithAuth, auth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Send, MessageSquare, User } from "lucide-react";
import type { Message } from "@/lib/types";

export default function Messages() {
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = auth.getCurrentUser();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<number | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<{ content: string }>();
  const messageContent = watch("content");

  // Parse URL parameters for initial conversation
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const sellerId = params.get('seller');
    const bookId = params.get('book');
    
    if (sellerId) {
      setSelectedUserId(parseInt(sellerId));
    }
    if (bookId) {
      setSelectedBookId(parseInt(bookId));
    }
  }, [location]);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ['/api/messages', selectedUserId],
    enabled: !!selectedUserId,
    queryFn: async () => {
      const response = await apiRequestWithAuth('GET', `/api/messages/${selectedUserId}`);
      return response.json();
    },
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string }) => {
      return await apiRequestWithAuth('POST', '/api/messages', {
        receiverId: selectedUserId,
        bookId: selectedBookId,
        content: data.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages', selectedUserId] });
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

  const onSubmit = async (data: { content: string }) => {
    if (!selectedUserId || !data.content.trim()) return;
    await sendMessageMutation.mutateAsync(data);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(onSubmit)();
    }
  };

  const formatTime = (dateString: string | Date) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!selectedUserId) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No conversation selected</h2>
              <p className="text-gray-600 mb-6">
                Start a conversation with a seller by visiting a book listing and clicking "Message Seller".
              </p>
              <Button onClick={() => window.location.href = '/browse'} className="bg-primary text-white">
                Browse Books
              </Button>
            </div>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">Chat with buyers and sellers</p>
          </div>

          <Card className="h-[600px] flex flex-col">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {auth.isSeller() ? "Buyer" : "Seller"}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {selectedBookId ? `About Book #${selectedBookId}` : "General conversation"}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 p-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                          <div className="bg-gray-200 rounded-lg p-3 max-w-xs">
                            <div className="h-4 bg-gray-300 rounded w-24"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.senderId === currentUser?.id ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-xs rounded-lg p-3 ${
                            message.senderId === currentUser?.id
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.senderId === currentUser?.id
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}
                          >
                            {formatTime(message.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              <div className="border-t p-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-3">
                  <Input
                    {...register("content", { required: true })}
                    placeholder="Type your message..."
                    className="flex-1"
                    onKeyPress={handleKeyPress}
                  />
                  <Button
                    type="submit"
                    disabled={!messageContent?.trim() || sendMessageMutation.isPending}
                    className="bg-primary text-white hover:bg-blue-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthGuard>
  );
}

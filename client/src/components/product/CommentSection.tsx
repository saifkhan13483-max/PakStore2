import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, Send, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/product/ImageUploader";
import { Comment, InsertComment } from "@shared/schema";
import { format } from "date-fns";
import { commentFirestoreService } from "@/services/commentFirestoreService";
import { useAuthStore } from "@/store/authStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getOptimizedImageUrl } from "@/lib/cloudinary";

interface CommentSectionProps {
  productId: string;
}

export function CommentSection({ productId }: CommentSectionProps) {
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuthStore();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<string[]>([]);

  // Edit/Delete states
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [editImages, setEditImages] = useState<string[]>([]);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const { data: comments, isLoading, refetch } = useQuery<Comment[]>({
    queryKey: ["comments", productId],
    queryFn: () => {
      console.log("DEBUG Querying comments for:", productId);
      return commentFirestoreService.getComments(productId);
    },
    staleTime: 0,
    gcTime: 0,
  });

  const mutation = useMutation({
    mutationFn: (newComment: InsertComment) => {
      console.log("DEBUG Mutation creating comment:", newComment);
      return commentFirestoreService.createComment(newComment);
    },
    onSuccess: async () => {
      console.log("DEBUG Mutation success, invalidating comments for:", productId);
      await queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      await refetch();
      setContent("");
      setImages([]);
      setRating(5);
      toast({ title: "Success", description: "Comment added successfully" });
    },
    onError: (error: any) => {
      console.error("DEBUG Mutation error:", error);
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<InsertComment> }) =>
      commentFirestoreService.updateComment(id, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      await refetch();
      setEditingComment(null);
      toast({ title: "Success", description: "Comment updated successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => commentFirestoreService.deleteComment(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      await refetch();
      setDeletingCommentId(null);
      toast({ title: "Success", description: "Comment deleted successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !user) {
      toast({ 
        variant: "destructive", 
        title: "Authentication required", 
        description: "Please login to post a review" 
      });
      return;
    }
    if (!content.trim()) {
      toast({ 
        variant: "destructive", 
        title: "Validation error", 
        description: "Please enter a comment" 
      });
      return;
    }
    
    mutation.mutate({
      productId,
      userId: user.uid,
      userName: user.displayName || "Anonymous User",
      userPhoto: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      content,
      rating,
      images,
    });
  };

  const handleEditSubmit = () => {
    if (!editingComment) return;
    updateMutation.mutate({
      id: editingComment.id,
      updates: {
        content: editContent,
        rating: editRating,
        images: editImages,
      },
    });
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setEditRating(comment.rating);
    setEditImages(comment.images || []);
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderImages = (commentImages: string[]) => {
    return commentImages.map((img: string, i: number) => (
      <img
        key={i}
        src={getOptimizedImageUrl(img, { width: 200, height: 200 })}
        alt={`Review image ${i + 1}`}
        className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setSelectedImage(img)}
      />
    ));
  };

  return (
    <div className="space-y-8">
      {/* Image Viewer Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none">
          {selectedImage && (
            <img
              src={getOptimizedImageUrl(selectedImage, { width: 1200 })}
              alt="Full size review image"
              className="w-full h-auto max-h-[85vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-full border">
          <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold leading-none">
              {comments?.length ? (comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0) / comments.length).toFixed(1) : "0.0"}
            </span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              ({comments?.length || 0} reviews)
            </span>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-1 transition-colors ${rating >= star ? "text-yellow-500" : "text-muted"}`}
                >
                  <Star className={`w-6 h-6 ${rating >= star ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Write your review..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Add Images</label>
              <ImageUploader value={images} onChange={setImages} maxImages={3} />
            </div>
            <Button type="submit" disabled={mutation.isPending} className="w-full sm:w-auto">
              {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
              Post Review
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : comments?.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No reviews yet. Be the first to review!</p>
        ) : (
          comments?.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar>
                    <AvatarImage src={comment.userPhoto} />
                    <AvatarFallback>{comment.userName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold">{comment.userName}</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {comment.createdAt ? format(new Date(comment.createdAt), "MMM d, yyyy") : "Just now"}
                        </span>
                        {user?.uid === comment.userId && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => startEdit(comment)}>
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeletingCommentId(comment.id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < comment.rating ? "fill-current" : "text-muted"}`} />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                    {comment.images && comment.images.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {renderImages(comment.images)}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingComment} onOpenChange={(open) => !open && setEditingComment(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setEditRating(star)}
                  className={`p-1 transition-colors ${editRating >= star ? "text-yellow-500" : "text-muted"}`}
                >
                  <Star className={`w-6 h-6 ${editRating >= star ? "fill-current" : ""}`} />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Update your review..."
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Update Images</label>
              <ImageUploader value={editImages} onChange={setEditImages} maxImages={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingComment(null)}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingCommentId} onOpenChange={(open) => !open && setDeletingCommentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deletingCommentId && deleteMutation.mutate(deletingCommentId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

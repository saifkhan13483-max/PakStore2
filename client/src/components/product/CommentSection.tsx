import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ImageUploader } from "@/components/product/ImageUploader";
import { Comment } from "@shared/schema";
import { format } from "date-fns";
import { commentFirestoreService } from "@/services/commentFirestoreService";

interface CommentSectionProps {
  productId: string;
}

export function CommentSection({ productId }: CommentSectionProps) {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [images, setImages] = useState<string[]>([]);

  const { data: comments, isLoading } = useQuery<Comment[]>({
    queryKey: ["comments", productId],
    queryFn: () => commentFirestoreService.getComments(productId),
  });

  const mutation = useMutation({
    mutationFn: (newComment: any) => commentFirestoreService.createComment(newComment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", productId] });
      setContent("");
      setImages([]);
      setRating(5);
      toast({ title: "Success", description: "Comment added successfully" });
    },
    onError: (error: any) => {
      toast({ variant: "destructive", title: "Error", description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    // Mock user data since auth is managed externally (firebase)
    mutation.mutate({
      productId,
      userId: "temp-user",
      userName: "Guest User",
      userPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Guest",
      content,
      rating,
      images,
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <div className="flex items-center gap-1">
          <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
          <span className="text-xl font-bold">
            {comments?.length ? (comments.reduce((acc, c) => acc + (Number(c.rating) || 0), 0) / comments.length).toFixed(1) : "0.0"}
          </span>
          <span className="text-muted-foreground">({comments?.length || 0} reviews)</span>
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
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(comment.createdAt), "MMM d, yyyy")}
                      </span>
                    </div>
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < comment.rating ? "fill-current" : "text-muted"}`} />
                      ))}
                    </div>
                    <p className="text-muted-foreground">{comment.content}</p>
                    {comment.images && comment.images.length > 0 && (
                      <div className="flex gap-2 pt-2">
                        {comment.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            alt={`Review image ${i + 1}`}
                            className="w-20 h-20 object-cover rounded-md border"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

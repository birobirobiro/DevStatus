"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ReportsStorage } from "@/lib/reports-storage";
import type { ServiceComment } from "@/types/reports";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquare, ThumbsUp, AlertCircle, CheckCircle, Info } from "lucide-react";

interface CommentsSectionProps {
  serviceId: string;
  serviceName: string;
}

export function CommentsSection({ serviceId, serviceName }: CommentsSectionProps) {
  const [comments, setComments] = useState<ServiceComment[]>([]);
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [userName, setUserName] = useState("");
  const [commentType, setCommentType] = useState<"problem" | "resolved" | "info">("problem");
  const { toast } = useToast();

  const loadComments = () => {
    const loadedComments = ReportsStorage.getCommentsByService(serviceId);
    setComments(loadedComments);
  };

  useEffect(() => {
    loadComments();

    const handleUpdate = () => loadComments();
    window.addEventListener("reportsUpdated", handleUpdate);

    return () => {
      window.removeEventListener("reportsUpdated", handleUpdate);
    };
  }, [serviceId]);

  const handleSubmit = () => {
    if (!commentText.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    if (!ReportsStorage.canUserReport()) {
      toast({
        title: "Too many comments",
        description: "You've reached the maximum number of comments per hour. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    const comment = ReportsStorage.addComment({
      serviceId,
      serviceName,
      comment: commentText.trim(),
      userName: userName.trim() || "Anonymous",
      type: commentType,
    });

    if (comment) {
      toast({
        title: "Comment posted",
        description: "Your comment has been posted successfully.",
      });
      setCommentText("");
      setUserName("");
      setOpen(false);
      loadComments();
      window.dispatchEvent(new CustomEvent("reportsUpdated"));
    } else {
      toast({
        title: "Failed to post comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleUpvote = (commentId: string) => {
    ReportsStorage.upvoteComment(commentId);
    loadComments();
  };

  const getCommentIcon = (type: ServiceComment["type"]) => {
    switch (type) {
      case "problem":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case "info":
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getCommentBadgeColor = (type: ServiceComment["type"]) => {
    switch (type) {
      case "problem":
        return "bg-red-500/20 text-red-300 border-red-500/30";
      case "resolved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "info":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
    }
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Community Comments ({comments.length})
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Add Comment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Add a comment</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Share your experience with {serviceName}. Let others know if you're having issues or if things are working fine.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="userName" className="text-zinc-300">
                    Name (optional)
                  </Label>
                  <Input
                    id="userName"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Anonymous"
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-zinc-300">Comment Type</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={commentType === "problem" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCommentType("problem")}
                      className={commentType === "problem" ? "bg-red-600 hover:bg-red-700" : ""}
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Problem
                    </Button>
                    <Button
                      type="button"
                      variant={commentType === "resolved" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCommentType("resolved")}
                      className={commentType === "resolved" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolved
                    </Button>
                    <Button
                      type="button"
                      variant={commentType === "info" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCommentType("info")}
                      className={commentType === "info" ? "bg-blue-600 hover:bg-blue-700" : ""}
                    >
                      <Info className="w-4 h-4 mr-2" />
                      Info
                    </Button>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="comment" className="text-zinc-300">
                    Comment
                  </Label>
                  <textarea
                    id="comment"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Describe what's happening..."
                    rows={4}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
                    maxLength={500}
                  />
                  <div className="text-xs text-zinc-500 text-right">{commentText.length}/500</div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} className="bg-zinc-800 border-zinc-700 text-zinc-300">
                  Cancel
                </Button>
                <Button onClick={handleSubmit} className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100">
                  Post Comment
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {comments.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to share your experience!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-4 bg-zinc-800/50 border border-zinc-800 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-zinc-300">{comment.userName}</span>
                      <Badge variant="outline" className={`text-xs ${getCommentBadgeColor(comment.type)}`}>
                        {getCommentIcon(comment.type)}
                        <span className="ml-1">{comment.type}</span>
                      </Badge>
                      <span className="text-xs text-zinc-500">
                        {new Date(comment.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-sm">{comment.comment}</p>
                  </div>
                  <button
                    onClick={() => handleUpvote(comment.id)}
                    className="flex flex-col items-center gap-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
                    type="button"
                  >
                    <ThumbsUp className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs text-zinc-400">{comment.upvotes}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


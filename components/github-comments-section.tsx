"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GitHubCommentsAPI } from "@/lib/github-comments";
import { useToast } from "@/components/ui/use-toast";
import {
  MessageSquare,
  ThumbsUp,
  AlertCircle,
  CheckCircle,
  Info,
  ExternalLink,
  Github,
  Bold,
  Italic,
  Code,
  Link as LinkIcon,
  List,
  Quote,
  Eye,
  Edit3,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface GitHubCommentsSectionProps {
  serviceId: string;
  serviceName: string;
}

export function GitHubCommentsSection({ serviceId, serviceName }: GitHubCommentsSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [issueNumber, setIssueNumber] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [commentType, setCommentType] = useState<"problem" | "resolved" | "info">("problem");
  const [posting, setPosting] = useState(false);
  const [previewMode, setPreviewMode] = useState<"write" | "preview">("write");
  const { toast } = useToast();

  const loadComments = async () => {
    setLoading(true);
    try {
      const issue = await GitHubCommentsAPI.getOrCreateServiceIssue(serviceName);
      
      if (issue) {
        setIssueNumber(issue);
        const githubComments = await GitHubCommentsAPI.getIssueComments(issue);
        const formatted = githubComments.map(GitHubCommentsAPI.formatComment);
        setComments(formatted);
      } else {
        console.log("GitHub integration not configured or issue not found");
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
    const interval = setInterval(loadComments, 120000);
    return () => clearInterval(interval);
  }, [serviceName]);

  const handleSubmit = async () => {
    if (!commentText.trim()) {
      toast({
        title: "Comment required",
        description: "Please enter a comment.",
        variant: "destructive",
      });
      return;
    }

    setPosting(true);

    try {
      const success = await GitHubCommentsAPI.postComment(
        serviceName,
        commentText.trim(),
        commentType
      );

      if (success) {
        toast({
          title: "Comment posted to GitHub!",
          description: "Your comment will appear shortly.",
        });
        setCommentText("");
        setOpen(false);
        setTimeout(() => loadComments(), 2000);
      } else {
        toast({
          title: "Failed to post comment",
          description: "Please try again or post directly on GitHub.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  };

  const handleUpvote = async (commentId: number) => {
    const success = await GitHubCommentsAPI.addReaction(commentId, "+1");
    
    if (success) {
      toast({
        title: "Reaction added!",
        description: "Your thumbs up has been recorded on GitHub.",
      });
      setTimeout(() => loadComments(), 1000);
    } else {
      toast({
        title: "Failed to add reaction",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const insertMarkdown = (syntax: string) => {
    const textarea = document.getElementById("comment-textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = commentText.substring(start, end);
    
    let newText = "";
    let cursorPos = start;

    switch (syntax) {
      case "bold":
        newText = commentText.substring(0, start) + `**${selectedText || "bold text"}**` + commentText.substring(end);
        cursorPos = start + 2;
        break;
      case "italic":
        newText = commentText.substring(0, start) + `*${selectedText || "italic text"}*` + commentText.substring(end);
        cursorPos = start + 1;
        break;
      case "code":
        newText = commentText.substring(0, start) + `\`${selectedText || "code"}\`` + commentText.substring(end);
        cursorPos = start + 1;
        break;
      case "link":
        newText = commentText.substring(0, start) + `[${selectedText || "link text"}](url)` + commentText.substring(end);
        cursorPos = start + 1;
        break;
      case "list":
        newText = commentText.substring(0, start) + `\n- ${selectedText || "list item"}\n- ` + commentText.substring(end);
        cursorPos = start + 3;
        break;
      case "quote":
        newText = commentText.substring(0, start) + `\n> ${selectedText || "quote"}\n` + commentText.substring(end);
        cursorPos = start + 3;
        break;
    }

    setCommentText(newText);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(cursorPos, cursorPos);
    }, 0);
  };

  const getCommentIcon = (type: string) => {
    if (type.includes("PROBLEM")) return <AlertCircle className="w-4 h-4 text-red-400" />;
    if (type.includes("RESOLVED")) return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  const getCommentType = (body: string): string => {
    if (body.includes("🔴") || body.includes("PROBLEM")) return "problem";
    if (body.includes("✅") || body.includes("RESOLVED")) return "resolved";
    return "info";
  };

  const getCommentBadgeColor = (type: string) => {
    if (type === "problem") return "bg-red-500/20 text-red-300 border-red-500/30";
    if (type === "resolved") return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
    return "bg-blue-500/20 text-blue-300 border-blue-500/30";
  };

  const cleanMarkdownForDisplay = (text: string) => {
    // Remove type prefix (🔴 PROBLEM, etc)
    return text.replace(/^[🔴✅ℹ️]\s*\*\*\w+\*\*\n\n/, "");
  };

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold text-zinc-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
              <Github className="w-5 h-5 text-zinc-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                Community Comments
                <Badge variant="outline" className="text-xs bg-zinc-800 text-zinc-400 border-zinc-700">
                  {comments.length} {comments.length === 1 ? "comment" : "comments"}
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 font-normal mt-0.5">
                Powered by GitHub Issues
              </p>
            </div>
          </CardTitle>
          <div className="flex items-center gap-2">
            {issueNumber && (
              <Button
                variant="ghost"
                size="sm"
                asChild
              >
                <a
                  href={`https://github.com/${process.env.NEXT_PUBLIC_GITHUB_REPO}/issues/${issueNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="hidden sm:inline">View on GitHub</span>
                </a>
              </Button>
            )}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm" className="bg-zinc-700 hover:bg-zinc-600">
                  <Edit3 className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[700px] bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-xl text-zinc-100 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Add a Comment to {serviceName}
                  </DialogTitle>
                  <DialogDescription className="text-zinc-400">
                    Share your experience with the community. Your comment will be posted as a GitHub issue comment and will be public.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  {/* Comment Type */}
                  <div className="grid gap-2">
                    <Label className="text-zinc-300 text-sm font-medium">Comment Type</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={commentType === "problem" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCommentType("problem")}
                        className={commentType === "problem" ? "bg-red-600 hover:bg-red-700 border-red-600" : "border-zinc-700"}
                      >
                        <AlertCircle className="w-4 h-4 mr-2" />
                        Problem
                      </Button>
                      <Button
                        type="button"
                        variant={commentType === "resolved" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCommentType("resolved")}
                        className={commentType === "resolved" ? "bg-emerald-600 hover:bg-emerald-700 border-emerald-600" : "border-zinc-700"}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Resolved
                      </Button>
                      <Button
                        type="button"
                        variant={commentType === "info" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCommentType("info")}
                        className={commentType === "info" ? "bg-blue-600 hover:bg-blue-700 border-blue-600" : "border-zinc-700"}
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Info
                      </Button>
                    </div>
                  </div>

                  {/* Markdown Editor */}
                  <div className="grid gap-2">
                    <Label className="text-zinc-300 text-sm font-medium">Comment (Markdown supported)</Label>
                    
                    <Tabs value={previewMode} onValueChange={(v) => setPreviewMode(v as "write" | "preview")} className="w-full">
                      <div className="flex items-center justify-between mb-2">
                        <TabsList className="bg-zinc-800 border border-zinc-700">
                          <TabsTrigger value="write" className="gap-2">
                            <Edit3 className="w-3 h-3" />
                            Write
                          </TabsTrigger>
                          <TabsTrigger value="preview" className="gap-2">
                            <Eye className="w-3 h-3" />
                            Preview
                          </TabsTrigger>
                        </TabsList>
                        
                        {/* Markdown Toolbar */}
                        {previewMode === "write" && (
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => insertMarkdown("bold")}
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
                              title="Bold"
                            >
                              <Bold className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => insertMarkdown("italic")}
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
                              title="Italic"
                            >
                              <Italic className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => insertMarkdown("code")}
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
                              title="Code"
                            >
                              <Code className="w-4 h-4" />
                            </Button>
                            <Separator orientation="vertical" className="h-6 bg-zinc-700" />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => insertMarkdown("link")}
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
                              title="Link"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => insertMarkdown("list")}
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
                              title="List"
                            >
                              <List className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => insertMarkdown("quote")}
                              className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100"
                              title="Quote"
                            >
                              <Quote className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      <TabsContent value="write" className="mt-0">
                        <textarea
                          id="comment-textarea"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Describe your experience... (Markdown supported)

**Examples:**
**Bold text**
*Italic text*
`code`
[Link text](url)
- List item"
                          rows={8}
                          className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent resize-none font-mono text-sm"
                          maxLength={2000}
                        />
                      </TabsContent>

                      <TabsContent value="preview" className="mt-0">
                        <div className="min-h-[200px] px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                          {commentText.trim() ? (
                            <div className="prose prose-invert prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {commentText}
                              </ReactMarkdown>
                            </div>
                          ) : (
                            <p className="text-zinc-500 text-sm">Nothing to preview</p>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-500">{commentText.length}/2000 characters</span>
                      <span className="text-zinc-500">Markdown is supported</span>
                    </div>
                  </div>

                  {/* GitHub Notice */}
                  <div className="text-xs text-zinc-400 bg-zinc-800/50 p-3 rounded-lg border border-zinc-700 flex items-start gap-2">
                    <Github className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-zinc-300 mb-1">Posted to GitHub</p>
                      <p>Your comment will be public and visible to everyone. You can edit or delete it later on GitHub.</p>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setOpen(false);
                      setPreviewMode("write");
                    }}
                    className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={posting || !commentText.trim()}
                    className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
                  >
                    {posting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Posting...
                      </>
                    ) : (
                      <>
                        <Github className="w-4 h-4 mr-2" />
                        Post to GitHub
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-12 text-zinc-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30 animate-pulse" />
            <p className="text-sm">Loading comments from GitHub...</p>
          </div>
        ) : issueNumber === null ? (
          <div className="text-center py-12 text-zinc-500 bg-zinc-800/30 rounded-xl border border-zinc-700/50 p-8">
            <Github className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-zinc-300 font-semibold mb-2 text-lg">GitHub Integration Not Configured</p>
            <p className="text-sm text-zinc-400 mb-6 max-w-md mx-auto">
              To enable community comments via GitHub Issues, you need to configure your GitHub token in the environment variables.
            </p>
            <Button
              variant="outline"
              size="sm"
              asChild
              className="bg-zinc-800 border-zinc-700 hover:bg-zinc-700"
            >
              <a
                href="https://github.com/birobirobiro/DevStatus#setup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View Setup Instructions
              </a>
            </Button>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-zinc-300 font-medium mb-2">No comments yet</p>
            <p className="text-sm text-zinc-400 mb-4">Be the first to share your experience with {serviceName}!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment, index) => {
              const commentTypeFromBody = getCommentType(comment.comment);
              const cleanedComment = cleanMarkdownForDisplay(comment.comment);
              
              return (
                <div
                  key={comment.id}
                  className="group p-5 bg-zinc-800/40 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all animate-fade-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <Avatar className="w-10 h-10 border-2 border-zinc-700">
                      <AvatarImage src={comment.avatar} alt={comment.userName} />
                      <AvatarFallback className="bg-zinc-700 text-zinc-300 font-semibold">
                        {comment.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Comment Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <a
                          href={`https://github.com/${comment.userName}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-zinc-200 hover:text-blue-400 transition-colors"
                        >
                          @{comment.userName}
                        </a>
                        <Badge variant="outline" className={`text-xs ${getCommentBadgeColor(commentTypeFromBody)}`}>
                          {getCommentIcon(commentTypeFromBody)}
                          <span className="ml-1.5 capitalize">{commentTypeFromBody}</span>
                        </Badge>
                        <span className="text-xs text-zinc-500">
                          {new Date(comment.timestamp).toLocaleDateString()} at{" "}
                          {new Date(comment.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <a
                          href={comment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-zinc-500 hover:text-blue-400 flex items-center gap-1 transition-colors ml-auto"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="hidden sm:inline">View on GitHub</span>
                        </a>
                      </div>

                      {/* Comment Body with Markdown */}
                      <div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-300 prose-headings:text-zinc-100 prose-strong:text-zinc-200 prose-code:text-emerald-400 prose-code:bg-zinc-900 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline prose-blockquote:border-zinc-700 prose-blockquote:text-zinc-400">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {cleanedComment}
                        </ReactMarkdown>
                      </div>
                    </div>

                    {/* Upvote Button */}
                    <button
                      onClick={() => handleUpvote(parseInt(comment.id))}
                      className="flex flex-col items-center gap-1.5 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-600 transition-all group"
                      type="button"
                      title="Upvote this comment"
                    >
                      <ThumbsUp className="w-4 h-4 text-zinc-400 group-hover:text-blue-400 transition-colors" />
                      <span className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 transition-colors">
                        {comment.upvotes}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

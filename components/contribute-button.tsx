"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { GitPullRequestIcon, Sparkles, ExternalLink } from "lucide-react";

const CATEGORIES = [
  "AI Code Editor",
  "AI/ML",
  "Analytics",
  "Authentication",
  "CDN",
  "CI/CD",
  "Cloud Provider",
  "CMS",
  "Communication",
  "Communication API",
  "Container Registry",
  "Database",
  "Design",
  "Developer Platform",
  "Development Tools",
  "E-commerce",
  "Email",
  "Game Development",
  "Gaming",
  "Government",
  "Media",
  "Meta",
  "Microsoft",
  "Monitoring",
  "Package Manager",
  "Payment",
  "Productivity",
  "Project Management",
  "Real-time",
  "Search",
  "Security",
  "Social",
  "Streaming",
  "Testing",
  "Version Control",
];

const STATUS_PAGE_TYPES = [
  { value: "default", label: "Auto-detect (default)" },
  { value: "custom", label: "Custom Status Page" },
];

export function ContributeButton() {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "",
    statusPageType: "default",
    notes: "",
  });
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.name || !formData.url || !formData.category) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/github/create-pr", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "Pull Request Created! 🎉",
          description: `PR #${data.prNumber} has been created. Opening in new tab...`,
        });
        
        // Open PR in new tab
        setTimeout(() => {
          window.open(data.prUrl, "_blank");
        }, 1000);

        // Reset form and close
        setFormData({
          name: "",
          url: "",
          category: "",
          statusPageType: "default",
          notes: "",
        });
        setOpen(false);
      } else {
        toast({
          title: "Failed to create PR",
          description: data.error || "Please try the manual method below.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create pull request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleManualContribute = () => {
    const issueTitle = encodeURIComponent("Service Suggestion");
    const issueBody = encodeURIComponent(`## Service Details

Please provide the following information for adding a new service or reviewing an existing one:

### Service Information
**Service Name:**
<!-- Example: Stripe -->

**Category:**
<!-- Choose an existing category or suggest a new one. Existing categories include:
- Cloud Provider
- Database
- Version Control
- CI/CD
- Development Tools
- Design
- Project Management
- Communication
- AI/ML
- Monitoring
- Authentication
- Media
- Payment
- Email
- Search
- Social
etc. -->

**Status Page URL:**
<!-- Example: https://status.stripe.com -->

### Integration Type
Please specify which type of integration this service uses (check one):

- [ ] Atlassian-compatible API (uses /api/v2/summary.json or /api/v2/status.json)
- [ ] Platform-specific status page (Google, Microsoft, Azure, Apple, etc.)
- [ ] Custom status page implementation

### If Custom Status Page
If this is a custom status page, please verify:
- [ ] The domain should be added to externalStatusDomains list
- [ ] The service needs statusPageType: "custom" in its configuration
- [ ] The status page reliably shows service health

### Validation Checklist
- [ ] Service is not already listed (searched both name and URL)
- [ ] Status page URL is accessible and shows real-time status
- [ ] Category matches existing categories or has justification for new category
- [ ] Service is relevant to developers or technical users
- [ ] Integration type is correctly identified

### Additional Context
<!-- Any other relevant information about the service or why it should be added -->

---

**For reviewers:**
Please verify:
1. Service meets inclusion criteria (developer-focused, reliable status page)
2. Integration type is appropriate
3. Category is consistent with existing services
4. No duplicates`);

    window.open(
      `https://github.com/birobirobiro/DevStatus/issues/new?title=${issueTitle}&body=${issueBody}`,
      "_blank"
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
        >
          <GitPullRequestIcon className="w-4 h-4" />
          Suggest Service
          <Sparkles className="w-3 h-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-zinc-100 flex items-center gap-2">
            <GitPullRequestIcon className="w-5 h-5" />
            Suggest a New Service
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Fill out the form below and we'll automatically create a Pull Request on GitHub for you!
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Service Name */}
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-zinc-300">
              Service Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Stripe, Notion, Figma"
              className="bg-zinc-800 border-zinc-700 text-zinc-100"
            />
          </div>

          {/* Status Page URL */}
          <div className="grid gap-2">
            <Label htmlFor="url" className="text-zinc-300">
              Status Page URL <span className="text-red-400">*</span>
            </Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              placeholder="https://status.service.com/api/v2/summary.json"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono text-sm"
            />
            <p className="text-xs text-zinc-500">
              The URL where status information can be fetched
            </p>
          </div>

          {/* Category */}
          <div className="grid gap-2">
            <Label htmlFor="category" className="text-zinc-300">
              Category <span className="text-red-400">*</span>
            </Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-zinc-100">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Page Type */}
          <div className="grid gap-2">
            <Label htmlFor="type" className="text-zinc-300">
              Status Page Type
            </Label>
            <Select
              value={formData.statusPageType}
              onValueChange={(value) => setFormData({ ...formData, statusPageType: value })}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {STATUS_PAGE_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value} className="text-zinc-100">
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Additional Notes */}
          <div className="grid gap-2">
            <Label htmlFor="notes" className="text-zinc-300">
              Additional Notes (optional)
            </Label>
            <textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional information about this service..."
              rows={3}
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 resize-none"
              maxLength={500}
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-zinc-300">
                <p className="font-medium mb-1">Automatic Pull Request</p>
                <p className="text-zinc-400">
                  When you submit, we'll automatically create a Pull Request on GitHub with your suggestion. 
                  You can review and track it there!
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleManualContribute}
            className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Manual (GitHub Issue)
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !formData.name || !formData.url || !formData.category}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Creating PR...
              </>
            ) : (
              <>
                <GitPullRequestIcon className="w-4 h-4 mr-2" />
                Create Pull Request
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

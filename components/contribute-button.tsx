"use client";

import type React from "react";

import { Github, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";

export function ContributeButton() {
  const [serviceName, setServiceName] = useState("");
  const [serviceUrl, setServiceUrl] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate submission
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Show success toast
    toast({
      title: "Service suggestion submitted",
      description:
        "Thank you for your contribution! We'll review your suggestion soon.",
    });

    // Reset form
    setServiceName("");
    setServiceUrl("");
    setServiceCategory("");
    setIsSubmitting(false);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PlusCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Suggest Service</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suggest a new service</DialogTitle>
          <DialogDescription>
            Help us improve DevStatus by suggesting a developer service that
            should be monitored.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                className="col-span-3"
                placeholder="e.g. Example API"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                Status URL
              </Label>
              <Input
                id="url"
                value={serviceUrl}
                onChange={(e) => setServiceUrl(e.target.value)}
                className="col-span-3"
                placeholder="https://status.example.com"
                type="url"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Category
              </Label>
              <Select
                value={serviceCategory}
                onValueChange={setServiceCategory}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI/ML">AI/ML</SelectItem>
                  <SelectItem value="Analytics">Analytics</SelectItem>
                  <SelectItem value="Authentication">Authentication</SelectItem>
                  <SelectItem value="CDN">CDN</SelectItem>
                  <SelectItem value="CI/CD">CI/CD</SelectItem>
                  <SelectItem value="Cloud Provider">Cloud Provider</SelectItem>
                  <SelectItem value="CMS">CMS</SelectItem>
                  <SelectItem value="Communication">Communication</SelectItem>
                  <SelectItem value="Communication API">
                    Communication API
                  </SelectItem>
                  <SelectItem value="Database">Database</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Developer Platform">
                    Developer Platform
                  </SelectItem>
                  <SelectItem value="Development Tools">
                    Development Tools
                  </SelectItem>
                  <SelectItem value="E-commerce">E-commerce</SelectItem>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Game Development">
                    Game Development
                  </SelectItem>
                  <SelectItem value="Gaming">Gaming</SelectItem>
                  <SelectItem value="Media">Media</SelectItem>
                  <SelectItem value="Monitoring">Monitoring</SelectItem>
                  <SelectItem value="Package Manager">
                    Package Manager
                  </SelectItem>
                  <SelectItem value="Payment">Payment</SelectItem>
                  <SelectItem value="Productivity">Productivity</SelectItem>
                  <SelectItem value="Project Management">
                    Project Management
                  </SelectItem>
                  <SelectItem value="Real-time">Real-time</SelectItem>
                  <SelectItem value="Search">Search</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Streaming">Streaming</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                  <SelectItem value="Version Control">
                    Version Control
                  </SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              type="button"
              asChild
              className="gap-2"
              onClick={() =>
                window.open(
                  "https://github.com/birobirobiro/DevStatus",
                  "_blank"
                )
              }
            >
              <div>
                <Github className="h-4 w-4" />
                <span>View on GitHub</span>
              </div>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit suggestion"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

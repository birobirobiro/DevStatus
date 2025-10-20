import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-zinc-800">404</h1>
          <h2 className="text-3xl font-bold text-zinc-100 mt-4">Page Not Found</h2>
          <p className="text-zinc-400 mt-2 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <Link href="/">
            <Button className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 gap-2">
              <Home className="w-4 h-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}


"use client";

import { useSession, signOut } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";

export function Navigation() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();

  if (pathname?.startsWith("/login") || pathname?.startsWith("/signup")) {
    return null;
  }

  if (isPending) {
    return (
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">Meet</div>
            <div className="w-20 h-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </nav>
    );
  }

  if (!session?.user) {
    return (
      <nav className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="text-xl font-bold">Meet</div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/login"}
              >
                Sign In
              </Button>
              <Button onClick={() => window.location.href = "/signup"}>
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div 
              className="text-xl font-bold cursor-pointer"
              onClick={() => window.location.href = "/"}
            >
              Meet
            </div>
            <div className="flex gap-4">
              <Button 
                variant={pathname === "/organizations" ? "default" : "ghost"}
                onClick={() => window.location.href = "/organizations"}
              >
                Organizations
              </Button>
              <Button 
                variant={pathname === "/subscription" ? "default" : "ghost"}
                onClick={() => window.location.href = "/subscription"}
              >
                Subscription
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {session.user.name || session.user.email}
            </span>
            <Button 
              variant="outline" 
              onClick={async () => {
                await signOut();
                window.location.href = "/";
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

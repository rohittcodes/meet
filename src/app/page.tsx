"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (session?.user && !isPending) {
      router.push("/organizations");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to Meet
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Organize your teams, manage projects, and collaborate seamlessly
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push("/signup")}
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => router.push("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Organizations</CardTitle>
              <CardDescription>
                Create and manage multiple organizations with different teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Create unlimited organizations (with Pro plan)</li>
                <li>• Invite team members</li>
                <li>• Role-based permissions</li>
                <li>• Custom branding</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Organize your team members and assign roles efficiently
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Member invitations</li>
                <li>• Role management</li>
                <li>• Activity tracking</li>
                <li>• Bulk operations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Flexible Plans</CardTitle>
              <CardDescription>
                Choose the plan that fits your organization's needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Free: 1 organization, 5 members</li>
                <li>• Pro: 10 organizations, 50 members each</li>
                <li>• Enterprise: Unlimited everything</li>
                <li>• Easy upgrades and downgrades</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to get started?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of teams already using Meet to organize their work
          </p>
          <Button 
            size="lg"
            onClick={() => router.push("/signup")}
          >
            Create Your Account
          </Button>
        </div>
      </div>
    </div>
  );
}

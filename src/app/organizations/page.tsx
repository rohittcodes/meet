"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/client";
import { 
  useOrganizations, 
  useCreateOrganization, 
  useCheckSlug 
} from "@/queries";
import type { Organization, Member } from "@/types";
import Image from "next/image";

export default function OrganizationsPage() {
  const { data: session } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    image: "",
  });

  const { data: organizations = [], isLoading, error } = useOrganizations();
  const createMutation = useCreateOrganization();
  const checkSlugMutation = useCheckSlug();

  const handleCreateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: createForm.name,
      slug: createForm.slug,
      logo: createForm.image || undefined,
    }, {
      onSuccess: () => {
        setCreateForm({ name: "", slug: "", image: "" });
        setShowCreateForm(false);
      }
    });
  };

  const handleSlugChange = (slug: string) => {
    setCreateForm({ ...createForm, slug });
    
    if (slug) {
      checkSlugMutation.mutate(slug, {
        onSuccess: (data) => {
          if (data?.status === false) {
            console.log("Slug is already taken");
          }
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading organizations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Error loading organizations. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Organizations</h1>
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateForm(true)}>
            Create Organization
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Organization</CardTitle>
            <CardDescription>
              Create a new organization to manage your team and projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateOrganization} className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="My Organization"
                  required
                />
              </div>
              <div>
                <Label htmlFor="slug">Organization Slug</Label>
                <Input
                  id="slug"
                  value={createForm.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="my-org"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be used in your organization URL: /o/{createForm.slug || "your-slug"}
                </p>
              </div>
              <div>
                <Label htmlFor="image">Logo URL (optional)</Label>
                <Input
                  id="image"
                  value={createForm.image}
                  onChange={(e) => setCreateForm({ ...createForm, image: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Organization"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {organizations.map((org) => (
          <Card key={org.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {org.image && (
                  <Image src={org.image} alt={org.name} className="w-8 h-8 rounded" width={32} height={32} />
                )}
                {org.name}
              </CardTitle>
              <CardDescription>
                Slug: {org.slug}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500 mb-4">
                Created: {new Date(org.createdAt).toLocaleDateString()}
              </p>
              <Button
                onClick={() => window.location.href = `/o/${org.slug}`}
                className="w-full"
              >
                Open Organization
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {organizations.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first organization to get started.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Organization
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

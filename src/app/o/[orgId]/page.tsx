"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/client";
import { 
  useOrganization,
  useOrganizationMembers, 
  useUpdateOrganization, 
  useInviteMember 
} from "@/queries";
import type { Organization, Member } from "@/types";
import Image from "next/image";

export default function OrganizationPage({ params }: { params: Promise<{ orgId: string }> }) {
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ orgId }) => setOrgId(orgId));
  }, [params]);

  if (!orgId) {
    return <div>Loading...</div>;
  }

  return <OrganizationPageClient orgId={orgId} />;
}

function OrganizationPageClient({ orgId }: { orgId: string }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    image: "",
  });

  const { data: organization, isLoading: orgLoading, error: orgError } = useOrganization(orgId);
  const { data: members = [], isLoading: membersLoading, error: membersError } = useOrganizationMembers(orgId);
  const updateMutation = useUpdateOrganization();
  const inviteMutation = useInviteMember();

  const handleUpdateOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate({
      organizationId: orgId,
      data: {
        name: editForm.name,
        logo: editForm.image || undefined,
      }
    }, {
      onSuccess: () => {
        setEditing(false);
      }
    });
  };

  const handleInviteMember = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const role = formData.get("role") as "member" | "admin" | "owner";

    inviteMutation.mutate({
      organizationId: orgId,
      email,
      role,
    }, {
      onSuccess: () => {
        (e.target as HTMLFormElement).reset();
      }
    });
  };

  const loading = orgLoading || membersLoading;
  const error = orgError || membersError;

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading organization...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center text-red-500">
          Error loading organization. Please try again.
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Organization not found</h1>
          <p className="text-gray-500 mb-4">
            The organization you're looking for doesn't exist or you don't have access to it.
          </p>
          <Button onClick={() => window.location.href = "/organizations"}>
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          {organization.image && (
            <Image src={organization.image} alt={organization.name} className="w-12 h-12 rounded" width={48} height={48} />
          )}
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <p className="text-gray-500">/{organization.slug}</p>
          </div>
        </div>
        <Button onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "Edit Organization"}
        </Button>
      </div>

      {editing && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Edit Organization</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateOrganization} className="space-y-4">
              <div>
                <Label htmlFor="name">Organization Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="image">Logo URL</Label>
                <Input
                  id="image"
                  value={editForm.image}
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Updating..." : "Update Organization"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Members ({members.length})</CardTitle>
            <CardDescription>
              Manage your organization members and their roles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">{member.user.name}</p>
                    <p className="text-sm text-gray-500">{member.user.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm">
                    {member.role}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invite Member</CardTitle>
            <CardDescription>
              Send an invitation to join your organization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="member@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  className="w-full p-2 border rounded"
                  required
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <Button type="submit" className="w-full" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
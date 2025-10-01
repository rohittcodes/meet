import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { authClient } from "@/lib/auth/client";
import type { Organization, Member } from "@/types";

export function useOrganizations() {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: async (): Promise<Organization[]> => {
      const response = await fetch("/api/organizations");
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch organizations");
      }
      
      return data.organizations.map((org: any) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        image: org.image,
        createdAt: org.createdAt,
      }));
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: { name: string; slug: string; logo?: string }) => {
      const { data: result, error } = await authClient.organization.create({
        name: data.name,
        slug: data.slug,
        logo: data.logo,
      });
      
      if (error) {
        throw new Error(error.message || "Failed to create organization");
      }
      
      return result;
    },
    onSuccess: (data) => {
      // Invalidate and refetch organizations
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      
      toast.success("Organization created successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to create organization: ${error.message}`);
    },
  });
}

export function useCheckSlug() {
  return useMutation({
    mutationFn: async (slug: string) => {
      const { data } = await authClient.organization.checkSlug({ slug });
      return data;
    },
    onError: (error) => {
      console.error("Failed to check slug:", error);
    },
  });
}

export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async (): Promise<Organization | null> => {
      const response = await fetch(`/api/organizations/${organizationId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch organization");
      }
      
      return data.organization;
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: ["organization-members", organizationId],
    queryFn: async (): Promise<Member[]> => {
      const response = await fetch(`/api/organizations/${organizationId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to fetch organization members");
      }
      
      return data.members || [];
    },
    enabled: !!organizationId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, data }: { organizationId: string; data: { name: string; logo?: string } }) => {
      const { data: result, error } = await authClient.organization.update({
        organizationId,
        data: {
          name: data.name,
          logo: data.logo,
        },
      });
      
      if (error) {
        throw new Error(error.message || "Failed to update organization");
      }
      
      return result;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch organizations and members
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
      queryClient.invalidateQueries({ queryKey: ["organization-members", variables.organizationId] });
      
      toast.success("Organization updated successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to update organization: ${error.message}`);
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ organizationId, email, role }: { organizationId: string; email: string; role: string }) => {
      const { data, error } = await authClient.organization.inviteMember({
        email,
        role: [role as "member" | "admin" | "owner"],
        organizationId,
      });
      
      if (error) {
        throw new Error(error.message || "Failed to invite member");
      }
      
      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch organization members
      queryClient.invalidateQueries({ queryKey: ["organization-members", variables.organizationId] });
      
      toast.success("Invitation sent successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to invite member: ${error.message}`);
    },
  });
}

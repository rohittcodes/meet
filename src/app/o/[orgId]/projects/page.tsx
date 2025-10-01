"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/lib/auth/client";
import { toast } from "sonner";
import type { Project } from "@/types";
import { useCreateProject, useProjects } from "@/queries";

export default function ProjectsPage({ params }: { params: Promise<{ orgId: string }> }) {
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    params.then(({ orgId }) => setOrgId(orgId));
  }, [params]);

  if (!orgId) {
    return <div>Loading...</div>;
  }

  return <ProjectsPageClient orgId={orgId} />;
}

function ProjectsPageClient({ orgId }: { orgId: string }) {
  const { data: session, isPending: sessionLoading } = useSession();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    color: "#3B82F6",
  });
	const projectsQuery = useProjects(orgId);
	const createProject = useCreateProject(orgId);

  // Authentication check
  if (sessionLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to view projects.</p>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

	const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
			await createProject.mutateAsync({
				name: createForm.name,
				description: createForm.description,
				color: createForm.color,
			});
      setCreateForm({ name: "", description: "", color: "#3B82F6" });
      setShowCreateForm(false);
    } catch (error) {
			// toast handled in mutation onError
    }
  };

  // Query key already depends on orgId; no extra effect required

	if (projectsQuery.isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button onClick={() => setShowCreateForm(true)}>
          Create Project
        </Button>
      </div>

      {showCreateForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>
              Create a new project to organize your work and tasks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="My Project"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Project description"
                />
              </div>
              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={createForm.color}
                    onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                    className="w-16 h-10"
                  />
                  <Input
                    value={createForm.color}
                    onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                    placeholder="#3B82F6"
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  Create Project
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
		{(projectsQuery.data || []).map((project) => (
          <Card key={project.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: project.color }}
                />
                {project.name}
                <span className={`px-2 py-1 rounded text-xs ml-auto ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {project.status}
                </span>
              </CardTitle>
              <CardDescription>
                {project.description || 'No description'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>Created: {new Date(project.createdAt).toLocaleDateString()}</p>
                <p>Last updated: {new Date(project.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 mt-4">
				<Button
				  onClick={() => {
					window.location.href = `/o/${orgId}/projects/${project.id}/docs`;
				  }}
				  className="flex-1"
				>
                  View Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    // TODO: Implement project settings
                    toast.info("Project settings coming soon!");
                  }}
                >
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

		{(projectsQuery.data?.length ?? 0) === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-8">
            <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first project to organize your work and collaborate with your team.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              Create Project
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

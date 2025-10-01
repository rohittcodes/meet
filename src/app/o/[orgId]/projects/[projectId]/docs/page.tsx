"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCreateDocument, useDocuments } from "@/queries";
import { toast } from "sonner";

export default function ProjectDocsPage({ params }: { params: Promise<{ orgId: string; projectId: string }> }) {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    params.then(({ orgId, projectId }) => {
      setOrgId(orgId);
      setProjectId(projectId);
    });
  }, [params]);
  if (!orgId || !projectId) return <div>Loading...</div>;
  return <ProjectDocsPageClient orgId={orgId} projectId={projectId} />;
}

function ProjectDocsPageClient({ orgId, projectId }: { orgId: string; projectId: string }) {
  const { data: session, isPending } = useSession();
  const docsQuery = useDocuments(orgId, projectId);
  const createDoc = useCreateDocument(orgId, projectId);
  const [title, setTitle] = useState("");

  if (isPending) return <div className="p-6">Loading...</div>;
  if (!session?.user) return <div className="p-6">Unauthorized</div>;

  const onCreate = async () => {
    if (!title.trim()) return;
    try {
      await createDoc.mutateAsync({ title, content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }) });
      setTitle("");
    } catch (e) {
      toast.error("Failed to create document");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New note title" />
        <Button onClick={onCreate}>Create</Button>
      </div>
      <div className="grid gap-3">
        {(docsQuery.data || []).map((doc) => (
          <Card key={doc.id} className="hover:shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="font-medium">{doc.title}</div>
              <Button variant="outline" onClick={() => (window.location.href = `/o/${orgId}/projects/${projectId}/docs/${doc.slug || doc.id}`)}>Open</Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {(docsQuery.data?.length ?? 0) === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-gray-600">No notes yet. Create your first note.</CardContent>
        </Card>
      )}
    </div>
  );
}



"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "@/lib/auth/client";
import { DocumentEditor } from "@/components/editor/DocumentEditor";
import { useDeleteDocument, useDocuments, useUpdateDocument } from "@/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export default function DocEditorPage({ params }: { params: Promise<{ orgId: string; projectId: string; documentId: string }> }) {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  useEffect(() => {
    params.then(({ orgId, projectId, documentId }) => {
      setOrgId(orgId);
      setProjectId(projectId);
      setDocumentId(documentId);
    });
  }, [params]);
  if (!orgId || !projectId || !documentId) return <div>Loading...</div>;
  return <DocEditorPageClient orgId={orgId} projectId={projectId} documentId={documentId} />;
}

function DocEditorPageClient({ orgId, projectId, documentId }: { orgId: string; projectId: string; documentId: string }) {
  const { data: session, isPending } = useSession();
  const docsQuery = useDocuments(orgId, projectId);
  const updateDoc = useUpdateDocument(orgId, projectId);
  const deleteDoc = useDeleteDocument(orgId, projectId);

  const doc = useMemo(() => (docsQuery.data || []).find(d => d.id === documentId || d.slug === documentId), [docsQuery.data, documentId]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (doc) setTitle(doc.title);
  }, [doc]);

  if (isPending || docsQuery.isLoading) return <div className="p-6">Loading...</div>;
  if (!session?.user) return <div className="p-6">Unauthorized</div>;
  if (!doc) return <div className="p-6">Document not found</div>;

  const onTitleBlur = async () => {
    if (title.trim() && title !== doc.title) {
      try {
        await updateDoc.mutateAsync({ documentId: doc.id, data: { title } });
      } catch (e) {
        toast.error("Failed to update title");
      }
    }
  };

  let parsedContent: any = null;
  try {
    parsedContent = typeof doc.content === 'string' ? JSON.parse(doc.content) : (doc.content ?? null);
  } catch {
    parsedContent = null;
  }

  return (
    <div className="container mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={onTitleBlur} className="text-xl font-semibold" />
        <Button
          variant="outline"
          onClick={async () => {
            try {
              await deleteDoc.mutateAsync(doc.id);
              window.location.href = `/o/${orgId}/projects/${projectId}/docs`;
            } catch (e) {
              toast.error("Failed to delete document");
            }
          }}
        >Delete</Button>
      </div>
      <DocumentEditor
        initialContent={parsedContent}
        onChange={async (json) => {
          // Debounce could be added; simple immediate save for now
          try {
            await updateDoc.mutateAsync({ documentId: doc.id, data: { content: JSON.stringify(json) } });
          } catch (e) {
            // silent; could toast throttled
          }
        }}
      />
    </div>
  );
}



"use client";

import { useEffect, useState } from "react";
import { DocsLayout } from "@/components/editor/DocsSidebar";

export default function ProjectDocsLayout({ children, params }: { children: React.ReactNode; params: Promise<{ orgId: string; projectId: string }> }) {
  const [orgId, setOrgId] = useState<string | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  useEffect(() => {
    params.then(({ orgId, projectId }) => {
      setOrgId(orgId);
      setProjectId(projectId);
    });
  }, [params]);
  if (!orgId || !projectId) return <div>Loading...</div>;
  return <DocsLayout orgId={orgId} projectId={projectId}>{children}</DocsLayout>;
}



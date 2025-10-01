"use client";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubItem, SidebarProvider, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { useDocuments, useCreateDocument, useDeleteDocument, useReorderDocuments } from "@/queries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";

export function DocsLayout({ orgId, projectId, children }: { orgId: string; projectId: string; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-[calc(100vh-4rem)]">
        <DocsSidebar orgId={orgId} projectId={projectId} />
        <SidebarInset>
          <div className="p-4">
            <SidebarTrigger className="mb-2" />
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

function DocsSidebar({ orgId, projectId }: { orgId: string; projectId: string }) {
  const docsQuery = useDocuments(orgId, projectId);
  const createDoc = useCreateDocument(orgId, projectId);
  const deleteDoc = useDeleteDocument(orgId, projectId);
  const [title, setTitle] = useState("");
  const reorder = useReorderDocuments(orgId, projectId);

  const buildTree = () => {
    const docs = (docsQuery.data || []).slice().sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const byParent: Record<string, any[]> = {};
    for (const d of docs) {
      const key = d.parentId || "root";
      byParent[key] ||= [];
      byParent[key].push(d);
    }
    return byParent;
  };
  const tree = buildTree();

  const onDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.dataTransfer.setData("text/plain", id);
  };
  const onDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    const sourceId = e.dataTransfer.getData("text/plain");
    if (!sourceId || sourceId === targetId) return;
    const docs = (docsQuery.data || []).slice();
    const byId: Record<string, any> = Object.fromEntries(docs.map(d => [d.id, d]));
    const byParent: Record<string, any[]> = {};
    for (const d of docs) {
      const key = d.parentId || "root";
      byParent[key] ||= [];
      byParent[key].push(d);
    }
    for (const key in byParent) byParent[key].sort((a,b)=> (a.position??0)-(b.position??0));

    const source = byId[sourceId];
    const target = byId[targetId];
    if (!source || !target) return;

    const makeItems = (): Array<{ id: string; position: number; parentId?: string | null }> => {
      const updates: Array<{ id: string; position: number; parentId?: string | null }> = [];
      const commitOrder = (list: any[], parentId: string | null) => {
        list.forEach((d, idx) => updates.push({ id: d.id, position: idx, parentId }));
      };

      if (e.shiftKey) {
        const prevParentKey = source.parentId || "root";
        const nextParentKey = target.id;
        const oldList = (byParent[prevParentKey] || []).filter(d => d.id !== source.id);
        byParent[prevParentKey] = oldList;
        const newList = byParent[nextParentKey] || [];
        source.parentId = target.id;
        newList.push(source);
        byParent[nextParentKey] = newList;
        commitOrder(byParent[prevParentKey] || [], prevParentKey === "root" ? null : prevParentKey);
        commitOrder(byParent[nextParentKey] || [], nextParentKey);
      } else {
        const targetParentKey = target.parentId || "root";
        const list = (byParent[targetParentKey] || []).filter(d => d.id !== source.id);
        const targetIdx = list.findIndex(d => d.id === target.id);
        list.splice(targetIdx, 0, source);
        source.parentId = targetParentKey === "root" ? null : targetParentKey;
        byParent[targetParentKey] = list;
        commitOrder(list, source.parentId ?? null);
      }
      return updates;
    };

    const items = makeItems();
    if (items.length > 0) reorder.mutate(items);
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="px-2 text-sm font-medium">Notes</div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Create</SidebarGroupLabel>
          <div className="flex gap-2 px-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New note title" />
            <Button
              onClick={async () => {
                if (!title.trim()) return;
                try {
                  await createDoc.mutateAsync({ title, content: JSON.stringify({ type: "doc", content: [{ type: "paragraph" }] }) });
                  setTitle("");
                } catch {
                  toast.error("Failed to create note");
                }
              }}
            >Add</Button>
          </div>
          <SidebarSeparator />
          <SidebarGroupLabel>All Notes</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {(tree["root"] || []).map((doc) => (
                <SidebarMenuItem key={doc.id}>
                  <div
                    className="flex items-center gap-2"
                    draggable
                    onDragStart={(e) => onDragStart(e, doc.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => onDrop(e, doc.id)}
                  >
                    <SidebarMenuButton asChild>
                      <a href={`/o/${orgId}/projects/${projectId}/docs/${doc.slug || doc.id}`}>
                        <span>{doc.title}</span>
                      </a>
                    </SidebarMenuButton>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async (e) => {
                        e.preventDefault();
                        try {
                          await deleteDoc.mutateAsync(doc.id);
                        } catch {
                          toast.error("Failed to delete");
                        }
                      }}
                    >✕</Button>
                  </div>
                  {(tree[doc.id] || []).length > 0 && (
                    <SidebarMenuSub>
                      {(tree[doc.id] || []).map((child) => (
                        <SidebarMenuSubItem key={child.id}>
                          <div
                            className="flex items-center gap-2"
                            draggable
                            onDragStart={(e) => onDragStart(e, child.id)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => onDrop(e, child.id)}
                          >
                            <SidebarMenuButton asChild>
                              <a href={`/o/${orgId}/projects/${projectId}/docs/${child.slug || child.id}`}>
                                <span>{child.title}</span>
                              </a>
                            </SidebarMenuButton>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={async (e) => {
                                e.preventDefault();
                                try {
                                  await deleteDoc.mutateAsync(child.id);
                                } catch {
                                  toast.error("Failed to delete");
                                }
                              }}
                            >✕</Button>
                          </div>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}



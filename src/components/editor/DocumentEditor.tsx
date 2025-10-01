"use client";

import { useEffect, useMemo, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/core";
import { createLowlight } from "lowlight";
const lowlight = createLowlight();
import StarterKitExtensionBulletList from "@tiptap/extension-bullet-list";
import StarterKitExtensionOrderedList from "@tiptap/extension-ordered-list";

type Props = {
  initialContent: any;
  onChange: (json: any) => void;
  placeholder?: string;
  readOnly?: boolean;
};

export function DocumentEditor({ initialContent, onChange, placeholder = "Start writing...", readOnly = false }: Props) {
  const saveTimeout = useRef<number | null>(null);
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false, allowBase64: true, HTMLAttributes: { class: "rounded-md" } }),
      StarterKitExtensionBulletList,
      StarterKitExtensionOrderedList,
    ],
    content: initialContent ?? { type: "doc", content: [{ type: "paragraph" }] },
    editable: !readOnly,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      if (saveTimeout.current) window.clearTimeout(saveTimeout.current);
      saveTimeout.current = window.setTimeout(() => onChange(json), 600);
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.commands.setContent(initialContent ?? { type: "doc", content: [{ type: "paragraph" }] });
  }, [initialContent, editor]);

  return (
    <div className="prose max-w-none space-y-3">
      <div className="flex gap-2">
        <UploadButton<OurFileRouter, "imageUploader">
          endpoint="imageUploader"
          onClientUploadComplete={(res) => {
            if (!editor || !res?.[0]?.url) return;
            editor.chain().focus().setImage({ src: res[0].url }).run();
          }}
          onUploadError={() => {}}
        />
        <UploadButton<OurFileRouter, "fileUploader">
          endpoint="fileUploader"
          onClientUploadComplete={(res) => {
            if (!editor || !res?.[0]?.url) return;
            const url = res[0].url;
            editor.chain().focus().insertContent({ type: "paragraph", content: [{ type: "text", text: url, marks: [{ type: "link", attrs: { href: url, target: "_blank" } }] }] }).run();
          }}
          onUploadError={() => {}}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}



"use client";

import { useCallback, useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  Heading4,
  List,
  ListOrdered,
  Quote,
  Link2,
  Link2Off,
  ImagePlus,
  Table as TableIcon,
  Minus,
  Undo2,
  Redo2,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Article editor.
 *
 * WYSIWYG rather than Markdown, because the people publishing here are
 * restaurant consultants, not developers. The output is HTML, which matches how
 * the migrated WordPress articles are stored — one content format across the
 * whole blog, and it is re-sanitised server-side on every save.
 */

function ToolbarButton({
  onClick,
  active,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        "grid h-9 w-9 place-items-center rounded-lg border text-cream-300 transition-colors disabled:cursor-not-allowed disabled:opacity-35",
        active
          ? "border-gold-400/60 bg-gold-500/15 text-gold-300"
          : "border-transparent hover:border-cream-100/12 hover:bg-cream-100/6 hover:text-cream-50",
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-6 w-px shrink-0 bg-cream-100/10" />;
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const setLink = useCallback(() => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL (leave empty to remove)", previous ?? "https://");

    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const uploadImage = useCallback(
    async (file: File) => {
      setUploading(true);
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/studio/upload", { method: "POST", body });
        const data = await res.json();

        if (!res.ok) {
          window.alert(data.error ?? "Upload failed.");
          return;
        }
        editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
      } catch {
        window.alert("Upload failed. Check your connection and try again.");
      } finally {
        setUploading(false);
      }
    },
    [editor],
  );

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 rounded-t-xl border-b border-cream-100/10 bg-ink-850/95 p-2 backdrop-blur">
      <ToolbarButton label="Bold" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")}>
        <Bold className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")}>
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        label="Section heading (H2)"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Sub-heading (H3)"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Minor heading (H4)"
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        active={editor.isActive("heading", { level: 4 })}
      >
        <Heading4 className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")}>
        <List className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")}>
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Quote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")}>
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Add link" onClick={setLink} active={editor.isActive("link")}>
        <Link2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton
        label="Remove link"
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive("link")}
      >
        <Link2Off className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton label="Insert image" onClick={() => fileInput.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
      </ToolbarButton>
      <input
        ref={fileInput}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
          e.target.value = "";
        }}
      />

      <Divider />

      <ToolbarButton
        label="Insert table"
        onClick={() =>
          editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
        }
        active={editor.isActive("table")}
      >
        <TableIcon className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      {/* The house style: every article opens with a Direct Answer box. */}
      <ToolbarButton
        label="Insert Direct Answer box"
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertContent(
              '<div class="direct-answer"><p><strong>Question this article answers?</strong></p><p>One or two sentences that answer it outright.</p></div><p></p>',
            )
            .run()
        }
      >
        <Lightbulb className="h-4 w-4" />
      </ToolbarButton>

      <Divider />

      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    // Required in Next.js: rendering on the server would mismatch on hydration.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        // H1 belongs to the page title, never the body.
        heading: { levels: [2, 3, 4] },
        codeBlock: false,
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      Image.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({
        placeholder: "Start with the direct answer, then build the argument…",
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "prose-pfc min-h-[28rem] max-w-none px-5 py-6 focus:outline-none [&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-gold-400",
      },
    },
  });

  if (!editor) {
    return <div className="h-[32rem] animate-pulse rounded-xl border border-cream-100/10 bg-ink-850" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-cream-100/10 bg-ink-900">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

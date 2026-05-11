"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { Mark, mergeAttributes, Node } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import { useEffect, useState } from "react";
import {
  Bold as BoldIcon,
  Heading1,
  Heading2,
  ImagePlus,
  Italic as ItalicIcon,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Unlink,
} from "lucide-react";
import { MediaModal } from "@/components/media/media-modal";
import { FileType } from "@/types/file";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const EmailLink = Mark.create({
  name: "emailLink",
  inclusive: false,
  addAttributes() {
    return {
      href: { default: null },
      target: { default: "_blank" },
      rel: { default: "noopener noreferrer" },
    };
  },
  parseHTML() {
    return [{ tag: "a[href]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["a", mergeAttributes(HTMLAttributes), 0];
  },
});

const EmailImage = Node.create({
  name: "emailImage",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: null },
      alt: { default: "" },
      title: { default: null },
    };
  },
  parseHTML() {
    return [{ tag: "img[src]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "img",
      mergeAttributes(HTMLAttributes, {
        style:
          "max-width:100%;height:auto;border-radius:14px;display:block;margin:16px auto;",
      }),
    ];
  },
});

const toolbarButton =
  "inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:border-[var(--brand-300)] hover:bg-[var(--brand-50)] data-[active=true]:border-[var(--brand-500)] data-[active=true]:bg-[var(--brand-50)] data-[active=true]:text-[var(--brand-700)] dark:border-white/10 dark:bg-white/6 dark:text-slate-200 dark:hover:border-white/20 dark:hover:bg-white/10 dark:data-[active=true]:border-[var(--brand-400)] dark:data-[active=true]:bg-[color:rgba(128,32,46,0.18)] dark:data-[active=true]:text-white";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function RichEditor({ value, onChange }: Props) {
  const [mediaOpen, setMediaOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [linkHref, setLinkHref] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      EmailLink,
      EmailImage,
    ],
    content: value || "<p></p>",
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || "<p></p>");
    }
  }, [editor, value]);

  if (!editor) return null;

  const insertLink = () => {
    if (!linkHref.trim()) return;

    editor
      .chain()
      .focus()
      .setMark("emailLink", {
        href: linkHref.trim(),
      })
      .run();
    setLinkHref("");
    setLinkOpen(false);
  };

  const insertImageUrl = () => {
    if (!imageUrl.trim()) return;

    editor
      .chain()
      .focus()
      .insertContent({
        type: "emailImage",
        attrs: { src: imageUrl.trim(), alt: imageAlt.trim() },
      })
      .run();
    setImageUrl("");
    setImageAlt("");
    setImageOpen(false);
  };

  const insertMediaImage = (file: FileType, alt: string) => {
    editor
      .chain()
      .focus()
      .insertContent({
        type: "emailImage",
        attrs: { src: file.path, alt: alt || file.name },
      })
      .run();
    setMediaOpen(false);
  };

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[rgba(11,18,32,0.98)] dark:shadow-[0_24px_60px_-36px_rgba(0,0,0,0.56)]">
      <div className="flex flex-wrap gap-2 border-b border-slate-100 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/4">
        <button
          type="button"
          data-active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={toolbarButton}
        >
          <Pilcrow className="size-3.5" />
          Body
        </button>
        <button
          type="button"
          data-active={editor.isActive("heading", { level: 1 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={toolbarButton}
        >
          <Heading1 className="size-3.5" />
          H1
        </button>
        <button
          type="button"
          data-active={editor.isActive("heading", { level: 2 })}
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={toolbarButton}
        >
          <Heading2 className="size-3.5" />
          H2
        </button>
        <button
          type="button"
          data-active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={toolbarButton}
        >
          <BoldIcon className="size-3.5" />
          Bold
        </button>

        <button
          type="button"
          data-active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={toolbarButton}
        >
          <ItalicIcon className="size-3.5" />
          Italic
        </button>

        <button
          type="button"
          data-active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={toolbarButton}
        >
          <List className="size-3.5" />
          Bullets
        </button>

        <button
          type="button"
          data-active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={toolbarButton}
        >
          <ListOrdered className="size-3.5" />
          Numbers
        </button>
        <button
          type="button"
          onClick={() => setLinkOpen(true)}
          className={toolbarButton}
        >
          <LinkIcon className="size-3.5" />
          Link
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().unsetMark("emailLink").run()}
          className={toolbarButton}
        >
          <Unlink className="size-3.5" />
          Unlink
        </button>
        <button
          type="button"
          onClick={() => setImageOpen(true)}
          className={toolbarButton}
        >
          <ImagePlus className="size-3.5" />
          Image URL
        </button>
        <button
          type="button"
          onClick={() => setMediaOpen(true)}
          className={toolbarButton}
        >
          <ImagePlus className="size-3.5" />
          Media Image
        </button>
      </div>

      <EditorContent
        editor={editor}
        className="min-h-[320px] p-5 text-slate-800 outline-none focus:outline-none dark:text-slate-100 [&_.ProseMirror]:min-h-[320px] [&_.ProseMirror]:outline-none [&_.ProseMirror_a]:text-[var(--brand-700)] dark:[&_.ProseMirror_a]:text-[var(--brand-200)] [&_.ProseMirror_a]:underline [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h2]:text-2xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_p]:text-slate-700 dark:[&_.ProseMirror_p]:text-slate-200 [&_.ProseMirror_strong]:text-slate-950 dark:[&_.ProseMirror_strong]:text-white [&_.ProseMirror_ul]:ml-5 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ol]:ml-5 [&_.ProseMirror_ol]:list-decimal"
      />

      <MediaModal
        open={mediaOpen}
        onClose={() => setMediaOpen(false)}
        onSelect={insertMediaImage}
        previewType="image"
      />

      <Dialog open={linkOpen} onOpenChange={setLinkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert link</DialogTitle>
          </DialogHeader>
          <Input
            value={linkHref}
            onChange={(event) => setLinkHref(event.target.value)}
            placeholder="https://example.com"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertLink}>Insert link</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={imageOpen} onOpenChange={setImageOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Insert image URL</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="https://example.com/image.jpg"
            />
            <Input
              value={imageAlt}
              onChange={(event) => setImageAlt(event.target.value)}
              placeholder="Image alt text"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageOpen(false)}>
              Cancel
            </Button>
            <Button onClick={insertImageUrl}>Insert image</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

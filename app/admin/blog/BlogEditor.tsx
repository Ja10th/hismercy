"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import LinkExtension from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useFormStatus } from "react-dom";
import {
  Bold,
  Eye,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  PenLine,
  Quote,
  Redo2,
  Save,
  Trash2,
  Undo2,
  X,
} from "lucide-react";

type BlogStudioEditorProps = {
  mode: "create" | "edit";
  initial?: {
    id?: string;
    title?: string;
    slug?: string;
    excerpt?: string;
    category?: string;
    content?: string;
    status?: string;
    scheduledAt?: string | null;
    coverImage?: string | null;
  };
  publishAction: (formData: FormData) => void | Promise<void>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function ActionButtons({
  mode,
  publishAction,
}: {
  mode: "create" | "edit";
  publishAction: (formData: FormData) => void | Promise<void>;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="mt-4 flex gap-3">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-white px-4 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <PenLine className="h-4 w-4" />
        {pending
          ? "Saving..."
          : mode === "create"
            ? "Save draft"
            : "Save changes"}
      </button>

      <button
        type="submit"
        formAction={publishAction}
        disabled={pending}
        className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-neutral-200 bg-emerald-700 px-4 text-xs font-medium text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Save className="h-4 w-4" />
        {pending ? "Publishing..." : "Publish"}
      </button>
    </div>
  );
}

export default function BlogStudioEditor({
  mode,
  initial,
  publishAction,
}: BlogStudioEditorProps) {
  const [title, setTitle] = useState(initial?.title || "");
  const [slug, setSlug] = useState(initial?.slug || "");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [status, setStatus] = useState(initial?.status || "draft");
  const [scheduledAt, setScheduledAt] = useState(initial?.scheduledAt || "");
  const [contentHtml, setContentHtml] = useState(initial?.content || "<p></p>");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [coverPreview, setCoverPreview] = useState<string | null>(
    initial?.coverImage || null,
  );
  const bodyImageInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
    ],
    content: initial?.content || "<p></p>",
    editorProps: {
      attributes: {
        class:
          "h-[620px] overflow-y-auto rounded-[26px] border border-neutral-200 bg-white px-4 py-4 text-[15px] leading-7 outline-none focus:border-neutral-400 [&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-3 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_p]:my-3 [&_img]:my-4 [&_img]:w-full [&_img]:rounded-2xl [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5",
      },
    },
    onUpdate: ({ editor }) => {
      setContentHtml(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      setContentHtml(editor.getHTML());
    }
  }, [editor]);

  useEffect(() => {
    if (!slugTouched && title.trim()) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  const previewHtml = useMemo(() => contentHtml || "<p></p>", [contentHtml]);

  const uploadImageToBody = async (file: File) => {
    if (!editor) return;

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/blog-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = (await response.json()) as { url: string };
    editor.chain().focus().setImage({ src: data.url, alt: file.name }).run();
  };

  const handleBodyImagePick = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await uploadImageToBody(file);
    } finally {
      event.target.value = "";
    }
  };

  const handleCoverPick = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverPreview(URL.createObjectURL(file));
  };

  const promptLink = () => {
    if (!editor) return;

    const url = window.prompt("Paste link URL");
    if (!url) return;

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const currentBlock = editor?.isActive("heading", { level: 1 })
    ? "h1"
    : editor?.isActive("heading", { level: 2 })
      ? "h2"
      : editor?.isActive("heading", { level: 3 })
        ? "h3"
        : "paragraph";

  const setBlockType = (value: string) => {
    if (!editor) return;

    if (value === "paragraph") {
      editor.chain().focus().setParagraph().run();
      return;
    }

    if (value === "h1") {
      editor.chain().focus().toggleHeading({ level: 1 }).run();
      return;
    }

    if (value === "h2") {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
      return;
    }

    if (value === "h3") {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    }
  };

  return (
    <>
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <section className="space-y-5">
          <div className="overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div className="text-sm font-medium text-neutral-900">
                Main content
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                <Eye className="h-3.5 w-3.5" />
                Preview
              </button>
            </div>

            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex flex-wrap gap-2">
                  <select
                    value={currentBlock}
                    onChange={(e) => setBlockType(e.target.value)}
                    className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 outline-none"
                  >
                    <option value="paragraph">Paragraph</option>
                    <option value="h1">H1</option>
                    <option value="h2">H2</option>
                    <option value="h3">H3</option>
                  </select>

                  <ToolbarButton
                    active={editor?.isActive("bold")}
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                  >
                    <Bold className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    active={editor?.isActive("italic")}
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                  >
                    <Italic className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    active={editor?.isActive("bulletList")}
                    onClick={() =>
                      editor?.chain().focus().toggleBulletList().run()
                    }
                  >
                    <List className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    active={editor?.isActive("orderedList")}
                    onClick={() =>
                      editor?.chain().focus().toggleOrderedList().run()
                    }
                  >
                    <ListOrdered className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    active={editor?.isActive("blockquote")}
                    onClick={() =>
                      editor?.chain().focus().toggleBlockquote().run()
                    }
                  >
                    <Quote className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton onClick={promptLink}>
                    <Link2 className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    onClick={() => bodyImageInputRef.current?.click()}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    onClick={() =>
                      editor?.chain().focus().unsetAllMarks().clearNodes().run()
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    onClick={() => editor?.chain().focus().undo().run()}
                  >
                    <Undo2 className="h-4 w-4" />
                  </ToolbarButton>

                  <ToolbarButton
                    onClick={() => editor?.chain().focus().redo().run()}
                  >
                    <Redo2 className="h-4 w-4" />
                  </ToolbarButton>
                </div>

                <input
                  ref={bodyImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleBodyImagePick}
                />
              </div>

              <div className="mt-4">
                <EditorContent editor={editor} />
              </div>

              <input type="hidden" name="content" value={contentHtml} />
            </div>
          </div>
        </section>

        <aside className="space-y-5 xl:sticky xl:top-0 xl:self-start xl:h-[780px] xl:overflow-y-auto">
          <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-4 text-sm font-medium text-neutral-900">
              Document
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Title
                </label>
                <input
                  name="title"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (!slugTouched) setSlug(slugify(e.target.value));
                  }}
                  placeholder="Post title"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Slug
                </label>
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  placeholder="post-slug"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Category
                </label>
                <input
                  name="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="Category"
                  className="h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-[15px] outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Short summary shown in cards and search results"
                  className="min-h-[120px] w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-400 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-4 text-sm font-medium text-neutral-900">
              Publish
            </div>

            <label className="block text-sm font-medium text-neutral-700">
              Status
            </label>
            <select
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            >
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
            </select>

            <label className="mt-4 block text-sm font-medium text-neutral-700">
              Schedule
            </label>
            <input
              name="scheduledAt"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="mt-2 h-12 w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 text-sm outline-none transition focus:border-neutral-400 focus:bg-white"
            />

            <ActionButtons mode={mode} publishAction={publishAction} />
          </div>

          <div className="rounded-[28px] border border-neutral-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
            <div className="mb-4 text-sm font-medium text-neutral-900">
              Cover image
            </div>

            <input
              name="coverImage"
              type="file"
              accept="image/*"
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs file:mr-4 file:rounded-full file:border-0 file:bg-emerald-700 file:px-4 file:py-2 file:text-xs file:font-medium file:text-white"
              onChange={handleCoverPick}
            />
          </div>
        </aside>
      </div>

      {previewOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-[0_30px_100px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <div>
                <p className="text-sm font-medium text-neutral-900">Preview</p>
                <p className="mt-1 text-xs text-neutral-500">
                  How the post will read when published
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-6 py-6">
              <div className="mx-auto max-w-3xl">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Preview cover"
                    className="mb-6 h-[320px] w-full rounded-[26px] object-cover"
                  />
                ) : null}

                <h2 className="text-[34px] font-semibold tracking-tight text-neutral-950">
                  {title || "Untitled post"}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-neutral-500">
                  <span>{category || "Uncategorized"}</span>
                  <span>•</span>
                  <span>
                    {status === "published"
                      ? "Published"
                      : status === "scheduled"
                        ? "Scheduled"
                        : "Draft"}
                  </span>
                </div>

                {excerpt ? (
                  <p className="mt-5 text-[17px] leading-8 text-neutral-600">
                    {excerpt}
                  </p>
                ) : null}

                <div
                  className="mt-8 space-y-4 text-neutral-700 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:text-2xl [&_h3]:font-semibold [&_h3]:tracking-tight [&_p]:leading-8 [&_img]:my-6 [&_img]:w-full [&_img]:rounded-2xl [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral-200 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-blue-700 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: previewHtml }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

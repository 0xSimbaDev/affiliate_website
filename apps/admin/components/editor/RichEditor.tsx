'use client'

import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@affiliate/utils'
import { EditorToolbar } from './EditorToolbar'
import { Shortcode } from './extensions/shortcode'

interface RichEditorProps {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  siteId?: string
  className?: string
  editable?: boolean
  minHeight?: string
}

export function RichEditor({
  content = '',
  onChange,
  placeholder = 'Start writing...',
  siteId,
  className,
  editable = true,
  minHeight = '300px',
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
        horizontalRule: {
          HTMLAttributes: {
            class: 'my-4 border-t border-gray-300',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'border-l-4 border-gray-300 pl-4 italic my-4',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc list-inside my-2',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal list-inside my-2',
          },
        },
        code: {
          HTMLAttributes: {
            class: 'bg-gray-100 rounded px-1.5 py-0.5 font-mono text-sm',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'bg-gray-100 rounded-lg p-4 font-mono text-sm my-4 overflow-x-auto',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: 'text-primary underline hover:no-underline cursor-pointer',
          rel: 'noopener noreferrer',
        },
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4',
        },
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass:
          'before:content-[attr(data-placeholder)] before:absolute before:text-gray-400 before:pointer-events-none',
      }),
      Shortcode,
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose-base max-w-none focus:outline-none',
          'prose-headings:font-semibold prose-headings:text-gray-900',
          'prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-3',
          'prose-h3:text-lg prose-h3:mt-5 prose-h3:mb-2',
          'prose-h4:text-base prose-h4:mt-4 prose-h4:mb-2',
          'prose-p:text-gray-700 prose-p:leading-relaxed',
          'prose-a:text-primary prose-a:no-underline hover:prose-a:underline',
          'prose-strong:text-gray-900 prose-strong:font-semibold',
          'prose-ul:my-2 prose-ol:my-2',
          'prose-li:my-0.5'
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    },
  })

  return (
    <div className={cn('overflow-hidden rounded-md', className)}>
      <EditorToolbar editor={editor} siteId={siteId} />
      <div
        className="border bg-white p-4 rounded-b-md"
        style={{ minHeight }}
      >
        <EditorContent editor={editor} className="h-full" />
      </div>

      {/* Shortcode Node Styles */}
      <style jsx global>{`
        .shortcode-node {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.75rem;
          margin: 0.25rem 0;
          background-color: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 0.375rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          font-size: 0.875rem;
          color: #1d4ed8;
          cursor: default;
          user-select: none;
        }

        .shortcode-node::before {
          content: '';
          display: inline-block;
          width: 1rem;
          height: 1rem;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231d4ed8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m7.5 4.27 9 5.15'/%3E%3Cpath d='M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z'/%3E%3Cpath d='m3.3 7 8.7 5 8.7-5'/%3E%3Cpath d='M12 22V12'/%3E%3C/svg%3E");
          background-size: contain;
          background-repeat: no-repeat;
        }

        .shortcode-node[data-shortcode-type='products']::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231d4ed8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='7' height='7' x='3' y='3' rx='1'/%3E%3Crect width='7' height='7' x='14' y='3' rx='1'/%3E%3Crect width='7' height='7' x='14' y='14' rx='1'/%3E%3Crect width='7' height='7' x='3' y='14' rx='1'/%3E%3C/svg%3E");
        }

        .shortcode-node[data-shortcode-type='comparison']::before {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%231d4ed8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='18' cy='18' r='3'/%3E%3Ccircle cx='6' cy='6' r='3'/%3E%3Cpath d='M13 6h3a2 2 0 0 1 2 2v7'/%3E%3Cpath d='M11 18H8a2 2 0 0 1-2-2V9'/%3E%3C/svg%3E");
        }

        .shortcode-node.ProseMirror-selectednode {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        /* Placeholder styling */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #9ca3af;
          pointer-events: none;
          height: 0;
        }

        /* Remove default ProseMirror focus outline */
        .ProseMirror:focus {
          outline: none;
        }

        /* Image styling */
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
      `}</style>
    </div>
  )
}

// Export hook for external editor access
export function useRichEditor(options?: {
  content?: string
  onChange?: (html: string) => void
  placeholder?: string
  editable?: boolean
}) {
  return useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4],
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
      }),
      Placeholder.configure({
        placeholder: options?.placeholder || 'Start writing...',
      }),
      Shortcode,
    ],
    content: options?.content || '',
    editable: options?.editable ?? true,
    onUpdate: ({ editor }) => {
      if (options?.onChange) {
        options.onChange(editor.getHTML())
      }
    },
  })
}

export type { Editor }
export default RichEditor

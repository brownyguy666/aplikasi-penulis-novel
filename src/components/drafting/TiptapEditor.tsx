'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import Highlight from '@tiptap/extension-highlight';
import { 
  Bold, 
  Italic, 
  Heading2, 
  Heading3, 
  Quote, 
  Minus, 
  Undo, 
  Redo, 
  Highlighter
} from 'lucide-react';

interface TiptapEditorProps {
  contentHtml: string;
  onChange: (html: string, plainText: string, wordCount: number) => void;
  placeholder?: string;
  isIndentParagraphs?: boolean;
}

export const TiptapEditor: React.FC<TiptapEditorProps> = ({
  contentHtml,
  onChange,
  placeholder = 'Mulai menulis draf ceritamu di sini...',
  isIndentParagraphs = true
}) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3]
        }
      }),
      Placeholder.configure({
        placeholder
      }),
      CharacterCount,
      Highlight
    ],
    content: contentHtml,
    editorProps: {
      attributes: {
        class: `novel-editor-content focus:outline-none min-h-[500px] p-6 sm:p-8 font-novel-serif ${
          isIndentParagraphs ? 'indent-paragraphs' : ''
        }`
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      const words = editor.storage.characterCount.words();
      onChange(html, text, words);
    },
    immediatelyRender: false
  });

  // Keep content synced if updated externally (e.g. from AI generator)
  useEffect(() => {
    if (editor && contentHtml !== editor.getHTML()) {
      // Check if text is genuinely different to avoid cursor jumps
      const currentText = editor.getText();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentHtml;
      const newText = tempDiv.innerText || tempDiv.textContent || '';
      if (Math.abs(currentText.length - newText.length) > 5) {
        editor.commands.setContent(contentHtml, { emitUpdate: false });
      }
    }
  }, [contentHtml, editor]);

  if (!editor) {
    return (
      <div className="p-8 text-center text-xs text-(--text-muted) animate-pulse">
        Memuat editor naskah...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-(--bg-secondary) rounded-2xl border border-(--border-color) overflow-hidden shadow-sm">
      
      {/* Editor Toolbar */}
      <div className="px-4 py-2 border-b border-(--border-color) bg-(--bg-primary)/80 backdrop-blur-sm flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('bold') ? 'bg-amber-500/20 text-amber-400' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
            }`}
            title="Tebal (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('italic') ? 'bg-amber-500/20 text-amber-400' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
            }`}
            title="Miring (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('highlight') ? 'bg-amber-500/20 text-amber-400' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
            }`}
            title="Sorot Teks"
          >
            <Highlighter className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-(--border-color) mx-1" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-1.5 rounded-lg font-bold transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-amber-500/20 text-amber-400' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
            }`}
            title="Sub-judul Bab (H2)"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-1.5 rounded-lg font-bold transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-amber-500/20 text-amber-400' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
            }`}
            title="Bagian Kecil (H3)"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-1.5 rounded-lg transition-colors ${
              editor.isActive('blockquote') ? 'bg-amber-500/20 text-amber-400' : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
            }`}
            title="Kutipan Surat / Dokumen"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-1.5 rounded-lg text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) transition-colors"
            title="Pemisah Adegan (* * *)"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-lg text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-lg text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary) disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>

      {/* Bottom Footer Info */}
      <div className="px-4 py-2 border-t border-(--border-color) bg-(--bg-primary)/80 flex items-center justify-between text-[11px] text-(--text-muted)">
        <span className="font-mono">
          {editor.storage.characterCount.words()} kata • {editor.storage.characterCount.characters()} karakter
        </span>
        <span>Format Naskah Fiksi Sastra</span>
      </div>

    </div>
  );
};

import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'

export default function RichEditor({ value, onChange, placeholder }: { value?: string; onChange?: (v: string) => void; placeholder?: string }) {
  const quillRef = useRef<any>()
  const [inner, setInner] = useState<string>(value || '')

  useEffect(() => {
    if (typeof value === 'string' && value !== inner) {
      setInner(value)
    }
  }, [value])

  const handleUpload = () => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*,application/pdf')
    input.onchange = async () => {
      const file = (input.files || [])[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const quill = quillRef.current?.getEditor?.()
        if (!quill) return
        const range = quill.getSelection(true) || { index: 0 }
        const result = reader.result as string
        if (file.type.startsWith('image/')) {
          quill.insertEmbed(range.index, 'image', result, 'user')
        } else {
          quill.insertText(range.index, `${file.name} (PDF)`, { link: result }, 'user')
        }
      }
      reader.readAsDataURL(file)
    }
    input.click()
  }

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, 3, false] }],
        [{ font: [] }, { size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block'],
        [{ color: [] }, { background: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        [{ indent: '-1' }, { indent: '+1' }],
        [{ align: [] }],
        ['link', 'image'],
        ['clean'],
      ],
      handlers: { image: handleUpload },
    },
    clipboard: { matchVisual: false },
  }), [])

  const formats = useMemo(() => [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
    'color', 'background',
    'list', 'bullet', 'indent',
    'align', 'link', 'image'
  ], [])

  return (
    <div>
      <ReactQuill
        ref={quillRef as any}
        theme="snow"
        value={inner}
        onChange={(val) => { setInner(val); onChange?.(val) }}
        placeholder={placeholder}
        modules={modules}
        formats={formats}
      />
    </div>
  )
}

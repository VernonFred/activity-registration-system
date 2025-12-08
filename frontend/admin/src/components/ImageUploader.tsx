import { Upload } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { upload } from '../services/uploader'
import { useMemo } from 'react'

export default function ImageUploader({ value, onChange, accept = 'image/*', disabled }: { value?: string; onChange?: (v?: string) => void; accept?: string; disabled?: boolean }) {
  const fileList = useMemo(() => (value ? [{ uid: '1', name: 'image', url: value }] : []), [value])
  return (
    <Upload
      className="center-trigger"
      listType="picture-card"
      accept={accept}
      disabled={disabled}
      fileList={fileList as any}
      onRemove={() => (disabled ? false : onChange?.(undefined))}
      beforeUpload={(file) => {
        if (disabled) return false
        upload(file).then((url) => onChange?.(url))
        return false
      }}
    >
      {fileList.length ? null : (
        <div className="upload-trigger-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <PlusOutlined />
          <div style={{ marginTop: 8, textAlign: 'center' }}>上传图片</div>
        </div>
      )}
    </Upload>
  )
}

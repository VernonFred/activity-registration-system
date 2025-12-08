export type UploadMode = 'dataurl' | 'cos'

const MODE: UploadMode = (import.meta.env.VITE_UPLOAD_MODE as UploadMode) || 'dataurl'

export async function upload(file: File): Promise<string> {
  if (MODE === 'dataurl') {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsDataURL(file)
    })
  }
  // 预留对象存储直传：此处可替换为获取签名并上传，返回文件 URL
  // 当前占位：仍回落到 dataURL，保持页面可用
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}


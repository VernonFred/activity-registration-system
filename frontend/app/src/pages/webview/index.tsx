/**
 * WebView 页面
 * 用于在小程序内打开微信文章链接
 */
import { View, WebView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { useEffect, useState } from 'react'
import './index.scss'

const WebViewPage = () => {
  const router = useRouter()
  const [url, setUrl] = useState('')

  useEffect(() => {
    const encodedUrl = router.params.url
    if (encodedUrl) {
      const decodedUrl = decodeURIComponent(encodedUrl)
      setUrl(decodedUrl)
      
      // 设置页面标题（可选）
      const title = router.params.title
      if (title) {
        Taro.setNavigationBarTitle({ title: decodeURIComponent(title) })
      }
    }
  }, [router.params])

  const handleError = () => {
    Taro.showToast({
      title: '页面加载失败',
      icon: 'none'
    })
  }

  const handleLoad = () => {
    console.log('WebView loaded:', url)
  }

  if (!url) {
    return (
      <View className="webview-loading">
        <View className="loading-spinner" />
      </View>
    )
  }

  return (
    <WebView 
      src={url}
      onError={handleError}
      onLoad={handleLoad}
    />
  )
}

export default WebViewPage


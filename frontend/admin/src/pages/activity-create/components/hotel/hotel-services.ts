import type { HotelWeatherInfo } from '../../types'

export function buildStaticMapUrl(lat: number, lng: number): string {
  const key = import.meta.env.VITE_TENCENT_MAP_KEY
  if (!key) return ''
  return `https://apis.map.qq.com/ws/staticmap/v2/?key=${key}&center=${lat},${lng}&zoom=15&size=600*300&markers=color:red|${lat},${lng}`
}

export function buildMapNavUrl(lat: number, lng: number, name?: string): string {
  const key = import.meta.env.VITE_TENCENT_MAP_KEY
  const to = encodeURIComponent(name || '目的地')
  return `https://apis.map.qq.com/uri/v1/routeplan?type=drive&tocoord=${lat},${lng}&to=${to}&referer=${key || 'activity-admin'}`
}

export function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const key = import.meta.env.VITE_TENCENT_MAP_KEY
  if (!key || !address.trim()) return Promise.resolve(null)

  return new Promise((resolve) => {
    const cbName = `_qqmaps_geocode_${Date.now()}`
    const script = document.createElement('script')
    const timeout = setTimeout(() => {
      cleanup()
      resolve(null)
    }, 8000)

    function cleanup() {
      clearTimeout(timeout)
      delete (window as any)[cbName]
      script.remove()
    }

    ;(window as any)[cbName] = (data: any) => {
      cleanup()
      if (data?.status === 0 && data.result?.location) {
        resolve({ lat: data.result.location.lat, lng: data.result.location.lng })
      } else {
        resolve(null)
      }
    }

    script.src = `https://apis.map.qq.com/ws/geocoder/v1/?address=${encodeURIComponent(address)}&key=${key}&output=jsonp&callback=${cbName}`
    document.head.appendChild(script)
  })
}

export async function fetchWeatherByLocation(lat: number, lng: number): Promise<HotelWeatherInfo | null> {
  const key = import.meta.env.VITE_QWEATHER_KEY
  if (!key) return null
  try {
    const url = `https://devapi.qweather.com/v7/weather/now?key=${key}&location=${lng.toFixed(2)},${lat.toFixed(2)}`
    const resp = await fetch(url)
    const data = await resp.json()
    if (data.code !== '200' || !data.now) return null
    return {
      temperature: Number(data.now.temp) || undefined,
      condition: data.now.text || '',
      humidity: Number(data.now.humidity) || undefined,
      wind_speed: Number(data.now.windSpeed) || undefined,
      visibility: Number(data.now.vis) || undefined,
    }
  } catch {
    return null
  }
}

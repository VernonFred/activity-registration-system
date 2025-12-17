/**
 * 微信相关服务
 */
import Taro from '@tarojs/taro'
import { CONFIG } from '../config'

const BASE_URL = CONFIG.API_BASE_URL + '/api/v1'

/**
 * 解密微信手机号
 */
export const decryptWechatPhone = async (code: string) => {
  const response = await Taro.request({
    url: `${BASE_URL}/wechat/decrypt-phone`,
    method: 'POST',
    data: { code },
    header: {
      'Content-Type': 'application/json'
    }
  })
  return response.data
}

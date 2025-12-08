/**
 * 环境配置文件
 * 统一管理所有环境变量和配置项
 */

// 判断是否为开发环境（小程序环境中 process 不存在，使用默认值）
const isDev = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development'

export const CONFIG = {
  /**
   * Mock 数据开关
   * - Phase 1-4: true（使用 Mock 数据）
   * - Phase 5-6: false（使用真实 API）
   */
  USE_MOCK: true,

  /**
   * API Base URL
   * - 开发环境：本地后端地址
   * - 生产环境：真实域名地址
   * Phase 1-4 使用 Mock 数据，暂不需要配置
   */
  API_BASE_URL: 'http://localhost:8000',

  /**
   * 小程序 AppID
   * - Phase 5 配置真实 AppID
   */
  WX_APP_ID: '',

  /**
   * AI 服务配置（硅基流动）
   * - Phase 4 配置真实 API Key
   */
  AI_API_KEY: '',
  AI_API_URL: 'https://api.siliconflow.cn/v1/chat/completions',
  AI_MODEL: 'gpt-3.5-turbo', // 或其他硅基流动支持的模型

  /**
   * 请求超时时间（毫秒）
   */
  TIMEOUT: 10000,

  /**
   * 是否打印调试日志
   */
  DEBUG: true, // Phase 1-4 开启调试

  /**
   * 图片占位符（开发阶段使用）
   */
  PLACEHOLDER_IMAGE: 'https://via.placeholder.com/750x400',

  /**
   * 分页配置
   */
  PAGE_SIZE: 10, // 默认每页条数
}

/**
 * 环境信息
 */
export const ENV_INFO = {
  isDev,
  isProd: !isDev,
  platform: 'weapp', // 小程序环境
}


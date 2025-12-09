import devConfig from './dev'
import prodConfig from './prod'

// 根据编译目标设置不同的输出目录
// 小程序: dist/ (用于微信开发者工具)
// H5: dist-h5/ (用于浏览器预览)
const getOutputRoot = () => {
  const target = process.env.TARO_ENV || 'weapp'
  return target === 'h5' ? 'dist-h5' : 'dist'
}

const baseConfig = {
  projectName: 'event-signup-app',
  date: '2024-10-07',
  designWidth: 375,
  deviceRatio: {
    375: 2,
    414: 2
  },
  sourceRoot: 'src',
  outputRoot: getOutputRoot(),
  plugins: [
    '@tarojs/plugin-html', 
    '@tarojs/plugin-http', 
    '@tarojs/plugin-framework-react',
    '@tarojs/plugin-platform-h5'
  ],
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false
    }
  },
  framework: 'react',
  cache: { enable: true },
  mini: {
    postcss: {
      pxtransform: { enable: true },
      autoprefixer: { enable: true }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['taro-ui'],
    router: {
      mode: 'browser'
    },
    devServer: {
      port: 3000,
      hot: true,
      historyApiFallback: true
    },
    postcss: {
      pxtransform: {
        enable: true,
        config: {
          onePxTransform: true,
          unitPrecision: 5,
          propList: ['*'],
          selectorBlackList: [],
          replace: true,
          mediaQuery: false,
          minPixelValue: 0,
          // H5 专用配置：将 rpx 转换为 rem，基准为 375px 设计稿
          baseFontSize: 20,
          maxRootSize: 40,
          minRootSize: 12
        }
      },
      autoprefixer: { enable: true }
    }
  }
}

type Env = 'development' | 'production'

export default function defineConfig(merge: (...args: any[]) => any, env: Env) {
  const envConfig = env === 'development' ? devConfig : prodConfig
  return merge({}, baseConfig, envConfig)
}

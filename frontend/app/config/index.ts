import devConfig from './dev'
import prodConfig from './prod'

const baseConfig = {
  projectName: 'event-signup-app',
  date: '2024-10-07',
  designWidth: 375,
  deviceRatio: {
    375: 2,
    414: 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
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
          minPixelValue: 0
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

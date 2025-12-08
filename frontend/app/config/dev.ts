import type { UserConfigExport } from '@tarojs/cli'

const config: UserConfigExport = {
  defineConstants: {},
  h5: {
    devServer: {
      host: 'localhost',
      port: 10086
    }
  }
}

export default config

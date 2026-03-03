import { Button, Card, Form, Input, message } from 'antd'
import { Moon, Sun } from 'lucide-react'
import { login, setToken } from '../services/auth'
import { useLocation, useNavigate } from 'react-router-dom'
import { useThemeContext } from '../hooks/useTheme'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/'
  const { toggleTheme, isDark } = useThemeContext()

  const onFinish = async (values: any) => {
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate(from, { replace: true })
    } catch (e: any) {
      const canUseDevFallback = import.meta.env.DEV && !e?.response && values.username === 'admin' && values.password === 'Admin@123'

      if (canUseDevFallback) {
        setToken('dev-admin-token')
        message.warning('后端未连接，已进入前端演示模式')
        navigate(from, { replace: true })
        return
      }

      if (!e?.response) {
        message.error('登录失败：后端未启动或接口不可达')
        return
      }

      message.error(e?.response?.data?.detail || '登录失败')
    }
  }

  return (
    <div className="login-bg snow-login">
      <button
        type="button"
        className="snow-header__icon-btn snow-login__theme-btn"
        onClick={toggleTheme}
        title={isDark ? '切换浅色模式' : '切换暗黑模式'}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <Card className="glass-card login-card snow-login__card" bordered={false}>
        <div className="snow-sider__dots snow-login__dots" aria-hidden="true">
          <span className="red" />
          <span className="yellow" />
          <span className="green" />
        </div>
        <div className="login-card__badge">Frost Admin</div>
        <div className="login-card__title">欢迎登录</div>
        <div className="login-card__subtitle">活动报名管理后台</div>

        <Form layout="vertical" onFinish={onFinish} initialValues={{ username: 'admin', password: 'Admin@123' }}>
          <Form.Item label="用户名" name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="admin" size="large" />
          </Form.Item>
          <Form.Item label="密码" name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="Admin@123" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              登录
            </Button>
          </Form.Item>
        </Form>
        <div className="login-card__hint">开发环境默认账号：admin / Admin@123</div>
      </Card>
    </div>
  )
}

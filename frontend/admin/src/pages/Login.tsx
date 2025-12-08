import { Button, Card, Form, Input, message } from 'antd'
import { login } from '../services/auth'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation() as any
  const from = location.state?.from?.pathname || '/'

  const onFinish = async (values: any) => {
    try {
      await login(values.username, values.password)
      message.success('登录成功')
      navigate(from, { replace: true })
    } catch (e: any) {
      message.error(e?.response?.data?.detail || '登录失败')
    }
  }

  return (
    <div className="login-bg">
      <Card className="glass-card" style={{ width: 380, padding: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>欢迎登录</div>
        <div style={{ color: '#999', marginBottom: 24 }}>活动管理后台</div>
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
      </Card>
    </div>
  )
}


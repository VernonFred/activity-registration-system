import { Layout, Menu, theme, Dropdown } from 'antd'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  DashboardOutlined,
  AppstoreOutlined,
  NotificationOutlined,
  ClusterOutlined,
  ScheduleOutlined,
  LogoutOutlined,
} from '@ant-design/icons'
import { clearToken } from '../services/auth'

const { Sider, Header, Content } = Layout

const items = [
  { key: '/', icon: <DashboardOutlined />, label: <Link to="/">仪表盘</Link> },
  { key: '/activities', icon: <AppstoreOutlined />, label: <Link to="/activities">活动创建</Link> },
  { key: '/signups', icon: <AppstoreOutlined />, label: <Link to="/signups">报名管理</Link> },
  { key: '/form-designer', icon: <AppstoreOutlined />, label: <Link to="/form-designer">表单设计</Link> },
  { key: '/reviews', icon: <NotificationOutlined />, label: <Link to="/reviews">审核与通知管理</Link> },
  { key: '/activity-data', icon: <ScheduleOutlined />, label: <Link to="/activity-data">活动数据</Link> },
  { key: '/badge-rules', icon: <ClusterOutlined />, label: <Link to="/badge-rules">徽章管理</Link> },
  { key: '/comments', icon: <AppstoreOutlined />, label: <Link to="/comments">评论管理</Link> },
  { key: '/settings', icon: <ScheduleOutlined />, label: <Link to="/settings">设置管理</Link> },
]

export default function AdminLayout() {
  const {
    token: { colorBgContainer },
  } = theme.useToken()
  const location = useLocation()
  const navigate = useNavigate()

  const onLogout = () => {
    clearToken()
    navigate('/login', { replace: true })
  }

  const menu = (
    <Menu
      items={[
        {
          key: 'logout',
          icon: <LogoutOutlined />,
          label: '退出登录',
          onClick: onLogout,
        },
      ]}
    />
  )

  return (
    <Layout style={{ minHeight: '100vh' }} className="app-glass">
      <Sider width={220} style={{ background: '#fff' }}>
        <div style={{ height: 64, fontWeight: 700, display: 'flex', alignItems: 'center', paddingLeft: 20 }}>活动管理后台</div>
        <Menu mode="inline" selectedKeys={[location.pathname]} items={items} style={{ height: '100%' }} />
      </Sider>
      <Layout>
        <Header style={{ background: colorBgContainer, display: 'flex', justifyContent: 'flex-end', padding: '0 16px' }}>
          <Dropdown overlay={menu} placement="bottomRight">
            <a style={{ fontWeight: 500 }}>admin</a>
          </Dropdown>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

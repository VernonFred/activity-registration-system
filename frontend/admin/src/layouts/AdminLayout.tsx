import { useEffect, useMemo, useState } from 'react'
import { Breadcrumb, Dropdown, Layout, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  CalendarRange,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ClipboardList,
  FileEdit,
  Home,
  LayoutDashboard,
  LogOut,
  Moon,
  Search,
  Settings,
  Sun,
  Users,
} from 'lucide-react'
import { clearToken } from '../services/auth'
import { useThemeContext } from '../hooks/useTheme'

const { Sider, Header, Content } = Layout
const { Text } = Typography

type ChildItem = {
  key: string
  label: string
}

type NavItem = {
  key: string
  label: string
  icon: React.ReactNode
  children?: ChildItem[]
}

type NavSection = {
  key: string
  items: NavItem[]
}

const SIDEBAR_WIDTH = 212
const SIDEBAR_COLLAPSED = 72

const navSections: NavSection[] = [
  {
    key: 'main',
    items: [
      { key: '/', label: '仪表盘', icon: <LayoutDashboard size={20} /> },
      {
        key: '/activities',
        label: '活动管理',
        icon: <CalendarRange size={20} />,
        children: [
          { key: '/activities/new', label: '活动创建' },
          { key: '/signups', label: '报名信息' },
          { key: '/activity-data', label: '活动数据' },
        ],
      },
      {
        key: '/reviews',
        label: '活动内容管理',
        icon: <ClipboardList size={20} />,
        children: [{ key: '/reviews', label: '文章管理' }],
      },
      {
        key: '/users',
        label: '用户管理',
        icon: <Users size={20} />,
        children: [
          { key: '/payments', label: '缴费管理' },
          { key: '/notifications', label: '通知设置' },
          { key: '/users', label: '用户信息' },
        ],
      },
      {
        key: '/comments',
        label: '行为管理',
        icon: <BarChart3 size={20} />,
        children: [
          { key: '/comments', label: '评论管理' },
          { key: '/badge-rules', label: '徽章管理' },
        ],
      },
      { key: '/form-designer', label: '表单设计', icon: <FileEdit size={20} /> },
      { key: '/settings', label: '设置管理', icon: <Settings size={20} /> },
    ],
  },
]

const pageMeta: Record<string, { title: string; group: string }> = {
  '/': { title: '仪表盘', group: '概览' },
  '/activities': { title: '活动管理', group: '活动管理' },
  '/activities/new': { title: '创建活动', group: '活动管理' },
  '/signups': { title: '报名信息', group: '活动管理' },
  '/form-designer': { title: '表单设计', group: '表单设计' },
  '/reviews': { title: '活动内容管理', group: '活动内容管理' },
  '/notifications': { title: '通知设置', group: '用户管理' },
  '/badge-rules': { title: '徽章管理', group: '行为管理' },
  '/comments': { title: '评论管理', group: '行为管理' },
  '/payments': { title: '缴费管理', group: '用户管理' },
  '/users': { title: '用户信息', group: '用户管理' },
  '/activity-data': { title: '活动数据', group: '活动管理' },
  '/settings': { title: '设置管理', group: '设置管理' },
  '/scheduler': { title: '调度任务', group: '设置管理' },
}

const routeAliases: Record<string, string> = {
  '/activities/new': '/activities',
  '/signups': '/activities',
  '/activity-data': '/activities',
  '/payments': '/users',
  '/notifications': '/users',
  '/badge-rules': '/comments',
}

function normalizePath(pathname: string) {
  if (pathname === '/activity-create') return '/activities/new'
  if (pathname.startsWith('/activities/')) return '/activities'
  for (const key of Object.keys(pageMeta)) {
    if (key !== '/' && pathname.startsWith(key)) return key
  }
  return '/'
}

function findOpenParentKey(pathname: string) {
  const matchPath = routeAliases[pathname] || pathname
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.key === matchPath) return item.key
      if (item.children?.some((child) => child.key === pathname)) return item.key
    }
  }
  return '/'
}

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useThemeContext()

  const currentPath = normalizePath(location.pathname)
  const [collapsed, setCollapsed] = useState(false)
  const [openParent, setOpenParent] = useState(findOpenParentKey(currentPath))
  const [flyout, setFlyout] = useState<{ key: string; top: number } | null>(null)

  const currentMeta = pageMeta[currentPath] || pageMeta['/']

  useEffect(() => {
    setOpenParent(findOpenParentKey(currentPath))
  }, [currentPath])

  const accountMenu = useMemo<MenuProps>(
    () => ({
      items: [
        {
          key: 'logout',
          icon: <LogOut size={14} />,
          label: '退出登录',
          onClick: () => {
            clearToken()
            navigate('/login', { replace: true })
          },
        },
      ],
    }),
    [navigate]
  )

  const renderParentItem = (item: NavItem) => {
    const childKeys = item.children?.map((child) => child.key) || []
    const isCurrent = currentPath === item.key || childKeys.includes(currentPath)
    const expanded = openParent === item.key

    return (
      <div key={item.key} className="snow-item-wrap">
        <button
          type="button"
          className={`snow-item ${isCurrent ? 'is-active' : ''} ${expanded ? 'is-open' : ''}`}
          onClick={(event) => {
            if (collapsed && item.children?.length) {
              setFlyout((prev) => (prev?.key === item.key ? null : { key: item.key, top: (event.currentTarget as HTMLButtonElement).offsetTop }))
              return
            }

            if (item.children?.length) {
              setOpenParent((prev) => (prev === item.key ? '' : item.key))
            } else {
              navigate(item.key)
            }
          }}
          title={collapsed ? item.label : undefined}
        >
          <span className="snow-item__icon">{item.icon}</span>
          {!collapsed ? <span className="snow-item__label">{item.label}</span> : null}
          {!collapsed && item.children?.length ? (
            <span className="snow-item__chevron">{expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</span>
          ) : null}
        </button>

        {!collapsed && item.children?.length && expanded ? (
          <div className="snow-submenu">
            <div className="snow-submenu__rail" />
            <div className="snow-submenu__list">
              {item.children.map((child) => (
                <button
                  key={child.key}
                  type="button"
                  className={`snow-submenu__item ${currentPath === child.key ? 'is-active' : ''}`}
                  onClick={() => navigate(child.key)}
                >
                  {child.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  const activeFlyoutItem = flyout ? navSections.flatMap((section) => section.items).find((item) => item.key === flyout.key) : null

  return (
    <Layout className="admin-shell snow-shell">
      <Sider
        width={SIDEBAR_WIDTH}
        collapsedWidth={SIDEBAR_COLLAPSED}
        collapsed={collapsed}
        trigger={null}
        className={`snow-sider ${collapsed ? 'is-collapsed' : ''}`}
      >
        <div className="snow-sider__inner">
          <div className="snow-sider__dots" aria-hidden="true">
            <span className="red" />
            <span className="yellow" />
            <span className="green" />
          </div>

          <div className="snow-user">
            <span className="snow-user__avatar">A</span>
            {!collapsed ? (
              <div className="snow-user__copy">
                <span className="snow-user__role">系统管理员</span>
                <span className="snow-user__name">admin</span>
              </div>
            ) : null}
          </div>

          <div className="snow-nav">
            {navSections.map((section) => (
              <section key={section.key} className="snow-section">
                <div className="snow-section__items">{section.items.map(renderParentItem)}</div>
              </section>
            ))}
          </div>

          <div className="snow-sider__footer">
            {!collapsed ? <div className="snow-sider__brandmark">会议报名系统</div> : null}
            <button
              type="button"
              className="snow-sider__toggle"
              onClick={() => {
                setCollapsed((prev) => !prev)
                setFlyout(null)
              }}
              aria-label={collapsed ? '展开侧边栏' : '折叠侧边栏'}
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          {collapsed && activeFlyoutItem?.children?.length && flyout ? (
            <div className="snow-flyout" style={{ top: flyout.top }}>
              {activeFlyoutItem.children.map((child) => (
                <button
                  key={child.key}
                  type="button"
                  className={`snow-flyout__item ${currentPath === child.key ? 'is-active' : ''}`}
                  onClick={() => {
                    navigate(child.key)
                    setFlyout(null)
                  }}
                >
                  {child.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </Sider>

      <Layout className="admin-shell__main" style={{ marginLeft: 0 }}>
        <Header className="admin-header snow-header">
          <div className="snow-header__left">
            <Breadcrumb
              className="admin-header__breadcrumb"
              items={[
                { title: <Home size={14} /> },
                { title: <span className="current">{currentMeta.title}</span> },
              ]}
            />
          </div>

          <div className="snow-header__right">
            <button type="button" className="snow-header__icon-btn" title="搜索">
              <Search size={16} />
            </button>
            <button
              type="button"
              className="snow-header__icon-btn"
              onClick={toggleTheme}
              title={isDark ? '切换浅色模式' : '切换暗黑模式'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Dropdown menu={accountMenu} placement="bottomRight" trigger={['click']}>
              <button type="button" className="snow-account">
                <span className="snow-account__avatar">A</span>
                <span className="snow-account__copy">
                  <Text strong className="admin-header__account-name">admin</Text>
                  <Text type="secondary" className="admin-header__account-role">系统管理员</Text>
                </span>
              </button>
            </Dropdown>
          </div>
        </Header>

        <Content className="admin-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

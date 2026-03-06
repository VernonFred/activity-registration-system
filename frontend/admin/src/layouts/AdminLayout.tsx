import { useEffect, useMemo, useState } from 'react'
import { Breadcrumb, Dropdown, Layout, Typography } from 'antd'
import type { MenuProps } from 'antd'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import './admin-shell.css'
import './admin-sidebar.css'
import './admin-header.css'
import './snow-sidebar-frame.css'
import './snow-sidebar-nav.css'
import './snow-flyout.css'
import './snow-header.css'
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  LogOut,
  Moon,
  Search,
  Sun,
} from 'lucide-react'
import { clearToken } from '../services/auth'
import { useThemeContext } from '../hooks/useTheme'
import {
  breadcrumbHome,
  findOpenParentKey,
  navSections,
  normalizePath,
  pageMeta,
  SIDEBAR_COLLAPSED,
  SIDEBAR_WIDTH,
  type NavItem,
} from './admin-nav-config'

const { Sider, Header, Content } = Layout
const { Text } = Typography

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
                breadcrumbHome,
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

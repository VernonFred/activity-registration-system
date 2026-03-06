import { BarChart3, CalendarRange, ClipboardList, FileEdit, Home, LayoutDashboard, Settings, Users } from 'lucide-react'
import type React from 'react'

export type ChildItem = {
  key: string
  label: string
}

export type NavItem = {
  key: string
  label: string
  icon: React.ReactNode
  children?: ChildItem[]
}

export type NavSection = {
  key: string
  items: NavItem[]
}

export const SIDEBAR_WIDTH = 212
export const SIDEBAR_COLLAPSED = 72

export const navSections: NavSection[] = [
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

export const pageMeta: Record<string, { title: string; group: string }> = {
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

export const routeAliases: Record<string, string> = {
  '/activities/new': '/activities',
  '/signups': '/activities',
  '/activity-data': '/activities',
  '/payments': '/users',
  '/notifications': '/users',
  '/badge-rules': '/comments',
}

export function normalizePath(pathname: string) {
  if (pathname === '/activity-create') return '/activities/new'
  if (pathname.startsWith('/activities/')) return '/activities'
  for (const key of Object.keys(pageMeta)) {
    if (key !== '/' && pathname.startsWith(key)) return key
  }
  return '/'
}

export function findOpenParentKey(pathname: string) {
  const matchPath = routeAliases[pathname] || pathname
  for (const section of navSections) {
    for (const item of section.items) {
      if (item.key === matchPath) return item.key
      if (item.children?.some((child) => child.key === pathname)) return item.key
    }
  }
  return '/'
}

export const breadcrumbHome = { title: <Home size={14} /> }

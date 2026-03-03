/**
 * Frost Admin — Ant Design 5 Theme Configuration
 * Teal primary, glass-compatible component styling
 * Used with ConfigProvider + dynamic dark/light switching
 */
import type { ThemeConfig } from 'antd'

/* ── Shared tokens ── */
const TEAL = {
  600: '#0d9488',
  700: '#0f766e',
  400: '#2dd4bf',
  300: '#5eead4',
}

const FONT_STACK = "'DM Sans', -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"

/* ═══ Light Theme ═══ */
export const lightTheme: ThemeConfig = {
  token: {
    colorPrimary: TEAL[600],
    colorSuccess: '#10b981',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorInfo: '#0ea5e9',

    colorBgContainer: 'rgba(255, 255, 255, 0.72)',
    colorBgLayout: 'transparent',
    colorBgElevated: 'rgba(255, 255, 255, 0.90)',
    colorBgSpotlight: 'rgba(255, 255, 255, 0.60)',

    colorText: '#0f172a',
    colorTextSecondary: '#475569',
    colorTextTertiary: '#94a3b8',
    colorTextQuaternary: '#cbd5e1',

    colorBorder: 'rgba(0, 0, 0, 0.08)',
    colorBorderSecondary: 'rgba(0, 0, 0, 0.04)',

    fontFamily: FONT_STACK,
    fontSize: 14,

    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,

    controlHeight: 38,
    controlHeightLG: 44,
    controlHeightSM: 30,

    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.08)',
  },
  components: {
    Button: {
      borderRadius: 10,
      primaryShadow: `0 4px 14px ${TEAL[600]}40`,
      defaultBorderColor: 'rgba(0, 0, 0, 0.10)',
      defaultBg: 'rgba(255, 255, 255, 0.72)',
    },
    Card: {
      borderRadiusLG: 18,
      paddingLG: 20,
    },
    Table: {
      headerBg: 'rgba(248, 250, 252, 0.80)',
      headerColor: '#475569',
      rowHoverBg: 'rgba(240, 253, 250, 0.50)',
      borderColor: 'rgba(0, 0, 0, 0.04)',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(0, 0, 0, 0.04)',
      darkItemSelectedColor: '#0f172a',
      darkItemColor: '#64748b',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
      darkItemHoverColor: '#0f172a',
    },
    Layout: {
      siderBg: 'transparent',
      headerBg: 'transparent',
      bodyBg: 'transparent',
    },
    Input: {
      activeBorderColor: TEAL[600],
      hoverBorderColor: TEAL[700],
      colorBgContainer: 'rgba(255, 255, 255, 0.60)',
    },
    Select: {
      colorBgContainer: 'rgba(255, 255, 255, 0.60)',
    },
    Segmented: {
      itemSelectedBg: 'rgba(255, 255, 255, 0.90)',
      itemSelectedColor: TEAL[600],
      trackBg: 'rgba(0, 0, 0, 0.04)',
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    Modal: {
      contentBg: 'rgba(255, 255, 255, 0.88)',
    },
    Dropdown: {
      colorBgElevated: 'rgba(255, 255, 255, 0.92)',
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(15, 23, 42, 0.92)',
    },
  },
}

/* ═══ Dark Theme ═══ */
export const darkTheme: ThemeConfig = {
  token: {
    colorPrimary: TEAL[400],
    colorSuccess: '#34d399',
    colorWarning: '#fbbf24',
    colorError: '#f87171',
    colorInfo: '#38bdf8',

    colorBgContainer: 'rgba(18, 18, 18, 0.55)',
    colorBgLayout: 'transparent',
    colorBgElevated: 'rgba(18, 18, 18, 0.82)',
    colorBgSpotlight: 'rgba(18, 18, 18, 0.40)',

    colorText: '#f5f5f5',
    colorTextSecondary: '#d4d4d4',
    colorTextTertiary: '#a3a3a3',
    colorTextQuaternary: '#737373',

    colorBorder: 'rgba(255, 255, 255, 0.12)',
    colorBorderSecondary: 'rgba(255, 255, 255, 0.06)',

    fontFamily: FONT_STACK,
    fontSize: 14,

    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 6,

    controlHeight: 38,
    controlHeightLG: 44,
    controlHeightSM: 30,

    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.20)',
    boxShadowSecondary: '0 4px 16px rgba(0, 0, 0, 0.28)',
  },
  components: {
    Button: {
      borderRadius: 10,
      primaryShadow: `0 4px 14px ${TEAL[400]}30`,
      defaultBorderColor: 'rgba(255, 255, 255, 0.14)',
      defaultBg: 'rgba(18, 18, 18, 0.55)',
      defaultColor: '#d4d4d4',
    },
    Card: {
      borderRadiusLG: 18,
      paddingLG: 20,
    },
    Table: {
      headerBg: 'rgba(18, 18, 18, 0.60)',
      headerColor: '#d4d4d4',
      rowHoverBg: 'rgba(45, 212, 191, 0.06)',
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    Menu: {
      darkItemBg: 'transparent',
      darkItemSelectedBg: 'rgba(255, 255, 255, 0.06)',
      darkItemSelectedColor: '#ffffff',
      darkItemColor: 'rgba(255, 255, 255, 0.58)',
      darkItemHoverBg: 'rgba(255, 255, 255, 0.06)',
      darkItemHoverColor: '#ffffff',
    },
    Layout: {
      siderBg: 'transparent',
      headerBg: 'transparent',
      bodyBg: 'transparent',
    },
    Input: {
      activeBorderColor: TEAL[400],
      hoverBorderColor: TEAL[300],
      colorBgContainer: 'rgba(18, 18, 18, 0.50)',
    },
    Select: {
      colorBgContainer: 'rgba(18, 18, 18, 0.50)',
    },
    Segmented: {
      itemSelectedBg: 'rgba(18, 18, 18, 0.80)',
      itemSelectedColor: TEAL[400],
      trackBg: 'rgba(255, 255, 255, 0.08)',
    },
    Tag: {
      borderRadiusSM: 9999,
    },
    Modal: {
      contentBg: 'rgba(18, 18, 18, 0.92)',
    },
    Dropdown: {
      colorBgElevated: 'rgba(18, 18, 18, 0.92)',
    },
    Tooltip: {
      colorBgSpotlight: 'rgba(8, 8, 8, 0.95)',
    },
  },
}

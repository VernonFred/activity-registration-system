#!/bin/bash

# 小程序开发启动脚本
# 使用方法: bash dev.sh

echo "🚀 正在启动小程序开发环境..."
echo ""

# 1. 清理缓存
echo "📦 清理编译缓存..."
rm -rf dist/ node_modules/.cache .taro-cache 2>/dev/null
echo "✅ 缓存已清理"
echo ""

# 2. 启动开发服务器
echo "🔨 开始编译小程序..."
echo "📍 项目路径: $(pwd)"
echo "📁 编译输出: dist/"
echo ""

# 执行编译
pnpm run dev:weapp

# 编译完成后的提示
echo ""
echo "✅ 编译完成！"
echo ""
echo "📱 下一步操作："
echo "1. 打开微信开发者工具"
echo "2. 导入项目，选择目录: $(pwd)"
echo "3. 确认 miniprogramRoot 设置为 'dist'"
echo ""


# V2 设计预览 - 一键自动化

> 无需手动操作，一条命令完成切换！

---

## 🚀 使用方法

### 1️⃣ 预览 V2 设计

在终端运行：

```bash
cd /Users/Python项目/活动报名系统/frontend/app
bash preview-v2.sh
```

**脚本会自动完成：**
1. ✅ 备份 V1 文件（`index-v1-backup.tsx` / `index-v1-backup.scss`）
2. ✅ 替换为 V2 文件（`index-v2.tsx` → `index.tsx`）
3. ✅ 清理编译缓存（`dist/` / `.cache` / `.taro-cache`）
4. ✅ 自动编译（`pnpm run dev:weapp`）

**完成后：**
- 在微信开发者工具中查看 V2 效果 🎨

---

### 2️⃣ 恢复 V1 设计

如果想切换回 V1，运行：

```bash
cd /Users/Python项目/活动报名系统/frontend/app
bash restore-v1.sh
```

**脚本会自动完成：**
1. ✅ 恢复 V1 文件（从备份）
2. ✅ 清理编译缓存
3. ✅ 自动编译

---

## 📋 脚本说明

### `preview-v2.sh` - 预览 V2
```bash
#!/bin/bash
# 1. 备份 V1 文件（如果尚未备份）
# 2. 替换为 V2 文件
# 3. 清理缓存
# 4. 自动编译
```

### `restore-v1.sh` - 恢复 V1
```bash
#!/bin/bash
# 1. 从备份恢复 V1 文件
# 2. 清理缓存
# 3. 自动编译
```

---

## 🎨 V1 vs V2 设计对比

| 特性 | V1（深绿色主题） | V2（Modern B2B SaaS） |
|------|----------------|---------------------|
| **主色** | 深绿色 `#2D5A3D` | 白色/浅灰 `#fff`/`#fafafa` |
| **头部** | 深绿色渐变背景 | 纯白色背景 |
| **搜索框** | 半透明白边框 | 浅灰背景胶囊 |
| **图标** | PNG 图片（~20KB） | SVG 内联（~1KB）✨ |
| **阴影** | 较重 | 柔和、扩散 |
| **状态标签** | 实色背景 | 浅色背景+边框 |
| **包大小** | 较大 | **更小** ✨ |

---

## 📂 文件结构

```
frontend/app/
├── preview-v2.sh          ← 预览 V2 脚本 ✨
├── restore-v1.sh          ← 恢复 V1 脚本 ✨
├── PREVIEW_V2.md          ← 本说明文档
└── src/pages/index/
    ├── index.tsx          ← 当前使用的文件
    ├── index.scss         ← 当前使用的样式
    ├── index-v1-backup.tsx   ← V1 备份（自动创建）
    ├── index-v1-backup.scss  ← V1 样式备份（自动创建）
    ├── index-v2.tsx       ← V2 源文件
    └── index-v2.scss      ← V2 样式源文件
```

---

## ⚠️ 注意事项

1. **首次运行** `preview-v2.sh` 会自动创建备份
2. **不要删除**备份文件（`index-v1-backup.*`），否则无法恢复
3. **编译时间**约 20-30 秒，请耐心等待
4. **微信开发者工具**：确保项目路径为 `/Users/Python项目/活动报名系统/frontend/app`

---

## 🆘 常见问题

### Q: 脚本无法执行？
**A**: 确保脚本有执行权限：
```bash
chmod +x preview-v2.sh restore-v1.sh
```

### Q: 编译失败？
**A**: 手动清理缓存：
```bash
cd /Users/Python项目/活动报名系统/frontend/app
rm -rf dist/ node_modules/.cache .taro-cache
pnpm run dev:weapp
```

### Q: 微信开发者工具显示空白？
**A**: 检查项目路径是否正确（应该是 `frontend/app` 而非 `frontend/app/dist`）

### Q: 想要永久使用 V2？
**A**: 手动删除备份文件，或直接删除 `index-v2.tsx` 和 `index-v2.scss`

---

## 💡 下一步

1. **预览 V2**：运行 `bash preview-v2.sh`
2. **查看效果**：在微信开发者工具中对比
3. **提供反馈**：告诉我们您的想法
4. **应用到其他页面**：如果满意，推广到全部页面

---

**祝您预览愉快！** 🎨✨



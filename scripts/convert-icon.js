/**
 * Lucide 图标转换工具
 * 将指定的 SVG 图标转换为 PNG（用于小程序）
 * 
 * 使用方法：
 *   node scripts/convert-icon.js <图标名称>
 *   node scripts/convert-icon.js star
 *   node scripts/convert-icon.js star bookmark heart
 *   node scripts/convert-icon.js --all  # 转换所有缺失的图标
 * 
 * 图标库位置：icons/
 * 输出位置：frontend/app/src/assets/icons/
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// 配置
const CONFIG = {
  iconsDir: path.join(__dirname, '..', 'icons'),
  outputDir: path.join(__dirname, '..', 'frontend', 'app', 'src', 'assets', 'icons'),
  size: 24,  // 24x24 像素
  defaultColor: '#FF8A1A'  // 橙色主题色
};

/**
 * 转换单个 SVG 图标为 PNG
 */
async function convertIcon(iconName) {
  const svgPath = path.join(CONFIG.iconsDir, `${iconName}.svg`);
  const pngPath = path.join(CONFIG.outputDir, `${iconName}.png`);

  // 检查 SVG 是否存在
  if (!fs.existsSync(svgPath)) {
    console.log(`❌ 未找到: ${iconName}.svg`);
    return false;
  }

  // 检查 PNG 是否已存在
  if (fs.existsSync(pngPath)) {
    console.log(`⏭️  跳过（已存在）: ${iconName}.png`);
    return true;
  }

  try {
    // 读取 SVG 内容
    let svgContent = fs.readFileSync(svgPath, 'utf8');
    
    // 替换 currentColor 为实际颜色
    svgContent = svgContent.replace(/currentColor/g, CONFIG.defaultColor);
    
    // 确保 SVG 有正确的尺寸
    svgContent = svgContent
      .replace(/width="(\d+)"/, `width="${CONFIG.size}"`)
      .replace(/height="(\d+)"/, `height="${CONFIG.size}"`);

    // 转换为 PNG
    await sharp(Buffer.from(svgContent))
      .resize(CONFIG.size, CONFIG.size)
      .png({
        compressionLevel: 9,
        adaptiveFiltering: true
      })
      .toFile(pngPath);

    const stats = fs.statSync(pngPath);
    console.log(`✅ 转换成功: ${iconName}.png (${stats.size} bytes)`);
    return true;

  } catch (error) {
    console.log(`❌ 转换失败: ${iconName} - ${error.message}`);
    return false;
  }
}

/**
 * 获取所有缺失的图标
 */
function getMissingIcons() {
  const svgFiles = fs.readdirSync(CONFIG.iconsDir)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''));
  
  const pngFiles = fs.readdirSync(CONFIG.outputDir)
    .filter(f => f.endsWith('.png'))
    .map(f => f.replace('.png', ''));

  return svgFiles.filter(svg => !pngFiles.includes(svg));
}

/**
 * 列出可用的图标
 */
function listAvailableIcons(filter = '') {
  const svgFiles = fs.readdirSync(CONFIG.iconsDir)
    .filter(f => f.endsWith('.svg'))
    .map(f => f.replace('.svg', ''))
    .filter(f => filter ? f.includes(filter) : true);

  console.log(`\n📂 可用图标（共 ${svgFiles.length} 个）:\n`);
  
  // 按字母分组显示
  const groups = {};
  svgFiles.forEach(icon => {
    const letter = icon[0].toUpperCase();
    if (!groups[letter]) groups[letter] = [];
    groups[letter].push(icon);
  });

  Object.keys(groups).sort().forEach(letter => {
    console.log(`${letter}: ${groups[letter].slice(0, 10).join(', ')}${groups[letter].length > 10 ? '...' : ''}`);
  });
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
🔄 Lucide 图标转换工具

用法：
  node scripts/convert-icon.js <图标名称>     转换指定图标
  node scripts/convert-icon.js star heart     转换多个图标
  node scripts/convert-icon.js --all          转换所有缺失的图标
  node scripts/convert-icon.js --list         列出所有可用图标
  node scripts/convert-icon.js --list star    搜索包含 "star" 的图标
  node scripts/convert-icon.js --missing      显示缺失的图标

配置：
  图标库：icons/
  输出目录：frontend/app/src/assets/icons/
  尺寸：${CONFIG.size}x${CONFIG.size} 像素
  颜色：${CONFIG.defaultColor}
`);
    return;
  }

  // 处理命令
  if (args[0] === '--list') {
    listAvailableIcons(args[1] || '');
    return;
  }

  if (args[0] === '--missing') {
    const missing = getMissingIcons();
    console.log(`\n🔴 缺失的图标（${missing.length} 个）:\n`);
    console.log(missing.slice(0, 50).join(', '));
    if (missing.length > 50) console.log(`... 还有 ${missing.length - 50} 个`);
    return;
  }

  if (args[0] === '--all') {
    const missing = getMissingIcons();
    console.log(`\n🔄 转换所有缺失的图标（${missing.length} 个）...\n`);
    
    let success = 0, failed = 0;
    for (const icon of missing.slice(0, 100)) {  // 最多转换100个
      if (await convertIcon(icon)) success++;
      else failed++;
    }
    
    console.log(`\n📊 完成：成功 ${success} 个，失败 ${failed} 个`);
    return;
  }

  // 转换指定的图标
  console.log(`\n🔄 转换图标...\n`);
  
  let success = 0, failed = 0;
  for (const iconName of args) {
    if (await convertIcon(iconName)) success++;
    else failed++;
  }
  
  console.log(`\n📊 完成：成功 ${success} 个，失败 ${failed} 个`);
}

main().catch(console.error);


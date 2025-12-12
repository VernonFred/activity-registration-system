/**
 * SVG 转 PNG 脚本
 * 用于将 icons-to-convert/ 目录中的 SVG 图标转换为 PNG
 * 
 * 使用方法：
 * 1. 安装依赖：npm install sharp
 * 2. 运行脚本：node scripts/svg-to-png.js
 */

const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  inputDir: path.join(__dirname, '..', 'icons-to-convert'),
  outputDir: path.join(__dirname, '..', 'frontend', 'app', 'src', 'assets', 'icons'),
  size: 24,  // 24x24 像素，与现有图标一致
  // 默认颜色（橙色主题）
  defaultColor: '#FF8A1A'
};

async function convertSvgToPng() {
  try {
    // 动态导入 sharp（ESM 兼容）
    const sharp = require('sharp');
    
    // 确保输出目录存在
    if (!fs.existsSync(CONFIG.outputDir)) {
      fs.mkdirSync(CONFIG.outputDir, { recursive: true });
    }

    // 读取所有 SVG 文件
    const svgFiles = fs.readdirSync(CONFIG.inputDir)
      .filter(file => file.endsWith('.svg'));

    console.log(`📂 找到 ${svgFiles.length} 个 SVG 文件`);

    for (const svgFile of svgFiles) {
      const inputPath = path.join(CONFIG.inputDir, svgFile);
      const outputFile = svgFile.replace('.svg', '.png');
      const outputPath = path.join(CONFIG.outputDir, outputFile);

      // 检查是否已存在
      if (fs.existsSync(outputPath)) {
        console.log(`⏭️  跳过（已存在）: ${outputFile}`);
        continue;
      }

      // 读取 SVG 内容
      let svgContent = fs.readFileSync(inputPath, 'utf8');
      
      // 替换 currentColor 为实际颜色
      svgContent = svgContent.replace(/currentColor/g, CONFIG.defaultColor);
      
      // 设置 SVG 的宽高属性（确保渲染正确）
      svgContent = svgContent.replace(
        /width="(\d+)"/,
        `width="${CONFIG.size}"`
      ).replace(
        /height="(\d+)"/,
        `height="${CONFIG.size}"`
      );

      // 转换为 PNG
      await sharp(Buffer.from(svgContent))
        .resize(CONFIG.size, CONFIG.size)
        .png({
          compressionLevel: 9,  // 最高压缩级别
          adaptiveFiltering: true
        })
        .toFile(outputPath);

      const stats = fs.statSync(outputPath);
      console.log(`✅ 转换成功: ${outputFile} (${stats.size} bytes)`);
    }

    console.log('\n🎉 所有 SVG 图标转换完成！');
    console.log(`📁 输出目录: ${CONFIG.outputDir}`);

  } catch (error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      console.error('\n❌ 错误：未安装 sharp 库');
      console.log('\n请先安装 sharp：');
      console.log('  cd /Users/Python项目/活动报名系统');
      console.log('  npm install sharp');
      console.log('\n然后重新运行此脚本：');
      console.log('  node scripts/svg-to-png.js');
    } else {
      console.error('转换失败:', error);
    }
    process.exit(1);
  }
}

// 如果没有 sharp，提供备用方案
async function showManualInstructions() {
  console.log('\n📋 手动转换方法（如果无法安装 sharp）：\n');
  console.log('方法一：使用在线转换工具');
  console.log('  1. 访问 https://cloudconvert.com/svg-to-png');
  console.log('  2. 上传 icons-to-convert/ 目录中的 SVG 文件');
  console.log('  3. 设置输出尺寸为 24x24');
  console.log('  4. 下载并放入 frontend/app/src/assets/icons/\n');
  
  console.log('方法二：使用 Inkscape（命令行）');
  console.log('  brew install inkscape');
  console.log('  for f in icons-to-convert/*.svg; do');
  console.log('    inkscape "$f" -w 24 -h 24 -o "frontend/app/src/assets/icons/$(basename "${f%.svg}.png")"');
  console.log('  done\n');
  
  console.log('方法三：使用 ImageMagick');
  console.log('  brew install imagemagick');
  console.log('  for f in icons-to-convert/*.svg; do');
  console.log('    convert "$f" -resize 24x24 "frontend/app/src/assets/icons/$(basename "${f%.svg}.png")"');
  console.log('  done\n');
  
  // 列出待转换的文件
  const inputDir = path.join(__dirname, '..', 'icons-to-convert');
  const outputDir = path.join(__dirname, '..', 'frontend', 'app', 'src', 'assets', 'icons');
  
  const svgFiles = fs.readdirSync(inputDir).filter(f => f.endsWith('.svg'));
  const pngFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.png'));
  
  const pending = svgFiles.filter(svg => 
    !pngFiles.includes(svg.replace('.svg', '.png'))
  );
  
  if (pending.length > 0) {
    console.log('🔴 待转换的 SVG 文件：');
    pending.forEach(f => console.log(`   - ${f}`));
  } else {
    console.log('✅ 所有 SVG 已有对应的 PNG 文件');
  }
}

// 主函数
async function main() {
  console.log('🔄 SVG 转 PNG 工具\n');
  
  try {
    require.resolve('sharp');
    await convertSvgToPng();
  } catch (e) {
    console.log('⚠️  sharp 库未安装，显示手动转换方法：');
    await showManualInstructions();
    
    console.log('\n💡 推荐：安装 sharp 后自动转换');
    console.log('   npm install sharp');
    console.log('   node scripts/svg-to-png.js');
  }
}

main();


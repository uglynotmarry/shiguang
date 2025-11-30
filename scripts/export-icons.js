const fs = require('fs')
const path = require('path')
let sharp
try { sharp = require('sharp') } catch (e) {
  console.error('Please install sharp: npm i sharp')
  process.exit(1)
}

const srcDir = path.join(__dirname, '..', 'assets', 'icons', 'cyber-ghibli')
const outDir = srcDir

async function run() {
  const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.svg'))
  for (const f of files) {
    const svg = fs.readFileSync(path.join(srcDir, f))
    const pngName = f.replace(/\.svg$/, '.png')
    await sharp(svg).png({ compressionLevel: 9 }).resize(128, 128).toFile(path.join(outDir, pngName))
    console.log('exported', pngName)
  }
}

run()
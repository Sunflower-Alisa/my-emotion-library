const fs = require('fs')
const path = require('path')

const targetFile = path.join(__dirname, '..', 'node_modules/@dcloudio/uni-app/dist/uni-app.es.js')

if (!fs.existsSync(targetFile)) {
  console.log('⚠️  uni-app.es.js not found, skipping patch')
  process.exit(0)
}

let code = fs.readFileSync(targetFile, 'utf-8')

const importRegex = /import\s*\{([^}]*)\}\s*from\s*'vue'/
const match = code.match(importRegex)

if (!match) {
  console.log('⚠️  Could not find vue import in uni-app.es.js')
  process.exit(0)
}

const imports = match[1].split(',').map(s => s.trim())
if (!imports.includes('isInSSRComponentSetup')) {
  console.log('ℹ️  Already patched (isInSSRComponentSetup not found)')
  process.exit(0)
}

const filtered = imports.filter(s => s !== 'isInSSRComponentSetup')
const newImport = `import { ${filtered.join(', ')} } from 'vue'; const isInSSRComponentSetup = false`

code = code.replace(importRegex, newImport)
fs.writeFileSync(targetFile, code, 'utf-8')
console.log('✅ Patched uni-app.es.js - isInSSRComponentSetup replaced with false')

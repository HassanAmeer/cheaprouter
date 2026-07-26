import { createGenerator } from 'unocss'
import config from '../web_gen/uno.config.ts'
import fs from 'node:fs'
import path from 'node:path'

async function generateCss() {
  const uno = await createGenerator(config)

  // Recursively find all ts and tsx files in web_gen/app
  function getAllFiles(dirPath, arrayOfFiles = []) {
    const files = fs.readdirSync(dirPath)
    files.forEach((file) => {
      const fullPath = path.join(dirPath, file)
      if (fs.statSync(fullPath).isDirectory()) {
        arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
      } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        arrayOfFiles.push(fullPath)
      }
    })
    return arrayOfFiles
  }

  const files = getAllFiles(path.resolve('web_gen/app'))
  let combinedContent = ''
  for (const file of files) {
    combinedContent += fs.readFileSync(file, 'utf-8') + '\n'
  }

  const { css } = await uno.generate(combinedContent)
  const outputPath = path.resolve('src/app/web/uno.css')
  fs.writeFileSync(outputPath, css)
  console.log(`Successfully generated ${css.length} bytes of UnoCSS into ${outputPath}`)
}

generateCss().catch(console.error)

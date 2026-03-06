import { copyFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const env = process.argv[2]

if (!env) {
  console.error('Usage: npm run changeEnv -- <environment>')
  process.exit(1)
}

const src = resolve(__dirname, `../envs/${env}.env`)

if (!existsSync(src)) {
  console.error(`No env file found for "${env}". Expected: envs/${env}.env`)
  process.exit(1)
}

const dest = resolve(__dirname, '../.env')
copyFileSync(src, dest)
console.log(`Switched to "${env}" environment`)

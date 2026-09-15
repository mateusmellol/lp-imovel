import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const distDir = resolve('dist')
const htmlPath = resolve(distDir, 'index.html')
let html = await readFile(htmlPath, 'utf8')

const stylesheetMatch = html.match(/<link rel="stylesheet"[^>]+href="([^"]+)"[^>]*>/)
const scriptMatch = html.match(/<script type="module"[^>]+src="([^"]+)"[^>]*><\/script>/)

if (!stylesheetMatch || !scriptMatch) {
    throw new Error('Não foi possível localizar os arquivos gerados pelo Vite em dist/index.html.')
}

const toDistPath = (href) => resolve(distDir, href.replace(/^\.\//, ''))
let [css, javascript] = await Promise.all([
    readFile(toDistPath(stylesheetMatch[1]), 'utf8'),
    readFile(toDistPath(scriptMatch[1]), 'utf8'),
])

// After inlining, CSS URLs resolve from dist/index.html instead of dist/assets/.
css = css.replaceAll('url(../assets/', 'url(./assets/')
javascript = javascript.replace(/<\/script/gi, '<\\/script')

html = html
    .replace(stylesheetMatch[0], () => `<style>${css}</style>`)
    .replace(scriptMatch[0], () => `<script>${javascript}</script>`)

await writeFile(htmlPath, html, 'utf8')
console.log('dist/index.html pronto para abrir diretamente no navegador.')

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

// Vite can move module scripts into the document head. Modules are deferred,
// but a classic inline script is not, so it would execute before #root exists.
// Remove it first, then place the standalone bundle after the mount element.
html = html.replace(scriptMatch[0], '')

const standaloneScript = `<script>${javascript}</script>`
if (html.includes('<div id="root"></div>')) {
    html = html.replace('<div id="root"></div>', `<div id="root"></div>\n  ${standaloneScript}`)
} else {
    html = html.replace('</body>', `  ${standaloneScript}\n</body>`)
}

await writeFile(htmlPath, html, 'utf8')
console.log('dist/index.html pronto para abrir diretamente no navegador.')

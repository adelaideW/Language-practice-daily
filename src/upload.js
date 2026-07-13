import JSZip from 'jszip'
import { createWorker } from 'tesseract.js'
import * as pdfjs from 'pdfjs-dist'

// Vite-friendly worker for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

/**
 * @param {File} file
 * @returns {Promise<{ title: string, text: string }>}
 */
export async function extractFromFile(file) {
  const name = file.name || '上传文档'
  const title = name.replace(/\.[^.]+$/, '') || '上传文档'
  const ext = (name.split('.').pop() || '').toLowerCase()
  const type = file.type || ''

  if (ext === 'txt' || ext === 'md' || type.startsWith('text/')) {
    return { title, text: await file.text() }
  }

  if (ext === 'pdf' || type === 'application/pdf') {
    return { title, text: await extractPdf(file) }
  }

  if (ext === 'epub' || type === 'application/epub+zip') {
    return { title, text: await extractEpub(file) }
  }

  if (
    ext === 'png' ||
    ext === 'jpg' ||
    ext === 'jpeg' ||
    ext === 'webp' ||
    ext === 'gif' ||
    type.startsWith('image/')
  ) {
    return { title, text: await extractImageOcr(file) }
  }

  // Fallback: try as text
  try {
    const t = await file.text()
    if (t && /[\u4e00-\u9fff]/.test(t)) return { title, text: t }
  } catch {
    /* ignore */
  }
  throw new Error(`暂不支持该格式：.${ext || type || 'unknown'}`)
}

async function extractPdf(file) {
  const buf = await file.arrayBuffer()
  const pdf = await pdfjs.getDocument({ data: buf }).promise
  const parts = []
  const maxPages = Math.min(pdf.numPages, 40)
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const line = content.items.map((it) => ('str' in it ? it.str : '')).join('')
    if (line.trim()) parts.push(line)
  }
  const text = parts.join('\n')
  if (!/[\u4e00-\u9fff]/.test(text)) {
    throw new Error('PDF 中未提取到汉字（扫描版请用图片 OCR 上传）')
  }
  return text
}

async function extractEpub(file) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer())
  const names = Object.keys(zip.files)
    .filter((n) => /\.(xhtml|html|htm|xml)$/i.test(n) && !n.includes('META-INF'))
    .sort()
  const chunks = []
  for (const n of names.slice(0, 60)) {
    const html = await zip.files[n].async('string')
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .trim()
    if (text) chunks.push(text)
  }
  const text = chunks.join('\n')
  if (!/[\u4e00-\u9fff]/.test(text)) throw new Error('EPUB 中未找到汉字')
  return text
}

async function extractImageOcr(file) {
  const worker = await createWorker('chi_sim')
  try {
    const {
      data: { text },
    } = await worker.recognize(file)
    const cleaned = (text || '').replace(/\s+/g, '')
    if (!/[\u4e00-\u9fff]/.test(cleaned)) throw new Error('图片中未识别到汉字')
    return cleaned
  } finally {
    await worker.terminate()
  }
}

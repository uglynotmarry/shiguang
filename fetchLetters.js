const fs = require('fs')
const https = require('https')
const cheerio = require('cheerio')

function fetchPage(p) {
  const url = `https://www.hi2future.com/Mail/showlist2/order/3?page=${p}`
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

function sanitize(text) {
  return text
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '')
    .replace(/\b1[3-9]\d{9}\b/g, '')
    .replace(/\b\d{17}[\dXx]\b/g, '')
    .replace(/QQ\s*\d+/gi, '')
    .replace(/微信[:：]?\s*\w+/gi, '')
    .replace(/地址[:：]?[^\n]{5,}/gi, '')
    .trim()
}

function parse(html) {
  const $ = cheerio.load(html)
  const items = []
  $('tr').each((i, el) => {
    const tds = $(el).find('td')
    if (!tds.length) return
    const text = tds.eq(0).text().trim()
    const meta = tds.eq(1).text().trim()
    if (!text) return
    const mDate = meta.match(/\d{4}-\d{2}-\d{2}[\s\S]*?\d{2}:\d{2}/)
    const mName = meta.match(/发信人[:：]\s*([^\s]+)/)
    const nickname = mName ? mName[1] : '匿名'
    const dateStr = mDate ? mDate[0] : new Date().toISOString()
    items.push({ nickname, content: sanitize(text), date: dateStr })
  })
  return items.filter((x) => x.content && x.content.length > 20)
}

async function run() {
  const results = []
  for (let p = 1; p <= 10 && results.length < 50; p++) {
    try {
      const html = await fetchPage(p)
      const items = parse(html)
      for (const it of items) {
        if (results.length >= 50) break
        results.push(it)
      }
    } catch {}
  }
  const now = Date.now()
  const withIds = results.map((r, i) => ({
    id: `u_${Math.random().toString(36).slice(2, 10)}`,
    nickname: r.nickname,
    content: r.content,
    publishedAt: new Date(now - i * 3600_000).toISOString()
  }))
  fs.writeFileSync('./src/data/letters.json', JSON.stringify(withIds, null, 2))
  console.log('Saved', withIds.length)
}

run()
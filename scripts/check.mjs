import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

const config = JSON.parse(fs.readFileSync('site.config.json'));
const base = new URL(process.env.SITE_URL || config.siteUrl).origin;
const services = JSON.parse(fs.readFileSync('services.json')).filter(item => item.publish);
const featured = services.filter(item => item.featured);
const preview = Boolean(process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== (process.env.PRODUCTION_BRANCH || 'main'));
const all = fs.readdirSync('dist', { recursive: true }).filter(file => file.endsWith('.html') && !/^naver[^/]+\.html$/.test(file));
const attr = (text, key) => text.match(new RegExp(`${key}="([^"]*)"`))?.[1];
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
const local = target => path.join('dist', new URL(target, base).pathname);
const exists = target => fs.existsSync(local(target)) || fs.existsSync(path.join(local(target), 'index.html'));
const unique = { titles: new Set(), descriptions: new Set(), canonicals: new Set() };
const hashes = new Set();
let links = 0;
for (const file of all) {
  const html = fs.readFileSync(path.join('dist', file), 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${file}: H1`);
  const title = html.match(/<title>(.*?)<\/title>/s)[1];
  const description = attr(html.match(/<meta name="description"[^>]*>/)[0], 'content');
  const canonical = attr(html.match(/<link rel="canonical"[^>]*>/)[0], 'href');
  for (const [key, value] of [['titles', title], ['descriptions', description], ['canonicals', canonical]]) {
    assert(!unique[key].has(value), `중복 ${key}: ${file}`);
    unique[key].add(value);
  }
  const route = file === 'index.html' ? '/' : file === '404.html' ? '/404.html' : '/' + file.replace(/index\.html$/, '');
  assert.equal(canonical, new URL(route, base).href);
  assert.equal(attr(html.match(/<meta property="og:url"[^>]*>/)[0], 'content'), canonical);
  assert(exists(attr(html.match(/<meta property="og:image"[^>]*>/)[0], 'content')));
  const graph = JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
  assert(!graph.some(item => ['Review', 'AggregateRating'].includes(item['@type'])));
  const business = graph.find(item => item['@type'] === 'BeautySalon');
  assert.equal(business.telephone, config.phone);
  assert.equal(business.name, config.brand);
  assert(!business.sameAs?.includes(config.stationMapUrl));
  const lists = graph.filter(item => item['@type'] === 'ItemList');
  assert.equal(lists.length, file === 'index.html' ? 1 : 0);
  for (const match of html.matchAll(/(?:href|src)="(\/[^"#]*)/g)) {
    assert(exists(decode(match[1])), `${file} broken ${match[1]}`);
    links++;
  }
  assert(!/example\.(com|invalid)|\{\{[^}]+\}\}|가상 후기 예시/.test(html), `${file}: 미치환/가상 후기 잔존`);
  if (file === 'index.html') {
    const list = lists[0];
    const rail = html.match(/<ul class="carousel"[\s\S]*?<\/ul>/)[0];
    const cards = [...rail.matchAll(/<li class="card">([\s\S]*?)<\/li>/g)];
    assert.equal(list.numberOfItems, featured.length);
    assert.equal(cards.length, list.itemListElement.length);
    for (let index = 0; index < cards.length; index++) {
      const card = cards[index][1], item = list.itemListElement[index];
      assert.equal(item.position, index + 1);
      assert.equal(item.name, featured[index].name);
      assert.equal(new URL(decode(attr(card.match(/<a [^>]*>/)[0], 'href')), base).href, item.url);
      assert.equal(new URL(decode(attr(card.match(/<img [^>]*>/)[0], 'src')), base).href, item.image);
      const heading = card.match(/<h3>([\s\S]*?)<span/)[1].trim();
      assert.equal(decode(heading), item.name);
      const detail = fs.readFileSync(path.join(local(item.url), 'index.html'), 'utf8');
      assert(detail.includes(`src="${new URL(item.image).pathname}"`));
      const digest = crypto.createHash('sha256').update(fs.readFileSync(local(item.image))).digest('hex');
      assert(!hashes.has(digest)); hashes.add(digest);
    }
    assert(/class="controls" hidden/.test(html));
    const brandNav = html.match(/<nav class="brand-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];
    assert.equal((brandNav.match(/<a /g) || []).length, 5);
    for (const route of ['about','services','gallery','guide','contact']) assert(brandNav.includes(`href="/${route}/"`));

  }
}
const robots = fs.readFileSync('dist/robots.txt', 'utf8');
assert(robots.includes(preview ? 'Disallow: /' : 'Allow: /'));
const sitemap = fs.readFileSync('dist/sitemap.xml', 'utf8');
assert.equal((sitemap.match(/<loc>/g) || []).length, preview ? 0 : all.length - 1);
assert(!sitemap.includes('404.html'));
const rss = fs.readFileSync('dist/rss.xml', 'utf8');
assert(!rss.includes('/privacy/'));
assert.equal(rss.includes('<item>'), !preview);
assert(fs.existsSync('dist/404.html'));
console.log(`PASS: ${all.length} HTML files; ${links} local links; ${featured.length} exact DOM/JSON-LD carousel matches; unique metadata; stable RSS dates; ${preview ? 'preview noindex' : 'production indexable'}.`);

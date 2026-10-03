import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateInput } from './validate-input.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
console.log('ONGYEOL BUILD v1.3.0 — starting');
for (const required of ['site.config.json', 'services.json', 'pages.json', 'assets']) {
  if (!fs.existsSync(required)) throw new Error(`필수 파일 누락: ${required}. ZIP 전체 내용을 저장소 루트에 업로드하세요.`);
}
const config = JSON.parse(fs.readFileSync('site.config.json', 'utf8'));
const serviceData = JSON.parse(fs.readFileSync('services.json', 'utf8'));
const pageMetadata = JSON.parse(fs.readFileSync('pages.json', 'utf8'));
const configured = process.env.SITE_URL || config.siteUrl;
validateInput(config, serviceData, pageMetadata, configured);
const base = new URL(configured).origin;
const preview = Boolean(process.env.CF_PAGES_BRANCH && process.env.CF_PAGES_BRANCH !== (process.env.PRODUCTION_BRANCH || 'main'));
const services = serviceData.filter(item => item.publish);
const featured = services.filter(item => item.featured);
const out = path.join(root, 'dist');
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
fs.cpSync('assets', path.join(out, 'assets'), { recursive: true });
// Ownership verification files are optional; an empty public directory may be absent in Git.
if (fs.existsSync('public')) {
  fs.cpSync('public', out, {
    recursive: true,
    filter: source => !path.basename(source).startsWith('.')
  });
}
const esc = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const url = relative => new URL(relative, base + '/').href;
const tel = 'tel:' + config.phone.replace(/[^0-9+]/g, '');
const map = esc(config.stationMapUrl);
const img = (service = featured[0]) => `/assets/images/${service.slug}.webp`;
const servicePath = service => `/services/${service.slug}/`;
const business={'@type':'BeautySalon','@id':url('/#business'),name:config.brand,alternateName:config.brandEnglish,url:url('/'),telephone:config.phone,description:'수원눈썹문신 디자인과 상담 안내. ' + services.map(item => item.name).join(', '),image:services.map(s=>url(img(s))),logo:url('/assets/logo.svg')};
if(config.address)business.address={'@type':'PostalAddress',streetAddress:config.address,addressCountry:'KR'};
if(config.openingHoursSpecification.length) business.openingHoursSpecification = config.openingHoursSpecification;
else if(config.openingHours) business.openingHours = config.openingHours;
if(config.naverPlaceUrl)business.sameAs=[config.naverPlaceUrl];
const website={'@type':'WebSite','@id':url('/#website'),url:url('/'),name:config.brand,publisher:{'@id':business['@id']},inLanguage:'ko-KR'};
function header(){return `<a class="skip" href="#main">본문 바로가기</a>
<header class="header">
<div class="wrap">
<a class="logo" href="/" aria-label="${esc(config.brand)} 홈">${esc(config.brandWordmark)}<small>${esc(config.brandTagline)}</small>
</a>
<nav class="desktop-nav" aria-label="주 메뉴">
<a href="/about/">온결의 기준</a>
<a href="/services/">눈썹 디자인</a>
<a href="/guide/">이용 가이드</a>
<a href="/contact/">상담·위치 안내 ↗</a>
</nav>
<button class="menu-btn" hidden aria-expanded="false" aria-controls="mobile-nav">메뉴</button>
</div>
<nav class="mobile-nav" id="mobile-nav" aria-label="모바일 메뉴">
<a href="/about/">온결의 기준</a>
<a href="/services/">눈썹 디자인</a>
<a href="/guide/">이용 가이드</a>
<a href="/contact/">상담·위치 안내</a>
</nav>
</header>`;}
function footer(){return `<footer class="footer">
<div class="wrap">
<div>
<div class="logo">${esc(config.brandWordmark)}</div>
<p>${esc(config.brand)} · 수원눈썹문신 디자인 상담<br>전화 <a href="${tel}">${esc(config.phone)}</a> · 위치 안내 기준: 수원역</p>
<p>© 2026 ONGYEOL BROW. All rights reserved.</p>
</div>
<div>
<div class="footer-links">
<a href="/about/">브랜드 소개</a>
<a href="/contact/">상담 안내</a>
<a href="/privacy/">개인정보 안내</a>
</div>
<p>이미지는 AI로 제작한 디자인 참고용이며 실제 고객 사례가 아닙니다.</p>
</div>
</div>
</footer>
<div class="bottom-bar">
<a class="map" href="${map}" target="_blank" rel="noopener">수원역 지도 ↗</a>
<a class="call" href="${tel}">전화 상담 · ${esc(config.phone)}</a>
</div>
<script src="/assets/main.js" defer>
</script>`;}
function contact(){return `<section class="contact">
<div class="wrap split">
<div>
<p class="eyebrow">LET’S FIND YOUR BROW</p>
<h2>내 눈썹에 대한 작은 질문부터.<br>온결과 이야기해 보세요.</h2>
<a class="phone" href="${tel}">${esc(config.phone)}</a>
</div>
<div>
<p>원하는 디자인과 현재 눈썹 상태를 알려주세요.<br>상담 일정·비용·리터치 조건은 전화로 안내받으실 수 있습니다.</p>
<div class="actions">
<a class="btn" href="${tel}">전화 상담하기 ↗</a>
<a class="btn light" href="/contact/">위치 안내 보기 →</a>
</div>
</div>
</div>
</section>`;}
const pages=[];
function page(route,title,description,content,{extra=[],image=img(featured[0]),index=true}={}){const service = services.find(item => servicePath(item) === route);
const topicKeywords = service ? ['수원'+service.name, '수원역 '+service.name, service.name+' 디자인'] : ({'/':['수원자연눈썹','수원콤보눈썹','수원남자눈썹문신','수원파우더눈썹'], '/services/':['수원자연눈썹','수원콤보눈썹','수원남자눈썹문신','눈썹 디자인 비교'], '/guide/':['눈썹문신 상담 준비','눈썹문신 관리 안내'], '/contact/':['수원역 눈썹 상담','온결브로우 문의'], '/about/':['온결브로우 소개','눈썹 디자인 상담'], '/privacy/':['온결브로우 개인정보 안내']})[route] || [];
const keywords = [...new Set(['수원눈썹문신','수원역눈썹문신',config.brand,...topicKeywords])].join(', ');
const shareImageAlt = services.find(item => img(item) === image)?.imageAlt || '온결브로우 AI 눈썹 디자인 참고 이미지';
const dates = service || pageMetadata[route] || { publishedAt: config.lastUpdated, updatedAt: config.lastUpdated };
const crumbs = route === '/' || !index ? [] : [
  { '@type': 'ListItem', position: 1, name: '홈', item: url('/') },
  ...(service ? [{ '@type': 'ListItem', position: 2, name: '눈썹 디자인', item: url('/services/') }] : []),
  { '@type': 'ListItem', position: service ? 3 : 2, name: service?.name || (route === '/services/' ? '눈썹 디자인' : title.split(' | ')[0]), item: url(route) }
];
const graph=[business,website,{'@type':'WebPage','@id':url(route+'#webpage'),url:url(route),name:title,description,isPartOf:{'@id':website['@id']},about:{'@id':business['@id']},inLanguage:'ko-KR',datePublished:dates.publishedAt,dateModified:dates.updatedAt},...(crumbs.length ? [{'@type':'BreadcrumbList','@id':url(route+'#breadcrumb'),itemListElement:crumbs}] : []),...extra];const verify=process.env.NAVER_SITE_VERIFICATION||config.naverVerification;const html=`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="keywords" content="${esc(keywords)}">
<meta name="author" content="${esc(config.brand)}">
<meta name="robots" content="${preview||!index?'noindex,follow':'index,follow,max-image-preview:large,max-snippet:-1'}">
<link rel="canonical" href="${url(route)}">
<meta property="og:type" content="website">
<meta property="og:locale" content="ko_KR">
<meta property="og:site_name" content="${esc(config.brand)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url(route)}">
<meta property="og:image" content="${url(image)}">
<meta property="og:image:width" content="1254">
<meta property="og:image:height" content="1254">
<meta property="og:image:alt" content="${esc(shareImageAlt)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${url(image)}">
<meta name="twitter:image:alt" content="${esc(shareImageAlt)}">
<meta name="theme-color" content="#502631">${verify?`<meta name="naver-site-verification" content="${esc(verify)}">`:''}<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="alternate" type="application/rss+xml" title="온결브로우 안내" href="/rss.xml">
<link rel="stylesheet" href="/assets/style.css">
<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph},null,2).replace(/</g,'\\u003c')}</script>
</head>
<body><div class="site-shell">${header()}<main id="main">${content}</main>${footer()}</div></body>
</html>`;const file=route==='/404.html'?path.join(out,'404.html'):path.join(out,route,'index.html');fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,html);if(index)pages.push({route,title,description,image,...dates});}
const faq=items=>items.map(([q,a])=>`<details>
<summary>${esc(q)}</summary>
<p>${esc(a)}</p>
</details>`).join('');
const cards=featured.map((s,i)=>`<li class="card">
<a href="${servicePath(s)}">
<figure>
<img src="${img(s)}" width="1024" height="1024" loading="lazy" alt="${esc(s.imageAlt)}" style="object-position:${esc(s.imagePosition)}">
<span class="number">0${i+1}</span>
</figure>
<h3>${esc(s.name)}<span aria-hidden="true">↗</span>
</h3>
<small>${esc(s.en)}</small>
<p>${esc(s.tag)}</p>
</a>
</li>`).join('');
function comparison() {
  return `<div class="comparison-list">${services.map(service => `
    <article class="comparison-row">
      <div>
<h3>
<a href="${servicePath(service)}">${esc(service.name)} ↗</a>
</h3>
<p>${esc(service.description)}</p>
</div>
      <div>
<span class="note">상담 시 비용 확인</span>
<p>디자인 범위 · 기존 잔흔 · 리터치 포함 조건</p>
</div>
    </article>`).join('')}</div>`;
}
const generalFaq=[['어떤 눈썹 디자인을 골라야 할지 모르겠어요.','평소 눈썹 화장 정도, 선호하는 진하기, 비어 보이는 부위를 기준으로 비교해 보세요. 자연눈썹·콤보·파우더는 표현 방식이 다르고, 최종 적합성은 현재 상태를 확인한 뒤 상담합니다.'],['가격과 리터치 조건은 어디서 확인하나요?','원하는 디자인, 기존 잔흔 유무, 리터치 범위에 따라 상담 내용이 달라질 수 있습니다. 전화로 총 비용과 포함 항목, 추가 비용, 예약 변경 조건을 함께 확인해 주세요.'],['유지기간을 미리 알 수 있나요?','피부 상태, 기존 색, 생활 습관 등에 따라 차이가 있어 일률적인 기간을 약속하지 않습니다. 상담 시 원하는 디자인의 특성과 관리 안내를 확인해 주세요.'],['사진은 실제 고객의 시술 결과인가요?','사이트의 이미지는 AI로 제작한 디자인 참고 이미지입니다. 실제 고객의 전후 사진이나 시술 결과를 의미하지 않습니다.'],['수원역으로 바로 방문하면 되나요?','현재 지도는 위치 설명을 위한 수원역 기준 지도입니다. 실제 방문 주소와 상담 가능 시간을 전화로 확인한 뒤 방문해 주세요.']];
page('/',`수원눈썹문신 | ${config.brand} · 자연스러운 눈썹 디자인`,`수원눈썹문신 ${config.brand}. ${services.map(item => item.name).join('·')} 상담을 비교하고 이용 안내를 확인하세요. 문의 ${config.phone}.`,`<div class="wrap hero">
<div class="hero-copy">
<p class="eyebrow">ONGYEOL · BROW DESIGN</p>
<h1>
<span>수원눈썹문신 · 온결브로우</span>당신의 인상에,<br>자연스러운 <em class="serif">결.</em>
</h1>
<p>유행하는 모양보다, 나에게 어울리는 균형.<br>눈썹의 결과 얼굴의 흐름에서<br>당신다운 디자인을 찾아갑니다.</p>
<div class="actions">
<a class="btn" href="#services">눈썹 디자인 살펴보기 ↓</a>
<a class="btn light" href="${tel}">상담 문의 ↗</a>
</div>
</div>
<div class="hero-visual">
<img src="${img(services[0])}" width="1024" height="1024" fetchpriority="high" alt="섬세한 자연눈썹 결을 보여주는 디자인 참고 이미지">
<span class="hero-label">YOUR<br>NATURAL<br>BALANCE</span>
<span class="image-note">DESIGN INSPIRATION · AI 디자인 참고 이미지</span>
</div>
</div>
<div class="ribbon">
<div class="wrap">
<span>NATURAL TEXTURE</span>
<span>PERSONAL BALANCE</span>
<span>SUWON · ONGYEOL</span>
</div>
</div>
<section class="section" id="services">
<div class="wrap">
<div class="section-head">
<div>
<p class="eyebrow">01 / BROW COLLECTION</p>
<h2>같은 눈썹은 없으니까.</h2>
<p>지금의 눈썹과 원하는 인상에 맞춰 비교해 보세요.</p>
</div>
<p>옆으로 넘겨 ${featured.length}가지 디자인 보기 →</p>
</div>
<ul class="carousel" tabindex="0" aria-label="눈썹 디자인 목록, 좌우 방향키로 이동">${cards}</ul>
<div class="controls" hidden>
<button data-dir="-1" aria-label="이전 디자인">←</button>
<button data-dir="1" aria-label="다음 디자인">→</button>
</div>
<p class="note">각 이미지는 디자인 이해를 위한 AI 참고 이미지입니다. 카드를 누르면 자세한 상담 안내로 이동합니다.</p>
</div>
</section>
<section class="section price-summary">
<div class="wrap">
<p class="eyebrow">DESIGN & CONSULTATION</p>
<h2>디자인의 차이와 비용 확인 기준</h2>${comparison()}<div class="actions">
<a class="btn light" href="/services/">전체 서비스 비교하기 →</a>
</div>
</div>
</section>
<section class="section contrast">
<div class="wrap split">
<img src="${img(services.find(item => item.slug === 'powder') || featured[0])}" width="1024" height="1024" loading="lazy" alt="부드러운 음영과 눈썹 균형 디자인 참고">
<div>
<p class="eyebrow">02 / OUR PHILOSOPHY</p>
<div class="editorial">Less defined.<br>More like you.</div>
<h2>눈썹만 보지 않고,<br>전체의 인상을 봅니다.</h2>
<p>앞머리의 시작, 눈썹산의 높이, 꼬리의 길이.<br>작은 차이들이 모여 하나의 인상을 만듭니다.</p>
<p>온결은 정해진 모양을 먼저 고르기보다 현재 눈썹의 흐름과 평소 화장 습관을 살펴보는 디자인을 지향합니다.</p>
<a class="btn light" href="/about/">온결의 기준 알아보기 →</a>
</div>
</div>
</section>
<section class="section">
<div class="wrap">
<p class="eyebrow">03 / CONSULTATION GUIDE</p>
<h2>선택은 천천히,<br>확인은 꼼꼼하게.</h2>
<div class="steps">
<div class="step">
<b>01</b>
<h3>현재 상태 이야기하기</h3>
<p>기존 눈썹, 잔흔 유무, 평소 고민을 정리해 주세요.</p>
</div>
<div class="step">
<b>02</b>
<h3>원하는 인상 비교하기</h3>
<p>결·음영·진하기의 차이를 살펴 디자인 방향을 상담합니다.</p>
</div>
<div class="step">
<b>03</b>
<h3>조건 확인 후 예약하기</h3>
<p>비용과 포함 범위, 일정과 방문 주소를 확인해 주세요.</p>
</div>
</div>
<div class="actions">
<a href="/guide/" class="btn light">상담 전 가이드 읽기 →</a>
</div>
</div>
</section>
<section class="section contrast" id="consultation-questions">
<div class="wrap">
<div class="section-head">
<div>
<p class="eyebrow">04 / BEFORE YOU DECIDE</p>
<h2>상담에서 꼭 나눌 이야기</h2>
<p>내가 원하는 인상을 구체적으로 설명해 보세요.</p>
</div>
</div>
<div class="reviews">
<article class="review">
<small>NATURAL BALANCE</small>
<h3>결을 살릴까요, 음영을 더할까요?</h3>
<p>평소 눈썹을 그리는 방법과 선호하는 진하기를 함께 알려주면 디자인 비교가 쉬워집니다.</p>
</article>
<article class="review">
<small>PERSONAL DESIGN</small>
<h3>어느 부분이 가장 신경 쓰이나요?</h3>
<p>앞머리 간격, 눈썹산의 높이, 옅은 꼬리처럼 고민 부위를 나누어 살펴보세요.</p>
</article>
<article class="review">
<small>RETOUCH CHECK</small>
<h3>이전 진행 이력이 있나요?</h3>
<p>남아 있는 색과 모양, 이전 진행 시점을 정리해 상담 전에 전달해 주세요.</p>
</article>
</div>
</div>
</section>
<section class="section">
<div class="wrap">
<p class="eyebrow">05 / QUESTIONS</p>
<h2>궁금한 점을 모았습니다.</h2>${faq(generalFaq)}</div>
</section>${contact()}`,{extra:[{'@type':'ItemList','@id':url('/#brow-collection'),name:'온결브로우 눈썹 디자인',numberOfItems:featured.length,itemListElement:featured.map((s,i)=>({'@type':'ListItem',position:i+1,name:s.name,image:url(img(s)),url:url(servicePath(s))}))}]});
page('/services/', `수원눈썹문신 디자인 비교·비용 상담 | ${config.brand}`, '자연눈썹·콤보눈썹·남자눈썹·파우더눈썹·리터치 상담의 차이와 비용 확인 항목을 한눈에 비교하는 온결브로우 서비스 안내.', `
  <div class="wrap">
<nav class="breadcrumb" aria-label="현재 위치">
<a href="/">홈</a> / 눈썹 디자인</nav>
  <section class="section service-hub">
<p class="eyebrow">BROW DESIGN GUIDE</p>
<h1>나에게 맞는 눈썹 디자인 찾기</h1>
<p>표현 방식과 현재 눈썹 상태를 기준으로 비교해 보세요.</p>
  <div class="service-grid">${services.map(service => `<article class="card">
<a href="${servicePath(service)}">
<img src="${img(service)}" alt="${esc(service.imageAlt)}" width="1254" height="1254" loading="lazy">
<h2>${esc(service.name)}</h2>
<p>${esc(service.description)}</p>
</a>
</article>`).join('')}</div>
  <h2>디자인·비용 상담 기준</h2>${comparison()}
  <p class="note">총 비용과 추가 비용, 리터치의 횟수·기간·포함 여부를 예약 전에 확인해 주세요.</p>
</section>
</div>${contact()}`);
for(const s of services){page(servicePath(s),`수원 ${s.name} 디자인·상담 안내 | ${config.brand}`,s.description,`<div class="wrap">
<nav class="breadcrumb" aria-label="현재 위치">
<a href="/">홈</a> / <a href="/services/">눈썹 디자인</a> / ${esc(s.name)}</nav>
<div class="detail-hero">
<div>
<p class="eyebrow">${esc(s.en)}</p>
<h1>${esc(s.name)}</h1>
<p>${esc(s.intro)}</p>
<p>${esc(s.description)}</p>
<div class="actions">
<a class="btn" href="${tel}">이 디자인 상담하기 ↗</a>
<a class="btn light" href="/services/">전체 디자인 보기</a>
</div>
</div>
<figure>
<img src="${img(s)}" width="1024" height="1024" fetchpriority="high" alt="${esc(s.imageAlt)}" style="object-position:${esc(s.imagePosition)}">
<figcaption>AI로 제작한 디자인 참고 이미지 · 실제 고객 사례 아님</figcaption>
</figure>
</div>
<article class="article">
<section>
<p class="eyebrow">DESIGN NOTE</p>
<h2>${esc(s.tag)}</h2>
<p>${esc(s.body)}</p>
</section>
<section>
<h2>이런 질문부터 시작해 보세요.</h2>
<ul>${s.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
</section>
<section>
<h2>상담에서 함께 확인할 점</h2>
<p>${esc(s.consider)}</p>
<p>현재 눈썹 상태 확인 → 원하는 표현 비교 → 비용·포함 범위 확인 → 일정과 방문 안내 순서로 상담 내용을 정리해 보세요.</p>
</section>
<section>
<h2>비용·일정·리터치 안내</h2>
<p>구체적인 비용과 소요 시간, 리터치 포함 여부는 전화 상담으로 확인해 주세요. 기존 이력과 원하는 범위에 따라 확인할 내용이 달라질 수 있습니다. 정해진 유지기간이나 동일한 결과를 보장하지 않습니다.</p>
<a class="btn light" href="/guide/">예약 전 확인사항 →</a>
</section>
<section>
<h2>${esc(s.name)} 자주 묻는 질문</h2>${faq(s.faq)}</section>
<section>
<h2>다른 디자인과 비교하기</h2>
<div class="related">${services.filter(x=>x.slug!==s.slug).map(x=>`<a href="${servicePath(x)}">${esc(x.name)} ↗</a>`).join('')}</div>
</section>
</article>
</div>${contact()}`,{image:img(s),extra:[{'@type':'Service','@id':url(servicePath(s)+'#service'),name:s.name,description:s.description,url:url(servicePath(s)),image:url(img(s)),provider:{'@id':business['@id']}}]});}
function articlePage(route,title,desc,body){page(route,`${title} | 온결브로우`,desc,`<div class="wrap">
<nav class="breadcrumb" aria-label="현재 위치">
<a href="/">홈</a> / ${title}</nav>
<article class="article">
<p class="eyebrow">ONGYEOL BROW STUDIO</p>
<h1>${title}</h1>${body}</article>
</div>${contact()}`);}
articlePage('/about/','온결의 디자인 기준','온결브로우가 지향하는 자연스러운 눈썹 디자인. 결·음영·얼굴 비율·생활 습관을 함께 살펴보는 상담 기준을 소개합니다.',`<section>
<div class="editorial">Your brow, your balance.</div>
<h2>온전한 나의 인상, 자연스러운 결.</h2>
<p>온결브로우는 수원눈썹문신 디자인을 알아보는 분들이 눈썹의 결과 음영을 비교하고 자신에게 맞는 질문을 찾을 수 있도록 안내합니다. 이름에 담은 ‘온결’은 전체의 균형과 작은 결을 함께 살피자는 뜻입니다.</p>
</section>
<section>
<h2>모양보다 먼저 살펴볼 것</h2>
<p>같은 디자인도 눈썹뼈, 눈매, 기존 눈썹의 방향에 따라 다르게 느껴질 수 있습니다. 정면의 모습뿐 아니라 평소 표정과 화장 습관까지 고려하는 상담을 지향합니다.</p>
</section>
<section>
<h2>분명하게 확인하는 선택</h2>
<p>디자인 이름만으로 결과가 정해지는 것은 아닙니다. 현재 상태에 맞는 범위와 한계, 비용과 포함 조건을 확인한 뒤 결정할 수 있도록 필요한 질문을 안내합니다.</p>
</section>
<section>
<h2>이미지와 후기 안내</h2>
<p>이 사이트의 이미지는 AI 디자인 참고 이미지입니다. 실제 고객의 전후 결과나 이용 후기를 의미하지 않습니다.</p>
</section>`);
articlePage('/guide/','눈썹 상담·예약 가이드','수원눈썹문신 상담 전 준비할 정보, 가격·리터치 조건과 일정 확인, 디자인 비교 질문을 정리한 온결브로우 이용 가이드.',`<section>
<h2>전화 상담 전 준비해 주세요.</h2>
<ul>
<li>관심 있는 디자인과 원하는 진하기</li>
<li>이전 진행 이력과 현재 남아 있는 색의 범위</li>
<li>상담을 원하는 날짜와 방문 가능 시간</li>
<li>총 비용·추가 비용·리터치 포함 범위에 관한 질문</li>
</ul>
</section>
<section>
<h2>예약 전에 확인할 네 가지</h2>
<p>상담 가능 일정, 실제 방문 주소, 비용과 제공 범위, 변경·취소 조건을 먼저 확인해 주세요. 중요한 일정이 있다면 해당 날짜를 상담 시 함께 알려주세요.</p>
</section>
<section>
<h2>진행 후 관리 안내는 개별 확인</h2>
<p>관리 방법과 경과는 피부 상태 및 진행 내용에 따라 다릅니다. 담당자가 제공하는 관리 안내와 연락 방법을 확인하고, 임의의 관리법보다 본인의 상태에 맞는 안내를 따르세요.</p>
</section>
<section>
<h2>자주 묻는 질문</h2>${faq(generalFaq)}</section>`);
articlePage('/contact/','상담·위치 안내',`${config.brand} 상담 전화 ${config.phone}. 수원역 기준 위치 안내와 네이버 수원역 지도 연결. 실제 방문 주소와 상담 시간은 전화로 확인하세요.`,`<section>
<h2>상담은 전화로 연결됩니다.</h2>
<dl class="fact-list">
<dt>브랜드</dt>
<dd>${esc(config.brand)}</dd>
<dt>문의 전화</dt>
<dd>
<a href="${tel}">${esc(config.phone)}</a>
</dd>
<dt>위치 기준</dt>
<dd>수원역</dd>
<dt>방문 주소</dt>
<dd>${config.address?esc(config.address):'방문 전 전화로 상세 주소를 확인해 주세요.'}</dd>
<dt>상담 시간</dt>
<dd>${config.openingHours?esc(config.openingHours):'가능한 일정을 전화로 문의해 주세요.'}</dd>
<dt>주차 안내</dt>
<dd>방문 방법과 주차 가능 여부를 전화로 확인해 주세요.</dd>
</dl>
<div class="actions">
<a class="btn" href="${tel}">전화 상담하기 ↗</a>
<a class="btn light" href="${map}" target="_blank" rel="noopener">네이버 수원역 지도 ↗</a>${config.naverPlaceUrl?`<a class="btn light" href="${esc(config.naverPlaceUrl)}" target="_blank" rel="noopener">매장 네이버 플레이스 ↗</a>`:''}</div>
</section>
<section>
<h2>수원역 기준 위치 안내</h2>
<p>위 지도 버튼은 네이버 지도의 수원역 장소 검색으로 연결됩니다. 매장의 공식 플레이스나 매장 주소를 뜻하지 않습니다. 실제 방문 장소를 확인한 뒤 이동해 주세요.</p>
</section>
<section>
<h2>예약을 확정하기 전에</h2>
<p>전화 문의만으로 예약이 자동 확정되지는 않습니다. 상담 일정과 비용, 예약 변경 조건을 안내받고 확정 여부를 확인해 주세요.</p>
</section>`);
articlePage('/privacy/','개인정보 안내','온결브로우 홈페이지의 전화 연결, 외부 지도 링크와 개인정보 입력 관련 안내.',`<section>
<h2>웹사이트 이용 안내</h2>
<p>이 홈페이지에는 회원가입, 예약 입력 폼, 결제 기능이 없습니다. 사이트 자체에서 이름이나 연락처를 입력받는 기능을 운영하지 않습니다.</p>
<p>전화 버튼은 기기의 전화 기능으로 연결됩니다. 네이버 지도 버튼을 누르면 외부 서비스로 이동하며 해당 서비스의 개인정보 처리방침이 적용됩니다.</p>
</section>
<section>
<h2>접속 정보</h2>
<p>호스팅 서비스는 서비스 제공과 보안 운영을 위해 접속 기록을 처리할 수 있습니다. 별도의 광고 추적 코드나 분석 쿠키는 본 사이트에 설치되어 있지 않습니다.</p>
</section>
<section>
<h2>문의</h2>
<p>사이트 이용 관련 문의: <a href="${tel}">${esc(config.phone)}</a>
</p>
</section>`);
page('/404.html','페이지를 찾을 수 없습니다 | 온결브로우','요청한 페이지를 찾을 수 없습니다.',`<div class="wrap article">
<p class="eyebrow">404</p>
<h1>페이지를 찾을 수 없습니다.</h1>
<p>주소를 확인하거나 아래에서 디자인을 다시 살펴보세요.</p>
<a class="btn" href="/">홈으로 돌아가기 →</a>
</div>`,{index:false});
fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${(preview ? [] : pages).map(p=>`<url>
<loc>${esc(url(p.route))}</loc>
<lastmod>${p.updatedAt}</lastmod>
</url>`).join('')}</urlset>`);
fs.writeFileSync(path.join(out,'rss.xml'),`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${esc(config.brand)} 디자인·이용 안내</title>
<link>${base}/</link>
<description>수원눈썹문신 디자인과 상담 안내</description>
<language>ko</language>
<atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>${pages.filter(p=>!preview && p.rss).sort((a,b)=>b.publishedAt.localeCompare(a.publishedAt)).map(p=>`<item>
<title>${esc(p.title)}</title>
<link>${esc(url(p.route))}</link>
<guid isPermaLink="true">${esc(url(p.route))}</guid>
<description>${esc(p.description)}</description>
<pubDate>${new Date(p.publishedAt+'T00:00:00+09:00').toUTCString()}</pubDate>
</item>`).join('')}</channel>
</rss>`);
fs.writeFileSync(path.join(out,'robots.txt'),preview?'User-agent: *\nDisallow: /\n':`User-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
fs.writeFileSync(path.join(out,'_headers'),`/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  X-Frame-Options: SAMEORIGIN\n/assets/*\n  Cache-Control: public, max-age=86400\n${preview?'/*\n  X-Robots-Tag: noindex\n':''}`);
fs.writeFileSync('submission-urls.txt',pages.map(p=>url(p.route)).join('\n')+'\n\n'+base+'/sitemap.xml\n'+base+'/rss.xml\n'+base+'/robots.txt\n');
console.log(`Built ${pages.length} pages + 404. Origin: ${base}. Mode: ${preview?'preview (noindex)':'production (indexable)'}`);
if(!configured)console.log('Set SITE_URL in Cloudflare production environment to your final canonical origin.');
if(!config.naverVerification&&!process.env.NAVER_SITE_VERIFICATION)console.log('Naver ownership verification must be added before submission.');

const mapping = featured.map((service, index) => ({
  position: index + 1,
  name: service.name,
  url: url(servicePath(service)),
  image: url(img(service)),
  status: '로컬 카드·JSON-LD 일치 / 배포 응답 미검증'
}));
fs.writeFileSync('carousel-mapping.json', JSON.stringify(mapping, null, 2) + '\n');
fs.writeFileSync('carousel-mapping.md', '# 캐러셀 매핑표\n\n|순서|카드명|상세 URL|대표 이미지|검수|\n|---|---|---|---|---|\n' + mapping.map(row => `|${row.position}|${row.name}|${row.url}|${row.image}|${row.status}|`).join('\n') + '\n');

// Keep visible, deployment-ready crawler files in public as well as dist.
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
for (const name of ['robots.txt', 'sitemap.xml', 'rss.xml']) {
  fs.copyFileSync(path.join(out, name), path.join(root, 'public', name));
}
console.log('ONGYEOL BUILD v1.3.0 — complete; deploy directory: dist');

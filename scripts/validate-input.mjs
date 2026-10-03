import fs from 'node:fs';
import crypto from 'node:crypto';

const assert = (condition, message) => { if (!condition) throw new Error(message); };
const validDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value) && new Date(value).toISOString().slice(0, 10) === value;
const placeholders = /example\.(?:com|org|net|invalid)|\{\{[^}]*\}\}/i;

export function validateInput(config, services, pages, base) {
  assert(typeof base === 'string' && base, '대표 SITE_URL을 설정하세요.');
  const origin = new URL(base);
  assert(origin.protocol === 'https:' && origin.pathname === '/' && !origin.search && !origin.hash && !origin.username && !origin.password, 'SITE_URL은 경로·쿼리·인증정보 없는 HTTPS 대표 호스트여야 합니다.');
  assert(!placeholders.test(base), '예시 도메인으로 배포할 수 없습니다.');
  assert(config.brand && config.brandEnglish && config.brandWordmark && config.brandTagline, '브랜드 필수 정보를 입력하세요.');
  assert(/^[+\d][\d\s()-]{7,20}$/.test(config.phone), '전화번호 형식을 확인하세요.');
  assert(validDate(config.lastUpdated), 'lastUpdated 날짜를 확인하세요.');
  for (const key of ['stationMapUrl', 'naverPlaceUrl']) {
    if (!config[key]) continue;
    const parsed = new URL(config[key]);
    assert(parsed.protocol === 'https:' && !parsed.username && !parsed.password, `${key}: 안전한 HTTPS 링크가 필요합니다.`);
  }
  assert(Array.isArray(config.openingHoursSpecification), 'openingHoursSpecification은 배열이어야 합니다.');
  const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  for (const hours of config.openingHoursSpecification) {
    assert(hours['@type'] === 'OpeningHoursSpecification', '운영시간 타입을 확인하세요.');
    const supplied = Array.isArray(hours.dayOfWeek) ? hours.dayOfWeek : [hours.dayOfWeek];
    assert(supplied.every(day => days.includes(day.replace('https://schema.org/', ''))), '영업일 값을 확인하세요.');
    assert([hours.opens, hours.closes].every(time => /^([01]\d|2[0-3]):[0-5]\d$/.test(time)), '영업시간은 HH:MM 형식이어야 합니다.');
  }
  assert(!placeholders.test(JSON.stringify([config, services, pages])), '미치환 변수 또는 예시 도메인이 남아 있습니다.');
  const keys = new Set(), hashes = new Set();
  for (const service of services) {
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(service.slug), '서비스 slug에는 영문 소문자·숫자·하이픈만 사용하세요.');
    assert(!keys.has(service.slug), `중복 서비스 URL: ${service.slug}`);
    keys.add(service.slug);
    assert(typeof service.publish === 'boolean' && typeof service.featured === 'boolean', 'publish/featured는 불리언 값이어야 합니다.');
    if (!service.publish) continue;
    for (const key of ['name','en','intro','description','tag','body','consider','imageAlt']) assert(typeof service[key] === 'string' && service[key].trim(), `${service.slug}: ${key} 누락`);
    assert(/^(left|center|right|\d{1,3}%) (top|center|bottom|\d{1,3}%)$/.test(service.imagePosition), 'imagePosition 값이 잘못되었습니다.');
    assert(Array.isArray(service.points) && service.points.length && service.points.every(point => typeof point === 'string'), '상담 대상 목록 누락');
    assert(Array.isArray(service.faq) && service.faq.length && service.faq.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(value => typeof value === 'string' && value)), '서비스 FAQ 형식을 확인하세요.');
    assert(validDate(service.publishedAt) && validDate(service.updatedAt) && service.updatedAt >= service.publishedAt, '서비스 게시/수정 날짜를 확인하세요.');
    const file = `assets/images/${service.slug}.webp`;
    assert(fs.existsSync(file), `이미지 누락: ${file}`);
    const bytes = fs.readFileSync(file);
    assert(bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP', `올바른 WebP가 아닙니다: ${file}`);
    if (service.featured) {
      const digest = crypto.createHash('sha256').update(bytes).digest('hex');
      assert(!hashes.has(digest), `대표 캐러셀에 중복 이미지 바이트: ${file}`);
      hashes.add(digest);
    }
  }
  assert(services.some(item => item.publish && item.featured), '대표 서비스 목록이 비어 있습니다.');
  for (const page of Object.values(pages)) assert(validDate(page.publishedAt) && validDate(page.updatedAt) && page.updatedAt >= page.publishedAt, '페이지 게시/수정 날짜를 확인하세요.');
}

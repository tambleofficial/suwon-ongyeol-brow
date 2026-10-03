# 온결브로우 | 수원눈썹문신 홈페이지

모바일 우선 정적 HTML 사이트입니다. GitHub → Cloudflare Pages 배포에 맞춰 구성했습니다.

- 예정 운영 주소: https://suwon-ongyeol-brow.pages.dev
- Cloudflare Pages 프로젝트 이름: suwon-ongyeol-brow (생성 시 사용 가능 여부 확인)
- 업체명: 온결브로우 (요청에 따라 정한 임의 브랜드)
- 문의: 010-8421-1319
- 위치 기준: 수원역. 매장 실제 주소와 구분합니다.
- 네이버 지도: 수원역 장소 검색. 업체 공식 플레이스와 구분합니다.

## 1. GitHub–Cloudflare 배포

1. 새 GitHub 저장소에 이 폴더의 내용 전체를 업로드합니다. package.json이 저장소 루트에 있어야 합니다.
2. Cloudflare에서 Pages 프로젝트를 만들고 GitHub 저장소를 연결합니다.
3. 프로젝트 이름 `suwon-ongyeol-brow`, 운영 브랜치 `main`으로 설정합니다.
4. 프레임워크: None / 빌드 명령: `npm run build` / 출력 디렉터리: `dist` / 루트 디렉터리: 기본값.
5. 운영 환경변수 `SITE_URL` = `https://suwon-ongyeol-brow.pages.dev`를 설정합니다. 코드의 site.config.json에도 동일 주소가 들어 있습니다.
6. `NODE_VERSION`은 `22`를 권장합니다. 외부 npm 의존성은 없습니다.
7. 배포 후 메인·상세·이미지·robots.txt·sitemap.xml·rss.xml이 정상 접근되는지 확인합니다.

이미 만들어진 `dist` 폴더는 완성 정적 파일입니다. Git 연동에서는 수정된 원본을 빌드하도록 설정하세요. 미리보기 브랜치는 noindex 및 robots 차단으로 생성됩니다. 운영 브랜치가 main이 아니면 `PRODUCTION_BRANCH`에 실제 이름을 설정하세요.

직접 업로드 방식으로 배포한다면 dist 안의 내용만 사용합니다. 다만 요청한 GitHub 자동배포 방식은 위 설정을 사용하세요.

## 2. 네이버 소유확인 (실제 발급 값 필요)

다른 사이트의 소유확인 코드나 임의의 인증값을 만들지 않았습니다. 실제 운영 주소로 서치어드바이저에 사이트를 등록한 다음 아래 중 한 가지 방식으로 완료합니다.

- 메타 방식: 발급받은 `content` 값만 Cloudflare 환경변수 `NAVER_SITE_VERIFICATION`에 넣고 재배포합니다. 또는 site.config.json의 naverVerification에 넣습니다. 모든 HTML head에 자동 반영됩니다.
- HTML 파일 방식: 네이버가 제공한 `naver....html` 파일을 이름과 내용을 변경하지 않고 `public/`에 넣은 뒤 커밋합니다. 빌드 때 dist 루트에 그대로 복사됩니다. 실제 URL에서 열리는지 확인하고 소유확인을 클릭합니다.

## 3. 제출 주소

- 사이트 등록: https://suwon-ongyeol-brow.pages.dev
- 사이트맵: https://suwon-ongyeol-brow.pages.dev/sitemap.xml
- RSS: https://suwon-ongyeol-brow.pages.dev/rss.xml
- 로봇 확인: https://suwon-ongyeol-brow.pages.dev/robots.txt

`submission-urls.txt`에 메인과 모든 상세·안내 주소가 있습니다. 핵심 페이지는 URL 수집 요청에도 사용할 수 있습니다. robots 허용 및 파일 제출은 수집·색인을 보장하지 않습니다.

## 4. 구성

메인 / 서비스 전체 비교 / 자연눈썹 / 콤보눈썹 / 남자눈썹 / 파우더눈썹 / 리터치·잔흔 상담 / 브랜드 / 이용 가이드 / 상담·위치 / 개인정보 안내. 별도 404 페이지가 있어 없는 URL이 메인으로 정상 응답되는 SPA 동작을 방지합니다.

5개 서비스 카드의 이름·원본 해상도 WebP 이미지·상세 URL은 services.json 하나에서 정적 HTML과 메인 ItemList로 함께 생성됩니다. 상세는 각각 다른 본문·상담 대상·FAQ가 있습니다. 주요 콘텐츠와 링크는 JavaScript 실행 없이 읽을 수 있습니다. 캐러셀은 CSS 스크롤, 버튼, 터치 이동으로 작동합니다.

각 페이지 고유 title, description, 단일 H1, canonical, og:url, og:image, WebPage를 생성합니다. BeautySalon과 WebSite는 @id로 연결하고, 상세의 Service는 provider로 사업체를 참조합니다. 실제 주소가 없으므로 위치 좌표와 허위 주소는 만들지 않았습니다. 수원역 검색 링크는 sameAs에 넣지 않습니다. 새 최종 지시서에 맞춰 가상 후기 예시는 삭제했습니다. Review/AggregateRating 마크업은 없습니다.

## 5. 실제 업체 정보로 확장하기

site.config.json:
- brand / brandEnglish / phone: 기본 업체 정보 (영문 워드마크 변경 시 build.mjs, logo.svg도 수정)
- siteUrl: 실제 대표 도메인. 바꾸고 재빌드하면 canonical, OG, JSON-LD, RSS, sitemap, robots 주소가 함께 바뀝니다.
- address: 실제 방문 주소를 확인한 후 입력. 화면과 PostalAddress에 함께 반영됩니다.
- openingHours: 실제 운영시간 확인 후 입력. schema.org 규격(예: Mo-Fr 10:00-19:00)을 사용합니다.
- naverPlaceUrl: 해당 업체의 실제 공식 플레이스만 입력. 상담 페이지 링크와 sameAs에 함께 반영됩니다.
- lastUpdated: 날짜 기본값입니다. 페이지별 게시/수정일은 pages.json, 서비스별 날짜는 services.json에서 관리합니다.
- openingHoursSpecification: 확인한 영업일·시작/종료 시각을 구조화 배열로 입력할 수 있습니다.
- brandWordmark / brandTagline: 헤더 워드마크 문구입니다.

서비스 목록은 요청을 위한 구성안입니다. 실제 제공 범위가 다르면 services.json에서 수정하고 재빌드하세요. 실제 경력·가격·후기를 확보하면 확인된 정보만 추가하세요. 실제 후기는 원문·출처·게시 허락을 확보한 경우에만 추가하세요. AI 이미지는 디자인 참고용이며 실제 시술 결과가 아닙니다.

## 6. 로컬 빌드·검사

Node.js 20 이상에서:

```
npm run build
npm run check
```

이미지를 교체할 때 파일명을 유지하면 카드·상세·JSON-LD가 함께 갱신됩니다. 캐러셀 항목별 서로 다른 이미지를 사용하세요. 외부 이미지 주소나 CDN이 없어 별도 이미지 계정이 필요 없습니다.

## 7. PDF 반영 기준과 한계

단일 브랜드 보고서의 ‘실제 표시 카드와 JSON-LD의 일치’, ‘하나의 메인 목록’, ‘주제별 상세’, ‘고유 SEO’, ‘정적 본문’, ‘절대주소’, ‘수집 검수’를 반영했습니다. 비교 보고서의 업체 엔티티 연결과 상담 흐름을 반영하되, 독립 도메인이나 후기 개수의 순위 효과를 확정적인 공식으로 해석하지 않았습니다. 사용자가 요청한 예정 Pages 주소로 일관되게 설정했습니다.

네이버 공식 안내는 목록을 문서 분석의 보조 정보로 활용하며 캐러셀 노출을 보장하지 않습니다. 색인·순위·캐러셀 표시 여부를 분리해서 확인해야 합니다.

공식 참고(2026-10-03 확인):
- https://searchadvisor.naver.com/guide/structured-data-carousel
- https://developers.cloudflare.com/pages/configuration/build-configuration/

실제 배포 및 서치어드바이저 제출은 계정에서 진행해야 합니다. 이 파일 전달만으로 사이트가 게시되거나 네이버에 등록되지는 않습니다.

## 8. 최종 검토 보완 v1.1.0

- REVIEW-CHANGES.md: PDF 대조·수정 내역
- VALIDATION.md: A01~A16 검수표, 통과·미검증 구분
- INPUT-STATUS.md: 제공·미제공·임의 제작 정보 구분
- carousel-mapping.md/json: 카드·상세·원본 이미지 매핑표
- asset-manifest.json: 생성 출처·용도·해상도·해시
- pages.json: 페이지별 게시일·수정일·RSS 포함 여부

services.json의 publish=false는 상세와 목록에서 제외합니다. featured=false는 공개 상세를 유지하면서 메인 캐러셀에서 제외합니다. 실제 제공하지 않는 서비스는 publish=false로 설정하세요. 이미지 파일은 assets/images/{slug}.webp에 놓습니다. 빌드 검증 실패 메시지를 해결한 뒤 재배포하세요.

RSS에는 현재 공개 이용 가이드만 포함했습니다. 실제 새 글을 추가하면 해당 페이지의 rss를 true로 지정하고 실제 게시일을 입력하세요. 배포일만 바뀌었다고 게시·수정일을 바꾸지 마세요.

실제 후기·사례 자료가 없어 포트폴리오 페이지는 만들지 않았습니다. 검수표의 미검증 항목은 배포 후 완료해야 하며, 검색 노출 보장과는 구분됩니다.

## v1.3.0 전체 배포 재검토

PDF 3개를 다시 대조했습니다. public에 숨김 파일 대신 실제 robots.txt·sitemap.xml·rss.xml을 포함하고 빌드 시 dist와 함께 갱신합니다. 빌드 시작 경로를 scripts/build.mjs 위치 기준으로 고정해 실행 위치에 의존하지 않게 했습니다. 필수 파일 누락 시 파일명을 출력하고, 빌드 로그에 v1.3.0 식별 문구를 추가했습니다. 최신 업로드 절차는 START-HERE.txt를 확인하세요. 실제 네이버 소유확인 파일은 미제공입니다.

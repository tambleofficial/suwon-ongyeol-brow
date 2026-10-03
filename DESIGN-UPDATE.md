# v1.6.0 요청 수정
상단 메뉴: 온결의 기준 / 눈썹 디자인 / 디자인 갤러리 / 이용 가이드 / 상담·위치 안내.
각 메뉴는 /about/, /services/, /gallery/, /guide/, /contact/ 독립 페이지로 이동합니다.
5개 메뉴 페이지마다 새로 생성한 다른 이미지 1장을 적용했습니다. 기존 이미지 재사용 없음.
새 이미지 파일: assets/images/menu-about.webp, menu-services.webp, menu-gallery.webp, menu-guide.webp, menu-contact.webp.
내장 이미지 생성 도구로 제작. 프롬프트는 MENU-IMAGE-PROMPTS.json에 포함.
이미지는 1254×1254 정사각형이며 페이지별 OG에도 반영했습니다.
서비스 캐러셀 5개와 기존 서비스 상세 이미지는 유지합니다.
갤러리는 AI 디자인 참고 갤러리로 실제 고객 사례를 주장하지 않습니다.
빌드, HTML 13개, 내부 링크 269개, 캐러셀 일치 검사 및 메뉴 페이지 신규 이미지 검사 통과.
실제 배포 및 브라우저 렌더링은 미검증입니다.
배포 설정: None / npm run build / dist / 루트 디렉터리 비워두기.

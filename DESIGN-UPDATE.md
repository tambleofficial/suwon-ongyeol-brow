# v1.2.1 디자인 수정

- 참고 사이트처럼 PC에서도 본문 최대 폭 496px 유지
- 1100px 이상에서 양옆 브랜드·상담 패널 표시
- 모바일에서는 본문이 화면 너비에 맞게 표시
- 청록 배경, 흰 본문, 둥근 이미지와 버튼, 고정 하단 상담 버튼
- 모든 상세 페이지에도 동일한 레이아웃 적용
- 기존 SEO, 캐러셀, RSS, sitemap, robots, public 복사 구조 유지

## 배포
압축을 풀고 전체 내용을 기존 GitHub 저장소 루트에 덮어쓰세요.
Framework: None
Build command: npm run build
Build output directory: dist
Root directory: 비워두기

## 검증
빌드와 정적 검증 통과: HTML 12개, 내부 링크 325개, 캐러셀 5개 일치.
참고 사이트의 실제 화면 확인 완료. 수정본의 브라우저 렌더링 검증과 실제 배포는 수행하지 않았습니다.

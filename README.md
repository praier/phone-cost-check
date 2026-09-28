# 휴대폰 견적 계산기

한국 휴대폰 구매조건을 24·36개월 기준으로 분석하는 정적 웹사이트입니다. 계산·저장·공유가 브라우저 안에서 작동하며 서버나 데이터베이스, 외부 라이브러리 설치가 필요하지 않습니다.

공개 사이트: https://praier.github.io/phone-cost-check/

GitHub 저장소: https://github.com/praier/phone-cost-check

## 바로 실행

Node.js 20 이상을 설치한 뒤 이 폴더에서 실행합니다. 검수 환경은 Node.js 24입니다.

```sh
npm start
```

브라우저에서 [http://localhost:4173](http://localhost:4173)을 엽니다. Windows에서는 `start-windows.cmd`를 실행해도 됩니다. 종료는 실행 창에서 Ctrl+C입니다. `dist/index.html`을 더블클릭하는 file:// 방식은 모듈·설정 로딩 제약으로 지원하지 않습니다.

ZIP에는 `dist/`가 포함되어 있습니다. GitHub 소스에서는 `npm start`가 먼저 빌드하므로 별도 설치 없이 실행됩니다. 소스를 수정한 뒤 검증하려면:

```sh
npm test
npm run build
npm run check
npm start
```

의존성 패키지가 없어 `npm install`은 필요하지 않습니다.

## 구현 기능

- 5단계 견적 입력, 공식 가격 선택 / 직접 입력, 금액 쉼표 표시, 0원·누락값·음수·기간 검증
- 공식 출처로 확인한 9개 모델·23개 용량별 가격과 조건부 할인, 출처·확인일·만료 처리
- 작성 중 입력 복구, 기존 견적 업데이트 / 사본 저장, 24·36개월 공유 기간 유지
- 최종 원금 / 할인 전 가격 구분으로 지원금 이중 차감 방지
- 24·36개월 총비용, 월평균, 실제 지출, 남은 할부원금과 미래 이자 분리
- 요금제 2구간, 선택약정 적용기간·할인율, 복수 부가서비스, 보험, 조건부 카드 할인
- 원리금균등 또는 총 수수료 직접입력, 0% 무이자, 최대 120개월
- 도넛 그래프, 월별 지출 그래프, 월별 표, 수치 기반 분석 문장
- 견적 저장·불러오기·이름 변경·삭제, 최대 3개 비교
- 계산 조건 공유 링크, 결과 텍스트 복사, PNG 요약 이미지 저장
- 자급제/통신사·지원금/선택약정·할부·알뜰폰 손익 계산기
- 6개 가이드, 체크리스트, 이용방법 및 운영 안내 페이지
- 정적 HTML 메타데이터, canonical, OpenGraph, Twitter Card, JSON-LD, sitemap, robots, 404
- 모바일 메뉴, 키보드 포커스, 라벨, 오류/상태 안내, 표 스크롤

## 파일 구조와 수정 위치

```text
src/
  config.mjs       브랜드·도메인·문의처·정책 기본값·공식 출처·광고 설정
  calculate.mjs    UI와 분리된 순수 계산 함수 및 입력 검증
  catalog.mjs      공식 모델·용량·가격·조건부 할인·출처·유효기간
  editor.mjs       선택형 가격 목록과 단계별 입력 화면
  editor-controls.mjs  선택 적용·조건 안내·입력 항목 표시 제어
  share.mjs        공유 링크 버전 관리·개인 텍스트 제외
  views.mjs        입력 단계·결과 카드·차트·월별 표
  app.mjs          저장·공유·비교·입력 이벤트, 보조 계산기 연결
  content.mjs      6개 구매 가이드 및 체크리스트
  style.css        색상 토큰·레이아웃·모바일·인쇄 스타일
scripts/
  build.mjs        정적 페이지·SEO·정책/약관 페이지 생성
  serve.mjs        로컬 개발용 HTTP 서버 (실서비스 서버가 아님)
  check.mjs        링크·자산·메타데이터·H1 검증
  release.mjs      실제 도메인·운영자·이메일 확인 후 공개 배포 빌드
tests/
  calculate.test.mjs  26개 계산·가격·공유 테스트
dist/             완성된 정적 배포 파일 전체
.github/workflows/pages.yml  GitHub Pages 자동·수동 배포 워크플로
docs/             조사 결과·계산 기준·검수 기록
```

페이지 본문을 바꾸려면 `content.mjs`와 `build.mjs`, UI를 바꾸려면 `views.mjs`와 `style.css`를 수정하고 다시 빌드하세요. `dist/`만 직접 수정하면 다음 빌드 때 덮어씁니다.

## 공개 운영 전에 필요한 실제 정보

문의 이메일은 `aww2314@gmail.com`, 서비스 운영 표기는 `휴대폰 견적 계산기 운영팀`으로 반영했습니다. 이는 법인·사업자 등록 명칭을 주장하는 표기가 아닙니다. 문의 양식을 제출하면 사용자의 이메일 앱이 열리며 최종 전송은 사용자가 확인합니다.

동봉한 `dist/`는 로컬 미리보기용 도메인과 검색 제외(noindex) 설정입니다. **GitHub Actions 배포에서는 실제 Pages 주소와 경로를 자동으로 가져와 새로 빌드하므로 도메인을 직접 입력하지 않아도 됩니다.** 공개 빌드에서는 실제 주소로 canonical·사이트맵을 생성하고 검색 제외 설정을 해제합니다.

`src/config.mjs`를 수정하거나 아래 환경변수를 설정하세요.

| 설정 | 설명 |
|---|---|
| `SITE_URL` | 경로 없는 HTTPS origin. 예: 본인의 `https://서비스명.pages.dev` |
| `BASE_PATH` | 루트 배포는 빈 문자열, GitHub 프로젝트 페이지는 `/저장소명` |
| `SITE_OPERATOR` | 실제 운영자 또는 사업자명 |
| `CONTACT_EMAIL` | 실제 문의 수신 이메일 |
| `config.brand` | 사이트 이름 |
| `config.policy.discountRate` | 선택약정 기본 할인율 |
| `config.policy.subsidyLabel` | 지원금 항목 명칭 |
| `config.policy.checkedAt / sources` | 공식 자료 확인일·출처 |
| `config.ads.enabled` | 광고 자리 표시. 기본 false, 광고 스크립트는 미설치 |

정책 설명의 서술·예시에도 제도 값이 등장하므로 정책 변경 시 `content.mjs`를 함께 검토하세요. 브랜드, 계산 기본값, 지원금 UI 명칭은 config를 중심으로 관리합니다.

공개 빌드는 다음 명령으로 생성합니다.

```sh
node scripts/release.mjs
```

실제 도메인이나 유효한 운영정보가 빠지면 중단됩니다. GitHub에서는 워크플로가 도메인을 자동 공급합니다. 이는 계정 인증이나 허가 절차가 아니라 누락 설정 검증입니다. 운영자 신원, 호스팅 접속기록 처리, 향후 광고 도입에 맞춰 개인정보처리방침과 약관을 확인한 후 공개하세요. AdSense 승인을 보장하는 패키지는 아닙니다.

## Cloudflare Pages 배포

1. 실제 Pages 프로젝트 주소 또는 사용할 도메인을 정합니다.
2. config 또는 환경변수로 `SITE_URL`, 운영자, 문의처를 설정합니다. 루트 배포라면 `BASE_PATH`는 비워둡니다.
3. `npm test` 및 `node scripts/release.mjs`를 실행합니다.
4. Cloudflare 대시보드의 Workers & Pages에서 정적 파일 Direct Upload 방식으로 프로젝트를 생성합니다.
5. **`dist` 폴더의 내용 전체**를 업로드합니다. `index.html`이 업로드 루트에 있어야 합니다. 소스·문서·테스트 폴더는 공개 배포에 필요하지 않습니다.
6. 배포 후 `/calculator/`, `/guide/phone-subsidy/`, 공유 링크를 열고 실제 canonical 도메인과 검색 허용 설정을 확인합니다.

Git 연동을 선택했다면 빌드 명령은 `node scripts/release.mjs`, 출력 디렉터리는 `dist`, Node 버전은 24로 설정할 수 있습니다. Direct Upload 프로젝트와 Git 연동 프로젝트는 선택 전에 구분하세요. `_headers`는 Cloudflare Pages용 보안 헤더이며, 광고 도입 시 CSP를 검토해야 합니다.

[Cloudflare 공식 Direct Upload 안내](https://developers.cloudflare.com/pages/get-started/direct-upload/)

## GitHub Pages 배포

1. GitHub에 `phone-cost-check` 저장소를 만들고 이 폴더의 내용을 저장소 루트에 올립니다. `.github/workflows/pages.yml`도 포함하세요. ZIP 자체를 올리는 방식이 아닙니다.
2. 저장소 Settings → Pages → Source를 GitHub Actions로 선택합니다.
3. 운영자와 문의 이메일은 이미 설정되어 있어 별도 변수 등록이 필요 없습니다. 바꾸고 싶다면 config를 수정하거나 저장소 Variables에 `SITE_OPERATOR`, `CONTACT_EMAIL`을 등록하세요.
4. 도메인과 하위 경로는 공식 `configure-pages` 작업의 `origin`, `base_path` 출력에서 자동으로 가져옵니다. 계정명이 확정되면 주소는 보통 `https://계정명.github.io/phone-cost-check/` 형식입니다. 별도 도메인 구매는 필요하지 않습니다.
5. Actions에서 **Publish static site → Run workflow**를 실행합니다. 테스트·공개 설정·링크 검증이 통과한 뒤 `dist/`가 배포됩니다.

이후 `main` 브랜치에 변경을 올리면 자동 배포하며, 같은 워크플로를 수동으로 다시 실행할 수도 있습니다. 최초 업로드 직후 Pages 설정이 아직 없다면 첫 실행이 실패할 수 있으므로 2번 설정 후 수동 실행하세요. `.nojekyll`이 포함되어 있으며 서버 fallback에 의존하지 않도록 경로마다 실제 `index.html`을 생성합니다. GitHub Pages는 `_headers`를 적용하지 않으므로 Cloudflare의 응답 헤더와 동일하다고 가정하지 마세요.

[GitHub 공식 정적 배포 워크플로 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

## 확장 설계

기기·통신사·알뜰폰 DB를 도입할 때 별도 데이터 어댑터가 표준 견적 객체를 만들도록 연결하세요. 계산 엔진은 UI·네트워크·LocalStorage에 의존하지 않습니다. 반환·결합·위약금 등은 월별 비용 항목을 확장하고 월별 합계와 잔여원금 보존 테스트를 추가하세요. 공유 payload는 `version:1`, 저장 키는 `phone-cost.v1.*`로 버전을 구분합니다. 계정·공유 DB 도입은 별도 동의와 개인정보 방침 변경이 필요합니다.

## 검증과 한계

26개 계산·가격·공유 테스트와 내부 링크 검증, 실제 브라우저 주요 흐름 검수를 수행했습니다. 상세 기록은 `docs/QA.md`에 있습니다. Lighthouse 점수와 실제 모바일 실기기·스크린리더 검증을 측정했다고 주장하지 않습니다. 2026-09-27 GitHub Pages 공개 배포와 HTTPS 접속을 확인했습니다. 문의 주소는 실제 공개 사이트에 반영했습니다. 실제 이메일 발송은 수행하지 않았습니다.

Homepage copy, FAQs and illustrative quote inputs: `src/home.mjs` (rendered at build time). Home-only lightweight menu: `src/navigation.mjs`. Search title and metadata generation: `scripts/build.mjs`. Run the build after editing these files. Sitemap modification dates are omitted until accurate per-page dates are available; do not substitute the policy reference date.

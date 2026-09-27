export const config = {
  brand: '휴대폰 견적 계산기',
  googleSiteVerification: 'eB5psVRTNcW4j92DUy5z_DoiU6c_8xthdeILxHQcfaM',
  tagline: '가격 너머, 실제 부담까지',
  siteUrl: processEnv('SITE_URL', 'http://localhost:4173'),
  basePath: processEnv('BASE_PATH', ''),
  operator: processEnv('SITE_OPERATOR', '휴대폰 견적 계산기 운영팀'), contactEmail: processEnv('CONTACT_EMAIL', 'aww2314@gmail.com'),
  defaults: { installmentApr: 5.9 },
  policy: { discountRate: 25, subsidyLabel: '공통지원금 / 단말 할인금', checkedAt: '2026-09-27',
    sources: [
      {title:'스마트초이스 · 선택약정 및 지원금 안내',url:'https://www.smartchoice.or.kr/smc/service/danpageNew.do'},
      {title:'과학기술정보통신부 · 단말기유통법 폐지 안내',url:'https://www.korea.kr/multi/visualNewsView.do?newsId=148953626'}
    ] },
  ads: {enabled:false},
  disclaimer: '계산 결과는 입력한 조건을 기반으로 한 참고용 결과이며 실제 통신사·판매점 계약 금액과 차이가 있을 수 있습니다.'
};
function processEnv(key, fallback) { return typeof process !== 'undefined' ? process.env[key] || fallback : fallback; }

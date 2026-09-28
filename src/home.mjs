import {defaultQuote,calculateTotalCost} from './calculate.mjs';

// Illustrative inputs, not current offers. Use the production calculation engine.
export const homeExamples = [
  {...defaultQuote(),name:'자급제 + 알뜰폰',model:'비교용 동일 모델',price:1500000,laterPlan:25000},
  {...defaultQuote(),name:'통신사 지원금',model:'비교용 동일 모델',method:'subsidy',priceMode:'gross',price:1800000,subsidy:500000,plan:109000,hold:6,laterPlan:55000}
];
const won=n=>Math.round(n).toLocaleString('ko-KR')+'원';
export function homeDetails(url){
 const results=[24,36].map(months=>homeExamples.map(q=>calculateTotalCost(q,months)));
 const questions=[
  ['할부원금에 지원금을 또 빼나요?','아니요. 할인 후 최종 할부원금을 입력했다면 지원금을 다시 빼면 안 됩니다. 계산기의 ‘최종 원금’ 기준에서는 할인 내역을 참고용으로만 사용합니다. 할인 전 가격을 입력한 경우에만 지원금과 기기 할인을 차감합니다.'],
  ['36개월 할부를 24개월 기준으로 비교해도 되나요?','가능합니다. 다만 24개월 동안 낸 돈만 비교하면 긴 할부가 저렴해 보일 수 있습니다. 이 계산기는 기간 내 지출에 남은 할부원금을 더해 비교합니다. 25개월 이후의 미래 이자는 총비용과 구분해 따로 표시합니다.'],
  ['월평균 부담액이 실제 청구액과 다른 이유는 무엇인가요?','월평균은 기기값까지 포함한 비교 총비용을 24개월 또는 36개월로 나눈 값입니다. 일시불 기기값은 첫 달 지출로 처리하고, 요금제 변경·부가서비스 종료는 해당 월부터 반영하므로 매월 청구액과 다를 수 있습니다.'],
  ['선택약정 할인과 카드 할인도 반영하나요?','선택약정은 입력한 적용기간과 할인율로 요금제 월정액에서 계산합니다. 카드 할인은 입력한 개월 동안 실적 조건을 충족한다는 가정이며 연회비도 반영합니다. 실적을 채우기 위한 추가 소비는 포함하지 않으므로 계약 조건을 따로 확인하세요.'],
  ['자급제와 통신사 중 어느 쪽이 항상 더 싼가요?','항상 유리한 방식은 없습니다. 같은 모델·저장용량과 필요한 데이터·통화량을 맞춘 뒤 실제 기기 가격과 요금제 조건을 비교하세요. 지원금, 유지기간, 보험, 반납 조건에 따라 결과가 달라집니다.']
 ];
 return `<section class="section" aria-labelledby="cost-example"><div class="section-head"><div><span class="eyebrow">COST IN CONTEXT</span><h2 id="cost-example">기기값은 20만 원 저렴한데,<br>총비용도 더 저렴할까요?</h2><p>같은 휴대폰을 서로 다른 가격과 요금제로 구매하는 가상 예시입니다.</p></div></div>
 <div class="example-conditions"><article class="panel"><span class="badge">조건 A · 자급제 + 알뜰폰</span><h3>기기 150만 원 + 월 2만 5천 원</h3><p>기기 일시불 1,500,000원<br>전체 기간 월 통신비 25,000원</p></article><article class="panel"><span class="badge">조건 B · 통신사 지원금</span><h3>기기 130만 원 + 단계별 요금제</h3><p>할인 전 1,800,000원 − 지원금 500,000원<br>1~6개월 109,000원 · 7개월부터 55,000원</p></article></div>
 <div class="table-scroll" role="region" aria-label="구매방식별 예시 총비용 비교" tabindex="0"><table><caption>24개월·36개월 비교 · 모든 금액은 원 단위</caption><thead><tr><th scope="col">비교 항목</th><th scope="col">조건 A</th><th scope="col">조건 B</th></tr></thead><tbody>${[24,36].map((m,i)=>`<tr><th scope="row">${m}개월 통신비</th>${results[i].map(r=>`<td>${won(r.plan)}</td>`).join('')}</tr><tr class="example-total"><th scope="row">${m}개월 총비용</th>${results[i].map(r=>`<td><strong>${won(r.total)}</strong></td>`).join('')}</tr><tr><th scope="row">${m}개월 월평균</th>${results[i].map(r=>`<td>${won(r.average)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
 <p class="info-note">이 입력 조건에서는 A의 24개월 총비용이 <strong>${won(results[0][1].total-results[0][0].total)}</strong> 낮습니다. B는 기기값이 더 낮지만 24개월 통신비가 ${won(results[0][1].plan-results[0][0].plan)} 더 발생합니다.</p>
 <p class="hint">실제 판매상품이나 동일한 통신서비스를 보장하는 비교가 아닙니다. 두 조건 모두 일시불·선택약정 미적용이며 부가서비스·보험·할부 이자·카드 혜택은 0원으로 가정합니다. 요금은 부가세 포함이며, 36개월까지 입력 요금이 유지된다고 가정합니다.</p><a class="button" href="${url('/unlocked-vs-carrier')}">내 구매 조건으로 다시 비교하기 →</a></section>
 <section class="section" aria-labelledby="cost-method"><div class="section-head"><div><span class="eyebrow">HOW WE CALCULATE</span><h2 id="cost-method">무엇을 더하고, 무엇을 빼나요?</h2></div></div><div class="cost-method-grid"><article class="panel"><h3>① 실제 기기 원금</h3><p>할인 전 가격에서 지원금·쿠폰 등을 빼거나, 할인 후 최종 원금을 그대로 사용합니다. 같은 할인을 두 번 빼지 않습니다.</p></article><article class="panel"><h3>② 기간별 이용 비용</h3><p>초기·변경 후 요금제를 개월별로 계산합니다. 선택약정 적용기간, 부가서비스 유지기간, 보험 가입기간도 각각 반영합니다.</p></article><article class="panel"><h3>③ 할부와 카드 조건</h3><p>기간 내 할부 이자와 카드 연회비를 더하고 카드 혜택을 뺍니다. 장기 할부는 남은 원금도 포함해 비교합니다.</p></article></div><p class="hint">첫 달 일할 요금, 위약금, 가족·인터넷 결합 손실, 중고폰 반납 보상은 자동 반영하지 않습니다. <a class="subtle-link" href="${url('/disclaimer')}">계산 기준과 제외 항목 확인 →</a></p></section>
 <section class="section" aria-labelledby="home-faq"><div class="section-head"><div><span class="eyebrow">BEFORE YOU COMPARE</span><h2 id="home-faq">휴대폰 견적 계산, 자주 묻는 질문</h2></div></div><div class="home-faq">${questions.map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div><div class="home-final-cta"><p>견적서의 숫자를 준비했다면, 이제 내 조건을 확인하세요.</p><a class="button primary" href="${url('/calculator')}">내 견적 분석하러 가기 →</a></div></section>`;
}

import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultQuote,calculateTotalCost,calculateInstallment,validateQuote,sanitizeQuote,calculateMvno} from '../src/calculate.mjs';
const q=(v={})=>({...defaultQuote(),name:'테스트 견적',model:'테스트 휴대폰',...v});
test('CASE 1 자급제 150만원 + 2.5만원 × 24개월 = 210만원',()=>{const r=calculateTotalCost(q({price:1500000,laterPlan:25000}));assert.equal(r.total,2100000);assert.equal(r.average,87500);assert.equal(r.rows[0].total,1525000);assert.equal(r.rows[23].total,25000);});
test('CASE 2 지원금 50만원, 109000 × 6 + 55000 × 18',()=>{const r=calculateTotalCost(q({price:1800000,priceMode:'gross',method:'subsidy',subsidy:500000,plan:109000,hold:6,laterPlan:55000}));assert.equal(r.device,1300000);assert.equal(r.plan,1644000);assert.equal(r.total,2944000);assert.equal(r.rows[5].plan,109000);assert.equal(r.rows[6].plan,55000);assert.equal(r.premium,324000);});
test('CASE 3 선택약정 25%와 24개월 종료',()=>{const quote=q({price:1800000,method:'contract',plan:109000,hold:6,laterPlan:55000,discount:true});const r=calculateTotalCost(quote);assert.equal(r.plan,1233000);assert.equal(r.total,3033000);const r36=calculateTotalCost(quote,36);assert.equal(r36.rows[23].plan,41250);assert.equal(r36.rows[24].plan,55000);assert.equal(r36.plan,1893000);});
test('CASE 4 부가서비스별 유지기간',()=>{const r=calculateTotalCost(q({addons:[{name:'A',cost:9900,months:3},{name:'B',cost:5500,months:2}]}));assert.equal(r.addons,40700);assert.equal(r.rows[1].addons,15400);assert.equal(r.rows[2].addons,9900);assert.equal(r.rows[3].addons,0);});
test('CASE 5 보험 8000 × 24',()=>{assert.equal(calculateTotalCost(q({insurance:8000}),36).insurance,192000);});
test('CASE 6 36개월 할부를 24개월로 평가하면 잔여원금 포함',()=>{const quote=q({price:1800000,term:36,apr:0});const r=calculateTotalCost(quote,24);assert.equal(r.cash,1200000);assert.equal(r.remaining,600000);assert.equal(r.total,1800000);assert.equal(calculateTotalCost(quote,36).remaining,0);});
test('CASE 7 0원은 유효하며 NaN 없이 0 반환',()=>{for(const term of [0,12,24,30,36])assert.equal(calculateTotalCost(q({term})).total,0);});
test('CASE 8 누락된 모델, 가격, 요금 거부',()=>{assert.ok(validateQuote(q({model:''})).length);assert.ok(validateQuote(q({price:NaN})).length);assert.ok(validateQuote(q({laterPlan:undefined})).length);assert.throws(()=>calculateTotalCost(q({plan:NaN})));});
test('net 모드에서는 지원금 중복 차감 금지',()=>{assert.equal(calculateTotalCost(q({price:1300000,subsidy:500000})).device,1300000);});
test('과도한 할인, 음수, 소수 기간, 무한대, 중복 선택약정 거부',()=>{for(const v of [{priceMode:'gross',price:1,subsidy:2},{price:-1},{hold:1.2},{apr:Infinity},{subsidy:1,discount:true},{method:'subsidy',discount:true}])assert.throws(()=>calculateTotalCost(q(v)));});
test('원리금균등 기준값 120만원 12개월 연12%',()=>{const r=calculateInstallment(1200000,12,12);assert.equal(r.monthly,106619);assert.equal(r.rows[0].interest,12000);assert.equal(r.rows[11].balance,0);assert.equal(r.rows.reduce((s,x)=>s+x.principal,0),1200000);assert.ok(Math.abs(r.total-1279423)<10);});
test('수수료 총액 36001원을 36회로 배분하여 합계 보존',()=>{const r=calculateInstallment(1000001,36,0,'flat',36001);assert.equal(r.total,1036002);assert.equal(r.fee,36001);assert.equal(r.rows.at(-1).balance,0);});
test('기간 경계 0개월, 초과 유지기간',()=>{assert.equal(calculateTotalCost(q({plan:100,hold:0,laterPlan:50})).plan,1200);assert.equal(calculateTotalCost(q({plan:100,hold:100,laterPlan:50})).plan,2400);assert.equal(calculateTotalCost(q({insurance:100,insuranceMonths:0})).insurance,0);});
test('월별 합계와 총비용, 원금 보존 property',()=>{for(const term of [0,1,12,24,30,36,120])for(const apr of [0,5.9,12,99]){const quote=q({price:1234567,term,apr,plan:109000,hold:6,laterPlan:55000,card:10000,cardFee:20000,cardMonths:30});for(const n of [24,36]){const r=calculateTotalCost(quote,n);assert.equal(r.cash,r.rows.reduce((s,x)=>s+x.total,0));assert.equal(r.total,r.cash+r.remaining);assert.equal(r.loan.rows.reduce((s,x)=>s+x.principal,0),quote.price);assert.equal(r.total,r.device+r.plan+r.addons+r.insurance+r.interest+r.cardFee-r.card);}}});
test('카드 연회비 청구월과 혜택 기간',()=>{const r=calculateTotalCost(q({card:10000,cardMonths:24,cardFee:20000}),36);assert.equal(r.card,240000);assert.equal(r.cardFee,40000);assert.equal(r.rows[24].card,0);});
test('알뜰폰 회수기간과 순절감',()=>{const r=calculateMvno(69000,25000,12,180000,0);assert.equal(r.monthly,44000);assert.ok(Math.abs(r.breakEven-4.090909)<.0001);assert.equal(r.netRemaining,348000);assert.equal(calculateMvno(100,200,12,100,0).breakEven,null);});
test('공유/저장 파싱은 알 수 없는 속성 제외, 잘못된 자료 거부',()=>{assert.equal(sanitizeQuote({...q(),privateField:'secret'}).privateField,undefined);assert.throws(()=>sanitizeQuote({...q(),addons:null}));assert.throws(()=>sanitizeQuote({...q(),addons:[null]}));assert.throws(()=>calculateTotalCost(q(),0));});

import {freshQuote} from '../src/calculate.mjs';
import {needsPriceApplication,shouldOfferDraftRestore} from '../src/calculate.mjs';
import {catalog,applyCatalogChoice,offerAvailable} from '../src/catalog.mjs';
import {encodeQuote,decodeQuote} from '../src/share.mjs';
test('고정 요금제: 월 25000 입력만으로 24개월 60만원 반영',()=>{const r=calculateTotalCost({...freshQuote(),model:'기기',price:1500000,plan:25000});assert.equal(r.total,2100000);assert.equal(r.premium,0);});
test('기존 공유 견적의 단계별 요금 계산 하위 호환',()=>{const old=q({plan:109000,hold:6,laterPlan:55000});delete old.planMode;assert.equal(calculateTotalCost(old).plan,1644000);});
test('가격 목록: 모든 용량의 기준가와 혜택 범위 유효',()=>{for(const p of catalog)for(const v of p.variants){assert.ok(Number.isInteger(v.retail)&&v.retail>0);assert.ok(p.source.startsWith('https://'));for(const o of v.offers)assert.ok(o.netPrice>=0&&o.netPrice<=v.retail);}});
test('가격 적용은 과거 할인을 초기화하여 중복 차감을 막음',()=>{const p=catalog[0],v=p.variants[0],o=v.offers[0];const result=applyCatalogChoice(q({extra:100000,card:10000,subsidy:300000}),p,v,o,new Date('2026-09-28T00:00:00Z'));assert.equal(calculateTotalCost(result).total,1091100);assert.equal(result.subsidy,0);assert.equal(result.extra,0);assert.equal(result.card,0);assert.equal(result.term,0);});
test('조건부 혜택가를 실제 할부원금으로 오인하지 않도록 차단',()=>{const p=catalog[0],v=p.variants[0];const result=applyCatalogChoice(q(),p,v,v.offers[0],new Date('2026-09-28T00:00:00Z'));assert.throws(()=>calculateTotalCost({...result,term:24}));});
test('혜택 만료는 한국 시간 9월30일 종료 기준',()=>{const p=catalog[0],o=p.variants[0].offers[0];assert.ok(offerAvailable(p,o,new Date('2026-09-30T14:59:59Z')));assert.equal(offerAvailable(p,o,new Date('2026-09-30T15:00:00Z')),false);assert.throws(()=>applyCatalogChoice(q(),p,p.variants[0],o,new Date('2026-10-01T00:00:00Z')));});
test('공유 링크는 36개월 선택을 보존하고 개인정보 텍스트 제외',()=>{const original=q({name:'매장 이름',model:'개인 메모',priceNote:'개인 메모',addons:[{name:'개인 이름',cost:1000,months:2}]});const restored=decodeQuote(encodeQuote(original,36));assert.equal(restored.period,36);assert.equal(restored.quote.model,'공유 기기');assert.equal(restored.quote.priceNote,'');assert.equal(restored.quote.addons[0].name,'부가서비스 1');assert.equal(calculateTotalCost(restored.quote,36).total,calculateTotalCost(original,36).total);});
test('이전 버전 링크는 24개월로 열림, 잘못된 기간은 거부',()=>{const raw=Buffer.from(JSON.stringify({version:1,quote:q()})).toString('base64');assert.equal(decodeQuote(raw).period,24);assert.throws(()=>decodeQuote(Buffer.from(JSON.stringify({version:2,period:99,quote:q()})).toString('base64')));});
test('공식가와 직접 입력 견적은 동일한 계산식 사용',()=>{const p=catalog.find(x=>x.id==='iphone-17'),v=p.variants[0];const result=applyCatalogChoice({...freshQuote(),plan:25000},p,v);assert.equal(calculateTotalCost(result).total,2050000);assert.equal(calculateTotalCost({...result,priceMode:'net',price:1450000,deviceDiscount:0,catalogId:''}).total,2050000);});
test('모델 적용 후 다른 모델·용량·할인 선택은 재적용 필요',()=>{
 const p=catalog[0],quote=applyCatalogChoice(q(),p,p.variants[0]);
 const selected={model:p.id,capacity:'256GB',offer:'list',price:'list'};
 assert.equal(needsPriceApplication(quote,selected),false);
 for(const changed of [{model:'iphone-17'},{capacity:'512GB'},{offer:'official-benefit'},{price:'manual'}])assert.equal(needsPriceApplication(quote,{...selected,...changed}),true);
 assert.equal(needsPriceApplication(quote,{model:''}),false);
});
test('본문 앵커는 복구 허용, 공유 링크와 불러온 견적은 덮어쓰지 않음',()=>{
 for(const hash of ['', '#main','#results'])assert.equal(shouldOfferDraftRestore(null,hash),true);
 assert.equal(shouldOfferDraftRestore(null,'#q=abc'),false);
 assert.equal(shouldOfferDraftRestore(q(),'#main'),false);
});
test('신규 견적 요금 미입력은 거부, 사용자가 입력한 0원은 허용',()=>{
 const quote={...freshQuote(),model:'기기',price:1500000};
 assert.throws(()=>calculateTotalCost(quote));
 assert.equal(calculateTotalCost({...quote,plan:0}).total,1500000);
});
test('조건부 혜택의 모델명 수정은 할부 제한을 해제하지 않음',()=>{
 const p=catalog[0],quote=applyCatalogChoice(q(),p,p.variants[0],p.variants[0].offers[0],new Date('2026-09-28T00:00:00Z'));
 assert.throws(()=>calculateTotalCost({...quote,model:'내 휴대폰',term:24}));
 assert.equal(calculateTotalCost({...quote,model:'내 휴대폰'}).total,1091100);
});

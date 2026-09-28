export const NUMERIC = {budget:100000000,retail:100000000,price:100000000,deviceDiscount:100000000,subsidy:100000000,extra:100000000,coupon:100000000,other:100000000,card:1000000,cardMonths:120,cardFee:10000000,plan:10000000,hold:120,laterPlan:10000000,discountRate:100,discountMonths:120,insurance:1000000,insuranceMonths:120,term:120,apr:100,flatFee:100000000};
export function defaultQuote(rate=25) { return {name:'내 견적',budget:0,model:'',retail:0,price:0,priceMode:'net',method:'unlocked',deviceDiscount:0,subsidy:0,extra:0,coupon:0,other:0,card:0,cardMonths:24,cardFee:0,plan:0,hold:0,laterPlan:0,discount:false,discountRate:rate,discountMonths:24,addons:[],insurance:0,insuranceMonths:24,term:0,feeMode:'apr',apr:0,flatFee:0,planMode:'staged',cashOnly:false,catalogId:'',catalogCapacity:'',offerId:'',priceNote:''}; }
export function freshQuote(rate=25){return {...defaultQuote(rate),planMode:'fixed',plan:null};}
export function needsPriceApplication(q,selection){
  if(!selection.model)return false;
  return selection.model!==q.catalogId||selection.capacity!==q.catalogCapacity||selection.offer!==q.offerId||selection.price==='manual';
}
export function shouldOfferDraftRestore(analyzed,hash){return !analyzed&&!hash.startsWith('#q=');}
export function validateQuote(q) {
  const errors=[];
  if(!q || typeof q!=='object') return ['견적 형식이 올바르지 않습니다.'];
  if(typeof q.name!=='string'||!q.name.trim()||q.name.length>80) errors.push('견적 이름을 1~80자로 입력하세요.');
  if(typeof q.model!=='string'||!q.model.trim()||q.model.length>100) errors.push('휴대폰 모델명을 1~100자로 입력하세요.');
  if(q.planMode!==undefined&&!['fixed','staged'].includes(q.planMode))errors.push('요금제 유지 방식을 확인하세요.');
  if(q.cashOnly!==undefined&&typeof q.cashOnly!=='boolean')errors.push('혜택가 계산 조건을 확인하세요.');
  if(q.cashOnly&&q.term>0)errors.push('선택한 혜택가는 일시불 비교용입니다. 할부는 직접 입력으로 전환하고 실제 할부원금·할인을 확인하세요.');
  for(const k of ['catalogId','catalogCapacity','offerId','priceNote'])if(q[k]!==undefined&&(typeof q[k]!=='string'||q[k].length>500))errors.push('가격 출처 형식을 확인하세요.');
  for(const [k,max] of Object.entries(NUMERIC)) if(typeof q[k]!=='number'||!Number.isFinite(q[k])||q[k]<0||q[k]>max||(!['apr','discountRate'].includes(k)&&!Number.isInteger(q[k]))) errors.push(`${k}: 0~${max.toLocaleString('ko-KR')} 범위의 올바른 숫자가 필요합니다.`);
  if(!['net','gross'].includes(q.priceMode)||!['unlocked','subsidy','contract','other'].includes(q.method)||!['apr','flat'].includes(q.feeMode)||typeof q.discount!=='boolean') errors.push('구매·할인·할부 방식을 확인하세요.');
  if(q.discount && (q.method==='subsidy'||q.subsidy>0)) errors.push('통신사 공통지원금과 선택약정은 함께 계산할 수 없습니다. 판매점 추가지원은 별도 항목에 입력하세요.');
  if(!Array.isArray(q.addons)||q.addons.length>30) errors.push('부가서비스는 최대 30개까지 가능합니다.');
  else for(const a of q.addons) if(!a||typeof a.name!=='string'||a.name.length>80||!Number.isInteger(a.cost)||a.cost<0||a.cost>1000000||!Number.isInteger(a.months)||a.months<0||a.months>120) errors.push('부가서비스 금액과 기간을 확인하세요.');
  if(q.priceMode==='gross' && ['deviceDiscount','subsidy','extra','coupon','other'].reduce((s,k)=>s+(q[k]||0),0)>q.price) errors.push('기기 할인 합계가 할인 전 판매가격을 초과합니다.');
  return errors;
}
export function sanitizeQuote(input) { const q=defaultQuote(); for(const k of Object.keys(q)) if(Object.hasOwn(input,k)) q[k]=input[k]; q.addons=Array.isArray(q.addons)?q.addons.map(a=>({name:a?.name,cost:a?.cost,months:a?.months})):q.addons; const errors=validateQuote(q); if(errors.length) throw new Error(errors.join('\n')); return q; }
export function calculateDeviceCost(q) { return q.priceMode==='net'?q.price:q.price-['deviceDiscount','subsidy','extra','coupon','other'].reduce((s,k)=>s+q[k],0); }
export function calculateDiscount(plan,enabled,rate) { return enabled?Math.round(plan*rate/100):0; }
export function calculatePlanCost(q,m) { const base=q.planMode==='fixed'||m<=q.hold?q.plan:q.laterPlan; const discount=calculateDiscount(base,q.discount&&m<=q.discountMonths,q.discountRate); return {base,discount,cost:base-discount}; }
export function calculateAddons(addons,m) { return addons.reduce((sum,a)=>sum+(m<=a.months?a.cost:0),0); }
export function calculateInsurance(q,m) {return m<=q.insuranceMonths?q.insurance:0;}
export function calculateInstallment(principal,term,apr=0,mode='apr',flatFee=0) {
  if(![principal,term,apr,flatFee].every(Number.isFinite)||principal<0||principal>1e8||!Number.isInteger(principal)||!Number.isInteger(term)||term<0||term>120||apr<0||apr>100||flatFee<0||flatFee>1e8||!['apr','flat'].includes(mode)) throw new Error('할부 조건을 확인하세요.');
  if(term===0) return {rows:[{principal,interest:0,payment:principal,balance:0}],total:principal,fee:0,monthly:principal};
  let balance=principal; const r=apr/1200;
  const payment=r?principal*r/(1-Math.pow(1+r,-term)):principal/term;
  const rows=[];
  for(let m=1;m<=term;m++) {
    const interest=mode==='flat'?Math.round(flatFee*m/term)-Math.round(flatFee*(m-1)/term):Math.round(balance*r);
    const part=m===term?balance:mode==='flat'||r===0?Math.round(principal*m/term)-Math.round(principal*(m-1)/term):Math.min(balance,Math.max(0,Math.round(payment)-interest));
    balance-=part; rows.push({principal:part,interest,payment:part+interest,balance});
  }
  return {rows,total:rows.reduce((s,x)=>s+x.payment,0),fee:rows.reduce((s,x)=>s+x.interest,0),monthly:rows[0].payment};
}
export function calculateTotalCost(input,months=24) {
  if(!Number.isInteger(months)||months<1||months>120) throw new Error('계산기간은 1~120개월입니다.');
  const q=sanitizeQuote(input),device=calculateDeviceCost(q), loan=calculateInstallment(device,q.term,q.apr,q.feeMode,q.flatFee);
  const rows=Array.from({length:months},(_,i)=>{
    const m=i+1,p=calculatePlanCost(q,m), l=loan.rows[i]||{principal:0,interest:0};
    const addons=calculateAddons(q.addons,m),insurance=calculateInsurance(q,m),card=m<=q.cardMonths?q.card:0,cardFee=m<=q.cardMonths&&(m-1)%12===0?q.cardFee:0;
    return {month:m,device:l.principal,interest:l.interest,plan:p.cost,planDiscount:p.discount,addons,insurance,card,cardFee,total:l.principal+l.interest+p.cost+addons+insurance+cardFee-card};
  });
  const sum=k=>rows.reduce((s,r)=>s+r[k],0),cash=sum('total'),remaining=q.term>months?loan.rows[months-1].balance:0;
  const total=cash+remaining,plan=sum('plan'),interest=sum('interest'),addons=sum('addons'),insurance=sum('insurance'),card=sum('card'),cardFee=sum('cardFee');
  const futureFee=loan.rows.slice(months).reduce((s,r)=>s+r.interest,0);
  let premium=0;for(let m=1;m<=(q.planMode==='fixed'?0:Math.min(q.hold,months));m++) premium+=Math.max(0,calculatePlanCost(q,m).cost-(q.laterPlan-calculateDiscount(q.laterPlan,q.discount&&m<=q.discountMonths,q.discountRate)));
  return {first:rows[0].total,peak:Math.max(...rows.map(x=>x.total)),budgetGap:q.budget?total-q.budget:null,months,total,cash,remaining,futureFee,average:total/months,device,plan,interest,addons,insurance,card,cardFee,rows,premium,discounts:(q.priceMode==='gross'?q.price-device:Math.max(0,q.retail-device))+sum('planDiscount')+card,loan};
}
export function calculateMvno(current,next,remaining,penalty,other) { const monthly=current-next,initial=penalty+other;return {monthly,annual:monthly*12,breakEven:monthly>0?initial/monthly:null,netRemaining:monthly*remaining-initial}; }

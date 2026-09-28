// Manually verified public official-store snapshots. Never infer a carrier subsidy.
export const catalogCheckedAt='2026-09-28';
const apple=(id,name,prices)=>({id,name,brand:'Apple',source:`https://www.apple.com/kr/shop/buy-iphone/${id}`,priceLabel:'Apple 공식 판매가',checkedAt:catalogCheckedAt,variants:prices.map(([capacity,retail])=>({capacity,retail,offers:[]}))});
const samsungSource='https://www.samsung.com/sec/smartphones/galaxy-s26/buy/';
const offer=(netPrice,condition)=>({id:'official-benefit',netPrice,label:'조회한 최대 혜택가',condition,validUntil:'2026-09-30',cashOnly:true});
const samsung=(id,name,source,prices)=>({id,name,brand:'Samsung',source,priceLabel:'삼성닷컴 기준가',checkedAt:catalogCheckedAt,variants:prices.map(([capacity,retail,netPrice,condition])=>({capacity,retail,offers:netPrice?[offer(netPrice,condition)]:[]}))});
export const catalog=[
 samsung('galaxy-s26','갤럭시 S26',samsungSource,[
  ['256GB',1254000,1091100,'핑크 골드 SM-S942NZDEKOO 제품 페이지 표시값. 삼성닷컴 회원·대상 카드 등 결제 조건 및 재고 확인 필요. 즉시할인과 카드 혜택의 정확한 구분이 확인되지 않아 일시불 총비용 비교에만 사용합니다.'],
  ['512GB',1507000,1321400,'실버 쉐도우 SM-S942NZSFKOO 제품 페이지 표시값. 삼성닷컴 회원·대상 카드 등 결제 조건 및 재고 확인 필요. 할인 구성 구분이 확인되지 않아 일시불 총비용 비교에만 사용합니다.']
 ]),
 samsung('galaxy-s26-plus','갤럭시 S26+',samsungSource,[['256GB',1452000],['512GB',1705000]]),
 samsung('galaxy-s26-ultra','갤럭시 S26 울트라','https://www.samsung.com/sec/smartphones/galaxy-s26-ultra/buy/?modelCode=SM-S948NZWBKOO',[
  ['256GB',1797400,1585600,'화이트 SM-S948NZWBKOO 제품 페이지의 최대 혜택가 표시값. 삼성닷컴 회원·대상 결제수단 및 재고를 확인하세요. 별도 카드 할인율을 이 가격에서 추가 차감하지 않습니다. 일시불 비교용입니다.'],['512GB',2050400],['1TB',2545400]
 ]),
 samsung('galaxy-s26-fe','갤럭시 S26 FE',samsungSource+'?modelCode=SM-S741NLGWKOO',[
  ['256GB',1045000,982804,'공식 안내의 일반 구매 예시: 즉시 할인 31,800원 + 삼성 개인신용카드 50만원 이상 결제 시 결제일 할인 30,396원. 보험·구독·반납·포인트는 제외합니다. 추가 쿠폰 중복 여부는 확인되지 않아 합산하지 않았습니다. 일시불 비교용입니다.']
 ]),
 apple('iphone-18-pro','iPhone 18 Pro',[['256GB',1990000],['512GB',2290000],['1TB',2890000],['2TB',3790000]]),
 {...apple('iphone-18-pro-max','iPhone 18 Pro Max',[['256GB',2190000],['512GB',2490000],['1TB',3090000],['2TB',3990000]]),source:'https://www.apple.com/kr/shop/buy-iphone/iphone-18-pro'},
 apple('iphone-17','iPhone 17',[['256GB',1450000],['512GB',1750000]]),
 apple('iphone-air','iPhone Air',[['256GB',1790000],['512GB',2090000],['1TB',2690000]]),
 apple('iphone-17e','iPhone 17e',[['256GB',1150000],['512GB',1450000]])
];
catalog[0].variants[0].source=samsungSource+'?modelCode=SM-S942NZDEKOO';
catalog[0].variants[1].source=samsungSource+'?modelCode=SM-S942NZSFKOO';
export function koreaDate(now=new Date()){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);}
export function offerAvailable(product,offer,now=new Date()){
 const day=koreaDate(now),age=(Date.parse(day)-Date.parse(product.checkedAt))/86400000;
 return age>=0&&age<=7&&(!offer.validUntil||day<=offer.validUntil);
}
export function applyCatalogChoice(quote,product,variant,selectedOffer=null,now=new Date()){
 if(!product?.variants.includes(variant))throw new Error('모델과 용량을 다시 선택하세요.');
 if(selectedOffer&&(!variant.offers.includes(selectedOffer)||!offerAvailable(product,selectedOffer,now)))throw new Error('혜택 확인기간이 지났습니다. 판매처 확인 후 직접 입력하세요.');
 const net=selectedOffer?.netPrice??variant.retail;
 return {...quote,model:`${product.name} ${variant.capacity}`,retail:variant.retail,price:variant.retail,priceMode:'gross',deviceDiscount:variant.retail-net,subsidy:0,extra:0,coupon:0,other:0,card:0,cardFee:0,method:'unlocked',cashOnly:!!selectedOffer?.cashOnly,
  catalogId:product.id,catalogCapacity:variant.capacity,offerId:selectedOffer?.id||'list',priceNote:`${product.priceLabel} · ${product.checkedAt} 확인${selectedOffer?' · '+selectedOffer.condition:''}`,term:selectedOffer?.cashOnly?0:quote.term,apr:selectedOffer?.cashOnly?0:quote.apr,flatFee:selectedOffer?.cashOnly?0:quote.flatFee};
}

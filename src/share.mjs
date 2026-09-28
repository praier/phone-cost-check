import {sanitizeQuote} from './calculate.mjs';
export function encodeQuote(q,period=24){
 const quote={...q,name:'공유받은 견적',model:'공유 기기',priceNote:'',catalogId:'',catalogCapacity:'',offerId:'',addons:q.addons.map((a,i)=>({...a,name:`부가서비스 ${i+1}`}))};
 const bytes=new TextEncoder().encode(JSON.stringify({version:2,period,quote}));
 return btoa(String.fromCharCode(...bytes)).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'');
}
export function decodeQuote(s){
 if(s.length>16000)throw new Error('공유 데이터가 너무 큽니다.');
 const raw=Uint8Array.from(atob(s.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0));
 const data=JSON.parse(new TextDecoder().decode(raw));
 if(![1,2].includes(data.version))throw new Error('지원하지 않는 공유 버전입니다.');
 if(data.version===2&&![24,36].includes(data.period))throw new Error('분석 기간을 확인하세요.');
 return {quote:sanitizeQuote(data.quote),period:data.version===2?data.period:24};
}

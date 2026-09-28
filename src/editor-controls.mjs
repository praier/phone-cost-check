import {catalog,offerAvailable,applyCatalogChoice} from './catalog.mjs';
import {catalogOptions} from './editor.mjs';
import {esc,money} from './views.mjs';
export function bindEditorControls(form,quote,readQuote,apply,changed){
 const el=n=>form.elements.namedItem(n),node=s=>form.querySelector(s);
 function section(id,show){const n=node(id);n.hidden=!show;n.querySelectorAll('input,select').forEach(x=>x.disabled=!show);}
 function sync(){
  const staged=el('planMode').value==='staged',loan=el('termPreset').value!=='0';
  section('#plan-change',staged);section('#discount-period',el('discount').value==='true');
  section('#discount-settings',el('discount').value==='true');section('#custom-term',el('termPreset').value==='custom');
  section('#installment-options',loan);section('#apr-field',loan&&el('feeMode').value==='apr');section('#flat-fee-field',loan&&el('feeMode').value==='flat');
  const n=x=>Number(el(x).value.replaceAll(',',''));
  node('#plan-schedule').textContent=staged?(n('hold')===0?`첫 달부터 ${money(n('laterPlan'))} 적용 (초기 월요금은 사용하지 않음)`:`1~${n('hold')}개월 ${money(n('plan'))} → ${n('hold')+1}개월부터 ${money(n('laterPlan'))}`):`전체 사용기간 월 ${money(n('plan'))} · 선택약정은 별도 반영`;
 }
 function product(){return catalog.find(x=>x.id===el('catalogModel').value);}
 function renderCatalog(reset=false){
  const p=product();
  if(reset)el('catalogStorage').innerHTML=p?p.variants.map(v=>`<option>${v.capacity}</option>`).join(''):'<option value="">모델을 먼저 선택하세요</option>';
  const v=p?.variants.find(x=>x.capacity===el('catalogStorage').value);
  if(reset){el('catalogOffer').innerHTML=catalogOptions(p,v?.capacity);el('catalogPrice').value='list';}
  el('catalogPrice').options[0].textContent=v?`${money(v.retail)} · ${p.priceLabel}`:'모델과 용량을 먼저 선택하세요';
  const o=v?.offers.find(x=>x.id===el('catalogOffer').value),manual=el('catalogPrice').value==='manual'||el('catalogOffer').value==='manual';
  el('catalogOffer').disabled=el('catalogPrice').value==='manual';
  node('#catalog-confirm').hidden=!o||manual;
  node('#apply-catalog').disabled=!p||!v;
  node('#catalog-info').innerHTML=p&&v?`<p><strong>${esc(p.name)} ${esc(v.capacity)}</strong><br>${esc(p.priceLabel)} ${money(v.retail)} · ${p.checkedAt} 확인</p>${o?`<p class="info-note">조회한 범위의 최대 할인 <strong>${money(v.retail-o.netPrice)}</strong><br>혜택 반영 예상 기기비 <strong>${money(o.netPrice)}</strong></p><p>${esc(o.condition)}</p><p class="hint">확인기간 ${o.validUntil}까지 · 전국 최대 할인이나 구매 가능 보장이 아닙니다. ${offerAvailable(p,o)?'':'확인기간 종료: 직접 확인 후 입력하세요.'}</p>`:v.offers.length?'<p class="hint">할인 선택에서 조건부 혜택가를 확인할 수 있습니다.</p>':'<p class="hint">적용 가능한 최대 할인을 확인하지 못했습니다. 할인 없음으로 단정하지 않습니다. 실제 견적이 있다면 직접 입력하세요.</p>'}<a href="${esc(v.source||p.source)}" target="_blank" rel="noopener noreferrer" class="subtle-link">공식 가격·구매 조건 확인 ↗</a>`:'<p class="hint">모델 목록에 없다면 모델명과 가격을 직접 입력할 수 있습니다.</p>';
 }
 el('catalogModel').onchange=()=>{el('catalogConfirm').checked=false;renderCatalog(true);};
 el('catalogStorage').onchange=()=>{el('catalogOffer').innerHTML=catalogOptions(product(),el('catalogStorage').value);el('catalogConfirm').checked=false;renderCatalog();};
 el('catalogOffer').onchange=()=>{el('catalogConfirm').checked=false;renderCatalog();};
 el('catalogPrice').onchange=()=>{el('catalogConfirm').checked=false;renderCatalog();};
 function manual(){quote.cashOnly=false;quote.catalogId='';quote.offerId='';quote.priceNote='';node('#cash-only-note').hidden=true;node('#manual-device').open=true;node('#applied-price').hidden=true;node('#catalog-feedback').textContent='직접 입력 모드입니다. 실제 원금과 할인 내역을 확인하세요.';changed();el('price').focus();}
 node('#manual-price').onclick=manual;
 node('#apply-catalog').onclick=()=>{
  const p=product(),v=p?.variants.find(x=>x.capacity===el('catalogStorage').value),o=v?.offers.find(x=>x.id===el('catalogOffer').value);
  if(!p||!v)return;
  if(el('catalogPrice').value==='manual'||el('catalogOffer').value==='manual'){el('model').value=`${p.name} ${v.capacity}`;if(el('catalogPrice').value==='list'){el('retail').value=v.retail.toLocaleString('en-US');el('price').value=v.retail.toLocaleString('en-US');el('priceMode').value='gross';for(const k of ['deviceDiscount','subsidy','extra','coupon','other','card','cardFee'])el(k).value='0';}manual();return;}
  if(o&&!el('catalogConfirm').checked){node('#catalog-feedback').textContent='혜택 적용 조건을 확인하고 체크해주세요.';el('catalogConfirm').focus();return;}
  try{apply(applyCatalogChoice(readQuote(),p,v,o));}catch(err){node('#catalog-feedback').textContent=err.message;}
 };
 node('#applied-price').textContent=quote.catalogId?`${quote.model} · 적용 기기비 ${money(quote.priceMode==='gross'?quote.price-quote.deviceDiscount:quote.price)}${quote.priceNote?' · '+quote.priceNote:''}`:'';
 form.addEventListener('input',e=>{if(['price','retail','deviceDiscount','subsidy','extra','coupon','other','model','priceMode'].includes(e.target.name)&&quote.catalogId){quote.catalogId='';quote.offerId='';quote.priceNote='';quote.cashOnly=false;node('#applied-price').hidden=true;node('#cash-only-note').hidden=true;}sync();});
 form.addEventListener('change',sync);
 if(quote.offerId)el('catalogOffer').value=quote.offerId;
 sync();renderCatalog();
 return {sync,renderCatalog,refreshOffers:()=>{el('catalogOffer').innerHTML=catalogOptions(product(),el('catalogStorage').value);}};
}

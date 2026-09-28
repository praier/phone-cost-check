// Informational homepage needs only menu behavior; no quote modules or config fetch.
const toggle=document.querySelector('#menu-toggle');
const nav=document.querySelector('#main-nav');
toggle?.addEventListener('click',()=>{
 const open=toggle.getAttribute('aria-expanded')!=='true';
 toggle.setAttribute('aria-expanded',String(open));
 toggle.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');
 nav.classList.toggle('open',open);
});
document.addEventListener('keydown',event=>{
 if(event.key==='Escape'&&toggle?.getAttribute('aria-expanded')==='true'){
  toggle.click();toggle.focus();
 }
});

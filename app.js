(() => {
  const config = window.HOF_CONFIG || {};
  const supabaseReady = Boolean(window.supabase && config.supabaseUrl && config.supabasePublishableKey && !config.supabaseUrl.includes('YOUR_') && !config.supabasePublishableKey.includes('YOUR_'));
  const client = supabaseReady ? window.supabase.createClient(config.supabaseUrl, config.supabasePublishableKey) : null;
  const grid = document.getElementById('product-grid');
  const count = document.getElementById('cart-count');
  const dialog = document.getElementById('cart-dialog');
  let products = [];
  let cart = [];
  const money = value => new Intl.NumberFormat('de-DE',{style:'currency',currency:'EUR'}).format(value);
  const safe = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function render(list=products){
    if(!list.length){grid.innerHTML='<div class="empty-state"><span>✳</span><h3>Unser Laden füllt sich gerade.</h3><p>Die ersten Produkte findest du bald hier.</p></div>';return;}
    grid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-image">✳</div><p class="eyebrow">${safe(p.category || 'HOFPRODUKT')}</p><h3>${safe(p.name)}</h3><p>${safe(p.description || '')}</p><div class="product-meta"><strong>${money(Number(p.price))}</strong><button data-add="${safe(p.id)}">In den Warenkorb</button></div></article>`).join('');
  }
  function renderCart(){count.textContent=cart.reduce((n,x)=>n+x.qty,0);document.getElementById('cart-items').innerHTML=cart.length?cart.map(x=>`<p>${safe(x.name)} <span aria-label="Menge">${x.qty} ×</span> <span class="cart-line-price">${money(x.price)}</span> <span aria-label="Zeilensumme">= <strong>${money(x.price*x.qty)}</strong></span></p>`).join(''):'<p>Dein Warenkorb ist noch leer.</p>';document.getElementById('cart-total').textContent=money(cart.reduce((n,x)=>n+x.price*x.qty,0));}
  grid.addEventListener('click',e=>{const id=e.target.closest('[data-add]')?.dataset.add;if(!id)return;const p=products.find(x=>String(x.id)===id);if(!p)return;const found=cart.find(x=>String(x.id)===id);found?found.qty++:cart.push({id:p.id,name:p.name,price:Number(p.price),qty:1});renderCart();});
  document.getElementById('cart-open').addEventListener('click',()=>dialog.showModal());document.getElementById('cart-close').addEventListener('click',()=>dialog.close());
  const checkoutForm=document.getElementById('checkout-form');
  let sumupWidgetLoaded=false;
  function loadSumUpWidget(){
    if(window.SumUpCard)return Promise.resolve();
    if(sumupWidgetLoaded)return new Promise((resolve,reject)=>{const t=setInterval(()=>{if(window.SumUpCard){clearInterval(t);resolve();}},100);setTimeout(()=>{clearInterval(t);reject(new Error('SumUp-Zahlungsfenster konnte nicht geladen werden.'));},10000);});
    sumupWidgetLoaded=true;
    return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://gateway.sumup.com/gateway/ecom/card/v2/sdk.js';s.onload=resolve;s.onerror=()=>reject(new Error('SumUp-Zahlungsfenster konnte nicht geladen werden.'));document.head.appendChild(s);});
  }
  checkoutForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const status=document.getElementById('checkout-status');
    const button=checkoutForm.querySelector('button[type="submit"]');
    const widget=document.getElementById('sumup-card');
    if(!client){status.textContent='Der Shop ist momentan nicht erreichbar. Bitte später erneut versuchen.';return;}
    if(cart.length!==1||cart[0].name!=='Pedigree of Pigeons by TABA Zugang'||cart[0].qty!==1){status.textContent='Der Online-Checkout ist aktuell nur für den Zugang zu Pedigree of Pigeons by TABA verfügbar.';return;}
    if(!checkoutForm.reportValidity())return;
    button.disabled=true;status.textContent='Sichere Karteneinrichtung wird vorbereitet …';
    try{
      const fd=new FormData(checkoutForm);
      const {data,error}=await client.functions.invoke('create-sumup-checkout',{body:{name:String(fd.get('name')||''),email:String(fd.get('email')||''),acceptRecurring:fd.get('acceptRecurring')==='on'}});
      if(error||!data?.checkout_id)throw new Error(data?.error||error?.message||'Karteneinrichtung konnte nicht gestartet werden.');
      await loadSumUpWidget();
      widget.hidden=false;
      status.textContent='Bitte gib deine Karte im sicheren SumUp-Fenster ein und stimme der Speicherung für monatliche Abbuchungen zu.';
      button.hidden=true;
      window.SumUpCard.mount({id:'sumup-card',checkoutId:data.checkout_id,onResponse:async(type,body)=>{
        if(type==='success'){
          status.textContent='Karte bestätigt. Die erste Monatszahlung von 3,49 € wird verarbeitet …';
          try{
            const {data:done,error:finishError}=await client.functions.invoke('complete-taba-subscription',{body:{checkout_id:data.checkout_id}});
            if(finishError||!done?.ok)throw new Error(done?.error||finishError?.message||'Abo konnte nicht aktiviert werden.');
            status.textContent='Vielen Dank! Dein Monatsabo ist aktiv. Zugang gültig bis '+new Date(done.access_until).toLocaleDateString('de-DE')+'.';
            widget.hidden=true;
            renderCart();
          }catch(err){status.textContent=err.message||'Aktivierung konnte nicht abgeschlossen werden. Bitte nicht erneut bezahlen.';}
        }else if(type==='error'){
          status.textContent='Die Karteneinrichtung wurde nicht abgeschlossen. Bitte prüfe deine Angaben und versuche es erneut.';
          button.hidden=false;button.disabled=false;
        }
      }});
    }catch(err){status.textContent=err.message||'Checkout fehlgeschlagen.';button.disabled=false;}
  });
  document.getElementById('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;document.querySelectorAll('.category').forEach(x=>x.classList.toggle('active',x===b));render(b.dataset.category==='Alle'?products:products.filter(p=>p.category===b.dataset.category));});
  async function loadProducts(){if(!client)return;try{const {data,error}=await client.from('products').select('id,name,description,price,category,image_url').eq('active',true).order('sort_order').order('created_at',{ascending:false});if(error)throw error;products=data||[];render();}catch(err){console.error('Produktkatalog konnte nicht geladen werden:',err.message);}}
  if(client)loadProducts();
  window.HofShop={supabaseReady,refresh:loadProducts};
})();

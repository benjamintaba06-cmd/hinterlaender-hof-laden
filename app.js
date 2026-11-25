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
  checkoutForm.addEventListener('submit',async e=>{
    e.preventDefault();
    const status=document.getElementById('checkout-status');
    if(!client){status.textContent='Der Shop ist momentan nicht erreichbar. Bitte später erneut versuchen.';return;}
    if(cart.length!==1||cart[0].name!=='TABA-Einladungscode'||cart[0].qty!==1){status.textContent='Der Online-Checkout ist aktuell nur für einen TABA-Einladungscode verfügbar.';return;}
    const button=checkoutForm.querySelector('button[type="submit"]');button.disabled=true;status.textContent='Sichere Verbindung zu SumUp wird hergestellt …';
    try{
      const fd=new FormData(checkoutForm);
      const {data,error}=await client.functions.invoke('create-sumup-checkout',{body:{name:String(fd.get('name')||''),email:String(fd.get('email')||''),quantity:1}});
      if(error||!data?.checkout_url)throw new Error(data?.error||error?.message||'Checkout konnte nicht gestartet werden.');
      status.textContent='Du wirst sicher zu SumUp weitergeleitet …';
      window.location.assign(data.checkout_url);
    }catch(err){status.textContent=err.message||'Checkout fehlgeschlagen.';button.disabled=false;}
  });
  document.getElementById('categories').addEventListener('click',e=>{const b=e.target.closest('[data-category]');if(!b)return;document.querySelectorAll('.category').forEach(x=>x.classList.toggle('active',x===b));render(b.dataset.category==='Alle'?products:products.filter(p=>p.category===b.dataset.category));});
  async function loadProducts(){if(!client)return;try{const {data,error}=await client.from('products').select('id,name,description,price,category,image_url').eq('active',true).order('sort_order').order('created_at',{ascending:false});if(error)throw error;products=data||[];render();}catch(err){console.error('Produktkatalog konnte nicht geladen werden:',err.message);}}
  if(client)loadProducts();
  window.HofShop={supabaseReady,refresh:loadProducts};
})();

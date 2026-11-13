const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const peso=n=>'₱'+Number(n).toLocaleString('en-PH',{maximumFractionDigits:2});
const store={get(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
let cart=[],cat='All',type='Dine-in',pay='Cash',query='';
const today=()=>new Date().toISOString().slice(0,10);
const sales=()=>store.get('drip_sales',[]);
const nextNo=()=>sales().filter(s=>s.date===today()).length+1;
const total=()=>cart.reduce((a,l)=>a+l.p*l.q,0);
const esc=s=>String(s).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));

function renderChips(){
  $('#chips').innerHTML=['All',...MENU.map(m=>m.c)].map(c=>`<button class="chip ${c===cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
}
function renderItems(){
  const q=query.toLowerCase();let list=[];
  MENU.forEach(m=>{if(cat==='All'||m.c===cat)m.i.forEach(i=>{if(!q||i.n.toLowerCase().includes(q))list.push(i)})});
  $('#items').innerHTML=list.map(i=>`<button class="item" data-n="${esc(i.n)}"><b>${esc(i.n)}</b><span>${i.p.length>1?peso(i.p[0])+' / '+peso(i.p[1]):peso(i.p[0])}</span></button>`).join('')||'<p class="empty">'+(MENU.length?'No items found.':'No menu yet. Add items in menu.js.')+'</p>';
}
function find(n){for(const m of MENU){const i=m.i.find(x=>x.n===n);if(i)return i}}
function add(n,size,p){
  const k=n+'|'+size,l=cart.find(x=>x.k===k);
  l?l.q++:cart.push({k,n,size,p,q:1});renderCart();
}
function renderCart(){
  $('#orderNo').textContent='#'+nextNo();
  $('#lines').innerHTML=cart.length?cart.map((l,i)=>`<div class="line"><div><b>${esc(l.n)}</b> <small>${l.size||''}</small></div><small>${peso(l.p)}</small>
  <div class="qty"><button data-d="-1" data-i="${i}">−</button><b>${l.q}</b><button data-d="1" data-i="${i}">+</button><span class="lt">${peso(l.p*l.q)}</span></div></div>`).join(''):'<p class="empty">Tap an item to start an order.</p>';
  $('#total').textContent=peso(total());
  $('#cashBox').style.display=pay==='Cash'?'block':'none';
  const t=total(),c=parseFloat($('#cash').value)||0;
  $('#change').textContent=peso(Math.max(0,c-t));
  $('#btnCharge').disabled=!cart.length||(pay==='Cash'&&c<t);
  const q=[t,...[20,50,100,200,500,1000].filter(v=>v>=t&&v!==t)].slice(0,5);
  $('#quick').innerHTML=t?q.map(v=>`<button data-q="${v}">${peso(v)}</button>`).join(''):'';
}
function charge(){
  const t=total(),c=pay==='Cash'?(parseFloat($('#cash').value)||0):t;
  const d=new Date(),sale={no:nextNo(),date:today(),time:d.toLocaleTimeString('en-PH',{hour:'2-digit',minute:'2-digit'}),type,pay,items:cart.map(({n,size,p,q})=>({n,size,p,q})),total:t,paid:c,change:Math.max(0,c-t)};
  const all=sales();all.push(sale);store.set('drip_sales',all);
  $('#receipt').innerHTML=`<h3>Drip Coffee</h3><p>Diversion Road, Dumaguete City</p><p>Order #${sale.no} · ${sale.date} ${sale.time}</p><p>${sale.type} · ${sale.pay}</p><hr>`+
   sale.items.map(i=>`<div class="r"><span>${i.q} × ${esc(i.n)} ${i.size||''}</span><span>${peso(i.p*i.q)}</span></div>`).join('')+
   `<hr><div class="r"><b>Total</b><b>${peso(sale.total)}</b></div>`+(sale.pay==='Cash'?`<div class="r"><span>Cash</span><span>${peso(sale.paid)}</span></div><div class="r"><span>Change</span><span>${peso(sale.change)}</span></div>`:'')+`<hr><p>Thank you!</p>`;
  $('#dReceipt').showModal();cart=[];$('#cash').value='';renderCart();
}
function report(){
  const day=sales().filter(s=>s.date===today()),sum=a=>a.reduce((x,s)=>x+s.total,0),by={},pays={};
  day.forEach(s=>{pays[s.pay]=(pays[s.pay]||0)+s.total;s.items.forEach(i=>{const k=i.n+(i.size?' '+i.size:'');by[k]=(by[k]||[0,0]);by[k][0]+=i.q;by[k][1]+=i.p*i.q})});
  const rows=Object.entries(by).sort((a,b)=>b[1][1]-a[1][1]);
  $('#report').innerHTML=`<h3>Today · ${today()}</h3><div class="stat"><div><b>${day.length}</b>Orders</div><div><b>${peso(sum(day))}</b>Sales</div><div><b>${day.length?peso(sum(day)/day.length):'₱0'}</b>Avg order</div></div>
  <p>${Object.entries(pays).map(([k,v])=>`${k}: <b>${peso(v)}</b>`).join(' · ')||'No sales yet.'}</p>
  <table><tr><th>Item</th><th>Qty</th><th>Sales</th></tr>${rows.map(([k,v])=>`<tr><td>${esc(k)}</td><td>${v[0]}</td><td>${peso(v[1])}</td></tr>`).join('')}</table>`;
  $('#dReport').showModal();
}
function csv(){
  const r=[['Order','Date','Time','Type','Payment','Item','Size','Qty','Price','Line total']];
  sales().forEach(s=>s.items.forEach(i=>r.push([s.no,s.date,s.time,s.type,s.pay,i.n,i.size||'',i.q,i.p,i.p*i.q])));
  const b=new Blob([r.map(x=>x.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')],{type:'text/csv'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='drip-coffee-sales.csv';a.click();
}
document.addEventListener('click',e=>{
  const t=e.target.closest('button');if(!t)return;
  if(t.dataset.c){cat=t.dataset.c;renderChips();renderItems()}
  else if(t.dataset.n){const i=find(t.dataset.n);if(i.p.length===1)add(i.n,'',i.p[0]);else{$('#sizeName').textContent=i.n;$('#sizeBtns').innerHTML=(i.z||['16oz','22oz']).map((s,k)=>`<button data-s="${s}" data-p="${i.p[k]}" data-n2="${esc(i.n)}">${s}<br>${peso(i.p[k])}</button>`).join('');$('#dSize').showModal()}}
  else if(t.dataset.s){add(t.dataset.n2,t.dataset.s,+t.dataset.p);$('#dSize').close()}
  else if(t.dataset.d){const l=cart[+t.dataset.i];l.q+=+t.dataset.d;if(l.q<1)cart.splice(+t.dataset.i,1);renderCart()}
  else if(t.dataset.q){$('#cash').value=t.dataset.q;renderCart()}
  else if(t.hasAttribute('data-close'))t.closest('dialog').close();
});
$$('#type button').forEach(b=>b.onclick=()=>{type=b.textContent;$$('#type button').forEach(x=>x.classList.toggle('on',x===b))});
$$('#pay button').forEach(b=>b.onclick=()=>{pay=b.textContent;$$('#pay button').forEach(x=>x.classList.toggle('on',x===b));renderCart()});
$('#search').oninput=e=>{query=e.target.value;renderItems()};
$('#cash').oninput=renderCart;
$('#btnClear').onclick=()=>{cart=[];$('#cash').value='';renderCart()};
$('#btnCharge').onclick=charge;
$('#btnPrint').onclick=()=>window.print();
$('#btnReport').onclick=report;
$('#btnCsv').onclick=csv;
$('#btnWipe').onclick=()=>{if(confirm('Delete ALL saved sales on this device? This cannot be undone.')){store.set('drip_sales',[]);$('#dReport').close();renderCart()}};
renderChips();renderItems();renderCart();

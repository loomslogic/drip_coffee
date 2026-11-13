(function(){
  var M=(typeof MENU!=='undefined'&&MENU)||[],root=document.getElementById('menuRoot'),chips=document.getElementById('chips');
  var ONLY_PHOTOS=true; /* true = website shows only items that have a photo. Set to false to show the full menu. */
  if(ONLY_PHOTOS){M=M.map(function(m){return {c:m.c,i:m.i.filter(function(i){return i.img})}}).filter(function(m){return m.i.length})}
  var peso=function(n){return '₱'+Number(n).toLocaleString('en-PH')};
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  if(!M.length){
    root.innerHTML='<p class="empty">Our menu is coming soon.</p>';chips.style.display='none';
  }else{
    if(M.length<2)chips.style.display='none';
    chips.innerHTML='<button class="chip on" data-c="all">All</button>'+M.map(function(m,k){return '<button class="chip" data-c="'+k+'">'+esc(m.c)+'</button>'}).join('');
    root.innerHTML=M.map(function(m,k){
      return '<div class="group" data-c="'+k+'"><h3>'+esc(m.c)+'</h3><div class="grid">'+m.i.map(function(i){
        var z=i.z||['16oz','22oz'];
        var pr=i.p.length>1?'<em>'+esc(z[0])+'</em> '+peso(i.p[0])+'<br><em>'+esc(z[1])+'</em> '+peso(i.p[1]):peso(i.p[0]);
        return '<div class="card reveal pcard">'+(i.img?'<img class="pimg" src="'+esc(i.img)+'" alt="'+esc(i.n)+'" loading="lazy">':'')+'<span class="pname">'+esc(i.n)+'</span>'+(i.d?'<span class="pdesc">'+esc(i.d)+'</span>':'')+'<span class="sizes">'+pr+'</span></div>';
      }).join('')+'</div></div>';
    }).join('');
    chips.addEventListener('click',function(e){
      var b=e.target.closest('.chip');if(!b)return;
      [].forEach.call(chips.children,function(x){x.classList.toggle('on',x===b)});
      [].forEach.call(root.querySelectorAll('.group'),function(g){g.style.display=(b.dataset.c==='all'||g.dataset.c===b.dataset.c)?'':'none'});
      [].forEach.call(root.querySelectorAll('.reveal'),function(x){x.classList.add('in')});
    });
  }
  var els=document.querySelectorAll('.reveal');
  if(!('IntersectionObserver' in window)){[].forEach.call(els,function(e){e.classList.add('in')});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){
    if(en.isIntersecting){
      var i=[].indexOf.call(en.target.parentNode.children,en.target);
      en.target.style.transitionDelay=(i%4)*90+'ms';en.target.classList.add('in');
      setTimeout(function(t){t.style.transitionDelay='0ms'},900,en.target);io.unobserve(en.target);
    }});},{threshold:.15});
  [].forEach.call(els,function(e){io.observe(e)});
})();

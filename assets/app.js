(function(){
  var root=document.documentElement, base=document.body.getAttribute('data-base')||'./';
  // tema
    var tb=document.getElementById('theme');
  if(tb) tb.onclick=function(){var d=(root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))==='dark'?'light':'dark';root.setAttribute('data-theme',d);localStorage.setItem('yks-ebook:theme',d);};
  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.textContent=h;return e;}
  function getP(id){try{return JSON.parse(localStorage.getItem('yks-ebook:progress:'+id))||{};}catch(e){return {};}}
  function setP(id,o){localStorage.setItem('yks-ebook:progress:'+id,JSON.stringify(o));}
  function pct(p){return p.done?100:(p.read?50:0);}

  // ANA SAYFA / DERS
  var list=document.getElementById('courses');
  if(list){fetch(base+'content/index.json').then(function(r){return r.json();}).then(function(ix){
    var only=document.body.getAttribute('data-course');if(only)ix.courses=ix.courses.filter(function(c){return c.id===only;});
    var q=document.getElementById('q');
    function render(){var s=(q&&q.value||'').trim().toLocaleLowerCase('tr-TR');list.innerHTML='';
      var tot=0,dn=0,rd=0;ix.courses.forEach(function(c){c.units.forEach(function(u){u.topics.forEach(function(t){var p=getP(t.id);tot++;if(p.done)dn++;if(p.read)rd++;});});});
      var S=function(i,v){var e=document.getElementById(i);if(e)e.textContent=v;};S('stTopics',tot);S('stDone',dn);S('stRead',rd);
      ix.courses.forEach(function(c){var card=el('section','card course');var all=[];c.units.forEach(function(u){all=all.concat(u.topics);});
        var avg=all.length?Math.round(all.reduce(function(a,t){return a+pct(getP(t.id));},0)/all.length):0;
        var hd=el('div','chead');var ring=el('div','ring');ring.style.setProperty('--p',avg);ring.appendChild(el('span',null,avg+'%'));hd.appendChild(ring);
        var tw=el('div');var h=el('h2');var a=el('a',null,c.title);a.href=base+c.href;h.appendChild(a);tw.appendChild(h);tw.appendChild(el('div','meta',c.units.length+' ünite · '+all.length+' konu hazır'));hd.appendChild(tw);card.appendChild(hd);var any=false;
        c.units.forEach(function(u){var ts=u.topics.filter(function(t){return !s||(t.title+' '+(t.keywords||[]).join(' ')).toLocaleLowerCase('tr-TR').indexOf(s)>=0;});if(!ts.length)return;any=true;
          card.appendChild(el('div','unit',u.title));
          ts.forEach(function(t){var p=getP(t.id),v=pct(p);var r=el('a','topic'+(t.pilot?' pilot':''));r.href=base+t.href;r.appendChild(el('span',null,t.title));if(t.pilot)r.appendChild(el('span','chip amber','Pilot'));var pr=el('span','prog');var i=el('i');i.style.width=v+'%';pr.appendChild(i);r.appendChild(pr);r.appendChild(el('span','small',p.done?'tamam':p.read?'okundu':'başlanmadı'));card.appendChild(r);});});
        if(!any){var em=el('div','empty');em.appendChild(el('span',null,'?'));em.appendChild(el('p',null,'“'+q.value+'” için eşleşen konu yok. Başka bir kelime dene.'));card.appendChild(em);}list.appendChild(card);});}
    if(q)q.oninput=render;render();
    var cs=document.getElementById('soon');if(cs)(ix.comingSoon||[]).forEach(function(n){cs.appendChild(el('li',null,n));});
  });}

  // okuma çubuğu
  var rb=document.getElementById('readbar');if(rb){var upd=function(){var h=document.documentElement;var m=h.scrollHeight-h.clientHeight;rb.style.width=(m>0?h.scrollTop/m*100:0)+'%';};addEventListener('scroll',upd,{passive:true});upd();}
  // şablon sayfası TOC vurgusu (veri yok)
  if(!document.body.getAttribute('data-topic')){var tl=[].slice.call(document.querySelectorAll('.toc a'));if(tl.length&&'IntersectionObserver' in window){var io0=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)tl.forEach(function(a){var on=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('on',on);if(on&&a.scrollIntoView&&innerWidth<=880)a.parentNode.scrollTo({left:a.offsetLeft-20,behavior:'smooth'});});});},{rootMargin:'-20% 0px -70% 0px'});tl.forEach(function(a){var t=document.getElementById(a.getAttribute('href').slice(1));if(t)io0.observe(t);});}}

  // --- küçük güvenli markdown ---
  function esc(t){return t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function tagChips(h){return h.replace(/\s*\[((?:TYT|AYT)[^\]]*)\]/g,function(m,t){return ' <span class="chip tag'+(/^AYT/.test(t)?' ayt':'')+'">'+t+'</span>';});}
  function inl(t,dir){t=esc(t);
    t=t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,function(m,a,u){return /^(https?:|\/|javascript)/i.test(u)?'':'<figure class="mdfig"><img loading="lazy" decoding="async" src="'+dir+u+'" alt="'+a+'"><figcaption>'+a+'</figcaption></figure>';});
    t=t.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
    t=t.replace(/(^|[\s(,;])(https?:\/\/[^\s<)]+[^\s<).,;])/g,'$1<a class="url" href="$2" target="_blank" rel="noopener">$2</a>');
    t=t.replace(/`([^`]+)`/g,'<code>$1</code>').replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/(^|[\s(])\*([^*\s][^*]*)\*/g,'$1<em>$2</em>');
    return tagChips(t);}
  function md(src,dir){var L=src.replace(/\r/g,'').split('\n'),o=[],i=0,heads=[],used={};
    function slug(t){var b='md-'+t.toLocaleLowerCase('tr-TR').replace(/\[[^\]]*\]/g,'').replace(/[^a-z0-9çğıöşü]+/g,'-').replace(/^-|-$/g,'').slice(0,48),k=b,n=2;while(used[k])k=b+'-'+n++;used[k]=1;return k;}
    while(i<L.length){var l=L[i];
      if(!l.trim()){i++;continue;}
      var h=l.match(/^(#{1,4})\s+(.*)$/);if(h){var lv=h[1].length,id=slug(h[2]);heads.push({lv:lv,id:id,text:h[2].replace(/\s*\[[^\]]*\]/g,'')});o.push('<h'+Math.min(lv+1,5)+' id="'+id+'" class="mdh">'+inl(h[2],dir)+'</h'+Math.min(lv+1,5)+'>');i++;continue;}
      if(/^\|/.test(l)){var rows=[];while(i<L.length&&/^\|/.test(L[i]))rows.push(L[i++]);var cells=function(r){return r.replace(/^\||\|$/g,'').split('|').map(function(c){return c.trim();});};
        var hd=cells(rows[0]),body=rows.slice(/^\|[\s:|-]+\|$/.test(rows[1]||'')?2:1);
        o.push('<div class="tblwrap"><table><thead><tr>'+hd.map(function(c){return '<th>'+inl(c,dir)+'</th>';}).join('')+'</tr></thead><tbody>'+body.map(function(r){return '<tr>'+cells(r).map(function(c){return '<td>'+inl(c,dir)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table></div>');continue;}
      if(/^>/.test(l)){var q=[];while(i<L.length&&/^>/.test(L[i]))q.push(L[i++].replace(/^>\s?/,''));o.push('<blockquote>'+q.join('\n').split(/\n\s*\n/).map(function(p){return '<p>'+inl(p.trim(),dir).replace(/\n/g,'<br>')+'</p>';}).join('')+'</blockquote>');continue;}
      if(/^\s*([-*]|\d+\.)\s/.test(l)){var stack=[],html='';
        while(i<L.length&&/^\s*([-*]|\d+\.)\s/.test(L[i])){var m=L[i].match(/^(\s*)([-*]|\d+\.)\s+(.*)$/),d=Math.floor(m[1].length/2),tg=/\d/.test(m[2])?'ol':'ul';
          while(stack.length>d+1)html+='</li></'+stack.pop()+'>';
          if(stack.length<d+1){stack.push(tg);html+='<'+tg+'><li>';}else html+='</li><li>';
          html+=inl(m[3],dir);i++;}
        while(stack.length)html+='</li></'+stack.pop()+'>';o.push(html);continue;}
      var para=[];while(i<L.length&&L[i].trim()&&!/^(#{1,4}\s|\||>|\s*([-*]|\d+\.)\s)/.test(L[i]))para.push(L[i++]);
      var ph=para.map(function(x){return inl(x,dir);}).join('<br>');o.push(/^<figure[^]*<\/figure>$/.test(ph)?ph:'<p>'+ph+'</p>');}
    return {html:o.join('\n'),heads:heads};}
  // --- şema normalize: eski (topicId/sections/…) ve Konu Anlatıcı (id/hedefler/slaytlar/…) ---
  function norm(d,tp){if(d.topicId)return d;var dir=tp.replace(/[^\/]*$/,''),k=d.kapsam||{};
    return {topicId:d.id,title:d.konu||d.id,course:d.ders||'',unit:d.unite||'',breadcrumb:['Ana sayfa',d.ders,d.unite,d.konu].filter(Boolean),
      duration:d.sureDk?'~'+d.sureDk+' dk':null,chips:Object.keys(k),scope:k,goals:d.hedefler||[],goalText:'',sections:[],
      images:(d.gorseller||[]).map(function(g){return dir+g;}),slides:d.slaytlar||[],
      video:{src:null,placeholder:'Video henüz hazır değil. Senaryo taslağı:',steps:d.videoSenaryo||[]},
      ooc:d.mufredatDisi||[],questions:d.sorular||[],officialNotes:d.officialNotes||[],
      related:(d.ilgili||[]).map(function(r){return typeof r==='string'?{title:r}:r;})};}
  // KONU SAYFASI
  var tp=document.body.getAttribute('data-topic');
  if(!tp)return;
  var mdp=document.body.getAttribute('data-md');
  Promise.all([fetch(base+tp).then(function(r){return r.json();}),mdp?fetch(base+mdp).then(function(r){return r.ok?r.text():'';}).catch(function(){return '';}):Promise.resolve('')]).then(function(res){
    var d=norm(res[0],tp),mdsrc=res[1];
    var $=function(i){return document.getElementById(i);};
    document.title=d.title+(d.course?' · '+d.course:'')+' · YKS E-Kitap';
    $('crumb').textContent=d.breadcrumb.join(' › ');$('title').textContent=d.title;
    var ch=$('chips');[d.duration].concat(d.chips||[]).filter(Boolean).forEach(function(c,i){ch.appendChild(el('span','chip'+(c==='Pilot'?' amber':''),c));});
    var gl=d.goals||[];if(gl.some(function(g){return g.length>40;})){var gol=el('ol','goals');gl.forEach(function(g){gol.appendChild(el('li',null,g));});$('goals').replaceWith(gol);}else gl.forEach(function(g){$('goals').appendChild(el('span','chip',g));});
    if(d.scope){var sc=el('dl','scope');Object.keys(d.scope).forEach(function(k){sc.appendChild(el('dt',null,k));sc.appendChild(el('dd',null,d.scope[k]));});$('goalText').replaceWith(sc);}else $('goalText').textContent=d.goalText||'';
    (d.sections||[]).forEach(function(s){$('lesson').appendChild(el('h3',null,s.title));$('lesson').appendChild(el('p',null,s.body));});
    if(mdsrc){var mdir=base+mdp.replace(/[^\/]*$/,''),parts=mdsrc.split(/\n(?=## )/),extra={};
      var main=parts.filter(function(p){if(/^## \d+\.\s*Müfredat dışı/i.test(p)){extra.disi=p;return false;}if(/^## \d+\.\s*Örnek sorular/i.test(p)){extra.soru=p;return false;}return true;}).join('\n');
      var r=md(main.replace(/^# .*\n/,''),mdir),ls=$('lesson');ls.classList.add('md');ls.innerHTML=r.html;
      var toc=document.querySelector('.toc a[href="#anlatim"]');if(toc){var after=toc;r.heads.filter(function(h){return h.lv===2;}).forEach(function(h){var a=el('a','sub',h.text.replace(/^\d+\.\s*/,''));a.href='#'+h.id;after.after(a);after=a;});}
      [['disi','Kaynak metindeki tam açıklama'],['soru','Kaynak metindeki tam çözümler']].forEach(function(x){if(!extra[x[0]])return;var de=el('details','mdmore');de.appendChild(el('summary',null,x[1]));var dv=el('div','md');dv.innerHTML=md(extra[x[0]].replace(/^## .*\n/,''),mdir).html;de.appendChild(dv);$(x[0]==='disi'?'disi':'soru').appendChild(de);});}
    var dg=$('diagram'),cols=['--blue','--amber'];
    if(d.images&&d.images.length){var alts={};(mdsrc||'').replace(/!\[([^\]]*)\]\(([^)]+)\)/g,function(m,a,u){alts[u.split('/').pop()]=a;});var fg=el('div','figs');d.images.forEach(function(u){var f=el('figure'),im=el('img'),n=u.split('/').pop(),a=alts[n]||n.replace(/\.\w+$/,'').replace(/-/g,' ');im.loading='lazy';im.decoding='async';im.src=base+u;im.alt=a;var ln=el('a');ln.href=base+u;ln.target='_blank';ln.appendChild(im);f.appendChild(ln);f.appendChild(el('figcaption',null,a));fg.appendChild(f);});dg.appendChild(fg);}
    if(d.diagram){
    d.diagram.workers.forEach(function(w,i){var l=el('div','ui',w.label);l.style.fontWeight='700';l.style.color='var('+cols[i]+')';dg.appendChild(l);var b=el('div','bars');b.style.setProperty('--c','var('+cols[i]+')');for(var j=0;j<w.n;j++)b.appendChild(el('span',null,w.cell));dg.appendChild(b);});
    dg.appendChild(el('div','note-box',d.diagram.together));dg.appendChild(el('h3',null,d.diagram.inverseTitle));
    d.diagram.inverse.forEach(function(r,i){dg.appendChild(el('div','small',r[0]+': hız '+r[1]+' → '+r[2]+' gün'));var t=el('div','thin');var c=i===1?'--amber':'--blue';for(var j=0;j<12;j++){var s=el('span');s.style.background=Math.floor(j/r[1])%2===0?'var('+c+')':'color-mix(in oklab,var('+c+') 35%,transparent)';t.appendChild(s);}dg.appendChild(t);});
    dg.appendChild(el('div','small',d.diagram.inverseNote));}
    if(!dg.children.length)dg.appendChild(el('p','small','Bu konu için şema henüz eklenmedi.'));
    var cur=0,dots=$('dots');function show(){$('slideT').textContent=d.slides[cur].title;$('slideB').textContent=d.slides[cur].body;$('slidePg').textContent=(cur+1)+' / '+d.slides.length;[].forEach.call(dots.children,function(b,i){b.classList.toggle('on',i===cur);});}
    d.slides.forEach(function(s,i){var b=el('button','btn dot',String(i+1));b.onclick=function(){cur=i;show();};dots.appendChild(b);});
    $('prev').onclick=function(){cur=Math.max(0,cur-1);show();};$('next').onclick=function(){cur=Math.min(d.slides.length-1,cur+1);show();};show();
    var vd=d.video||{};if(vd.src){var v=el('video');v.controls=true;v.src=base+vd.src;v.style.width='100%';$('vbox').replaceWith(v);}else $('vbox').textContent=vd.placeholder||'Video henüz hazır değil.';
    if(vd.steps&&vd.steps.length){var vo=el('ol','vsteps');vd.steps.forEach(function(x){vo.appendChild(el('li',null,x));});$('videoScript').replaceWith(vo);}else $('videoScript').textContent=vd.script||'';
    if(d.outOfCurriculum){$('oocChip').textContent=d.outOfCurriculum.chip;$('ooc').textContent=d.outOfCurriculum.body;}
    else if(d.ooc&&d.ooc.length){$('oocChip').textContent=d.ooc.length+' madde · YKS kapsamı dışında';var ul=el('ul','ooclist');d.ooc.forEach(function(m){var li=el('li');li.appendChild(el('span',null,m.metin));if(m.ihtimal)li.appendChild(el('span','chip amber prob','Çıkma ihtimali: '+m.ihtimal));ul.appendChild(li);});$('ooc').replaceWith(ul);}
    (d.questions||[]).forEach(function(q){var de=el('details');var sm=el('summary');if(q.seviye)sm.appendChild(el('span','chip tag'+(/^AYT/.test(q.seviye)?' ayt':''),q.seviye));sm.appendChild(document.createTextNode(q.q));de.appendChild(sm);var ol=el('ol');(q.steps||[]).forEach(function(s){ol.appendChild(el('li',null,s));});de.appendChild(ol);var a=el('p','ui','Cevap: '+q.ans);a.style.fontWeight='700';a.style.color='var(--blue)';de.appendChild(a);$('questions').appendChild(de);});
    var on=$('official');if(d.officialNotes&&d.officialNotes.length)d.officialNotes.forEach(function(n){on.appendChild(el('p',null,n));});else on.appendChild(el('p','small','Konu Anlatıcı\'ya yazdığın notlar buraya eklenir (ayrı katman). Şu an boş.'));
    (d.related||[]).forEach(function(r){var a=el(r.href?'a':'span','chip',r.title);if(r.href)a.href=r.href;$('related').appendChild(a);});

    // NOTLAR
    var KEY='yks-ebook:notes:'+d.topicId,ta=$('note'),st=$('saved'),tm;
    function stamp(iso){st.textContent=iso?'Son kayıt: '+new Date(iso).toLocaleString('tr-TR',{dateStyle:'short',timeStyle:'medium'}):'Henüz kayıt yok';}
    try{var o=JSON.parse(localStorage.getItem(KEY));if(o){ta.value=o.text||'';stamp(o.updatedAt);}else stamp();}catch(e){stamp();}
    function save(){var o={topicId:d.topicId,text:ta.value,updatedAt:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(o));stamp(o.updatedAt);}catch(e){st.textContent='Kaydedilemedi: tarayıcı depolaması kapalı.';}}
    ta.oninput=function(){clearTimeout(tm);tm=setTimeout(save,600);};
    $('exp').onclick=function(){save();var b=new Blob([localStorage.getItem(KEY)],{type:'application/json'});var a=el('a');a.href=URL.createObjectURL(b);a.download=d.topicId+'-not.json';a.click();URL.revokeObjectURL(a.href);};
    $('impf').onchange=function(e){var f=e.target.files[0];if(!f)return;f.text().then(function(t){try{var o=JSON.parse(t);if(typeof o.text!=='string')throw 0;ta.value=o.text;save();}catch(x){st.textContent='Geçersiz JSON dosyası.';}});e.target.value='';};
    $('imp').onclick=function(){$('impf').click();};

    // İLERLEME
    var p=getP(d.topicId);if(!p.read){p.read=true;setP(d.topicId,p);}
    var dn=$('done');function dl(){dn.textContent=p.done?'Tamamlandı (geri al)':'Konuyu tamamladım';}dl();
    dn.onclick=function(){p.done=!p.done;setP(d.topicId,p);dl();};

    // TOC vurgusu
    var links=[].slice.call(document.querySelectorAll('.toc a'));
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)links.forEach(function(a){var on=a.getAttribute('href')==='#'+e.target.id;a.classList.toggle('on',on);if(on&&innerWidth<=880)a.parentNode.scrollTo({left:a.offsetLeft-20,behavior:'smooth'});});});},{rootMargin:'-20% 0px -70% 0px'});links.forEach(function(a){var t=document.getElementById(a.getAttribute('href').slice(1));if(t)io.observe(t);});}
  });
})();

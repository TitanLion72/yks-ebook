(function(){
  var root=document.documentElement, base=document.body.getAttribute('data-base')||'./';
  // tema
  var saved=localStorage.getItem('yks-ebook:theme'); if(saved) root.setAttribute('data-theme',saved);
  var tb=document.getElementById('theme');
  if(tb) tb.onclick=function(){var d=(root.getAttribute('data-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'))==='dark'?'light':'dark';root.setAttribute('data-theme',d);localStorage.setItem('yks-ebook:theme',d);};
  function el(t,c,h){var e=document.createElement(t);if(c)e.className=c;if(h!=null)e.textContent=h;return e;}
  function getP(id){try{return JSON.parse(localStorage.getItem('yks-ebook:progress:'+id))||{};}catch(e){return {};}}
  function setP(id,o){localStorage.setItem('yks-ebook:progress:'+id,JSON.stringify(o));}
  function pct(p){return p.done?100:(p.read?50:0);}

  // ANA SAYFA / DERS
  var list=document.getElementById('courses');
  if(list){fetch(base+'content/index.json').then(function(r){return r.json();}).then(function(ix){
    var q=document.getElementById('q');
    function render(){var s=(q&&q.value||'').trim().toLocaleLowerCase('tr-TR');list.innerHTML='';
      ix.courses.forEach(function(c){var card=el('section','card');var h=el('h2');var a=el('a',null,c.title);a.href=base+c.href;h.appendChild(a);h.appendChild(document.createTextNode(' '));h.appendChild(el('span','chip','Ders'));card.appendChild(h);var any=false;
        c.units.forEach(function(u){var ts=u.topics.filter(function(t){return !s||(t.title+' '+(t.keywords||[]).join(' ')).toLocaleLowerCase('tr-TR').indexOf(s)>=0;});if(!ts.length)return;any=true;
          card.appendChild(el('div','meta','Ünite: '+u.title));
          ts.forEach(function(t){var p=getP(t.id),v=pct(p);var r=el('a','topic'+(t.pilot?' pilot':''));r.href=base+t.href;r.appendChild(el('span',null,t.title));if(t.pilot)r.appendChild(el('span','chip amber','Pilot'));var pr=el('span','prog');var i=el('i');i.style.width=v+'%';pr.appendChild(i);r.appendChild(pr);r.appendChild(el('span','small',p.done?'tamam':p.read?'okundu':'başlanmadı'));card.appendChild(r);});});
        if(!any)card.appendChild(el('p','small','Eşleşen konu yok.'));list.appendChild(card);});}
    if(q)q.oninput=render;render();
    var cs=document.getElementById('soon');if(cs)ix.comingSoon.forEach(function(n){cs.appendChild(el('li',null,n));});
  });}

  // KONU SAYFASI
  var tp=document.body.getAttribute('data-topic');
  if(!tp)return;
  fetch(base+tp).then(function(r){return r.json();}).then(function(d){
    var $=function(i){return document.getElementById(i);};
    document.title=d.title+' · '+d.course+' · YKS E-Kitap';
    $('crumb').textContent=d.breadcrumb.join(' › ');$('title').textContent=d.title;
    var ch=$('chips');[d.duration].concat(d.chips).forEach(function(c,i){ch.appendChild(el('span','chip'+(c==='Pilot'?' amber':''),c));});
    d.goals.forEach(function(g){$('goals').appendChild(el('span','chip',g));});$('goalText').textContent=d.goalText;
    d.sections.forEach(function(s){$('lesson').appendChild(el('h3',null,s.title));$('lesson').appendChild(el('p',null,s.body));});
    var dg=$('diagram'),cols=['--blue','--amber'];
    d.diagram.workers.forEach(function(w,i){var l=el('div','ui',w.label);l.style.fontWeight='700';l.style.color='var('+cols[i]+')';dg.appendChild(l);var b=el('div','bars');b.style.setProperty('--c','var('+cols[i]+')');for(var j=0;j<w.n;j++)b.appendChild(el('span',null,w.cell));dg.appendChild(b);});
    dg.appendChild(el('div','note-box',d.diagram.together));dg.appendChild(el('h3',null,d.diagram.inverseTitle));
    d.diagram.inverse.forEach(function(r,i){dg.appendChild(el('div','small',r[0]+': hız '+r[1]+' → '+r[2]+' gün'));var t=el('div','thin');var c=i===1?'--amber':'--blue';for(var j=0;j<12;j++){var s=el('span');s.style.background=Math.floor(j/r[1])%2===0?'var('+c+')':'color-mix(in oklab,var('+c+') 35%,transparent)';t.appendChild(s);}dg.appendChild(t);});
    dg.appendChild(el('div','small',d.diagram.inverseNote));
    var cur=0,dots=$('dots');function show(){$('slideT').textContent=d.slides[cur].title;$('slideB').textContent=d.slides[cur].body;[].forEach.call(dots.children,function(b,i){b.classList.toggle('on',i===cur);});}
    d.slides.forEach(function(s,i){var b=el('button','btn dot',String(i+1));b.onclick=function(){cur=i;show();};dots.appendChild(b);});
    $('prev').onclick=function(){cur=Math.max(0,cur-1);show();};$('next').onclick=function(){cur=Math.min(d.slides.length-1,cur+1);show();};show();
    if(d.video.src){var v=el('video');v.controls=true;v.src=base+d.video.src;v.style.width='100%';$('vbox').replaceWith(v);}else $('vbox').textContent=d.video.placeholder;
    $('videoScript').textContent=d.video.script;
    $('oocChip').textContent=d.outOfCurriculum.chip;$('ooc').textContent=d.outOfCurriculum.body;
    d.questions.forEach(function(q){var de=el('details');de.appendChild(el('summary',null,q.q));var ol=el('ol');q.steps.forEach(function(s){ol.appendChild(el('li',null,s));});de.appendChild(ol);var a=el('p','ui','Cevap: '+q.ans);a.style.fontWeight='700';a.style.color='var(--blue)';de.appendChild(a);$('questions').appendChild(de);});
    var on=$('official');if(d.officialNotes&&d.officialNotes.length)d.officialNotes.forEach(function(n){on.appendChild(el('p',null,n));});else on.appendChild(el('p','small','Konu Anlatıcı\'ya yazdığın notlar buraya eklenir (ayrı katman). Şu an boş.'));
    d.related.forEach(function(r){var a=el('a','chip',r.title);a.href=r.href;$('related').appendChild(a);});

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
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)links.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+e.target.id);});});},{rootMargin:'-20% 0px -70% 0px'});links.forEach(function(a){var t=document.getElementById(a.getAttribute('href').slice(1));if(t)io.observe(t);});}
  });
})();

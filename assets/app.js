/* ТекстЛаб — общий скрипт для всех страниц */
(function(){
  // Тема
  var root=document.documentElement;
  var saved=localStorage.getItem('theme');
  var init=saved||(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
  function applyTheme(t){
    root.setAttribute('data-theme',t);
    var b=document.getElementById('themeToggle'); if(b) b.textContent=(t==='light'?'☀️':'🌙');
    var m=document.querySelector('meta[name=theme-color]'); if(m) m.setAttribute('content',t==='light'?'#f5f6fb':'#0c0e16');
  }
  applyTheme(init);
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('#themeToggle');
    if(b){var t=root.getAttribute('data-theme')==='light'?'dark':'light';localStorage.setItem('theme',t);applyTheme(t);}
  });

  document.addEventListener('DOMContentLoaded',function(){
    // Header shadow
    var hdr=document.querySelector('header');
    if(hdr) addEventListener('scroll',function(){hdr.classList.toggle('scrolled',scrollY>10)});
    // Mobile burger
    var burger=document.getElementById('burger'), nav=document.getElementById('navLinks');
    if(burger&&nav){burger.addEventListener('click',function(){nav.classList.toggle('open')});
      nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){nav.classList.remove('open')})});}
    // Reveal
    if('IntersectionObserver' in window){
      var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
      document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
    } else { document.querySelectorAll('.reveal').forEach(function(el){el.classList.add('in')}); }
    // To top
    var toTop=document.getElementById('toTop');
    if(toTop){addEventListener('scroll',function(){toTop.classList.toggle('show',scrollY>600)});
      toTop.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});}
    // Year
    var y=document.getElementById('year'); if(y) y.textContent=new Date().getFullYear();
  });
})();

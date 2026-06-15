/* ============================================================
   ТекстЛаб — генератор страниц (Node, без зависимостей)
   Запуск: node build.js
   Собирает: страницы услуг, блог, кейсы, sitemap, выгрузку контента
   ============================================================ */
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const BASE = '/textlab-landing';                 // базовый путь GitHub Pages
const ORIGIN = 'https://alex1986-rgb.github.io';
const ABS = ORIGIN + BASE;                        // абсолютный адрес сайта
const LASTMOD = '2026-06-15';
const TG = 'textlab_agency';

const services = require('./content/services');
const articles = require('./content/articles');
const { cases, reviews } = require('./content/site');
const slides = require('./content/slides');
const { svgForSlide } = require('./content/slide-render');
const { about, legal } = require('./content/pages');

// Яндекс.Метрика: впишите номер счётчика, чтобы включить аналитику на всех страницах
const METRIKA_ID = '';

// ---------- helpers ----------
const esc = s => String(s == null ? '' : s)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const u = p => BASE + p;                          // внутренняя ссылка
const write = (rel, html) => {
  const full = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html);
};
const ld = obj => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const ru = d => new Date(d).toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});

const FAVICON = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%237c5cff'/%3E%3Cstop offset='1' stop-color='%2322d3ee'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100' height='100' rx='26' fill='url(%23g)'/%3E%3Ctext x='50' y='68' font-size='56' text-anchor='middle' fill='white' font-family='Arial'%3E%E2%9C%A6%3C/text%3E%3C/svg%3E";

// ---------- shared chrome ----------
function head({title, desc, url, extraLd=[], ogType='website'}){
  return `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#0c0e16">
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="${FAVICON}">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="ТекстЛаб">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${ABS}/og-image.png">
<meta property="og:locale" content="ru_RU">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ABS}/og-image.png">
${extraLd.map(ld).join('\n')}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Unbounded:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${u('/assets/style.css')}">
${metrika()}
</head>
<body>
<a href="#main" class="skip">Перейти к содержанию</a>`;
}

function metrika(){
  if(!METRIKA_ID) return '<!-- Yandex.Metrika: впишите номер счётчика в METRIKA_ID (build.js) и пересоберите -->';
  return `<!-- Yandex.Metrika -->
<script>(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');ym(${METRIKA_ID},'init',{clickmap:true,trackLinks:true,accurateTrackBounce:true});</script>
<noscript><div><img src="https://mc.yandex.ru/watch/${METRIKA_ID}" style="position:absolute;left:-9999px" alt=""></div></noscript>`;
}

function header(active){
  const link = (href,label,key)=>`<a href="${href}"${active===key?' class="active"':''}>${label}</a>`;
  return `<header>
  <div class="wrap nav">
    <a href="${u('/')}" class="logo"><span class="dot">✦</span>ТекстЛаб</a>
    <nav class="nav-links" id="navLinks">
      ${link(u('/services/'),'Услуги','services')}
      ${link(u('/portfolio.html'),'Портфолио','portfolio')}
      ${link(u('/cases.html'),'Кейсы','cases')}
      ${link(u('/blog/'),'Блог','blog')}
      ${link(u('/about.html'),'О нас','about')}
      ${link(u('/#faq'),'FAQ','faq')}
    </nav>
    <div class="nav-cta">
      <button class="theme-toggle" id="themeToggle" aria-label="Сменить тему" title="Светлая / тёмная тема">🌙</button>
      <a href="${u('/#contact')}" class="btn btn-primary">Обсудить проект</a>
      <button class="burger" id="burger" aria-label="Меню"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>
<main id="main">`;
}

function footer(extraScript){
  const sl = services.slice(0,6).map(s=>`<a href="${u('/services/'+s.slug+'.html')}">${esc(s.name)}</a>`).join('');
  return `</main>
<div class="fab">
  <a class="tg" href="https://t.me/${TG}" target="_blank" rel="noopener" aria-label="Telegram">✈️</a>
  <button class="up" id="toTop" aria-label="Наверх">↑</button>
</div>
<footer>
  <div class="wrap">
    <div class="foot-grid">
      <div class="foot-col">
        <a href="${u('/')}" class="logo" style="margin-bottom:16px"><span class="dot">✦</span>ТекстЛаб</a>
        <p>Копирайтинг-агентство полного цикла. Создаём тексты, которые продают, с 2018 года.</p>
      </div>
      <div class="foot-col"><h4>Услуги</h4>${sl}</div>
      <div class="foot-col"><h4>Агентство</h4>
        <a href="${u('/about.html')}">О компании</a><a href="${u('/cases.html')}">Кейсы</a>
        <a href="${u('/portfolio.html')}">Портфолио</a><a href="${u('/blog/')}">Блог</a>
        <a href="${u('/services/')}">Все услуги</a>
      </div>
      <div class="foot-col"><h4>Контакты</h4>
        <a href="tel:+79001234567">+7 (900) 123-45-67</a>
        <a href="mailto:hello@textlab.ru">hello@textlab.ru</a>
        <a href="https://t.me/${TG}" target="_blank" rel="noopener">Telegram: @${TG}</a>
        <a href="${u('/#contact')}">Оставить заявку</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© <span id="year">2026</span> ТекстЛаб. Все права защищены.</span>
      <span><a href="${u('/privacy.html')}">Политика конфиденциальности</a> · <a href="${u('/offer.html')}">Договор оферты</a></span>
    </div>
  </div>
</footer>
<script src="${u('/assets/app.js')}"></script>
${extraScript||''}
</body>
</html>`;
}

function ctaBand(title, text){
  return `<section class="section"><div class="wrap"><div class="cta-band reveal">
    <h2>${esc(title)}</h2>
    <p>${esc(text)}</p>
    <div class="cta-row">
      <a href="${u('/#contact')}" class="btn btn-primary">Получить расчёт за 15 минут →</a>
      <a href="https://t.me/${TG}" target="_blank" rel="noopener" class="btn btn-ghost">Написать в Telegram</a>
    </div>
  </div></div></section>`;
}

function faqBlock(faqs){
  return `<div class="faq-wrap">${faqs.map(f=>`<details class="faq"><summary>${esc(f.q)}<span class="plus">+</span></summary><div class="ans">${esc(f.a)}</div></details>`).join('')}</div>`;
}

function crumbs(items){
  return `<div class="wrap"><nav class="crumbs" aria-label="Хлебные крошки">${items.map((it,i)=>
    (i?'<span>/</span>':'') + (it.href?`<a href="${it.href}">${esc(it.label)}</a>`:esc(it.label))).join('')}</nav></div>`;
}
function breadcrumbLd(items){
  return {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":items.map((it,i)=>({
    "@type":"ListItem","position":i+1,"name":it.label, ...(it.abs?{"item":it.abs}:{})}))};
}
function faqLd(faqs){
  return {"@context":"https://schema.org","@type":"FAQPage","mainEntity":faqs.map(f=>({
    "@type":"Question","name":f.q,"acceptedAnswer":{"@type":"Answer","text":f.a}}))};
}

// ---------- MARKETPLACE SLIDES ----------
function renderSlides(){
  slides.forEach(s=>write(`assets/slides/${s.slug}.svg`, svgForSlide(s)));
}
function slideCard(s){
  return `<figure class="slide reveal">
    <img src="${u('/assets/slides/'+s.slug+'.svg')}" alt="Инфографик-слайд для карточки: ${esc(s.headline.join(' '))} (${esc(s.niche)})" loading="lazy" width="900" height="1200">
    <figcaption><span class="tag cat">${esc(s.niche)}</span><b>${esc(s.headline.join(' '))}</b></figcaption>
  </figure>`;
}
function slidesGallery(list){
  return `<div class="slides-grid">${list.map(slideCard).join('')}</div>`;
}

// ---------- PORTFOLIO PAGE ----------
function renderPortfolio(){
  const url = `${ABS}/portfolio.html`;
  const crumbItems=[{label:'Главная',href:u('/'),abs:ABS+'/'},{label:'Портфолио',abs:url}];
  const body = `${header('portfolio')}
${crumbs(crumbItems)}
<section class="phero"><div class="wrap">
  <span class="eyebrow">Портфолио · маркетплейсы</span>
  <h1>Инфографика и слайды для карточек маркетплейсов</h1>
  <p class="lead">Так выглядят продающие слайды, которые мы проектируем для Wildberries, Ozon и Яндекс Маркета: цепляющий заголовок, выгоды на языке покупателя, бейджи и гарантии. Текст и структура — наши, дизайн собирается по нашим макетам.</p>
  <div class="cta-row" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px">
    <a href="${u('/#contact')}" class="btn btn-primary">Заказать карточки →</a>
    <a href="${u('/services/kartochki-marketpleysov.html')}" class="btn btn-ghost">Подробнее об услуге</a>
  </div>
</div></section>

<section class="section tight"><div class="wrap">
  <div class="grid g4" style="margin-bottom:28px">
    <div class="card reveal"><div class="ic">🔍</div><h3>SEO для поиска</h3><p>Собираем ключи площадки и встраиваем в заголовок и атрибуты — карточка попадает в выдачу.</p></div>
    <div class="card reveal"><div class="ic">🎯</div><h3>Выгоды, а не свойства</h3><p>Пишем то, что важно покупателю: результат, эмоция, снятие сомнений.</p></div>
    <div class="card reveal"><div class="ic">📱</div><h3>Под мобильный экран</h3><p>Короткие смыслы, читаемые за секунду — большинство решений принимают с телефона.</p></div>
    <div class="card reveal"><div class="ic">🛡️</div><h3>Бейджи и доверие</h3><p>Рейтинг, гарантия, состав, акции — визуальные триггеры, которые повышают конверсию.</p></div>
  </div>
  <div class="center" style="margin:10px 0 30px"><span class="eyebrow" style="justify-content:center">Примеры слайдов</span><h2 class="h2">8 инфографик-слайдов под разные ниши</h2><p class="lead center">Кликните по слайду, чтобы рассмотреть детали. Это демо-макеты — под ваш бренд собираем индивидуально.</p></div>
  ${slidesGallery(slides)}
</div></section>

<section class="section soft"><div class="wrap-narrow">
  <div class="center" style="margin-bottom:28px"><span class="eyebrow" style="justify-content:center">Как мы работаем над карточкой</span><h2 class="h2">От анализа ниши до готового слайда</h2></div>
  <div class="prose"><ol>
    <li><strong>Анализ ниши и конкурентов.</strong> Смотрим, как оформлены карточки в топе вашей категории, и находим, чем отстроиться.</li>
    <li><strong>Сбор ключей.</strong> Собираем поисковые запросы площадки под товар для попадания в выдачу.</li>
    <li><strong>Структура слайдов.</strong> Проектируем последовательность: главный экран, выгоды, состав, гарантии, применение.</li>
    <li><strong>Тексты и макеты.</strong> Пишем продающие формулировки и собираем макеты слайдов под дизайнера или сразу в готовом виде.</li>
  </ol></div>
</div></section>

${ctaBand('Хотите такие карточки для своего магазина?','Пришлите ссылку на товар или магазин — соберём структуру слайдов и пришлём расчёт за 15 минут.')}
${footer(`<div class="lightbox" id="lb" hidden><button class="lb-close" id="lbClose" aria-label="Закрыть">×</button><img id="lbImg" alt=""></div>
<script>
(function(){var lb=document.getElementById('lb'),img=document.getElementById('lbImg');
document.querySelectorAll('.slide img').forEach(function(i){i.addEventListener('click',function(){img.src=i.src;img.alt=i.alt;lb.hidden=false;document.body.style.overflow='hidden';});});
function close(){lb.hidden=true;img.src='';document.body.style.overflow='';}
document.getElementById('lbClose').addEventListener('click',close);
lb.addEventListener('click',function(e){if(e.target===lb)close();});
document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});})();
</script>`)}`;
  write('portfolio.html', head({title:'Портфолио: инфографика и слайды для маркетплейсов | ТекстЛаб',desc:'Примеры продающих слайдов и инфографики для карточек Wildberries, Ozon и Яндекс Маркета. Заголовки, выгоды, бейджи и гарантии, которые повышают конверсию.',url,extraLd:[breadcrumbLd(crumbItems)]}) + body);
}

// ---------- SERVICE PAGE ----------
function renderService(s){
  const url = `${ABS}/services/${s.slug}.html`;
  const rel = services.filter(x=>s.related.includes(x.slug));
  const crumbItems = [
    {label:'Главная',href:u('/'),abs:ABS+'/'},
    {label:'Услуги',href:u('/services/'),abs:ABS+'/services/'},
    {label:s.name,abs:url}
  ];
  const extraLd = [
    breadcrumbLd(crumbItems),
    faqLd(s.faqs),
    {"@context":"https://schema.org","@type":"Service","name":s.name,"serviceType":s.name,
     "description":s.metaDescription,"url":url,"areaServed":"RU",
     "provider":{"@type":"Organization","name":"ТекстЛаб","url":ABS+'/'},
     "offers":{"@type":"Offer","price":(s.price.match(/\d[\d\s]*/)||['0'])[0].replace(/\s/g,''),"priceCurrency":"RUB"}}
  ];
  const body = `
${header('services')}
${crumbs(crumbItems)}
<section class="phero">
  <div class="wrap">
    <span class="eyebrow">${esc(s.cat)}</span>
    <h1>${esc(s.h1)}</h1>
    <p class="lead">${esc(s.lead)}</p>
    <div class="cta-row" style="display:flex;gap:14px;flex-wrap:wrap;margin-top:8px">
      <a href="${u('/#contact')}" class="btn btn-primary">Рассчитать стоимость →</a>
      <a href="https://t.me/${TG}" target="_blank" rel="noopener" class="btn btn-ghost">✈️ Telegram</a>
    </div>
    <div class="meta-pills">
      <span class="pill">💰 ${esc(s.price)}</span>
      <span class="pill"><b>✓</b> уникальность 95–100%</span>
      <span class="pill"><b>✓</b> автор + редактор</span>
      <span class="pill"><b>✓</b> правки по ТЗ</span>
    </div>
  </div>
</section>

<section class="section tight"><div class="wrap"><div class="layout">
  <article class="prose reveal">
    ${s.intro.map(p=>`<p${p===s.intro[0]?' class="lead-p"':''}>${esc(p)}</p>`).join('\n    ')}
    <h2>Что входит в услугу</h2>
    <ul>${s.includes.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>
    <h2>Кому подходит</h2>
    <ul>${s.forWhom.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>
    <h2>Как мы работаем</h2>
    <ol>
      <li><strong>Бриф и анализ.</strong> Разбираем задачу, цель и аудиторию, изучаем нишу и конкурентов.</li>
      <li><strong>Смета и план.</strong> Фиксируем объём, сроки и стоимость, согласуем подход.</li>
      <li><strong>Текст и правки.</strong> Пишем, согласуем структуру, вносим правки, редактор вычитывает.</li>
      <li><strong>Сдача и поддержка.</strong> Отдаём готовый материал с проверкой и сопровождаем после сдачи.</li>
    </ol>
    <blockquote>Не «текст ради текста», а инструмент для вашей цели — заявок, продаж и доверия. Каждую задачу ведёт профильный автор и редактор.</blockquote>
  </article>
  <aside class="aside">
    <div class="aside-card reveal">
      <div class="price grad">${esc(s.price)}</div>
      <p class="muted" style="margin-top:6px">Точная смета — после брифа, бесплатно</p>
      <a href="${u('/#contact')}" class="btn btn-primary" style="width:100%">Получить расчёт →</a>
    </div>
    <div class="aside-card reveal">
      <h3>Другие услуги</h3>
      <ul class="toc">${rel.map(r=>`<li><a href="${u('/services/'+r.slug+'.html')}">${esc(r.icon)} ${esc(r.name)}</a></li>`).join('')}
        <li><a href="${u('/services/')}">→ Все 12 направлений</a></li></ul>
    </div>
  </aside>
</div></div></section>

${s.slug==='kartochki-marketpleysov'?`<section class="section soft"><div class="wrap">
  <div class="center" style="margin-bottom:28px"><span class="eyebrow" style="justify-content:center">Портфолио</span><h2 class="h2">Примеры наших слайдов для карточек</h2><p class="lead center">Так выглядят продающие инфографик-слайды, которые мы проектируем под маркетплейсы.</p></div>
  <div class="slides-grid">${slides.slice(0,4).map(slideCard).join('')}</div>
  <div class="center" style="margin-top:30px"><a href="${u('/portfolio.html')}" class="btn btn-primary">Смотреть всё портфолио слайдов →</a></div>
</div></section>`:''}

<section class="section${s.slug==='kartochki-marketpleysov'?'':' soft'}"><div class="wrap-narrow">
  <div class="center" style="margin-bottom:28px"><span class="eyebrow" style="justify-content:center">Вопросы</span><h2 class="h2">Частые вопросы про «${esc(s.name.toLowerCase())}»</h2></div>
  ${faqBlock(s.faqs)}
</div></section>

${ctaBand('Нужны '+s.name.toLowerCase()+'?','Опишите задачу — пришлём смету и первые идеи за 15 минут. Бриф и консультация бесплатно.')}
${footer()}`;
  write(`services/${s.slug}.html`, head({title:s.metaTitle,desc:s.metaDescription,url,extraLd}) + body);
}

// ---------- SERVICES INDEX ----------
function renderServicesIndex(){
  const url = `${ABS}/services/`;
  const crumbItems=[{label:'Главная',href:u('/'),abs:ABS+'/'},{label:'Услуги',abs:url}];
  const cards = services.map(s=>`<a class="card reveal" href="${u('/services/'+s.slug+'.html')}">
    <div class="ic">${esc(s.icon)}</div>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.lead)}</p>
    <span class="price">${esc(s.price)}</span>
    <div style="margin-top:12px"><span class="more">Подробнее →</span></div>
  </a>`).join('');
  const body = `${header('services')}
${crumbs(crumbItems)}
<section class="phero"><div class="wrap">
  <span class="eyebrow">12 направлений</span>
  <h1>Услуги копирайтинг-агентства ТекстЛаб</h1>
  <p class="lead">От SEO-текстов и продающих лендингов до карточек маркетплейсов и сценариев Reels. Выберите направление — на каждой странице подробное описание, цены и ответы на вопросы.</p>
</div></section>
<section class="section tight"><div class="wrap"><div class="grid g3">${cards}</div></div></section>
${ctaBand('Не знаете, что выбрать?','Расскажите о задаче — подскажем подходящее направление и пришлём расчёт за 15 минут.')}
${footer()}`;
  write('services/index.html', head({title:'Услуги копирайтинга — 12 направлений | ТекстЛаб',desc:'Все услуги копирайтинг-агентства ТекстЛаб: SEO-тексты, лендинги, статьи, рассылки, SMM, карточки маркетплейсов, сценарии, нейминг и другое. Цены и подробности по каждому направлению.',url,extraLd:[breadcrumbLd(crumbItems)]}) + body);
}

// ---------- ARTICLE PAGE ----------
function articlePlain(a){
  return a.sections.map(sec=>sec.h2+'. '+sec.p.join(' ')+(sec.ul?(' '+sec.ul.join('; ')):'')).join(' ');
}
function renderArticle(a){
  const url = `${ABS}/blog/${a.slug}.html`;
  const rel = articles.filter(x=>a.related && a.related.includes(x.slug));
  const svc = services.find(s=>s.slug===a.service);
  const crumbItems=[
    {label:'Главная',href:u('/'),abs:ABS+'/'},
    {label:'Блог',href:u('/blog/'),abs:ABS+'/blog/'},
    {label:a.title,abs:url}
  ];
  const extraLd=[
    breadcrumbLd(crumbItems),
    a.faqs&&a.faqs.length?faqLd(a.faqs):null,
    {"@context":"https://schema.org","@type":"Article","headline":a.title,"description":a.metaDescription,
     "datePublished":a.date,"dateModified":a.date,"inLanguage":"ru-RU","url":url,
     "image":ABS+'/og-image.png',
     "author":{"@type":"Organization","name":"ТекстЛаб"},
     "publisher":{"@type":"Organization","name":"ТекстЛаб","logo":{"@type":"ImageObject","url":ABS+'/og-image.png'}}}
  ].filter(Boolean);
  const sections = a.sections.map(sec=>`
    <h2>${esc(sec.h2)}</h2>
    ${sec.p.map(p=>`<p>${esc(p)}</p>`).join('\n    ')}
    ${sec.ul?`<ul>${sec.ul.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}`).join('\n');
  const body = `${header('blog')}
${crumbs(crumbItems)}
<section class="phero"><div class="wrap" style="max-width:820px;margin:0 auto">
  <div class="tags" style="margin-bottom:14px"><span class="tag cat">${esc(a.cat)}</span><span class="tag" style="color:var(--muted);background:transparent;border:none">${ru(a.date)} · ${a.read} мин</span></div>
  <h1>${esc(a.title)}</h1>
  <p class="lead">${esc(a.lead)}</p>
</div></section>
<section class="section tight"><div class="wrap-narrow">
  <article class="prose reveal">
    ${sections}
  </article>
  ${a.faqs&&a.faqs.length?`<div style="margin-top:44px"><h2 class="h2" style="font-size:26px;margin-bottom:18px">Частые вопросы</h2>${faqBlock(a.faqs)}</div>`:''}
  ${svc?`<div class="aside-card reveal" style="margin-top:40px;display:flex;flex-wrap:wrap;gap:16px;align-items:center;justify-content:space-between">
    <div><h3 style="margin-bottom:4px">Нужны ${esc(svc.name.toLowerCase())}?</h3><p class="muted" style="margin:0">Закажем под вашу задачу — расчёт за 15 минут.</p></div>
    <a href="${u('/services/'+svc.slug+'.html')}" class="btn btn-primary">Узнать про услугу →</a>
  </div>`:''}
</div></section>
${rel.length?`<section class="section soft"><div class="wrap">
  <div class="center" style="margin-bottom:28px"><span class="eyebrow" style="justify-content:center">Читайте также</span><h2 class="h2">Похожие статьи</h2></div>
  <div class="grid g3">${rel.map(r=>articleCard(r)).join('')}</div>
</div></section>`:''}
${footer()}`;
  write(`blog/${a.slug}.html`, head({title:a.metaTitle,desc:a.metaDescription,url,extraLd,ogType:'article'}) + body);
}

function articleCard(a){
  const colors=['#7c5cff','#22d3ee','#34d399','#ffd166','#f472b6','#818cf8'];
  const c = colors[a.slug.length % colors.length];
  return `<a class="post reveal" href="${u('/blog/'+a.slug+'.html')}">
    <div class="top" style="background:linear-gradient(135deg,${c}22,${c}11)">${esc(a.emoji)}</div>
    <div class="body">
      <span class="tag cat" style="align-self:flex-start">${esc(a.cat)}</span>
      <h3>${esc(a.title)}</h3>
      <p>${esc(a.lead)}</p>
      <div class="meta"><span>${ru(a.date)}</span><span>${a.read} мин чтения</span></div>
    </div>
  </a>`;
}

// ---------- BLOG INDEX ----------
function renderBlogIndex(){
  const url = `${ABS}/blog/`;
  const crumbItems=[{label:'Главная',href:u('/'),abs:ABS+'/'},{label:'Блог',abs:url}];
  const cats = [...new Set(articles.map(a=>a.cat))];
  const sorted = [...articles].sort((a,b)=>a.date<b.date?1:-1);
  const filters = `<div class="tags" style="margin:0 0 28px"><span class="tag cat" data-f="all">Все статьи</span>${cats.map(c=>`<span class="tag" data-f="${esc(c)}" style="cursor:pointer">${esc(c)}</span>`).join('')}</div>`;
  const cards = sorted.map(a=>`<div data-cat="${esc(a.cat)}">${articleCard(a)}</div>`).join('');
  const itemList = {"@context":"https://schema.org","@type":"ItemList","itemListElement":sorted.map((a,i)=>({"@type":"ListItem","position":i+1,"url":`${ABS}/blog/${a.slug}.html`,"name":a.title}))};
  const body = `${header('blog')}
${crumbs(crumbItems)}
<section class="phero"><div class="wrap">
  <span class="eyebrow">Блог</span>
  <h1>Блог о копирайтинге, SEO и контент-маркетинге</h1>
  <p class="lead">${articles.length} статей о текстах, которые продают: как писать SEO-тексты и лендинги, вести соцсети и рассылки, оформлять карточки маркетплейсов и не только.</p>
</div></section>
<section class="section tight"><div class="wrap">
  ${filters}
  <div class="grid g3" id="postGrid">${cards}</div>
</div></section>
${ctaBand('Хотите такой контент для своего бизнеса?','Напишем статьи, которые приводят трафик и закрывают возражения клиентов. Расчёт за 15 минут.')}
${footer(`<script>
document.querySelectorAll('[data-f]').forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('[data-f]').forEach(function(x){x.classList.remove('cat')});
  b.classList.add('cat'); var f=b.getAttribute('data-f');
  document.querySelectorAll('#postGrid [data-cat]').forEach(function(el){
    el.style.display=(f==='all'||el.getAttribute('data-cat')===f)?'':'none';});
});});
</script>`)}`;
  write('blog/index.html', head({title:'Блог о копирайтинге и SEO — '+articles.length+' статей | ТекстЛаб',desc:'Статьи о копирайтинге, SEO, лендингах, email-маркетинге и контенте для соцсетей и маркетплейсов. Практические гайды от агентства ТекстЛаб.',url,extraLd:[breadcrumbLd(crumbItems),itemList]}) + body);
}

// ---------- CASES PAGE ----------
function renderCases(){
  const url = `${ABS}/cases.html`;
  const crumbItems=[{label:'Главная',href:u('/'),abs:ABS+'/'},{label:'Кейсы',abs:url}];
  const blocks = cases.map(c=>{
    const svc = services.find(s=>s.slug===c.service);
    return `<div class="case reveal">
      <div class="head"><div class="logo-sq" style="background:${c.color}">${esc(c.logo)}</div>
        <div><h3>${esc(c.title)}</h3><span>${esc(c.industry)} · <span class="tag" style="display:inline">${esc(c.tag)}</span></span></div></div>
      <div class="body">
        <p><b>Задача.</b> ${esc(c.task)}</p>
        <p><b>Решение.</b> ${esc(c.solution)}</p>
        <blockquote style="border-left:3px solid var(--brand);padding:14px 18px;border-radius:0 14px 14px 0;background:var(--bg-soft);margin:0">«${esc(c.quote)}»<br><span class="muted" style="font-size:13.5px">— ${esc(c.author)}</span></blockquote>
        ${svc?`<p style="margin-top:14px"><a class="more" href="${u('/services/'+svc.slug+'.html')}">Услуга: ${esc(svc.name)} →</a></p>`:''}
      </div>
      <div class="results">${c.results.map(r=>`<div class="r"><b>${esc(r.n)}</b><span>${esc(r.l)}</span></div>`).join('')}</div>
    </div>`;
  }).join('\n');
  const body = `${header('cases')}
${crumbs(crumbItems)}
<section class="phero"><div class="wrap">
  <span class="eyebrow">Кейсы</span>
  <h1>Кейсы: результаты, которые можно измерить</h1>
  <p class="lead">Подробные истории проектов: задача, что мы сделали и какой результат получил клиент в цифрах.</p>
</div></section>
<section class="section tight"><div class="wrap"><div class="grid g2">${blocks}</div></div></section>
<section class="section soft"><div class="wrap">
  <div class="center" style="margin-bottom:28px"><span class="eyebrow" style="justify-content:center">Отзывы</span><h2 class="h2">Что говорят клиенты</h2></div>
  <div class="grid g3">${reviews.map(r=>`<div class="rev reveal"><div class="stars">${'★'.repeat(r.stars)}</div><p>${esc(r.text)}</p><div class="who"><div class="av" style="background:${r.color}">${esc(r.av)}</div><div><b>${esc(r.name)}</b><span>${esc(r.role)}</span></div></div></div>`).join('')}</div>
</div></section>
${ctaBand('Хотите похожий результат?','Расскажите о задаче — соберём решение под вашу цель и пришлём расчёт за 15 минут.')}
${footer()}`;
  write('cases.html', head({title:'Кейсы копирайтинг-агентства ТекстЛаб — результаты в цифрах',desc:'Подробные кейсы ТекстЛаб: SEO и блог, карточки маркетплейсов, лендинги, рассылки, SMM, PR. Задача, решение и измеримый результат каждого проекта.',url,extraLd:[breadcrumbLd(crumbItems)]}) + body);
}

// ---------- ABOUT ----------
function renderAbout(){
  const url = `${ABS}/about.html`;
  const crumbItems=[{label:'Главная',href:u('/'),abs:ABS+'/'},{label:'О компании',abs:url}];
  const orgLd = {"@context":"https://schema.org","@type":"Organization","name":"ТекстЛаб",
    "url":ABS+'/',"email":"hello@textlab.ru","description":about.intro[0],"foundingDate":"2018","areaServed":"RU",
    "logo":ABS+'/og-image.png'};
  const body = `${header('about')}
${crumbs(crumbItems)}
<section class="phero"><div class="wrap">
  <span class="eyebrow">О компании</span>
  <h1>ТекстЛаб — агентство копирайтинга полного цикла</h1>
  <p class="lead">${esc(about.intro[0])}</p>
  <div class="meta-pills">${about.stats.map(s=>`<span class="pill"><b>${esc(s.n)}</b> ${esc(s.l)}</span>`).join('')}</div>
</div></section>

<section class="section tight"><div class="wrap-narrow prose reveal">
  ${about.intro.slice(1).map(p=>`<p>${esc(p)}</p>`).join('')}
</div></section>

<section class="section soft"><div class="wrap">
  <div class="center" style="margin-bottom:36px"><span class="eyebrow" style="justify-content:center">Принципы</span><h2 class="h2">Наши ценности в работе</h2></div>
  <div class="grid g3">${about.values.map(v=>`<div class="card reveal"><div class="ic">${esc(v.ic)}</div><h3>${esc(v.t)}</h3><p>${esc(v.d)}</p></div>`).join('')}</div>
</div></section>

<section class="section"><div class="wrap">
  <div class="center" style="margin-bottom:36px"><span class="eyebrow" style="justify-content:center">Команда</span><h2 class="h2">Кто работает над вашими текстами</h2><p class="lead center">Над каждым проектом — профильный автор и редактор. Знакомьтесь с командой.</p></div>
  <div class="grid g3">${about.team.map(m=>`<div class="card reveal" style="text-align:center">
    <div class="av" style="background:${m.color};width:72px;height:72px;border-radius:50%;display:grid;place-items:center;font-family:'Unbounded';font-weight:800;color:#fff;font-size:24px;margin:0 auto 14px">${esc(m.av)}</div>
    <h3>${esc(m.name)}</h3><p style="color:var(--brand-2);font-weight:600;margin-bottom:8px">${esc(m.role)}</p><p>${esc(m.bio)}</p>
  </div>`).join('')}</div>
</div></section>

<section class="section soft"><div class="wrap">
  <div class="center" style="margin-bottom:36px"><span class="eyebrow" style="justify-content:center">Гарантии</span><h2 class="h2">Что мы гарантируем</h2></div>
  <div class="grid g3">${about.guarantees.map(g=>`<div class="card reveal"><div class="ic">${esc(g.ic)}</div><h3>${esc(g.t)}</h3><p>${esc(g.d)}</p></div>`).join('')}</div>
</div></section>

${ctaBand('Доверьте тексты команде, которая отвечает за результат','Расскажите о задаче — пришлём расчёт и первые идеи за 15 минут. Бриф и консультация бесплатно.')}
${footer()}`;
  write('about.html', head({title:'О компании ТекстЛаб — команда, ценности и гарантии',desc:'О копирайтинг-агентстве ТекстЛаб: команда копирайтеров и редакторов, принципы работы, гарантии. 8 лет на рынке, 640+ проектов.',url,extraLd:[breadcrumbLd(crumbItems),orgLd]}) + body);
}

// ---------- LEGAL ----------
function renderLegalPage(file, data){
  const url = `${ABS}/${file}`;
  const crumbItems=[{label:'Главная',href:u('/'),abs:ABS+'/'},{label:data.title,abs:url}];
  const body = `${header('')}
${crumbs(crumbItems)}
<section class="phero"><div class="wrap-narrow">
  <h1>${esc(data.title)}</h1>
  <p class="lead">Последнее обновление: ${esc(data.updated)}</p>
</div></section>
<section class="section tight"><div class="wrap-narrow prose reveal">
  ${data.sections.map(s=>`<h2>${esc(s.h2)}</h2>${s.p.map(p=>`<p>${esc(p)}</p>`).join('')}`).join('\n  ')}
  <blockquote>Это типовой документ-шаблон. Перед публикацией замените поля в квадратных скобках (название организации, ИНН) на свои реквизиты и при необходимости согласуйте с юристом.</blockquote>
</div></section>
${footer()}`;
  write(file, head({title:data.metaTitle,desc:data.metaDescription,url,extraLd:[breadcrumbLd(crumbItems)]}) + body);
}
function renderLegal(){
  renderLegalPage('privacy.html', legal.privacy);
  renderLegalPage('offer.html', legal.offer);
}

// ---------- SITEMAP ----------
function renderSitemap(){
  const urls = [
    {loc:ABS+'/',p:'1.0',f:'weekly'},
    {loc:ABS+'/services/',p:'0.9',f:'monthly'},
    {loc:ABS+'/blog/',p:'0.8',f:'weekly'},
    {loc:ABS+'/portfolio.html',p:'0.7',f:'monthly'},
    {loc:ABS+'/cases.html',p:'0.7',f:'monthly'},
    {loc:ABS+'/about.html',p:'0.6',f:'monthly'},
    ...services.map(s=>({loc:`${ABS}/services/${s.slug}.html`,p:'0.8',f:'monthly'})),
    ...articles.map(a=>({loc:`${ABS}/blog/${a.slug}.html`,p:'0.6',f:'monthly'}))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(x=>`  <url><loc>${x.loc}</loc><lastmod>${LASTMOD}</lastmod><changefreq>${x.f}</changefreq><priority>${x.p}</priority></url>`).join('\n')}
</urlset>
`;
  write('sitemap.xml', xml);
}

// ---------- CONTENT EXPORT (JSON / CSV / Markdown) ----------
function csvCell(s){ return '"'+String(s==null?'':s).replace(/"/g,'""').replace(/\n/g,' ')+'"'; }
function renderExports(){
  // JSON
  write('export/content.json', JSON.stringify({site:'ТекстЛаб',base:ABS,generated:LASTMOD,services,articles,cases,reviews}, null, 2));

  // CSV — реестр страниц для импорта в CMS
  const rows = [['type','category','title','slug','url','metaTitle','metaDescription','content']];
  services.forEach(s=>rows.push(['service',s.cat,s.h1,s.slug,`${ABS}/services/${s.slug}.html`,s.metaTitle,s.metaDescription,
    [s.lead,...s.intro,'Что входит: '+s.includes.join('; '),'Кому подходит: '+s.forWhom.join('; ')].join(' ')]));
  articles.forEach(a=>rows.push(['article',a.cat,a.title,a.slug,`${ABS}/blog/${a.slug}.html`,a.metaTitle,a.metaDescription,
    a.lead+' '+articlePlain(a)]));
  write('export/pages.csv', rows.map(r=>r.map(csvCell).join(',')).join('\n'));

  // Markdown — статьи и услуги для наполнения
  let md = `# Контент ТекстЛаб\n\nСгенерировано: ${LASTMOD}. Сайт: ${ABS}\n\n`;
  md += `## Услуги (${services.length})\n\n`;
  services.forEach(s=>{
    md += `### ${s.name}\n- **URL:** ${ABS}/services/${s.slug}.html\n- **Title:** ${s.metaTitle}\n- **Description:** ${s.metaDescription}\n- **Цена:** ${s.price}\n\n${s.lead}\n\n${s.intro.join('\n\n')}\n\n**Что входит:**\n${s.includes.map(i=>'- '+i).join('\n')}\n\n**FAQ:**\n${s.faqs.map(f=>`- **${f.q}** ${f.a}`).join('\n')}\n\n---\n\n`;
  });
  md += `## Статьи блога (${articles.length})\n\n`;
  articles.forEach(a=>{
    md += `### ${a.title}\n- **URL:** ${ABS}/blog/${a.slug}.html\n- **Категория:** ${a.cat} · ${ru(a.date)} · ${a.read} мин\n- **Title:** ${a.metaTitle}\n- **Description:** ${a.metaDescription}\n\n${a.lead}\n\n`;
    a.sections.forEach(sec=>{ md += `#### ${sec.h2}\n${sec.p.join('\n\n')}\n${sec.ul?('\n'+sec.ul.map(i=>'- '+i).join('\n')+'\n'):''}\n`; });
    if(a.faqs&&a.faqs.length){ md += `**FAQ:**\n${a.faqs.map(f=>`- **${f.q}** ${f.a}`).join('\n')}\n`; }
    md += `\n---\n\n`;
  });
  write('export/content.md', md);
}

// ---------- RUN ----------
renderSlides();
renderPortfolio();
services.forEach(renderService);
renderServicesIndex();
articles.forEach(renderArticle);
renderBlogIndex();
renderCases();
renderAbout();
renderLegal();
renderSitemap();
renderExports();

console.log(`Готово:
  services/      ${services.length} страниц + index
  blog/          ${articles.length} статей + index
  portfolio.html ${slides.length} слайдов для маркетплейсов
  cases.html     ${cases.length} кейсов, ${reviews.length} отзывов
  about.html     команда, ценности, гарантии
  privacy/offer  юридические страницы
  assets/slides/ ${slides.length} SVG-слайдов
  sitemap.xml    ${services.length+articles.length+6} URL
  export/        content.json, pages.csv, content.md`);

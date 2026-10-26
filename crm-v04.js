// EVERFRAME ICONIC CRM 0.4 — visual enhancement, non-destructive.
// Load after crm-v03.js. No schema changes or authentication changes.
(()=>{'use strict';
const css=document.createElement('style');css.textContent=`
:root{--wine:#622b43;--gold:#b18b60;--line:#e9dce0}
body{background:linear-gradient(135deg,#faf1f1,#fffaf7 60%,#f8efeb)}
.sidebar{background:linear-gradient(175deg,#512136,#713650);box-shadow:6px 0 30px #50263a12}
.nav button{transition:background .18s,transform .18s}.nav button:hover{transform:translateX(2px)}
.stat,.panel{box-shadow:0 10px 34px #6a304012}.stat{border-top:3px solid #c5a17a}
#v03Overlay{z-index:40;backdrop-filter:blur(5px)}
#v03Overlay .modal{width:min(920px,100%);padding:0;border-radius:22px;overflow:auto;background:#fffaf8;box-shadow:0 25px 85px #210b1d50}
#v03Overlay .modalhead{padding:28px 32px 22px;margin:0;background:linear-gradient(115deg,#612a43,#95576d);color:#fff;align-items:center}
#v03Overlay .modalhead h2,#v03Overlay .modalhead .eyebrow,#v03Overlay .modalhead .x{color:#fff}
#v03Overlay .modalhead h2{font-size:clamp(27px,4vw,36px);margin-top:7px}
#v03Overlay .modalhead .eyebrow{opacity:.8}
#v03Overlay .modalhead .x{font-size:32px;line-height:1;padding:3px 8px;border-radius:9px}
#v03Overlay .modalhead .x:hover{background:#ffffff22}
#v03Overlay .v03-hero{margin:0;padding:25px 32px;gap:23px;align-items:flex-start;border-bottom:1px solid #eedfe3;background:linear-gradient(100deg,#fffaf8,#f8edef)}
#v03Overlay .v03-hero>div{flex:1;min-width:0}
#v03Overlay .v03-photo{width:120px;height:120px;flex:none;border-radius:20px;border:3px solid #fff;box-shadow:0 8px 22px #6a304022}
#v03Overlay .v03-photo.hide{display:block!important;visibility:hidden;width:0;height:0;margin:0;border:0}
#v03Overlay #v03Meta{font-size:15px;color:#644653;margin-bottom:12px}
#v03Overlay .v03-tabs{margin:0;padding:20px 32px 0;border-bottom:1px solid #ead8db;gap:6px}
#v03Overlay .v03-tab{border:0;border-bottom:3px solid transparent;border-radius:0;padding:12px 18px;background:transparent;color:#76515f;font-weight:700}
#v03Overlay .v03-tab.active{border-bottom-color:#873f5d;color:#622b43;background:#f6e9ed}
#v03Overlay #v03Activity,#v03Overlay #v03Tasks{padding:25px 32px 12px}
#v03Overlay #v03Status{padding:0 32px 24px;margin:0;min-height:28px}
#v03Overlay .v03-entry{padding:17px 19px;border-radius:14px;background:#fff;border:1px solid #ead8db;box-shadow:0 4px 14px #4e23340a}
#v03Overlay .v03-list{margin-top:20px;gap:12px}
#v03Overlay .v03-entry small{color:#947b85}
#v03Overlay .v03-entry p{line-height:1.65}
#v03Overlay .v03-row{gap:10px}
#v03Overlay .btn{white-space:nowrap}
#v03Overlay textarea{min-height:100px;resize:vertical}
#v03Overlay .v03-entry input[type=checkbox]{accent-color:#76354e;width:17px;height:17px;vertical-align:middle}
@media(max-width:650px){#v03Overlay .modalhead{padding:20px}#v03Overlay .v03-hero{padding:20px;flex-wrap:wrap}#v03Overlay .v03-tabs{padding:12px 20px 0}#v03Overlay #v03Activity,#v03Overlay #v03Tasks{padding:20px}#v03Overlay #v03Status{padding:0 20px 20px}#v03Overlay .v03-row>*{min-width:100%}#v03Overlay .v03-photo{width:90px;height:90px}}
`;document.head.append(css);
function updateCopy(){const notice=document.querySelector('#contactsPage>.notice');if(notice)notice.textContent='Контакты и история общения хранятся в защищённой облачной базе. Доступ имеют участники вашего рабочего пространства.';
const about=document.querySelector('#aboutPage .info');if(about){const paras=about.querySelectorAll('p');if(paras[0])paras[0].textContent='Общая облачная база контактов, поиск, фильтры, этапы сделки, фотографии по ссылке, история общения, задачи и экспорт CSV.';if(paras[1])paras[1].textContent='Далее: загрузка фотографий с устройства, улучшенные напоминания и проверка разграничения доступа между организациями.';const n=about.querySelector('.notice');if(n)n.textContent='Приоритет A/B/C выставляется вручную. Автоматический поиск клиентов и рассылки пока не подключены.';}
document.querySelectorAll('.sidefoot').forEach(e=>e.innerHTML='THE ICONIC · PRIVATE WORKSPACE<br>v0.4 · облачная база');document.querySelectorAll('.tag').forEach(e=>{if(e.textContent.includes('V0.2'))e.textContent='V0.4 · PRIVATE BETA'});
document.querySelectorAll('#stats .stat small').forEach(e=>{if(e.textContent==='Локальная база')e.textContent='Облачная база'});
}
updateCopy();const stats=document.getElementById('stats');if(stats)new MutationObserver(()=>{stats.querySelectorAll('.stat small').forEach(e=>{if(e.textContent==='Локальная база')e.textContent='Облачная база'})}).observe(stats,{childList:true,subtree:true});
})();

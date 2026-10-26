// EVERFRAME ICONIC CRM 0.5 — unified existing-contact card.
// Keep crm-v03.js and crm-v04.js; load this module last.
import './crm-v03.js';
import {createClient} from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const config=window.ICONIC_CONFIG||{};
if(!config.supabaseUrl||!config.supabaseAnonKey)throw Error('CRM 0.5: missing Supabase configuration');
const db=createClient(config.supabaseUrl,config.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
const $=id=>document.getElementById(id);
const overlay=$('v03Overlay');
if(!overlay)throw Error('CRM 0.5: CRM 0.3 card is unavailable');
const style=document.createElement('style');
style.textContent=`
#v03Overlay{z-index:60;background:#29121bb8;backdrop-filter:blur(4px)}
#v03Overlay>.modal{width:min(940px,96vw)!important;max-height:92vh;padding:0!important;border-radius:22px;overflow:auto;background:#fffcfa;box-shadow:0 24px 80px #2b0c1f55}
#v03Overlay .modalhead{padding:26px 30px 22px;margin:0;background:linear-gradient(115deg,#572139,#8e4760);color:#fff;align-items:center}
#v03Overlay .modalhead h2{font:normal 34px Georgia,serif;color:#fff;margin-top:5px}
#v03Overlay .modalhead .eyebrow{color:#f6dce4}
#v03Overlay .modalhead .x{color:white;font-size:30px}
#v03Overlay .v03-hero{padding:24px 30px 10px;margin:0;align-items:flex-start}
#v03Overlay .v03-photo{width:106px;height:106px;border:4px solid #f2e2e5;box-shadow:0 6px 20px #63283f15;flex-shrink:0}
#v03Overlay .v03-hero>div{flex:1;min-width:0}
#v03Overlay .v03-tabs{margin:8px 30px 20px;border-bottom:1px solid #ead9df;gap:5px}
#v03Overlay .v03-tab{border:0;border-bottom:3px solid transparent;border-radius:0;background:transparent;color:#6f4b5b;padding:13px 18px;font-weight:650}
#v03Overlay .v03-tab.active{border-bottom-color:#7e3552;color:#63283f;background:#f7eef0}
#v03Overlay #v03Activity,#v03Overlay #v03Tasks,#v03Overlay #v05Details{padding:0 30px 18px}
#v03Overlay .v03-entry{background:#fff;border:1px solid #eadbe0;border-radius:13px;padding:16px;box-shadow:0 2px 8px #63283f08}
#v03Overlay .v03-entry p{color:#392c34;font-size:14px}
#v03Overlay #v03Status{margin:0;padding:8px 30px 24px;color:#704f5c}
#v03Overlay input,#v03Overlay textarea,#v03Overlay select{color:#392c34;background:#fff;border:1px solid #d8c4cb}
#v03Overlay .v05-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px}
#v03Overlay .v05-field{display:flex;flex-direction:column;gap:6px;font-size:12px;font-weight:650;color:#765562}
#v03Overlay .v05-field input,#v03Overlay .v05-field select,#v03Overlay .v05-field textarea{width:100%;padding:11px 12px;border-radius:10px;font-size:14px;font-weight:400}
#v03Overlay .v05-wide{grid-column:1/-1}
#v03Overlay .v05-actions{display:flex;justify-content:flex-end;gap:10px;margin:20px 0 0}
#v03Overlay .v05-note{font-size:12px;color:#856e78;margin:12px 0}
@media(max-width:650px){#v03Overlay .modalhead{padding:20px}#v03Overlay .v03-hero{padding:18px 20px;flex-direction:column}#v03Overlay .v03-tabs{margin:4px 20px 15px;overflow-x:auto;flex-wrap:nowrap}#v03Overlay .v03-tab{padding:12px;white-space:nowrap}#v03Overlay #v03Activity,#v03Overlay #v03Tasks,#v03Overlay #v05Details{padding:0 20px 18px}#v03Overlay .v05-grid{grid-template-columns:1fr}#v03Overlay .v05-wide{grid-column:auto}#v03Overlay .v03-row>*{min-width:100%}}
`;
document.head.append(style);
const tabbar=overlay.querySelector('.v03-tabs');
const detailsTab=document.createElement('button');detailsTab.type='button';detailsTab.className='v03-tab';detailsTab.textContent='Данные клиента';detailsTab.dataset.v03Tab='details';tabbar.prepend(detailsTab);
const details=document.createElement('section');details.id='v05Details';details.className='hide';
const editable=[
 ['name','Имя / название','text',140],['company','Компания / проект','text',140],
 ['profession','Профессия / сфера','text',140],['city','Город','text',100],
 ['country','Страна','text',100],['contact','Telegram / WhatsApp / email','text',220],
 ['link','Профессиональный профиль','url',500],['type','Категория','select',['Участник','Спикер','Партнёр','Бренд']],
 ['priority','Приоритет','select',['A','B','C']],['status','Статус','select',['Новый контакт','Проверен','Написали','Ответил','Переговоры','Сделка','Не подходит']],
 ['next','Следующее действие','date',null],['amount','Сумма сделки, ₽','number',null],
 ['reason','Почему подходит','textarea',2000],['notes','Заметки (старое поле)','textarea',4000]
];
const grid=document.createElement('div');grid.className='v05-grid';
for(const [key,label,kind,meta] of editable){
 const wrap=document.createElement('label');wrap.className='v05-field'+(['link','reason','notes'].includes(key)?' v05-wide':'');wrap.textContent=label;
 let control;if(kind==='select'){control=document.createElement('select');for(const option of meta){const el=document.createElement('option');el.value=option;el.textContent=option;control.append(el)}}
 else if(kind==='textarea'){control=document.createElement('textarea');control.rows=3;control.maxLength=meta}
 else{control=document.createElement('input');control.type=kind;if(typeof meta==='number')control.maxLength=meta;if(kind==='number'){control.min='0';control.step='any'}}
 control.id='v05_'+key;wrap.append(control);grid.append(wrap);
}
details.append(grid);
const note=document.createElement('p');note.className='v05-note';note.textContent='История общения и задачи хранятся отдельно. Старые заметки сохранены без изменений.';details.append(note);
const actions=document.createElement('div');actions.className='v05-actions';
const save=document.createElement('button');save.className='btn';save.type='button';save.textContent='Сохранить изменения';actions.append(save);details.append(actions);
overlay.querySelector('#v03Activity').before(details);
let selected=null,workspace=null,busy=false;
const previousOpen=window.openEditor;
if(typeof previousOpen!=='function')throw Error('CRM 0.5: contact editor missing');
const showTab=name=>{
 overlay.querySelectorAll('[data-v03-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v03Tab===name));
 $('v03Activity').classList.toggle('hide',name!=='activity');$('v03Tasks').classList.toggle('hide',name!=='tasks');details.classList.toggle('hide',name!=='details');
};
// Existing v03 tab listeners run too; our listener runs after and keeps all 3 panels consistent.
tabbar.addEventListener('click',e=>{const btn=e.target.closest('[data-v03-tab]');if(btn)showTab(btn.dataset.v03Tab)});
async function loadDetails(id){
 const {data:{user},error:authError}=await db.auth.getUser();if(authError||!user)throw Error('Требуется вход в CRM');
 const {data:membership,error:memberError}=await db.from('workspace_members').select('workspace_id').eq('user_id',user.id).limit(1).maybeSingle();
 if(memberError||!membership)throw Error('Нет доступа к рабочей базе');workspace=membership.workspace_id;
 const {data,error}=await db.from('contacts').select('*').eq('workspace_id',workspace).eq('id',id).single();if(error||!data)throw Error('Контакт не найден');
 selected=id;for(const [key] of editable)$('v05_'+key).value=data[key]??'';
 $('v03Title').textContent=data.name||'Контакт';$('v03Meta').textContent=[data.company,data.profession].filter(Boolean).join(' · ');
}
window.openEditor=function(id=null){
 if(!id)return previousOpen(id); // New contacts keep the proven Supabase save form.
 previousOpen(id); // Creates v03's original button and retains its tested handler.
 const open=$('v03OpenCard');
 if(!open){console.error('CRM 0.5: missing v03 action');return}
 open.click(); // v03 closes the old form and opens its existing history/task card.
 selected=null;workspace=null;showTab('details');
 loadDetails(id).catch(e=>{$('v03Status').textContent='Ошибка загрузки: '+e.message});
};
save.addEventListener('click',async()=>{
 if(busy||!selected||!workspace)return;busy=true;save.disabled=true;
 try{
  const values={};for(const [key] of editable)values[key]=$('v05_'+key).value.trim()||null;
  if(!values.name)throw Error('Укажите имя клиента');
  if(values.amount!==null){const n=Number(values.amount);if(!Number.isFinite(n)||n<0)throw Error('Некорректная сумма');values.amount=n}
  const {data,error}=await db.from('contacts').update(values).eq('workspace_id',workspace).eq('id',selected).select('id');
  if(error)throw error;if(!data||data.length!==1)throw Error('Сохранение не подтверждено');
  $('v03Title').textContent=values.name;$('v03Meta').textContent=[values.company,values.profession].filter(Boolean).join(' · ');
  const local=typeof contacts!=='undefined'?contacts.find(c=>c.id===selected):null;
  if(local){Object.assign(local,values);render()}
  $('v03Status').textContent='Изменения сохранены в Supabase';
 }catch(e){$('v03Status').textContent='Ошибка сохранения: '+e.message}
 finally{busy=false;save.disabled=false}
});
// Correct stale cloud labels without changing database logic.
const copy=document.createElement('style');copy.textContent='#v03Overlay .v03-hero .small{color:#6f4b5b}';document.head.append(copy);

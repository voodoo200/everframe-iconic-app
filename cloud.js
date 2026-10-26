import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
const cfg=window.ICONIC_CONFIG||{};
const gate=document.getElementById('authGate'), status=document.getElementById('authStatus');
const setStatus=(s,error=false)=>{status.textContent=s;status.classList.toggle('error',error)};
if(!cfg.supabaseUrl?.startsWith('https://')||!cfg.supabaseAnonKey||cfg.supabaseAnonKey.startsWith('PASTE_')){
 setStatus('Система ещё не подключена к базе. Настройте config.js по инструкции SETUP.md.',true);
 document.getElementById('authSubmit').disabled=true;
}else{
 const db=createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 let user=null,workspaceId=null,busy=false;
 const cols=['name','company','profession','city','country','contact','link','type','priority','status','next','amount','reason','notes'];
 const fromDb=r=>({...Object.fromEntries(cols.map(k=>[k,r[k]??''])),id:r.id,created:r.created_at});
 const toDb=c=>({...Object.fromEntries(cols.map(k=>[k,c[k]||null])),amount:c.amount?Number(c.amount):null,next:c.next||null,workspace_id:workspaceId});
 async function refresh(){
  const {data,error}=await db.from('contacts').select('*').eq('workspace_id',workspaceId).order('created_at',{ascending:false}).limit(1000);
  if(error)throw error;
  contacts=(data||[]).map(fromDb);render();
 }
 async function initialize(){
  try{
   const {data:{user:u},error:e}=await db.auth.getUser();if(e||!u){user=null;workspaceId=null;gate.classList.remove('hide');setStatus('Войдите под своей учётной записью.');return}
   user=u;
   const {data:membership,error:me}=await db.from('workspace_members').select('workspace_id').eq('user_id',u.id).limit(1).maybeSingle();
   if(me)throw me;
   if(!membership){setStatus('Доступ не выдан. Администратор должен добавить вас в workspace_members.',true);await db.auth.signOut();return}
   workspaceId=membership.workspace_id;
   await refresh();gate.classList.add('hide');
   document.getElementById('userLine').textContent=u.email||'';
   document.getElementById('signOut').classList.remove('hide');
  }catch(e){gate.classList.remove('hide');setStatus('Ошибка подключения: '+(e.message||'неизвестная'),true)}
 }
 document.getElementById('authForm').addEventListener('submit',async e=>{
  e.preventDefault();setStatus('Проверяем доступ…');
  const email=document.getElementById('authEmail').value.trim(),password=document.getElementById('authPassword').value;
  const {error}=await db.auth.signInWithPassword({email,password});
  if(error){setStatus('Не удалось войти: '+error.message,true);return}
  await initialize();
 });
 document.getElementById('signOut').addEventListener('click',async()=>{await db.auth.signOut();contacts=[];render();gate.classList.remove('hide');setStatus('Вы вышли из системы.');});
 // В рабочем режиме все записи читаются и сохраняются только на сервере.
 document.getElementById('contactForm').removeEventListener('submit', submitContact);
submitContact=async function(e){
  e.preventDefault();if(busy||!workspaceId)return;
  const c={};fields.forEach(k=>c[k]=document.getElementById('f_'+k).value.trim());
  if(!c.name){toast('Укажите имя');return}
  if(contacts.some(x=>x.id!==editing&&((c.link&&norm(x.link)===norm(c.link))||(c.contact&&norm(x.contact)===norm(c.contact))))){toast('Возможный дубль: контакт или ссылка уже есть');return}
  busy=true;
  try{
   const payload=toDb(c);
   const res=editing?await db.from('contacts').update(payload).eq('id',editing).eq('workspace_id',workspaceId):await db.from('contacts').insert(payload);
   if(res.error)throw res.error;
   await refresh();closeEditor();toast('Сохранено в защищённой базе');
  }catch(err){toast('Не удалось сохранить: '+err.message)}finally{busy=false}
 const form = document.getElementById('contactForm');
const cleanForm = form.cloneNode(true);
form.replaceWith(cleanForm);
cleanForm.addEventListener('submit', submitContact);
 };
 removeContact=async function(){
  if(busy||!editing||!confirm('Удалить контакт без возможности отмены?'))return;
  busy=true;try{const {error}=await db.from('contacts').delete().eq('id',editing).eq('workspace_id',workspaceId);if(error)throw error;await refresh();closeEditor();toast('Контакт удалён')}catch(e){toast('Ошибка удаления: '+e.message)}finally{busy=false}
 };
 const importInput=document.getElementById('importFile');importInput.disabled=true;importInput.title='Импорт JSON будет добавлен после серверной проверки дублей';
 db.auth.onAuthStateChange((event)=>{if(event==='SIGNED_OUT'){contacts=[];render();gate.classList.remove('hide')}});
 await initialize();
}

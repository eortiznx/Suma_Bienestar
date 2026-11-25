const $ = s => document.querySelector(s);
const icons = {
  building:'<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3"/>',
  layers:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/>',
  process:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><path d="M17 14V7h-7M7 10v7h7"/>',
  search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  plus:'<path d="M12 5v14M5 12h14"/>',
  edit:'<path d="m14 5 5 5M4 15l12-12 5 5L9 20l-6 1 1-6Z"/>',
  eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  power:'<path d="M12 2v9M6 5a9 9 0 1 0 12 0"/>',
  close:'<path d="m6 6 12 12M18 6 6 18"/>',
  lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  form:'<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h4"/>',
  logout:'<path d="M10 4H4v16h6M10 12h11m-4-4 4 4-4 4"/>',
  chevron:'<path d="m9 5 7 7-7 7"/>',
  people:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 4v3"/>'
};
const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[name]||icons.form}</svg>`;
const esc = value => String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const users = [
  {id:1,name:'Ana María Torres',login:'ana.torres',access:'Caracterizar · Intervenir'},
  {id:2,name:'Luis Fernando Ríos',login:'luis.rios',access:'Caracterizar'},
  {id:3,name:'Paula Andrea Gómez',login:'paula.gomez',access:'Caracterizar · Intervenir'},
  {id:4,name:'Camilo Sánchez',login:'camilo.sanchez',access:'Caracterizar'},
  {id:5,name:'Laura Valentina Pérez',login:'laura.perez',access:'Caracterizar · Intervenir'},
  {id:6,name:'David Mendoza',login:'david.mendoza',access:'Consulta'}
];
const gforms = [
  {id:1,name:'Caracterización general de población migrante',global:true},
  {id:15,name:'Atención y orientación a población migrante',fields:['Tipo de atención','Necesidad identificada','Orientación brindada','Observaciones']},
  {id:16,name:'Seguimiento de acompañamiento social',fields:['Fecha de seguimiento','Resultado del acompañamiento','Compromisos','Observaciones']},
  {id:17,name:'Caracterización de acceso a salud',fields:['Afiliación al sistema de salud','Entidad aseguradora','Necesidad de atención','Observaciones']},
  {id:18,name:'Caracterización de acceso a educación',fields:['Nivel educativo','Situación de escolarización','Institución educativa','Observaciones']},
  {id:19,name:'Caracterización de participación cultural',fields:['Intereses culturales','Actividad de interés','Disponibilidad','Observaciones']}
];
const seed = () => ({
  dependencias:[
    {id:1,name:'Secretaría de Bienestar Social',description:'Caracterización y atención social de la población migrante.',active:true,users:[1,2,3]},
    {id:2,name:'Secretaría de Salud Pública',description:'Caracterización de necesidades y acceso a servicios de salud.',active:true,users:[4,5]},
    {id:3,name:'Secretaría de Educación',description:'Caracterización del acceso y la permanencia educativa.',active:true,users:[2,6]},
    {id:4,name:'Secretaría de Cultura',description:'Participación de la población migrante en la oferta cultural.',active:false,users:[]}
  ],
  macroprocesos:[
    {id:1,dependencyId:1,name:'Atención e inclusión social',description:'Organiza las acciones de orientación y acompañamiento social.',active:true},
    {id:2,dependencyId:2,name:'Acceso a servicios de salud',description:'Identifica necesidades relacionadas con el acceso a salud.',active:true},
    {id:3,dependencyId:3,name:'Inclusión educativa',description:'Identifica barreras para el acceso y la permanencia educativa.',active:true},
    {id:4,dependencyId:4,name:'Participación cultural',description:'Identifica intereses de participación en actividades culturales.',active:false}
  ],
  procesos:[
    {id:1,macroId:1,name:'Orientación inicial',description:'Registra las necesidades y la orientación brindada a la persona.',active:true,formId:15},
    {id:2,macroId:1,name:'Acompañamiento social',description:'Registra el seguimiento de la atención social.',active:true,formId:16},
    {id:3,macroId:2,name:'Caracterización en salud',description:'Recopila información específica de acceso a servicios de salud.',active:true,formId:17},
    {id:4,macroId:3,name:'Caracterización educativa',description:'Identifica la situación de escolarización y las necesidades educativas.',active:true,formId:18},
    {id:5,macroId:4,name:'Caracterización cultural',description:'Recopila intereses de participación cultural.',active:false,formId:19}
  ]
});
const KEY = 'suma-configuracion-v1';
let db;try {db=JSON.parse(localStorage.getItem(KEY))||seed();if(!db.dependencias||!db.macroprocesos||!db.procesos)db=seed();}catch{db=seed();}
const config={dependencias:{title:'Dependencias',singular:'dependencia',icon:'building',description:'Organiza las dependencias y vincula a los usuarios que podrán caracterizar e intervenir.',subtitle:'Dependencias vinculadas a la operación de SUMA.'},macroprocesos:{title:'Macroprocesos',singular:'macroproceso',icon:'layers',description:'Estructura los macroprocesos de cada dependencia y consulta sus procesos asociados.',subtitle:'Macroprocesos organizados por dependencia.'},procesos:{title:'Procesos',singular:'proceso',icon:'process',description:'Configura los procesos y vincula el formulario específico creado en Gforms.',subtitle:'Cada proceso pertenece a un macroproceso y utiliza un formulario de Gforms.'}};
let section='dependencias',page=1,returnFocus=null,contextDependency=null,contextMacro=null;
const dep=id=>db.dependencias.find(x=>x.id===Number(id));
const macro=id=>db.macroprocesos.find(x=>x.id===Number(id));
const proc=id=>db.procesos.find(x=>x.id===Number(id));
const parentDep=x=>section==='dependencias'?x:section==='macroprocesos'?dep(x.dependencyId):dep(macro(x.macroId)?.dependencyId);
const form=id=>gforms.find(x=>x.id===Number(id));
const badge=x=>`<span class="badge ${x.active?'active':'inactive'}">${x.active?'Activo':'Inactivo'}</span>`;
const persist=()=>{localStorage.setItem(KEY,JSON.stringify(db));};
let toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').hidden=true,4800);}
function options(items,selected,placeholder){return `<option value="">${esc(placeholder)}</option>`+items.map(x=>`<option value="${x.id}" ${Number(selected)===x.id?'selected':''}>${esc(x.name)}${x.active===false?' (Inactivo)':''}</option>`).join('');}
function route(sectionName,dependencyId,macroId){
  const query=new URLSearchParams();
  if(dependencyId)query.set('dependencia',dependencyId);
  if(macroId)query.set('macroproceso',macroId);
  return sectionName+(query.size?'?'+query.toString():'');
}
function openRoute(sectionName,dependencyId,macroId){
  const next=route(sectionName,dependencyId,macroId);
  if(location.hash.slice(1)===next)navigate(next);else location.hash=next;
}
function navigate(next){
  const [key,query]=next.split('?'),params=new URLSearchParams(query||'');
  section=key in config?key:'dependencias';
  contextMacro=section==='procesos'?macro(params.get('macroproceso')):null;
  contextDependency=section==='procesos'?dep(contextMacro?.dependencyId):section==='macroprocesos'?dep(params.get('dependencia')):null;
  if(section==='procesos'&&!contextMacro){openRoute('macroprocesos');return;}
  page=1;$('#search').value='';$('#filter-status').value='';$('#filter-dependency').value='';$('#filter-macro').value='';
  $('.sidebar').classList.remove('open');render();window.scrollTo(0,0);
}
function render(){
  const c=config[section];
  $('#main-nav').innerHTML=`<a href="#dependencias" class="${section==='dependencias'?'active':''}" ${section==='dependencias'?'aria-current="page"':''}>${svg('building')}Dependencias</a><a href="#macroprocesos" class="${section!=='dependencias'?'active':''}" ${section!=='dependencias'?'aria-current="page"':''}>${svg('layers')}Macroprocesos y procesos</a>`;
  let trail='<span>SUMA</span><span>/</span><span>Configuración</span><span>/</span>';
  if(contextDependency)trail+=`<a href="#dependencias">Dependencias</a><span>/</span><span>${esc(contextDependency.name)}</span><span>/</span>`;
  if(section==='procesos')trail+=`<a href="#${route('macroprocesos',contextDependency?.id)}">Macroprocesos</a><span>/</span><strong>Procesos</strong>`;
  else trail+=`<strong>${section==='macroprocesos'?'Macroprocesos y procesos':c.title}</strong>`;
  $('#breadcrumb').innerHTML=trail;
  $('#page-title').textContent=section==='macroprocesos'?'Macroprocesos y procesos':c.title;
  $('#page-description').textContent=section==='macroprocesos'?'Administra los macroprocesos y accede a sus procesos desde las opciones de cada registro.':section==='procesos'?'Consulta y gestiona los procesos del macroproceso seleccionado.':c.description;
  $('#new-item').innerHTML=svg('plus')+(section==='dependencias'?'Nueva ':'Nuevo ')+c.singular;
  $('#table-title').textContent='Listado de '+c.title.toLowerCase();$('#table-subtitle').textContent=section==='macroprocesos'?'Utiliza la opción «Procesos» para consultar o crear los procesos de cada macroproceso.':c.subtitle;
  const d=$('#filter-dependency'),m=$('#filter-macro'),selected=d.value;
  d.innerHTML=options(db.dependencias,contextDependency?.id||selected,'Todas las dependencias');
  d.hidden=section!=='macroprocesos'||!!contextDependency;
  m.innerHTML=options(contextMacro?[contextMacro]:[],contextMacro?.id,'Todos los macroprocesos');m.hidden=true;
  const panel=$('#context-panel');panel.hidden=!contextDependency;
  if(contextDependency)panel.innerHTML=`<div class="context-identity"><span class="context-symbol">${svg(section==='procesos'?'layers':'building')}</span><div><span class="context-label">${section==='procesos'?'MACROPROCESO':'DEPENDENCIA'}</span><h2>${esc(contextMacro?.name||contextDependency.name)}</h2><p>${section==='procesos'?esc(contextDependency.name):'Configuración de macroprocesos de esta dependencia.'}</p></div></div><button class="secondary" id="back-management">${section==='procesos'?'Volver a macroprocesos':'Volver a dependencias'}</button>`;
  if(contextDependency)$('#back-management').onclick=()=>openRoute(section==='procesos'?'macroprocesos':'dependencias',section==='procesos'?contextDependency.id:null);
  $('#permission-note').innerHTML=svg('lock')+'El acceso a caracterizar o intervenir requiere pertenecer a la dependencia y contar con los permisos correspondientes en el módulo Usuarios.';
  renderRows();
}
function renderRows(){
  const q=$('#search').value.toLocaleLowerCase('es'),d=$('#filter-dependency').value,m=$('#filter-macro').value,status=$('#filter-status').value;
  let rows=db[section].filter(x=>(!contextDependency||parentDep(x)?.id===contextDependency.id)&&(!contextMacro||x.macroId===contextMacro.id)&&(x.name+' '+x.description).toLocaleLowerCase('es').includes(q)&&(!status||String(x.active)===status)&&(!d||parentDep(x)?.id===Number(d))&&(!m||section!=='procesos'||x.macroId===Number(m)));
  const size=Number($('#page-size').value),pages=Math.max(1,Math.ceil(rows.length/size));page=Math.min(page,pages);
  const shown=rows.slice((page-1)*size,page*size);
  const columns=section==='dependencias'?['Dependencia','Usuarios vinculados','Macroprocesos','Procesos','Estado','Opciones']:section==='macroprocesos'?['Macroproceso','Dependencia','Procesos','Estado','Opciones']:['Proceso','Dependencia / Macroproceso','Formulario Gforms','Estado','Opciones'];
  $('#thead').innerHTML='<tr>'+columns.map(t=>`<th scope="col">${t}</th>`).join('')+'</tr>';
  $('#tbody').innerHTML=shown.length?shown.map(x=>{
    let middle='';
    if(section==='dependencias'){
      const us=x.users.map(id=>users.find(u=>u.id===id)).filter(Boolean),ms=db.macroprocesos.filter(a=>a.dependencyId===x.id),ps=db.procesos.filter(a=>ms.some(b=>b.id===a.macroId));
      middle=`<td><div class="people-cell">${us.slice(0,3).map(u=>`<span class="mini-avatar" title="${esc(u.name)}">${u.name.split(' ').map(t=>t[0]).slice(0,2).join('')}</span>`).join('')}<span class="people-count">${us.length?us.length+' usuarios':'Sin usuarios'}</span></div></td><td><button class="count-link" data-children="macroprocesos" data-id="${x.id}">${ms.length} ${ms.length===1?'macroproceso':'macroprocesos'}</button></td><td><span class="table-count">${ps.length} ${ps.length===1?'proceso':'procesos'}</span></td>`;
    }else if(section==='macroprocesos')middle=`<td>${esc(dep(x.dependencyId)?.name)}</td><td><button class="count-link" data-children="procesos" data-id="${x.id}" data-macro="true">${db.procesos.filter(a=>a.macroId===x.id).length} ${db.procesos.filter(a=>a.macroId===x.id).length===1?'proceso':'procesos'}</button></td>`;
    else middle=`<td><span>${esc(dep(macro(x.macroId)?.dependencyId)?.name)}</span><small class="cell-code" style="display:block;margin-top:6px">${esc(macro(x.macroId)?.name)}</small></td><td><button class="form-link" data-form="${x.formId}">${svg('form')}${esc(form(x.formId)?.name||'Sin formulario')}</button><small class="cell-code" style="display:block;margin:5px 0 0 23px">ID ${x.formId}</small></td>`;
    return `<tr><td class="name-cell"><button data-view="${x.id}">${esc(x.name)}</button><small>${esc(x.description)}</small></td>${middle}<td>${badge(x)}</td><td><div class="row-actions">${section==='dependencias'?`<button class="management-button" data-children="macroprocesos" data-id="${x.id}">${svg('layers')}Macroprocesos</button>`:section==='macroprocesos'?`<button class="management-button" data-children="procesos" data-id="${x.id}" data-macro="true">${svg('process')}Procesos</button>`:''}<button class="icon-btn" data-view="${x.id}" aria-label="Ver ${esc(x.name)}" title="Ver detalle">${svg('eye')}</button><button class="icon-btn" data-edit="${x.id}" aria-label="Editar ${esc(x.name)}" title="Editar">${svg('edit')}</button><button class="icon-btn" data-toggle="${x.id}" aria-label="${x.active?'Inactivar':'Activar'} ${esc(x.name)}" title="${x.active?'Inactivar':'Activar'}">${svg('power')}</button></div></td></tr>`;
  }).join(''):`<tr><td colspan="${columns.length}" class="empty"><strong>No se encontraron registros</strong><p style="margin:9px 0 0;font-size:.85rem">Ajusta los filtros o crea un nuevo registro.</p></td></tr>`;
  $('#results-label').textContent=rows.length?`Mostrando ${(page-1)*size+1} a ${Math.min(page*size,rows.length)} de ${rows.length} registros`:'0 registros';
  $('#page-indicator').textContent=`${page} / ${pages}`;$('#previous-page').disabled=page===1;$('#next-page').disabled=page===pages;
}
function dialog(title,subtitle,body,footer){
  const d=$('#editor');returnFocus=document.activeElement;
  $('#dialog-content').innerHTML=`<div class="dialog-header"><div><h2 id="dialog-title">${title}</h2><p>${subtitle}</p></div><button class="icon-btn" data-close aria-label="Cerrar">${svg('close')}</button></div>${body}<div class="dialog-footer">${footer}</div>`;
  d.setAttribute('aria-labelledby','dialog-title');if(!d.open)d.showModal();
}
function closeDialog(){$('#editor').close();returnFocus?.focus();}
function editItem(id){
  const c=config[section],x=id?db[section].find(a=>a.id===Number(id)):null;
  const currentD=section==='macroprocesos'?x?.dependencyId:section==='procesos'?macro(x?.macroId)?.dependencyId:null;
  const depValue=currentD||contextDependency?.id||$('#filter-dependency').value;
  let parent='';
  if(section!=='dependencias')parent=`<div class="field ${section==='macroprocesos'?'full':''}"><label for="edit-dep">Dependencia <span class="required">*</span></label><select id="edit-dep" name="dependencyId" required>${options(db.dependencias.filter(a=>a.active||a.id===currentD||a.id===contextDependency?.id),depValue,'Seleccione una dependencia')}</select></div>`;
  if(section==='procesos')parent+=`<div class="field"><label for="edit-macro">Macroproceso <span class="required">*</span></label><select id="edit-macro" name="macroId" required>${options(db.macroprocesos.filter(a=>(!depValue||a.dependencyId===Number(depValue))&&(a.active||a.id===x?.macroId||a.id===contextMacro?.id)),x?.macroId||contextMacro?.id||$('#filter-macro').value,'Seleccione un macroproceso')}</select></div>`;
  if(contextDependency){
    parent=parent.replace('id="edit-dep" name="dependencyId" required','id="edit-dep" name="dependencyId" required disabled')+`<input type="hidden" name="dependencyId" value="${depValue}">`;
  }
  if(contextMacro){
    parent=parent.replace('id="edit-macro" name="macroId" required','id="edit-macro" name="macroId" required disabled')+`<input type="hidden" name="macroId" value="${contextMacro.id}">`;
  }
  let specific='';
  if(section==='dependencias')specific=`<hr class="section-divider"><h3 class="form-section-title">Usuarios vinculados <span class="muted" style="font-weight:400;font-size:.75rem">Módulo Usuarios</span></h3><p class="hint" style="margin:-7px 0 14px">Selecciona usuarios existentes. Sus permisos para caracterizar o intervenir se gestionan en Usuarios.</p><input id="user-search" class="user-search" placeholder="Buscar usuario por nombre o login…" aria-label="Buscar usuario"><div class="user-list">${users.map(u=>`<label class="user-option" data-user-name="${esc((u.name+' '+u.login).toLowerCase())}"><input type="checkbox" name="users" value="${u.id}" ${x?.users.includes(u.id)?'checked':''}><span><strong>${esc(u.name)}</strong><small>${esc(u.login)}</small></span><span class="user-access">${esc(u.access)}</span></label>`).join('')}</div><div class="selection-count" id="selection-count"></div>`;
  if(section==='procesos')specific=`<hr class="section-divider"><h3 class="form-section-title">Formulario del proceso</h3><div class="field"><label for="edit-form">Formulario específico de Gforms <span class="required">*</span></label><select id="edit-form" name="formId" required>${options(gforms.filter(a=>!a.global),x?.formId,'Seleccione un formulario')}</select><p class="hint">Se asociará un único formulario a este proceso. Su estructura se administra en Gforms.</p><button type="button" class="text-button" id="preview-selected" style="align-self:flex-start">Consultar formulario seleccionado</button></div><div class="inline-help" style="margin-top:15px">La caracterización general es común a todas las dependencias y no se reemplaza con este formulario.</div>`;
  const title=(x?'Editar ':'Crear ')+c.singular;
  dialog(title,'Complete la información de configuración.',`<form id="item-form"><div class="dialog-body"><h3 class="form-section-title">Información general</h3><div class="form-grid">${parent}<div class="field full"><label for="edit-name">Nombre <span class="required">*</span></label><input id="edit-name" name="name" value="${esc(x?.name||'')}" maxlength="140" required></div><div class="field full"><label for="edit-description">Descripción</label><textarea id="edit-description" name="description" maxlength="800">${esc(x?.description||'')}</textarea></div><div class="field"><label for="edit-status">Estado <span class="required">*</span></label><select id="edit-status" name="active"><option value="true" ${x?.active!==false?'selected':''}>Activo</option><option value="false" ${x?.active===false?'selected':''}>Inactivo</option></select></div></div>${specific}<p class="error" id="form-error" role="alert" hidden></p></div></form>`,`<button class="secondary" data-close>Cancelar</button><button class="primary" form="item-form" type="submit">${x?'Guardar cambios':'Crear '+c.singular}</button>`);
  if(section==='dependencias'){
    const updateCount=()=>$('#selection-count').textContent=`${$('#item-form').querySelectorAll('[name=users]:checked').length} usuarios seleccionados`;
    const primary=document.createElement('div');primary.className='field principal-field';primary.innerHTML='<label for="edit-primary">Usuario principal / filtro de remisiones</label><select id="edit-primary" name="primaryUserId"></select><p class="hint">Recibe las remisiones dirigidas a la dependencia y las distribuye entre su equipo.</p>';$('#selection-count').after(primary);
 const refreshPrimary=()=>{const selected=$('#edit-primary').value||String(x?.primaryUserId||'');const linked=[...$('#item-form').querySelectorAll('[name=users]:checked')].map(i=>Number(i.value));$('#edit-primary').innerHTML=options(users.filter(u=>linked.includes(u.id)),linked.includes(Number(selected))?selected:'','Seleccione usuario principal');$('#edit-primary').required=linked.length>0;};refreshPrimary();updateCount();$('#item-form').addEventListener('change',e=>{updateCount();if(e.target.name==='users')refreshPrimary();});
    $('#user-search').oninput=e=>document.querySelectorAll('.user-option').forEach(r=>r.hidden=!r.dataset.userName.includes(e.target.value.toLowerCase()));
  }
  if(section==='procesos'){
    $('#edit-dep').onchange=e=>$('#edit-macro').innerHTML=options(db.macroprocesos.filter(a=>a.dependencyId===Number(e.target.value)&&a.active),'','Seleccione un macroproceso');
    $('#preview-selected').onclick=()=>{const f=form($('#edit-form').value);if(!f)return toast('Selecciona primero un formulario.');$('#form-error').hidden=false;$('#form-error').className='inline-help';$('#form-error').innerHTML=`<strong>${esc(f.name)} · ID ${f.id}</strong><br>Campos ilustrativos: ${f.fields.map(esc).join(', ')}.`;};
  }
  $('#item-form').onsubmit=e=>{
    e.preventDefault();const fd=new FormData(e.target),name=String(fd.get('name')).trim(),active=fd.get('active')==='true';
    const error=msg=>{$('#form-error').className='error';$('#form-error').textContent=msg;$('#form-error').hidden=false;};
    if(!name)return error('Ingrese un nombre válido.');
    const val={id:x?.id||Math.max(0,...db[section].map(a=>a.id))+1,name,description:String(fd.get('description')).trim(),active};
    if(section==='dependencias'){val.users=fd.getAll('users').map(Number);val.primaryUserId=Number(fd.get('primaryUserId'))||null;if(val.users.length&&!val.users.includes(val.primaryUserId))return error('Selecciona un usuario principal entre los usuarios vinculados.');}
    if(section==='macroprocesos')val.dependencyId=Number(fd.get('dependencyId'));
    if(section==='procesos'){val.macroId=Number(fd.get('macroId'));val.formId=Number(fd.get('formId'));}
    const sameParent=a=>section==='dependencias'||(section==='macroprocesos'?a.dependencyId===val.dependencyId:a.macroId===val.macroId);
    if(db[section].some(a=>a.id!==val.id&&sameParent(a)&&a.name.toLocaleLowerCase('es')===name.toLocaleLowerCase('es')))return error('Ya existe un registro con ese nombre en esta ubicación.');
    if(section==='macroprocesos'&&!dep(val.dependencyId))return error('Seleccione una dependencia válida.');
    if(section==='procesos'&&(!macro(val.macroId)||macro(val.macroId).dependencyId!==Number(fd.get('dependencyId'))))return error('Seleccione un macroproceso de la dependencia indicada.');
    if(section==='procesos'&&!gforms.some(a=>a.id===val.formId&&!a.global))return error('Seleccione un formulario específico de Gforms.');
    const statusError=validateStatus(val,section);if(statusError)return error(statusError);
    if(x&&section==='macroprocesos'&&x.dependencyId!==val.dependencyId&&db.procesos.some(a=>a.macroId===x.id))return error('Este macroproceso tiene procesos asociados. Conserva su dependencia para mantener la trazabilidad.');
    if(x)db[section][db[section].findIndex(a=>a.id===x.id)]=val;else db[section].push(val);
    persist();closeDialog();render();toast(x?'Cambios guardados correctamente.':'Registro creado correctamente.');
  };
}
function validateStatus(x,key){
  if(!x.active){
    if(key==='dependencias'&&db.macroprocesos.some(a=>a.dependencyId===x.id&&a.active))return 'Esta dependencia tiene macroprocesos activos. Inactívalos primero para conservar una configuración coherente.';
    if(key==='macroprocesos'&&db.procesos.some(a=>a.macroId===x.id&&a.active))return 'Este macroproceso tiene procesos activos. Inactívalos primero.';
  }else{
    if(key==='macroprocesos'&&!dep(x.dependencyId)?.active)return 'La dependencia debe estar activa para activar este macroproceso.';
    if(key==='procesos'&&(!macro(x.macroId)?.active||!dep(macro(x.macroId)?.dependencyId)?.active))return 'La dependencia y el macroproceso deben estar activos para activar este proceso.';
  }
  return '';
}
function toggleItem(id){const x=db[section].find(a=>a.id===Number(id)),next={...x,active:!x.active},problem=validateStatus(next,section);
  dialog(problem?'No es posible cambiar el estado':`${x.active?'Inactivar':'Activar'} ${config[section].singular}`,esc(x.name),`<div class="dialog-body"><p class="confirm-text">${esc(problem||(x.active?'El registro dejará de estar disponible para nuevas operaciones. Se conservarán sus relaciones y la información histórica.':'El registro volverá a estar disponible en la configuración.'))}</p></div>`,problem?'<button class="primary" data-close>Entendido</button>':`<button class="secondary" data-close>Cancelar</button><button class="${x.active?'danger-button':'primary'}" id="confirm-toggle">${x.active?'Inactivar':'Activar'}</button>`);
  if(!problem)$('#confirm-toggle').onclick=()=>{x.active=!x.active;persist();closeDialog();render();toast('Estado actualizado correctamente.');};
}
function viewItem(id){
  const x=db[section].find(a=>a.id===Number(id)),key=section;
  let details='',related='';
  if(key==='dependencias'){
    const ms=db.macroprocesos.filter(a=>a.dependencyId===x.id),us=x.users.map(i=>users.find(a=>a.id===i)).filter(Boolean);
    details=`<div class="detail-grid"><div><dt>Usuario principal</dt><dd>${esc(users.find(u=>u.id===x.primaryUserId)?.name||"Sin configurar")}</dd></div><div><dt>Usuarios vinculados</dt><dd>${us.length}</dd></div><div><dt>Macroprocesos</dt><dd>${ms.length}</dd></div><div><dt>Caracterización general</dt><dd>Formulario común · Gforms ID 1</dd></div></div>`;
    related=`<h3 class="form-section-title">Usuarios de la dependencia</h3>${us.length?us.map(u=>`<div class="related-item">${svg('people')}<div><strong>${esc(u.name)}</strong><small>${esc(u.login)} · ${esc(u.access)}</small></div></div>`).join(''):'<p class="hint">Esta dependencia aún no tiene usuarios vinculados.</p>'}<hr class="section-divider"><h3 class="form-section-title">Macroprocesos asociados</h3>${ms.map(a=>`<div class="related-item">${svg('layers')}<div><strong>${esc(a.name)}</strong><small>${db.procesos.filter(p=>p.macroId===a.id).length} procesos</small></div>${badge(a)}</div>`).join('')||'<p class="hint">No hay macroprocesos asociados.</p>'}`;
  }else if(key==='macroprocesos'){
    const ps=db.procesos.filter(a=>a.macroId===x.id);
    details=`<dl class="detail-grid"><div><dt>Dependencia</dt><dd>${esc(dep(x.dependencyId)?.name)}</dd></div><div><dt>Procesos asociados</dt><dd>${ps.length}</dd></div></dl>`;
    related='<h3 class="form-section-title">Procesos y formularios</h3>'+ (ps.map(a=>`<div class="related-item">${svg('process')}<div><strong>${esc(a.name)}</strong><small>${esc(form(a.formId)?.name)} · Gforms ID ${a.formId}</small></div>${badge(a)}</div>`).join('')||'<p class="hint">No hay procesos asociados.</p>');
  }else{
    details=`<dl class="detail-grid"><div><dt>Dependencia</dt><dd>${esc(dep(macro(x.macroId)?.dependencyId)?.name)}</dd></div><div><dt>Macroproceso</dt><dd>${esc(macro(x.macroId)?.name)}</dd></div></dl>`;
    related=`<h3 class="form-section-title">Formulario específico</h3><div class="related-item">${svg('form')}<div><strong>${esc(form(x.formId)?.name)}</strong><small>Gforms · ID ${x.formId}</small></div><button class="text-button" data-form="${x.formId}">Ver estructura</button></div><p class="inline-help">Se utiliza además del formulario de caracterización general común. El acceso depende de la vinculación del usuario a ${esc(dep(macro(x.macroId)?.dependencyId)?.name)} y de sus permisos en Usuarios.</p>`;
  }
  dialog('Detalle de '+config[key].singular,'Configuración organizacional de SUMA.',`<div class="dialog-body"><div class="detail-title"><h3>${esc(x.name)}</h3>${badge(x)}</div><p class="detail-desc">${esc(x.description||'Sin descripción.')}</p>${details}<hr class="section-divider">${related}</div>`,`<button class="secondary" data-close>Cerrar</button><button class="primary" id="detail-edit">${svg('edit')}Editar ${config[key].singular}</button>`);
  $('#detail-edit').onclick=()=>editItem(id);
}
function previewForm(id){const f=form(id);if(!f)return;
  const fields=f.global?['Tipo de documento','Número de documento','Nombres y apellidos','Fecha de nacimiento','Nacionalidad','Datos de contacto']:f.fields;
  dialog(f.global?'Caracterización general':'Formulario específico del proceso','Formulario existente en Gforms · ID '+f.id,`<div class="dialog-body"><div class="context-box">${f.global?'Formulario común para todas las dependencias.':'Formulario asociado al proceso; complementa la caracterización general.'}<br>Vista ilustrativa: la estructura definitiva se configura en Gforms.</div><div class="form-preview"><h3>${esc(f.name)}</h3><p>Campos de ejemplo para revisar la relación funcional.</p>${fields.map(t=>`<label>${esc(t)}</label><input disabled placeholder="Campo administrado en Gforms">`).join('')}</div></div>`,'<button class="primary" data-close>Cerrar</button>');
}
function showApp(){sessionStorage.setItem('suma-demo-session','true');$('#login-screen').hidden=true;$('#application').hidden=false;navigate(location.hash.slice(1));}
$('#fill-demo').onclick=()=>{$('#login-user').value='demo.suma';$('#login-pass').value='Sumademo2026!';$('#login-error').hidden=true;$('#login-form button[type=submit]').focus();};
$('#login-form').onsubmit=e=>{e.preventDefault();if($('#login-user').value==='demo.suma'&&$('#login-pass').value==='Sumademo2026!'){showApp();$('#login-pass').value='';}else{$('#login-error').textContent='Usa el botón «Completar datos de demostración» para acceder al prototipo.';$('#login-error').hidden=false;}};
$('#forgot').onclick=()=>toast('La recuperación de contraseña se realizará en el inicio de sesión institucional de la Alcaldía de Cali.');
$('#logout').innerHTML=svg('logout');$('#logout').onclick=()=>{sessionStorage.removeItem('suma-demo-session');$('#application').hidden=true;$('#login-screen').hidden=false;$('#login-user').value='';$('#login-pass').value='';window.scrollTo(0,0);};
$('#search-icon').innerHTML=svg('search');$('#structure-icon').innerHTML=svg('process');
$('#new-item').onclick=()=>editItem();
$('#menu-toggle').onclick=()=>$('.sidebar').classList.toggle('open');
$('#search').oninput=()=>{page=1;renderRows();};$('#filter-status').onchange=()=>{page=1;renderRows();};$('#filter-dependency').onchange=()=>{page=1;$('#filter-macro').value='';render();};$('#filter-macro').onchange=()=>{page=1;renderRows();};$('#page-size').onchange=()=>{page=1;renderRows();};
$('#previous-page').onclick=()=>{page--;renderRows();};$('#next-page').onclick=()=>{page++;renderRows();};
$('#reset-demo').onclick=()=>{dialog('Restablecer datos de ejemplo','Esta acción solo afecta el prototipo en este navegador.','<div class="dialog-body"><p class="confirm-text">Se descartarán los cambios locales y se recuperarán los registros iniciales de demostración.</p></div>','<button class="secondary" data-close>Cancelar</button><button class="primary" id="confirm-reset">Restablecer ejemplo</button>');$('#confirm-reset').onclick=()=>{db=seed();persist();closeDialog();render();toast('Datos de ejemplo restablecidos.');};};
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-close'))closeDialog();
  else if(b.dataset.edit)editItem(b.dataset.edit);
  else if(b.dataset.view)viewItem(b.dataset.view);
  else if(b.dataset.toggle)toggleItem(b.dataset.toggle);
  else if(b.dataset.form)previewForm(b.dataset.form);
  else if(b.dataset.nav)openRoute(b.dataset.nav);
  else if(b.dataset.children){const id=Number(b.dataset.id),isMacro=b.dataset.macro;openRoute(b.dataset.children,isMacro?macro(id)?.dependencyId:id,isMacro?id:null);}
});
window.addEventListener('hashchange',()=>navigate(location.hash.slice(1)));
$('#editor').addEventListener('click',e=>{if(e.target===$('#editor')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
if(sessionStorage.getItem('suma-demo-session')==='true')showApp();

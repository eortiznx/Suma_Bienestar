(function(root){
 const currentDep=c=>Number(c.currentDep||c.dep);
 const canManageCase=(c,d)=>!!c&&currentDep(c)===Number(d);
 const canManageReferral=(r,c,d)=>!!r&&!!c&&!r.forwarded&&canManageCase(c,d)&&Number(r.assignedDep||r.dep)===Number(d);
 const validPrincipal=d=>!!d&&d.active&&d.users.includes(Number(d.primaryUserId));
 const offerRoutes=o=>[...new Set((Array.isArray(o?.routes)?o.routes:[o?.route]).filter(x=>typeof x==='string'&&x.trim()).map(x=>x.trim()))];
 const eligibleOffers=(offers,entities,d)=>offers.filter(o=>o.active&&o.isAttention===true&&offerRoutes(o).length&&entities.some(e=>e.id===o.entity&&e.active&&Number(e.dep)===Number(d)));
 function actionError(a,deps,d){if(a.kind==='dependency'){if(Number(a.target)===Number(d))return 'Para distribuir el caso en tu equipo, selecciona Reasignar a usuario interno.';if(!validPrincipal(deps.find(d=>d.id===Number(a.target))))return 'La dependencia destino debe estar activa y tener un usuario principal vinculado.';if(!String(a.reason||'').trim())return 'Registra el motivo de la remisión.';}else if(a.kind==='user'){if(!deps.find(x=>x.id===Number(d))?.users.includes(Number(a.target)))return 'Selecciona un usuario de la dependencia actual.';if(!String(a.reason||'').trim())return 'Registra el motivo de la reasignación interna.';}return '';}
 const responseError=(s,result,response)=>['Respondida','Cerrada'].includes(s)&&(!result||!String(response||'').trim())?'Registra el resultado y la respuesta para marcar la remisión como respondida o cerrada.':'';
 const evidenceError=files=>files.some(f=>!String(f.name||'').trim()||!String(f.description||'').trim())?'Completa el nombre y adjunta un archivo por evidencia, o elimina el registro incompleto.':'';
 const api={offerRoutes,currentDep,canManageCase,canManageReferral,validPrincipal,eligibleOffers,actionError,responseError,evidenceError};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SumaWorkflow=api;
})(typeof window!=='undefined'?window:this);

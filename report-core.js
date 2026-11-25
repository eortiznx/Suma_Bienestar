/* Deterministic report calculations. No browser storage or UI dependencies. */
(function(root){
  const clean=v=>String(v??'').trim();
  const fold=v=>clean(v).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[_\s]+/g,' ');
  function date(value){
    const s=clean(value);let m=s.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/);
    if(!m){const d=s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:$|[,\s])/);if(d)m=[d[0],d[3],d[2].padStart(2,'0'),d[1].padStart(2,'0')];}
    if(!m)return '';const y=+m[1],mo=+m[2],day=+m[3];
    if(y<1||mo<1||mo>12||day<1||day>new Date(Date.UTC(y,mo,0)).getUTCDate())return '';
    return `${m[1]}-${m[2]}-${m[3]}`;
  }
  function nationality(p,countries=[]){
    const value=clean(p?.general?.nacionalidad);if(!value)return 'Sin registrar';
    return countries.find(c=>fold(c.value)===fold(value)||fold(c.label)===fold(value))?.label||value.replace(/_/g,' ');
  }
  function zone(p){
    const g=p?.general||{},city=fold(g.ciudad_residencia_text||g.ciudad_residencia);
    if(city&&!['cali','santiago de cali','76001'].includes(city))return 'Fuera de Cali';
    const value=clean(g.comuna_resid);if(!value)return 'Sin registrar';
    const m=fold(value).match(/^(?:comuna\s*)?0*(\d{1,2})$/);
    if(m&&+m[1]>=1&&+m[1]<=22)return 'Comuna '+Number(m[1]);
    return value.replace(/_/g,' ');
  }
  function months(from,to){
    const out=[];let year=+from.slice(0,4),month=+from.slice(5,7);const end=to.slice(0,7);
    while(`${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}`<=end){
      out.push(`${String(year).padStart(4,'0')}-${String(month).padStart(2,'0')}`);
      month++;if(month===13){month=1;year++;}
    }return out;
  }
  function build(data,filters,countries=[]){
    const from=date(filters.from),to=date(filters.to);
    if(!from||!to||from>to)throw Error('Selecciona un rango de fechas válido.');
    const people=data.people||[],allCases=data.cases||[],deps=data.dependencies||[],refs=data.referrals||[];
    const personBy=new Map(people.map(p=>[p.id,p])),caseBy=new Map(allCases.map(c=>[c.id,c]));
    const byDep=id=>!filters.dependency||Number(filters.dependency)===Number(id);
    const inPeriod=v=>{const d=date(v);return d&&d>=from&&d<=to;};
    const atPoint=v=>!filters.point||filters.point==='Todos los puntos'||v===filters.point;
    const demographic=p=>p&&(!filters.nationality||nationality(p,countries)===filters.nationality)&&(!filters.zone||zone(p)===filters.zone);
    const charRows=people.filter(demographic).flatMap(p=>(p.chars||[]).filter(c=>byDep(c.dep)&&inPeriod(c.at)&&atPoint(c.point||p.point||'Sin registrar')).map(c=>({person:p,dep:c.dep})));
    const cases=allCases.filter(c=>byDep(c.dep)&&inPeriod(c.at)&&atPoint(c.point)&&demographic(personBy.get(c.person)));
    const referrals=refs.filter(r=>byDep(r.dep)&&inPeriod(r.created)&&atPoint(caseBy.get(r.caseId)?.point)&&demographic(personBy.get(r.person)));
    const followups=allCases.filter(c=>byDep(c.dep)&&demographic(personBy.get(c.person))).flatMap(c=>(c.history||[]).filter(h=>h.kind==='seguimiento'&&inPeriod(h.at)&&atPoint(h.details?.point||'Sin registrar')).map(h=>({c,h})));
    const unique=xs=>new Set(xs.map(x=>x.person.id)).size;
    function group(keys,personKey,caseKey,followKey){
      return [...new Set(keys)].map(key=>({name:key,people:unique(charRows.filter(x=>personKey(x)===key)),cases:cases.filter(c=>caseKey(c)===key).length,followups:followups.filter(x=>followKey(x)===key).length}));
    }
    const depName=id=>deps.find(d=>d.id===Number(id))?.name||'Dependencia '+id;
    const byDependency=group(deps.filter(d=>byDep(d.id)).map(d=>d.name),r=>depName(r.dep),c=>depName(c.dep),x=>depName(x.c.dep));
    const n=p=>nationality(p,countries),z=p=>zone(p);
    const involved=[...charRows.map(x=>x.person),...cases.map(c=>personBy.get(c.person)),...followups.map(x=>personBy.get(x.c.person))];
    const byNationality=group(involved.map(n),r=>n(r.person),c=>n(personBy.get(c.person)),x=>n(personBy.get(x.c.person)));
    const byZone=group(involved.map(z),r=>z(r.person),c=>z(personBy.get(c.person)),x=>z(personBy.get(x.c.person)));
    const sortRows=rows=>rows.sort((a,b)=>b.cases-a.cases||b.people-a.people||a.name.localeCompare(b.name,'es',{numeric:true}));
    sortRows(byNationality);sortRows(byZone);
    const monthly=months(from,to).map(month=>({name:month,cases:cases.filter(c=>date(c.at).startsWith(month)).length,followups:followups.filter(x=>date(x.h.at).startsWith(month)).length}));
    const closed=cases.filter(c=>c.status==='Cerrado').length,answered=referrals.filter(r=>['Respondida','Cerrada'].includes(r.status)&&clean(r.response)).length,eligible=referrals.filter(r=>r.status!=='Cancelada').length;
    const counts={people:unique(charRows),cases:cases.length,followups:followups.length,closed,referrals:referrals.length,answered,closeRate:cases.length?closed/cases.length*100:null,responseRate:eligible?answered/eligible*100:null};
    return {filters:{...filters,from,to},counts,byDependency,byNationality,byZone,monthly,
      caseStates:['Abierto','En gestión','En espera','Escalado','Cerrado'].map(s=>[s,cases.filter(c=>c.status===s).length]),
      refStates:['Pendiente de envío','Enviada','En seguimiento','Respondida','Cerrada','Cancelada'].map(s=>[s,referrals.filter(r=>r.status===s).length]),
      points:[...new Set(cases.map(c=>c.point||'Sin registrar'))].map(s=>[s,cases.filter(c=>(c.point||'Sin registrar')===s).length]),
      missingNationality:cases.filter(c=>n(personBy.get(c.person))==='Sin registrar').length,
      missingZone:cases.filter(c=>z(personBy.get(c.person))==='Sin registrar').length,
      mapped:cases.filter(c=>/^Comuna \d+$/.test(z(personBy.get(c.person)))).length};
  }
  const api={date,nationality,zone,months,build};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SumaReports=api;
})(typeof window!=='undefined'?window:this);

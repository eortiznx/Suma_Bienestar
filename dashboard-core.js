/* Dashboard aggregation shares report definitions and keeps current stock separate. */
(function(root){
 const R=typeof module!=='undefined'&&module.exports?require('./report-core.js'):root.SumaReports;
 const isPending=r=>!['Respondida','Cerrada','Cancelada'].includes(r.status);
 function build(data,filters,countries=[],today){
  const report=R.build(data,filters,countries),people=new Map(data.people.map(p=>[p.id,p]));
  const matches=(record,dateKey)=>{const day=R.date(record[dateKey]),p=people.get(record.person);return p&&day&&day>=filters.from&&day<=filters.to&&(!filters.dependency||record.dep===Number(filters.dependency))&&(!filters.zone||R.zone(p)===filters.zone);};
  const cases=data.cases.filter(c=>matches(c,'at')),refs=data.referrals.filter(r=>matches(r,'created'));
  const openCases=cases.filter(c=>c.status!=='Cerrado'),pendingRefs=refs.filter(isPending);
  const last=(events,field,fallback)=>events.map(e=>R.date(e[field])).filter(Boolean).sort().at(-1)||R.date(fallback);
  const pending=[...openCases.map(c=>({kind:'case',id:c.id,code:'CAS-'+c.id,person:c.person,dependency:c.dep,label:c.type,state:c.status,owner:c.professional,updated:last(c.history||[],'at',c.at),due:'',overdue:false})),...pendingRefs.map(r=>({kind:'referral',id:r.id,code:'REM-'+r.id,person:r.person,dependency:r.dep,label:r.destination||'Remisión',state:r.status,owner:r.assignment||r.owner,updated:last(r.history||[],'date',r.created),due:R.date(r.due),overdue:!!R.date(r.due)&&R.date(r.due)<today}))].sort((a,b)=>Number(b.overdue)-Number(a.overdue)||(a.updated||'9999').localeCompare(b.updated||'9999')||a.code.localeCompare(b.code));
  const activeOffers=(data.offers||[]).filter(o=>o.active&&(data.entities||[]).some(e=>e.id===o.entity&&e.active));
  const knownOffers=activeOffers.filter(o=>Number.isSafeInteger(o.availableSeats)&&o.availableSeats>=0);
  const nationality=report.byNationality.filter(n=>n.people>0).sort((a,b)=>b.people-a.people||a.name.localeCompare(b.name,'es'));
  const monthly=report.monthly.map(m=>({...m,referrals:refs.filter(r=>R.date(r.created).slice(0,7)===m.name).length}));
  return {report,cases,refs,openCases,pendingRefs,pending,monthly,nationality,activeOffers,knownSeats:knownOffers.reduce((sum,o)=>sum+o.availableSeats,0),unknownSeats:activeOffers.length-knownOffers.length,overdue:pendingRefs.filter(r=>R.date(r.due)&&R.date(r.due)<today).length,dependenciesWithRecords:report.byDependency.filter(d=>d.people||d.cases||d.followups||refs.some(r=>data.dependencies.find(dep=>dep.id===r.dep)?.name===d.name)).length};
 }
 const api={build};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SumaDashboard=api;
})(typeof window!=='undefined'?window:this);

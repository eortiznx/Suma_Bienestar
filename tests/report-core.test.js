const assert=require('node:assert/strict');
const R=require('../dist/report-core.js');
const countries=[{value:'venezuela',label:'Venezuela'},{value:'colombia',label:'Colombia'}];
const data={dependencies:[{id:1,name:'Bienestar'},{id:2,name:'Salud'}],people:[
 {id:1,general:{nacionalidad:'venezuela',pais_nac:'colombia',comuna_resid:'comuna14'},chars:[{dep:1,at:'2026-11-01',point:'A'},{dep:2,at:'24/11/2026, 2:00:00 p. m.',point:'B'}]},
 {id:2,general:{pais_nac:'venezuela',comuna_resid:'14'},chars:[{dep:1,at:'2026-11-24',point:'A'}]},
 {id:3,general:{nacionalidad:'colombia',ciudad_residencia_text:'Bogotá',comuna_resid:'comuna1'},chars:[{dep:2,at:'2026-10-01',point:'B'}]}
],cases:[
 {id:1,person:1,dep:1,at:'2026-10-15',point:'A',status:'En gestión',history:[{kind:'seguimiento',at:'24/11/2026, 2:00:00 p. m.',details:{point:'B'}},{at:'2026-11-20',text:'REM-1: nota de remisión'}]},
 {id:2,person:1,dep:2,at:'2026-11-01',point:'B',status:'Cerrado',history:[]},
 {id:3,person:2,dep:1,at:'2026-11-24',point:'A',status:'Abierto',history:[]},
 {id:4,person:3,dep:2,at:'2026-12-01',point:'B',status:'Abierto',history:[]}
],referrals:[{id:1,caseId:2,person:1,dep:2,created:'2026-11-15',status:'Respondida',response:'Atendida'},{id:2,caseId:3,person:2,dep:1,created:'2026-11-24',status:'Cancelada'}]};
const f={from:'2026-11-01',to:'2026-11-24',dependency:'',point:'',nationality:'',zone:''};
const out=R.build(data,f,countries);
assert.equal(out.counts.people,2,'consolidado deduplica personas entre dependencias');
assert.deepEqual(out.byDependency.map(r=>r.people),[2,1]);
assert.equal(out.counts.cases,2,'incluye ambos límites y excluye casos fuera del periodo');
assert.equal(out.counts.followups,1,'cuenta seguimiento en periodo aunque el caso sea anterior, sin contar notas de remisión');
assert.equal(out.counts.closeRate,50);assert.equal(out.counts.responseRate,100,'excluye canceladas del denominador');
assert.equal(out.missingNationality,1,'no deduce nacionalidad desde país de nacimiento');
assert.equal(out.mapped,2);assert.equal(out.byZone[0].name,'Comuna 14','normaliza ambos formatos heredados');
assert.equal(R.zone(data.people[2]),'Fuera de Cali');
const subset=R.build(data,{...f,dependency:'2',nationality:'Venezuela',zone:'Comuna 14',point:'B'},countries);
assert.equal(subset.counts.cases,1);assert.equal(subset.counts.people,1);
const followOnly=R.build(data,{...f,dependency:'1',point:'B'},countries);
assert.equal(followOnly.counts.followups,1);assert.equal(followOnly.counts.cases,0,'filtra por punto del seguimiento conservado');
const empty=R.build(data,{...f,from:'2027-01-01',to:'2027-03-31'},countries);
assert.equal(empty.counts.closeRate,null);assert.equal(empty.counts.responseRate,null);
assert.deepEqual(empty.monthly.map(r=>r.cases),[0,0,0],'incluye meses sin atención');
assert.throws(()=>R.build(data,{...f,from:'2026-12-01'},countries));
assert.throws(()=>R.build(data,{...f,from:'',to:'2026-02-30'},countries));
assert.equal(R.date('31/12/2026, 8:00:00 p. m.'),'2026-12-31');
assert.equal(R.date('2026-02-30'),'');
console.log('Report calculations: 20 assertions passed.');

const assert=require('node:assert/strict');
const D=require('../dist/dashboard-core.js');
const filters={from:'2026-11-01',to:'2026-11-24',dependency:'',zone:'',point:'',nationality:''};
const data={dependencies:[{id:1,name:'Bienestar'},{id:2,name:'Salud'}],people:[
 {id:1,general:{nacionalidad:'Venezuela',comuna_resid:'14'},chars:[{dep:1,at:'2026-11-01'},{dep:2,at:'2026-11-24'}]},
 {id:2,general:{pais_nac:'Colombia',comuna_resid:'comuna1'},chars:[]}
],cases:[
 {id:1,person:1,dep:1,at:'2026-11-01',status:'Abierto',history:[{at:'2026-11-20'},{at:'2026-11-10'}]},
 {id:2,person:2,dep:1,at:'2026-11-24',status:'Cerrado'},
 {id:3,person:1,dep:1,at:'2026-10-31',status:'Abierto'}
],referrals:[
 {id:1,person:1,dep:1,created:'2026-11-01',status:'En seguimiento',due:'2026-11-23',history:[{date:'2026-11-21'}]},
 {id:2,person:1,dep:2,created:'2026-11-24',status:'Pendiente de envío',due:'2026-11-24'},
 {id:3,person:1,dep:1,created:'2026-11-10',status:'Cancelada',due:'2026-11-01'},
 {id:4,person:1,dep:1,created:'2026-11-10',status:'Cerrada',response:'Atendida'},
 {id:5,person:2,dep:1,created:'2026-11-10',status:'Enviada',due:'fecha inválida'},
 {id:6,person:1,dep:1,created:'2026-10-31',status:'Enviada',due:'2026-11-01'}
],entities:[{id:1,active:true},{id:2,active:false}],offers:[
 {id:1,entity:1,active:true,availableSeats:5},
 {id:2,entity:1,active:true,availableSeats:null},
 {id:3,entity:1,active:false,availableSeats:50},
 {id:4,entity:2,active:true,availableSeats:50}
]};
const out=D.build(data,filters,[],'2026-11-24');
assert.equal(out.report.counts.people,1,'deduplica caracterizaciones entre dependencias');
assert.equal(out.openCases.length,1,'usa cohorte de creación y excluye cerrados');
assert.equal(out.pendingRefs.length,3,'excluye canceladas, cerradas y fuera del periodo');
assert.equal(out.overdue,1,'vence antes de hoy; no vence hoy ni fechas inválidas');
assert.equal(out.pending[0].code,'REM-1','prioriza fecha vencida sobre antigüedad');
assert.equal(out.pending.find(r=>r.code==='CAS-1').updated,'2026-11-20','toma último movimiento aunque historial esté desordenado');
assert.equal(out.monthly[0].referrals,5,'tendencia incluye todas las remisiones creadas, también cerradas/canceladas');
assert.equal(out.knownSeats,5,'solo suma oferta y entidad activas');
assert.equal(out.unknownSeats,1,'cupos desconocidos no se convierten en cero');
assert.equal(out.activeOffers.length,2);
const byZone=D.build(data,{...filters,zone:'Comuna 1'},[],'2026-11-24');
assert.equal(byZone.cases.length,1);assert.equal(byZone.refs.length,1,'filtro territorial alcanza remisiones');
const byDep=D.build(data,{...filters,dependency:'2'},[],'2026-11-24');
assert.equal(byDep.refs.length,1);assert.equal(byDep.openCases.length,0);
assert.equal(byDep.dependenciesWithRecords,1,'una dependencia puede tener solo remisiones');
assert.equal(byDep.knownSeats,5,'catálogo actual no se limita al periodo o dependencia');
const empty=D.build(data,{...filters,from:'2027-01-01',to:'2027-02-28'},[],'2027-02-28');
assert.equal(empty.pending.length,0);assert.deepEqual(empty.monthly.map(m=>m.referrals),[0,0]);
assert.equal(empty.report.counts.closeRate,null);assert.equal(empty.knownSeats,5);
console.log('Dashboard calculations: 20 assertions passed.');

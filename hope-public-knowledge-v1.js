/* Hope public Q&A: reviewed local read-only records. */
(function(global){"use strict";
let records=[],state="loading";
const normalize=s=>String(s||"").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const ready=fetch("./knowledge/question-records.v1.json",{cache:"no-store"}).then(r=>{if(!r.ok)throw Error("unavailable");return r.json()}).then(d=>{if(d.schema!=="hope-public-qa-v1"||!Array.isArray(d.records))throw Error("schema");records=d.records.filter(x=>x.status==="approved"&&typeof x.response==="string");state="ready";return records.length}).catch(()=>{state="unavailable";return 0});
function reply(message){if(state!=="ready")return null;const q=normalize(message);if(q.length<8)return null;const scored=records.map(r=>{const target=normalize(r.question);const exact=q===target?100:0;const words=(r.keywords||[]).filter(w=>{const n=normalize(w);return n.length>4&&(" "+q+" ").includes(" "+n+" ")}).length;return {r,score:exact+words};}).sort((a,b)=>b.score-a.score);return scored[0]&&scored[0].score>=2?scored[0].r.response:null;}
global.HopePublicKnowledge=Object.freeze({ready,reply,status:()=>state,count:()=>records.length});
})(window);

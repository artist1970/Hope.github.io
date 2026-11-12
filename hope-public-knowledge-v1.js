/* Hope public reviewed knowledge v2: exact and conservative multi-keyword match.
 * No visitor text is transmitted; no private CORE or unpublished drafts.
 */
(function(global){"use strict";
let records=[],state="loading";
const norm=s=>String(s||"").normalize("NFKC").toLowerCase().replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
const sensitive=/\b(?:password|social security|ssn|account number|credit card|private record|access token|self harm|suicide|kill myself|overdose|medical emergency|immediate danger|graded assessment|answer key)\b/i;
const ready=fetch("./knowledge/question-records.v1.json",{cache:"no-store",credentials:"same-origin"}).then(r=>{
 if(!r.ok)throw Error("unavailable");return r.json();
}).then(data=>{
 if(!data||data.schema!=="hope-public-qa-v1"||!Array.isArray(data.records)||data.records.length!==20)throw Error("schema");
 const ids=new Set(),questions=new Set(),safe=[];
 for(const r of data.records){
  if(!r||r.status!=="approved"||typeof r.id!=="string"||!r.id||
   typeof r.question!=="string"||r.question.length>350||typeof r.response!=="string"||
   !r.response.trim()||r.response.length>2000||!Array.isArray(r.keywords)||
   r.keywords.some(k=>typeof k!=="string"||k.length>90)||ids.has(r.id)||questions.has(norm(r.question)))throw Error("unreviewed-or-malformed");
  ids.add(r.id);questions.add(norm(r.question));safe.push(r);
 }
 records=safe;state="ready";return records.length;
}).catch(()=>{records=[];state="unavailable";return 0});
function reply(message){
 if(state!=="ready"||sensitive.test(message))return null;
 const query=norm(message);if(query.length<8)return null;
 const tokens=new Set(query.split(" ").filter(w=>w.length>=4));
 const ranked=records.map(r=>{
  const exact=query===norm(r.question);
  const matches=[...new Set(r.keywords.map(norm))].filter(w=>tokens.has(w)).length;
  return {record:r,score:exact?100:matches>=2?matches*10:0};
 }).sort((a,b)=>b.score-a.score);
 if(!ranked.length||ranked[0].score<20)return null;
 if(ranked[1]&&ranked[0].score===ranked[1].score)return null;
 return ranked[0].record.response;
}
global.HopePublicKnowledge=Object.freeze({ready,reply,status:()=>state,count:()=>records.length});
})(window);

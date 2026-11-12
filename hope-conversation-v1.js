/* Hope conversational companion v1 — local, ephemeral, no accounts or uploads. */
(function(){"use strict";
const ask=document.getElementById("ask"),input=document.getElementById("message"),result=document.getElementById("result"),mode=document.getElementById("mode");
if(!ask||!input||!result||!mode)return;
let turns=0,lastTopic="";
const has=(s,words)=>words.some(w=>s.includes(w));
function answer(raw){
const s=raw.toLowerCase().trim().slice(0,1500);turns++;
if(!s)return "You can begin with one sentence, or choose a support area above.";
if(has(s,["suicide","kill myself","hurt myself","self harm","self-harm","end my life"])){
return "I'm concerned about your safety. Please tell a trusted adult or someone physically nearby right now. If you're in the U.S., call or text 988 for immediate crisis support; if you are in immediate danger, call emergency services. You deserve real-time human support.";
}
if(has(s,["can't breathe","cannot breathe","overdose","severe bleeding","immediate danger","being attacked"])){
return "This may be an emergency. Please contact local emergency services now and alert a trusted person nearby. I cannot provide emergency response.";
}
if(has(s,["password","social security number","ssn","bank account","credit card"])){
return "Please do not share passwords, identity numbers, financial details, or private documents here. We can discuss the next step without those details.";
}
if(/^(hi|hello|hey|good morning|good evening)[!. ]*$/.test(s))return "Hello. I'm Hope. You can start wherever you are, and we can take one manageable step together. What would help most today?";
if(/^(thank you|thanks)[!. ]*$/.test(s))return "You're welcome. You can return to this whenever you need to.";
const language=globalThis.CreativeSparkLanguageRequest?.answer(raw,{mentorId:"hope"});
if(language)return language;
let topic="";let guidance="";
if(has(s,["evict","rent","housing","shelter","homeless","nowhere to stay"])){topic="housing";guidance="Would it help to make a short plan for immediate safety, a housing-support call, or the documents to gather? If shelter is needed tonight, contact a local housing crisis service or 211 where available; availability must be confirmed.";}
else if(has(s,["food","hungry","groceries","pantry"])){topic="food";guidance="We can start with one practical question: do you need food today, or are you planning for the coming week? Local food banks or 211 may help identify options, but hours and availability need checking.";}
else if(has(s,["veteran","military","service member"])){topic="veterans";guidance="We can organize your question for a veterans' support office or benefits counselor. Which kind of support matters most: health, housing, employment, or benefits? I cannot verify eligibility here.";}
else if(has(s,["medication","medicine","doctor","clinic","health insurance"])){topic="health";guidance="I can help prepare questions for a clinician, pharmacist, or coverage office, but cannot diagnose or promise treatment access. Is the next step about an appointment, cost, or understanding instructions?";}
else if(has(s,["bully","bullied","harass","unsafe at school"])){topic="school safety";guidance="You deserve to be treated respectfully. If someone is threatening or hurting you, tell a trusted adult or school safeguarding contact. Would you like help putting what happened into clear words?";}
else if(has(s,["homework","schoolwork","class","lesson","study","grade"])){topic="school";guidance="We can choose one manageable task and one person to ask for support. Archaemenes is the Academy mentor for lessons and academic pathways. What is the smallest part that feels stuck?";}
else if(has(s,["benefits","application","documents","forms","financial","job","work"])){topic="planning";guidance="We can make a short checklist: what is the goal, what deadline is known, and which official source can confirm requirements? You don't need to share private numbers or documents.";}
else if(has(s,["anxious","overwhelmed","stressed","scared","worried","sad","lonely"])){topic="feelings";guidance="That sounds difficult. Would it help to name the part that feels heaviest, or choose one small action and someone trustworthy to speak with?";}
else {topic=lastTopic||"support";guidance="I hear you. Would you prefer that I listen, help organize the situation, or suggest one small next step? You can share only what feels comfortable.";}
lastTopic=topic;
const curated=globalThis.HopePublicKnowledge?.reply(raw);
if(curated && topic!=="health" && topic!=="school safety")return curated;
/* An attributed source for optional educational/creative questions only.
 * Consequential support always stays with Hope's own careful guidance.
 * No transcript or query is transmitted; the federation preloads public static banks. */
const lowRisk=/\b(?:poetry|poem|painting|drawing|sketch|composition|story writing|grammar|vocabulary|learn french|language practice|art technique|study method)\b/i.test(raw);
const highRisk=/\b(?:shelter|housing|rent|evict|food|hungry|benefit|disability|health|medicine|medication|insurance|legal|court|financial|emergency|crisis|unsafe|violence|hurt|suicide|self harm|password|account|personal|bank|student record)\b/i.test(raw);
if(lowRisk&&!highRisk){
 const ref=globalThis.CreativeSparkMentorQA?.answer(raw,{mentorId:"hope",scope:"hope-support"});
 if(ref)return "A related public educational answer from "+ref.sourceName+": "+ref.answer+" (Source: "+ref.sourceName+" · "+ref.topic+".) I can help you find a supportive next step if you'd like.";
}

const lead=mode.value==="reflect"?"Let's make room for what happened and what you need. ":mode.value==="encourage"?"You do not have to solve everything at once. ":mode.value==="refer"?"We can identify the right kind of support without assuming it is available. ":mode.value==="counsel"?"Thank you for sharing what you can. ":"Let's take this one step at a time. ";
return lead+guidance;
}
// Preserve each turn on this page only. No messages are transmitted or persisted.
result.replaceChildren();
result.setAttribute("role","log");
result.setAttribute("aria-label","Conversation with Hope");
result.style.cssText+=";display:flex;flex-direction:column;gap:12px;max-height:480px;min-height:150px;overflow-y:auto;padding:14px";
function append(who,text){
 const box=document.createElement("div");box.className="hope-turn";box.dataset.speaker=who==="You"?"you":"hope";
 box.style.cssText="padding:12px 14px;border:1px solid currentColor;border-radius:7px;max-width:94%;align-self:"+(who==="You"?"flex-end":"flex-start");
 const name=document.createElement("strong");name.textContent=who;name.style.cssText="display:block;font-weight:400;font-size:16px";
 const paragraph=document.createElement("p");paragraph.textContent=text;paragraph.style.cssText="margin:5px 0 0;white-space:pre-wrap;font-size:16px;line-height:1.65";
 box.append(name,paragraph);result.append(box);result.scrollTop=result.scrollHeight;
}
append("Hope","Hope is here. You can begin with one sentence. This conversation stays on this page only.");
function submit(event){
 if(event){event.preventDefault();event.stopImmediatePropagation?.();}
 const message=input.value.trim().slice(0,1500);if(!message)return;
 input.value="";append("You",message);
 const reply=answer(message);
 append("Hope",reply);input.focus({preventScroll:true});
}
ask.addEventListener("click",submit,true);
input.addEventListener("keydown",event=>{if(event.key==="Enter"&&!event.shiftKey&&!event.isComposing){event.preventDefault();submit();}});
document.getElementById("hope-clear")?.addEventListener("click",()=>{result.replaceChildren();input.value="";turns=0;lastTopic="";append("Hope","A fresh beginning. You can share as much or as little as you choose.");input.focus({preventScroll:true});});
})();

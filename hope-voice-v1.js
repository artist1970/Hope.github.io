/* Hope public speech palette. Auto-reading is opt-in, saved and user-controlled. */
(()=>{"use strict";
const log=document.getElementById("result");if(!log)return;
const panel=document.createElement("div");panel.style.cssText="display:flex;flex-wrap:wrap;align-items:center;gap:9px;margin:15px 0;padding:13px;border:1px solid currentColor;border-radius:7px";
const label=document.createElement("label");label.textContent="Hope's voice";label.htmlFor="hope-voice-select";label.style.cssText="font-size:16px";
const select=document.createElement("select");select.id="hope-voice-select";select.style.cssText="min-width:180px;max-width:100%;flex:1;padding:10px;background:#f4f0e7;color:#243038;border:1px solid #a58d7e;border-radius:7px;font-size:16px";
const autoplay=document.createElement("button");autoplay.type="button";autoplay.textContent="Voice Off";autoplay.className="action";autoplay.setAttribute("aria-pressed","false");autoplay.setAttribute("aria-label","Toggle automatic narration of Hope replies");
const preview=document.createElement("button");preview.type="button";preview.textContent="Preview voice";preview.className="action";
const stop=document.createElement("button");stop.type="button";stop.textContent="Stop audio";stop.className="action";
const status=document.createElement("p");status.setAttribute("role","status");status.setAttribute("aria-live","polite");status.style.cssText="margin:0;width:100%;font-size:16px";status.textContent="Speech is optional and never starts automatically.";
panel.append(label,select,autoplay,preview,stop,status);
log.insertAdjacentElement("afterend",panel);
const supported="speechSynthesis" in window&&"SpeechSynthesisUtterance" in window;
const preference="vnv.public.voice.hope.v1",key=v=>JSON.stringify([v.voiceURI||"",v.name||"",v.lang||"",!!v.localService]);
let voices=[],choice="auto",autoRead=false;
const autoPreference="vnv.public.voice.autoplay.hope.v1";
try{autoRead=localStorage.getItem(autoPreference)==="on";}catch{}
try{const stored=localStorage.getItem(preference);if(stored&&stored.length<500)choice=stored;}catch{}
const voiceLabel=v=>(v.name||"Unnamed")+" · "+(v.lang||"unknown")+(v.localService?" · device":" · browser/service");
function automatic(){return voices.find(v=>/^en/i.test(v.lang||"")&&v.localService)||voices.find(v=>/^en/i.test(v.lang||""))||voices[0]||null;}
function selected(){return choice==="auto"?automatic():voices.find(v=>key(v)===choice)||automatic();}
function refresh(){
 if(!supported)return;
 voices=Array.from(window.speechSynthesis.getVoices()||[]);select.replaceChildren();
 const defaultOption=document.createElement("option");defaultOption.value="auto";defaultOption.textContent="Automatic · gentle narrator";select.append(defaultOption);
 const seen=new Set();
 for(const v of voices){const k=key(v);if(seen.has(k))continue;seen.add(k);const o=document.createElement("option");o.value=k;o.textContent=voiceLabel(v);select.append(o);}
 if(choice!=="auto"&&!seen.has(choice)&&voices.length){choice="auto";status.textContent="Previous voice unavailable; automatic mode restored.";}
 select.value=choice;
}
function speak(text){
 if(!supported){status.textContent="Speech playback is unavailable in this browser.";return;}
 try{
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(String(text||"").slice(0,2400));const voice=selected();
  if(voice){utterance.voice=voice;utterance.lang=voice.lang;}else utterance.lang="en-US";
  utterance.rate=.85;utterance.volume=.8;
  utterance.onstart=()=>{status.textContent="Reading with "+(voice?.name||"browser default")+"."};
  utterance.onend=()=>{status.textContent="Playback finished."};
  utterance.onerror=()=>{status.textContent="Speech playback interrupted or unavailable."};
  window.speechSynthesis.speak(utterance);
 }catch{status.textContent="Speech playback is unavailable on this device.";}
}
function decorate(readNew=false){
 for(const turn of log.querySelectorAll('.hope-turn[data-speaker="hope"]')){
  if(turn.querySelector(".hope-replay"))continue;
  const p=turn.querySelector("p");if(!p)continue;
  const t=p.textContent;const button=document.createElement("button");button.type="button";button.className="action hope-replay";button.textContent="Listen to this reply";
  button.style.cssText="display:block;margin-top:9px;font-size:16px";
  button.addEventListener("click",()=>speak(t));turn.append(button);
  if(readNew&&autoRead&&t)speak(t);
 }
}
decorate();
if("MutationObserver" in window){
 const o=new MutationObserver(changes=>{
   if(!changes.some(change=>change.type==="childList"&&Array.from(change.addedNodes||[]).some(n=>n.parentNode===log)))return;
   decorate(true);
 });
 o.observe(log,{childList:true});
}
function renderAutoplay(){
 autoplay.textContent=autoRead?"Voice On":"Voice Off";
 autoplay.setAttribute("aria-pressed",String(autoRead));
}
renderAutoplay();
autoplay.addEventListener("click",()=>{
 if(!supported)return;
 autoRead=!autoRead;
 try{localStorage.setItem(autoPreference,autoRead?"on":"off");}catch{}
 if(!autoRead)window.speechSynthesis.cancel();
 renderAutoplay();
 status.textContent=autoRead?"New replies will be narrated automatically.":"Automatic narration is off; manual playback remains available.";
});
select.addEventListener("change",()=>{choice=select.value||"auto";try{localStorage.setItem(preference,choice);}catch{}status.textContent="Selected voice: "+(selected()?voiceLabel(selected()):"browser default");});
preview.addEventListener("click",()=>speak("Hello, I am Hope. We can take this one step at a time."));
stop.addEventListener("click",()=>{if(supported)window.speechSynthesis.cancel();status.textContent="Audio stopped.";});
if(supported){refresh();window.speechSynthesis.addEventListener?.("voiceschanged",refresh);}
else{select.disabled=true;autoplay.disabled=true;preview.disabled=true;stop.disabled=true;status.textContent="Speech playback is unavailable in this browser.";}
})();

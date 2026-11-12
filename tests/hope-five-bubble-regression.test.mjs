import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import vm from "node:vm";
const read=name=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
const html=read("index.html"),chat=read("hope-conversation-v1.js"),voice=read("hope-voice-v1.js"),knowledge=read("hope-public-knowledge-v1.js"),federation=read("creative-spark-mentor-qa-v1.js"),css=read("styles/hope-landing-refinement-v1.css");
const bank=JSON.parse(read("knowledge/question-records.v1.json"));
test("twenty approved support Q&As remain intact",()=>{
 assert.equal(bank.records.length,20);
 assert.equal(new Set(bank.records.map(x=>x.id)).size,20);
 assert.ok(bank.records.every(x=>x.status==="approved"&&x.response));
});
test("only one Ask Hope handler remains; starter buttons do not submit",()=>{
 assert.doesNotMatch(html,/getElementById\(["']ask["']\)\.onclick/);
 assert.match(chat,/ask\.addEventListener\("click",submit,true\)/);
 assert.match(html,/querySelectorAll\("\[data-prompt\]"\)/);
 assert.match(chat,/paragraph\.textContent=text/);
 assert.doesNotMatch(chat,/localStorage|sessionStorage|indexedDB|innerHTML/);
});
test("canonical CORE HTML is no longer exposed by page, and private core code is never loaded",()=>{
 assert.doesNotMatch(html,/HopeCore\.html|Hope_Sovereign_AGI\.html/);
 assert.doesNotMatch(html,/ai-Hope\/app\/|core_private\.json/);
 assert.match(html,/src="hope-conversation-v1\.js"/);
});
test("Hope receives approved educational references, never raw high-risk support references",()=>{
 assert.ok(html.indexOf("creative-spark-mentor-qa-v1.js")<html.indexOf("hope-conversation-v1.js"));
 assert.match(federation,/hope:"Hope"/);
 assert.match(chat,/lowRisk&&!highRisk/);
 assert.match(chat,/sourceName/);
 assert.match(chat,/if\(has\(s,\["suicide"/);
 assert.match(chat,/if\(has\(s,\["can't breathe"/);
 assert.match(chat,/if\(has\(s,\["password"/);
});
test("knowledge retrieval rejects ambiguous questions and sensitive requests",async()=>{
 let window={};const allowed={schema:"hope-public-qa-v1",records:bank.records};
 const context={window,fetch:async()=>({ok:true,json:async()=>allowed})};
 vm.runInNewContext(knowledge,context,{timeout:1200});
 assert.equal(await window.HopePublicKnowledge.ready,20);
 assert.equal(window.HopePublicKnowledge.count(),20);
 assert.equal(window.HopePublicKnowledge.reply("password bank account"),null);
 assert.equal(window.HopePublicKnowledge.reply("how do I prepare to seek housing support?"),bank.records.find(x=>x.topic==="housing").response);
 assert.equal(window.HopePublicKnowledge.reply("hi"),null);
});
test("Voice On/Off persists only a preference; reading new replies is opt-in",()=>{
 assert.match(voice,/autoplay\.textContent=autoRead\?"Voice On":"Voice Off"/);
 assert.match(voice,/aria-pressed/);
 assert.match(voice,/vnv\.public\.voice\.autoplay\.hope\.v1/);
 assert.match(voice,/if\(readNew&&autoRead&&t\)speak\(t\)/);
 assert.match(voice,/if\(!autoRead\)window\.speechSynthesis\.cancel\(\)/);
 assert.match(voice,/Listen to this reply/);
 assert.doesNotMatch(voice,/localStorage\.setItem\([^,]+,\s*(?:text|message|reply)\)/);
});
test("safe public resource links and design anchors are declared",()=>{
 for(const url of ["https://211.org/","https://988lifeline.org/","https://www.va.gov/resources/getting-started-with-va/"])assert.ok(html.includes(url));
 assert.match(html,/availability/);
 assert.match(html,/class="hope-section-anchor"/);
 assert.match(html,/id="hope-introduction"/);
 assert.match(css,/\.hope-section-anchor\{position:sticky/);
 assert.match(css,/--r:7px/);
 assert.match(html,/vnv-ecosystem-toolbar\.js/);
 assert.match(html,/vnv-333-ticker\.js/);
 assert.equal((html.match(/<h1\b/g)||[]).length,1);
});

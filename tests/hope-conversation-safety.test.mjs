import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
const chat=readFileSync(new URL('../hope-conversation-v1.js',import.meta.url),'utf8');
const voice=readFileSync(new URL('../hope-voice-v1.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
function element(tag='div'){
 const events={};return {tag,events,children:[],value:'',textContent:'',style:{cssText:''},dataset:{},disabled:false,scrollTop:0,scrollHeight:300,
 setAttribute(){},append(...nodes){this.children.push(...nodes)},replaceChildren(...nodes){this.children=[...nodes]},
 insertAdjacentElement(){},addEventListener(type,fn){events[type]=fn},focus(){this.focused=true},
 querySelector(selector){return selector==='p'?this.children.find(x=>x.tag==='p'):null},
 querySelectorAll(){return []}};
}
function setup(){
 const elements=new Map(['ask','message','result','mode','hope-clear'].map(k=>[k,element()]));
 elements.get('mode').value='guide';
 const document={getElementById:id=>elements.get(id)||null,createElement:element};
 const context={document,globalThis:{},console};
 vm.runInNewContext(chat,context,{timeout:1000});
 return{get:id=>elements.get(id),send(text){elements.get('message').value=text;elements.get('ask').events.click({preventDefault(){},stopImmediatePropagation(){}})},lines(){return elements.get('result').children.map(x=>({speaker:x.dataset.speaker,message:x.children[1]?.textContent}))}};
}
test('Hope preserves all turns in a single session-only transcript',()=>{
 const a=setup();a.send('hello');a.send('I need help with homework');
 assert.equal(a.lines().length,5);
 assert.equal(a.lines()[1].speaker,'you');
 assert.equal(a.lines()[2].speaker,'hope');
 assert.equal(a.lines()[3].message,'I need help with homework');
});
test('Existing crisis and emergency guidance is preserved verbatim',()=>{
 const a=setup();a.send('I want to kill myself');
 assert.match(a.lines().at(-1).message,/call or text 988/);
 a.send("I can't breathe");
 assert.match(a.lines().at(-1).message,/emergency services now/);
 a.send('My password was lost');
 assert.match(a.lines().at(-1).message,/Please do not share passwords/);
});
test('Enter sends and Shift Enter keeps writing',()=>{
 const a=setup(),input=a.get('message');input.value='hello';let blocked=false;
 input.events.keydown({key:'Enter',shiftKey:false,isComposing:false,preventDefault(){blocked=true}});
 assert.equal(blocked,true);assert.equal(a.lines().length,3);
 blocked=false;input.events.keydown({key:'Enter',shiftKey:true,preventDefault(){blocked=true}});
 assert.equal(blocked,false);
});
test('Clear removes the transcript and resets support context',()=>{
 const a=setup();a.send('I need help with rent');a.get('hope-clear').events.click();
 assert.equal(a.lines().length,1);
 assert.match(a.lines()[0].message,/fresh beginning/);
});
test('Hope speech is user-initiated, browser-only and offers all voices',()=>{
 assert.match(html,/src="hope-voice-v1\.js"/);
 assert.match(voice,/getVoices\(\)/);
 assert.match(voice,/Listen to this reply/);
 assert.match(voice,/Preview voice/);
 assert.doesNotMatch(voice,/\bfetch\s*\(|XMLHttpRequest|indexedDB/);
});
test('No conversation text is saved or injected as markup',()=>{
 assert.doesNotMatch(chat,/localStorage|sessionStorage|indexedDB|innerHTML/);
 assert.match(chat,/paragraph\.textContent=text/);
});

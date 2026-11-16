/* Winter, for Two — the bridge.
   You play with your hands; your companion plays with words. These helpers carry
   words across: an invitation you copy to your companion, their reply pasted back
   in (read forgivingly), and a few things kept in this browser. English and
   繁體中文. No dependencies, no servers, no tracking.
   Source of truth for the block inlined into every page by tools/inline-shared.py.
   Edit here, then run:  python3 tools/inline-shared.py */
(function(){
'use strict';
const W4 = window.W4 = {};
const NS = 'w4t:';

/* ---------- storage: never throws (private windows, blocked storage) ---------- */
W4.store = {
  get(k, d){ try{ const v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(NS + k, JSON.stringify(v)); return true; }catch(e){ return false; } },
  del(k){ try{ localStorage.removeItem(NS + k); }catch(e){} }
};

/* ---------- language ---------- */
W4.lang = (function(){
  let p = null;
  try{ p = new URLSearchParams(location.hash.slice(1)).get('lang') || new URLSearchParams(location.search).get('lang'); }catch(e){}
  if(p === 'zh' || p === 'en'){ W4.store.set('lang', p); return p; }
  const s = W4.store.get('lang', null);
  if(s === 'zh' || s === 'en') return s;
  return /^zh/i.test(navigator.language || '') ? 'zh' : 'en';
})();
W4.zh = W4.lang === 'zh';
document.documentElement.lang = W4.zh ? 'zh-Hant' : 'en';
const DICT = { en: {}, zh: {} };
W4.i18n = function(d){ for(const l in d){ DICT[l] = Object.assign(DICT[l] || {}, d[l]); } if(document.readyState !== 'loading') W4.applyI18n(); };
W4.t = function(key, vars){
  let s = DICT[W4.lang][key]; if(s === undefined) s = DICT.en[key]; if(s === undefined) return key;
  if(typeof s === 'function') return s(vars || {});
  return vars ? String(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? '' : vars[k])) : s;
};
/* pick the right string from an { en, zh } pair */
W4.L = o => (o && typeof o === 'object' && ('en' in o || 'zh' in o)) ? (o[W4.lang] != null ? o[W4.lang] : o.en) : o;
W4.applyI18n = function(root){
  const r = root || document;
  r.querySelectorAll('[data-i18n]').forEach(el => { el.innerHTML = W4.t(el.dataset.i18n); });
  r.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = W4.t(el.dataset.i18nPh); });
  r.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', W4.t(el.dataset.i18nAria)); });
  r.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = W4.t(el.dataset.i18nTitle); });
};
W4.setLang = l => { W4.store.set('lang', l); location.reload(); };

W4.i18n({
  en: { site: 'Winter, for Two', who: 'Who’s playing', namesTitle: 'Two names, that’s all', namesTip: 'Used for labels and messages. Stays in this browser.',
    you: 'You', companion: 'Your companion', yourName: 'your name', theirName: 'their name', cancel: 'Cancel', save: 'Save', close: 'Close', copy: 'Copy', share: 'Share…',
    sendTitle: 'Send this to {them}', sendTip: 'Paste it into your chat. Change any words first — it’s your voice.', copied: 'Copied — paste it to {them} ✦', copyBlocked: 'Copying was blocked — select the text and copy it',
    receiveTitle: 'Paste {their} reply', receiveTip: 'Paste their whole message. Extra words are fine.', pasteClip: 'Paste from clipboard', clipEmpty: 'The clipboard is empty',
    clipDenied: 'Not allowed — long-press the box and paste', open: 'Open it', fromThem: 'From {them}', forThem: 'For {them}', sound: 'Sound', langBtn: '中', langName: '中文',
    meDefault: 'you', themDefault: 'your companion', ThemDefault: 'Your companion', imageFail: 'Couldn’t make the image' },
  zh: { site: '兩個人的冬天', who: '誰在玩', namesTitle: '兩個名字就好', namesTip: '只用來寫標籤和訊息，只存在這個瀏覽器。',
    you: '你', companion: '你的 AI 夥伴', yourName: '你的名字', theirName: '對方的名字', cancel: '取消', save: '儲存', close: '關閉', copy: '複製', share: '分享…',
    sendTitle: '傳給{them}', sendTip: '貼到你們的對話裡。想改哪個字都可以——這是你的語氣。', copied: '已複製，貼給{them}吧 ✦', copyBlocked: '瀏覽器擋住了複製——請選取文字後自行複製',
    receiveTitle: '貼上{their}回覆', receiveTip: '整段貼上就好，多出來的字沒關係。', pasteClip: '從剪貼簿貼上', clipEmpty: '剪貼簿是空的',
    clipDenied: '瀏覽器不允許——請長按輸入框貼上', open: '打開', fromThem: '來自{them}', forThem: '給{them}', sound: '聲音', langBtn: 'EN', langName: 'English',
    meDefault: '你', themDefault: '對方', ThemDefault: '對方', imageFail: '圖片做不出來' }
});

/* ---------- small helpers ---------- */
W4.$ = (s, r) => (r || document).querySelector(s);
W4.$$ = (s, r) => Array.from((r || document).querySelectorAll(s));
W4.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
W4.cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
W4.poss = s => W4.zh ? s + '的' : s + '’s';
W4.clamp = (v, a, b) => Math.max(a, Math.min(b, v));
W4.reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
W4.coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches);
W4.date = d => new Date(d || Date.now()).toLocaleDateString(W4.zh ? 'zh-Hant' : undefined, { day:'numeric', month:'short', year:'numeric' });
W4.shortDate = d => new Date(d || Date.now()).toLocaleDateString(W4.zh ? 'zh-Hant' : undefined, { day:'numeric', month:'short' });
W4.uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
W4.pick = a => a[Math.floor(Math.random() * a.length)];
W4.here = () => location.href.split('#')[0].split('?')[0];

W4.games = {
  'window':    { path:'window/',     title:{ en:'The Other Side of the Glass', zh:'隔著玻璃' } },
  'snowflakes':{ path:'snowflakes/', title:{ en:'Snowflakes from Words',       zh:'字成雪花' } },
  'gifts':     { path:'gifts/',      title:{ en:'Impossible Gifts',            zh:'不可能的禮物' } },
  'music-box': { path:'music-box/',  title:{ en:'Music Box Duet',              zh:'音樂盒二重奏' } },
  'star-jar':  { path:'star-jar/',   title:{ en:'A Jar of Small Stars',        zh:'一罐小星星' } },
  'cracker':   { path:'cracker/',    title:{ en:'Pull a Cracker',              zh:'聖誕拉炮' } }
};

/* ---------- names ---------- */
W4.names = function(){
  const me = String(W4.store.get('me', '') || '').trim();
  const them = String(W4.store.get('them', '') || '').trim();
  return { me: me || W4.t('meDefault'), them: them || W4.t('themDefault'), Them: them || W4.t('ThemDefault'), meName: me, themName: them,
    their: them ? W4.poss(them) : (W4.zh ? '對方的' : 'their') };
};
W4.onNames = cb => document.addEventListener('w4:names', cb);
W4.editNames = function(onDone){
  const n = W4.names();
  const d = W4.sheet(`<div class="w4-sheet-in">
    <p class="eyebrow">${W4.t('who')}</p>
    <h3>${W4.t('namesTitle')}</h3>
    <p class="tip">${W4.t('namesTip')}</p>
    <div class="field"><label for="w4-me">${W4.t('you')}</label><input id="w4-me" class="input" maxlength="24" autocomplete="nickname" placeholder="${W4.t('yourName')}"></div>
    <div class="field"><label for="w4-them">${W4.t('companion')}</label><input id="w4-them" class="input" maxlength="24" autocomplete="off" placeholder="${W4.t('theirName')}"></div>
    <div class="row end"><button class="btn ghost" data-a="close">${W4.t('cancel')}</button><button class="btn primary" data-a="save">${W4.t('save')}</button></div>
  </div>`);
  const me = d.querySelector('#w4-me'), them = d.querySelector('#w4-them');
  me.value = n.meName; them.value = n.themName;
  d.querySelector('[data-a="save"]').onclick = () => {
    W4.store.set('me', me.value.trim()); W4.store.set('them', them.value.trim());
    d.done(); document.dispatchEvent(new CustomEvent('w4:names'));
    if(onDone) onDone();
  };
  return d;
};

/* ---------- toast ---------- */
let toastEl = null, toastTimer = 0;
W4.toast = function(msg, ms){
  if(!toastEl){
    toastEl = document.createElement('div');
    toastEl.className = 'w4-toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  requestAnimationFrame(() => toastEl.classList.add('show'));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms || 2800);
};

/* ---------- sheets (modal dialogs) ---------- */
W4.sheet = function(html, cls){
  const d = document.createElement('dialog');
  d.className = 'w4-sheet' + (cls ? ' ' + cls : '');
  d.innerHTML = html;
  document.body.appendChild(d);
  let gone = false;
  const cleanup = () => { if(!gone){ gone = true; d.remove(); if(d.onDone) d.onDone(); } };
  d.done = () => { if(typeof d.close === 'function' && d.open) d.close(); else cleanup(); };
  d.addEventListener('close', () => setTimeout(cleanup, 30));
  d.addEventListener('click', e => {
    if(e.target === d) d.done();
    else if(e.target.closest('[data-a="close"]')) d.done();
  });
  if(typeof d.showModal === 'function') d.showModal();
  else { d.setAttribute('open', ''); d.style.cssText = 'position:fixed;inset:0;z-index:100;margin:auto'; }
  return d;
};

/* ---------- clipboard ---------- */
W4.copy = async function(text){
  try{
    if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(text); return true; }
  }catch(e){}
  try{
    const ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:0;left:0;width:2px;height:2px;opacity:0;';
    (document.querySelector('dialog[open]') || document.body).appendChild(ta);
    ta.focus(); ta.select(); ta.setSelectionRange(0, text.length);
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  }catch(e){ return false; }
};

/* Step 1 of the bridge: show the words you’re about to send, let you edit, copy. */
W4.send = function(text, opt){
  opt = opt || {};
  const n = W4.names();
  const d = W4.sheet(`<div class="w4-sheet-in">
    <p class="eyebrow">${W4.esc(opt.eyebrow || W4.t('forThem', { them: n.them }))}</p>
    <h3>${W4.esc(opt.title || W4.t('sendTitle', { them: n.them }))}</h3>
    <p class="tip">${opt.tip || W4.t('sendTip')}</p>
    <textarea class="input" spellcheck="false" aria-label="${W4.esc(W4.t('sendTitle', { them: n.them }))}"></textarea>
    <div class="row end">
      <button class="btn ghost" data-a="close">${W4.t('close')}</button>
      ${navigator.share && W4.coarse ? `<button class="btn" data-a="share">${W4.t('share')}</button>` : ''}
      <button class="btn primary" data-a="copy">${W4.t('copy')}</button>
    </div>
  </div>`);
  const ta = d.querySelector('textarea');
  ta.value = text;
  d.querySelector('[data-a="copy"]').onclick = async () => {
    const ok = await W4.copy(ta.value);
    if(ok){ d.done(); W4.toast(opt.copied || W4.t('copied', { them: n.them })); if(opt.onSent) opt.onSent(ta.value); }
    else { ta.focus(); ta.select(); W4.toast(W4.t('copyBlocked')); }
  };
  const sh = d.querySelector('[data-a="share"]');
  if(sh) sh.onclick = async () => {
    try{ await navigator.share({ text: ta.value }); d.done(); if(opt.onSent) opt.onSent(ta.value); }catch(e){}
  };
  return d;
};

/* Step 2 of the bridge: paste their reply back in. onText returns a string to show an error. */
W4.receive = function(opt){
  opt = opt || {};
  const n = W4.names();
  const canRead = !!(navigator.clipboard && navigator.clipboard.readText && window.isSecureContext);
  const d = W4.sheet(`<div class="w4-sheet-in">
    <p class="eyebrow">${W4.esc(W4.t('fromThem', { them: n.them }))}</p>
    <h3>${W4.esc(opt.title || W4.t('receiveTitle', { their: n.their }))}</h3>
    <p class="tip">${opt.tip || W4.t('receiveTip')}</p>
    <textarea class="input" spellcheck="false" placeholder="${W4.esc(opt.placeholder || '')}" aria-label="${W4.esc(W4.t('receiveTitle', { their: n.their }))}"></textarea>
    <p class="err" role="alert" hidden></p>
    <div class="row">
      ${canRead ? `<button class="btn small" data-a="clip">${W4.t('pasteClip')}</button>` : ''}
      <span class="spacer"></span>
      <button class="btn ghost" data-a="close">${W4.t('cancel')}</button>
      <button class="btn primary" data-a="go">${W4.esc(opt.go || W4.t('open'))}</button>
    </div>
  </div>`);
  const ta = d.querySelector('textarea'), err = d.querySelector('.err');
  const clip = d.querySelector('[data-a="clip"]');
  if(clip) clip.onclick = async () => {
    try{ const t = await navigator.clipboard.readText(); if(t && t.trim()) ta.value = t; else W4.toast(W4.t('clipEmpty')); }
    catch(e){ W4.toast(W4.t('clipDenied')); }
  };
  d.querySelector('[data-a="go"]').onclick = () => {
    const t = ta.value.trim();
    if(!t){ ta.focus(); return; }
    const res = opt.onText(t);
    if(typeof res === 'string'){ err.textContent = res; err.hidden = false; return; }
    d.done();
  };
  if(!W4.coarse) setTimeout(() => ta.focus(), 60);
  return d;
};

/* ---------- state in the URL (#hash is never sent to the server) ---------- */
W4.enc = function(obj){
  const b = new TextEncoder().encode(JSON.stringify(obj)); let s = '';
  for(let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};
W4.dec = function(str){
  try{
    let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
    while(s.length % 4) s += '=';
    const bin = atob(s), b = new Uint8Array(bin.length);
    for(let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
    return JSON.parse(new TextDecoder().decode(b));
  }catch(e){ return null; }
};
W4.params = function(){
  const map = {};
  const add = (k, v) => { k = k.toLowerCase().trim(); (map[k] = map[k] || []).push(v); };
  try{ new URLSearchParams(location.search).forEach((v, k) => add(k, v)); }catch(e){}
  const h = location.hash.replace(/^#/, '');
  if(h.includes('=')){ try{ new URLSearchParams(h).forEach((v, k) => add(k, v)); }catch(e){} }
  return { get: k => (map[k] || [])[0], all: k => map[k] || [], has: k => k in map, any: () => Object.keys(map).length > 0 };
};
/* A reply routed here from the home page’s “paste anything” box arrives as #paste=… */
W4.pasted = function(){ const v = W4.params().get('paste'); const t = v ? W4.dec(v) : null; return typeof t === 'string' ? t : null; };
W4.clearURL = function(){ try{ history.replaceState(null, '', location.pathname); }catch(e){} };
W4.link = function(obj){ return W4.here() + '#' + new URLSearchParams(obj).toString(); };

/* ---------- the forgiving reader ---------- */
/* Companions decorate. They add **bold**, emoji, *smiles softly*, quotes. We let them. */
W4.clean = function(s){
  s = String(s == null ? '' : s).replace(/\r/g, '').replace(/\*\*|__/g, '');
  s = s.replace(/^[\s*_~`]+|[\s*_~`]+$/g, '');
  const q = s.match(/^["“”'‘’「『«]([\s\S]*)["“”'‘’」』»]$/);
  if(q) s = q[1];
  return s.replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
};
W4.stripActions = s => String(s || '')
  .replace(/(^|\s)\*[^*\n]{1,140}\*(?=\s|$|[.,!?。，！？])/g, ' ')
  .replace(/(^|\s)[(（][^()（）\n]{1,140}[)）](?=\s|$)/g, ' ');
/* Read “Label: value” lines. spec = { key: ['label', 'synonym', …] } */
W4.fields = function(text, spec){
  const out = {}; let cur = null;
  const norm = s => s.toLowerCase().replace(/[*_`~#>\[\]()"“”「」【】]/g, '').replace(/\s+/g, ' ').trim();
  const keyOf = label => {
    const l = norm(label);
    if(!l || l.length > 28) return null;
    for(const k in spec) for(const syn of spec[k]){
      if(l === syn || l.startsWith(syn + ' ') || l.endsWith(' ' + syn)) return k;
    }
    return null;
  };
  const lines = String(text || '').replace(/\r/g, '').split('\n');
  for(const raw of lines){
    const line = raw.replace(/^[\s>•·▪◦*+\-–—#]+/, '').replace(/^(?:\p{Extended_Pictographic}|️|‍|⃣)+\s*/u, '');
    const m = line.match(/^([^:：\n]{1,30}?)\s*[:：]\s*(.*)$/);
    if(m){
      const k = keyOf(m[1]);
      if(k){ cur = k; out[k] = out[k] ? out[k] + '\n' + m[2] : m[2]; continue; }
      if(/^\p{L}[\p{L} ']{0,22}$/u.test(norm(m[1]))){ cur = null; continue; }
    }
    if(!line.trim()){ if(cur && String(out[cur]).trim()) cur = null; continue; }
    if(cur) out[cur] += (String(out[cur]).trim() ? '\n' : '') + line.trim();
  }
  for(const k in out){ out[k] = W4.clean(out[k]); if(!out[k]) delete out[k]; }
  return out;
};
/* One short value: the labelled line if there is one, else a quoted phrase, else the message itself. */
W4.one = function(text, labels, max){
  max = max || 160;
  const f = W4.fields(text, { v: labels });
  let v = f.v;
  if(!v){
    const q = String(text).match(/["“「『]([^"”」』\n]{2,240})["”」』]/);
    v = q ? q[1] : W4.stripActions(text);
  }
  v = W4.clean(v).replace(/\s*\n\s*/g, ' ');
  if([...v].length > max){ v = [...v].slice(0, max).join('').replace(/\s+\S*$/, '') + '…'; }
  return v;
};
/* Which game is a pasted reply for? (Used by the home page’s “paste anything” box.) */
W4.detect = function(text){
  const t = String(text || '');
  const L = w => new RegExp('(^|\\n)[\\s>*_#•\\-–—]*(?:\\p{Extended_Pictographic}|\\uFE0F)*\\s*\\**(?:' + w + ')\\**\\s*[:：]', 'iu');
  if(L('glass|玻璃|窗上').test(t)) return 'window';
  if(L('flake|snowflake|雪花').test(t)) return 'snowflakes';
  if(L('inside|rattle|wrapping|paper|裡面|裏面|包裝紙|搖晃|聲音').test(t)) return 'gifts';
  if(L('notes?|melody|音符|旋律').test(t)) return 'music-box';
  if(L('punchline|grip|trinket|crown|笑點|握力|小玩意|紙皇冠|皇冠').test(t)) return 'cracker';
  if(/(^|\n)\s*[★⭐☆✦✧🌟]/u.test(t)) return 'star-jar';
  return null;
};

/* ---------- sound (synthesised, nothing to download) ---------- */
let actx = null, noiseBuf = null;
W4.soundOn = () => W4.store.get('sound', true) !== false;
W4.audio = function(){
  if(!W4.soundOn()) return null;
  const AC = window.AudioContext || window.webkitAudioContext;
  if(!AC) return null;
  if(!actx){ try{ actx = new AC(); }catch(e){ return null; } }
  if(actx.state === 'suspended'){ try{ actx.resume(); }catch(e){} }
  return actx;
};
W4.noise = function(ctx){
  if(noiseBuf && noiseBuf.sampleRate === ctx.sampleRate) return noiseBuf;
  const len = ctx.sampleRate * 2;
  noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = noiseBuf.getChannelData(0);
  for(let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  return noiseBuf;
};
/* filtered-noise gesture: paper, breath, snow, wind */
W4.whoosh = function(o){
  const ctx = W4.audio(); if(!ctx) return;
  o = Object.assign({ dur:.5, freq:900, q:.7, gain:.16, type:'bandpass', attack:.04, sweep:0, delay:0 }, o || {});
  const t = ctx.currentTime + o.delay;
  const src = ctx.createBufferSource(); src.buffer = W4.noise(ctx); src.loop = true;
  const f = ctx.createBiquadFilter(); f.type = o.type; f.Q.value = o.q;
  f.frequency.setValueAtTime(o.freq, t);
  if(o.sweep) f.frequency.exponentialRampToValueAtTime(o.sweep, t + o.dur);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(o.gain, t + o.attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  src.connect(f); f.connect(g); g.connect(ctx.destination);
  src.start(t, Math.random()); src.stop(t + o.dur + .05);
};
/* small bell: freqs in Hz, played as a little arpeggio */
W4.chime = function(freqs, o){
  const ctx = W4.audio(); if(!ctx) return;
  o = Object.assign({ gap:.09, gain:.1, decay:1.6 }, o || {});
  const t0 = ctx.currentTime + .01;
  [].concat(freqs).forEach((f, i) => {
    const t = t0 + i * o.gap;
    [[1, 1], [2.76, .26], [5.4, .08]].forEach(p => {
      const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = f * p[0];
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(o.gain * p[1], t + .006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + o.decay / (.6 + p[0] * .4));
      osc.connect(g); g.connect(ctx.destination); osc.start(t); osc.stop(t + o.decay + .1);
    });
  });
};

/* ---------- fonts for canvas text ---------- */
W4.fontsReady = async function(spec, text){
  try{
    if(document.fonts && document.fonts.load){
      await Promise.race([document.fonts.load(spec, text || 'Aa'), new Promise(r => setTimeout(r, 2500))]);
    }
  }catch(e){}
};

/* ---------- save a canvas as an image (share sheet on phones) ---------- */
W4.saveCanvas = function(canvas, filename){
  canvas.toBlob(async blob => {
    if(!blob){ W4.toast(W4.t('imageFail')); return; }
    try{
      const file = new File([blob], filename, { type:'image/png' });
      if(W4.coarse && navigator.canShare && navigator.canShare({ files:[file] })){ await navigator.share({ files:[file] }); return; }
    }catch(e){ if(e && e.name === 'AbortError') return; }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
};
W4.downloadText = function(text, filename, type){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: type || 'text/plain' }));
  a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
};

/* ---------- gentle background snowfall ---------- */
W4.snowfall = function(canvas, o){
  o = Object.assign({ density:1, speed:1, color:'255,255,255', alpha:1 }, o || {});
  const ctx = canvas.getContext('2d'); let w = 0, h = 0, raf = 0, last = performance.now();
  const flakes = [];
  const make = any => { const z = Math.random(); return { x: Math.random() * w, y: any ? Math.random() * h : -8, r: .6 + z * 2, z, vy: (12 + z * 34) * o.speed, ph: Math.random() * 6.28, sw: 6 + Math.random() * 16 }; };
  function size(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(w * h / 9000 * o.density);
    while(flakes.length < n) flakes.push(make(true));
    flakes.length = n;
    if(W4.reduced) draw(last);
  }
  function draw(t){
    const dt = Math.min(.05, (t - last) / 1000); last = t;
    ctx.clearRect(0, 0, w, h); ctx.fillStyle = 'rgb(' + o.color + ')';
    for(const f of flakes){
      f.y += f.vy * dt; f.ph += dt * (.5 + f.z);
      if(f.y > h + 6) Object.assign(f, make(false));
      ctx.globalAlpha = (.22 + f.z * .6) * o.alpha;
      ctx.beginPath(); ctx.arc(f.x + Math.sin(f.ph) * f.sw * .35, f.y, f.r, 0, 6.2832); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  const loop = t => { draw(t); raf = requestAnimationFrame(loop); };
  size(); addEventListener('resize', size);
  if(!W4.reduced) raf = requestAnimationFrame(loop);
  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(raf);
    if(!document.hidden && !W4.reduced){ last = performance.now(); raf = requestAnimationFrame(loop); }
  });
};

/* ---------- the top bar every game shares ---------- */
const ICON = {
  back:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>',
  people:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="8.5" cy="8.5" r="3.2"/><circle cx="16.5" cy="9.5" r="2.6"/><path d="M2.8 19.5c.6-3.3 3-5.2 5.7-5.2s5.1 1.9 5.7 5.2M14.6 14.6c.6-.2 1.2-.3 1.9-.3 2.3 0 4.2 1.6 4.7 4.6"/></svg>',
  bell:'<svg class="on" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/></svg>',
  bellOff:'<svg class="off" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 9.6-4.8M18 11v5.5l1.5 1.5h-15"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/><path d="M4 4l16 16"/></svg>'
};
W4.icon = ICON;
W4.topbar = function(o){
  o = o || {};
  const bar = document.createElement('header');
  bar.className = 'w4-top';
  bar.innerHTML = `<a class="w4-home" href="${o.home || '../'}">${ICON.back}<span>${W4.t('site')}</span></a>
    <span class="w4-spacer"></span>${o.extra || ''}
    <button class="w4-icon" type="button" data-a="lang" aria-label="${W4.t('langName')}" title="${W4.t('langName')}">${W4.t('langBtn')}</button>
    <button class="w4-icon" type="button" data-a="names" aria-label="${W4.t('who')}" title="${W4.t('who')}">${ICON.people}</button>
    <button class="w4-icon" type="button" data-a="sound" aria-label="${W4.t('sound')}" title="${W4.t('sound')}" aria-pressed="${W4.soundOn()}">${ICON.bell}${ICON.bellOff}</button>`;
  document.body.prepend(bar);
  bar.querySelector('[data-a="lang"]').onclick = () => W4.setLang(W4.zh ? 'en' : 'zh');
  bar.querySelector('[data-a="names"]').onclick = () => W4.editNames();
  const s = bar.querySelector('[data-a="sound"]');
  s.onclick = () => {
    const on = !W4.soundOn(); W4.store.set('sound', on); s.setAttribute('aria-pressed', String(on));
    if(on) W4.chime([1046, 1568], { gain:.05 }); else if(actx && actx.suspend) actx.suspend();
  };
  return bar;
};
document.addEventListener('DOMContentLoaded', () => W4.applyI18n());
})();

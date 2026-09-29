import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* ============================================================
   TEXAS TRAIL — STAAR Grade 3 concept practice
   Regions map to STAAR reporting categories.
   ============================================================ */

const CSS = `
/* while driving, hide the floating Sprint button (it sat on top of the drive controls) */
body.bd-driving .bd-fab-wrap { display:none !important; }
.dq-goal { font-family:var(--ui); font-weight:800; font-size:16px; background:#FEF3CE; border:2px solid #F5C518;
  border-radius:12px; padding:8px 12px; color:var(--ink); }
.dq-goal.retry { background:#EEE6FF; border-color:#8B3FD6; }
.dq-promptrow { display:flex; align-items:flex-start; gap:8px; }
.dq-promptrow .prompt { flex:1; margin:0; }
.dq-say { flex:none; border:2px solid var(--line); background:#fff; border-radius:12px; font-size:20px; padding:6px 10px; cursor:pointer; }
.dq-answers.reading { opacity:.45; pointer-events:none; filter:grayscale(.4); }
.dq-fast { font-weight:800; color:#9E2519; }
/* Only system fonts plus the bundled Nunito are used. No external requests. */

.tt * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.tt {
  --caliche:#E9EFFA; --paper:#FFFFFF; --ink:#0F1F3D; --soft:#5B6B87;
  --bluebonnet:#1B62E8; --bluebonnet-lt:#DCE7FD;
  --juniper:#12A05A; --juniper-lt:#DAF3E6;
  --sunset:#F5C518; --sunset-lt:#FEF3CE;
  --clay:#D8362A; --clay-lt:#FBE0DE;
  --line:#CFDAEC;
  /* Titles + game UI: bold Trebuchet MS. Lesson text: Segoe UI / Verdana.
     Nunito is bundled in the page, so devices without those fonts (Chromebooks) still get a clean sans-serif. */
  --display:'Trebuchet MS','Segoe UI','Nunito',system-ui,sans-serif;
  --ui:'Trebuchet MS','Segoe UI','Nunito',system-ui,sans-serif;
  --read:'Segoe UI',Verdana,'Nunito',system-ui,sans-serif;
  font-family:var(--read);
  color:var(--ink); background:var(--caliche);
  min-height:100vh; touch-action:manipulation;
  -webkit-text-size-adjust:100%;
}
.tt h1,.tt h2,.tt h3,.tt .display { font-family:var(--display); font-weight:700; letter-spacing:-.01em; }

.shell { max-width:900px; margin:0 auto; padding:0 18px 96px; }

/* ---- top bar ---- */
.topbar { position:sticky; top:0; z-index:30; background:var(--caliche);
  border-bottom:2px solid var(--line); padding:12px 18px;
  display:flex; align-items:center; gap:12px; }
.topbar .home { font-family:var(--ui); font-size:19px; background:none; border:none;
  color:var(--ink); cursor:pointer; padding:6px 4px; }
.spacer { flex:1; }
.pill { display:inline-flex; align-items:center; gap:6px; font-weight:800; font-size:15px;
  padding:7px 13px; border-radius:999px; background:var(--paper); border:2px solid var(--line); }
.pill.gold { background:var(--sunset-lt); border-color:#EBCB92; }
.pill.timer { background:var(--bluebonnet-lt); border-color:#BFC6EE; font-variant-numeric:tabular-nums; }
.pill.timer.low { background:var(--clay-lt); border-color:#E3B3AA; color:var(--clay); }

/* ---- generic ---- */
.card { background:var(--paper); border:2px solid var(--line); border-radius:20px; padding:22px; }
.stack > * + * { margin-top:14px; }
.lede { font-size:18px; line-height:1.55; }
.small { font-size:14px; color:var(--soft); }
.btn { font-family:var(--ui); font-size:18px; font-weight:700; border:none; cursor:pointer;
  padding:16px 26px; border-radius:16px; background:var(--bluebonnet); color:#fff;
  min-height:56px; box-shadow:0 4px 0 #0E45AC; }
.btn:active { transform:translateY(3px); box-shadow:0 1px 0 #0E45AC; }
.btn.ghost { background:var(--paper); color:var(--ink); border:2px solid var(--line); box-shadow:0 4px 0 var(--line); }
.btn.ghost:active { transform:translateY(3px); box-shadow:0 1px 0 var(--line); }
.btn.gold { background:var(--sunset); color:#3A2A0C; box-shadow:0 4px 0 #C79E0C; }
.btn:disabled { opacity:.4; cursor:default; }
.btnrow { display:flex; gap:10px; flex-wrap:wrap; }

/* ---- trail map ---- */
.hero { padding:26px 4px 10px; }
.hero h1 { font-size:34px; line-height:1.05; margin:0 0 8px; }
.trail { display:grid; gap:14px; }
@media (min-width:640px){ .trail { grid-template-columns:1fr 1fr; } }
.region { text-align:left; background:var(--paper); border:2px solid var(--line);
  border-radius:22px; padding:18px; cursor:pointer; display:block; width:100%;
  border-left:10px solid var(--rc); position:relative; overflow:hidden;
  box-shadow:0 4px 0 var(--line); }
.region::after { content:""; position:absolute; top:14px; right:14px; width:48px; height:16px;
  background:conic-gradient(var(--rc) 25%, transparent 0 50%, var(--rc) 0 75%, transparent 0) 0 0/8px 8px; opacity:.35; }
.region:active { transform:translateY(3px); box-shadow:0 1px 0 var(--line); }
.region h3 { font-size:22px; margin:0 0 4px; }
.region .meta { font-size:14px; color:var(--soft); font-weight:600; }
.bar { height:9px; background:var(--caliche); border-radius:99px; margin-top:12px; overflow:hidden; }
.bar i { display:block; height:100%; background:var(--rc); border-radius:99px; transition:width .5s; }

/* ---- concept list ---- */
.stop { display:flex; align-items:center; gap:14px; width:100%; text-align:left;
  background:var(--paper); border:2px solid var(--line); border-radius:18px;
  padding:16px; cursor:pointer; }
.stop:active { transform:translateY(2px); }
.stop .badge { width:44px; height:44px; border-radius:14px; flex:none;
  display:grid; place-items:center; font-size:22px; background:var(--caliche); border:2px solid var(--line); }
.stop.done .badge { background:var(--sunset-lt); border-color:#EBCB92; }
.stop .t { flex:1; }
.stop .t b { font-family:var(--ui); font-weight:600; font-size:18px; display:block; }

/* ---- teaching card ---- */
.idea { background:var(--juniper-lt); border:2px solid #BFDACF; border-radius:20px; padding:20px; }
.idea h2 { margin:0 0 10px; font-size:24px; }
.idea p { margin:0 0 10px; font-size:18px; line-height:1.6; }
.egbox { background:var(--paper); border:2px dashed #BFDACF; border-radius:14px;
  padding:14px; font-size:19px; font-weight:700; text-align:center; }

/* ---- questions ---- */
.qnum { font-weight:800; font-size:14px; color:var(--soft); }
.prompt { font-size:20px; line-height:1.55; font-weight:600; }
.passage { background:var(--paper); border:2px solid var(--line); border-radius:16px;
  padding:16px 18px; max-height:34vh; overflow:auto; font-size:17.5px; line-height:1.7;
  font-family:var(--read); }
.passage h4 { font-family:var(--ui); margin:0 0 8px; font-size:19px; }
.passage p { margin:0 0 10px; }

.opts { display:grid; gap:10px; }
.opt { display:flex; gap:12px; align-items:center; text-align:left; width:100%;
  background:var(--paper); border:2px solid var(--line); border-radius:16px;
  padding:15px 16px; font-size:18px; font-weight:600; cursor:pointer; min-height:58px;
  font-family:var(--ui); color:var(--ink); }
.opt .k { width:32px; height:32px; flex:none; border-radius:9px; background:var(--caliche);
  border:2px solid var(--line); display:grid; place-items:center; font-weight:800; font-size:15px; }
.opt.sel { border-color:var(--bluebonnet); background:var(--bluebonnet-lt); }
.opt.sel .k { background:var(--bluebonnet); color:#fff; border-color:var(--bluebonnet); }
.opt.right { border-color:var(--juniper); background:var(--juniper-lt); }
.opt.right .k { background:var(--juniper); color:#fff; border-color:var(--juniper); }
.opt.wrong { border-color:var(--clay); background:var(--clay-lt); }
.opt.wrong .k { background:var(--clay); color:#fff; border-color:var(--clay); }

/* place / drag-drop */
.tiles { display:flex; flex-wrap:wrap; gap:10px; }
.tile { padding:13px 18px; border-radius:14px; border:2px solid var(--line);
  background:var(--paper); font-size:17px; font-weight:700; cursor:pointer; min-height:52px; font-family:var(--ui); color:var(--ink); }
.tile.armed { border-color:var(--sunset); background:var(--sunset-lt); }
.tile.used { opacity:.3; }
.slots { display:grid; gap:10px; }
.slot { display:flex; align-items:center; gap:12px; background:var(--paper);
  border:2px solid var(--line); border-radius:16px; padding:12px 14px; min-height:60px; }
.slot .lab { flex:1; font-size:17px; font-weight:600; }
.drop { min-width:110px; min-height:46px; border-radius:12px; border:2px dashed #C9C5B2;
  display:grid; place-items:center; font-weight:800; font-size:17px; background:var(--caliche);
  cursor:pointer; padding:0 12px; font-family:var(--ui); color:var(--ink); }
.drop.filled { border-style:solid; border-color:var(--bluebonnet); background:var(--bluebonnet-lt); }
.drop.right { border-style:solid; border-color:var(--juniper); background:var(--juniper-lt); }
.drop.wrong { border-style:solid; border-color:var(--clay); background:var(--clay-lt); }

/* inline choice */
.sentence { font-size:20px; line-height:2.1; font-weight:600; }
.inlinepick { display:inline-block; }
.inlinepick select { font-family:var(--ui); font-size:18px; font-weight:700; padding:8px 10px;
  border-radius:12px; border:2px solid var(--bluebonnet); background:var(--bluebonnet-lt);
  color:var(--ink); min-height:46px; }

/* entry */
.entry { display:flex; flex-direction:column; align-items:center; gap:14px; }
.readout { font-size:38px; font-family:var(--ui); min-width:200px; text-align:center;
  background:var(--paper); border:2px solid var(--line); border-radius:16px; padding:12px 20px;
  font-variant-numeric:tabular-nums; }
.pad { display:grid; grid-template-columns:repeat(3,86px); gap:10px; }
.pad button { height:66px; font-size:26px; font-family:var(--ui); border-radius:14px;
  border:2px solid var(--line); background:var(--paper); color:var(--ink); cursor:pointer; }
.pad button:active { background:var(--caliche); }

/* shade */
.shaderow { display:flex; gap:0; border:3px solid var(--ink); border-radius:10px; overflow:hidden; }
.shaderow div { flex:1; height:78px; border-right:3px solid var(--ink); cursor:pointer; background:var(--paper); }
.shaderow div:last-child { border-right:none; }
.shaderow div.on { background:var(--bluebonnet); }

/* feedback */
.fb { border-radius:20px; padding:18px 20px; border:2px solid; }
.fb.ok { background:var(--juniper-lt); border-color:#BFDACF; }
.fb.no { background:var(--clay-lt); border-color:#E3B3AA; }
.fb h3 { margin:0 0 6px; font-size:21px; }
.fb p { margin:0; font-size:17px; line-height:1.6; }
.hintbox { background:var(--sunset-lt); border:2px solid #EBCB92; border-radius:16px;
  padding:14px 16px; font-size:17px; line-height:1.55; }

/* vocab word */
.vw { border-bottom:3px dotted var(--sunset); cursor:pointer; font-weight:800; }
.sheet { position:fixed; inset:0; background:rgba(30,42,56,.45); z-index:60;
  display:flex; align-items:flex-end; justify-content:center; padding:16px; }
.sheetin { background:var(--paper); border-radius:24px; padding:24px; max-width:520px; width:100%;
  border:3px solid var(--sunset); }
@media (min-width:640px){ .sheet { align-items:center; } }

/* footer bar */
.footer { position:fixed; left:0; right:0; bottom:0; background:var(--caliche);
  border-top:2px solid var(--line); padding:12px 18px calc(12px + env(safe-area-inset-bottom));
  z-index:25; }
.footer .in { max-width:900px; margin:0 auto; display:flex; gap:10px; }
.footer .btn { flex:1; }

/* stamp celebration */
.stamp { text-align:center; padding:24px; }
.stamp .big { font-size:76px; animation:pop .5s cubic-bezier(.2,1.5,.4,1); }
.badgechip { display:inline-block; margin:2px auto 10px; padding:8px 16px; border-radius:999px;
  background:var(--sunset-lt); color:#3A2A0C; font-weight:800; font-size:15px; }
.progressbar { height:14px; border-radius:999px; background:var(--line); overflow:hidden; margin-top:10px; }
.progressbar-fill { height:100%; background:var(--sunset); border-radius:999px; transition:width .4s ease; }
.badgeshelf { display:flex; gap:14px; margin-top:8px; font-weight:800; font-size:16px; }
@keyframes pop { from { transform:scale(.2) rotate(-25deg); opacity:0 } to { transform:none; opacity:1 } }
@media (prefers-reduced-motion:reduce){ .stamp .big { animation:none } }

.fixup { font-size:13px; font-weight:800; color:var(--clay); margin-right:8px; white-space:nowrap; }

/* word forge */
.bigword { font-family:var(--ui); font-size:56px; letter-spacing:.04em; margin:6px 0 18px; color:var(--bluebonnet); }
.wordslots { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin:6px 0; }
.ws { width:48px; height:62px; border-radius:12px; border:3px solid var(--line);
  background:var(--paper); display:grid; place-items:center;
  font-family:var(--ui); font-size:30px; text-transform:lowercase; }
.ws.ok { border-color:var(--juniper); background:var(--juniper-lt); }
.ws.no { border-color:var(--clay); background:var(--clay-lt); }
.tile.letter { min-width:58px; height:58px; font-family:var(--ui); font-size:26px;
  padding:0 14px; text-align:center; }
.wordlist { display:flex; flex-wrap:wrap; gap:8px; }
.chip { padding:9px 14px; border-radius:999px; border:2px solid var(--line);
  background:var(--paper); font-weight:800; font-size:16px; cursor:pointer; }
.chip.ok { border-color:var(--juniper); background:var(--juniper-lt); }

/* sentence building */
.sentbuild { min-height:96px; background:var(--paper); border:3px dashed #C2CDE0; border-radius:18px;
  padding:14px; display:flex; flex-wrap:wrap; gap:8px; align-items:flex-start; align-content:flex-start; }
.sentbuild.ok { border-style:solid; border-color:var(--juniper); background:var(--juniper-lt); }
.sentbuild.no { border-style:solid; border-color:var(--clay); background:var(--clay-lt); }
.ghosttext { font-size:16px; font-weight:700; color:#93A1B5; }
.sw { font-size:19px; font-weight:700; padding:6px 2px; }
.sw.target { color:var(--bluebonnet); font-weight:800; text-decoration:underline;
  text-decoration-color:var(--sunset); text-decoration-thickness:3px; text-underline-offset:3px; }
.tile.word { font-size:18px; font-weight:700; min-height:52px; padding:12px 16px; }

/* celebration */
.cheer { position:fixed; inset:0; z-index:80; background:rgba(15,31,61,.55);
  display:grid; place-items:center; padding:20px; animation:fade .2s ease-out; }
.cheerin { position:relative; background:var(--paper); border:4px solid var(--sunset);
  border-radius:28px; padding:34px 28px 28px; text-align:center; max-width:420px; width:100%;
  box-shadow:0 10px 0 rgba(199,158,12,.45); animation:rise .35s cubic-bezier(.2,1.4,.4,1); overflow:hidden; }
.cface { font-size:82px; line-height:1; animation:bounce .6s cubic-bezier(.2,1.5,.4,1); }
.chead { font-family:var(--display); font-size:36px; font-weight:400; margin:8px 0 6px; letter-spacing:.01em; color:var(--bluebonnet); }
.csub { font-size:17px; font-weight:700; color:var(--soft); margin:0 0 20px; line-height:1.45; }
.confetti { position:absolute; inset:0 0 auto 0; height:0; display:flex; justify-content:center; pointer-events:none; }
.confetti i { position:absolute; top:0; width:9px; height:9px; border-radius:2px;
  background:var(--sunset); transform:translateX(var(--x));
  animation:drop 1.5s var(--d) ease-in forwards; }
.confetti i:nth-child(3n) { background:var(--bluebonnet); }
.confetti i:nth-child(3n+1) { background:var(--juniper); }
.confetti i:nth-child(4n) { background:var(--clay); border-radius:50%; }
@keyframes fade { from { opacity:0 } to { opacity:1 } }
@keyframes rise { from { transform:translateY(24px) scale(.9); opacity:0 } to { transform:none; opacity:1 } }
@keyframes bounce { 0% { transform:scale(.3) rotate(-18deg) } 100% { transform:none } }
@keyframes drop { to { transform:translateX(var(--x)) translateY(330px) rotate(420deg); opacity:0 } }
@media (prefers-reduced-motion:reduce){
  .cheerin,.cface { animation:none }
  .confetti { display:none }
}

/* progress display */
.pill.ok { background:var(--juniper-lt); border-color:#A8D9C3; color:var(--juniper); }
.pill.no { background:var(--clay-lt); border-color:#E8B3AB; color:var(--clay); }
.g { color:var(--juniper); font-weight:800; }
.r { color:var(--clay); font-weight:800; }
.progsum { display:block; width:100%; text-align:center; cursor:pointer;
  box-shadow:0 4px 0 var(--line); margin-bottom:4px; font-family:var(--ui); color:var(--ink); }
.progsum:active { transform:translateY(3px); box-shadow:0 1px 0 var(--line); }
.ps { display:flex; justify-content:space-around; gap:10px; }
.ps > span { display:flex; flex-direction:column; }
.ps b { font-family:var(--ui); font-size:34px; line-height:1.1; color:var(--bluebonnet); }
.ps b.g { color:var(--juniper); }
.ps b.r { color:var(--clay); }
.ps > span > span { font-size:13px; font-weight:800; color:var(--soft); }
.table { background:var(--paper); border:2px solid var(--line); border-radius:18px; overflow:hidden; }
.tr { display:grid; grid-template-columns:1.6fr .7fr .7fr .8fr; gap:6px;
  padding:13px 14px; font-size:15px; font-weight:700; border-bottom:1px solid var(--line); }
.tr > span + span { text-align:right; font-variant-numeric:tabular-nums; }
.tr.th { background:var(--caliche); font-size:13px; font-weight:800; color:var(--soft); text-transform:uppercase; letter-spacing:.03em; }
.tr.tf { border-bottom:none; background:var(--bluebonnet-lt); font-weight:800; }

/* speed math */
.smbar { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; padding-top:14px; }
.smcard { background:var(--paper); border:3px solid var(--line); border-radius:24px;
  padding:26px 20px; text-align:center; box-shadow:0 5px 0 var(--line); transition:background .15s,border-color .15s; }
.smcard.ok { border-color:var(--juniper); background:var(--juniper-lt); }
.smcard.no { border-color:var(--clay); background:var(--clay-lt); }
.smprob { font-family:var(--ui); font-size:46px; line-height:1.1; font-variant-numeric:tabular-nums; }
.smanswer { font-family:var(--ui); font-size:40px; color:var(--bluebonnet); margin-top:10px;
  font-variant-numeric:tabular-nums; }
.smcard.no .smanswer { color:var(--clay); }
.smnote { font-size:15px; font-weight:800; color:var(--clay); margin-top:6px; }

/* collection */
.pill.tap { cursor:pointer; font-family:var(--ui); color:var(--ink); }
.pill.tap:active { transform:translateY(2px); }
.stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
@media (min-width:560px){ .stats { grid-template-columns:repeat(3,1fr); } }
.stat { background:var(--paper); border:2px solid var(--line); border-radius:18px;
  padding:16px; text-align:center; box-shadow:0 4px 0 var(--line); }
.stat b { display:block; font-family:var(--ui); font-size:34px; line-height:1.1; color:var(--bluebonnet); }
.stat span { font-size:14px; font-weight:700; color:var(--soft); }
.shelf { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
@media (min-width:560px){ .shelf { grid-template-columns:repeat(3,1fr); } }
.trophy { text-align:left; background:var(--paper); border:2px solid var(--line);
  border-radius:16px; padding:14px; cursor:pointer; box-shadow:0 4px 0 var(--line);
  font-family:var(--ui); color:var(--ink); display:block; }
.trophy:active { transform:translateY(3px); box-shadow:0 1px 0 var(--line); }
.trophy.got { border-color:var(--rc); background:linear-gradient(0deg, rgba(245,197,24,.14), rgba(245,197,24,.14)), var(--paper); }
.trophy .bi { font-size:28px; display:block; filter:grayscale(1); opacity:.45; }
.trophy.got .bi { filter:none; opacity:1; }
.trophy .bt { display:block; font-weight:800; font-size:15px; line-height:1.3; margin:4px 0 2px; }
.trophy .bs { display:block; font-size:12px; font-weight:700; color:var(--soft); }

.grid2 { display:grid; gap:12px; }
@media (min-width:560px){ .grid2 { grid-template-columns:1fr 1fr; } }

/* stage indicator */
.dots { display:flex; gap:8px; padding:16px 4px 0; }
.dots span { width:38px; height:7px; border-radius:99px; background:var(--line); }
.dots span.past { background:#A9B0C7; }
.dots span.on { background:var(--bluebonnet); }

/* garage + car */
.stage { background:linear-gradient(180deg,#F7FAFF,#DDE7F7); border:2px solid var(--line);
  border-radius:24px; padding:10px 4px 0; overflow:hidden; }
.stage.home { margin-top:14px; }
.car { width:100%; height:auto; display:block; max-height:230px; }
.car.small { max-height:170px; }
.car.driving { animation:drive 2.6s ease-in-out; }
@keyframes drive {
  0% { transform:translateX(0) }
  35% { transform:translateX(38%) rotate(1deg) }
  65% { transform:translateX(-34%) rotate(-1deg) }
  100% { transform:translateX(0) }
}
.flame { animation:flick .28s steps(2) infinite; transform-origin:52px 96px; }
@keyframes flick { from { opacity:.55; transform:scaleX(.85) } to { opacity:1; transform:scaleX(1.12) } }
@media (prefers-reduced-motion:reduce){ .car.driving,.flame { animation:none } }
/* ---- Learn & Race home ---- */
.shell.wide { max-width:1180px; }
.tt :focus-visible { outline:3px solid #1B62E8; outline-offset:3px; }
.lr-home { display:flex; flex-direction:column; gap:22px; padding-top:6px; }
.lr-hero { position:relative; overflow:hidden; border-radius:28px; padding:20px; display:grid; gap:16px;
  background:linear-gradient(180deg,#86c8fa 0%,#c7e7fd 55%,#e6f5ff 100%);
  border:3px solid #fff; box-shadow:0 8px 24px rgba(15,31,61,.14); }
@media (min-width:900px){ .lr-hero { grid-template-columns:minmax(0,1fr) minmax(0,1.15fr); padding:26px; gap:22px; } }
.lr-brand { position:relative; display:flex; flex-direction:column; align-items:flex-start; }
.lr-logo { margin:0; font-family:var(--display); font-size:clamp(42px,6vw,66px); line-height:.95;
  text-shadow:0 3px 0 #10306e,3px 0 0 #10306e,-3px 0 0 #10306e,0 -3px 0 #10306e,2px 2px 0 #10306e,
    -2px 2px 0 #10306e,2px -2px 0 #10306e,-2px -2px 0 #10306e,0 8px 0 rgba(16,48,110,.3); }
.lr-logo-svg { display:block; width:min(100%,460px); height:auto; margin:-6px 0 0 -8px; filter:drop-shadow(0 6px 0 rgba(15,31,61,.25)); }
.lr-stepsvg { width:36px; height:36px; }
.lr-nicon svg, .gr-picon svg { width:86%; height:86%; }
.gr-fallback img { width:min(80%,420px); height:auto; }
.gr-fallback p { margin:6px 0 0; color:#34435E; font-size:15px; text-align:center; }
.lr-mflag svg { width:72px; height:72px; }
.zn-art { left:auto !important; right:0; width:auto !important; max-width:70%;
  -webkit-mask-image:linear-gradient(90deg,transparent 0,#000 60%); mask-image:linear-gradient(90deg,transparent 0,#000 60%); }
.lr-logo-a { color:#FFD23F; }
.lr-logo-b { color:#FF4B3A; }
.lr-tag { margin:12px 0 0; background:#10306e; color:#fff; font-family:var(--ui); font-weight:800;
  font-size:clamp(15px,1.8vw,19px); padding:6px 14px; border-radius:999px; transform:rotate(-2deg); }
.lr-carstage { position:relative; width:100%; min-height:210px; margin-top:6px; }
.lr-hero::before { content:""; position:absolute; left:-10%; right:-10%; bottom:-60px; height:36%; background:#86c963;
  border-radius:50% 50% 0 0 / 100% 100% 0 0; }
.lr-brand, .lr-panels { position:relative; z-index:1; }
.lr-road { position:absolute; left:-50px; right:-50px; bottom:26px; height:60px; background:#5b616b;
  transform:rotate(-5deg); border-top:9px solid #fff; border-bottom:9px solid #fff;
  border-image:repeating-linear-gradient(90deg,#E8392B 0 26px,#fff 26px 52px) 9; }
.lr-car { position:relative; display:block; width:min(86%,330px); height:auto; margin:10px auto 0;
  filter:drop-shadow(0 10px 8px rgba(15,31,61,.25)); }
@media (min-width:900px){ .lr-carstage { min-height:250px; margin-top:14px; } .lr-road { right:-160px; } }
.lr-panels { display:flex; flex-direction:column; gap:14px; }
.lr-how { background:rgba(255,255,255,.95); border-radius:24px; padding:16px 16px 18px; box-shadow:0 4px 0 rgba(15,31,61,.08); }
.lr-how h1 { margin:0 0 12px; font-size:clamp(24px,3vw,31px); text-align:center; }
.lr-steps { list-style:none; margin:0; padding:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:14px; }
.lr-steps li { position:relative; display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px;
  background:#EEF5FF; border-radius:18px; padding:12px 6px; }
.lr-steps li + li::before { content:""; position:absolute; left:-12px; top:36px; width:0; height:0;
  border-left:10px solid #1B62E8; border-top:8px solid transparent; border-bottom:8px solid transparent; }
.lr-sicon { width:58px; height:58px; border-radius:50%; background:#fff; display:grid; place-items:center;
  font-size:30px; box-shadow:0 3px 0 var(--line); }
.lr-steps b { font-family:var(--ui); font-size:16px; line-height:1.2; }
.lr-any { font-size:13px; font-weight:800; color:#0B6E3C; background:#DAF3E6; border-radius:999px; padding:3px 9px; }
.lr-helpbtn { margin:14px auto 0; display:flex; align-items:center; justify-content:center; gap:8px; min-height:52px;
  padding:10px 22px; border:none; border-radius:16px; background:#1B62E8; color:#fff; font-family:var(--ui);
  font-weight:800; font-size:18px; cursor:pointer; box-shadow:0 4px 0 #0E45AC; }
.lr-helpbtn:active { transform:translateY(3px); box-shadow:0 1px 0 #0E45AC; }
.lr-next { display:flex; align-items:center; gap:14px; background:rgba(255,255,255,.96); border-radius:22px;
  padding:14px 16px; box-shadow:0 4px 0 rgba(15,31,61,.08); }
.lr-nicon { flex:none; width:76px; height:76px; display:grid; place-items:center; font-size:48px; }
.lr-nicon img { width:100%; height:100%; object-fit:contain; }
.lr-ntext { flex:1; min-width:0; }
.lr-ntext h2 { margin:0; font-size:clamp(20px,2.4vw,25px); line-height:1.15; }
.lr-ntext h2 span { color:#1B62E8; }
.lr-ntext p { margin:4px 0 8px; font-weight:700; color:#4A5764; }
.lr-nrow { display:flex; align-items:center; gap:10px; }
.lr-nbar { flex:1; height:16px; background:#E1E8F2; border-radius:999px; overflow:hidden; }
.lr-nbar i { display:block; height:100%; background:linear-gradient(90deg,#3ccf73,#12A05A); border-radius:999px; transition:width .5s ease; }
.lr-ncount { font-weight:800; white-space:nowrap; }
.lr-cta { display:flex; flex-wrap:wrap; align-items:center; gap:10px; }
.lr-drive { flex:1 1 220px; font-size:21px; }
.lr-cta .btn.ghost { flex:1 1 150px; }
.lr-ctanote { margin:0; flex-basis:100%; order:3; font-weight:800; color:#10306e; }
.lr-challenges { background:#F4F8FE; border:2px solid #fff; border-radius:28px; padding:22px 18px;
  box-shadow:0 6px 18px rgba(15,31,61,.08); scroll-margin-top:70px; }
.lr-challenges h2, .lr-more h2 { margin:0; font-size:clamp(28px,3.4vw,38px); }
.lr-challenges h2:focus { outline:none; }
.lr-sub { margin:4px 0 16px; font-size:18px; color:#4A5764; }
.lr-zgrid { display:grid; gap:16px; grid-template-columns:1fr; }
@media (min-width:560px){ .lr-zgrid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (min-width:960px){ .lr-zgrid { grid-template-columns:repeat(3,minmax(0,1fr)); } }
.lr-zcard { display:flex; flex-direction:column; padding:0; text-align:left; cursor:pointer; background:#fff;
  border:4px solid var(--rc); border-radius:22px; overflow:hidden; box-shadow:0 5px 0 rgba(15,31,61,.16);
  font-family:var(--ui); color:var(--ink); transition:transform .15s ease; }
.lr-zcard:hover { transform:translateY(-3px); }
.lr-zcard:active { transform:translateY(2px); }
.lr-zart { position:relative; display:block; aspect-ratio:2.35/1; overflow:hidden; background:var(--rc); }
.lr-zart img { display:block; width:100%; height:100%; object-fit:cover; }
.lr-ztitle { position:absolute; left:12px; top:8px; font-family:var(--display); font-weight:800; font-size:clamp(24px,2.6vw,30px);
  line-height:1.05; color:#fff;
  text-shadow:0 2px 0 #0F1F3D,2px 0 0 #0F1F3D,-2px 0 0 #0F1F3D,0 -2px 0 #0F1F3D,2px 2px 0 #0F1F3D,
    -2px 2px 0 #0F1F3D,2px -2px 0 #0F1F3D,-2px -2px 0 #0F1F3D,0 5px 0 rgba(15,31,61,.35); }
.lr-zfoot { display:flex; align-items:center; gap:10px; padding:12px 14px 14px; }
.lr-ztext { flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.lr-ztag { font-size:18px; font-weight:800; line-height:1.25; }
.lr-ztrophies { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:700; color:#4A5764; }
.lr-zbar { flex:0 0 64px; height:8px; background:#E1E8F2; border-radius:999px; overflow:hidden; }
.lr-zbar i { display:block; height:100%; background:var(--rc); }
.lr-zgo { flex:none; width:46px; height:46px; border-radius:50%; background:var(--rc); color:var(--rcfg);
  display:grid; place-items:center; font-size:32px; font-weight:900; line-height:1; box-shadow:0 3px 0 rgba(15,31,61,.2); }
.lr-morehead { display:flex; flex-wrap:wrap; align-items:baseline; gap:4px 14px; margin:0 4px 12px; }
.lr-more h2 { font-size:clamp(24px,2.8vw,30px); }
.lr-morehead p { margin:0; color:#4A5764; font-weight:700; }
.lr-mgrid { display:grid; gap:14px; grid-template-columns:1fr; }
@media (min-width:720px){ .lr-mgrid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.lr-mcard { display:flex; gap:14px; align-items:flex-start; background:var(--mc); border:2px solid #fff;
  border-radius:22px; padding:16px; box-shadow:0 4px 0 rgba(15,31,61,.08); }
.lr-mart { flex:none; width:96px; height:84px; display:grid; place-items:center; }
.lr-mart img { max-width:100%; max-height:100%; object-fit:contain; }
.lr-mflag img { max-height:74px; }
.lr-mbody { flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.lr-mbody h3 { margin:0; font-size:22px; }
.lr-mbody p { margin:0; }
.lr-mbody .btnrow { margin-top:4px; }
.lr-mbody .btnrow .btn { min-height:48px; padding:10px 16px; font-size:17px; }
@media (max-width:420px){ .lr-mart { width:64px; height:64px; } .lr-steps b { font-size:14px; } .lr-sicon { width:48px; height:48px; font-size:25px; } }
.lr-modal { position:fixed; inset:0; z-index:1500; background:rgba(15,31,61,.55); display:flex;
  align-items:center; justify-content:center; padding:18px; }
.lr-dialog { background:#fff; border-radius:26px; width:100%; max-width:460px; max-height:90vh; overflow:auto;
  padding:24px; box-shadow:0 16px 48px rgba(0,0,0,.3); }
.lr-dialog h2 { margin:0 0 14px; font-size:30px; text-align:center; }
.lr-helpsteps { list-style:none; margin:0 0 18px; padding:0; display:flex; flex-direction:column; gap:12px; }
.lr-helpsteps li { display:flex; gap:12px; align-items:flex-start; background:#EEF5FF; border-radius:16px; padding:12px; }
.lr-hnum { flex:none; width:40px; height:40px; border-radius:50%; background:#1B62E8; color:#fff; display:grid;
  place-items:center; font-weight:900; font-size:20px; }
.lr-helpsteps b { font-size:19px; }
.lr-helpsteps p { margin:2px 0 0; font-size:16px; line-height:1.4; }
.lr-gotit { width:100%; font-size:22px; }
.lr-drivecall { display:flex; flex-wrap:wrap; align-items:center; justify-content:center; gap:12px; text-align:center;
  background:linear-gradient(135deg,#FFF3C4,#FFE08A); border:3px solid var(--sunset); border-radius:22px;
  padding:14px 16px; }
.lr-drivecall b { display:block; font-size:21px; }
.lr-drivecall span { font-weight:700; color:#5B4A12; }
.lr-drivecall .btn { font-size:21px; }
@media (prefers-reduced-motion:reduce){ .lr-zcard, .lr-nbar i { transition:none; } .lr-zcard:hover { transform:none; } }
/* ---- shared helpers ---- */
.tt .sr-only { position:absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; border:0; }

/* ---- lesson stages ---- */
.ls-track { list-style:none; margin:4px 0 0; padding:0; display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:8px; }
.ls-tstep { display:flex; align-items:center; gap:10px; min-width:0; padding:10px 12px; border-radius:14px; background:#fff;
  border:2px solid var(--line); font-family:var(--ui); font-weight:700; font-size:15px; color:var(--soft); }
.ls-tstep.now { border-color:var(--bluebonnet); background:var(--bluebonnet-lt); color:var(--ink); }
.ls-tstep.done { border-color:#9FDCB9; background:var(--juniper-lt); color:#0B6E3C; }
.ls-tnum { flex:none; width:30px; height:30px; border-radius:50%; display:grid; place-items:center; background:var(--line); color:var(--ink); font-weight:800; }
.ls-tstep.now .ls-tnum { background:var(--bluebonnet); color:#fff; }
.ls-tstep.done .ls-tnum { background:var(--juniper); color:#fff; }
.ls-tlabel { line-height:1.2; }
@media (max-width:560px){ .ls-tstep { flex-direction:column; text-align:center; gap:4px; padding:8px 4px; font-size:13px; } }
.ls-head { display:flex; flex-direction:column; gap:8px; padding:8px 2px 0; }
.ls-head h1 { margin:0; font-size:clamp(28px,4vw,40px); line-height:1.1; }
.ls-meta, .zn-cmeta { display:flex; flex-wrap:wrap; gap:6px; }
.ls-meta span, .zn-cmeta span { font-family:var(--ui); font-size:13px; font-weight:700; color:var(--soft); background:#fff;
  border:1px solid var(--line); border-radius:999px; padding:3px 10px; }
.ls-audio { display:flex; flex-wrap:wrap; gap:8px; }
.ls-audiobtn { font-family:var(--ui); font-weight:700; font-size:15px; min-height:40px; padding:6px 14px; border-radius:999px;
  border:2px solid var(--line); background:#fff; color:var(--ink); cursor:pointer; }
.ls-audiobtn:hover { border-color:var(--bluebonnet); }
.ls-sechead { margin:6px 0 10px; font-size:24px; }
.ls-ovgrid { display:grid; gap:14px; grid-template-columns:1fr; }
@media (min-width:760px){ .ls-ovgrid { grid-template-columns:repeat(2,minmax(0,1fr)); } .ls-objective { grid-column:1 / -1; } }
.ls-panel { background:#fff; border:2px solid var(--line); border-radius:20px; padding:18px; }
.ls-panel h3 { margin:0 0 10px; font-size:20px; }
.ls-objective { background:linear-gradient(135deg,#1B62E8,#3D7BF0); border-color:#1B62E8; color:#fff; }
.ls-objective h3 { color:#fff; }
.ls-big { margin:0; font-size:clamp(19px,2.2vw,22px); line-height:1.5; }
.ls-list, .ls-steps { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:10px; }
.ls-list li { display:flex; align-items:center; gap:12px; background:#F4F8FE; border-radius:14px; padding:10px 12px; }
.ls-li { flex:none; font-size:24px; }
.ls-lt { flex:1; min-width:0; font-size:18px; line-height:1.45; }
.ls-say { flex:none; width:40px; height:40px; border-radius:50%; border:none; background:transparent; font-size:18px; cursor:pointer; opacity:.7; }
.ls-say:hover { opacity:1; background:#fff; }
.ls-skills { list-style:none; margin:0 0 10px; padding:0; display:flex; flex-wrap:wrap; gap:8px; }
.ls-skills li { font-family:var(--ui); font-weight:800; font-size:15px; padding:8px 14px; border-radius:12px;
  background:var(--sunset-lt); border:2px solid #F0D77A; color:#5B4A12; }
.ls-note { margin:6px 0 0; font-size:15px; color:var(--soft); }
.ls-ready { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px 16px; margin-top:6px;
  background:var(--ink); color:#fff; border-radius:22px; padding:16px 18px; }
.ls-readytext { display:flex; flex-direction:column; gap:2px; }
.ls-readytext b { font-family:var(--display); font-size:22px; }
.ls-readytext span { font-size:16px; color:#C9D6EE; }
.ls-ready .btn.ghost { background:transparent; color:#fff; border-color:#4A5B7E; box-shadow:none; }
.ls-bigidea { background:#fff; border:3px solid var(--sunset); border-radius:22px; padding:18px 20px; }
.ls-bigidea h2 { margin:0 0 8px; font-size:24px; }
.ls-example { margin-top:14px; display:flex; flex-direction:column; gap:6px; border-radius:16px; background:var(--ink); color:#fff; padding:14px 16px; }
.ls-exlabel { font-family:var(--ui); font-weight:800; font-size:15px; color:#FFD23F; }
.ls-extext { font-size:clamp(19px,2.4vw,24px); font-weight:700; line-height:1.45; white-space:pre-line; }
.ls-steps li { display:flex; align-items:center; gap:14px; background:#fff; border:2px solid var(--line); border-radius:16px; padding:12px 14px; }
.ls-sn { flex:none; width:40px; height:40px; border-radius:12px; background:var(--bluebonnet); color:#fff; display:grid;
  place-items:center; font-family:var(--ui); font-weight:800; font-size:20px; }
.ls-twocol { display:grid; gap:14px; grid-template-columns:1fr; align-items:start; }
@media (min-width:760px){ .ls-twocol { grid-template-columns:minmax(0,1.3fr) minmax(0,1fr); } }
.ls-another, .ls-remember { display:flex; flex-direction:column; align-items:flex-start; gap:8px; border-radius:20px; padding:16px 18px; }
.ls-another { background:#F3E8FF; border:2px solid #D9C2F5; }
.ls-remember { background:var(--juniper-lt); border:2px solid #9FDCB9; }
.ls-another h2, .ls-remember h2 { margin:0; font-size:20px; }
.ls-another p, .ls-remember p { margin:0; font-size:17px; line-height:1.5; }

/* ---- zone page ---- */
.zn-head { position:relative; overflow:hidden; display:flex; align-items:flex-end; min-height:190px; border-radius:24px;
  background:linear-gradient(100deg,#0F1F3D 0%,var(--rc) 70%); border:3px solid var(--rc); }
.zn-art { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; }
.zn-head::after { content:""; position:absolute; inset:0;
  background:linear-gradient(90deg,rgba(15,31,61,.75) 0%,rgba(15,31,61,.25) 40%,rgba(15,31,61,0) 60%); }
.zn-headtext { position:relative; z-index:1; padding:20px 22px; }
.zn-headtext h1 { margin:0; font-size:clamp(32px,5vw,48px); color:#fff; }
.zn-topic { margin:4px 0 0; font-family:var(--ui); font-weight:700; font-size:clamp(17px,2vw,20px); color:#DCE7FD; }
.zn-intro { margin:0; font-size:18px; line-height:1.5; color:#34435E; }
.zn-layout { display:grid; gap:18px; grid-template-columns:1fr; }
@media (min-width:900px){ .zn-layout { grid-template-columns:300px minmax(0,1fr); align-items:start; } .zn-about { position:sticky; top:72px; } }
.zn-about { display:flex; flex-direction:column; gap:10px; background:#fff; border:2px solid var(--line); border-radius:22px; padding:18px; }
.zn-about h2 { margin:0; font-size:22px; }
.zn-about h3 { margin:6px 0 0; font-size:17px; }
.zn-facts { margin:0; display:flex; flex-direction:column; gap:8px; }
.zn-facts div { display:flex; justify-content:space-between; gap:10px; border-bottom:1px solid #E6ECF5; padding-bottom:6px; }
.zn-facts dt { color:var(--soft); font-size:15px; }
.zn-facts dd { margin:0; font-weight:700; text-align:right; }
.zn-do { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:6px; }
.zn-do li { display:flex; align-items:center; gap:10px; font-size:16px; }
.zn-do span { flex:none; width:28px; height:28px; border-radius:50%; background:var(--rc); color:var(--rcfg); display:grid;
  place-items:center; font-family:var(--ui); font-weight:800; font-size:14px; }
.zn-skills { list-style:none; margin:0; padding:0; display:flex; flex-wrap:wrap; gap:6px; }
.zn-skills li { font-family:var(--ui); font-weight:700; font-size:14px; padding:6px 10px; border-radius:10px;
  background:#F1F4F9; color:#34435E; border:1px solid var(--line); }
.zn-skills li.got { background:var(--juniper-lt); border-color:#9FDCB9; color:#0B6E3C; }
.zn-lessons h2 { margin:0 0 10px; font-size:26px; }
.zn-grid { display:grid; gap:14px; grid-template-columns:1fr; }
@media (min-width:640px){ .zn-grid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.zn-card { display:grid; grid-template-columns:52px minmax(0,1fr); gap:10px 14px; align-content:start; text-align:left; cursor:pointer;
  background:#fff; border:2px solid var(--line); border-left:8px solid var(--rc); border-radius:20px; padding:16px;
  font-family:var(--read); color:var(--ink); box-shadow:0 4px 0 rgba(15,31,61,.08); transition:transform .15s ease, border-color .15s ease; }
.zn-card:hover { transform:translateY(-2px); border-color:var(--rc); }
.zn-cicon { width:52px; height:52px; border-radius:14px; background:#F1F4F9; display:grid; place-items:center; font-size:28px; }
.zn-cbody { display:flex; flex-direction:column; gap:6px; min-width:0; }
.zn-status { align-self:flex-start; font-family:var(--ui); font-weight:800; font-size:13px; padding:3px 10px; border-radius:999px; }
.zn-card.done .zn-status { background:var(--juniper-lt); color:#0B6E3C; }
.zn-card.tried .zn-status { background:var(--sunset-lt); color:#5B4A12; }
.zn-card.new .zn-status { background:var(--bluebonnet-lt); color:#0E45AC; }
.zn-ctitle { font-family:var(--display); font-weight:800; font-size:20px; line-height:1.2; }
.zn-cblurb { font-size:16px; line-height:1.45; color:#34435E; }
.zn-cta { grid-column:1 / -1; text-align:center; font-family:var(--ui); font-weight:800; font-size:17px; padding:12px;
  border-radius:14px; background:var(--bluebonnet); color:#fff; box-shadow:0 3px 0 #0E45AC; }
.zn-card.done .zn-cta { background:#fff; color:var(--ink); border:2px solid var(--line); box-shadow:none; }

/* ---- garage ---- */
.gr-head { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; padding-top:10px; }
.gr-head h1 { margin:0; font-size:clamp(30px,4.5vw,42px); }
.gr-sub { margin:4px 0 0; font-size:18px; color:#34435E; }
.gr-how { margin:0; background:var(--bluebonnet-lt); border:2px solid #B9CEF7; border-radius:16px; padding:12px 16px; font-size:17px; line-height:1.5; }
.gr-top { display:grid; gap:16px; grid-template-columns:1fr; }
@media (min-width:900px){ .gr-top { grid-template-columns:minmax(0,1.5fr) minmax(0,1fr); align-items:start; } }
.gr-carbox { display:flex; flex-direction:column; gap:10px; background:#151D2B; color:#fff; border-radius:24px; padding:14px;
  box-shadow:0 10px 28px rgba(15,31,61,.25); }
.gr-carhead { display:flex; justify-content:space-between; align-items:center; gap:10px; padding:2px 4px; }
.gr-carhead h2 { margin:0; font-size:22px; color:#fff; }
.gr-count { font-family:var(--ui); font-weight:800; font-size:15px; background:#26324A; border-radius:999px; padding:5px 12px; color:#9CC7FF; white-space:nowrap; }
.gr-stage { width:100%; height:clamp(240px,38vw,360px); border-radius:18px; overflow:hidden; background:#151D2B; touch-action:pan-y; cursor:grab; }
.gr-stage canvas { display:block; width:100%; height:100%; }
.gr-fallback { display:grid; place-items:center; background:#EEF3FB; cursor:default; }
.gr-legend { display:flex; flex-wrap:wrap; gap:6px 16px; padding:0 4px; font-size:14px; color:#C9D6EE; }
.gr-spin { margin-left:auto; }
.gr-dot { display:inline-block; width:12px; height:12px; border-radius:3px; vertical-align:-1px; margin-right:4px; }
.gr-dot.solid { background:#E8392B; }
.gr-dot.ghost { background:rgba(127,182,255,.45); border:1px solid #7FB6FF; }
.gr-carbox .lr-nbar { flex:none; background:#26324A; }
.gr-badges { display:flex; gap:14px; padding:0 4px; font-weight:800; }
.gr-side { display:flex; flex-direction:column; gap:14px; }
.gr-next, .gr-drive { background:#fff; border:2px solid var(--line); border-radius:22px; padding:16px; }
.gr-next { display:flex; flex-direction:column; gap:12px; }
.gr-next h2 { margin:0; font-size:20px; }
.gr-next p, .gr-drive p { margin:0; font-size:16px; line-height:1.5; }
.gr-nextrow { display:flex; align-items:center; gap:12px; }
.gr-picon { flex:none; width:60px; height:60px; border-radius:14px; background:#F1F4F9; display:grid; place-items:center; font-size:32px; overflow:hidden; }
.gr-picon img { width:88%; height:88%; object-fit:contain; }
.gr-nextname { display:block; font-family:var(--display); font-size:24px; color:var(--bluebonnet); }
.gr-nexthow { display:block; font-size:15px; font-weight:600; color:#34435E; }
.gr-drive .btn { width:100%; }
.gr-custom h2 { margin:0 0 12px; font-size:22px; }
.gr-customgrid { display:grid; gap:18px; grid-template-columns:1fr; }
@media (min-width:760px){ .gr-customgrid { grid-template-columns:repeat(2,minmax(0,1fr)); } }
.gr-label { display:block; margin-bottom:8px; font-family:var(--ui); font-weight:800; font-size:16px; }
.gr-saved { min-height:22px; margin:6px 0 0; font-weight:700; color:#0B6E3C; }
.gr-hint { margin:8px 0 0; font-size:15px; color:var(--soft); }
.gr-sechead { margin:6px 0 10px; font-size:22px; }
.gr-parts { display:grid; gap:12px; grid-template-columns:1fr; }
@media (min-width:640px){ .gr-parts { grid-template-columns:repeat(2,minmax(0,1fr)); } }
@media (min-width:1000px){ .gr-parts { grid-template-columns:repeat(3,minmax(0,1fr)); } }
.gr-part { display:flex; flex-direction:column; gap:10px; background:#fff; border:2px solid var(--line); border-radius:18px; padding:14px; }
.gr-part.got { border-color:#9FDCB9; }
.gr-part.locked { background:#F6F8FB; }
.gr-part.locked .gr-picon { filter:grayscale(1); opacity:.6; }
.gr-part.next { border-color:var(--sunset); background:#FFFBEA; }
.gr-part.next .gr-picon { filter:none; opacity:1; }
.gr-parthead { display:flex; align-items:center; gap:12px; }
.gr-parthead b { display:block; font-family:var(--display); font-size:18px; }
.gr-state { display:block; font-size:14px; font-weight:700; color:var(--soft); }
.gr-part.got .gr-state { color:#0B6E3C; }
.gr-part.next .gr-state { color:#7A5E00; }
.gr-how2 { margin:0; font-size:15px; color:#34435E; }
.gr-styles { display:flex; flex-wrap:wrap; gap:8px; }
.gr-styles .btn { font-size:15px; padding:9px 13px; min-height:44px; }
.lr-nbar.small { height:10px; }
.gr-empty { margin:0; color:var(--soft); }
@media (prefers-reduced-motion:reduce){ .zn-card { transition:none; } .zn-card:hover { transform:none; } }



/* ---- 3D drive mode ---- */
.drive3d { position:fixed; inset:0; z-index:2000; background:#9CCB6E; display:flex; flex-direction:column; }
.drive3d-top { display:flex; align-items:center; justify-content:space-between; padding:12px 16px;
  background:rgba(255,255,255,.88); font-family:var(--display); font-size:19px; }
.bd-timer-badge { font-family:var(--ui); font-weight:800; font-size:16px; background:#DCE7FD;
  border-radius:999px; padding:6px 14px; }
.drive3d-mount { flex:1; position:relative; touch-action:none; }
.drive3d-mount canvas { display:block; width:100%; height:100%; }
.drive3d-hint { position:absolute; top:66px; left:0; right:0; text-align:center; margin:0; pointer-events:none;
  color:#0F1F3D; font-weight:800; text-shadow:0 1px 3px rgba(255,255,255,.7); transition:opacity .6s; }
.drive3d-pad { position:fixed; bottom:20px; left:0; right:0; display:flex; justify-content:space-between;
  padding:0 22px; pointer-events:none; }
.dpad-btn { pointer-events:auto; width:60px; height:60px; border-radius:50%; border:none;
  background:rgba(255,255,255,.88); box-shadow:0 3px 0 rgba(0,0,0,.25); font-size:24px; color:var(--ink);
  touch-action:none; }
.dpad-mid { display:flex; flex-direction:column; gap:8px; pointer-events:auto; }
.drive3d-hud { position:absolute; top:12px; left:12px; background:rgba(255,255,255,.92); border-radius:999px;
  padding:8px 14px; font-family:var(--ui); font-weight:800; font-size:18px; color:var(--ink);
  box-shadow:0 2px 6px rgba(0,0,0,.15); pointer-events:none; }
.drive3d-hud span { font-size:14px; color:var(--soft); }
.drive3d-top { gap:8px; flex-wrap:wrap; }
.drive3d-top .btn { padding:8px 12px; min-height:40px; font-size:15px; }
.drive3d-note { position:absolute; left:50%; transform:translateX(-50%); bottom:110px; max-width:90%;
  background:rgba(15,31,61,.85); color:#fff; border-radius:14px; padding:10px 14px; font-family:var(--ui);
  font-weight:700; font-size:15px; text-align:center; pointer-events:none; }
.drive3d-quiz { position:fixed; inset:0; z-index:2100; background:rgba(15,31,61,.6); display:flex;
  align-items:center; justify-content:center; padding:16px; }
.drive3d-quizin { background:var(--paper); border-radius:22px; max-width:560px; width:100%; max-height:90vh;
  overflow:auto; padding:20px; box-shadow:0 10px 40px rgba(0,0,0,.35); }

.nextup { border-left:10px solid var(--sunset); }
.namerow { display:flex; gap:10px; }
.nameinput { flex:1; font-family:var(--ui); font-size:20px; font-weight:800; letter-spacing:.06em;
  text-transform:uppercase; padding:12px 14px; border-radius:14px; border:2px solid var(--line);
  background:var(--paper); color:var(--ink); min-height:56px; }
.swatches { display:flex; gap:10px; flex-wrap:wrap; }
.swatch { width:52px; height:52px; border-radius:15px; border:4px solid var(--line); cursor:pointer; }
.swatch.on { border-color:var(--ink); transform:scale(1.06); }
.partrow { background:var(--paper); border:2px solid var(--line); border-radius:18px; padding:15px; opacity:.62; }
.partrow.got { opacity:1; border-color:var(--juniper); }
.phead { display:flex; align-items:center; gap:14px; }
.pemoji { font-size:26px; width:46px; height:46px; flex:none; border-radius:14px; background:var(--caliche);
  display:grid; place-items:center; }
.partrow.got .pemoji { background:var(--juniper-lt); }
.phead .t { flex:1; }
.phead .t b { display:block; font-size:18px; font-weight:800; }

/* Bolt */
.bolt { display:flex; align-items:center; gap:10px; background:var(--bluebonnet-lt);
  border:2px solid #BFC9EE; border-radius:18px; padding:11px 12px; margin-top:14px; }
.bface { font-size:26px; flex:none; }
.bline { flex:1; font-size:15.5px; font-weight:700; line-height:1.4; }
.bbtn { flex:none; background:var(--paper); border:2px solid #BFC9EE; border-radius:11px;
  width:38px; height:38px; font-size:15px; cursor:pointer; color:var(--ink); }
.boltoff { display:block; margin:14px 0 0; background:none; border:none; color:var(--soft);
  font-family:var(--ui); font-size:13px; font-weight:800; cursor:pointer; padding:4px 0; }

/* breadcrumb */
.crumb { font-size:14px; font-weight:800; color:var(--soft); margin-bottom:4px; }

/* stage 1 objectives */
.goals { display:grid; gap:12px; list-style:none; margin:0; padding:0; }
.goal { display:flex; align-items:center; gap:14px; background:var(--paper);
  border:2px solid var(--line); border-left:8px solid var(--sunset); border-radius:18px; padding:16px;
  font-size:19px; font-weight:700; line-height:1.4; cursor:pointer; }
.goal:active { background:var(--sunset-lt); }
.goal .gi { font-size:30px; flex:none; width:46px; height:46px; border-radius:14px;
  background:var(--sunset-lt); display:grid; place-items:center; }
.gt { flex:1; }
.gspk { flex:none; font-size:19px; opacity:.45; }

/* stage 2 steps */
.steps { list-style:none; margin:0; padding:0; display:grid; gap:10px; counter-reset:s; }
.steps li { display:flex; gap:14px; align-items:flex-start; background:var(--paper);
  border:2px solid var(--line); border-radius:18px; padding:16px;
  font-size:18px; line-height:1.55; cursor:pointer; }
.steps li:active { background:var(--bluebonnet-lt); }
.steps .sn { flex:none; width:34px; height:34px; border-radius:11px; background:var(--bluebonnet);
  color:#fff; display:grid; place-items:center; font-family:var(--ui); font-size:18px; }
/* ===== Figure-8 race ===== */
.rc-pick { position:absolute; inset:0; z-index:5; background:linear-gradient(180deg, rgba(79,147,230,.94), rgba(233,239,250,.97));
  display:flex; align-items:flex-start; justify-content:center; overflow:auto; padding:18px 14px 30px; }
.rc-pickin { max-width:820px; width:100%; }
.rc-pickin h2 { font-family:var(--display); font-size:clamp(24px,3.4vw,32px); margin:6px 0 14px; color:#fff; text-shadow:0 2px 0 rgba(15,31,61,.35); }
.rc-cards { display:grid; gap:14px; }
@media (min-width:700px){ .rc-cards { grid-template-columns:1.35fr 1fr; } }
.rc-card { background:var(--paper); border:3px solid var(--ink); border-radius:22px; padding:18px; box-shadow:0 6px 0 rgba(15,31,61,.35);
  display:flex; flex-direction:column; }
.rc-card.race { border-color:var(--ink); background:linear-gradient(180deg,#FFF8D6,#fff 45%); }
.rc-card h3 { font-family:var(--display); font-size:24px; margin:6px 0 4px; }
.rc-card p { margin:0 0 10px; font-size:16px; line-height:1.5; }
.rc-card .btn { margin-top:auto; }
.rc-cardmap { width:100%; max-width:320px; height:auto; display:block; margin:0 auto 4px; }
.rc-cardart { font-size:64px; text-align:center; line-height:1.4; }
.rc-levels { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.rc-lv { font-family:var(--ui); border:2px solid var(--line); background:var(--paper); border-radius:14px; padding:9px 6px;
  cursor:pointer; color:var(--ink); box-shadow:0 3px 0 var(--line); }
.rc-lv b { display:block; font-size:16px; }
.rc-lv span { display:block; font-size:12px; color:var(--soft); font-weight:700; }
.rc-lv.on { border-color:var(--bluebonnet); background:var(--bluebonnet-lt); box-shadow:0 3px 0 var(--bluebonnet); }
.rc-lv:focus-visible, .ty-toggle:focus-within { outline:3px solid var(--sunset); outline-offset:2px; }
.rc-keys { color:#0F1F3D; text-align:center; margin-top:14px; font-weight:700; }
.rc-hud { position:absolute; top:12px; left:12px; background:rgba(255,255,255,.94); border:3px solid var(--ink);
  border-radius:18px; padding:8px 14px; font-family:var(--ui); min-width:200px; max-width:62vw; }
.rc-row { display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
.rc-place { font-size:30px; font-weight:800; line-height:1; color:var(--clay); }
.rc-place small { font-size:14px; color:var(--soft); }
.rc-lap { font-size:18px; font-weight:800; }
.rc-row.small2 { font-size:15px; font-weight:700; margin-top:4px; font-variant-numeric:tabular-nums; }
.rc-tip { display:block; font-size:12px; color:var(--soft); font-weight:700; margin-top:4px; }
@media (max-width:520px){ .rc-tip { display:none; } }
.rc-map { position:absolute; top:12px; right:12px; width:min(34vw,210px); height:auto; background:rgba(106,168,74,.85);
  border:3px solid var(--ink); border-radius:16px; padding:4px; }
.rc-count { position:absolute; left:50%; top:38%; transform:translate(-50%,-50%); font-family:var(--display); font-weight:800;
  font-size:clamp(90px,18vw,180px); color:#FFD21F; -webkit-text-stroke:6px #0F1F3D; paint-order:stroke fill; pointer-events:none;
  animation:rcPop .9s ease-out both; }
.rc-count.go { color:#3DDC84; }
@keyframes rcPop { 0% { transform:translate(-50%,-50%) scale(1.6); opacity:0; } 25% { opacity:1; transform:translate(-50%,-50%) scale(1); } 100% { opacity:.9; } }
.rc-wrong, .rc-boost { position:absolute; left:50%; top:22%; transform:translateX(-50%); font-family:var(--ui); font-weight:800;
  font-size:22px; padding:10px 18px; border-radius:999px; border:3px solid var(--ink); pointer-events:none; white-space:nowrap; }
.rc-wrong { background:var(--clay); color:#fff; }
.rc-boost { background:#FFD21F; color:var(--ink); top:30%; }
.rc-result { position:absolute; inset:0; z-index:6; background:rgba(15,31,61,.55); display:flex; align-items:center; justify-content:center; padding:16px; }
.rc-resultin { background:var(--paper); border:3px solid var(--ink); border-radius:24px; padding:22px; max-width:520px; width:100%; text-align:center;
  box-shadow:0 8px 0 rgba(15,31,61,.4); }
.rc-resultin h2 { font-family:var(--display); font-size:32px; margin:4px 0; }
.rc-trophy { font-size:78px; line-height:1.1; animation:pop .5s cubic-bezier(.2,1.5,.4,1); }
@media (prefers-reduced-motion: reduce){ .rc-count, .rc-trophy, .ty-ch.cur.bad { animation:none !important; } }

/* ===== Typing Speedway ===== */
.lr-mcard.wide { grid-column:1 / -1; }
.lr-mtype svg { width:92px; height:auto; }
.ty-hero { display:flex; gap:16px; align-items:center; }
.ty-heroicon svg { width:96px; height:auto; display:block; }
@media (max-width:480px){ .ty-heroicon svg { width:64px; } }
.ty-tip { background:var(--sunset-lt); border-color:#EBCB92; }
.ty-tip b { font-family:var(--ui); font-size:18px; }
.ty-tip p { margin:6px 0 0; font-size:16.5px; line-height:1.55; }
kbd { font-family:var(--ui); font-weight:800; display:inline-block; min-width:1.7em; text-align:center; padding:1px 6px;
  border:2px solid var(--ink); border-bottom-width:4px; border-radius:7px; background:#fff; font-size:.95em; }
.ty-best { color:var(--juniper) !important; font-weight:800; margin-top:2px; }
.ty-toggle { display:flex; gap:14px; align-items:center; background:var(--paper); border:2px solid var(--line); border-radius:18px;
  padding:14px 16px; cursor:pointer; }
.ty-toggle input { position:absolute; opacity:0; width:1px; height:1px; }
.ty-toggle b { font-family:var(--ui); font-size:18px; display:block; }
.ty-toggle.on { border-color:var(--bluebonnet); background:var(--bluebonnet-lt); }
.ty-switch { flex:none; width:54px; height:32px; border-radius:99px; background:#C9D3E3; border:2px solid var(--ink); position:relative; transition:background .2s; }
.ty-switch i { position:absolute; top:3px; left:3px; width:22px; height:22px; border-radius:50%; background:#fff; border:2px solid var(--ink); transition:left .2s; }
.ty-toggle.on .ty-switch { background:var(--juniper); }
.ty-toggle.on .ty-switch i { left:25px; }
.ty-road { position:relative; height:64px; border-radius:16px; background:#44484f; border:3px solid var(--ink); overflow:hidden; }
.ty-lane { position:absolute; left:0; right:0; top:50%; border-top:3px dashed rgba(255,255,255,.55); }
.ty-flag { position:absolute; right:0; top:0; bottom:0; width:26px;
  background:conic-gradient(#111 25%, #fff 0 50%, #111 0 75%, #fff 0) 0 0/13px 13px; }
.ty-car { position:absolute; top:8px; width:84px; transition:left .25s ease-out; }
.ty-car svg { width:100%; display:block; }
.ty-bar { display:flex; flex-wrap:wrap; gap:8px; align-items:center; }
.ty-board { position:relative; background:var(--paper); border:3px solid var(--ink); border-radius:22px; padding:22px 20px 16px; cursor:text;
  box-shadow:0 5px 0 rgba(15,31,61,.15); }
.ty-board.done { border-color:var(--juniper); background:var(--juniper-lt); }
.ty-line { margin:0; font-family:var(--read); font-size:clamp(28px,4.6vw,42px); line-height:1.5; letter-spacing:.02em; word-break:break-word; }
.ty-ch { border-radius:6px; padding:0 1px; }
.ty-ch.ok { color:var(--juniper); }
.ty-ch.todo { color:#8391A8; }
.ty-ch.cur { background:var(--sunset); color:var(--ink); box-shadow:inset 0 -4px 0 var(--ink); }
.ty-ch.cur.bad { background:var(--clay); color:#fff; animation:tyShake .35s; }
.ty-ch.sp.cur { color:rgba(15,31,61,.55); }
@keyframes tyShake { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-4px); } 75% { transform:translateX(4px); } }
.ty-help { margin:12px 0 0; font-family:var(--ui); font-weight:700; font-size:17px; color:var(--soft); min-height:1.5em; }
.ty-input { position:absolute; left:0; bottom:0; width:100%; height:100%; opacity:0; font-size:16px; border:none; background:transparent;
  color:transparent; caret-color:transparent; cursor:text; }
.ty-refocus { position:absolute; inset:0; margin:auto; width:max-content; height:max-content; font-family:var(--ui); font-weight:800;
  font-size:18px; padding:12px 20px; border-radius:999px; border:3px solid var(--ink); background:var(--sunset); cursor:pointer; }
.ty-kb { background:#DDE4EF; border:2px solid var(--line); border-radius:18px; padding:10px; display:flex; flex-direction:column; gap:6px;
  user-select:none; }
.ty-kbrow { display:flex; gap:5px; justify-content:center; }
.ty-kbrow.r1 { padding-left:2%; } .ty-kbrow.r2 { padding-left:0; }
.ty-key { flex:0 1 44px; min-width:0; height:40px; display:grid; place-items:center; border-radius:8px; font-family:var(--ui);
  font-weight:800; font-size:15px; color:var(--ink); border:2px solid rgba(15,31,61,.25); border-bottom-width:4px; background:#fff; position:relative; }
.ty-key.wide { flex:0 1 74px; font-size:12px; background:#F1F4F9; }
.ty-key.space { flex:0 1 300px; font-size:13px; }
.ty-key.bump::after { content:""; position:absolute; bottom:5px; width:12px; height:3px; border-radius:2px; background:var(--ink); opacity:.5; }
.ty-key.on { border-color:var(--ink); transform:translateY(-2px); box-shadow:0 0 0 3px var(--sunset); background:var(--sunset) !important; }
.f-lp { background:#FDE2E0; } .f-lr { background:#FFEBD2; } .f-lm { background:#FFF6C4; } .f-li { background:#DAF3E6; }
.f-ri { background:#DAF3E6; } .f-rm { background:#FFF6C4; } .f-rr { background:#FFEBD2; } .f-rp { background:#FDE2E0; } .f-th { background:#EDEFF3; }
.ty-legend { display:flex; flex-wrap:wrap; gap:6px; justify-content:center; }
.ty-legend span { font-size:13px; font-weight:800; padding:4px 10px; border-radius:999px; border:2px solid rgba(15,31,61,.2); }
@media (max-width:520px){ .ty-key { height:34px; font-size:13px; } .ty-kbrow { gap:3px; } .ty-kb { padding:6px; } }
.ty-results { display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:6px; }
.ty-results div { background:var(--caliche); border:2px solid var(--line); border-radius:16px; padding:10px 16px; min-width:110px; }
.ty-results b { display:block; font-family:var(--ui); font-size:28px; color:var(--bluebonnet); line-height:1.1; }
.ty-results b.r { color:var(--clay); }
.ty-results span { font-size:13px; font-weight:700; color:var(--soft); }
.ty-chip { display:inline-flex; gap:8px; align-items:center; }

`;

/* ============================================================
   GLOSSARY — tap any dotted word
   ============================================================ */
const GLOSSARY = {
  perimeter: "The distance all the way around the outside of a shape. Like walking the fence around a yard.",
  area: "How much flat space is inside a shape. Measured in squares.",
  array: "Objects lined up in equal rows and columns, like an egg carton.",
  product: "The answer when you multiply.",
  factor: "A number you multiply. In 4 × 5, both 4 and 5 are factors.",
  quotient: "The answer when you divide.",
  equivalent: "Different-looking but worth exactly the same amount.",
  numerator: "The top number of a fraction. It tells how many parts you have.",
  denominator: "The bottom number of a fraction. It tells how many equal parts the whole was cut into.",
  "unit fraction": "A fraction with 1 on top, like 1/4. It is one single piece of the whole.",
  "expanded form": "Writing a number as the VALUE of each digit added together, like 300 + 40 + 2. No multiplying shown.",
  "expanded notation": "Writing each digit TIMES its place value, all added together, like (3 × 100) + (4 × 10) + (2 × 1).",
  "place value": "What a digit is worth because of where it sits in the number.",
  round: "Change a number to a nearby friendly number, like 10 or 100.",
  polygon: "A closed flat shape made only of straight sides.",
  quadrilateral: "Any flat shape with exactly 4 straight sides.",
  parallelogram: "A quadrilateral where both pairs of opposite sides are parallel.",
  trapezoid: "A quadrilateral with at least one pair of parallel sides.",
  rhombus: "A quadrilateral with 4 equal sides.",
  prism: "A solid shape with two matching flat ends and flat sides.",
  cylinder: "A solid shape like a can: two circle ends and a curved side.",
  cone: "A solid shape with one circle end that comes to a point.",
  sphere: "A perfectly round solid, like a ball.",
  face: "A flat surface on a solid shape.",
  attribute: "A feature of a shape, like number of sides or corners.",
  capacity: "How much liquid a container can hold.",
  volume: "The amount of space something takes up. Liquid volume means how much liquid.",
  interval: "The size of each step on a graph's scale, like counting by 5s.",
  "frequency table": "A table that shows how many times each thing happened.",
  "dot plot": "A graph that stacks one dot for each piece of data above a number line.",
  pictograph: "A graph that uses pictures, where one picture can stand for more than one thing.",
  "bar graph": "A graph that uses bars. Taller bar means a bigger number.",
  scale: "The numbers on the side of a graph that tell what each step is worth.",
  income: "Money you earn from working.",
  "human capital": "The skills and knowledge a person has that help them earn money.",
  credit: "Borrowing money now and paying it back later, usually with extra.",
  interest: "Extra money you pay for borrowing, or earn for saving.",
  scarcity: "When there is not enough of something for everyone who wants it.",
  inference: "A smart guess you make using clues in the text plus what you already know.",
  evidence: "The exact words in the text that prove your answer.",
  theme: "The lesson or big message of a story. Not the same as the topic.",
  topic: "What the story is about in one or two words.",
  "central idea": "The most important point of an informational text.",
  claim: "What the author wants you to believe or do.",
  fact: "Something that can be proven true.",
  opinion: "What someone thinks or feels. It can't be proven.",
  "author's purpose": "The reason the author wrote it: to inform, to persuade, or to entertain.",
  audience: "The people the author wrote it for.",
  stanza: "A group of lines in a poem, like a paragraph.",
  "rhyme scheme": "The pattern of which lines rhyme in a poem.",
  conflict: "The problem the character has to face.",
  resolution: "How the problem gets solved at the end.",
  setting: "Where and when a story happens.",
  "point of view": "Who is telling the story. 'I' means first person. 'He' or 'she' means third person.",
  simile: "Comparing two things using like or as. 'Quiet as a mouse.'",
  hyperbole: "A huge exaggeration that isn't meant to be believed. 'I'm starving to death.'",
  onomatopoeia: "A word that sounds like the noise it names, like buzz or splash.",
  imagery: "Words that make a picture in your head.",
  voice: "How the writing sounds, like the personality of the writer.",
  homophone: "Words that sound the same but mean different things, like their and there.",
  prefix: "Word part added to the front, like re- in reread.",
  suffix: "Word part added to the end, like -ful in helpful.",
  "context clue": "Nearby words that help you figure out what a hard word means.",
  synonym: "A word that means about the same thing.",
  antonym: "A word that means the opposite.",
  "compound sentence": "Two complete sentences joined by a comma and a word like and, but, or so.",
  "subject-verb agreement": "The subject and verb have to match. One dog runs. Two dogs run.",
  tense: "When something happens: past, present, or future.",
  possessive: "Shows something belongs to someone, usually with an apostrophe.",
  adverb: "A word that tells how, when, or where something happened.",
  adjective: "A word that describes a noun.",
  preposition: "A little position word like under, before, or beside.",
  conjunction: "A joining word like and, but, or so.",
};

const VW = ({ children, onPick }) => (
  <span className="vw" onClick={() => onPick(String(children).toLowerCase())} role="button" tabIndex={0}>
    {children}
  </span>
);

/* Renders text with [[word]] as tappable vocabulary */
function RichText({ text, onWord }) {
  const parts = String(text).split(/(\[\[[^\]]+\]\])/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("[[") ? (
          <VW key={i} onPick={onWord}>{p.slice(2, -2)}</VW>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ============================================================
   PASSAGES
   ============================================================ */
const PASSAGES = {
  goldcar: {
    title: "The Last Gold Car",
    body: [
      "There was exactly one gold race car left in the whole set, and Milo had been saving it for the first race on his new track. It had been his plan since Tuesday.",
      "But Saturday morning, his little sister Rosa was already standing under the high shelf. Her hand was stretched up. Her fingers wiggled. She could not quite reach the bin.",
      "Milo opened his mouth. Then he looked at her face, at how hard she was trying, at how she had sorted every loose track piece into the right tray each morning without being asked.",
      "He walked over, lifted her up by the waist, and said nothing at all.",
      "Rosa pulled out the gold car. She turned it over twice, then held it out to him. \"We race it together,\" she said. Their grandpa, watching from the doorway, smiled into his coffee.",
    ],
  },
  speed: {
    title: "Built for Speed",
    body: [
      "The peregrine falcon is the fastest animal on Earth. When it folds its wings and dives, it can reach two hundred miles per hour — faster than a race car.",
      "On the ground, the cheetah is king. It can sprint about seventy miles per hour, and it goes from standing still to full speed in three seconds.",
      "But speed costs something. A cheetah can only run flat out for about thirty seconds before its body overheats and it has to stop. That is why a cheetah creeps close before it ever starts running.",
      "In the ocean, the sailfish is the champion. It has a long pointed bill and a body shaped like a spear, which lets water slide past instead of pushing back.",
    ],
  },
  buildtime: {
    title: "Give Us Back Our Build Time",
    body: [
      "Our school cut Friday build club from thirty minutes to fifteen. That change was a mistake, and it should be reversed.",
      "Fifteen minutes is not enough to finish anything. By the time we get our trays out and plan a design, the timer goes off and everything has to be packed away half built.",
      "Some adults think less build time means more learning time. I disagree. Building is where I actually use math — I measure, I count, I fix mistakes. Nobody makes me pay attention. I just do.",
      "Build club is not wasted time. It is the part of the week that makes the rest of it worth showing up for. Please give us our thirty minutes back.",
    ],
  },
};

/* ============================================================
   CONTENT
   ============================================================ */
const REGIONS = [
  /* `id` is saved in progress — never change it. `name`, `tag` and `art` are display only. */
  { id: "num", name: "Build Yard", sub: "Numbers & Fractions", subject: "Math", rc: "#1B62E8", icon: "🔢",
    tag: "Practice numbers & fractions", art: "build_yard" },
  { id: "ops", name: "Gear Works", sub: "Adding, Multiplying, Dividing", subject: "Math", rc: "#12A05A", icon: "⚙️",
    tag: "Practice adding, multiplying & dividing", art: "gear_works" },
  { id: "geo", name: "Build Deck", sub: "Shapes & Measuring", subject: "Math", rc: "#D8362A", icon: "📐",
    tag: "Practice shapes & measuring", art: "build_deck" },
  { id: "dat", name: "Score Tower", sub: "Graphs & Coins", subject: "Math", rc: "#F5C518", icon: "🏆",
    tag: "Practice graphs & data", art: "score_tower", fg: "#0F1F3D" },
  { id: "read", name: "Story Mode", sub: "Reading & Understanding", subject: "Reading", rc: "#8B3FD6", icon: "📖",
    tag: "Practice reading & understanding", art: "story_mode" },
  { id: "write", name: "Repair Bay", sub: "Fixing & Upgrading Writing", subject: "Reading", rc: "#0FA3B1", icon: "🔧",
    tag: "Practice writing & revising", art: "repair_bay" },
];

const CONCEPTS = [
  /* ---------------- LIMESTONE CANYON ---------------- */
  {
    id: "placevalue", region: "num", icon: "🔢", teks: "3.2A, 3.2B",
    title: "Place value and expanded form",
    idea: "Every digit has a job. Its job depends on where it sits. In 4,706 the 7 isn't just 'seven' — it is 7 hundreds, worth 700.",
    another: "Think of it like money. A 5 in the thousands spot is five $1,000 bills. The same 5 in the tens spot is five $10 bills. Same digit, very different pile. Expanded form just adds up the piles: 5,000 + 50.",
    example: "6,203 = 6,000 + 200 + 3   (there are no tens, so nothing to add)",
    qs: [
      { type: "mc", prompt: "Which shows the [[expanded form]] of 92,060?",
        options: ["9,000 + 2,000 + 600", "90,000 + 200 + 60", "90,000 + 2,000 + 60", "9,000 + 200 + 6"],
        a: 2, hint: "Say the number out loud: ninety-two thousand, sixty. What is the 9 really worth?",
        exp: "The 9 is worth 90,000, the 2 is worth 2,000, and the 6 is worth 60. Expanded form just adds those values: 90,000 + 2,000 + 60. No multiplying shown — that's expanded notation, which is the next stop." },
      { type: "entry", prompt: "In the number 38,514, what is the value of the digit 8?",
        a: 8000, hint: "Count the spots from the right: ones, tens, hundreds, thousands.",
        exp: "The 8 is in the thousands place, so it is worth 8,000 — not 8." },
      { type: "mc", prompt: "A number has 4 ten thousands, 0 thousands, 7 hundreds, 9 tens, and 2 ones. What is the number?",
        options: ["4,792", "40,792", "47,092", "40,079"],
        a: 1, hint: "Write a digit for every single spot, even the empty one.",
        exp: "4 ten thousands and 0 thousands means you must write the zero: 40,792. Skipping it would shrink the number by ten times." },
    ],
  },
  {
    id: "expnotation", region: "num", icon: "✖️", teks: "3.2A",
    title: "Expanded notation",
    idea: "[[expanded notation]] shows each digit TIMES its place value, then adds them. It is different from [[expanded form]], which only shows the values. 4,706 in expanded form is 4,000 + 700 + 6. In expanded notation it is (4 × 1,000) + (7 × 100) + (6 × 1).",
    another: "Expanded form shows the money piles: 4,000 + 700 + 6. Expanded notation shows how you made each pile: four $1,000 bills is 4 × 1,000, seven $100 bills is 7 × 100. Same number, it just shows the multiplying.",
    example: "6,203 in expanded form: 6,000 + 200 + 3.   In expanded notation: (6 × 1,000) + (2 × 100) + (3 × 1).",
    qs: [
      { type: "mc", prompt: "Which shows the [[expanded notation]] of 92,060?",
        options: ["(9 × 1,000) + (2 × 1,000) + (6 × 100)", "(9 × 10,000) + (2 × 100) + (6 × 10)", "(9 × 10,000) + (2 × 1,000) + (6 × 10)", "90,000 + 2,000 + 60"],
        a: 2, hint: "Expanded notation needs a × in every part. Which spot is the 9 in?",
        exp: "The 9 is in the ten thousands spot (9 × 10,000), the 2 is in the thousands spot (2 × 1,000), and the 6 is in the tens spot (6 × 10). Choice D is the right number, but it's expanded FORM — no multiplying shown." },
      { type: "mc", prompt: "Which one is written in expanded NOTATION?",
        options: ["3,000 + 500 + 20 + 8", "(3 × 1,000) + (5 × 100) + (2 × 10) + (8 × 1)", "3,528", "three thousand, five hundred twenty-eight"],
        a: 1, hint: "Look for the one that shows multiplying.",
        exp: "Only choice B shows each digit times its place value. Choice A is expanded form, C is standard form, and D is word form. They're all the same number, written four different ways." },
      { type: "entry", prompt: "What number is (4 × 1,000) + (7 × 100) + (5 × 1)?",
        a: 4705, hint: "Find each part's value, then add. Is there any tens part?",
        exp: "4,000 + 700 + 5 = 4,705. There is no tens part, so the tens spot gets a 0." },
      { type: "place", prompt: "Finish the expanded notation for 63,480. Drag the right place value to each digit.",
        tiles: ["× 10,000", "× 1,000", "× 100", "× 10"],
        slots: [{ lab: "6", a: "× 10,000" }, { lab: "3", a: "× 1,000" }, { lab: "4", a: "× 100" }, { lab: "8", a: "× 10" }],
        hint: "Name the spots from the right: ones, tens, hundreds, thousands, ten thousands.",
        exp: "63,480 = (6 × 10,000) + (3 × 1,000) + (4 × 100) + (8 × 10). The 0 is in the ones spot, so there's no ones part." },
      { type: "mc", prompt: "What is the difference between expanded form and expanded notation?",
        options: ["There is no difference", "Expanded notation shows each digit times its place value; expanded form only adds the values", "Expanded form uses multiplying; expanded notation uses subtracting", "Expanded notation only works for small numbers"],
        a: 1, hint: "Think about which one has × signs.",
        exp: "Both add up the pieces of a number. Expanded notation shows the multiplying, like (5 × 100). Expanded form shows just the value, like 500." },
    ],
  },
  {
    id: "compare", region: "num", icon: "⚖️", teks: "3.2C, 3.2D",
    title: "Comparing and rounding",
    idea: "To compare, line the numbers up and check the biggest spot first. The first spot where they differ decides it — nothing after that matters.",
    another: "For [[round]]ing, picture a number line. Which friendly number is your number closest to? If it lands exactly in the middle, go up.",
    example: "1,309 vs 1,290 → thousands same, hundreds 3 vs 2 → 1,309 is greater. Stop there.",
    qs: [
      { type: "mc", prompt: "Which comparison is true?\nFriday 1,298   Saturday 1,309   Sunday 1,290   Monday 1,398",
        options: ["Saturday's number > Sunday's number", "Friday's number = Monday's number", "Monday's number < Sunday's number", "Sunday's number > Friday's number"],
        a: 0, hint: "The open mouth of the symbol always eats the bigger number.",
        exp: "Both numbers have 1 thousand, so move right. Hundreds: 1,309 has 3 and 1,290 has 2. Three hundreds beats two, so Saturday is greater. True." },
      { type: "place", prompt: "Drag the correct symbol into each box.",
        tiles: ["<", ">", "="],
        slots: [{ lab: "45,120 ___ 45,210", a: "<" }, { lab: "8,006 ___ 8,060", a: "<" }],
        hint: "Compare one spot at a time, starting from the left.",
        exp: "45,120 vs 45,210: thousands match, hundreds 1 vs 2, so the first is smaller. 8,006 vs 8,060: tens 0 vs 6, so again the first is smaller." },
      { type: "mc", prompt: "A point on a number line sits between 8,000 and 10,000, much closer to 8,000. Which statement is best?",
        options: ["The number was less than 8,000.", "The number was greater than 10,000.", "The number was about 10,000 because the point is closer to 10,000.", "The number was about 8,000 because the point is closer to 8,000."],
        a: 3, hint: "Closer to means rounds to.",
        exp: "The point is between the two, so it is not less than 8,000 or greater than 10,000. Since it is nearer 8,000, that's the best estimate." },
    ],
  },
  {
    id: "fractions", region: "num", icon: "🍕", teks: "3.3A–H, 3.7A",
    title: "Fractions: parts, number lines, equal amounts",
    idea: "The [[denominator]] tells how many equal pieces the whole was cut into. The [[numerator]] tells how many you took. Bigger denominator means MORE cuts, so SMALLER pieces.",
    another: "Think about sharing one candy bar. Split it with 2 friends, you get a big chunk. Split the same bar with 8 friends and your piece is tiny — even though 8 is a bigger number.",
    example: "1/3 and 2/6 are [[equivalent]]. Same amount of bar, just cut differently.",
    qs: [
      { type: "shade", prompt: "Shade the model to show 3/4.", parts: 4, a: 3,
        hint: "The bottom number tells you how many pieces there are. The top tells you how many to color.",
        exp: "The whole is cut into 4 equal parts, so each part is 1/4. Shading 3 of them shows 3/4." },
      { type: "mc", prompt: "Which fraction is greater, 2/3 or 2/8?",
        options: ["2/8, because 8 is bigger than 3", "2/3, because thirds are bigger pieces than eighths", "They are equal", "You cannot tell without a picture"],
        a: 1, hint: "Same number of pieces taken. Which pieces are bigger?",
        exp: "Both take 2 pieces. But cutting into 3 makes fat pieces and cutting into 8 makes skinny ones. Two fat pieces beat two skinny ones. This is the trick the test loves." },
      { type: "mc", prompt: "Which fraction is [[equivalent]] to 2/3?",
        options: ["3/2", "2/6", "4/6", "3/4"],
        a: 2, hint: "If you cut every piece in half, you get twice as many pieces AND take twice as many.",
        exp: "Double both parts of 2/3 and you get 4/6. Same amount of the whole, just more cuts." },
    ],
  },
  /* ---------------- CATTLE CROSSING ---------------- */
  {
    id: "addsub", region: "ops", icon: "➕", teks: "3.4A, 3.5A",
    title: "Adding and subtracting, one step and two",
    idea: "A two-step problem hides a second question inside the first. Find the hidden middle number before you can find the answer.",
    another: "Read it like a story with a beginning, middle, and end. What did I start with? What changed? Then what changed again?",
    example: "368 nickels, and 109 MORE dimes than nickels. Step 1: dimes = 368 + 109 = 477. Step 2: total = 368 + 477 = 845.",
    qs: [
      { type: "entry", prompt: "A park had 356 adults and 598 children last week. What was the total number of visitors?",
        a: 954, hint: "Total means put them together.",
        exp: "356 + 598 = 954. Adding 600 and taking back 2 is a fast way: 356 + 600 = 956, then 956 − 2 = 954." },
      { type: "multi", prompt: "Skye won 465 points, lost 192 points, then won 309 points. Which equations find her total? Select TWO.",
        options: ["465 + 309 = ", "465 + 309 − 192 = ", "465 + 309 + 192 = ", "465 − 192 + 309 = ", "465 − 192 = "],
        a: [1, 3], pick: 2, hint: "Won means add. Lost means subtract. All three rounds must appear.",
        exp: "You need all three numbers with the right signs. Both 465 + 309 − 192 and 465 − 192 + 309 do that — order doesn't matter here, but the minus must stay on the 192." },
      { type: "mc", prompt: "A teacher bought 18 red markers and 6 boxes of blue markers with 10 in each box. How many markers in all?",
        options: ["78", "34", "60", "24"],
        a: 0, hint: "You can't add 18 and 6. Find the blue markers first.",
        exp: "Blue: 6 × 10 = 60. Then 60 + 18 = 78. The trap answer is 24, which comes from adding 18 + 6 without thinking." },
    ],
  },
  {
    id: "mult", region: "ops", icon: "✖️", teks: "3.4D–G, 3.5B, 3.5C",
    title: "What multiplying really means",
    idea: "Multiplying is equal groups. 7 × 6 means seven groups with six in each. An [[array]] shows the same thing as rows and columns.",
    another: "'3 times as many' means take the amount and stack it three times. If a shop sold 15 small sets and 3 × 15 large ones, the LARGE pile is the big one.",
    example: "6 apples in each of 7 bags → 7 × 6 = 42 apples.",
    qs: [
      { type: "mc", prompt: "A shop sold 15 small race car sets. Large sets sold = 3 × 15. Which statement is true?",
        options: ["Large is 15 times the number of small.", "Small is 15 times the number of large.", "Large is 3 times the number of small.", "Small is 3 times the number of large."],
        a: 2, hint: "The 3 is doing the multiplying. Which pile grew?",
        exp: "3 × 15 means three groups of 15, so there are 3 times as many large sets as small ones. Watch the word order carefully — the test swaps it on purpose." },
      { type: "entry", prompt: "A box top will be covered with 6 rows of 8 square tiles. How many tiles?",
        a: 48, hint: "Rows times how many in each row.",
        exp: "6 × 8 = 48 tiles. This is exactly how [[area]] works too." },
      { type: "mc", prompt: "Which method can be used to solve 3 × 7?",
        options: ["7 × 7 × 7", "7 + 7 + 7", "Count 7, 10, 13, 16, 19, 22, 25, 28", "3 + 7"],
        a: 1, hint: "Three groups of seven. Write them out.",
        exp: "3 × 7 is three sevens added: 7 + 7 + 7 = 21. Choice A multiplies three times instead. Choice C adds 3 over and over, which is 7 × 3 counted wrong." },
    ],
  },
  {
    id: "div", region: "ops", icon: "➗", teks: "3.4H, 3.4J, 3.4K, 3.5D",
    title: "Dividing and finding what's missing",
    idea: "Dividing is fair sharing. 12 blocks into 4 equal groups means each group gets 3. Multiplication and division are the same fact backwards.",
    another: "If you forget a division fact, ask a multiplication question instead. 54 ÷ 6 is really 'six times WHAT equals 54?'",
    example: "Missing factor: 8 × ___ = 56. Ask what times 8 makes 56 → 7.",
    qs: [
      { type: "mc", prompt: "Rami made 54 muffins and put 6 in each box. How many boxes did he need?",
        options: ["48", "60", "9", "6"],
        a: 2, hint: "Six times what equals fifty-four?",
        exp: "54 ÷ 6 = 9 boxes. The wrong answers come from subtracting (48) or adding (60) instead of dividing." },
      { type: "mc", prompt: "Glynna has 3 boxes of 8 candles and will split them evenly onto 4 cakes. Which equation finds the candles per cake?",
        options: ["3 × 8 × 4 = ", "3 + 8 ÷ 4 = ", "3 + 8 × 4 = ", "3 × 8 ÷ 4 = "],
        a: 3, hint: "First find how many candles there are, then share them out.",
        exp: "3 × 8 = 24 candles total, then 24 ÷ 4 = 6 per cake. The equation must multiply first, then divide." },
      { type: "entry", prompt: "A librarian places 36 books evenly on 4 shelves. How many books per shelf?",
        a: 9, hint: "Four times what equals thirty-six?",
        exp: "36 ÷ 4 = 9. Check it backwards: 4 × 9 = 36. ✓" },
    ],
  },
  {
    id: "tables", region: "ops", icon: "📋", teks: "3.5E",
    title: "Finding the rule in a table",
    idea: "A table hides a rule. Test your rule on EVERY row, not just the first one. If it only works once, it's the wrong rule.",
    another: "Ask yourself: did the numbers grow by adding the same amount each time, or by multiplying by the same amount?",
    example: "Robots 3 → wheels 9. Robots 8 → wheels 24. 3 + 6 = 9 works... but 8 + 6 = 14, not 24. So it isn't adding. 3 × 3 = 9 and 8 × 3 = 24. The rule is times 3.",
    qs: [
      { type: "inline", prompt: "Robots made: 3, 8, 13, 18. Wheels needed: 9, 24, 39, 54. Complete the sentence.",
        sentence: ["The number of wheels is equal to the number of robots ", 0, " ", 1, "."],
        blanks: [{ choices: ["plus", "times"], a: 1 }, { choices: ["3", "5", "6", "15"], a: 0 }],
        hint: "Try your rule on the last row too, not just the first.",
        exp: "3 × 3 = 9, 8 × 3 = 24, 13 × 3 = 39, 18 × 3 = 54. The rule 'times 3' works for all four rows. 'Plus 6' only works for the first row." },
      { type: "entry", prompt: "The rule is 'times 4'. If the input is 7, what is the output?",
        a: 28, hint: "Apply the rule to 7.",
        exp: "7 × 4 = 28." },
      { type: "mc", prompt: "A table shows: 2 → 10, 4 → 20, 6 → 30. What is the rule?",
        options: ["Add 8", "Times 5", "Add 10", "Times 2"],
        a: 1, hint: "Check the middle row before you decide.",
        exp: "2 × 5 = 10, 4 × 5 = 20, 6 × 5 = 30. 'Add 8' works only for the first row — a classic trap." },
    ],
  },
  /* ---------------- FENCE LINE RIDGE ---------------- */
  {
    id: "shapes", region: "geo", icon: "🔷", teks: "3.6A, 3.6B",
    title: "Sorting shapes by their attributes",
    idea: "Sort by what a shape HAS, not what it looks like. Count sides, corners, and [[face]]s. A [[quadrilateral]] is any shape with exactly 4 straight sides.",
    another: "Squares are rectangles. Rectangles are [[parallelogram]]s. Parallelograms are quadrilaterals. Each one is a special member of the bigger family — like how a poodle is still a dog.",
    example: "A [[cylinder]] has 2 flat circle faces. A [[cone]] has 1. A [[sphere]] has none.",
    qs: [
      { type: "place", prompt: "Sort each solid by how many flat faces it has.",
        tiles: ["Sphere", "Cone", "Cylinder", "Cube"],
        slots: [{ lab: "0 flat faces", a: "Sphere" }, { lab: "1 flat face", a: "Cone" }, { lab: "2 flat faces", a: "Cylinder" }, { lab: "6 flat faces", a: "Cube" }],
        hint: "Picture holding each one. Where could you set it down flat?",
        exp: "A ball has no flat spot. A cone has just the circle bottom. A can has a top and bottom. A cube has 6 square faces." },
      { type: "mc", prompt: "Which statement is true about ALL rectangles?",
        options: ["All rectangles are squares.", "All rectangles are [[quadrilateral]]s.", "All rectangles have 4 equal sides.", "All rectangles are [[rhombus]]es."],
        a: 1, hint: "Careful with the word ALL. One counterexample kills it.",
        exp: "Every rectangle has 4 straight sides, so all rectangles are quadrilaterals. But a long skinny rectangle is not a square and has no 4 equal sides — so the others fail." },
      { type: "mc", prompt: "Which shape is NOT a [[polygon]]?",
        options: ["Triangle", "Hexagon", "Circle", "Trapezoid"],
        a: 2, hint: "Polygons are made only of straight sides.",
        exp: "A circle is curved with no straight sides, so it isn't a polygon." },
    ],
  },
  {
    id: "area", region: "geo", icon: "🟦", teks: "3.6C, 3.6D",
    title: "Area: covering the inside",
    idea: "[[Area]] is how many unit squares fit inside. Multiply rows × how many in each row. The answer is in SQUARE units.",
    another: "For a weird L-shaped figure, chop it into two rectangles, find each area, then add them together.",
    example: "A rectangle 10 rows of 4 → 10 × 4 = 40 square inches.",
    qs: [
      { type: "entry", prompt: "A rectangle is 9 units long and 5 units wide. What is its [[area]] in square units?",
        a: 45, hint: "Length times width.",
        exp: "9 × 5 = 45 square units." },
      { type: "mc", prompt: "An L-shape is made of a 4 × 3 rectangle and a 2 × 3 rectangle. What is the total area?",
        options: ["12 square units", "18 square units", "9 square units", "24 square units"],
        a: 1, hint: "Find each rectangle's area, then combine.",
        exp: "4 × 3 = 12 and 2 × 3 = 6. Then 12 + 6 = 18 square units. Splitting the figure is always allowed." },
      { type: "mc", prompt: "Why is area measured in SQUARE units?",
        options: ["Because the shape is always a square", "Because you are counting little squares that cover the space", "Because you multiply two numbers", "Because it sounds better"],
        a: 1, hint: "Think about what you are actually counting.",
        exp: "Area counts how many unit squares tile the inside, so the label is square inches, square centimeters, and so on. [[Perimeter]] is just plain units because you're measuring a line." },
    ],
  },
  {
    id: "perimeter", region: "geo", icon: "📏", teks: "3.7B",
    title: "Perimeter: walking the fence",
    idea: "[[Perimeter]] is the total distance around the outside. Add up every side. If all sides are equal, you can multiply instead.",
    another: "Perimeter is the fence. Area is the grass inside the fence. The test will hand you one and ask for the other, so read carefully.",
    example: "An octagon with all sides 3 cm: 8 sides × 3 = 24 cm.",
    qs: [
      { type: "mc", prompt: "Samantha drew an octagon with each side measuring 3 centimeters. What is its [[perimeter]]?",
        options: ["11 cm", "24 cm", "16 cm", "64 cm"],
        a: 1, hint: "How many sides does an octagon have?",
        exp: "An octagon has 8 sides. 8 × 3 = 24 cm. Choice A comes from adding 8 + 3, which is a very common slip." },
      { type: "entry", prompt: "A rectangle has sides 7 m, 4 m, 7 m, and 4 m. What is the perimeter in meters?",
        a: 22, hint: "Add all four sides.",
        exp: "7 + 4 + 7 + 4 = 22 meters. Don't stop at 11 — that's only two sides." },
      { type: "entry", prompt: "A triangle has a perimeter of 20 cm. Two sides are 6 cm and 8 cm. How long is the third side in cm?",
        a: 6, hint: "Add the two you know, then figure out what's left.",
        exp: "6 + 8 = 14. Then 20 − 14 = 6 cm. Working backwards from a known perimeter shows up on the test often." },
    ],
  },
  {
    id: "measure", region: "geo", icon: "⏰", teks: "3.7C, 3.7D, 3.7E",
    title: "Time and choosing the right unit",
    idea: "For time, count forward: whole hours first, then minutes. For units, ask whether you are measuring liquid you could pour, or weight you could hold.",
    another: "Match the unit to the size of the thing. Milliliters for a spoonful, liters for a bottle. Ounces for a slice of bread, pounds for a backpack.",
    example: "A movie starts at 6:45 and lasts 1 hour 15 minutes. 6:45 + 1 hour = 7:45. Then + 15 min = 8:00.",
    qs: [
      { type: "mc", prompt: "A movie started at 6:45 and lasted 1 hour 15 minutes. What time did it end?",
        options: ["8:00", "10:45", "5:30", "7:24"],
        a: 0, hint: "Add the hour first, then the minutes.",
        exp: "6:45 + 1 hour = 7:45. Then 7:45 + 15 minutes = 8:00." },
      { type: "place", prompt: "Choose the best unit for measuring each item.",
        tiles: ["milliliters", "liters", "ounces", "pounds"],
        slots: [{ lab: "Medicine in a spoon", a: "milliliters" }, { lab: "Water in a big jug", a: "liters" }, { lab: "A slice of bread", a: "ounces" }, { lab: "A full backpack", a: "pounds" }],
        hint: "Small thing, small unit. Big thing, big unit. Liquid or weight?",
        exp: "Milliliters and liters measure liquid [[volume]]. Ounces and pounds measure weight. Then match small to small and big to big." },
      { type: "entry", prompt: "Build club starts at 1:20 and lasts 25 minutes. It is now 1:35. How many minutes are left?",
        a: 10, hint: "Figure out when build club ends first.",
        exp: "1:20 + 25 minutes ends at 1:45. From 1:35 to 1:45 is 10 minutes left." },
    ],
  },
  /* ---------------- MARKET SQUARE ---------------- */
  {
    id: "graphs", region: "dat", icon: "📊", teks: "3.8A, 3.8B",
    title: "Reading graphs without getting tricked",
    idea: "Always check the [[scale]] first. If bars count by 5s, a bar reaching the third line means 15, not 3. On a [[pictograph]], read the key — one picture can stand for 2, 5, or 10.",
    another: "A [[dot plot]] stacks one dot per item. To check one, count how many times a number appears in the data list and see if the dots match.",
    example: "Data: 6, 8, 6, 12, 6. The number 6 appears three times, so its column has exactly 3 dots.",
    qs: [
      { type: "mc", prompt: "A [[pictograph]] key says each ⭐ = 4 books. A row shows 6 stars. How many books?",
        options: ["6", "10", "24", "4"],
        a: 2, hint: "Each picture is worth more than one.",
        exp: "6 stars × 4 books each = 24 books. Counting the pictures instead of using the key is the classic mistake." },
      { type: "entry", prompt: "A [[bar graph]] counts by 5s. A bar reaches the fourth line above zero. What number does it show?",
        a: 20, hint: "Count by the scale, not by ones.",
        exp: "Counting by 5s: 5, 10, 15, 20. The fourth line is 20." },
      { type: "mc", prompt: "Eggs collected: 14, 7, 6, 12, 5, 13, 8, 6, 10, 12, 6, 8, 6, 14. How many dots go above the number 6?",
        options: ["2", "3", "4", "6"],
        a: 2, hint: "Go through the list slowly and mark each 6.",
        exp: "The 6 shows up four times in the list, so the column above 6 has 4 dots. Cross off each number as you count so you don't miss one." },
    ],
  },
  {
    id: "money", region: "dat", icon: "💵", teks: "3.4C, 3.9",
    title: "Money, saving, and borrowing",
    idea: "Count coins from biggest to smallest. For money questions in words, ask: is this about earning, saving, spending, or borrowing?",
    another: "Saving means putting money aside for later, and the bank may pay you [[interest]]. [[Credit]] is the opposite — you borrow now and pay back more later.",
    example: "3 quarters, 2 dimes, 1 nickel = 75 + 20 + 5 = 100¢ = $1.00",
    qs: [
      { type: "entry", prompt: "Count the total in cents: 2 quarters, 3 dimes, 4 pennies.",
        a: 84, hint: "Quarter 25, dime 10, nickel 5, penny 1. Start with the biggest.",
        exp: "50 + 30 + 4 = 84 cents." },
      { type: "mc", prompt: "Alberto is paid for the hours he works. Which statement is most likely true?",
        options: ["The more hours he works, the less he earns.", "The fewer hours he works, the less he earns.", "The more hours he works, the less labor he provides.", "The fewer hours he works, the more labor he provides."],
        a: 1, hint: "More work should mean more pay. Which choice matches that?",
        exp: "Working fewer hours means earning less. This is the link between labor and [[income]]. The other choices reverse the relationship." },
      { type: "mc", prompt: "Maia puts some earnings into a savings account each month. Which statement is true?",
        options: ["Maia must pay [[interest]] on money in her savings account.", "The account lets her plan for a large purchase later.", "She must put in the same amount every month.", "The bank won't let her spend it until college."],
        a: 1, hint: "Saving is about planning ahead, not about rules.",
        exp: "Saving lets you plan for something big later. You pay interest when you BORROW, not when you save — banks usually pay you instead." },
    ],
  },
  /* ---------------- STORY SPRINGS ---------------- */
  {
    id: "vocab", region: "read", icon: "🔤", teks: "3.3B, 3.3C, 3.3D",
    title: "Figuring out words you don't know",
    idea: "You do not need to already know a word. Read the whole sentence, then the one before and after. The [[context clue]]s will hand you the meaning.",
    another: "Break the word into parts. A [[prefix]] like un- or re- changes the front. A [[suffix]] like -ful or -less changes the end. 'Unhelpful' = not + help + full of.",
    example: "'The robot was immobile, frozen in place until someone pressed the switch.' You never learned immobile — but the sentence just told you it means not moving.",
    qs: [
      { type: "mc", prompt: "\"Milo waited impatiently, tapping his foot and checking the clock every ten seconds.\" What does impatiently mean?",
        options: ["Very quietly", "Not able to wait calmly", "With great skill", "In a sleepy way"],
        a: 1, hint: "The [[prefix]] im- means not. What else in the sentence shows how he felt?",
        exp: "im- means not, and patient means able to wait calmly. The foot tapping and clock checking confirm it." },
      { type: "mc", prompt: "Which word is a [[homophone]] for 'their'?",
        options: ["Theirs", "There", "Them", "Thair"],
        a: 1, hint: "Homophones sound identical but mean different things.",
        exp: "'There' sounds exactly like 'their' but means a place. 'They're' is a third one, short for they are." },
      { type: "place", prompt: "Match each word to its meaning.",
        tiles: ["rebuild", "helpless", "kindness", "preview"],
        slots: [{ lab: "Build again", a: "rebuild" }, { lab: "Without help", a: "helpless" }, { lab: "The state of being kind", a: "kindness" }, { lab: "To view before", a: "preview" }],
        hint: "Chop off the [[prefix]] or [[suffix]] and look at what's left.",
        exp: "re- means again, -less means without, -ness turns it into a thing you can have, pre- means before." },
    ],
  },
  {
    id: "infer", region: "read", icon: "🔍", teks: "3.6F, 3.7C, 3.8A–D",
    title: "Inferring and proving it with the text",
    idea: "An [[inference]] is text clues PLUS what you already know. The author doesn't say it straight out, but the story shows it.",
    another: "After you pick an answer, go back and find the exact sentence that proves it. If you cannot point at a line, your answer is probably a guess.",
    example: "The story never says Milo was generous. It says he lifted his sister up and said nothing. You infer it from what he did.",
    passage: "goldcar",
    qs: [
      { type: "mc", prompt: "Why does Milo say nothing at all when he lifts Rosa up?",
        options: ["He is too angry to speak.", "He has decided to give up his plan without making a fuss.", "He does not know her name.", "He is afraid of his grandpa."],
        a: 1, hint: "Look at what he noticed right before he moved.",
        exp: "He looked at how hard she was trying and how she had sorted the pieces every morning. He changes his mind and gives up the gold car quietly. The text never says angry or afraid." },
      { type: "mc", prompt: "What is the [[theme]] of this story?",
        options: ["Gold cars are the fastest cars.", "Big brothers make unfair rules.", "Sometimes giving something up brings you something better.", "Building race tracks is hard work."],
        a: 2, hint: "[[Theme]] is the lesson, not the topic. The topic is a toy car. What's the lesson?",
        exp: "Milo gives up his plan, and Rosa offers to race together anyway. The lesson is about generosity coming back around. 'Gold cars' and 'racing' are topics, not lessons." },
      { type: "mc", prompt: "Which sentence is the best [[evidence]] that Rosa worked hard for the set?",
        options: ["\"Her hand was stretched up.\"", "\"she had sorted every loose piece into the right tray each morning without being asked\"", "\"Rosa pulled out the gold car.\"", "\"Their grandpa, watching from the doorway, smiled into his coffee.\""],
        a: 1, hint: "Which line actually mentions work she did?",
        exp: "Only that line describes effort over time. The others describe a single moment." },
    ],
  },
  {
    id: "infotext", region: "read", icon: "📰", teks: "3.9D, 3.9E, 3.10A",
    title: "Informational and argument texts",
    idea: "Informational text teaches you facts. Argumentative text tries to change your mind — it has a [[claim]] and reasons. Ask: is the author teaching me, or convincing me?",
    another: "A [[fact]] can be checked and proven. An [[opinion]] uses words like should, best, worst, or I think. Spot those words and you've spotted the opinion.",
    example: "'A cheetah runs about seventy miles per hour' — fact. 'Cheetahs are the coolest animal alive' — opinion.",
    passage: "speed",
    qs: [
      { type: "mc", prompt: "What is the [[central idea]] of 'Built for Speed'?",
        options: ["Cheetahs are the fastest animals alive.", "Different animals are built for speed in different ways, and speed has a cost.", "Falcons live in the sky.", "Sailfish have long bills."],
        a: 1, hint: "The central idea has to cover the WHOLE passage, not just one paragraph.",
        exp: "The passage covers air, land, and ocean, plus what speed costs a cheetah. The other choices are true details but too small to be the central idea." },
      { type: "multi", prompt: "Which statements from the passage are FACTS? Select TWO.",
        options: ["The peregrine falcon is the coolest bird alive.", "A cheetah can sprint about seventy miles per hour.", "Everyone should watch a falcon dive.", "A cheetah can run flat out for about thirty seconds.", "Sailfish are scary."],
        a: [1, 3], pick: 2, hint: "A fact can be measured and proven. Watch for coolest, should, and scary.",
        exp: "Speed and time can both be measured with tools. 'Coolest', 'should', and 'scary' are opinions — they're what someone thinks." },
      { type: "mc", prompt: "In 'Give Us Back Our Build Time', what is the author's [[claim]]?",
        options: ["Building uses math.", "The shortened build club should be changed back to thirty minutes.", "Fifteen minutes goes by fast.", "Build club happens on Fridays."],
        a: 1, hint: "The claim is what the author wants to HAPPEN.",
        exp: "The first and last paragraphs both say the change was a mistake and should be reversed. The other choices are reasons or details supporting that claim." },
    ],
  },
  {
    id: "craft", region: "read", icon: "🎭", teks: "3.10A–G",
    title: "Why the author wrote it that way",
    idea: "[[Author's purpose]] comes in three flavors: to inform, to persuade, or to entertain. Ask what the author wanted YOU to do after reading.",
    another: "Authors choose words on purpose. A [[simile]] compares with like or as. [[Hyperbole]] is a wild exaggeration. Neither is meant literally — they're there to make a picture.",
    example: "'Built like a tiny tank' is a comparison that helps you picture armor without a long explanation.",
    passage: "buildtime",
    qs: [
      { type: "mc", prompt: "What is the author's purpose in 'Give Us Back Our Build Time'?",
        options: ["To entertain readers with a funny story", "To inform readers about club schedules", "To persuade the school to restore longer build time", "To describe what build club looks like"],
        a: 2, hint: "What does the author want to happen after you read it?",
        exp: "The author states a [[claim]], gives reasons, and ends with a request. That's persuading." },
      { type: "mc", prompt: "\"I was so hungry I could have eaten the whole cafeteria.\" This is an example of —",
        options: ["a [[simile]]", "[[hyperbole]]", "[[onomatopoeia]]", "a fact"],
        a: 1, hint: "Could anyone really do that?",
        exp: "It's a huge exaggeration nobody is meant to believe, which is hyperbole. A simile would need like or as." },
      { type: "mc", prompt: "A story begins, \"I woke up before the sun and pulled on my boots.\" What [[point of view]] is this?",
        options: ["First person", "Third person", "Second person", "You cannot tell"],
        a: 0, hint: "Look at the pronoun the narrator uses.",
        exp: "The narrator uses 'I', so the story is told in first person by someone inside the story." },
    ],
  },
  /* ---------------- INK CREEK ---------------- */
  {
    id: "grammar", region: "write", icon: "🔧", teks: "3.11D",
    title: "Fixing sentences",
    idea: "For editing questions, read the sentence out loud in your head. Your ear catches most mistakes before your eyes do.",
    another: "Check three things every time: does the verb match the subject, is the [[tense]] consistent, and is the punctuation doing a job?",
    example: "'The dogs runs fast' sounds wrong because two dogs need 'run', not 'runs'.",
    qs: [
      { type: "mc", prompt: "Which sentence is written correctly?",
        options: ["The three birds sings in the tree.", "The three birds sing in the tree.", "The three bird sing in the tree.", "The three birds singing in the tree."],
        a: 1, hint: "Say it out loud. Does the verb match the number of birds?",
        exp: "More than one bird needs 'sing'. That's [[subject-verb agreement]]. Choice D isn't a complete sentence." },
      { type: "inline", prompt: "Choose the correct words to finish the sentence.",
        sentence: ["Yesterday my brother ", 0, " to the store, and he ", 1, " milk."],
        blanks: [{ choices: ["walk", "walked", "walks"], a: 1 }, { choices: ["buy", "buys", "bought"], a: 2 }],
        hint: "The word Yesterday tells you when this happened.",
        exp: "'Yesterday' means past [[tense]], so both verbs must be past: walked and bought. Mixing tenses inside one sentence is the trap here." },
      { type: "mc", prompt: "Where does the comma belong? \"We wanted to go outside but it started raining.\"",
        options: ["After We", "After outside", "After but", "No comma is needed"],
        a: 1, hint: "This is a [[compound sentence]]. Two full sentences are joined.",
        exp: "'We wanted to go outside' and 'it started raining' are both complete sentences joined by 'but', so a comma goes before the joining word: outside, but it started raining." },
    ],
  },
  {
    id: "revise", region: "write", icon: "✨", teks: "3.11B, 3.11C",
    title: "Making writing better",
    idea: "Revising is different from editing. Editing fixes mistakes. Revising makes the writing clearer and stronger, even when nothing is broken.",
    another: "A good paragraph sticks to one idea. If a sentence wanders off the topic, it should go — even if it's a nice sentence.",
    example: "In a paragraph about training a puppy, 'My uncle lives in Houston' does not belong, no matter how true it is.",
    qs: [
      { type: "mc", prompt: "A paragraph is about how to plant a garden. Which sentence should be REMOVED?",
        options: ["First, choose a sunny spot.", "Water the seeds gently each morning.", "My favorite movie came out last summer.", "Pull weeds so they don't crowd the plants."],
        a: 2, hint: "Which one has nothing to do with gardens?",
        exp: "The movie sentence is off topic. Every sentence in a paragraph should support the same idea." },
      { type: "mc", prompt: "Which sentence gives the most vivid detail?",
        options: ["The dog was happy.", "The dog wagged its tail so hard its whole back end swung.", "The dog was a good dog.", "The dog felt nice."],
        a: 1, hint: "Which one lets you SEE it?",
        exp: "Showing beats telling. The second sentence uses [[imagery]] — you can picture it. The others just state a feeling." },
      { type: "mc", prompt: "Which is the best CONCLUSION for an opinion essay about longer build time?",
        options: ["Build club is on Friday.", "In conclusion, a longer build time would help students learn, so our school should bring it back.", "Some people like race cars.", "I have three brothers."],
        a: 1, hint: "A conclusion wraps up the argument and repeats what you want.",
        exp: "A strong conclusion restates the [[claim]] and gives the reason one more time. The others are stray facts." },
    ],
  },
];

/* ============================================================
   STAGE 1 — what you're learning (icons + plain goals)
   STAGE 2 — how to actually do it (steps)
   ============================================================ */
const LESSONS = {
  placevalue: {
    goals: [["🔢", "Tell what each digit is really worth"], ["🧩", "Break a number into its pieces"], ["0️⃣", "Know why a zero still matters"]],
    steps: ["Start at the right and name each spot: ones, tens, hundreds, thousands, ten thousands.", "Point at your digit and say the spot name out loud.", "Multiply the digit by that spot's value. The 7 in the hundreds spot is 7 × 100 = 700.", "For expanded form, write each digit's VALUE and add them with plus signs: 4,000 + 700 + 6. Skip a spot if the digit is 0. (Showing the × is expanded notation — that's the next stop.)"],
  },
  expnotation: {
    goals: [["✖️", "Write a number as digit × place value"], ["🔀", "Tell expanded notation apart from expanded form"], ["0️⃣", "Skip a place when the digit is 0"]],
    steps: ["Name each spot from the right: ones, tens, hundreds, thousands, ten thousands.", "For each digit, write it TIMES its spot's value, like (7 × 100). Put each one in parentheses.", "Join them with plus signs. Leave out any spot where the digit is 0.", "Check: if the answer has no × signs, that's expanded form, not expanded notation."],
  },
  compare: {
    goals: [["⚖️", "Decide which number is bigger"], ["✍️", "Use the symbols the right way"], ["🎯", "Round to a friendly number"]],
    steps: ["Stack the numbers so the ends line up on the right.", "Start at the LEFT and compare one spot at a time.", "The first spot where they're different decides it. Stop right there — nothing after matters.", "To round, ask which friendly number it sits closer to on the number line."],
  },
  fractions: {
    goals: [["🍕", "Read what a fraction is telling you"], ["📏", "Find fractions on a number line"], ["🤝", "Spot fractions worth the same amount"]],
    steps: ["Look at the bottom number. That's how many equal pieces the whole was cut into.", "Look at the top number. That's how many pieces you're holding.", "To compare with the same top number, remember: bigger bottom means MORE cuts, so SMALLER pieces.", "To find an equivalent fraction, multiply top and bottom by the same number."],
  },
  addsub: {
    goals: [["➕", "Add and subtract within 1,000"], ["🕵️", "Find the hidden middle step"], ["✅", "Check if your answer makes sense"]],
    steps: ["Read the whole problem once without doing any math.", "Ask: can I answer this in one step, or is a number missing?", "If a number is missing, find THAT first. It's the hidden middle step.", "Do step two using your middle number. Then reread the question to be sure you answered what was asked."],
  },
  mult: {
    goals: [["✖️", "Understand what multiplying means"], ["🔲", "Read arrays and equal groups"], ["🔁", "Know 'times as many' language"]],
    steps: ["Turn the numbers into a sentence: 7 × 6 means seven groups of six.", "Draw it fast if you're stuck — rows of dots work.", "For 'times as many', the number doing the multiplying tells you how much BIGGER the second pile is.", "Check with repeated addition: 3 × 7 should equal 7 + 7 + 7."],
  },
  div: {
    goals: [["➗", "Share things out equally"], ["🔄", "Flip division into multiplication"], ["❓", "Find a missing factor"]],
    steps: ["Ask what's being shared and how many groups there are.", "Turn it around: 54 ÷ 6 is the same as 'six times what equals 54?'", "Use a fact you already know to get there.", "Check backwards. If 54 ÷ 6 = 9, then 6 × 9 should equal 54."],
  },
  tables: {
    goals: [["📋", "Find the rule hiding in a table"], ["🧪", "Test your rule on every row"], ["➡️", "Use the rule on a new number"]],
    steps: ["Look at the first pair. Guess a rule — adding or multiplying.", "Test that same rule on the SECOND row. Then the third.", "If it fails on any row, throw it out and try the other operation.", "Once a rule works on every row, use it to answer the question."],
  },
  shapes: {
    goals: [["🔷", "Sort shapes by their attributes"], ["👨‍👩‍👧", "Know which shapes belong to which family"], ["🧊", "Count faces on solid shapes"]],
    steps: ["Count the straight sides. Four sides means quadrilateral.", "Count corners and check if opposite sides are parallel.", "For solids, count the FLAT faces. A ball has none, a can has two, a cube has six.", "Watch for the word ALL. One shape that breaks the rule makes the whole statement false."],
  },
  area: {
    goals: [["🟦", "Find how much space is inside"], ["✖️", "Use rows times columns"], ["✂️", "Split odd shapes into rectangles"]],
    steps: ["Ask: am I covering the inside, or measuring around it? Inside means area.", "Multiply rows × how many in each row.", "For an L-shape, draw a line to cut it into two rectangles.", "Find each rectangle's area, add them, and label the answer in SQUARE units."],
  },
  perimeter: {
    goals: [["📏", "Measure all the way around"], ["🔢", "Add up every side"], ["🔙", "Work backwards to a missing side"]],
    steps: ["Picture walking the fence around the shape.", "Write down every side length, including the ones you have to figure out.", "Add them all. If every side is equal, multiply instead: 8 sides × 3 cm = 24 cm.", "If they give you the perimeter and want a missing side, add the sides you know and subtract from the total."],
  },
  measure: {
    goals: [["⏰", "Add and subtract time"], ["🥤", "Pick liquid or weight units"], ["📐", "Match the unit to the size"]],
    steps: ["For time, add whole hours first, then the minutes.", "Cross into the next hour carefully: 7:45 plus 15 minutes is 8:00, not 7:60.", "For units, first ask: is this liquid I could pour, or weight I could hold?", "Then ask: is the thing small or big? Milliliters for small liquid, liters for big. Ounces for small weight, pounds for big."],
  },
  graphs: {
    goals: [["📊", "Read a graph without getting tricked"], ["🔑", "Use the key and the scale"], ["🔍", "Check data against the picture"]],
    steps: ["Before anything else, find the scale or the key. Look at it twice.", "Figure out what one step or one picture is worth.", "Count in that amount, not by ones.", "To check a dot plot, cross off each number in the list as you count it."],
  },
  money: {
    goals: [["💵", "Count coins and bills"], ["💼", "Connect work to income"], ["🏦", "Tell saving apart from borrowing"]],
    steps: ["Sort coins biggest to smallest: quarters, dimes, nickels, pennies.", "Count on from the biggest pile instead of starting over.", "For word problems, ask which one it is: earning, spending, saving, or borrowing.", "Remember: you EARN interest when you save, and you PAY interest when you borrow."],
  },
  vocab: {
    goals: [["🔤", "Figure out a word you've never seen"], ["🧩", "Use word parts to unlock meaning"], ["👯", "Spot homophones and synonyms"]],
    steps: ["Read the whole sentence, then the sentence before and after it.", "Look for a clue: a definition, an example, or an opposite nearby.", "Check the word for parts. Chop off any prefix or suffix and look at what's left.", "Put your guess back into the sentence. Does it still make sense?"],
  },
  infer: {
    goals: [["🔍", "Make a smart guess from clues"], ["📌", "Point to the proof"], ["💡", "Find the lesson of a story"]],
    steps: ["Notice what the character DOES, not just what they say.", "Add what you already know about people to those clues. That's your inference.", "Pick your answer, then go back and find the exact sentence that proves it.", "If you can't point at a line, try another answer choice."],
  },
  infotext: {
    goals: [["📰", "Tell teaching apart from convincing"], ["🎯", "Find the central idea or claim"], ["⚖️", "Separate fact from opinion"]],
    steps: ["Ask: is this author teaching me facts, or trying to change my mind?", "For central idea, check that your answer covers the WHOLE passage, not one paragraph.", "For a claim, look at the first and last paragraphs. That's where authors put what they want.", "Fact or opinion: watch for should, best, worst, and I think. Those signal opinion."],
  },
  craft: {
    goals: [["🎭", "Find why the author wrote it"], ["🖼️", "Notice word choices that make pictures"], ["👁️", "Spot who's telling the story"]],
    steps: ["Ask what the author wanted you to do after reading: learn, believe, or enjoy.", "For figurative language, ask if it could really happen. If not, it's doing a picture job.", "Like or as means simile. Wild exaggeration means hyperbole. Sound word means onomatopoeia.", "For point of view, look at the pronouns. 'I' is first person, 'he' or 'she' is third."],
  },
  grammar: {
    goals: [["🔧", "Fix sentences that sound wrong"], ["🤝", "Match subjects and verbs"], ["❗", "Put punctuation where it works"]],
    steps: ["Read the sentence out loud in your head. Your ear catches a lot.", "Check the subject: one thing or more than one? Make the verb match.", "Check time words like yesterday or tomorrow, and make every verb match that time.", "Check if two complete sentences got joined. If so, a comma goes before and, but, or so."],
  },
  revise: {
    goals: [["✨", "Make good writing better"], ["🧹", "Cut what doesn't belong"], ["🏁", "Write a strong ending"]],
    steps: ["Editing fixes mistakes. Revising makes it clearer. Know which one is being asked.", "Find the main idea of the paragraph, then check every sentence against it.", "If a sentence wanders off topic, cut it — even if it's a nice sentence.", "For a conclusion, restate what you want and give your best reason one last time."],
  },
};

/* Questions 4 and 5 for each stop */
const EXTRA_QS = {
  placevalue: [
    { type: "mc", prompt: "Which number has a 5 worth 500?", options: ["5,062", "1,504", "9,035", "6,850"], a: 1,
      hint: "Find the 5 in each number and name the spot it sits in.", exp: "In 1,504 the 5 is in the hundreds spot, so it's worth 500. In 5,062 the 5 is worth 5,000, and in 6,850 it's worth 50." },
    { type: "entry", prompt: "Write the number for: 7 thousands, 2 hundreds, 0 tens, 5 ones.", a: 7205,
      hint: "Every spot needs a digit, even the empty one.", exp: "7,205. The zero holds the tens spot open. Leaving it out would give 725, which is ten times too small." },
  ],
  compare: [
    { type: "mc", prompt: "Round 4,682 to the nearest hundred.", options: ["4,600", "4,700", "5,000", "4,680"], a: 1,
      hint: "Which hundred is it between, and which is it closer to?", exp: "4,682 sits between 4,600 and 4,700. The 82 pushes it past halfway, so it rounds up to 4,700." },
    { type: "multi", prompt: "Which numbers are GREATER than 6,540? Select TWO.", options: ["6,405", "6,543", "6,504", "7,001", "6,450"], a: [1, 3], pick: 2,
      hint: "Compare from the left. Don't be fooled by digits in a different order.", exp: "6,543 beats 6,540 in the ones spot, and 7,001 wins at the thousands. The others just shuffle the same digits into smaller numbers." },
  ],
  fractions: [
    { type: "shade", prompt: "Shade the model to show 5/6.", parts: 6, a: 5,
      hint: "Six equal parts total. Color five of them.", exp: "The whole is cut into 6 pieces, so each is 1/6. Five shaded makes 5/6 — just one piece short of the whole." },
    { type: "mc", prompt: "Which fraction is [[equivalent]] to 1/2?", options: ["2/3", "3/6", "1/4", "2/8"], a: 1,
      hint: "Half means the top number is exactly half of the bottom.", exp: "3 is half of 6, so 3/6 is the same amount as 1/2. In 2/8, the 2 is only a quarter of 8." },
  ],
  addsub: [
    { type: "entry", prompt: "A store had 812 stickers and sold 347. How many are left?", a: 465,
      hint: "Sold means they're gone. Take them away.", exp: "812 − 347 = 465 stickers left." },
    { type: "mc", prompt: "Leo had 240 marbles. He gave away 85, then found 130 more. How many now?", options: ["455", "285", "155", "195"], a: 1,
      hint: "Two steps. Do them in the order the story tells them.", exp: "240 − 85 = 155. Then 155 + 130 = 285. Doing only one of the steps gives the trap answers." },
  ],
  mult: [
    { type: "entry", prompt: "There are 8 rows of chairs with 7 chairs in each row. How many chairs?", a: 56,
      hint: "Rows times chairs per row.", exp: "8 × 7 = 56 chairs. This is an [[array]] — the same fact works whether you count rows first or columns first." },
    { type: "place", prompt: "Match each expression to what it means.", tiles: ["4 × 6", "6 × 4", "4 + 6"],
      slots: [{ lab: "Four groups of six", a: "4 × 6" }, { lab: "Six groups of four", a: "6 × 4" }, { lab: "Four and six combined", a: "4 + 6" }],
      hint: "The first number tells you how many groups there are.", exp: "4 × 6 and 6 × 4 both equal 24, but they describe different pictures. Adding is a completely different action." },
  ],
  div: [
    { type: "entry", prompt: "48 pencils are shared equally among 8 students. How many does each get?", a: 6,
      hint: "Eight times what equals forty-eight?", exp: "48 ÷ 8 = 6 pencils each. Check it: 8 × 6 = 48. ✓" },
    { type: "inline", prompt: "Complete the sentence about 35 ÷ 5.", sentence: ["This is the same as asking 5 times ", 0, " equals ", 1, "."],
      blanks: [{ choices: ["5", "7", "35"], a: 1 }, { choices: ["7", "35", "40"], a: 1 }],
      hint: "Turn the division into a multiplication question.", exp: "35 ÷ 5 asks 'five times what makes 35?' The answer is 7, because 5 × 7 = 35." },
  ],
  tables: [
    { type: "entry", prompt: "The rule is 'times 6'. Input 9. What is the output?", a: 54,
      hint: "Apply the rule to 9.", exp: "9 × 6 = 54." },
    { type: "mc", prompt: "A table shows 1 → 7, 2 → 14, 3 → 21. What comes out when 5 goes in?", options: ["28", "35", "12", "26"], a: 1,
      hint: "Find the rule first, then use it on 5.", exp: "Each output is the input times 7. So 5 × 7 = 35. Adding 7 to the last row would only work if you filled in 4 first." },
  ],
  shapes: [
    { type: "multi", prompt: "Which shapes are always [[quadrilateral]]s? Select TWO.", options: ["Triangle", "Square", "Pentagon", "[[Trapezoid]]", "Circle"], a: [1, 3], pick: 2,
      hint: "Count the straight sides. You need exactly four.", exp: "Squares and trapezoids both have exactly 4 straight sides. Triangles have 3, pentagons have 5, and circles have none." },
    { type: "mc", prompt: "How many flat [[face]]s does a rectangular [[prism]] have?", options: ["4", "6", "8", "12"], a: 1,
      hint: "Think of a cereal box. Count every flat side.", exp: "Six: top, bottom, front, back, and two ends. The 8 is corners and the 12 is edges — the test offers those on purpose." },
  ],
  area: [
    { type: "entry", prompt: "A rug is 7 feet by 6 feet. What is its [[area]] in square feet?", a: 42,
      hint: "Multiply the two side lengths.", exp: "7 × 6 = 42 square feet." },
    { type: "mc", prompt: "A garden has an area of 24 square meters and is 4 meters wide. How long is it?", options: ["6 meters", "20 meters", "28 meters", "96 meters"], a: 0,
      hint: "Four times what equals twenty-four?", exp: "Area is length × width, so 24 ÷ 4 = 6 meters long. Working backwards from area is a Readiness skill." },
  ],
  perimeter: [
    { type: "entry", prompt: "A square has sides of 9 cm. What is its [[perimeter]] in cm?", a: 36,
      hint: "A square has four equal sides.", exp: "4 × 9 = 36 cm." },
    { type: "mc", prompt: "A rectangle is 8 m long and 3 m wide. Which is its perimeter?", options: ["11 m", "24 m", "22 m", "48 m"], a: 2,
      hint: "There are two long sides and two short ones.", exp: "8 + 3 + 8 + 3 = 22 m. The 24 is the AREA — the test always parks that answer nearby to catch people who grabbed the wrong idea." },
  ],
  measure: [
    { type: "mc", prompt: "A soccer game starts at 3:50 and lasts 40 minutes. When does it end?", options: ["3:90", "4:30", "4:10", "4:40"], a: 1,
      hint: "Get to the next hour first, then add what's left.", exp: "From 3:50, ten minutes gets you to 4:00. You still have 30 minutes left, so it ends at 4:30. There's no such time as 3:90." },
    { type: "mc", prompt: "Which unit best measures the [[capacity]] of a bathtub?", options: ["Milliliters", "Liters", "Pounds", "Ounces"], a: 1,
      hint: "Liquid or weight? Small or big?", exp: "A bathtub holds liquid, so it's capacity — that rules out pounds and ounces. And it's large, so liters, not milliliters." },
  ],
  graphs: [
    { type: "mc", prompt: "A [[bar graph]] counts by 2s. One bar reaches the seventh line above zero. What number is it?", options: ["7", "12", "14", "9"], a: 2,
      hint: "Count 2, 4, 6... up to the seventh line.", exp: "2, 4, 6, 8, 10, 12, 14. The seventh line is 14. Counting lines instead of using the scale gives 7." },
    { type: "entry", prompt: "A [[frequency table]] shows: dogs 12, cats 9, birds 4. How many more dogs than birds?", a: 8,
      hint: "How many MORE means find the difference.", exp: "12 − 4 = 8 more dogs. 'How many in all' would have meant adding instead." },
  ],
  money: [
    { type: "entry", prompt: "Count the total in cents: 3 quarters, 1 dime, 2 nickels.", a: 95,
      hint: "Quarter 25, dime 10, nickel 5. Start big.", exp: "75 + 10 + 10 = 95 cents." },
    { type: "mc", prompt: "Which is an example of using [[credit]]?", options: ["Putting $10 in a piggy bank", "Buying a bike now and paying the store back over six months", "Earning $20 for mowing a lawn", "Giving $5 to a food drive"], a: 1,
      hint: "Credit means you get it now but owe money later.", exp: "Paying back over six months is borrowing, which is credit. The others are saving, earning, and giving." },
  ],
  vocab: [
    { type: "mc", prompt: "\"The path was treacherous, so we moved slowly and held the railing tightly.\" Treacherous means —", options: ["Beautiful", "Dangerous", "Crowded", "Short"], a: 1,
      hint: "Why would they move slowly and hold on?", exp: "Moving slowly and gripping a railing are clues that the path was dangerous. The sentence explains the word without defining it." },
    { type: "mc", prompt: "Which pair are [[antonym]]s?", options: ["Happy and glad", "Enormous and huge", "Ancient and modern", "Shout and yell"], a: 2,
      hint: "Antonyms are opposites, not near-matches.", exp: "Ancient means very old and modern means new, so they're opposites. The other three pairs are all [[synonym]]s." },
  ],
  infer: [
    { type: "mc", prompt: "What can you infer about the grandpa at the end?", options: ["He is upset the track was ruined.", "He is pleased with how the children handled it.", "He did not notice what happened.", "He wanted the gold car himself."], a: 1,
      hint: "What does someone's smile usually mean?", exp: "He smiles into his coffee while watching. Smiling shows approval, so he's pleased — even though the text never says so directly." },
    { type: "mc", prompt: "What is the [[conflict]] in this story?", options: ["Rosa cannot reach the bin and Milo had already claimed the gold car.", "The grandpa runs out of coffee.", "The race track falls apart.", "Milo forgets to sort the pieces."], a: 0,
      hint: "The conflict is the problem the character has to face.", exp: "The problem is that two people both have a claim on one gold car. Everything else in the story flows from that." },
  ],
  infotext: [
    { type: "mc", prompt: "Which detail from 'Built for Speed' supports the idea that speed has a cost?", options: ["A falcon can reach two hundred miles per hour.", "A cheetah can only run flat out for about thirty seconds before overheating.", "The sailfish has a long pointed bill.", "A cheetah reaches full speed in three seconds."], a: 1,
      hint: "Which detail shows something speed TAKES from the animal?", exp: "Overheating after thirty seconds is the price the cheetah pays. The other details show how fast animals are, not what it costs them." },
    { type: "mc", prompt: "Who is the intended [[audience]] for 'Give Us Back Our Build Time'?", options: ["Toy companies", "The school's adults who decide the schedule", "Kindergarten students", "People shopping for shoes"], a: 1,
      hint: "Who has the power to change what the author is asking for?", exp: "The author asks for the schedule to be changed back, so it's written for whoever controls the schedule." },
  ],
  craft: [
    { type: "mc", prompt: "\"The wind whispered through the tall grass.\" Why did the author choose whispered?", options: ["To show the wind was loud", "To make the wind sound soft and alive", "To explain how wind works", "To make the reader laugh"], a: 1,
      hint: "What do you picture when something whispers?", exp: "Whispering makes the wind sound gentle and almost like a person. That's [[imagery]] doing its job." },
    { type: "mc", prompt: "An author writes a step-by-step article about how to build a birdhouse. The purpose is —", options: ["To entertain", "To persuade", "To inform", "To confuse"], a: 2,
      hint: "What does the reader get out of it?", exp: "Step-by-step instructions teach you something, which is informing. Nothing is trying to change your mind." },
  ],
  grammar: [
    { type: "mc", prompt: "Which sentence uses the [[possessive]] correctly?", options: ["The dogs bowl was empty.", "The dog's bowl was empty.", "The dogs' bowl was empty for one dog.", "The dogs bowl's was empty."], a: 1,
      hint: "One dog owns the bowl. Where does the apostrophe go?", exp: "One dog owning something takes apostrophe-then-s: dog's. The apostrophe goes after the s only when more than one owner shares it." },
    { type: "inline", prompt: "Choose the words that make the sentence correct.", sentence: ["The team ", 0, " practicing, and tomorrow they ", 1, " play their first game."],
      blanks: [{ choices: ["is", "are", "be"], a: 0 }, { choices: ["played", "will", "was"], a: 1 }],
      hint: "A team is one group. And what does 'tomorrow' tell you?", exp: "'Team' is one thing, so it takes 'is'. 'Tomorrow' means future [[tense]], so 'will play'." },
  ],
  revise: [
    { type: "mc", prompt: "Which sentence is the best opening for a paragraph about caring for a puppy?", options: ["Puppies are small.", "Taking care of a puppy takes patience, time, and a good routine.", "I have a puppy.", "Dogs bark sometimes."], a: 1,
      hint: "A good opening tells the reader what the whole paragraph is about.", exp: "It names the topic and previews the three things the paragraph will cover. The others are single facts that don't set anything up." },
    { type: "mc", prompt: "Which change makes this sentence stronger? \"The food was good.\"", options: ["The food was very good.", "The food was really good.", "The warm bread cracked open and steamed on the plate.", "The food was not bad."], a: 2,
      hint: "Which one lets you see, smell, or taste it?", exp: "Adding 'very' or 'really' doesn't add information. Showing a specific detail does — that's revising, not just editing." },
  ],
};

/* merge the extras onto each concept */
CONCEPTS.forEach((c) => { if (EXTRA_QS[c.id]) c.qs = c.qs.concat(EXTRA_QS[c.id]); });

/* ============================================================
   SIGHT WORDS — Dolch grades 1–3, plus a grade 4 high-frequency set.
   Each entry is [word, sentence with ___ where the word goes].
   The sentence never contains the word itself.
   ============================================================ */
const SIGHT_WORDS = {
  1: [
    ["after", "We eat dessert ___ dinner."], ["again", "Can you say that ___, please?"],
    ["an", "She ate ___ apple at lunch."], ["any", "Do you have ___ red cars left?"],
    ["as", "The cheetah is ___ fast lightning."], ["ask", "You can ___ me for help."],
    ["by", "The bag is right ___ the door."], ["could", "I ___ hear the music from here."],
    ["every", "She reads ___ single night."], ["fly", "Watch the falcon ___ over the hill."],
    ["from", "This letter came ___ my grandma."], ["give", "Please ___ the ball to Rosa."],
    ["going", "We are ___ to the park today."], ["had", "He ___ two cookies at lunch."],
    ["has", "She ___ a new blue bike."], ["her", "I gave ___ the last gold car."],
    ["him", "Milo asked ___ to wait outside."], ["his", "That red helmet is ___."],
    ["how", "Show me ___ you built the tower."], ["just", "I ___ finished my homework."],
    ["know", "Do you ___ the answer yet?"], ["let", "Please ___ the dog come inside."],
    ["live", "We ___ near the school."], ["may", "You ___ pick one more car."],
    ["of", "I drank a glass ___ milk."], ["old", "That is a very ___ tree."],
    ["once", "We went there ___ last summer."], ["open", "Please ___ the window a little."],
    ["over", "The ball flew ___ the fence."], ["put", "___ your shoes by the door."],
    ["round", "The wheel is ___ and smooth."], ["some", "I saved ___ pieces for you."],
    ["stop", "The car will ___ at the light."], ["take", "___ your jacket with you."],
    ["thank", "I want to ___ you for helping."], ["them", "Give the car keys to ___."],
    ["then", "First we build, ___ we clean up."], ["think", "I ___ this answer is right."],
    ["walk", "We ___ to school every morning."], ["were", "They ___ playing in the yard."],
    ["when", "Tell me ___ you are ready."],
  ],
  2: [
    ["always", "She ___ shares her snacks."], ["around", "We walked ___ the whole block."],
    ["because", "I smiled ___ the joke was funny."], ["been", "I have ___ waiting all morning."],
    ["before", "Wash your hands ___ dinner."], ["best", "This is my ___ tower yet."],
    ["both", "___ of my shoes are muddy."], ["buy", "We will ___ milk at the store."],
    ["call", "Please ___ me when you get home."], ["cold", "The water feels very ___ today."],
    ["does", "___ your brother like to build?"], ["don't", "I ___ know where it went."],
    ["fast", "That race car is really ___."], ["first", "She was the ___ one in line."],
    ["five", "I have ___ laps left."], ["found", "He ___ his lost helmet."],
    ["gave", "She ___ me half her sandwich."], ["goes", "This piece ___ on the top."],
    ["green", "The grass is bright ___."], ["its", "The dog wagged ___ tail."],
    ["made", "We ___ a race track in the yard."], ["many", "How ___ pieces do you need?"],
    ["off", "Please turn ___ the lights."], ["or", "Do you want milk ___ juice?"],
    ["pull", "___ the door open slowly."], ["read", "I like to ___ before bed."],
    ["right", "You got that answer ___."], ["sing", "We ___ that song every Friday."],
    ["sit", "Please ___ next to me."], ["sleep", "I ___ better with the fan on."],
    ["tell", "Can you ___ me a story?"], ["their", "The kids finished ___ project."],
    ["these", "___ cars are the fast ones."], ["those", "Hand me ___ pieces over there."],
    ["upon", "Once ___ a time, there was a hero."], ["us", "Come with ___ to the park."],
    ["use", "You can ___ my markers."], ["very", "That was a ___ good idea."],
    ["wash", "Please ___ your hands now."], ["which", "___ one do you want?"],
    ["why", "Tell me ___ you chose that."], ["wish", "I ___ we had more time."],
    ["work", "This machine does not ___."], ["would", "___ you like some help?"],
    ["write", "Please ___ your name here."], ["your", "Is this ___ backpack?"],
  ],
  3: [
    ["about", "This book is ___ fast animals."], ["better", "My spelling is getting ___."],
    ["bring", "Please ___ your notebook tomorrow."], ["carry", "Can you ___ this box for me?"],
    ["clean", "We ___ up after we build."], ["cut", "She will ___ the paper in half."],
    ["done", "I am ___ with my homework."], ["draw", "I like to ___ race cars."],
    ["drink", "Please ___ some water."], ["eight", "There are ___ pieces left."],
    ["fall", "Be careful, do not ___."], ["far", "The store is not very ___."],
    ["full", "My cup is almost ___."], ["got", "She ___ every answer right."],
    ["grow", "These plants ___ very fast."], ["hold", "Can you ___ this for a second?"],
    ["hot", "The soup is too ___ to eat."], ["hurt", "I ___ my knee on the sidewalk."],
    ["if", "Tell me ___ you need help."], ["keep", "You can ___ that trophy."],
    ["kind", "She is ___ to everyone."], ["laugh", "That joke made me ___."],
    ["light", "Please turn on the ___."], ["long", "That was a very ___ movie."],
    ["much", "How ___ does this cost?"], ["myself", "I built this all by ___."],
    ["never", "I have ___ seen that before."], ["only", "There is ___ one piece left."],
    ["own", "This is my ___ tower."], ["pick", "___ any color you like."],
    ["seven", "I counted ___ wheels."], ["shall", "___ we start building now?"],
    ["show", "Please ___ me your work."], ["six", "The box holds ___ pieces."],
    ["small", "That is a very ___ car."], ["start", "Let us ___ over again."],
    ["ten", "I can count to ___."], ["today", "We have build club ___."],
    ["together", "We finished the tower ___."], ["try", "Please ___ one more time."],
    ["warm", "The sun feels ___ today."],
  ],
  4: [
    ["father", "My ___ drives me to school."], ["friend", "My best ___ lives next door."],
    ["door", "Please close the ___ behind you."], ["talk", "We can ___ about it later."],
    ["several", "I have ___ books to return."], ["send", "I will ___ you a picture."],
    ["wrote", "She ___ her name on the paper."], ["later", "We can finish this ___."],
    ["near", "The park is ___ my house."], ["remember", "I ___ that story from last year."],
    ["news", "We watched the ___ after dinner."], ["green", "Her jacket is dark ___."],
    ["anyone", "Does ___ know the answer?"], ["love", "I ___ racing my car."],
    ["dog", "Our ___ barks at the mail truck."], ["move", "Please ___ your bag off the seat."],
    ["mind", "I changed my ___ about it."], ["table", "Put the plates on the ___."],
    ["across", "We walked ___ the bridge."], ["case", "In that ___, let us try again."],
    ["don't", "They ___ live here anymore."], ["form", "Fill out this ___ with a pencil."],
    ["already", "I ___ finished my chores."], ["whole", "He ate the ___ sandwich."],
    ["paper", "Write it on a sheet of ___."], ["believe", "I ___ you can do this."],
    ["power", "The storm knocked out the ___."], ["class", "Our ___ went on a field trip."],
    ["boy", "The ___ next door has a scooter."], ["idea", "That is a great ___."],
    ["north", "We drove ___ for two hours."], ["inside", "Let us play ___ today."],
    ["hot", "The pavement is ___ in summer."], ["everyone", "___ finished the test on time."],
    ["close", "Stand ___ so you can see."], ["either", "You can pick ___ color."],
    ["turn", "It is my ___ to build."], ["area", "This ___ of the room is messy."],
    ["picture", "She drew a ___ of her dog."], ["store", "We walked to the ___ for bread."],
    ["less", "I have ___ homework tonight."], ["blue", "The sky is bright ___."],
    ["hear", "I can ___ the music from here."], ["knew", "I ___ the answer right away."],
    ["fast", "He runs very ___."], ["probably", "It will ___ rain tomorrow."],
    ["become", "Tadpoles ___ frogs."], ["example", "Give me an ___ of a polygon."],
    ["women", "Three ___ started the company."], ["least", "That is the ___ we can do."],
    ["fire", "The ___ kept the campers warm."], ["earth", "The ___ goes around the sun."],
    ["below", "The temperature dropped ___ freezing."], ["fact", "That is a ___, not an opinion."],
    ["American", "She is an ___ swimmer."], ["voice", "I heard a soft ___ behind me."],
    ["began", "The movie ___ at seven."], ["road", "The ___ curves near the bridge."],
    ["music", "We listened to ___ in the car."], ["question", "I have one more ___."],
    ["week", "We build club once a ___."], ["early", "I woke up ___ this morning."],
    ["south", "Birds fly ___ for the winter."], ["behind", "My shoe is ___ the couch."],
    ["center", "Put the vase in the ___ of the table."], ["usually", "I ___ walk to school."],
    ["given", "I was ___ a second chance."], ["space", "There is no ___ left in the box."],
    ["pay", "I will ___ for the tickets."], ["morning", "We leave early in the ___."],
    ["matter", "It does not ___ who goes first."], ["window", "Rain tapped on the ___."],
    ["five", "I need ___ more pieces."], ["size", "What ___ shoe do you wear?"],
    ["short", "That was a very ___ movie."], ["low", "The branch hangs too ___."],
    ["cut", "Be careful not to ___ yourself."], ["past", "We drove ___ the school."],
    ["bill", "Dad paid the electric ___."], ["general", "In ___, cheetahs sprint briefly."],
    ["girl", "The ___ on my team pitches fast."], ["government", "The ___ built the new road."],
    ["answer", "I know the ___ to that one."], ["easy", "That question was ___."],
    ["quite", "It is ___ cold outside today."], ["woman", "The ___ next door has a garden."],
    ["half", "I ate ___ of my apple."], ["fun", "Build club is so much ___."],
    ["dark", "It gets ___ early in winter."], ["upon", "The book sat ___ the shelf."],
    ["outside", "Let us eat lunch ___."], ["fine", "My scraped knee feels ___ now."],
    ["feet", "My ___ hurt after the hike."], ["lost", "I ___ my library book."],
    ["himself", "He built the tower by ___."], ["ground", "The ball rolled along the ___."],
    ["office", "The nurse works in the front ___."], ["stay", "Please ___ close to me."],
    ["within", "Finish ___ ten minutes."], ["field", "We played soccer in the ___."],
  ],
};

const conceptsIn = (rid) => CONCEPTS.filter((c) => c.region === rid);
const byId = (id) => CONCEPTS.find((c) => c.id === id);

/* ============================================================
   STORAGE
   ============================================================ */
/* The live site has always saved under "brickdash-progress-v1" in localStorage.
   KEEP THIS KEY THE SAME in every future version, or saved progress will look lost.
   Older keys are only read (never written) so any earlier progress is picked up. */
const KEY = "brickdash-progress-v1";
const OLD_KEYS = ["texas-trail-progress-v1"];
const blank = {
  mastered: {}, seen: {}, best: {}, words: {}, speedMath: {},
  areas: {},        // per activity: { right, wrong }
  stop: {},         // per concept stop: { right, wrong, runs }
  wordStats: {},    // per sight word: { right, wrong }
  correct: 0, attempts: 0, bestTimed: 0,
};

/* Every activity funnels its right/wrong through here so the totals stay honest. */
function record(p, area, right, wrong) {
  const n = { ...p };
  const prev = (n.areas && n.areas[area]) || { right: 0, wrong: 0 };
  n.areas = { ...(n.areas || {}), [area]: { right: prev.right + right, wrong: prev.wrong + wrong } };
  n.correct = (n.correct || 0) + right;
  n.attempts = (n.attempts || 0) + right + wrong;
  n.sessions = (n.sessions || 0) + 1; // any completed task, anywhere — used to unlock car parts
  return n;
}

async function loadProgress() {
  /* ask the browser not to clear our saved data when space runs low */
  try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch { /* ignore */ }
  /* optional cloud copy (Microsoft Graph adapter), if one is set up */
  try {
    if (window.BrickDashStore) {
      const r = await window.BrickDashStore.load();
      if (r) return { ...blank, ...r };
    }
  } catch (e) { console.warn("remote load failed, using local copy", e); }
  try {
    let raw = window.localStorage.getItem(KEY);
    if (!raw) for (const k of OLD_KEYS) { raw = window.localStorage.getItem(k); if (raw) break; }
    if (!raw && window.storage) {       /* Claude artifact preview storage */
      for (const k of [KEY, ...OLD_KEYS]) {
        try { const r = await window.storage.get(k); if (r && r.value) { raw = r.value; break; } } catch { /* not found */ }
      }
    }
    return raw ? { ...blank, ...JSON.parse(raw) } : { ...blank };
  } catch {
    return { ...blank };
  }
}
async function saveProgress(p) {
  const json = JSON.stringify(p);
  try { window.localStorage.setItem(KEY, json); } catch (e) { console.warn("local save failed", e); }
  try { if (window.storage) await window.storage.set(KEY, json); } catch { /* preview only */ }
  try { if (window.BrickDashStore) await window.BrickDashStore.save(p); } catch (e) { console.warn("remote save failed; local copy kept", e); }
}

/* ============================================================
   QUESTION RENDERERS
   ============================================================ */

function MC({ q, value, onChange, locked, onWord }) {
  const multi = q.type === "multi";
  const sel = value || [];
  const toggle = (i) => {
    if (locked) return;
    if (!multi) return onChange([i]);
    if (sel.includes(i)) onChange(sel.filter((x) => x !== i));
    else if (sel.length < (q.pick || 2)) onChange([...sel, i]);
  };
  const state = (i) => {
    if (!locked) return sel.includes(i) ? "sel" : "";
    const isAns = multi ? q.a.includes(i) : q.a === i;
    if (isAns) return "right";
    if (sel.includes(i)) return "wrong";
    return "";
  };
  return (
    <div className="opts">
      {q.options.map((o, i) => (
        <button key={i} className={`opt ${state(i)}`} onClick={() => toggle(i)}>
          <span className="k">{"ABCDE"[i]}</span>
          <span><RichText text={o} onWord={onWord} /></span>
        </button>
      ))}
    </div>
  );
}

function PlaceQ({ q, value, onChange, locked }) {
  const [armed, setArmed] = useState(null);
  const filled = value || {};
  const tapTile = (t) => { if (!locked) setArmed(armed === t ? null : t); };
  const tapSlot = (i) => {
    if (locked) return;
    const next = { ...filled };
    if (armed === null) {                 // no card held: tapping clears the box
      delete next[i];
      onChange(next);
      return;
    }
    next[i] = armed;                      // cards may be used more than once
    onChange(next);
    setArmed(null);
  };
  const reusable = q.slots.length > new Set(q.slots.map((s) => s.a)).size;
  return (
    <div className="stack">
      <div className="small">
        Tap a card, then tap where it goes. Tap a filled box to empty it.
        {reusable ? " The same card can be used more than once." : ""}
      </div>
      <div className="tiles">
        {q.tiles.map((t) => (
          <button key={t} className={`tile ${armed === t ? "armed" : ""}`} onClick={() => tapTile(t)}>{t}</button>
        ))}
      </div>
      <div className="slots">
        {q.slots.map((s, i) => {
          const mine = filled[i];
          const ok = mine === s.a;
          let cls = mine !== undefined ? "filled" : "";
          if (locked) cls = ok ? "right" : "wrong";
          return (
            <div className="slot" key={i}>
              <span className="lab">{s.lab}</span>
              {locked && !ok && <span className="fixup">should be <b>{s.a}</b></span>}
              <button className={`drop ${cls}`} onClick={() => tapSlot(i)}>{mine ?? "—"}</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InlineQ({ q, value, onChange, locked }) {
  const v = value || {};
  return (
    <p className="sentence">
      {q.sentence.map((seg, i) =>
        typeof seg === "string" ? (
          <span key={i}>{seg}</span>
        ) : (
          <span className="inlinepick" key={i}>
            <select
              value={v[seg] ?? ""}
              disabled={locked}
              onChange={(e) => onChange({ ...v, [seg]: Number(e.target.value) })}
              style={locked ? {
                borderColor: v[seg] === q.blanks[seg].a ? "#2C5E4F" : "#B4503F",
                background: v[seg] === q.blanks[seg].a ? "#DFEDE7" : "#F7E3DF",
              } : undefined}
            >
              <option value="">choose</option>
              {q.blanks[seg].choices.map((c, j) => <option key={j} value={j}>{c}</option>)}
            </select>
          </span>
        )
      )}
    </p>
  );
}

function EntryQ({ value, onChange, locked }) {
  const v = value ?? "";
  const press = (k) => {
    if (locked) return;
    if (k === "del") onChange(String(v).slice(0, -1));
    else if (k === "clr") onChange("");
    else if (String(v).length < 6) onChange(String(v) + k);
  };
  return (
    <div className="entry">
      <div className="readout">{v === "" ? "?" : v}</div>
      <div className="pad">
        {["1","2","3","4","5","6","7","8","9","clr","0","del"].map((k) => (
          <button key={k} onClick={() => press(k)}>{k === "del" ? "⌫" : k === "clr" ? "C" : k}</button>
        ))}
      </div>
    </div>
  );
}

function ShadeQ({ q, value, onChange, locked }) {
  const on = value || [];
  const tap = (i) => {
    if (locked) return;
    onChange(on.includes(i) ? on.filter((x) => x !== i) : [...on, i]);
  };
  return (
    <div className="stack">
      <div className="shaderow">
        {Array.from({ length: q.parts }).map((_, i) => (
          <div key={i} className={on.includes(i) ? "on" : ""} onClick={() => tap(i)} />
        ))}
      </div>
      <div className="small">Tap parts to shade them. {on.length} of {q.parts} shaded.</div>
    </div>
  );
}

/* answer checking */
function isCorrect(q, v) {
  if (v === undefined || v === null) return false;
  switch (q.type) {
    case "mc": return Array.isArray(v) && v.length === 1 && v[0] === q.a;
    case "multi": {
      if (!Array.isArray(v) || v.length !== q.a.length) return false;
      return q.a.every((x) => v.includes(x));
    }
    case "place": return q.slots.every((s, i) => v[i] === s.a);
    case "inline": return q.blanks.every((b, i) => v[i] === b.a);
    case "entry": return v !== "" && Number(v) === q.a;
    case "shade": return Array.isArray(v) && v.length === q.a;
    default: return false;
  }
}
function isAnswered(q, v) {
  if (v === undefined || v === null) return false;
  switch (q.type) {
    case "mc": return Array.isArray(v) && v.length === 1;
    case "multi": return Array.isArray(v) && v.length === (q.pick || 2);
    case "place": return Object.keys(v).length === q.slots.length;
    case "inline": return q.blanks.every((_, i) => v[i] !== undefined);
    case "entry": return v !== "" && v !== undefined;
    case "shade": return Array.isArray(v) && v.length > 0;
    default: return false;
  }
}

/* ============================================================
   APP
   ============================================================ */
export default function LearnAndRace() {
  const [view, setView] = useState({ name: "map" });
  const [progress, setProgress] = useState(blank);
  const [word, setWord] = useState(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { loadProgress().then((p) => { setProgress(p); setLoaded(true); }); }, []);
  const push = useCallback((p) => { setProgress(p); saveProgress(p); }, []);

  const totalConcepts = CONCEPTS.length;
  const mastered = Object.keys(progress.mastered || {}).length;

  const onWord = (w) => {
    const k = Object.keys(GLOSSARY).find((g) => g === w || w.startsWith(g) || g.startsWith(w));
    setWord(k ? { w: k, d: GLOSSARY[k] } : { w, d: "I don't have that one yet — try asking a grown-up what it means in this sentence." });
  };

  return (
    <div className="tt">
      <style>{CSS}</style>
      <div className="topbar">
        {view.name !== "map" ? (
          <button className="home" onClick={() => setView({ name: "map" })}>← Home</button>
        ) : (
          <span className="home">Learn &amp; Race!</span>
        )}
        <span className="spacer" />
        <button className="pill tap ok" onClick={() => setView({ name: "collection" })}>
          ✅ {progress.correct || 0}
        </button>
        <button className="pill tap no" onClick={() => setView({ name: "collection" })}>
          ✗ {Math.max(0, (progress.attempts || 0) - (progress.correct || 0))}
        </button>
        <button className="pill gold tap" onClick={() => setView({ name: "collection" })}>
          🏆 {mastered}/{totalConcepts}
        </button>
        {view.name === "timed" && <TimerPill />}
      </div>

      <div className={`shell ${["map", "region", "garage"].includes(view.name) ? "wide" : ""}`}>
        {loaded && (
          <Bolt line={boltLine(view, progress)} hidden={progress.boltOff}
            onToggle={() => push({ ...progress, boltOff: !progress.boltOff })} />
        )}
        {!loaded && <p className="lede" style={{ padding: 40 }}>Loading your zones…</p>}
        {loaded && view.name === "map" && <TrailMap progress={progress} go={setView} />}
        {loaded && view.name === "collection" && <Collection progress={progress} push={push} go={setView} />}
        {loaded && view.name === "garage" && <Garage progress={progress} push={push} go={setView} />}
        {loaded && view.name === "mathdrill" && <SpeedMath progress={progress} push={push} go={setView} />}
        {loaded && view.name === "typing" && <TypingGame progress={progress} push={push} go={setView} />}
        {loaded && view.name === "spell" && <WordForge key={String(view.level) + view.k} level={view.level} progress={progress} push={push} go={setView} />}
        {loaded && view.name === "region" && <RegionView rid={view.rid} progress={progress} go={setView} />}
        {loaded && view.name === "concept" && (
          <ConceptView cid={view.cid} progress={progress} push={push} go={setView} onWord={onWord} />
        )}
        {loaded && view.name === "timed" && <TimedTrek key={view.secs} startSecs={view.secs} progress={progress} push={push} go={setView} onWord={onWord} />}
      </div>

      {word && (
        <div className="sheet" onClick={() => setWord(null)}>
          <div className="sheetin" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 8px", fontSize: 26 }}>{word.w}</h2>
            <p className="lede" style={{ margin: "0 0 18px" }}>{word.d}</p>
            <button className="btn gold" onClick={() => setWord(null)}>Got it</button>
          </div>
        </div>
      )}
      {loaded && view.name === "drive3d" && (
        <Drive3DScene
          car={progress.car || {}}
          progress={progress}
          push={push}
          timeLimitSec={view.seconds}
          onExit={() => setView(view.returnTo || { name: "garage" })}
        />
      )}
    </div>
  );
}

/* live timer readout for timed mode, driven by a global */
let TIMER_LEFT = 0;
function TimerPill() {
  const [, tick] = useState(0);
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 500); return () => clearInterval(t); }, []);
  const m = Math.floor(Math.max(0, TIMER_LEFT) / 60);
  const s = Math.max(0, TIMER_LEFT) % 60;
  return <span className={`pill timer ${TIMER_LEFT < 60 ? "low" : ""}`}>⏱ {m}:{String(s).padStart(2, "0")}</span>;
}

/* ---------------- home: Learn & Race ---------------- */
/* ---------------- drawn artwork (inline SVG, comic style: thick outlines + two-tone shading) ---------------- */
const INK = "#0F1F3D";

/* App logo. Real text (not a picture) so it stays sharp and readable by screen readers. */
function AppLogo() {
  return (
    <svg className="lr-logo-svg" viewBox="0 0 540 260" role="img" aria-label="Learn and Race! Learn. Build your car. Race!">
      <defs>
        <pattern id="lrChk" width="18" height="18" patternUnits="userSpaceOnUse">
          <rect width="18" height="18" fill="#fff" /><rect width="9" height="9" fill={INK} /><rect x="9" y="9" width="9" height="9" fill={INK} />
        </pattern>
        <linearGradient id="lrYel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FFF07A" /><stop offset=".55" stopColor="#FFD21F" /><stop offset="1" stopColor="#FF9F0A" /></linearGradient>
        <linearGradient id="lrRed" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#FF7A4D" /><stop offset=".5" stopColor="#F2371F" /><stop offset="1" stopColor="#B51A12" /></linearGradient>
      </defs>
      <path d="M8 214 C 140 176 330 178 532 116 L 528 150 C 344 208 160 214 18 240 Z" fill="#1B62E8" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <path d="M40 222 C 170 196 330 196 500 150" fill="none" stroke="#7FB6FF" strokeWidth="5" strokeLinecap="round" />
      <g transform="rotate(-16 70 70)">
        <line x1="22" y1="30" x2="22" y2="140" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        <path d="M24 32 Q 62 20 108 36 L 108 92 Q 62 78 24 90 Z" fill="url(#lrChk)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      </g>
      <g transform="rotate(14 470 60)">
        <line x1="520" y1="18" x2="520" y2="128" stroke={INK} strokeWidth="8" strokeLinecap="round" />
        <path d="M518 20 Q 480 8 432 24 L 432 80 Q 480 66 518 78 Z" fill="url(#lrChk)" stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      </g>
      <g transform="rotate(-6 270 110)" fontFamily="'Trebuchet MS','Segoe UI','Nunito',system-ui,sans-serif" fontWeight="800"
        textAnchor="middle" stroke={INK} strokeLinejoin="round" style={{ paintOrder: "stroke" }}>
        <text x="262" y="104" fontSize="86" fill="url(#lrYel)" strokeWidth="16" textLength="380" lengthAdjust="spacingAndGlyphs">LEARN &amp;</text>
        <text x="276" y="190" fontSize="100" fill="url(#lrRed)" strokeWidth="16" textLength="330" lengthAdjust="spacingAndGlyphs">RACE!</text>
      </g>
      <g transform="rotate(-6 280 232)">
        <path d="M112 212 L 452 206 L 440 250 L 100 256 Z" fill={INK} />
        <text x="276" y="240" fontFamily="'Trebuchet MS','Segoe UI','Nunito',system-ui,sans-serif" fontWeight="800" fontSize="24"
          fill="#fff" textAnchor="middle" textLength="310" lengthAdjust="spacingAndGlyphs">Learn. Build your car. Race!</text>
      </g>
    </svg>
  );
}

/* the three "how to race" step icons */
function StepIcon({ kind }) {
  const common = { viewBox: "0 0 64 64", "aria-hidden": true, className: "lr-stepsvg" };
  if (kind === "pick") return (
    <svg {...common}>
      <path d="M14 22 Q 32 16 50 22 Q 60 26 60 40 Q 60 52 50 50 Q 44 48 40 42 L 24 42 Q 20 48 14 50 Q 4 52 4 40 Q 4 26 14 22 Z" fill="#2F6BFF" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M12 28 Q 30 22 52 28" stroke="#8FB4FF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="14" y="30" width="12" height="4" rx="1.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
      <rect x="18" y="26" width="4" height="12" rx="1.5" fill="#fff" stroke={INK} strokeWidth="1.5" />
      <circle cx="44" cy="29" r="3.2" fill="#FFD21F" stroke={INK} strokeWidth="1.5" />
      <circle cx="50" cy="35" r="3.2" fill="#F2371F" stroke={INK} strokeWidth="1.5" />
    </svg>
  );
  if (kind === "finish") return (
    <svg {...common}>
      <path d="M32 5 L 40 23 L 60 25 L 45 38 L 50 58 L 32 47 L 14 58 L 19 38 L 4 25 L 24 23 Z" fill="#FFD21F" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M32 12 L 37 25 L 50 27 L 40 35" fill="none" stroke="#FFF3A6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M32 47 L 14 58 L 19 38" fill="#F2A500" opacity=".7" />
    </svg>
  );
  return (
    <svg {...common}>
      <defs>
        <pattern id="lrChkS" width="12" height="12" patternUnits="userSpaceOnUse">
          <rect width="12" height="12" fill="#fff" /><rect width="6" height="6" fill={INK} /><rect x="6" y="6" width="6" height="6" fill={INK} />
        </pattern>
      </defs>
      <line x1="12" y1="6" x2="12" y2="60" stroke={INK} strokeWidth="5" strokeLinecap="round" />
      <path d="M14 8 Q 32 2 56 10 L 56 38 Q 34 30 14 38 Z" fill="url(#lrChkS)" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
    </svg>
  );
}

/* car-part icons: painted art for wheels + turbo, drawn SVG for the rest (same outline style) */
function PartIcon({ id, name }) {
  if (id === "wheels") return <img src={ART.part_wheel} alt="" />;
  if (id === "turbo") return <img src={ART.part_turbo} alt="" />;
  const s = { viewBox: "0 0 64 64", "aria-hidden": true };
  switch (id) {
    case "paint": return (
      <svg {...s}>
        <rect x="18" y="20" width="24" height="38" rx="5" fill="#E8392B" stroke={INK} strokeWidth="3.5" />
        <rect x="18" y="30" width="24" height="12" fill="#1B62E8" stroke={INK} strokeWidth="2.5" />
        <path d="M22 22 L 22 54" stroke="#FF8C7A" strokeWidth="3" strokeLinecap="round" />
        <rect x="23" y="10" width="14" height="10" rx="2" fill="#C9D3E3" stroke={INK} strokeWidth="3" />
        <rect x="27" y="4" width="6" height="7" rx="1.5" fill={INK} />
        <path d="M40 8 l 8 -3 M41 12 l 10 0 M40 16 l 8 3" stroke="#1B62E8" strokeWidth="3" strokeLinecap="round" />
      </svg>
    );
    case "lights": return (
      <svg {...s}>
        <path d="M6 24 L 40 18 L 46 30 L 40 42 L 8 40 Z" fill="#DDE6F2" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M12 27 L 36 23 L 40 30 L 36 37 L 13 35 Z" fill="#FFF6C8" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M14 32 L 34 29" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path d="M50 22 l 10 -4 M52 30 l 10 0 M50 38 l 10 4" stroke="#FFC400" strokeWidth="4" strokeLinecap="round" />
      </svg>
    );
    case "top": return (
      <svg {...s}>
        <path d="M4 22 L 60 16 L 58 26 L 6 32 Z" fill="#2B3446" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M8 24 L 56 19" stroke="#6D7A93" strokeWidth="3" strokeLinecap="round" />
        <path d="M18 31 L 16 50 L 24 50 L 26 30 Z M42 28 L 40 48 L 48 48 L 50 27 Z" fill="#E8392B" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
        <rect x="8" y="50" width="48" height="6" rx="2" fill="#8C97AB" stroke={INK} strokeWidth="3" />
      </svg>
    );
    case "dash": return (
      <svg {...s}>
        <path d="M6 44 A 26 26 0 0 1 58 44 Z" fill="#1E2738" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M12 42 A 20 20 0 0 1 52 42" fill="none" stroke="#3DDC84" strokeWidth="4" strokeDasharray="5 4" />
        <path d="M44 28 A 20 20 0 0 1 52 42" fill="none" stroke="#FF4B3A" strokeWidth="4" />
        <line x1="32" y1="44" x2="46" y2="26" stroke="#FFD21F" strokeWidth="4" strokeLinecap="round" />
        <circle cx="32" cy="44" r="4.5" fill="#fff" stroke={INK} strokeWidth="2.5" />
        <rect x="6" y="46" width="52" height="10" rx="3" fill="#8C97AB" stroke={INK} strokeWidth="3" />
      </svg>
    );
    case "plate": return (
      <svg {...s} viewBox="0 0 96 48">
        <rect x="3" y="5" width="90" height="38" rx="7" fill="#F4F6FA" stroke={INK} strokeWidth="3.5" />
        <rect x="9" y="11" width="78" height="26" rx="4" fill="none" stroke="#1B62E8" strokeWidth="2.5" />
        <circle cx="11" cy="24" r="2.2" fill={INK} /><circle cx="85" cy="24" r="2.2" fill={INK} />
        <text x="48" y="31" textAnchor="middle" fontFamily="'Trebuchet MS','Segoe UI','Nunito',system-ui,sans-serif" fontWeight="800"
          fontSize="17" fill={INK} textLength={Math.min(62, 9 * String(name || "RACER").length)} lengthAdjust="spacingAndGlyphs">
          {String(name || "RACER").toUpperCase().slice(0, 8)}
        </text>
      </svg>
    );
    case "horn": return (
      <svg {...s}>
        <path d="M10 26 L 26 26 L 50 10 L 50 54 L 26 38 L 10 38 Z" fill="#F2371F" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <ellipse cx="50" cy="32" rx="6" ry="22" fill="#B51A12" stroke={INK} strokeWidth="3.5" />
        <path d="M28 29 L 46 17" stroke="#FF8C7A" strokeWidth="3" strokeLinecap="round" />
        <rect x="16" y="38" width="8" height="16" rx="2" fill="#C9D3E3" stroke={INK} strokeWidth="3" />
        <path d="M58 16 l 4 -4 M60 32 l 4 0 M58 48 l 4 4" stroke="#FFC400" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
    );
    case "flag": return (
      <svg {...s}>
        <defs>
          <pattern id="lrChkP" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="#fff" /><rect width="6" height="6" fill={INK} /><rect x="6" y="6" width="6" height="6" fill={INK} />
          </pattern>
        </defs>
        <line x1="12" y1="6" x2="12" y2="60" stroke="#8C97AB" strokeWidth="6" strokeLinecap="round" />
        <line x1="12" y1="6" x2="12" y2="60" stroke={INK} strokeWidth="2" strokeLinecap="round" opacity=".5" />
        <circle cx="12" cy="6" r="4.5" fill="#FFD21F" stroke={INK} strokeWidth="2.5" />
        <path d="M15 10 Q 34 4 58 12 L 58 40 Q 36 32 15 40 Z" fill="url(#lrChkP)" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      </svg>
    );
    default: return <span>{"🔧"}</span>;
  }
}


/* "How do I race?" — a small, optional explainer. Never shown automatically. */
function RaceHelp({ onClose }) {
  const okRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const opener = document.activeElement;
    if (okRef.current) okRef.current.focus();
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); closeRef.current(); }
      else if (e.key === "Tab") { e.preventDefault(); if (okRef.current) okRef.current.focus(); }   // keep focus inside
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (opener && opener.focus) opener.focus();     // put focus back on "How do I race?"
    };
  }, []);
  return (
    <div className="lr-modal" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="lr-dialog" role="dialog" aria-modal="true" aria-labelledby="lr-help-title">
        <h2 id="lr-help-title">How to Race 🏁</h2>
        <ol className="lr-helpsteps">
          <li>
            <span className="lr-hnum" aria-hidden="true">1</span>
            <div><b>Pick a challenge</b><p>Choose something you want to practice.</p></div>
          </li>
          <li>
            <span className="lr-hnum" aria-hidden="true">2</span>
            <div><b>Finish the activity</b><p>Any score moves your car forward. Score 80%+ to earn a trophy too!</p></div>
          </li>
          <li>
            <span className="lr-hnum" aria-hidden="true">3</span>
            <div><b>Drive your car</b><p>When driving is available, jump in your car and race!</p></div>
          </li>
        </ol>
        <button ref={okRef} className="btn gold lr-gotit" onClick={onClose}>Got it!</button>
      </div>
    </div>
  );
}

function TrailMap({ progress, go }) {
  const [help, setHelp] = useState(false);
  const closeHelp = useCallback(() => setHelp(false), []);
  const challengesRef = useRef(null);

  const canDrive = (progress.sessions || 0) >= 1;     // the same rule the Garage uses
  const named = !!(progress.car && progress.car.name);
  const np = nextPart(progress);                       // real Garage progression
  const goal = np && np.goal ? np.goal(progress) : null;
  const have = goal ? Math.min(goal.have, goal.need) : 0;
  const pct = goal ? Math.round((have / goal.need) * 100) : 100;
  const sm = progress.speedMath || {};

  const toChallenges = () => {
    const el = challengesRef.current;
    if (!el) return;
    let smooth = true;
    try { smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* ignore */ }
    el.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" });
    el.focus({ preventScroll: true });
  };
  /* Sprint lives in a separate add-on panel; this just presses its button. */
  const openSprint = () => {
    const b = document.getElementById("bd-open-sprint");
    if (b) b.click();
  };

  return (
    <div className="lr-home">
      <section className="lr-hero" aria-labelledby="lr-race-title">
        <div className="lr-brand">
          <AppLogo />
          <div className="lr-carstage" aria-hidden="true">
            <span className="lr-road" />
            <img className="lr-car" src={ART.main_car} alt="" />
          </div>
        </div>

        <div className="lr-panels">
          <div className="lr-how">
            <h1 id="lr-race-title">🏎️ Want to race your car?</h1>
            <ol className="lr-steps">
              <li><span className="lr-sicon" aria-hidden="true"><StepIcon kind="pick" /></span><b>1. Pick a challenge</b></li>
              <li><span className="lr-sicon" aria-hidden="true"><StepIcon kind="finish" /></span><b>2. Finish it</b><span className="lr-any">Any score counts!</span></li>
              <li><span className="lr-sicon" aria-hidden="true"><StepIcon kind="race" /></span><b>3. Drive your car!</b></li>
            </ol>
            <button className="lr-helpbtn" onClick={() => setHelp(true)}>❓ How do I race?</button>
          </div>

          <div className="lr-next">
            <div className="lr-nicon" aria-hidden="true">
              {np ? <PartIcon id={np.id} name={progress.car && progress.car.name} /> : <StepIcon kind="race" />}
            </div>
            <div className="lr-ntext">
              {np && goal ? (
                <>
                  <h2>Next car part: <span>{np.name}</span></h2>
                  <p>{np.short}{np.anyScore ? " · Any score counts!" : ""}</p>
                  <div className="lr-nrow">
                    <div className="lr-nbar" role="progressbar" aria-label={`Progress toward ${np.name}`}
                      aria-valuemin={0} aria-valuemax={goal.need} aria-valuenow={have}>
                      <i style={{ width: `${pct}%` }} />
                    </div>
                    <span className="lr-ncount">{have} of {goal.need}</span>
                  </div>
                </>
              ) : (
                <>
                  <h2>Your car is complete! 🏁</h2>
                  <p>Every part is on. Keep practicing and racing!</p>
                  <div className="lr-nrow"><div className="lr-nbar"><i style={{ width: "100%" }} /></div></div>
                </>
              )}
            </div>
          </div>

          <div className="lr-cta">
            {canDrive ? (
              <button className="btn gold lr-drive" onClick={() => go({ name: "drive3d", returnTo: { name: "map" } })}>
                🏎️ Drive my car!
              </button>
            ) : (
              <>
                <button className="btn lr-drive" onClick={toChallenges}>Pick a challenge</button>
                <p className="lr-ctanote">Finish a challenge to unlock your car!</p>
              </>
            )}
            <button className="btn ghost" onClick={() => go({ name: "garage" })}>
              {named ? "🔧 My Garage" : "🔧 Name my car"}
            </button>
          </div>
        </div>
      </section>

      <section className="lr-challenges" aria-labelledby="lr-pick-title">
        <h2 id="lr-pick-title" ref={challengesRef} tabIndex={-1}>Pick a challenge</h2>
        <p className="lr-sub">Choose a zone to practice and earn rewards for your car.</p>
        <div className="lr-zgrid">
          {REGIONS.map((r) => {
            const cs = conceptsIn(r.id);
            const done = cs.filter((c) => progress.mastered?.[c.id]).length;
            return (
              <button key={r.id} className="lr-zcard" style={{ "--rc": r.rc, "--rcfg": r.fg || "#fff" }}
                onClick={() => go({ name: "region", rid: r.id })}>
                <span className="lr-zart">
                  <img src={ART[r.art]} alt="" />
                  <span className="lr-ztitle">{r.name}</span>
                </span>
                <span className="lr-zfoot">
                  <span className="lr-ztext">
                    <span className="lr-ztag">{r.tag}</span>
                    <span className="lr-ztrophies">
                      <span className="lr-zbar" aria-hidden="true"><i style={{ width: `${(done / cs.length) * 100}%` }} /></span>
                      {done} of {cs.length} trophies
                    </span>
                  </span>
                  <span className="lr-zgo" aria-hidden="true">›</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="lr-more" aria-labelledby="lr-more-title">
        <div className="lr-morehead">
          <h2 id="lr-more-title">More ways to play</h2>
          <p>Extra practice and fun!</p>
        </div>
        <div className="lr-mgrid">
          <div className="lr-mcard" style={{ "--mc": "#E4EEFF" }}>
            <span className="lr-mart" aria-hidden="true"><img src={ART.speed_math} alt="" /></span>
            <div className="lr-mbody">
              <h3>Speed Math</h3>
              <p>Timed arithmetic practice.</p>
              <p className="small">Best runs: single {sm.sm1 || 0} · double {sm.sm2 || 0} · triple {sm.sm3 || 0}</p>
              <div className="btnrow">
                <button className="btn" onClick={() => go({ name: "mathdrill" })}>Play Speed Math</button>
              </div>
            </div>
          </div>

          <div className="lr-mcard" style={{ "--mc": "#F3E8FF" }}>
            <span className="lr-mart" aria-hidden="true"><img src={ART.word_forge} alt="" /></span>
            <div className="lr-mbody">
              <h3>Word Forge</h3>
              <p>Build sight words and sentences.</p>
              <p className="small">Words spelled right so far: {Object.keys(progress.words || {}).length}</p>
              <div className="btnrow" role="group" aria-label="Word Forge grade">
                {[1, 2, 3, 4].map((lv) => (
                  <button key={lv} className={`btn ${lv === 3 ? "" : "ghost"}`}
                    onClick={() => go({ name: "spell", level: lv, k: Math.random() })}>
                    Grade {lv}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lr-mcard" style={{ "--mc": "#E3F6EA" }}>
            <span className="lr-mart" aria-hidden="true"><img src={ART.speed_run} alt="" /></span>
            <div className="lr-mbody">
              <h3>Speed Run</h3>
              <p>Mixed questions with a clock running.</p>
              <p className="small">Best run so far: {progress.bestTimed || 0} correct</p>
              <div className="btnrow" role="group" aria-label="Speed Run length">
                <button className="btn" onClick={() => go({ name: "timed", secs: 240 })}>4 min</button>
                <button className="btn ghost" onClick={() => go({ name: "timed", secs: 480 })}>8 min</button>
                <button className="btn ghost" onClick={() => go({ name: "timed", secs: 900 })}>15 min</button>
              </div>
            </div>
          </div>

          <div className="lr-mcard" style={{ "--mc": "#FFF1DC" }}>
            <span className="lr-mart lr-mflag" aria-hidden="true"><PartIcon id="flag" /></span>
            <div className="lr-mbody">
              <h3>Sprint</h3>
              <p>Worksheet-style speed drill. Beat 2:00!</p>
              <p className="small">Your best times show in Your collection.</p>
              <div className="btnrow">
                <button className="btn" onClick={openSprint}>Open Sprint</button>
              </div>
            </div>
          </div>

          <div className="lr-mcard wide" style={{ "--mc": "#FFF6CF" }}>
            <span className="lr-mart lr-mtype" aria-hidden="true"><TypeIcon /></span>
            <div className="lr-mbody">
              <h3>Typing Speedway</h3>
              <p>Learn to type! Drive your car to the finish by typing each sentence.</p>
              <p className="small">{(() => {
                const ty = progress.typing || {};
                const b = ["hard", "moderate", "easy"].find((k) => ty[k] && ty[k].runs);
                return b ? `Best on ${TYPE_LEVELS.find((l) => l.id === b).name}: ${ty[b].bestAcc}% accurate${ty[b].bestWpm ? ` · ${ty[b].bestWpm} WPM` : ""}` : "Easy, Moderate and Hard levels · optional words-per-minute clock";
              })()}</p>
              <div className="btnrow">
                <button className="btn" onClick={() => go({ name: "typing" })}>⌨️ Start typing</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <button className="card progsum" onClick={() => go({ name: "collection" })}>
        <div className="ps">
          <span><b className="g">{progress.correct || 0}</b><span>right</span></span>
          <span><b className="r">{Math.max(0, (progress.attempts || 0) - (progress.correct || 0))}</b><span>wrong</span></span>
          <span><b>{progress.attempts ? Math.round(((progress.correct || 0) / progress.attempts) * 100) : 0}%</b><span>correct</span></span>
        </div>
        <div className="small" style={{ marginTop: 10, fontWeight: 800 }}>See everything you've done →</div>
      </button>

      {help && <RaceHelp onClose={closeHelp} />}
    </div>
  );
}

/* ---------------- Word Forge: hear it, spell it, use it ---------------- */
const ALPHA = "abcdefghijklmnopqrstuvwxyz";

/* Pick the best available English voice once, and keep it. */
let VOICE = null;
function pickVoice() {
  try {
    const vs = window.speechSynthesis.getVoices();
    if (!vs || !vs.length) return null;
    const en = vs.filter((v) => /^en(-|_)/i.test(v.lang));
    const pool = en.length ? en : vs;
    // Prefer named high-quality US voices, then any en-US, then anything English.
    const wanted = ["Samantha", "Ava", "Allison", "Joanna", "Google US English", "Microsoft Aria", "Microsoft Jenny"];
    for (const name of wanted) {
      const hit = pool.find((v) => v.name && v.name.indexOf(name) === 0);
      if (hit) return hit;
    }
    return pool.find((v) => /en(-|_)US/i.test(v.lang)) || pool[0];
  } catch { return null; }
}
if (typeof window !== "undefined" && window.speechSynthesis) {
  VOICE = pickVoice();
  window.speechSynthesis.onvoiceschanged = () => { VOICE = pickVoice() || VOICE; };
}

function speak(text, rate = 0.95) {
  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = rate; u.pitch = 1; u.volume = 1; u.lang = "en-US";
    if (!VOICE) VOICE = pickVoice();
    if (VOICE) u.voice = VOICE;
    window.speechSynthesis.speak(u);
  } catch { /* no voice available */ }
}

/* A bare sight word often gets read wrong ("read", "live", "does").
   Saying it, pausing, then saying it in the sentence fixes that. */
function sayWord(word, sentence) {
  const withContext = sentence ? sentence.replace("___", word) : "";
  speak(withContext ? `${word}. ${withContext}` : word, 0.92);
}

/* [[word]] markers are for the tappable glossary; the voice shouldn't say the brackets. */
const plain = (t) => String(t).replace(/\[\[([^\]]+)\]\]/g, "$1");

/* Read the spelling out loud, one letter at a time. */
function sayLetters(word) {
  const spaced = word.split("").map((c) => (c === "'" ? "apostrophe" : c.toUpperCase())).join(", ");
  speak(spaced, 0.6);
}

function WordForge({ level, progress, push, go }) {
  const list = SIGHT_WORDS[level] || [];
  const [round] = useState(() => [...list].sort(() => Math.random() - 0.5).slice(0, 6));
  const [i, setI] = useState(0);
  const [step, setStep] = useState("look");
  const [built, setBuilt] = useState([]);
  const [result, setResult] = useState(null);   // null | 'right' | 'wrong'
  const [firstTry, setFirstTry] = useState(true);
  const [placed, setPlaced] = useState([]);      // tile indices, in the order tapped
  const [sentResult, setSentResult] = useState(null);
  const [won, setWon] = useState([]);
  const [rightN, setRightN] = useState(0);
  const [wrongN, setWrongN] = useState(0);
  const [wordTally, setWordTally] = useState({});
  const [done, setDone] = useState(false);
  const [showCheer, setShowCheer] = useState(true);
  const saved = useRef(false);

  const entry = round[i] || ["", ""];
  const [word, sentence] = entry;

  /* letter tiles: the word's letters plus a few decoys, shuffled once per word */
  const tiles = React.useMemo(() => {
    const letters = word.split("");
    const decoys = [];
    while (decoys.length < 3) {
      const l = ALPHA[Math.floor(Math.random() * 26)];
      if (!letters.includes(l) && !decoys.includes(l)) decoys.push(l);
    }
    return [...letters, ...decoys].sort(() => Math.random() - 0.5);
  }, [word]);

  /* the finished sentence, and its words shuffled into tiles */
  const fullSentence = sentence ? sentence.replace("___", word) : "";
  const sentWords = React.useMemo(() => (fullSentence ? fullSentence.split(" ") : []), [fullSentence]);
  const sentTiles = React.useMemo(
    () => sentWords.map((w, i) => ({ i, w })).sort(() => Math.random() - 0.5),
    [sentWords]
  );

  useEffect(() => { if (step === "look" && word) sayWord(word, sentence); }, [step, word, sentence]);

  useEffect(() => {
    if (!done || saved.current) return;
    saved.current = true;
    let p = record(progress, "Word Forge", rightN, wrongN);
    p.words = { ...(p.words || {}) };
    won.forEach((w) => { p.words[w] = (p.words[w] || 0) + 1; });
    p.wordStats = { ...(p.wordStats || {}) };
    Object.entries(wordTally).forEach(([w, t]) => {
      const prev = p.wordStats[w] || { right: 0, wrong: 0 };
      p.wordStats[w] = { right: prev.right + t.right, wrong: prev.wrong + t.wrong };
    });
    p.badges = awardBadge(p, `spell_${level}`, Math.round((won.length / round.length) * 100));
    push(p);
  }, [done]); // eslint-disable-line

  const tally = (w, ok) => {
    setWordTally((t) => {
      const prev = t[w] || { right: 0, wrong: 0 };
      return { ...t, [w]: { right: prev.right + (ok ? 1 : 0), wrong: prev.wrong + (ok ? 0 : 1) } };
    });
    if (ok) setRightN((n) => n + 1); else setWrongN((n) => n + 1);
  };

  const usedCount = {};
  built.forEach((b) => { usedCount[b.t] = (usedCount[b.t] || 0) + 1; });

  const checkSpelling = () => {
    const attempt = built.map((b) => b.t).join("");
    if (attempt === word) {
      setResult("right");
      tally(word, true);
      if (firstTry) setWon((w) => [...w, word]);
    } else {
      setResult("wrong");
      tally(word, false);
      setFirstTry(false);
    }
  };

  const nextWord = () => {
    if (i + 1 >= round.length) { setDone(true); return; }
    setI(i + 1); setStep("look"); setBuilt([]); setResult(null);
    setFirstTry(true); setPlaced([]); setSentResult(null);
  };

  /* physical keyboard support for spelling: type letters, alongside tapping tiles */
  useEffect(() => {
    if (step !== "build" || result) return;
    function onKeyDown(e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const key = e.key.toLowerCase();
      if (key === "enter") e.preventDefault();
      if (key === "backspace") {
        e.preventDefault();
        setBuilt((b) => b.slice(0, -1));
        return;
      }
      if (key === "enter") {
        if (built.length === word.length) checkSpelling();
        return;
      }
      if (/^[a-z']$/.test(key) && built.length < word.length) {
        setBuilt((b) => {
          if (b.length >= word.length) return b;
          const takenKs = b.map((x) => x.k);
          const idx = tiles.findIndex((t, k) => t.toLowerCase() === key && !takenKs.includes(k));
          if (idx === -1) return b;
          return [...b, { k: idx, t: tiles[idx] }];
        });
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [step, result, built, word, tiles]);

  if (done) {
    const pct = Math.round((won.length / round.length) * 100);
    const badge = badgeTier(pct);
    return (
      <div className="stack">
        {won.length === round.length && showCheer && (
          <Cheer emoji="🔤" sub={`All ${round.length} words spelled right the first time.`}
            onClose={() => setShowCheer(false)} />
        )}
        <div className="stamp card">
          <div className="big">{won.length === round.length ? "🔤" : "⚡"}</div>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>{won.length} of {round.length} spelled first try — {pct}%</h1>
          <div className="badgechip">{badge.emoji} {badge.label} badge earned!</div>
          <p className="small" style={{ margin: "0 0 6px" }}>{rightN} right · {wrongN} wrong this round</p>
          <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
            {won.length === round.length
              ? "Every word, first try. That's the whole round clean."
              : "The ones you had to redo are the ones worth doing again tomorrow."}
          </p>
        </div>
        <div className="wordlist">
          {round.map(([w]) => (
            <span key={w} className={`chip ${won.includes(w) ? "ok" : ""}`} onClick={() => speak(w, 0.92)}>
              {won.includes(w) ? "✓ " : ""}{w}
            </span>
          ))}
        </div>
        <p className="small">Tap any word to hear it again.</p>
        <div className="btnrow">
          <button className="btn" onClick={() => go({ name: "spell", level, k: Math.random() })}>Another round</button>
          <button className="btn ghost" onClick={() => go({ name: "map" })}>Back to zones</button>
        </div>
      </div>
    );
  }

  return (
    <div className="stack">
      <div className="qnum">Word {i + 1} of {round.length} · Grade {level} list</div>

      {/* STEP 1 — look and listen */}
      {step === "look" && (
        <>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="bigword">{word}</div>
            <div className="btnrow" style={{ justifyContent: "center" }}>
              <button className="btn gold" onClick={() => sayWord(word, sentence)}>🔊 Hear it</button>
              <button className="btn ghost" onClick={() => sayLetters(word)}>🔤 Spell it out</button>
            </div>
          </div>
          <div className="idea">
            <h2>Used in a sentence</h2>
            <p style={{ fontSize: 20 }}>
              {sentence.split("___")[0]}<b style={{ color: "var(--bluebonnet)" }}>{word}</b>{sentence.split("___")[1]}
            </p>
          </div>
          <p className="small">Look at every letter. Tap “Spell it out” to hear each one. Next screen the word disappears.</p>
          <div className="footer"><div className="in">
            <button className="btn ghost" onClick={() => go({ name: "map" })}>Quit</button>
            <button className="btn" onClick={() => setStep("build")}>I'm ready to spell it</button>
          </div></div>
        </>
      )}

      {/* STEP 2 — build it from letters */}
      {step === "build" && (
        <>
          <p className="prompt">Spell the word. Tap 🔊 if you need to hear it again.</p>
          <div className="btnrow">
            <button className="btn gold" onClick={() => sayWord(word, sentence)}>🔊 Say it</button>
            <button className="btn ghost" onClick={() => sayLetters(word)}>🔤 Letter by letter</button>
          </div>

          <div className="wordslots">
            {Array.from({ length: word.length }).map((_, k) => (
              <span key={k} className={`ws ${result === "right" ? "ok" : result === "wrong" ? "no" : ""}`}>
                {built[k] ? built[k].t : ""}
              </span>
            ))}
          </div>

          {!result && (
            <>
              <div className="tiles" style={{ justifyContent: "center" }}>
                {tiles.map((t, k) => {
                  const taken = built.some((b) => b.k === k);
                  return (
                    <button key={k} className={`tile letter ${taken ? "used" : ""}`}
                      disabled={taken || built.length >= word.length}
                      onClick={() => setBuilt([...built, { k, t }])}>{t}</button>
                  );
                })}
              </div>
              <div className="btnrow" style={{ justifyContent: "center" }}>
                <button className="btn ghost" disabled={!built.length} onClick={() => setBuilt(built.slice(0, -1))}>⌫ Undo</button>
                <button className="btn" disabled={built.length !== word.length} onClick={checkSpelling}>Check</button>
              </div>
            </>
          )}

          {result === "right" && (
            <>
              <div className="fb ok"><h3>Spelled it.</h3><p>Now put the sentence in order.</p></div>
              <div className="footer"><div className="in">
                <button className="btn" onClick={() => setStep("use")}>Next step</button>
              </div></div>
            </>
          )}

          {result === "wrong" && (
            <>
              <div className="fb no">
                <h3>Here's why that one isn't right —</h3>
                <p>You built <b>{built.map((b) => b.t).join("")}</b>. The word is <b>{word}</b>. Say it slowly and listen for each sound, then try again.</p>
              </div>
              <div className="footer"><div className="in">
                <button className="btn ghost" onClick={() => sayLetters(word)}>🔤 Letter by letter</button>
                <button className="btn" onClick={() => { setBuilt([]); setResult(null); }}>Try again</button>
              </div></div>
            </>
          )}
        </>
      )}

      {/* STEP 3 — build the whole sentence */}
      {step === "use" && (
        <>
          <p className="prompt">Put the words in order to make the sentence.</p>
          <div className="btnrow">
            <button className="btn gold" onClick={() => speak(fullSentence, 0.9)}>🔊 Hear the sentence</button>
          </div>

          <div className={`sentbuild ${sentResult === "right" ? "ok" : sentResult === "wrong" ? "no" : ""}`}>
            {placed.length === 0
              ? <span className="ghosttext">Tap words below to start building…</span>
              : placed.map((idx, k) => (
                  <span key={k} className={`sw ${sentWords[idx] === word ? "target" : ""}`}>{sentWords[idx]}</span>
                ))}
          </div>

          {!sentResult && (
            <>
              <div className="tiles">
                {sentTiles.map((t) => {
                  const used = placed.includes(t.i);
                  return (
                    <button key={t.i} className={`tile word ${used ? "used" : ""}`} disabled={used}
                      onClick={() => setPlaced([...placed, t.i])}>{t.w}</button>
                  );
                })}
              </div>
              <div className="btnrow">
                <button className="btn ghost" disabled={!placed.length} onClick={() => setPlaced(placed.slice(0, -1))}>⌫ Undo</button>
                <button className="btn ghost" disabled={!placed.length} onClick={() => setPlaced([])}>Clear</button>
                <button className="btn" disabled={placed.length !== sentWords.length}
                  onClick={() => {
                    const ok = placed.map((idx) => sentWords[idx]).join(" ") === fullSentence;
                    setSentResult(ok ? "right" : "wrong");
                    tally(word, ok);
                  }}>Check</button>
              </div>
              <p className="small">A sentence starts with a capital letter and ends with a mark like . or ?</p>
            </>
          )}

          {sentResult && (
            <div className={`fb ${sentResult === "right" ? "ok" : "no"}`}>
              <h3>{sentResult === "right" ? "That's it — nice thinking." : "Here's why that one isn't right —"}</h3>
              <p>
                {sentResult === "right"
                  ? `You built it: "${fullSentence}"`
                  : `Look at the capital letter — that word goes first, and the word with the . or ? goes last. The sentence is: "${fullSentence}"`}
              </p>
            </div>
          )}

          <div className="footer"><div className="in">
            {!sentResult && <button className="btn ghost" onClick={() => speak(fullSentence, 0.9)}>🔊 Again</button>}
            {sentResult === "wrong" && (
              <button className="btn ghost" onClick={() => { setPlaced([]); setSentResult(null); }}>Try again</button>
            )}
            {sentResult && <button className="btn" onClick={nextWord}>{i + 1 >= round.length ? "See how I did" : "Next word"}</button>}
          </div></div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   THE GARAGE
   Doing the work builds the car. Mastering the skill earns the trophy.
   Parts unlock from stops attempted, so a hard stop still moves the build.
   Parts are never taken away once earned.
   ============================================================ */
const CAR_COLORS = [
  ["Blue", "#1B62E8"], ["Red", "#D8362A"], ["Green", "#12A05A"],
  ["Yellow", "#F5C518"], ["Purple", "#8B3FD6"], ["Orange", "#EE7B1B"],
];

const attemptedIn = (p, rid) => conceptsIn(rid).filter((c) => p.seen && p.seen[c.id]).length;
/* Passing score for any stop: 80% or higher (rounded up), so a 5-question stop needs 4 right. */
const passThreshold = (total) => Math.max(1, Math.ceil(total * 0.8));
/* Badges: every finished test earns one, tiered by score — never punishes trying. */
const BADGE_RANK = { try: 0, bronze: 1, silver: 2, gold: 3 };
function badgeTier(pct) {
  if (pct >= 100) return { tier: "gold", emoji: "🥇", label: "Gold" };
  if (pct >= 80) return { tier: "silver", emoji: "🥈", label: "Silver" };
  if (pct >= 60) return { tier: "bronze", emoji: "🥉", label: "Bronze" };
  return { tier: "try", emoji: "🎯", label: "Nice Try" };
}
function awardBadge(progress, key, pct) {
  const badges = { ...(progress.badges || {}) };
  const cur = badges[key];
  const t = badgeTier(pct);
  if (!cur || BADGE_RANK[t.tier] > BADGE_RANK[cur.tier]) {
    badges[key] = { tier: t.tier, pct, ts: Date.now() };
  }
  return badges;
}

const GARAGE_PARTS = [
  { id: "wheels", name: "Wheels", emoji: "🛞", zone: "Anywhere",
    how: "Finish 1 task anywhere in the app — any score counts",
    need: (p) => (p.sessions || 0) >= 1, short: "Finish 1 activity", anyScore: true, goal: (p) => ({ have: p.sessions || 0, need: 1 }),
    choices: [["monster", "Monster tires"], ["moon", "Moon wheels"], ["classic", "Classic"]] },
  { id: "paint", name: "Paint job", emoji: "🎨", zone: "Anywhere",
    how: "Finish 2 tasks anywhere in the app — any score counts",
    need: (p) => (p.sessions || 0) >= 2, short: "Finish 2 activities", anyScore: true, goal: (p) => ({ have: p.sessions || 0, need: 2 }) },
  { id: "lights", name: "Headlights", emoji: "💡", zone: "Anywhere",
    how: "Finish 3 tasks anywhere in the app — any score counts",
    need: (p) => (p.sessions || 0) >= 3, short: "Finish 3 activities", anyScore: true, goal: (p) => ({ have: p.sessions || 0, need: 3 }) },
  { id: "top", name: "Roof gear", emoji: "🪂", zone: "Anywhere",
    how: "Finish 4 tasks anywhere in the app — any score counts",
    need: (p) => (p.sessions || 0) >= 4, short: "Finish 4 activities", anyScore: true, goal: (p) => ({ have: p.sessions || 0, need: 4 }),
    choices: [["spoiler", "Spoiler"], ["rack", "Roof rack"], ["sunroof", "Sunroof"]] },
  { id: "dash", name: "Dashboard", emoji: "🎛", zone: "Anywhere",
    how: "Finish 5 tasks anywhere in the app — any score counts",
    need: (p) => (p.sessions || 0) >= 5, short: "Finish 5 activities", anyScore: true, goal: (p) => ({ have: p.sessions || 0, need: 5 }) },
  { id: "plate", name: "Name plate", emoji: "🔖", zone: "Anywhere",
    how: "Finish 6 tasks anywhere in the app — any score counts",
    need: (p) => (p.sessions || 0) >= 6, short: "Finish 6 activities", anyScore: true, goal: (p) => ({ have: p.sessions || 0, need: 6 }), names: true },
  { id: "horn", name: "Horn", emoji: "📣", zone: "Word Forge", goTo: { name: "spell", level: 3 },
    how: "Spell 12 sight words right", need: (p) => Object.keys(p.words || {}).length >= 12,
    short: "Spell 12 sight words right in Word Forge", goal: (p) => ({ have: Object.keys(p.words || {}).length, need: 12 }),
    choices: [["beep", "Beep beep"], ["trumpet", "Big trumpet"], ["moo", "Cow horn"]] },
  { id: "turbo", name: "Turbo", emoji: "🔥", zone: "Speed Math", goTo: { name: "mathdrill" },
    how: "Get 15 right in one Speed Math run",
    need: (p) => Math.max(p.speedMath?.sm1 || 0, p.speedMath?.sm2 || 0, p.speedMath?.sm3 || 0) >= 15,
    short: "Get 15 right in one Speed Math run",
    goal: (p) => ({ have: Math.max(p.speedMath?.sm1 || 0, p.speedMath?.sm2 || 0, p.speedMath?.sm3 || 0), need: 15 }) },
  { id: "flag", name: "Victory flag", emoji: "🚩", zone: "Everywhere",
    how: `Win all ${CONCEPTS.length} trophies`, need: (p) => Object.keys(p.mastered || {}).length >= CONCEPTS.length,
    short: `Win all ${CONCEPTS.length} trophies (80%+ on every stop)`, goal: (p) => ({ have: Object.keys(p.mastered || {}).length, need: CONCEPTS.length }),
    choices: [["star", "Star"], ["bolt", "Lightning"], ["check", "Checkers"]] },
];

const partsEarned = (p) => GARAGE_PARTS.filter((x) => x.need(p));
const nextPart = (p) => GARAGE_PARTS.find((x) => !x.need(p));

/* ---------------- 3D driving mode ---------------- */
/* ---------------- the 3D car (shared by the drive and the Garage showroom) ----------------
   have: which parts are earned. ghost: draw parts that aren't earned yet as see-through
   blue "blueprint" pieces, so the Garage can show what is still to come. */
function buildCarModel({ have, picks = {}, bodyColor = "#1B62E8", name = "RACER", HIGH = true, hasEnv = false, srgb = (tex) => tex, ghost = false }) {
  const std = (opts) => new THREE.MeshStandardMaterial(opts);
  const ghostMat = new THREE.MeshBasicMaterial({ color: 0x4fa3ff, transparent: true, opacity: 0.55, depthWrite: false,
    blending: THREE.AdditiveBlending });           // glowing blueprint look
  const carGroup = new THREE.Group();
  const bodyGroup = new THREE.Group();            // everything that sits on the wheels
  carGroup.add(bodyGroup);
  const wheelStyle = picks.wheels || "classic";
  const wheelR = wheelStyle === "monster" ? 0.62 : 0.46;
  const wheelW = wheelStyle === "monster" ? 0.56 : 0.4;
  const archR = Math.max(0.58, wheelR + 0.07);
  bodyGroup.position.y = wheelR - 0.45 + 0.06;    // a little ground clearance; monster tires lift it more

  const paintMat = have.paint
    ? (HIGH
      ? new THREE.MeshPhysicalMaterial({ color: bodyColor, metalness: hasEnv ? 0.55 : 0.15, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 })
      : std({ color: bodyColor, metalness: hasEnv ? 0.4 : 0.1, roughness: 0.4 }))
    : std({ color: 0xc3ccd8, metalness: 0.1, roughness: 0.7 });   // grey primer until the paint job is earned
  const glassMat = std({ color: hasEnv ? 0x18222e : 0x2a3a4c, metalness: hasEnv ? 0.9 : 0.3, roughness: 0.06, side: THREE.DoubleSide });
  const darkMat = std({ color: 0x1b1f27, roughness: 0.8 });
  const METAL = hasEnv ? 1 : 0.35;     // without reflections, full metal looks black
  const chromeMat = std({ color: 0xe8ecf2, metalness: METAL, roughness: 0.18 });

  /* side profile of the body: length along z (front is +z), height along y, wheel arches cut in */
  const prof = new THREE.Shape();
  prof.moveTo(-2.2, 0.42);
  prof.lineTo(-2.28, 0.84);
  prof.quadraticCurveTo(-2.26, 0.98, -1.8, 1.0);
  prof.lineTo(-1.42, 1.02);
  prof.quadraticCurveTo(-1.36, 1.02, -1.32, 1.06);
  prof.lineTo(-0.84, 1.45);
  prof.quadraticCurveTo(-0.78, 1.5, -0.66, 1.5);
  prof.lineTo(0.3, 1.5);
  prof.quadraticCurveTo(0.42, 1.5, 0.48, 1.44);
  prof.lineTo(1.0, 1.08);
  prof.quadraticCurveTo(1.08, 1.02, 1.3, 1.0);
  prof.quadraticCurveTo(2.0, 0.95, 2.22, 0.82);
  prof.quadraticCurveTo(2.34, 0.62, 2.22, 0.42);
  prof.lineTo(1.4 + archR, 0.42);
  prof.absarc(1.4, 0.45, archR, 0, Math.PI, false);
  prof.lineTo(-1.4 + archR, 0.42);
  prof.absarc(-1.4, 0.45, archR, 0, Math.PI, false);
  prof.lineTo(-2.2, 0.42);
  const bodyGeo = new THREE.ExtrudeGeometry(prof, {
    depth: 1.7, bevelEnabled: true, bevelThickness: 0.14, bevelSize: 0.1,
    bevelSegments: HIGH ? 6 : 3, curveSegments: HIGH ? 28 : 12,
  });
  bodyGeo.rotateY(-Math.PI / 2);                  // profile length -> car length, extrusion -> car width
  bodyGeo.computeBoundingBox();
  const bbox = bodyGeo.boundingBox;
  bodyGeo.translate(-(bbox.min.x + bbox.max.x) / 2, 0, 0);
  const halfW = (bbox.max.x - bbox.min.x) / 2 || 0.99;
  bodyGroup.add(new THREE.Mesh(bodyGeo, paintMat));

  /* side windows, windshield and rear window */
  const win = new THREE.Shape();
  win.moveTo(-1.18, 1.1);
  win.lineTo(-0.82, 1.4);
  win.lineTo(0.36, 1.4);
  win.lineTo(0.9, 1.1);
  win.lineTo(-1.18, 1.1);
  const winGeo = new THREE.ShapeGeometry(win);
  winGeo.rotateY(-Math.PI / 2);
  [-1, 1].forEach((side) => {
    const w = new THREE.Mesh(winGeo, glassMat);
    w.position.x = side * (halfW + 0.004);
    bodyGroup.add(w);
  });
  const pillar = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 + 0.02, 0.32, 0.08), paintMat);
  pillar.position.set(0, 1.25, -0.2);
  bodyGroup.add(pillar);
  function slopeGlass(z1, y1, z2, y2) {
    const dz = z2 - z1, dy = y2 - y1, len = Math.hypot(dz, dy) || 1;
    const g = new THREE.Mesh(new THREE.PlaneGeometry(halfW * 2 - 0.4, len * 0.82), glassMat);
    g.rotation.x = Math.atan2(dz, dy);
    const oy = dz / len, oz = -dy / len;          // outward, away from the body
    g.position.set(0, (y1 + y2) / 2 + oy * 0.11, (z1 + z2) / 2 + oz * 0.11);
    bodyGroup.add(g);
  }
  slopeGlass(0.48, 1.44, 1.0, 1.08);              // windshield
  slopeGlass(-1.32, 1.06, -0.84, 1.45);           // rear window

  const under = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 4.0), darkMat);
  under.position.set(0, 0.42, 0);
  bodyGroup.add(under);
  const grille = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 0.06), darkMat);
  grille.position.set(0, 0.6, 2.39);
  bodyGroup.add(grille);
  /* race-car details: front splitter, side skirts, and racing stripes once the paint job is earned */
  const splitter = new THREE.Mesh(new THREE.BoxGeometry(halfW * 2 + 0.06, 0.05, 0.36), darkMat);
  splitter.position.set(0, 0.36, 2.22);
  bodyGroup.add(splitter);
  [-1, 1].forEach((side) => {
    const skirt = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.12, 1.5), darkMat);
    skirt.position.set(side * (halfW + 0.02), 0.46, 0);
    bodyGroup.add(skirt);
  });
  if (have.paint) {
    const light = /^#(f|e|d)/i.test(String(bodyColor)) && !/^#d8/i.test(String(bodyColor));
    const stripeMat = std({ color: light ? 0x0f1f3d : 0xf4f6fa, roughness: 0.35, metalness: 0.1 });
    [-0.22, 0.22].forEach((x) => {                     // twin stripes over the roof
      const st = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.98), stripeMat);
      st.position.set(x, 1.607, -0.18);
      bodyGroup.add(st);
    });
    [-1, 1].forEach((side) => {                         // side stripe along the doors
      const ss = new THREE.Mesh(new THREE.PlaneGeometry(1.76, 0.08), stripeMat);
      ss.rotation.y = side > 0 ? Math.PI / 2 : -Math.PI / 2;
      ss.position.set(side * (halfW + 0.006), 0.8, 0);
      bodyGroup.add(ss);
    });
  }

  const headMat = have.lights
    ? std({ color: 0xfff6d8, emissive: 0xfff1c0, emissiveIntensity: 2.2 })
    : std({ color: 0x9aa4b2, metalness: 0.6, roughness: 0.3 });
  const headGeo = new THREE.BoxGeometry(0.5, 0.1, 0.12);        // angular, swept-back headlights
  [-0.62, 0.62].forEach((x) => {
    const h = new THREE.Mesh(headGeo, headMat);
    h.rotation.y = x > 0 ? -0.35 : 0.35;
    h.rotation.z = x > 0 ? 0.12 : -0.12;
    h.position.set(x, 0.82, 2.25);
    bodyGroup.add(h);
  });
  const tailMat = std({ color: 0xc81d12, emissive: 0xff2a1a, emissiveIntensity: 1.2 });
  [-0.6, 0.6].forEach((x) => {
    const tl = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.06), tailMat);
    tl.position.set(x, 0.82, -2.36);
    bodyGroup.add(tl);
  });

  /* exhaust pipes, and turbo flames once turbo is earned */
  const pipeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.3, 16);
  let flame = null;
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0 });
  [-0.45, 0.45].forEach((x) => {
    const pipe = new THREE.Mesh(pipeGeo, chromeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(x, 0.42, -2.3);
    bodyGroup.add(pipe);
    if (have.turbo) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 12), flameMat);
      f.rotation.x = -Math.PI / 2;
      f.position.set(x, 0.42, -2.64);
      bodyGroup.add(f);
      if (!flame) flame = f;
    } else if (ghost) {
      const f = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 12), ghostMat);
      f.rotation.x = -Math.PI / 2;
      f.position.set(x, 0.42, -2.64);
      bodyGroup.add(f);
    }
  });

  if (have.plate) {
    const pc = document.createElement("canvas");
    pc.width = 256; pc.height = 96;
    const px = pc.getContext("2d");
    px.fillStyle = "#fffdf6"; px.fillRect(0, 0, 256, 96);
    px.strokeStyle = "#22304a"; px.lineWidth = 8; px.strokeRect(4, 4, 248, 88);
    px.fillStyle = "#22304a"; px.font = "bold 46px sans-serif";
    px.textAlign = "center"; px.textBaseline = "middle";
    px.fillText(name, 128, 52);
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3),
      std({ map: srgb(new THREE.CanvasTexture(pc)), roughness: 0.5 }));
    plate.rotation.y = Math.PI;
    plate.position.set(0, 0.6, -2.37);
    bodyGroup.add(plate);
  } else if (ghost) {
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.3), ghostMat);
    plate.rotation.y = Math.PI;
    plate.position.set(0, 0.6, -2.37);
    bodyGroup.add(plate);
  }

  const topPick = picks.top || "spoiler";
  const topOn = have.top || ghost;
  const topDark = have.top ? darkMat : ghostMat, topChrome = have.top ? chromeMat : ghostMat, topGlass = have.top ? glassMat : ghostMat;
  if (topOn && topPick === "spoiler") {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.42), topDark);
    wing.position.set(0, 1.4, -2.0);
    bodyGroup.add(wing);
    [-0.6, 0.6].forEach((x) => {
      const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.12), topDark);
      strut.position.set(x, 1.22, -1.98);
      bodyGroup.add(strut);
    });
  }
  if (topOn && topPick === "rack") {
    [-0.6, 0.6].forEach((x) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.1), topChrome);
      rail.position.set(x, 1.66, -0.18);
      bodyGroup.add(rail);
    });
    [-0.6, -0.18, 0.24].forEach((z) => {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.05), topChrome);
      bar.position.set(0, 1.69, z);
      bodyGroup.add(bar);
    });
  }
  if (topOn && topPick === "sunroof") {
    const sr = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.7), topGlass);
    sr.position.set(0, 1.61, -0.2);
    bodyGroup.add(sr);
  }
  if (have.horn) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 16), std({ color: 0xf5c518, metalness: METAL, roughness: 0.3 }));
    horn.rotation.x = -Math.PI / 2;               // little brass horn on the front bumper, bell facing forward
    horn.position.set(0.78, 0.6, 2.3);
    bodyGroup.add(horn);
  } else if (ghost) {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 16), ghostMat);
    horn.rotation.x = -Math.PI / 2;
    horn.position.set(0.78, 0.6, 2.3);
    bodyGroup.add(horn);
  }
  let flagMesh = null;
  if (have.flag) {
    const flagColor = picks.flag === "check" ? 0x22304a : picks.flag === "bolt" ? 0xf5c518 : 0xd8362a;
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8), chromeMat);
    pole.position.set(-0.75, 1.9, -1.9);
    flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.45),
      std({ color: flagColor, roughness: 0.8, side: THREE.DoubleSide }));
    flagMesh.position.set(-0.4, 2.55, -1.9);
    bodyGroup.add(pole, flagMesh);
  } else if (ghost) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.8, 8), ghostMat);
    pole.position.set(-0.75, 1.9, -1.9);
    flagMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.45), ghostMat);
    flagMesh.position.set(-0.4, 2.55, -1.9);
    bodyGroup.add(pole, flagMesh);
  }

  /* wheels: rubber tires, rims and hubs that spin */
  const tireMat = std({ color: 0x1e2127, roughness: 0.92 });
  const rimMat = wheelStyle === "moon" ? std({ color: 0xd6dce6, metalness: 0.3, roughness: 0.55 })
    : wheelStyle === "monster" ? std({ color: 0x2c313a, metalness: 0.7, roughness: 0.35 })
    : chromeMat;
  const wm = (m) => (ghost && !have.wheels ? ghostMat : m);   // wheels not earned yet: blueprint tires
  const seg = HIGH ? 40 : 18;
  const tireGeo = new THREE.CylinderGeometry(wheelR, wheelR, wheelW, seg);
  const rimGeo = new THREE.CylinderGeometry(wheelR * 0.6, wheelR * 0.6, wheelW + 0.02, seg);
  const hubGeo = new THREE.CylinderGeometry(wheelR * 0.16, wheelR * 0.16, wheelW + 0.06, 16);
  const spokeGeo = new THREE.BoxGeometry(0.04, wheelR * 1.1, 0.07);
  const craterGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12);
  const knobGeo = new THREE.BoxGeometry(wheelW * 0.9, 0.1, 0.16);
  const wheels = [];
  [[-1, 1.4], [1, 1.4], [-1, -1.4], [1, -1.4]].forEach(([side, z]) => {
    const holder = new THREE.Group();
    holder.position.set(side * (halfW - wheelW / 2 + 0.12), wheelR, z);   // tires sit just outside the body
    const spin = new THREE.Group();
    holder.add(spin);
    [[tireGeo, wm(tireMat)], [rimGeo, wm(rimMat)], [hubGeo, wm(chromeMat)]].forEach(([geo, mat]) => {
      const part = new THREE.Mesh(geo, mat);
      part.rotation.z = Math.PI / 2;
      spin.add(part);
    });
    const face = side * (wheelW / 2 + 0.012);
    if (wheelStyle === "moon") {
      [[0.12, 0.08], [-0.1, -0.12], [0.02, -0.16]].forEach(([y, zz]) => {
        const cr = new THREE.Mesh(craterGeo, wm(darkMat));
        cr.rotation.z = Math.PI / 2;
        cr.position.set(face, y, zz);
        spin.add(cr);
      });
    } else {
      for (let k = 0; k < 5; k++) {
        const sp = new THREE.Mesh(spokeGeo, wm(wheelStyle === "monster" ? darkMat : chromeMat));
        sp.position.x = face;
        sp.rotation.x = (k / 5) * Math.PI * 2;
        spin.add(sp);
      }
    }
    if (wheelStyle === "monster") {
      for (let k = 0; k < 12; k++) {
        const a = (k / 12) * Math.PI * 2;
        const knob = new THREE.Mesh(knobGeo, wm(tireMat));
        knob.rotation.x = a;
        knob.position.set(0, Math.cos(a) * wheelR, Math.sin(a) * wheelR);
        spin.add(knob);
      }
    }
    carGroup.add(holder);
    wheels.push(spin);
  });
  carGroup.traverse((o) => { if (o.isMesh) o.castShadow = HIGH && o.material !== ghostMat; });
  return { carGroup, wheels, flame, flagMesh };
}

/* ============================================================
   DRIVE QUESTION BANK
   Questions for the races and the Coin Arena. Most math topics are
   generated fresh each time (new numbers), so the same question
   almost never repeats. Topics come from real class worksheets:
   rounding (10 and 100), estimating, 3-digit add and subtract,
   bar-model word problems, repeated addition and equal groups,
   expanded notation, place value, VCe and open/closed syllables,
   contractions, point of view, and states of matter.
   ============================================================ */
const qr = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const qpick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const qshuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const qhash = (str) => { let h = 5381; for (let i = 0; i < str.length; i++) h = ((h * 33) ^ str.charCodeAt(i)) >>> 0; return h.toString(36); };
const qn = (n) => Number(n).toLocaleString("en-US");
/* multiple choice with the right answer in a random spot; wrong choices that match the right one are dropped */
function qmc(prompt, right, wrongs, hint, exp) {
  const uniq = [];
  wrongs.forEach((w) => { if (String(w) !== String(right) && !uniq.some((u) => String(u) === String(w))) uniq.push(w); });
  const options = qshuffle([right, ...uniq.slice(0, 3)]).map(String);
  return { type: "mc", prompt, options, a: options.indexOf(String(right)), hint, exp };
}
const qentry = (prompt, a, hint, exp) => ({ type: "entry", prompt, a, hint, exp });

/* ---------- rounding ---------- */
function genRound10() {
  const n = Math.random() < 0.5 ? qr(11, 99) : qr(101, 989);
  const ones = n % 10;
  if (ones === 0) return genRound10();
  const down = n - ones, up = down + 10, ans = ones >= 5 ? up : down;
  const why = ones >= 5
    ? `The ones digit is ${ones}. That's 5 or more, so the tens go up one: ${qn(ans)}.`
    : `The ones digit is ${ones}. That's less than 5, so the tens digit stays the same, and the ones become 0: ${qn(ans)}.`;
  const exp = `${why} A rounded number always ends in 0 — so ${qn(n)} itself can't be the answer. On a number line, ${qn(n)} sits between ${qn(down)} and ${qn(up)} and is closer to ${qn(ans)}.`;
  const hint = "Underline the tens digit. Look at the ones digit next door. 5 or more? Go up. Less than 5? Stay.";
  if (Math.random() < 0.5) return qentry(`Round ${qn(n)} to the nearest 10.`, ans, hint, exp);
  return qmc(`Round ${qn(n)} to the nearest 10.`, qn(ans), [qn(n), qn(ones >= 5 ? down : up), qn(Math.round(n / 100) * 100), qn(ans + 10)], hint, exp);
}
function genRound100() {
  const n = Math.random() < 0.7 ? qr(110, 989) : qr(1010, 5980);
  const rest = n % 100;
  if (rest === 0 || rest === 50) return genRound100();
  const tens = Math.floor(rest / 10);
  const down = n - rest, up = down + 100, ans = tens >= 5 ? up : down;
  const why = tens >= 5
    ? `Look at the tens digit: ${tens}. That's 5 or more, so the hundreds go up one: ${qn(ans)}.`
    : `Look at the tens digit: ${tens}. That's less than 5, so the hundreds digit stays the same, and the tens and ones become 0: ${qn(ans)}.`;
  const exp = `${why} Rounding to the nearest 100 always ends in 00 — ${qn(n)} itself is never the answer.`;
  const hint = "Underline the hundreds digit. Look at the TENS digit next door. 5 or more? Go up. Less than 5? Stay.";
  if (Math.random() < 0.5) return qentry(`Round ${qn(n)} to the nearest 100.`, ans, hint, exp);
  return qmc(`Round ${qn(n)} to the nearest 100.`, qn(ans), [qn(n), qn(tens >= 5 ? down : up), qn(Math.round(n / 10) * 10), qn(ans + 100)], hint, exp);
}
function genEstimate() {
  const to100 = Math.random() < 0.6, unit = to100 ? 100 : 10;
  const r = (x) => Math.round(x / unit) * unit;
  const add = Math.random() < 0.55;
  let a = qr(120, 880), b = qr(110, 480);
  if (!add && b > a) [a, b] = [b, a];
  if (a % unit === unit / 2 || b % unit === unit / 2) return genEstimate();
  const ra = r(a), rb = r(b), ans = add ? ra + rb : ra - rb;
  const sign = add ? "+" : "−";
  const exp = `Round first, then do the math. ${qn(a)} rounds to ${qn(ra)} and ${qn(b)} rounds to ${qn(rb)}. Then ${qn(ra)} ${sign} ${qn(rb)} = ${qn(ans)}. The exact answer would be ${qn(add ? a + b : a - b)} — an estimate is the friendly-number version.`;
  return qentry(`Estimate ${qn(a)} ${sign} ${qn(b)} by rounding each number to the nearest ${unit}.`, ans,
    `Round ${qn(a)} and ${qn(b)} to the nearest ${unit} first. Then ${add ? "add" : "subtract"}.`, exp);
}

/* ---------- adding and subtracting word problems ---------- */
const ADD_STORIES = [
  (a, b) => [`A zoo rescued ${a} animals last year and ${b} animals this year. How many animals were rescued in the two years?`, "in all"],
  (a, b) => [`One baby giraffe weighs ${a} pounds. Another weighs ${b} pounds. What is their combined weight in pounds?`, "combined"],
  (a, b) => [`There are ${a} snakes and ${b} birds living at the zoo. How many snakes and birds are there?`, "together"],
  (a, b) => [`A school library has ${a} books. It receives ${b} new books. How many books does it have now?`, "receives"],
  (a, b) => [`A store had ${a} pencils. It received ${b} more pencils. How many pencils does the store have now?`, "received more"],
];
const SUB_STORIES = [
  (a, b) => [`There were ${a} cows on the farm. After ${b} of them were taken away, how many cows were left?`, "taken away"],
  (a, b) => [`There are ${a} red ants and ${b} black ants in the colony. How many more red ants are there than black ants?`, "how many more"],
  (a, b) => [`The painters bought ${b} paint rollers in winter and ${a} in summer. How many fewer rollers did they buy in winter than in summer?`, "how many fewer"],
  (a, b) => [`A factory made ${a} headbands in June and ${b} fewer in July. How many headbands did it make in July?`, "fewer"],
];
function genAddSub() {
  if (Math.random() < 0.5) {
    const a = qr(115, 489), b = qr(108, 469);
    const [prompt, key] = qpick(ADD_STORIES)(a, b);
    return qentry(prompt, a + b, `The words "${key}" mean put the groups together. Add.`,
      `${a} + ${b} = ${a + b}. Line up the ones, tens, and hundreds, and remember to regroup when a column adds up to 10 or more.`);
  }
  const a = qr(320, 960), b = qr(105, a - 110);
  const [prompt, key] = qpick(SUB_STORIES)(a, b);
  return qentry(prompt, a - b, `The words "${key}" mean find the difference. Subtract the smaller number from the bigger one.`,
    `${a} − ${b} = ${a - b}. Check it backwards: ${a - b} + ${b} = ${a}. ✓`);
}
function genTwoStep() {
  const k = qr(0, 2);
  if (k === 0) {
    const books = qr(310, 520), got = qr(105, 240), gave = qr(45, 99);
    return qentry(`A school library has ${books} books. The library receives ${got} new books and then gives away ${gave} books. How many books does the library have now?`,
      books + got - gave, "Two steps. First add the new books. Then take away the books given away.",
      `Step 1: ${books} + ${got} = ${books + got}. Step 2: ${books + got} − ${gave} = ${books + got - gave} books.`);
  }
  if (k === 1) {
    const mon = qr(180, 320), more = qr(40, 95);
    return qentry(`A farmer picked ${mon} tomatoes on Monday. He picked ${more} more tomatoes on Tuesday than on Monday. How many tomatoes did he pick in total?`,
      mon + mon + more, "Find Tuesday first (Monday plus the extra). Then add both days.",
      `Tuesday: ${mon} + ${more} = ${mon + more}. Total: ${mon} + ${mon + more} = ${mon * 2 + more}. The trap answer is ${mon + more}, which is only Tuesday.`);
  }
  const j = qr(210, 340), jl = qr(250, 360), au = qr(200, 330);
  return qentry(`A zoo got $${j} in June, $${jl} in July, and $${au} in August. How many dollars did the zoo get in all three months?`,
    j + jl + au, "Add two months first, then add the third.",
    `${j} + ${jl} = ${j + jl}. Then ${j + jl} + ${au} = ${j + jl + au} dollars.`);
}
function genBarModel() {
  const k = qr(0, 1);
  if (k === 0) {
    const start = qr(105, 260), came = qr(101, 190);
    return qentry(`There were some bats under a bridge. ${came} more bats flew in. Now there are ${start + came} bats. How many bats were there to start?`,
      start, "Draw a bar. The whole is the total now. One part is the bats that flew in. Find the other part.",
      `The whole bar is ${start + came}. One part is ${came}. The missing part is ${start + came} − ${came} = ${start}.`);
  }
  const total = qr(420, 900), part = qr(120, total - 150);
  return qmc(`Marco had ${total} stickers. He gave some away and has ${part} left. Which equation finds how many he gave away?`,
    `${total} − ${part} = ?`, [`${total} + ${part} = ?`, `${part} − ${total} = ?`, `? − ${part} = ${total}`],
    "The whole is what he started with. One part is what's left. You're looking for the other part.",
    `Start with the whole (${total}) and take away the part that's left (${part}): ${total} − ${part} = ${total - part}. Adding would make the number bigger, but he gave stickers away.`);
}

/* ---------- multiplying as equal groups ---------- */
function genRepAdd() {
  const k = qr(0, 3);
  const g = qr(2, 6), n = qr(2, 7);
  if (k === 0) {
    const sum = Array(g).fill(n).join(" + ");
    return qmc(`Which multiplication sentence means the same as ${sum}?`,
      `${g} × ${n} = ${g * n}`, [`${n} × ${n} = ${n * n}`, `${g} + ${n} = ${g + n}`, `${g} × ${n + 1} = ${g * (n + 1)}`, `${n} × 1 = ${n}`],
      "Count how many times the number is added. That's the number of groups.",
      `${sum} adds ${n} a total of ${g} times, so it's ${g} groups of ${n}: ${g} × ${n} = ${g * n}.`);
  }
  if (k === 1) {
    const sum = Array(g).fill(n).join(" + ");
    return qentry(`${sum} = ?`, g * n, `Count the ${n}s. There are ${g} of them. Skip-count by ${n}.`,
      `There are ${g} groups of ${n}. Skip-count: ${Array.from({ length: g }, (_, i) => n * (i + 1)).join(", ")}. So it's ${g * n} (the same as ${g} × ${n}).`);
  }
  if (k === 2) {
    return qentry(`${g} groups of ${n}. How many in all?`, g * n, `${g} groups with ${n} in each. Multiply ${g} × ${n}.`,
      `${g} groups of ${n} is ${g} × ${n} = ${g * n}. You can check with repeated addition: ${Array(g).fill(n).join(" + ")} = ${g * n}.`);
  }
  const items = qpick([["jars of pickles", "box"], ["miles", "day"], ["wheels", "car"], ["crayons", "pack"], ["cookies", "plate"]]);
  const each = qr(3, 6), how = qr(2, 5);
  const prompt = items[1] === "day"
    ? `Each day, Jani rides her bike ${each} miles. How many miles does she ride in ${how} days?`
    : `There are ${each} ${items[0]} in each ${items[1]}. How many ${items[0]} are in ${how} ${items[1]}${items[1] === "box" ? "es" : "s"}?`;
  return qentry(prompt, each * how, "Equal groups: how many groups, and how many in each group?",
    `${how} groups of ${each}: ${how} × ${each} = ${each * how}.`);
}
function genFacts() {
  const a = qpick([2, 3, 4, 5, 10]), b = qr(2, 10);
  const [x, y] = Math.random() < 0.5 ? [a, b] : [b, a];
  return qentry(`${x} × ${y} = ?`, x * y, `${x} groups of ${y}. Skip-count by ${y}, ${x} times.`,
    `${x} × ${y} = ${x * y}. Skip-count by ${y}: ${Array.from({ length: x }, (_, i) => y * (i + 1)).join(", ")}.`);
}

/* ---------- place value and expanded notation ---------- */
const PLACES = [[10000, "ten thousands"], [1000, "thousands"], [100, "hundreds"], [10, "tens"], [1, "ones"]];
function expParts(n) {
  const parts = [];
  PLACES.forEach(([v]) => { const d = Math.floor(n / v) % 10; if (d && n >= v) parts.push([d, v]); });
  return parts;
}
const expStr = (parts) => parts.map(([d, v]) => `(${d} × ${qn(v)})`).join(" + ");
function genExpNotation() {
  /* numbers with a 0 inside, like 5,704 or 10,372 — the zero is the tricky part */
  let n;
  do {
    n = Math.random() < 0.7 ? qr(1001, 9899) : qr(10010, 98909);
  } while (!String(n).slice(1).includes("0") || n % 10 === 0 && Math.random() < 0.5);
  const parts = expParts(n);
  if (Math.random() < 0.5) {
    const right = expStr(parts);
    const bump = (idx, f) => expStr(parts.map(([d, v], i) => (i === idx ? [d, Math.max(1, v * f)] : [d, v])));
    const w1 = bump(0, 0.1);                                   // e.g. 5,704 as (5 × 100) + (7 × 100) + (4 × 1)
    const w2 = bump(parts.length - 1, 10);                      // the ones pushed into the tens
    const w3 = parts.length > 2 ? bump(1, parts[1][1] >= 10 ? 0.1 : 10) : bump(0, 10);
    const form = parts.map(([d, v]) => qn(d * v)).join(" + ");  // expanded FORM, not notation
    return qmc(`Which expression represents the number ${qn(n)}?`, right, [w1, ...qshuffle([w2, w3, form])],
      "Make a place-value chart. Write each digit under its place. Skip the place with the 0.",
      `In ${qn(n)}: ${parts.map(([d, v]) => `the ${d} is worth ${qn(d * v)}`).join(", ")}. Each part is digit × place value, so ${right}. The 0 holds a place open, so that place gets no part at all. (The choice with only plus signs is expanded FORM, not notation.)`);
  }
  return qentry(`What number is ${expStr(parts)}?`, n, "Put each digit in its place. Write 0 in any place that is missing.",
    `${parts.map(([d, v]) => qn(d * v)).join(" + ")} = ${qn(n)}. Any place with no part gets a 0, so the number is ${qn(n)}.`);
}
function genPlaceValue() {
  let n, i, d;
  do {
    n = Math.random() < 0.6 ? qr(120, 989) : qr(1200, 98999);
    const digits = String(n);
    i = qr(0, digits.length - 2);
    d = Number(digits[i]);
  } while (!d || String(n).split("").filter((c) => c === String(d)).length > 1);
  const len = String(n).length, val = d * 10 ** (len - 1 - i);
  const place = PLACES[5 - (len - i)][1];
  return qentry(`In the number ${qn(n)}, what is the VALUE of the digit ${d}?`, val,
    "Count the places from the right: ones, tens, hundreds, thousands, ten thousands.",
    `The ${d} is in the ${place} place, so it's worth ${qn(val)} — not just ${d}. The value is the digit times its place.`);
}

/* ---------- reading: syllables, contractions, point of view ---------- */
const VCE = [["pancake", "cake", "a"], ["alone", "lone", "o"], ["homework", "home", "o"], ["compete", "pete", "e"],
  ["escape", "cape", "a"], ["invite", "vite", "i"], ["mistake", "take", "a"], ["include", "clude", "u"], ["inside", "side", "i"],
  ["reduce", "duce", "u"], ["explode", "plode", "o"], ["sunrise", "rise", "i"], ["cupcake", "cake", "a"], ["costume", "tume", "u"],
  ["trombone", "bone", "o"], ["stampede", "pede", "e"], ["reptile", "tile", "i"], ["confuse", "fuse", "u"], ["athlete", "lete", "e"],
  ["bedtime", "time", "i"], ["lemonade", "nade", "a"], ["backbone", "bone", "o"], ["complete", "plete", "e"], ["sunshine", "shine", "i"]];
const CLOSED_WORDS = ["napkin", "basket", "rabbit", "picnic", "sunset", "contest", "muffin", "kitten", "problem", "insect", "tablet", "helmet"];
function genVCe() {
  const [w, syl, v] = qpick(VCE);
  if (Math.random() < 0.6) {
    return qmc(`In the word "${w}", find the syllable with a vowel, a consonant, and a silent e (VCe): "${syl}". Which long vowel sound does it make?`,
      `long ${v}`, qshuffle(["a", "e", "i", "o", "u"].filter((x) => x !== v)).map((x) => `long ${x}`),
      "In a VCe syllable the e is silent. It makes the vowel before it say its own name.",
      `In "${syl}" the silent e makes the ${v} say its name, so it's a long ${v} sound: ${w}.`);
  }
  return qmc("Which word has a VCe syllable with a long vowel sound?", w, qshuffle(CLOSED_WORDS).slice(0, 3),
    "Look for a vowel, then one consonant, then an e at the end of a syllable.",
    `"${w}" has the syllable "${syl}" — vowel, consonant, silent e — so the vowel is long. The other words have closed syllables with short vowels.`);
}
const SYLL = [["robot", "ro", true], ["tulip", "tu", true], ["donut", "do", true], ["music", "mu", true], ["pilot", "pi", true],
  ["tiger", "ti", true], ["zero", "ze", true], ["baby", "ba", true], ["napkin", "nap", false], ["rabbit", "rab", false],
  ["basket", "bas", false], ["pencil", "pen", false], ["muffin", "muf", false], ["picnic", "pic", false], ["sunset", "sun", false]];
function genSyllables() {
  const [w, first, open] = qpick(SYLL);
  return qmc(`Look at the first syllable of "${w}": "${first}". Is it an open syllable or a closed syllable?`,
    open ? "Open — it ends with a vowel, so the vowel is long" : "Closed — it ends with a consonant, so the vowel is short",
    [open ? "Closed — it ends with a consonant, so the vowel is short" : "Open — it ends with a vowel, so the vowel is long",
      "It isn't a syllable", "Both open and closed"],
    "Does the syllable end with a vowel or a consonant?",
    open
      ? `"${first}" ends with the vowel, so it's OPEN and the vowel says its name. That's why ${w} starts with a long sound.`
      : `"${first}" ends with a consonant that closes in the vowel, so it's CLOSED and the vowel is short.`);
}
const CONTRACTIONS = [["I would", "I'd"], ["you will", "you'll"], ["have not", "haven't"], ["we have", "we've"], ["he would", "he'd"],
  ["they would", "they'd"], ["she will", "she'll"], ["you have", "you've"], ["we will", "we'll"], ["I have", "I've"],
  ["do not", "don't"], ["is not", "isn't"], ["they are", "they're"], ["it is", "it's"], ["we are", "we're"], ["she would", "she'd"]];
function genContractions() {
  const [full, short] = qpick(CONTRACTIONS);
  const first = full.split(" ")[0];
  const same = CONTRACTIONS.filter((c) => c[1] !== short && c[0].split(" ")[0] === first);
  const rest = CONTRACTIONS.filter((c) => c[1] !== short && c[0].split(" ")[0] !== first);
  const others = [...qshuffle(same), ...qshuffle(rest)];
  if (Math.random() < 0.5) {
    return qmc(`Which contraction means "${full}"?`, short, others.map((c) => c[1]),
      "A contraction squeezes two words together. The apostrophe takes the place of the missing letters.",
      `"${full}" squeezes into "${short}". The apostrophe stands in for the letters that were taken out.`);
  }
  return qmc(`What two words make the contraction "${short}"?`, full, others.map((c) => c[0]),
    "Put the missing letters back where the apostrophe is.",
    `"${short}" is short for "${full}". The apostrophe shows where letters were left out.`);
}
const POV = [
  ["I woke up early and packed my backpack for the trip.", "first"],
  ["Dear Primo, I miss you! My school has a big garden.", "first"],
  ["We raced to the park, and my sister won.", "first"],
  ["She opened the box and found a tiny kitten inside.", "third"],
  ["Carlitos and Charlie wrote letters to each other every week.", "third"],
  ["They built a track in the backyard and raced their cars.", "third"],
  ["He kicked the ball so hard it flew over the fence.", "third"],
  ["My grandma and I baked bread on Saturday.", "first"],
];
function genPOV() {
  const [line, pov] = qpick(POV);
  return qmc(`"${line}"\nWhat point of view is this written in?`,
    pov === "first" ? "First person — the narrator is in the story" : "Third person — the narrator is outside the story",
    [pov === "first" ? "Third person — the narrator is outside the story" : "First person — the narrator is in the story",
      "Second person — the narrator is the reader", "You can't tell"],
    "Look at the pronouns. I, me, my, we mean first person. He, she, they mean third person.",
    pov === "first"
      ? "It uses words like I, my, or we, so someone inside the story is telling it. That's first person. In the Dear Primo letters, each cousin is the narrator of his own letter."
      : "It uses he, she, they, or names, so someone outside the story is telling it. That's third person.");
}

/* ---------- science: states of matter ---------- */
const MATTER_QS = [
  qmcS("Which of these is a LIQUID?", "oil", ["sand", "ice", "air"],
    "A liquid can be poured and takes the shape of its container.",
    "Oil pours and takes the shape of any cup you put it in, but it keeps the same amount. That makes it a liquid. Sand pours too, but every tiny grain keeps its own shape, so sand is a solid."),
  qmcS("Kendra's class put sand in the LIQUIDS column. Why is that wrong?", "Each grain of sand is a solid that keeps its own shape", ["Sand is a gas", "Sand is too heavy to be a liquid", "Sand is wet"],
    "Look at one tiny grain. Does it change shape in a cup?",
    "Sand can be poured, but each grain holds its own shape. Holding a shape is what solids do, so sand is a solid made of tiny pieces."),
  qmcS("Matter takes the shape of its container, fills ALL parts of the container, and has no definite shape. What could it be?", "air", ["sand", "cereal", "beads"],
    "Which one spreads out to fill the whole space?",
    "Only a gas fills every part of a container. Air is a gas. Sand, cereal, and beads are solids that just sit at the bottom."),
  qmcS("A toy dump truck keeps the same shape wherever you put it. What state of matter is it?", "solid", ["liquid", "gas", "none of these"],
    "Does it change shape to fit a box?",
    "The truck holds its own shape, so it is a solid. That's the evidence: solids keep their shape."),
  qmcS("Which property makes juice a LIQUID?", "It takes the shape of its cup but keeps the same amount", ["It keeps its own shape", "It fills the whole room", "It can't be poured"],
    "Pour juice into a tall glass, then a bowl. What changes and what stays the same?",
    "Juice changes shape to match its container, but the amount stays the same. That's what makes it a liquid. A gas would spread out to fill the whole space."),
  qmcS("How are ice and liquid water alike?", "They are both made of water", ["They both keep their shape", "They are both gases", "They are both hot"],
    "Think about what they are made of, not how they look.",
    "Ice and liquid water are the same matter in different states. The ice is a solid that keeps its shape; the liquid water takes the shape of the glass."),
  qmcS("An ice cube sits in the sun and turns into water. What is this change called?", "melting", ["freezing", "evaporation", "condensation"],
    "Solid to liquid, and heat was added.",
    "Heat turned a solid into a liquid. That's melting."),
  qmcS("Water is put in the freezer and becomes ice. What is this change called?", "freezing", ["melting", "evaporation", "condensation"],
    "Liquid to solid, and it got cold.",
    "Cooling turned a liquid into a solid. That's freezing."),
  qmcS("A puddle disappears on a hot, sunny day. What happened to the water?", "It evaporated into a gas", ["It froze", "It melted", "It condensed"],
    "Heat can turn a liquid into a gas you can't see.",
    "The sun's heat turned the liquid water into water vapor, a gas. That's evaporation."),
  qmcS("Tiny water drops form on the outside of a cold glass of lemonade. What is this change called?", "condensation", ["evaporation", "melting", "freezing"],
    "Water vapor in the air touched something cold.",
    "Water vapor (a gas) in the air cooled down on the cold glass and turned back into liquid drops. That's condensation — gas to liquid, caused by cold."),
  qmcS("Which change needs HEAT to happen?", "melting", ["freezing", "condensation", "none of them"],
    "Think of ice in the sun.",
    "Melting and evaporation need heat. Freezing and condensation happen when things cool down."),
];
function qmcS(prompt, right, wrongs, hint, exp) { return { prompt, right, wrongs, hint, exp }; }

/* topic list: weight = how often it comes up. Weak spots from the worksheets get more weight. */
const DRIVE_TOPICS = [
  { id: "round10", title: "Rounding to the nearest 10", w: 3, gen: genRound10 },
  { id: "round100", title: "Rounding to the nearest 100", w: 3, gen: genRound100 },
  { id: "estimate", title: "Estimating by rounding", w: 2, gen: genEstimate },
  { id: "addsub", title: "Adding and subtracting", w: 2, gen: genAddSub },
  { id: "twostep", title: "Two-step word problems", w: 2, gen: genTwoStep },
  { id: "barmodel", title: "Bar model problems", w: 1.5, gen: genBarModel },
  { id: "repadd", title: "Equal groups and repeated addition", w: 3, gen: genRepAdd },
  { id: "facts", title: "Multiplication facts", w: 1.5, gen: genFacts },
  { id: "expnot", title: "Expanded notation", w: 2.5, gen: genExpNotation },
  { id: "pvalue", title: "Place value", w: 2, gen: genPlaceValue },
  { id: "vce", title: "VCe syllables", w: 1.5, gen: genVCe },
  { id: "syll", title: "Open and closed syllables", w: 1, gen: genSyllables },
  { id: "contract", title: "Contractions", w: 1.5, gen: genContractions },
  { id: "pov", title: "Point of view", w: 1.5, gen: genPOV },
  { id: "matter", title: "States of matter", w: 2, list: MATTER_QS.map((m) => () => qmc(m.prompt, m.right, m.wrongs, m.hint, m.exp)) },
];

/* one question for the drive. mem = { seen: [keys], recent: [topic ids], miss: {topic: n} } */
function driveQuestion(mem, onlyTopic, avoidPrompt) {
  const seen = new Set(mem.seen || []);
  const recent = mem.recent || [];
  const miss = mem.miss || {};
  /* the lessons' own questions are one more topic per stop (no reading passages mid-drive) */
  const lessons = CONCEPTS.filter((c) => !c.passage).map((c) => ({
    id: `c:${c.id}`, title: c.title, w: 0.5,
    items: c.qs.map((q, i) => ({ key: `c:${c.id}:${i}`, q })).filter((x) => !x.q.passage),
  }));
  const topics = [...DRIVE_TOPICS, ...lessons];
  let t = onlyTopic ? topics.find((x) => x.id === onlyTopic) : null;
  if (!t) {
    const pool = topics.filter((x) => !recent.slice(-4).includes(x.id));
    const weight = (x) => x.w * (1 + Math.min(3, miss[x.id] || 0) * 0.5);   // topics missed lately come up more
    let sum = pool.reduce((a, x) => a + weight(x), 0), r = Math.random() * sum;
    t = pool[pool.length - 1];
    for (const x of pool) { r -= weight(x); if (r <= 0) { t = x; break; } }
  }
  let q, key;
  if (t.gen) {
    for (let k = 0; k < 12; k++) {
      q = t.gen();
      key = `g:${t.id}:${qhash(q.prompt)}`;
      if (!seen.has(key) && q.prompt !== avoidPrompt) break;
    }
  } else {
    const items = t.items || t.list.map((f, i) => ({ key: `${t.id}:${i}`, make: f }));
    let fresh = items.filter((x) => !seen.has(x.key) && (!x.q || x.q.prompt !== avoidPrompt));
    if (!fresh.length) fresh = items.filter((x) => !x.q || x.q.prompt !== avoidPrompt);
    const it = qpick(fresh.length ? fresh : items);
    key = it.key;
    q = it.make ? it.make() : shuffleChoices(it.q);
  }
  return { q, key, topic: t.id, title: t.title };
}
/* shuffle the choices of a lesson question, unless its explanation names a choice by letter */
function shuffleChoices(q) {
  if (q.type !== "mc" || /[Cc]hoice [A-E]\b/.test(q.exp || "")) return q;
  const order = qshuffle(q.options.map((_, i) => i));
  return { ...q, options: order.map((i) => q.options[i]), a: order.indexOf(q.a) };
}
/* how long to read before the answer buttons wake up (longer after a miss) */
const readDelayMs = (q, misses) => {
  const text = `${q.prompt} ${(q.options || []).join(" ")}`;
  return Math.min(9000, Math.min(7000, Math.max(2500, 1500 + text.length * 28)) + misses * 1000);
};

const GFX_KEY = "brickdash-gfx-v1";   // remembers High / Fast graphics on this device (key name must not change)

/* ---------------- Figure-8 race course ----------------
   One shared description of the course, used by the 3D scene and the mini-map.
   The centre line is a figure eight (x = A·sin t, z = B·sin 2t), resampled so the
   points are evenly spaced. Cars track their progress in "samples" along it. */
const RACE_LAPS = 2;
const TRACK_W = 13;                     // road width
/* Each level has its own course and its own computer-car tuning.
   band: when a computer car is this far AHEAD of you (fraction of a lap) it eases off to this speed.
   behind: speed factor for a computer car that is just behind you, so a pass you earn sticks.
   boostMax: longest turbo (frames) for a first-try right answer at a question gate.
   Tuned with a Node simulation of the same course and AI code. Best times are kept per course (bestKey). */
const RACE_LEVELS = [
  { id: "rookie", name: "Rookie", note: "Relaxed racers", track: "fig8", bestKey: "rookie",
    mult: 0.7, band: [[0.04, 0.76], [0.1, 0.55]], catchup: 1.03, behind: 0.9, boostMax: 540 },
  { id: "pro", name: "Pro", note: "A real race", track: "canyon", bestKey: "pro_canyon",
    mult: 0.88, band: [[0.1, 0.9], [0.22, 0.8]], catchup: 1.06, behind: 0.96, boostMax: 420 },
  { id: "champ", name: "Champion", note: "Fast and tough", track: "twister", bestKey: "champ_twister",
    mult: 1.04, band: [[0.18, 0.94]], catchup: 1.08, behind: 1, boostMax: 360 },
];
const TRACKS = {
  fig8: { name: "Figure-8", blurb: "Two big loops. Watch the crossing in the middle!" },
  canyon: { name: "Canyon Loop", blurb: "A long back straight and a twisty canyon section." },
  twister: { name: "Twister Ridge", blurb: "Tight bends and a chicane. Brake before the turns!" },
};
const RIVALS = [
  { name: "ZOOM", color: "#D8362A", css: "#D8362A", base: 0.405, lane: -3.2, slot: 0 },
  { name: "DASH", color: "#12A05A", css: "#12A05A", base: 0.388, lane: 3.2, slot: 1 },
  { name: "BLAZE", color: "#EE7B1B", css: "#EE7B1B", base: 0.37, lane: -3.2, slot: 2 },
];
const placeWord = (n) => (n === 1 ? "1st" : n === 2 ? "2nd" : n === 3 ? "3rd" : `${n}th`);
const fmtRace = (sec) => {
  const s = Math.max(0, sec);
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}.${Math.floor((s % 1) * 10)}`;
};

/* Race courses. Every course is a closed centre line resampled into evenly spaced
   samples (0.6 units apart) with tangents, curvature, a mini-map path and two
   "question gates" placed on the straightest parts of the lap. */
function finishTrack(x, z, len, extra = {}) {
  const N = x.length;
  const tx = new Float32Array(N), tz = new Float32Array(N), curv = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const a = (i + 1) % N, b = (i - 1 + N) % N;
    const dx = x[a] - x[b], dz = z[a] - z[b], l = Math.hypot(dx, dz) || 1;
    tx[i] = dx / l; tz[i] = dz / l;
  }
  const step = len / N;
  for (let i = 0; i < N; i++) {
    const a = (i + 4) % N, b = (i - 4 + N) % N;
    let d = Math.atan2(tx[a], tz[a]) - Math.atan2(tx[b], tz[b]);
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    curv[i] = Math.abs(d) / (8 * step);
  }
  /* question gates: the straightest spot in each half of the lap (looking 40 units ahead),
     never near the figure-8 crossing and never near the start line */
  const ahead = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let m = 0;
    for (let k = -10; k < 70; k++) m = Math.max(m, curv[(i + k + N) % N]);
    ahead[i] = m;
  }
  const bestIn = (a, b) => {
    let bi = -1;
    for (let i = Math.floor(N * a); i < N * b; i++) {
      if (Math.hypot(x[i], z[i]) < 30) continue;
      if (bi < 0 || ahead[i] < ahead[bi]) bi = i;
    }
    return bi < 0 ? Math.floor(N * (a + b) / 2) : bi;
  };
  const gates = [bestIn(0.12, 0.45), bestIn(0.55, 0.85)];
  let path = "";
  for (let i = 0; i < N; i += 6) path += `${i ? "L" : "M"}${(100 + x[i] * 1.05).toFixed(1)} ${(60 + z[i] * 1.05).toFixed(1)} `;
  return { N, len, step, x, z, tx, tz, curv, ahead, gates, path: path + "Z", ...extra };
}
function resample(rx, rz, closed) {
  const M = rx.length, cum = [0];
  const last = closed ? M : M - 1;
  for (let i = 1; i <= last; i++) cum.push(cum[i - 1] + Math.hypot(rx[i % M] - rx[i - 1], rz[i % M] - rz[i - 1]));
  const len = cum[last];
  const N = Math.round(len / 0.6);
  const x = new Float32Array(N), z = new Float32Array(N);
  let j = 0;
  for (let i = 0; i < N; i++) {
    const target = (i / N) * len;
    while (j < last - 1 && cum[j + 1] < target) j++;
    const f = (target - cum[j]) / ((cum[j + 1] - cum[j]) || 1);
    const a = j % M, b = (j + 1) % M;
    x[i] = rx[a] + (rx[b] - rx[a]) * f;
    z[i] = rz[a] + (rz[b] - rz[a]) * f;
  }
  return { x, z, len };
}
/* smooth closed course through control points (Catmull-Rom, then gently smoothed),
   rotated so sample 0 (the start line) sits on a straight */
function splineTrack(P, start) {
  const n = P.length, per = 24, dx = [], dz = [];
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (let k = 0; k < per; k++) {
      const u = k / per;
      const c = (a, b, c2, d) => 0.5 * (2 * b + (-a + c2) * u + (2 * a - 5 * b + 4 * c2 - d) * u * u + (-a + 3 * b - 3 * c2 + d) * u * u * u);
      dx.push(c(p0[0], p1[0], p2[0], p3[0])); dz.push(c(p0[1], p1[1], p2[1], p3[1]));
    }
  }
  let X = dx, Z = dz;
  const M = X.length, W = 5;
  for (let pass = 0; pass < 4; pass++) {
    const nx = new Array(M), nz = new Array(M);
    for (let i = 0; i < M; i++) {
      let sx = 0, sz = 0;
      for (let k = -W; k <= W; k++) { const j = (i + k + M) % M; sx += X[j]; sz += Z[j]; }
      nx[i] = sx / (2 * W + 1); nz[i] = sz / (2 * W + 1);
    }
    X = nx; Z = nz;
  }
  const r = resample(X, Z, true);
  let b = 0, bd = Infinity;
  for (let i = 0; i < r.x.length; i++) { const d = Math.hypot(r.x[i] - start[0], r.z[i] - start[1]); if (d < bd) { bd = d; b = i; } }
  const N = r.x.length, x = new Float32Array(N), z = new Float32Array(N);
  for (let i = 0; i < N; i++) { x[i] = r.x[(i + b) % N]; z[i] = r.z[(i + b) % N]; }
  return finishTrack(x, z, r.len);
}
const TRACK_CACHE = {};
function raceTrack(id) {
  if (TRACK_CACHE[id]) return TRACK_CACHE[id];
  let T;
  if (id === "canyon") {
    T = splineTrack([[-78, -42], [-20, -46], [40, -46], [82, -36], [88, 2], [74, 38], [40, 44], [18, 24], [-4, 22], [-26, 40], [-66, 42], [-88, 10]], [-48, -44]);
  } else if (id === "twister") {
    T = splineTrack([[-84, -42], [-36, -46], [-14, -24], [8, -24], [30, -46], [80, -44], [90, -18], [79, 4], [88, 26], [74, 46], [30, 46], [8, 26], [-18, 36], [-48, 46], [-84, 38], [-90, 0]], [-62, -44]);
  } else {
    /* the figure eight (x = A·sin t, z = B·sin 2t); the road crosses itself at the middle */
    const A = 86, B = 48, T0 = -0.32, D = 6000, rx = [], rz = [];
    for (let i = 0; i <= D; i++) { const t = T0 + (i / D) * Math.PI * 2; rx.push(A * Math.sin(t)); rz.push(B * Math.sin(2 * t)); }
    const r = resample(rx, rz, false);
    T = finishTrack(r.x, r.z, r.len, { cross: true });
  }
  TRACK_CACHE[id] = T;
  return T;
}
const figure8 = () => raceTrack("fig8");
const mapX = (x) => 100 + x * 1.05, mapZ = (z) => 60 + z * 1.05;

/* nearest centre-line sample; where the road crosses itself, prefer the branch the car was already on */
function nearestOnTrack(T, px, pz, hint) {
  let best = Infinity;
  for (let i = 0; i < T.N; i++) {
    const dx = T.x[i] - px, dz = T.z[i] - pz, d = dx * dx + dz * dz;
    if (d < best) best = d;
  }
  const lim = (Math.sqrt(best) + 2.5) ** 2;
  let bi = hint, bd = Infinity, bdist = best;
  for (let i = 0; i < T.N; i++) {
    const dx = T.x[i] - px, dz = T.z[i] - pz, d = dx * dx + dz * dz;
    if (d > lim) continue;
    let dd = Math.abs(i - hint); dd = Math.min(dd, T.N - dd);
    if (dd < bd) { bd = dd; bi = i; bdist = d; }
  }
  return { i: bi, dist: Math.sqrt(bdist) };
}

function Drive3DScene({ car = {}, progress, push, onExit, timeLimitSec }) {
  const mountRef = useRef(null);
  const [mode, setMode] = useState(null);             // null = choosing | "free" | "race"
  const [level, setLevel] = useState(() => (progress.raceLevel && RACE_LEVELS.some((l) => l.id === progress.raceLevel) ? progress.raceLevel : "rookie"));
  const [runKey, setRunKey] = useState(0);            // bump to restart the race
  const [secsLeft, setSecsLeft] = useState(timeLimitSec || null);
  const [coins, setCoins] = useState(0);
  const [stars, setStars] = useState(0);
  const [challenge, setChallenge] = useState(null);   // { q, title, key, topic, tries, source, target }
  const [readyAt, setReadyAt] = useState(0);           // answer buttons wake up at this time (read first!)
  const [, setTick] = useState(0);
  const [fast, setFast] = useState(false);             // last wrong answer was a very quick tap
  const [firstTries, setFirstTries] = useState(0);     // questions right on the first try this drive
  const [ans, setAns] = useState(undefined);
  const [locked, setLocked] = useState(false);
  const [race, setRace] = useState(null);             // { phase, count, lap, place, wrong, boost }
  const [result, setResult] = useState(null);         // { place, time, best, newBest }
  const pausedRef = useRef(false);                     // true while a question is open
  const boostRef = useRef(0);                          // turbo boost frames left (race)
  const clockRef = useRef(null);                       // race clock text, updated from the 3D loop
  const dotRefs = useRef([]);                          // mini-map dots
  const [quality, setQuality] = useState(() => {
    try { return window.localStorage.getItem(GFX_KEY) || "high"; } catch { return "high"; }
  });
  const qualityChosenRef = useRef((() => { try { return !!window.localStorage.getItem(GFX_KEY); } catch { return false; } })());
  const [gfxNote, setGfxNote] = useState("");
  const toggleQuality = () => {
    const next = quality === "high" ? "low" : "high";
    try { window.localStorage.setItem(GFX_KEY, next); } catch { /* ignore */ }
    qualityChosenRef.current = true;
    setGfxNote("");
    setQuality(next);
  };
  const autoLowRef = useRef(null);
  autoLowRef.current = () => {
    if (qualityChosenRef.current) return;
    setQuality("low");
    setGfxNote("Switched to Fast graphics so driving stays smooth. Tap Graphics to change it.");
  };
  useEffect(() => {
    if (!gfxNote) return;
    const id = setTimeout(() => setGfxNote(""), 5000);
    return () => clearTimeout(id);
  }, [gfxNote]);
  const coinsRef = useRef(0);
  const memRef = useRef(null);                         // question rotation memory, saved in progress.driveQ
  if (!memRef.current) {
    const m = progress.driveQ || {};
    memRef.current = { seen: m.seen || [], recent: m.recent || [], miss: m.miss || {} };
  }
  const boostTargetRef = useRef(null);                 // name of the car the turbo is chasing
  const onGateRef = useRef(null);
  const streakRef = useRef(0);
  /* hide the floating Sprint button while driving so it doesn't cover the pedals */
  useEffect(() => {
    document.body.classList.add("bd-driving");
    return () => document.body.classList.remove("bd-driving");
  }, []);
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;
  const TIMED = !!timeLimitSec && mode === "free";     // the lesson reward clock only applies in the Coin Arena

  /* leaving the drive: remember the best coin run, then exit */
  const finish = () => {
    const p = progressRef.current;
    if (push && coinsRef.current > (p.driveBestCoins || 0)) push({ ...p, driveBestCoins: coinsRef.current });
    onExitRef.current();
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!TIMED) return;
    const id = setInterval(() => {
      setSecsLeft((s) => (pausedRef.current || s <= 0 ? s : s - 1));   // clock stops during a question
    }, 1000);
    return () => clearInterval(id);
  }, [TIMED]);
  useEffect(() => {
    if (TIMED && secsLeft === 0) finishRef.current();
  }, [secsLeft, TIMED]);

  const startMode = (m) => {
    coinsRef.current = 0; setCoins(0); setStars(0);
    setResult(null); setRace(null); setChallenge(null);
    pausedRef.current = false; boostRef.current = 0; raceDoneRef.current = false;
    if (m === "race" && push && progressRef.current.raceLevel !== level) push({ ...progressRef.current, raceLevel: level });
    setMode(m);
    setRunKey((k) => k + 1);
  };

  /* open a question card. Questions rotate through topics and are remembered between drives. */
  const openQuestion = (extra, onlyTopic, avoidPrompt, tries = 0) => {
    const pick = driveQuestion(memRef.current, onlyTopic, avoidPrompt);
    pausedRef.current = true;
    setAns(undefined);
    setLocked(false);
    setFast(false);
    setReadyAt(Date.now() + readDelayMs(pick.q, tries));
    setChallenge({ ...pick, tries, ...extra });
  };
  /* while the read timer runs, tick so the countdown on the button updates */
  useEffect(() => {
    if (!challenge || locked || Date.now() >= readyAt) return undefined;
    const id = setInterval(() => setTick((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [challenge, locked, readyAt]);
  /* called from the 3D loop each time a coin is picked up */
  const onCoinRef = useRef(null);
  onCoinRef.current = (n) => {
    setCoins(n);
    if (mode === "free" && n % 5 === 0) openQuestion({ source: "coin" });   // in the race, questions come from the gates
  };
  /* called from the 3D loop when the car drives under a question gate (always on a straight) */
  onGateRef.current = (info) => openQuestion({ source: "gate", target: info });
  /* called from the 3D loop when something on the race HUD changes */
  const onRaceRef = useRef(null);
  const raceDoneRef = useRef(false);
  onRaceRef.current = (r) => {
    if (r.phase === "done" && !raceDoneRef.current) {
      raceDoneRef.current = true;
      const p = progressRef.current;
      const bk = (RACE_LEVELS.find((l) => l.id === level) || RACE_LEVELS[0]).bestKey;
      const prev = (p.raceBest || {})[bk];
      const newBest = !prev || r.time < prev.time;
      const best = newBest ? { time: r.time, place: r.place } : prev;
      if (push) {
        push({
          ...p,
          races: (p.races || 0) + 1,
          raceWins: (p.raceWins || 0) + (r.place === 1 ? 1 : 0),
          raceBest: { ...(p.raceBest || {}), [bk]: newBest ? { time: Math.round(r.time * 10) / 10, place: r.place, ts: Date.now() } : prev },
          driveBestCoins: Math.max(p.driveBestCoins || 0, coinsRef.current),
        });
      }
      setResult({ place: r.place, time: r.time, best: best.time, newBest: newBest && !!prev });
    }
    setRace(r);
  };
  const reading = !!challenge && !locked && Date.now() < readyAt;
  const checkChallenge = () => {
    if (!challenge || locked || !isAnswered(challenge.q, ans) || Date.now() < readyAt) return;
    const ok = isCorrect(challenge.q, ans);
    const firstTry = challenge.tries === 0;
    setLocked(true);
    setFast(!ok && Date.now() - readyAt < 1500);
    if (ok) {
      if (firstTry) {
        setStars((n) => n + 1);
        setFirstTries((n) => n + 1);
        streakRef.current += 1;
        if (TIMED) setSecsLeft((n) => n + 15);
        if (mode === "race") {
          const lv = RACE_LEVELS.find((l) => l.id === level) || RACE_LEVELS[0];
          const ahead = challenge.target && challenge.target.ahead;
          boostTargetRef.current = ahead || null;
          boostRef.current = ahead ? lv.boostMax : 240;        // big turbo: long enough to pass the car ahead
        }
      } else {
        if (TIMED) setSecsLeft((n) => n + 5);
        if (mode === "race") { boostTargetRef.current = null; boostRef.current = 90; }   // small push only
      }
    } else {
      streakRef.current = 0;
    }
    /* remember what was asked so the next drives rotate to new questions and weak topics */
    const m = memRef.current;
    const miss = { ...m.miss };
    miss[challenge.topic] = ok ? Math.max(0, (miss[challenge.topic] || 0) - 1) : (miss[challenge.topic] || 0) + 1;
    memRef.current = { seen: [...m.seen.filter((k) => k !== challenge.key), challenge.key].slice(-300), recent: [...m.recent, challenge.topic].slice(-8), miss };
    if (push) {
      const p = progressRef.current;
      const prev = (p.areas && p.areas["Drive challenges"]) || { right: 0, wrong: 0 };
      push({
        ...p,
        driveQ: memRef.current,
        areas: { ...(p.areas || {}), "Drive challenges": { right: prev.right + (ok ? 1 : 0), wrong: prev.wrong + (ok ? 0 : 1) } },
        correct: (p.correct || 0) + (ok ? 1 : 0),
        attempts: (p.attempts || 0) + 1,
      });
    }
  };
  /* a wrong answer never goes back to driving: it brings a different question on the same skill */
  const nextQuestion = () => {
    if (!challenge) return;
    openQuestion({ source: challenge.source, target: challenge.target }, challenge.topic, challenge.q.prompt, challenge.tries + 1);
  };
  const resume = () => {
    setChallenge(null); setAns(undefined); setLocked(false); setFast(false);
    pausedRef.current = false;
  };
  /* keyboard for the question card: digits, A–E / 1–5, Backspace, Enter */
  useEffect(() => {
    if (!challenge) return;
    function onKey(e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const q = challenge.q;
      if (e.key === "Enter") {
        e.preventDefault();
        if (locked) { if (isCorrect(q, ans)) resume(); else nextQuestion(); } else checkChallenge();
        return;
      }
      if (locked || Date.now() < readyAt) return;
      if (q.type === "entry") {
        if (/^[0-9]$/.test(e.key)) setAns((v) => (String(v ?? "").length < 6 ? String(v ?? "") + e.key : v));
        else if (e.key === "Backspace") { e.preventDefault(); setAns((v) => String(v ?? "").slice(0, -1)); }
      } else if (q.type === "mc") {
        const i = "abcde".indexOf(e.key.toLowerCase());
        const j = "12345".indexOf(e.key);
        const k = i !== -1 ? i : j;
        if (k !== -1 && k < q.options.length) setAns([k]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [challenge, ans, locked, readyAt]);

  useEffect(() => {
    if (!mode) return undefined;
    const RACE = mode === "race";
    const mount = mountRef.current;
    let width = mount.clientWidth, height = mount.clientHeight;

    const have = {};
    GARAGE_PARTS.forEach((x) => { have[x.id] = x.need(progress); });
    const picks = car.picks || {};
    const bodyColor = car.color || "#1B62E8";
    const name = (car.name || "RACER").toUpperCase().slice(0, 8);
    const RADIUS = 55;

    const HIGH = quality === "high";
    const disposables = [];                        // textures and maps to free when leaving
    const srgb = (tex) => { tex.colorSpace = THREE.SRGBColorSpace; disposables.push(tex); return tex; };
    const std = (opts) => new THREE.MeshStandardMaterial(opts);

    const scene = new THREE.Scene();

    /* sky: a soft blue gradient painted in code */
    const skyC = document.createElement("canvas");
    skyC.width = 4; skyC.height = 256;
    const sctx = skyC.getContext("2d");
    const grad = sctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#4f93e6");
    grad.addColorStop(0.42, "#a6d0f6");
    grad.addColorStop(0.5, "#e6f2fb");
    grad.addColorStop(1, "#e6f2fb");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 4, 256);
    const skyTex = srgb(new THREE.CanvasTexture(skyC));
    skyTex.mapping = THREE.EquirectangularReflectionMapping;
    scene.background = skyTex;
    scene.fog = new THREE.Fog(0xdcecf8, RACE ? 90 : 75, RACE ? 230 : 200);

    const camera = new THREE.PerspectiveCamera(58, width / height, 0.1, 500);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(HIGH ? Math.min(window.devicePixelRatio || 1, 2) : 1);
    renderer.setSize(width, height);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;   // filmic colour, like a game engine
    renderer.toneMappingExposure = 1.05;
    renderer.shadowMap.enabled = HIGH;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);
    const maxAniso = HIGH ? renderer.capabilities.getMaxAnisotropy() : 1;

    /* reflections for paint, glass and chrome, generated in code (no image files) */
    let pmrem = null;
    if (renderer.capabilities.isWebGL2) {          // very old devices skip reflections instead of breaking
      try {
        pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const envTex = pmrem.fromScene(room, 0.04).texture;
        scene.environment = envTex;
        disposables.push(envTex);
        if (room.dispose) room.dispose();
      } catch { scene.environment = null; }
    }

    scene.add(new THREE.HemisphereLight(0xd8ecff, 0x5d7a3a, 0.6));
    const sun = new THREE.DirectionalLight(0xfff0d8, 2.4);   // warm afternoon sun
    sun.position.set(30, 50, 20);
    if (HIGH) {
      sun.castShadow = true;
      sun.shadow.mapSize.set(2048, 2048);
      const sc = sun.shadow.camera;
      sc.left = -28; sc.right = 28; sc.top = 28; sc.bottom = -28; sc.near = 1; sc.far = 140;
      sun.shadow.bias = -0.0004;
      sun.shadow.normalBias = 0.03;
    }
    scene.add(sun);
    scene.add(sun.target);

    /* speckled textures for grass and asphalt, drawn in code */
    function noiseTexture(size, base, specks, count, repeat) {
      const c = document.createElement("canvas");
      c.width = c.height = size;
      const x = c.getContext("2d");
      x.fillStyle = base;
      x.fillRect(0, 0, size, size);
      for (let i = 0; i < count; i++) {
        x.fillStyle = specks[i % specks.length];
        const s = 1 + Math.random() * 2.5;
        x.fillRect(Math.random() * size, Math.random() * size, s, s);
      }
      const tex = srgb(new THREE.CanvasTexture(c));
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.repeat.set(repeat, repeat);
      tex.anisotropy = maxAniso;
      return tex;
    }
    const grassTex = noiseTexture(512, "#6aa84a", ["#5c9a3e", "#78b856", "#86c360", "#548c37", "#6fae4d"], HIGH ? 9000 : 4000, 36);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(RACE ? 500 : 400, RACE ? 500 : 400),
      std({ map: grassTex, roughness: 1, envMapIntensity: 0.25 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const dummy = new THREE.Object3D();
    const asphaltTex = noiseTexture(256, "#44484f", ["#3a3e45", "#4f535a", "#575b62", "#3f434a"], HIGH ? 5000 : 2000, 14);
    const curbRed = new THREE.Color(0xd8362a), curbWhite = new THREE.Color(0xf6f6f2);
    const LVL = RACE_LEVELS.find((l) => l.id === level) || RACE_LEVELS[0];
    const T = RACE ? raceTrack(LVL.track) : null;

    /* trees: rounded leafy ones and pines (both courses) */
    const trunkMat = std({ color: 0x7a5132, roughness: 0.9 });
    const leafMats = [0x3f8f3f, 0x4f9a3a, 0x2f7d45, 0x5aa447].map((c) => std({ color: c, roughness: 0.85 }));
    const trunkGeo = new THREE.CylinderGeometry(0.28, 0.4, 2.6, HIGH ? 12 : 8);
    const blobGeo = new THREE.IcosahedronGeometry(1.7, HIGH ? 3 : 1);
    const pineGeo = new THREE.ConeGeometry(1.9, 3.2, HIGH ? 20 : 10);
    function makeTree(x, z, i) {
      const g = new THREE.Group();
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 1.3;
      g.add(trunk);
      const m = leafMats[i % leafMats.length];
      if (i % 3 === 0) {
        [[3.0, 1], [4.4, 0.78], [5.6, 0.55]].forEach(([y, s]) => {
          const p = new THREE.Mesh(pineGeo, m); p.position.y = y; p.scale.set(s, s, s); g.add(p);
        });
      } else {
        [[0, 3.6, 1.15], [0.9, 3.1, 0.8], [-0.8, 3.2, 0.85], [0.1, 4.4, 0.75]].forEach(([dx, y, s]) => {
          const b = new THREE.Mesh(blobGeo, m); b.position.set(dx, y, dx * 0.4); b.scale.set(s, s, s); g.add(b);
        });
      }
      const sc = 0.9 + ((i * 37) % 10) / 20;
      g.scale.set(sc, sc, sc);
      g.position.set(x, 0, z);
      g.traverse((o) => { o.castShadow = HIGH; });
      return g;
    }
    const bluebonnetMesh = (n) => {
      const m = new THREE.InstancedMesh(new THREE.ConeGeometry(0.13, 0.5, 6), std({ roughness: 0.7 }), n);
      scene.add(m);
      return m;
    };
    const blues = [0x3f55d1, 0x4a63e0, 0x5a4fcf, 0x3b4cb8].map((c) => new THREE.Color(c));
    const cream = new THREE.Color(0xf4f1e6);
    /* is a spot on the figure-8 road (plus a margin)? checks every 4th centre-line point */
    const nearRoad = (x, z, margin) => {
      for (let i = 0; i < T.N; i += 4) if (Math.hypot(T.x[i] - x, T.z[i] - z) < TRACK_W / 2 + margin) return true;
      return false;
    };
    let startIdx = 0;

    if (!RACE) {
      /* ================= Coin Arena: a ring-shaped track ================= */
      const TRACK_IN = 30, TRACK_OUT = 40, TRACK_MID = 35;
      const track = new THREE.Mesh(new THREE.RingGeometry(TRACK_IN, TRACK_OUT, HIGH ? 180 : 96, 1),
        std({ map: asphaltTex, roughness: 0.92, envMapIntensity: 0.3 }));
      track.rotation.x = -Math.PI / 2;
      track.position.y = 0.02;
      track.receiveShadow = true;
      scene.add(track);

      function ringInstances(geo, mat, count, radius, y, colorFn) {
        const inst = new THREE.InstancedMesh(geo, mat, count);
        for (let i = 0; i < count; i++) {
          const ang = (i / count) * Math.PI * 2;
          dummy.position.set(Math.cos(ang) * radius, y, Math.sin(ang) * radius);
          dummy.rotation.set(0, -ang, 0);
          dummy.scale.set(1, 1, 1);
          dummy.updateMatrix();
          inst.setMatrixAt(i, dummy.matrix);
          if (colorFn) inst.setColorAt(i, colorFn(i));
        }
        inst.receiveShadow = true;
        scene.add(inst);
        return inst;
      }
      const curbN = HIGH ? 120 : 72;
      [TRACK_IN, TRACK_OUT].forEach((r) => {
        ringInstances(new THREE.BoxGeometry(0.9, 0.14, ((2 * Math.PI * r) / curbN) * 0.97),
          std({ roughness: 0.6 }), curbN, r, 0.07, (i) => (i % 2 ? curbWhite : curbRed));
      });
      ringInstances(new THREE.BoxGeometry(0.3, 0.03, 1.8), std({ color: 0xf2efe4, roughness: 0.7 }), 56, TRACK_MID, 0.04);

      /* bluebonnet patches in the grass, a nod to Texas */
      const bbN = HIGH ? 900 : 300;
      const bonnets = bluebonnetMesh(bbN);
      for (let i = 0; i < bbN; i++) {
        const clump = Math.floor(i / 12);
        const inner = clump % 2 === 0;
        const cr = inner ? 6 + ((clump * 7.3) % 20) : 42 + ((clump * 5.1) % 10);
        const ang = ((clump * 2.399) % (Math.PI * 2)) + (Math.random() - 0.5) * 0.12;
        const r = cr + (Math.random() - 0.5) * 2.2;
        const s = 0.7 + Math.random() * 0.6;
        dummy.position.set(Math.cos(ang) * r, 0.25 * s, Math.sin(ang) * r);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();
        bonnets.setMatrixAt(i, dummy.matrix);
        bonnets.setColorAt(i, i % 9 === 0 ? cream : blues[i % blues.length]);
      }

      /* traffic cones around the edge of the arena */
      const coneMat = std({ color: 0xf07a1a, roughness: 0.55 });
      const stripeMat = std({ color: 0xffffff, roughness: 0.5 });
      const coneBaseMat = std({ color: 0x2b2f36, roughness: 0.8 });
      const coneGeo = new THREE.ConeGeometry(0.55, 1.5, HIGH ? 24 : 12);
      const stripeGeo = new THREE.CylinderGeometry(0.215, 0.297, 0.22, HIGH ? 24 : 12);
      const coneBaseGeo = new THREE.BoxGeometry(1.2, 0.12, 1.2);
      for (let i = 0; i < 32; i++) {
        const ang = (i / 32) * Math.PI * 2;
        const g = new THREE.Group();
        const cBody = new THREE.Mesh(coneGeo, coneMat); cBody.position.y = 0.87;
        const stripe = new THREE.Mesh(stripeGeo, stripeMat); stripe.position.y = 0.95;
        const base = new THREE.Mesh(coneBaseGeo, coneBaseMat); base.position.y = 0.06;
        g.add(cBody, stripe, base);
        g.position.set(Math.cos(ang) * RADIUS, 0, Math.sin(ang) * RADIUS);
        g.rotation.y = ang;
        g.traverse((o) => { o.castShadow = HIGH; });
        scene.add(g);
      }
      const treeN = HIGH ? 30 : 14;
      for (let i = 0; i < treeN; i++) {
        const ang = (i / treeN) * Math.PI * 2 + Math.random() * 0.2;
        const r = 64 + Math.random() * 30;
        scene.add(makeTree(Math.cos(ang) * r, Math.sin(ang) * r, i));
      }
    } else {
      /* ================= Figure-8 Race course ================= */
      const N = T.N;
      /* the road: one ribbon along the centre line. The second pass over the crossing sits a hair higher so the two layers don't flicker. */
      const pos = new Float32Array((N + 1) * 2 * 3), uv = new Float32Array((N + 1) * 2 * 2), idx = [];
      for (let r = 0; r <= N; r++) {
        const i = r % N;
        const nx = -T.tz[i], nz = T.tx[i];
        const second = !!T.cross && i > N * 0.3 && i < N * 0.8 && Math.hypot(T.x[i], T.z[i]) < 20;
        const y = second ? 0.034 : 0.02;
        for (let s = 0; s < 2; s++) {
          const side = s ? 1 : -1, k = (r * 2 + s);
          pos[k * 3] = T.x[i] + nx * side * TRACK_W / 2;
          pos[k * 3 + 1] = y;
          pos[k * 3 + 2] = T.z[i] + nz * side * TRACK_W / 2;
          uv[k * 2] = s; uv[k * 2 + 1] = (r * T.step) / TRACK_W;
        }
        if (r < N) { const a = r * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
      }
      const roadGeo = new THREE.BufferGeometry();
      roadGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      roadGeo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
      roadGeo.setIndex(idx);
      roadGeo.computeVertexNormals();
      asphaltTex.repeat.set(1, 1);
      const road = new THREE.Mesh(roadGeo, std({ map: asphaltTex, roughness: 0.92, envMapIntensity: 0.3, side: THREE.DoubleSide }));
      road.receiveShadow = true;
      scene.add(road);

      /* red-and-white curbs down both edges (left open where the roads cross) and a dashed centre line */
      const curbIdx = [];
      for (let i = 0; i < N; i += 2) if (Math.hypot(T.x[i], T.z[i]) > 14) curbIdx.push(i);
      const curbs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.14, T.step * 2 * 0.98), std({ roughness: 0.6 }), curbIdx.length * 2);
      let ci = 0;
      curbIdx.forEach((i) => {
        const nx = -T.tz[i], nz = T.tx[i], h = Math.atan2(T.tx[i], T.tz[i]);
        [-1, 1].forEach((side) => {
          dummy.position.set(T.x[i] + nx * side * (TRACK_W / 2 + 0.35), 0.07, T.z[i] + nz * side * (TRACK_W / 2 + 0.35));
          dummy.rotation.set(0, h, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
          curbs.setMatrixAt(ci, dummy.matrix);
          curbs.setColorAt(ci, (i / 2) % 4 < 2 ? curbRed : curbWhite);
          ci++;
        });
      });
      curbs.receiveShadow = true;
      scene.add(curbs);
      const dashIdx = [];
      for (let i = 0; i < N; i += 6) if (Math.hypot(T.x[i], T.z[i]) > 9 && i > 6) dashIdx.push(i);
      const dashes = new THREE.InstancedMesh(new THREE.BoxGeometry(0.3, 0.03, 1.8), std({ color: 0xf2efe4, roughness: 0.7 }), dashIdx.length);
      dashIdx.forEach((i, k) => {
        const second = !!T.cross && i > N * 0.3 && i < N * 0.8 && Math.hypot(T.x[i], T.z[i]) < 20;
        dummy.position.set(T.x[i], second ? 0.05 : 0.04, T.z[i]);
        dummy.rotation.set(0, Math.atan2(T.tx[i], T.tz[i]), 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
        dashes.setMatrixAt(k, dummy.matrix);
      });
      scene.add(dashes);

      /* checkered start/finish line and a banner over it */
      const chk = document.createElement("canvas");
      chk.width = 128; chk.height = 32;
      const cx = chk.getContext("2d");
      for (let a = 0; a < 16; a++) for (let b = 0; b < 4; b++) { cx.fillStyle = (a + b) % 2 ? "#111" : "#fff"; cx.fillRect(a * 8, b * 8, 8, 8); }
      const chkTex = srgb(new THREE.CanvasTexture(chk));
      const h0 = Math.atan2(T.tx[startIdx], T.tz[startIdx]);
      const line = new THREE.Mesh(new THREE.PlaneGeometry(TRACK_W, 2.2), std({ map: chkTex, roughness: 0.8 }));
      line.rotation.x = -Math.PI / 2;
      const lineG = new THREE.Group();
      lineG.add(line);
      lineG.position.set(T.x[startIdx], 0.045, T.z[startIdx]);
      lineG.rotation.y = h0;
      scene.add(lineG);

      const ban = document.createElement("canvas");
      ban.width = 512; ban.height = 96;
      const bx = ban.getContext("2d");
      bx.fillStyle = "#1B62E8"; bx.fillRect(0, 0, 512, 96);
      for (let a = 0; a < 64; a++) for (let b = 0; b < 2; b++) {
        bx.fillStyle = (a + b) % 2 ? "#111" : "#fff";
        bx.fillRect(a * 8, b * 8, 8, 8); bx.fillRect(a * 8, 80 + b * 8, 8, 8);
      }
      bx.fillStyle = "#FFD21F"; bx.font = "bold 50px 'Trebuchet MS', sans-serif"; bx.textAlign = "center"; bx.textBaseline = "middle";
      bx.fillText("LEARN & RACE!", 256, 50);
      const banTex = srgb(new THREE.CanvasTexture(ban));
      const gantry = new THREE.Group();
      const postMat = std({ color: 0xdfe5ee, metalness: scene.environment ? 0.6 : 0.2, roughness: 0.35 });
      [-1, 1].forEach((side) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 7, 14), postMat);
        post.position.set(side * (TRACK_W / 2 + 1.3), 3.5, 0);
        gantry.add(post);
      });
      const banner = new THREE.Mesh(new THREE.BoxGeometry(TRACK_W + 3.4, 1.9, 0.3),
        [postMat, postMat, postMat, postMat, std({ map: banTex, roughness: 0.6 }), std({ map: banTex, roughness: 0.6 })]);
      banner.position.y = 6.6;
      gantry.add(banner);
      gantry.position.set(T.x[startIdx], 0, T.z[startIdx]);
      gantry.rotation.y = h0;
      gantry.traverse((o) => { o.castShadow = HIGH; });
      scene.add(gantry);

      /* a small grandstand on the outside of the start straight, with a cheering crowd */
      const outSide = (() => {
        const nx = -T.tz[startIdx], nz = T.tx[startIdx];
        const ax = T.x[startIdx] + nx * 10, az = T.z[startIdx] + nz * 10;
        return Math.hypot(ax, az) > Math.hypot(T.x[startIdx], T.z[startIdx]) ? 1 : -1;
      })();
      const stand = new THREE.Group();
      const standMat = std({ color: 0x9aa6b8, roughness: 0.8 });
      for (let s = 0; s < 3; s++) {
        const step = new THREE.Mesh(new THREE.BoxGeometry(22, 1 + s * 1.1, 2.2), standMat);
        step.position.set(0, (1 + s * 1.1) / 2, s * 2.2);
        stand.add(step);
      }
      const roof = new THREE.Mesh(new THREE.BoxGeometry(23, 0.3, 7.6), std({ color: 0xd8362a, roughness: 0.6 }));
      roof.position.set(0, 6.2, 2.2);
      stand.add(roof);
      [-11, 11].forEach((x) => { const p = new THREE.Mesh(new THREE.BoxGeometry(0.3, 6.2, 0.3), standMat); p.position.set(x, 3.1, 5.4); stand.add(p); });
      const crowdN = 88;
      const crowd = new THREE.InstancedMesh(new THREE.SphereGeometry(0.26, 10, 8), std({ roughness: 0.7 }), crowdN);
      const shirt = [0x1b62e8, 0xf5c518, 0xd8362a, 0x12a05a, 0x8b3fd6, 0xffffff, 0xee7b1b].map((c) => new THREE.Color(c));
      for (let k = 0; k < crowdN; k++) {
        const row = k % 3, col = Math.floor(k / 3);
        dummy.position.set(-10.3 + col * 0.72 + (Math.random() - 0.5) * 0.15, 1.3 + row * 1.1, row * 2.2 + (Math.random() - 0.5) * 0.4);
        dummy.rotation.set(0, 0, 0); dummy.scale.set(1, 1.25, 1); dummy.updateMatrix();
        crowd.setMatrixAt(k, dummy.matrix);
        crowd.setColorAt(k, shirt[(k * 5) % shirt.length]);
      }
      stand.add(crowd);
      const snx = -T.tz[startIdx] * outSide, snz = T.tx[startIdx] * outSide;
      stand.position.set(T.x[startIdx] + snx * (TRACK_W / 2 + 6), 0, T.z[startIdx] + snz * (TRACK_W / 2 + 6));
      stand.rotation.y = Math.atan2(snx, snz);
      stand.traverse((o) => { o.castShadow = HIGH; o.receiveShadow = HIGH; });
      scene.add(stand);
      stand.userData.crowd = crowd;

      /* tyre walls on the outside of the four tight bends */
      const tyreGeo = new THREE.TorusGeometry(0.55, 0.28, 8, 16);
      const tyreMat = std({ color: 0x1d2027, roughness: 0.9 });
      const bends = [];
      for (let i = 0; i < N; i++) if (T.curv[i] > 0.045 && (i % 5 === 0)) bends.push(i);
      const tyres = new THREE.InstancedMesh(tyreGeo, tyreMat, bends.length * 2);
      let ti = 0;
      bends.forEach((i) => {
        /* the outside of a bend is away from where the road turns */
        const a = (i + 6) % N;
        const turn = T.tx[i] * T.tz[a] - T.tz[i] * T.tx[a];
        const side = turn > 0 ? 1 : -1;
        const nx = -T.tz[i] * side, nz = T.tx[i] * side;
        for (let h = 0; h < 2; h++) {
          dummy.position.set(T.x[i] + nx * (TRACK_W / 2 + 3.2), 0.3 + h * 0.56, T.z[i] + nz * (TRACK_W / 2 + 3.2));
          dummy.rotation.set(Math.PI / 2, 0, 0); dummy.scale.set(1, 1, 1); dummy.updateMatrix();
          tyres.setMatrixAt(ti++, dummy.matrix);
        }
      });
      tyres.castShadow = HIGH;
      scene.add(tyres);

      /* question gates: purple arches over the straights. Driving under one opens a question. */
      const gc = document.createElement("canvas");
      gc.width = 512; gc.height = 96;
      const gx = gc.getContext("2d");
      gx.fillStyle = "#6B2FD0"; gx.fillRect(0, 0, 512, 96);
      gx.fillStyle = "#FFD21F"; gx.fillRect(0, 0, 512, 8); gx.fillRect(0, 88, 512, 8);
      gx.font = "bold 50px 'Trebuchet MS', sans-serif"; gx.textAlign = "center"; gx.textBaseline = "middle";
      gx.fillText("? QUESTION GATE ?", 256, 50);
      const gateTex = srgb(new THREE.CanvasTexture(gc));
      const gatePost = std({ color: 0xffd21f, roughness: 0.45, metalness: scene.environment ? 0.3 : 0 });
      const gateSign = std({ map: gateTex, roughness: 0.6, emissive: 0x2a0d60, emissiveIntensity: 0.4 });
      T.gates.forEach((gi) => {
        const g = new THREE.Group();
        [-1, 1].forEach((side) => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6.2, 0.5), gatePost);
          post.position.set(side * (TRACK_W / 2 + 1.1), 3.1, 0);
          g.add(post);
        });
        const bar = new THREE.Mesh(new THREE.BoxGeometry(TRACK_W + 2.8, 1.7, 0.3), [gatePost, gatePost, gatePost, gatePost, gateSign, gateSign]);
        bar.position.y = 6.4;
        g.add(bar);
        g.position.set(T.x[gi], 0, T.z[gi]);
        g.rotation.y = Math.atan2(T.tx[gi], T.tz[gi]);
        g.traverse((o) => { o.castShadow = HIGH; });
        scene.add(g);
      });

      /* bluebonnets and trees, kept off the road */
      const bbN = HIGH ? 900 : 320;
      const bonnets = bluebonnetMesh(bbN);
      let placed = 0, guard = 0, cxp = 0, czp = 0;
      while (placed < bbN && guard < 20000) {
        guard++;
        if (placed % 14 === 0) { cxp = (Math.random() - 0.5) * 230; czp = (Math.random() - 0.5) * 150; }
        const x = cxp + (Math.random() - 0.5) * 4, z = czp + (Math.random() - 0.5) * 4;
        if (nearRoad(x, z, 1.5)) { if (placed % 14 === 0) continue; continue; }
        const s = 0.7 + Math.random() * 0.6;
        dummy.position.set(x, 0.25 * s, z); dummy.rotation.set(0, 0, 0); dummy.scale.set(s, s, s); dummy.updateMatrix();
        bonnets.setMatrixAt(placed, dummy.matrix);
        bonnets.setColorAt(placed, placed % 9 === 0 ? cream : blues[placed % blues.length]);
        placed++;
      }
      bonnets.count = placed;
      const treeN = HIGH ? 46 : 22;
      let trees = 0; guard = 0;
      while (trees < treeN && guard < 3000) {
        guard++;
        const inLobe = trees % 4 === 0;
        const x = inLobe ? (trees % 8 === 0 ? 1 : -1) * (46 + (Math.random() - 0.5) * 18) : (Math.random() - 0.5) * 280;
        const z = inLobe ? (Math.random() - 0.5) * 22 : (Math.random() - 0.5) * 190;
        if (nearRoad(x, z, 7)) continue;
        if (Math.hypot(x - stand.position.x, z - stand.position.z) < 18) continue;
        scene.add(makeTree(x, z, trees));
        trees++;
      }
    }

    /* ================= the cars ================= */
    const { carGroup, wheels, flame, flagMesh } = buildCarModel({ have, picks, bodyColor, name, HIGH, hasEnv: !!scene.environment, srgb });
    const METAL = scene.environment ? 1 : 0.35;     // coins use the same metal rule as the car
    scene.add(carGroup);
    let heading = Math.PI;
    let speed = 0;

    /* computer racers — full cars, different colours */
    const rivals = [];
    const lvl = LVL;
    const GRID = [[-7, -3.2], [-7, 3.2], [-17, -3.2], [-17, 3.2]];     // [samples behind the line, lane]
    const sampleAt = (s) => {
      const f = ((s % T.N) + T.N) % T.N, i = Math.floor(f), a = (i + 1) % T.N, u = f - i;
      return {
        x: T.x[i] + (T.x[a] - T.x[i]) * u, z: T.z[i] + (T.z[a] - T.z[i]) * u,
        tx: T.tx[i] + (T.tx[a] - T.tx[i]) * u, tz: T.tz[i] + (T.tz[a] - T.tz[i]) * u, i,
      };
    };
    const wrapI = (s) => ((Math.floor(s) % T.N) + T.N) % T.N;
    let pIdx = 0, pTotal = 0, wrongFrames = 0;
    if (RACE) {
      RIVALS.forEach((r) => {
        const m = buildCarModel({
          have: { wheels: true, paint: true, lights: true, top: true, plate: true },
          picks: { wheels: "classic", top: "spoiler" }, bodyColor: r.color, name: r.name,
          HIGH, hasEnv: !!scene.environment, srgb,
        });
        scene.add(m.carGroup);
        const [back, lane] = GRID[r.slot];
        rivals.push({ ...r, g: m.carGroup, wheels: m.wheels, s: back, lane, laneT: lane, v: 0, done: false, finishT: 0, jitter: Math.random() * 10 });
      });
      const [back, lane] = GRID[3];
      const sp = sampleAt(back);
      carGroup.position.set(sp.x - sp.tz * lane, 0, sp.z + sp.tx * lane);
      heading = Math.atan2(sp.tx, sp.tz);
      pIdx = sp.i; pTotal = back;
      camera.position.set(carGroup.position.x - Math.sin(heading) * 7, 3.2, carGroup.position.z - Math.cos(heading) * 7);
      rivals.forEach((r) => {
        const q = sampleAt(r.s);
        r.g.position.set(q.x - q.tz * r.lane, 0, q.z + q.tx * r.lane);
        r.g.rotation.y = Math.atan2(q.tx, q.tz);
      });
    } else {
      carGroup.position.set(35, 0, 0);          // start on the ring, facing along it
      camera.position.set(35, 3.2, 7);
    }
    carGroup.rotation.y = heading;

    /* ---- coins: gold discs that spin and bob; drive through them to collect ---- */
    const coinGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.18, 28);
    const coinMat = std({ color: 0xffc93c, metalness: METAL, roughness: 0.22, emissive: 0x6b4a00, emissiveIntensity: scene.environment ? 0.5 : 1 });
    const coinRimGeo = new THREE.TorusGeometry(0.8, 0.08, 12, 32);
    const coinRimMat = std({ color: 0xe0a800, metalness: METAL, roughness: 0.3 });
    const coinsOnField = [];
    function spawnCoin() {
      let x = 0, z = 0, tries = 0;
      do {
        if (RACE) {
          const s = pTotal + 40 + Math.random() * T.N * 0.8;     // somewhere ahead on the road
          const q = sampleAt(s), off = (Math.random() - 0.5) * (TRACK_W - 4);
          x = q.x - q.tz * off; z = q.z + q.tx * off;
        } else {
          const ang = Math.random() * Math.PI * 2;
          const r = Math.random() < 0.6                 // most coins sit on the track
            ? 31.5 + Math.random() * 7
            : Math.sqrt(Math.random()) * (RADIUS - 8);
          x = Math.cos(ang) * r; z = Math.sin(ang) * r;
        }
        tries++;
      } while (tries < 30 && (
        Math.hypot(x - carGroup.position.x, z - carGroup.position.z) < 10 ||
        coinsOnField.some((c) => Math.hypot(x - c.position.x, z - c.position.z) < 5)));
      const g = new THREE.Group();
      const face = new THREE.Mesh(coinGeo, coinMat);
      face.rotation.x = Math.PI / 2;
      g.add(face, new THREE.Mesh(coinRimGeo, coinRimMat));
      g.traverse((o) => { o.castShadow = HIGH; });
      g.position.set(x, 1.3, z);
      g.userData.phase = Math.random() * Math.PI * 2;
      scene.add(g);
      coinsOnField.push(g);
    }
    for (let i = 0; i < (RACE ? 10 : 8); i++) spawnCoin();

    /* little sounds made in code — no sound files */
    let audioCtx = null;
    function tone(freqs, dur, vol = 0.18, type = "triangle") {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = audioCtx || new AC();
        const now = audioCtx.currentTime;
        const o = audioCtx.createOscillator(), gn = audioCtx.createGain();
        o.type = type;
        freqs.forEach((f, k) => o.frequency.setValueAtTime(f, now + k * 0.08));
        gn.gain.setValueAtTime(vol, now);
        gn.gain.exponentialRampToValueAtTime(0.001, now + dur);
        o.connect(gn); gn.connect(audioCtx.destination);
        o.start(now); o.stop(now + dur);
      } catch { /* sound is optional */ }
    }
    const ding = () => tone([880, 1320], 0.3);

    /* ---- controls ---- */
    const keys = {};
    const touch = { fwd: false, back: false, left: false, right: false };
    mount.touchState = touch;

    function onKeyDown(e) {
      if (pausedRef.current) return;          // a question is open — let the keys go to it
      const k = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d"].includes(k)) {
        keys[k] = true; e.preventDefault();
      }
    }
    function onKeyUp(e) { keys[e.key.toLowerCase()] = false; }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    let frameId;
    let t = 0;
    let perfFrames = 0, perfStart = 0, perfChecked = false;

    /* race state (lives in the loop; the HUD is told only when something changes) */
    let phase = RACE ? "countdown" : "free";
    let gateCount = 0;
    let countdown = 3.6, raceTime = 0, goFlash = 0, lastCount = 4, lastHud = "", doneOrder = 0, playerPlace = 0;
    let lastNow = performance.now();
    const tellHud = (extra = {}) => {
      if (!RACE) return;
      const place = phase === "done" ? playerPlace : 1 + rivals.filter((r) => r.done || r.s > pTotal).length;
      const lap = Math.min(RACE_LAPS, Math.max(1, Math.floor(pTotal / T.N) + 1));
      const hud = { phase, count: Math.ceil(countdown - 0.6), go: goFlash > 0, lap, place, wrong: wrongFrames > 50, boost: boostRef.current > 0, boostTo: boostTargetRef.current, gates: gateCount, ...extra };
      const sig = JSON.stringify(hud);
      if (sig !== lastHud) { lastHud = sig; if (onRaceRef.current) onRaceRef.current(hud); }
    };
    tellHud();

    function animate() {
      const now = performance.now();
      const dt = Math.min(0.1, (now - lastNow) / 1000);
      lastNow = now;
      const paused = pausedRef.current;
      if (paused) {                            // freeze everything while a question is open
        if (!RACE) speed = 0;
        Object.keys(keys).forEach((k) => { keys[k] = false; });
        touch.fwd = touch.back = touch.left = touch.right = false;
      }
      const canDrive = !paused && (!RACE || phase === "racing" || phase === "done");
      const accel = !canDrive || (RACE && phase === "done") ? 0
        : (keys["arrowup"] || keys["w"] || touch.fwd) ? 1
        : (keys["arrowdown"] || keys["s"] || touch.back) ? -1 : 0;
      const turn = !canDrive ? 0 : (keys["arrowleft"] || keys["a"] || touch.left) ? 1
        : (keys["arrowright"] || keys["d"] || touch.right) ? -1 : 0;

      if (!(RACE && paused)) {
        const boosting = RACE && boostRef.current > 0;
        speed += accel * (boosting ? 0.03 : 0.02);
        speed *= RACE && phase === "done" ? 0.97 : 0.955;
        if (Math.abs(speed) < 0.004) speed = 0;
        /* turbo is "smart": it eases off in tight bends so the car can still make the turn */
        let top = 0.45;
        if (boosting) {
          const bendNow = Math.max(T.curv[wrapI(pIdx)], T.curv[wrapI(pIdx + 20)]);
          top = Math.min(0.62, Math.max(0.42, 0.033 / Math.max(0.001, bendNow)));
        }
        speed = Math.max(-0.25, Math.min(top, speed));
        if (Math.abs(speed) > 0.01) heading += turn * 0.035 * (speed > 0 ? 1 : -1);
        if (boosting) {
          boostRef.current -= 1;
          const tgt = boostTargetRef.current && rivals.find((r) => r.name === boostTargetRef.current);
          if (tgt && pTotal > tgt.s + 12) {                  // passed them: finish the turbo gently
            boostTargetRef.current = null;
            boostRef.current = Math.min(boostRef.current, 45);
            tone([660, 990], 0.35, 0.2);
          }
          if (boostRef.current <= 0) boostTargetRef.current = null;
        }

        carGroup.position.x += Math.sin(heading) * speed;
        carGroup.position.z += Math.cos(heading) * speed;
        carGroup.rotation.y = heading;
      }

      if (!RACE) {
        const dist = Math.hypot(carGroup.position.x, carGroup.position.z);
        if (dist > RADIUS - 3) {
          const k = (RADIUS - 3) / dist;
          carGroup.position.x *= k; carGroup.position.z *= k;
          speed *= 0.4;
        }
      } else if (!paused) {
        /* where is the player on the course? */
        const nr = nearestOnTrack(T, carGroup.position.x, carGroup.position.z, pIdx);
        let d = nr.i - pIdx;
        if (d > T.N / 2) d -= T.N;
        if (d < -T.N / 2) d += T.N;
        d = Math.max(-40, Math.min(40, d));
        pTotal += d; pIdx = nr.i;
        wrongFrames = d < 0 && speed > 0.05 ? wrongFrames + 1 : Math.max(0, wrongFrames - 3);
        if (nr.dist > TRACK_W / 2 + 0.8 && Math.abs(speed) > 0.2) speed *= 0.93;   // grass slows you down
        if (nr.dist > 34) {                                                         // don't wander off the map
          const q = sampleAt(pIdx);
          carGroup.position.x += (q.x - carGroup.position.x) * 0.05;
          carGroup.position.z += (q.z - carGroup.position.z) * 0.05;
          speed *= 0.8;
        }

        if (phase === "countdown") {
          countdown -= dt;
          const c = Math.ceil(countdown - 0.6);
          if (c !== lastCount && c >= 1 && c <= 3) { lastCount = c; tone([520], 0.25, 0.2, "square"); }
          if (countdown <= 0.6) { phase = "racing"; goFlash = 1.2; tone([1040], 0.5, 0.22, "square"); }
        } else if (phase === "racing") {
          raceTime += 1 / 60;          // game time, so best times match the car's speed on any screen
          /* question gate? (two per lap, always on a straight part of the course) */
          if (gateCount < RACE_LAPS * T.gates.length) {
            const g = T.gates.length;
            const at = Math.floor(gateCount / g) * T.N + T.gates[gateCount % g];
            if (pTotal >= at) {
              gateCount += 1;
              const ahead = rivals.filter((r) => !r.done && r.s > pTotal).sort((a, b) => a.s - b.s)[0] || null;
              const place = 1 + rivals.filter((r) => r.done || r.s > pTotal).length;
              if (onGateRef.current) onGateRef.current({ place, ahead: ahead ? ahead.name : null, gate: gateCount, of: RACE_LAPS * g });
            }
          }
          if (pTotal >= RACE_LAPS * T.N) {
            phase = "done";
            doneOrder += 1;
            playerPlace = 1 + rivals.filter((r) => r.done).length;
            tone([660, 880, 1320], 0.7, 0.2);
            tellHud({ time: raceTime });
          }
        }
        if (goFlash > 0) goFlash -= dt;

        /* computer racers follow the road, slowing for tight bends */
        rivals.forEach((r) => {
          if (phase === "countdown") return;
          const bend = Math.max(T.curv[wrapI(r.s)], T.curv[wrapI(r.s + 10)], T.curv[wrapI(r.s + 22)]);
          const baseT = r.base * lvl.mult * (1 - Math.min(0.28, bend * 3.2));
          let target = baseT;
          const gap = (r.s - pTotal) / T.N;             // + ahead of the player, - behind (in laps)
          lvl.band.forEach(([th, m]) => { if (gap > th) target = baseT * m; });   // ease off when far ahead
          if (gap < -0.2) target *= lvl.catchup;         // gentle catch-up so races stay close
          else if (gap < 0) target *= lvl.behind;        // a pass the player earned mostly sticks
          if (r.done) target = 0.2;
          target *= 1 + Math.sin(t * 0.7 + r.jitter) * 0.03;
          r.v += (target - r.v) * 0.03;
          /* don't drive through the player: ease off and swing wide */
          const q0 = sampleAt(r.s);
          const px = carGroup.position.x - q0.x, pz = carGroup.position.z - q0.z;
          const along = px * q0.tx + pz * q0.tz, across = px * -q0.tz + pz * q0.tx;
          if (along > 0 && along < 7 && Math.abs(across - r.lane) < 2.6) {
            r.v *= 0.97;
            r.laneT = across > 0 ? Math.max(-4.2, across - 3.4) : Math.min(4.2, across + 3.4);
          } else if (Math.random() < 0.002) {
            r.laneT = [-3.2, 0, 3.2][Math.floor(Math.random() * 3)];
          }
          r.lane += (r.laneT - r.lane) * 0.02;
          r.s += r.v / T.step;
          if (!r.done && r.s >= RACE_LAPS * T.N) { r.done = true; doneOrder += 1; }
          const q = sampleAt(r.s);
          r.g.position.set(q.x - q.tz * r.lane, 0, q.z + q.tx * r.lane);
          r.g.rotation.y = Math.atan2(q.tx, q.tz);
          r.wheels.forEach((w) => { w.rotation.x += r.v * 4; });
          /* bump: push the player out of the way a little */
          const bx = carGroup.position.x - r.g.position.x, bz = carGroup.position.z - r.g.position.z;
          const bd = Math.hypot(bx, bz);
          if (bd < 2.6 && bd > 0.001) {
            const push = (2.6 - bd) / bd;
            carGroup.position.x += bx * push * 0.6; carGroup.position.z += bz * push * 0.6;
            speed *= 0.9;
          }
        });

        if (clockRef.current) clockRef.current.textContent = fmtRace(raceTime);
        if (perfFrames % 3 === 0) {
          const dots = dotRefs.current;
          if (dots[0]) { dots[0].setAttribute("cx", mapX(carGroup.position.x)); dots[0].setAttribute("cy", mapZ(carGroup.position.z)); }
          rivals.forEach((r, k) => {
            const el = dots[k + 1];
            if (el) { el.setAttribute("cx", mapX(r.g.position.x)); el.setAttribute("cy", mapZ(r.g.position.z)); }
          });
        }
        if (perfFrames % 10 === 0 || phase === "countdown") tellHud();
      }

      t += 0.016;
      for (let i = coinsOnField.length - 1; i >= 0; i--) {
        const c = coinsOnField[i];
        c.rotation.y += 0.05;
        c.position.y = 1.3 + Math.sin(t * 3 + c.userData.phase) * 0.2;
        if (!pausedRef.current && (!RACE || phase !== "countdown") &&
          Math.hypot(c.position.x - carGroup.position.x, c.position.z - carGroup.position.z) < 2.3) {
          scene.remove(c);
          coinsOnField.splice(i, 1);
          if (RACE && phase === "done") { spawnCoin(); continue; }
          coinsRef.current += 1;
          ding();
          if (RACE && boostRef.current < 50) boostRef.current = 50;   // coins give a tiny push in the race
          if (onCoinRef.current) onCoinRef.current(coinsRef.current);
          spawnCoin();
        }
      }

      wheels.forEach((w) => { w.rotation.x += speed * 4; });
      if (flame) flame.material.opacity = Math.abs(speed) > 0.28 ? Math.min(0.9, (Math.abs(speed) - 0.28) * 6) : 0;

      const camDist = 7, camHeight = 3.2;
      const targetCamPos = new THREE.Vector3(
        carGroup.position.x - Math.sin(heading) * camDist,
        camHeight,
        carGroup.position.z - Math.cos(heading) * camDist
      );
      camera.position.lerp(targetCamPos, 0.12);
      camera.lookAt(carGroup.position.x, 1.1, carGroup.position.z);

      sun.position.set(carGroup.position.x + 30, 50, carGroup.position.z + 20);
      sun.target.position.set(carGroup.position.x, 0, carGroup.position.z);
      if (flagMesh) flagMesh.rotation.y = Math.sin(t * 6) * 0.25;

      /* if High graphics runs slowly on this device, drop to Fast automatically (once) */
      perfFrames++;
      if (perfFrames === 1) perfStart = performance.now();
      if (!perfChecked && perfFrames === 121) {
        perfChecked = true;
        const avg = (performance.now() - perfStart) / 120;
        if (HIGH && avg > 45 && autoLowRef.current) autoLowRef.current();
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    }
    animate();

    function onResize() {
      width = mount.clientWidth; height = mount.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      try { if (audioCtx) audioCtx.close(); } catch { /* ignore */ }
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
          else obj.material.dispose();
        }
      });
      disposables.forEach((tex) => { try { tex.dispose(); } catch { /* ignore */ } });
      try { if (pmrem) pmrem.dispose(); } catch { /* ignore */ }
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quality, mode, runKey]);

  const setTouch = (key, val) => {
    if (mountRef.current && mountRef.current.touchState) mountRef.current.touchState[key] = val;
  };
  const LV = RACE_LEVELS.find((l) => l.id === level) || RACE_LEVELS[0];
  const T8 = raceTrack(LV.track);
  const TK = TRACKS[LV.track];
  const best = (progress.raceBest || {})[LV.bestKey];

  return (
    <div className="drive3d">
      <div className="drive3d-top">
        <b>🏎️ {(car.name || "RACER").toUpperCase()}</b>
        {TIMED && secsLeft !== null && (
          <span className="bd-timer-badge">⏱ {Math.floor(secsLeft / 60)}:{String(secsLeft % 60).padStart(2, "0")}</span>
        )}
        {mode && (
          <button className="btn ghost" onClick={() => { setMode(null); setResult(null); setChallenge(null); pausedRef.current = false; }}>
            🗺️ Change track
          </button>
        )}
        <button className="btn ghost" onClick={toggleQuality} title="Switch graphics quality">
          {quality === "high" ? "✨ Graphics: High" : "⚡ Graphics: Fast"}
        </button>
        <button className="btn ghost" onClick={finish}>✕ Done driving</button>
      </div>
      <div className="drive3d-mount" ref={mountRef}>
        {mode === "free" && <p className="drive3d-hint">Drive through the 🪙 coins! Every 5th coin is a challenge question.</p>}
        {mode === "race" && race && race.phase === "countdown" && race.count > 0 && (
          <div className="rc-count" key={race.count} aria-live="assertive">{race.count}</div>
        )}
        {mode === "race" && race && race.go && <div className="rc-count go" aria-live="assertive">GO!</div>}
        {mode === "race" && race && race.wrong && race.phase === "racing" && <div className="rc-wrong">↩️ Wrong way! Turn around</div>}
        {mode === "race" && race && race.boost && <div className="rc-boost">{race.boostTo ? `🔥 Turbo! Catch ${race.boostTo}!` : "🔥 Turbo boost!"}</div>}
        {gfxNote && <div className="drive3d-note">{gfxNote}</div>}
        {mode === "free" && (
          <div className="drive3d-hud">
            🪙 {coins} <span>· {5 - (coins % 5)} to next challenge</span>{stars > 0 && <> · ⭐ {stars}</>}
          </div>
        )}
        {mode === "race" && (
          <div className="rc-hud">
            <div className="rc-row">
              <span className="rc-place">{race ? placeWord(race.place) : "4th"}<small> of 4</small></span>
              <span className="rc-lap">Lap {race ? race.lap : 1}/{RACE_LAPS}</span>
            </div>
            <div className="rc-row small2">
              <span>⏱ <b ref={clockRef}>0:00.0</b></span>
              <span>🪙 {coins}{stars > 0 ? ` · ⭐ ${stars}` : ""}</span>
            </div>
            <span className="rc-tip">Drive under the purple ❓ gates. Right on the first try = turbo past the car ahead!</span>
          </div>
        )}
        {mode === "race" && (
          <svg className="rc-map" viewBox="0 0 200 120" aria-label={`Mini map of the ${TK.name} track`}>
            <path d={T8.path} fill="none" stroke="#3b3f47" strokeWidth="9" strokeLinejoin="round" />
            <path d={T8.path} fill="none" stroke="#fff" strokeWidth="1.2" strokeDasharray="3 4" opacity=".7" />
            <rect x={mapX(T8.x[0]) - 5} y={mapZ(T8.z[0]) - 2} width="10" height="4" fill="#fff" stroke="#111" strokeWidth=".8"
              transform={`rotate(${(-Math.atan2(T8.tx[0], T8.tz[0]) * 180) / Math.PI} ${mapX(T8.x[0])} ${mapZ(T8.z[0])})`} />
            {T8.gates.map((gi) => (
              <text key={gi} x={mapX(T8.x[gi])} y={mapZ(T8.z[gi]) + 3} fontSize="9" textAnchor="middle" fill="#B98CFF" fontWeight="800">?</text>
            ))}
            {RIVALS.map((r, k) => (
              <circle key={r.name} ref={(el) => { dotRefs.current[k + 1] = el; }} r="4" fill={r.css} stroke="#fff" strokeWidth="1.5" />
            ))}
            <circle ref={(el) => { dotRefs.current[0] = el; }} r="5.5" fill={car.color || "#1B62E8"} stroke="#FFD21F" strokeWidth="2.2" />
          </svg>
        )}

        {!mode && (
          <div className="rc-pick">
            <div className="rc-pickin">
              <h2>Where do you want to drive?</h2>
              <div className="rc-cards">
                <div className="rc-card race">
                  <svg viewBox="0 0 200 120" className="rc-cardmap" aria-hidden="true">
                    <path d={T8.path} fill="none" stroke={INK} strokeWidth="14" strokeLinejoin="round" />
                    <path d={T8.path} fill="none" stroke="#5d626c" strokeWidth="10" strokeLinejoin="round" />
                    <path d={T8.path} fill="none" stroke="#fff" strokeWidth="1.4" strokeDasharray="4 5" />
                    <circle cx={mapX(T8.x[0])} cy={mapZ(T8.z[0])} r="6" fill="#FFD21F" stroke={INK} strokeWidth="2" />
                  </svg>
                  <h3>🏁 {TK.name} Race</h3>
                  <p>{RACE_LAPS} laps against 3 computer cars. {TK.blurb} Each level has its own track.</p>
                  <div className="rc-levels" role="group" aria-label="How fast are the computer cars?">
                    {RACE_LEVELS.map((l) => (
                      <button key={l.id} className={`rc-lv ${level === l.id ? "on" : ""}`} aria-pressed={level === l.id} onClick={() => setLevel(l.id)}>
                        <b>{l.name}</b><span>{TRACKS[l.track].name} · {l.note}</span>
                      </button>
                    ))}
                  </div>
                  <p className="small" style={{ margin: "8px 0 10px" }}>
                    {best ? `Your best on ${TK.name}: ${fmtRace(best.time)} (${placeWord(best.place)} place)` : `No race time yet on ${TK.name}.`}
                  </p>
                  <button className="btn gold" onClick={() => startMode("race")}>🏁 Start the race</button>
                </div>
                <div className="rc-card">
                  <svg viewBox="0 0 200 120" className="rc-cardmap" aria-hidden="true">
                    <ellipse cx="100" cy="60" rx="52" ry="46" fill="none" stroke={INK} strokeWidth="18" />
                    <ellipse cx="100" cy="60" rx="52" ry="46" fill="none" stroke="#5d626c" strokeWidth="14" />
                    <ellipse cx="100" cy="60" rx="52" ry="46" fill="none" stroke="#fff" strokeWidth="1.4" strokeDasharray="4 5" />
                    {[[100, 14], [152, 60], [62, 92], [100, 60]].map(([x, y], k) => (
                      <circle key={k} cx={x} cy={y} r="7" fill="#FFD21F" stroke={INK} strokeWidth="2" />
                    ))}
                  </svg>
                  <h3>Coin Arena</h3>
                  <p>Free drive on the round track. Collect coins and answer challenge questions.</p>
                  {timeLimitSec ? <p className="small">You have {Math.round(timeLimitSec / 60)} minutes of reward driving here.</p> : null}
                  <button className="btn" onClick={() => startMode("free")}>Drive the arena</button>
                </div>
              </div>
              <p className="small rc-keys">Steer with the arrow keys or W A S D. On a tablet, use the buttons at the bottom.</p>
            </div>
          </div>
        )}

        {mode === "race" && result && (
          <div className="rc-result">
            <div className="rc-resultin">
              <div className="rc-trophy">{result.place === 1 ? "🏆" : result.place === 2 ? "🥈" : result.place === 3 ? "🥉" : "🏁"}</div>
              <h2>{result.place === 1 ? "You won the race!" : `You finished ${placeWord(result.place)}!`}</h2>
              <p className="lede" style={{ margin: "4px 0" }}>Time: <b>{fmtRace(result.time)}</b> for {RACE_LAPS} laps</p>
              <p className="small" style={{ margin: 0 }}>
                {result.newBest ? "⭐ New best time on this level!" : `Best on this level: ${fmtRace(result.best)}`}
                {firstTries > 0 ? ` · ${firstTries} right on the first try` : ""}
              </p>
              <p className="small" style={{ margin: "6px 0 14px" }}>
                {result.place === 1 && level !== "champ" ? "Ready for a faster level? Try the next one up." :
                  result.place > 1 ? "Tip: read each gate question carefully. Right on the first try gives a turbo that passes the car ahead!" : "Champion driver!"}
              </p>
              <div className="btnrow" style={{ justifyContent: "center" }}>
                <button className="btn gold" onClick={() => startMode("race")}>🔁 Race again</button>
                <button className="btn ghost" onClick={() => { setMode(null); setResult(null); }}>Change level or track</button>
                <button className="btn ghost" onClick={finish}>Done</button>
              </div>
            </div>
          </div>
        )}
      </div>
      {mode && (
        <div className="drive3d-pad">
          <button className="dpad-btn"
            onPointerDown={() => setTouch("left", true)} onPointerUp={() => setTouch("left", false)}
            onPointerLeave={() => setTouch("left", false)}>⟲</button>
          <div className="dpad-mid">
            <button className="dpad-btn"
              onPointerDown={() => setTouch("fwd", true)} onPointerUp={() => setTouch("fwd", false)}
              onPointerLeave={() => setTouch("fwd", false)}>▲</button>
            <button className="dpad-btn"
              onPointerDown={() => setTouch("back", true)} onPointerUp={() => setTouch("back", false)}
              onPointerLeave={() => setTouch("back", false)}>▼</button>
          </div>
          <button className="dpad-btn"
            onPointerDown={() => setTouch("right", true)} onPointerUp={() => setTouch("right", false)}
            onPointerLeave={() => setTouch("right", false)}>⟳</button>
        </div>
      )}
      {challenge && (() => {
        const q = challenge.q;
        const noop = () => {};
        const right = locked && isCorrect(q, ans);
        const first = challenge.tries === 0;
        const tg = challenge.target;
        const secs = Math.max(1, Math.ceil((readyAt - Date.now()) / 1000));
        const say = () => speak(plain(`${q.prompt} ${(q.options || []).map((o, i) => `${"ABCDE"[i]}. ${o}`).join(". ")}`), 0.9);
        return (
          <div className="drive3d-quiz">
            <div className="drive3d-quizin stack">
              <div className="qnum">
                {challenge.source === "gate" && tg ? `❓ Question gate ${tg.gate} of ${tg.of}` : `🪙 ${coins} coins — challenge question`} · {challenge.title}
              </div>
              {!locked && (
                <div className={`dq-goal ${first ? "" : "retry"}`}>
                  {first
                    ? (mode === "race"
                      ? (tg && tg.ahead ? `🎯 Right on the first try = turbo past ${tg.ahead} into ${placeWord(tg.place - 1)}!` : "🏆 You're in 1st! Right on the first try = turbo to stretch your lead.")
                      : TIMED ? "🎯 Right on the first try = +15 seconds of driving." : "🎯 Right on the first try = a star ⭐")
                    : "🔁 New question, same skill. Get it right to get back on the road."}
                </div>
              )}
              <div className="dq-promptrow">
                <p className="prompt" style={{ whiteSpace: "pre-line" }}><RichText text={q.prompt} onWord={noop} /></p>
                <button className="dq-say" onClick={say} aria-label="Read the question to me">🔊</button>
              </div>
              {challenge.tries > 0 && !locked && q.hint && <div className="hintbox">💡 <RichText text={q.hint} onWord={noop} /></div>}
              <div className={`dq-answers ${reading ? "reading" : ""}`} aria-disabled={reading}>
                {(q.type === "mc" || q.type === "multi") && <MC q={q} value={ans} onChange={setAns} locked={locked} onWord={noop} />}
                {q.type === "place" && <PlaceQ q={q} value={ans} onChange={setAns} locked={locked} />}
                {q.type === "inline" && <InlineQ q={q} value={ans} onChange={setAns} locked={locked} />}
                {q.type === "entry" && <EntryQ value={ans} onChange={setAns} locked={locked} />}
                {q.type === "shade" && <ShadeQ q={q} value={ans} onChange={setAns} locked={locked} />}
              </div>
              {q.type === "multi" && !locked && <div className="small">Pick exactly {q.pick || 2}.</div>}
              {locked && (
                <div className={`fb ${right ? "ok" : "no"}`}>
                  <h3>{right
                    ? (first
                      ? (mode === "race" ? (boostTargetRef.current ? `Right on the first try! 🔥 Turbo — go catch ${boostTargetRef.current}!` : "Right on the first try! 🔥 Turbo boost!")
                        : TIMED ? "Right on the first try! +15 seconds ⭐" : "Right on the first try! You earned a star ⭐")
                      : (mode === "race" ? "Right! Small boost — back on the road." : TIMED ? "Right! +5 seconds." : "Right! Back on the road."))
                    : "Not quite. Here's why —"}</h3>
                  <p><RichText text={q.exp} onWord={noop} /></p>
                  {!right && fast && <p className="dq-fast">⚡ That was a very fast answer. Read the whole question before you tap. Guesses don't earn turbo!</p>}
                  {!right && <p className="small" style={{ margin: 0 }}>Next you'll get a different question on the same skill.</p>}
                </div>
              )}
              <div className="btnrow" style={{ justifyContent: "center" }}>
                {!locked
                  ? <button className="btn" disabled={reading || !isAnswered(q, ans)} onClick={checkChallenge}>{reading ? `📖 Read first… ${secs}` : "Check"}</button>
                  : right
                    ? <button className="btn gold" onClick={resume}>🏎️ Keep driving</button>
                    : <button className="btn" onClick={nextQuestion}>🔁 Try a different question</button>}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

/* ---------------- Bolt the helper ---------------- */
function Bolt({ line, hidden, onToggle }) {
  if (hidden) {
    return (
      <button className="boltoff" onClick={onToggle}>🤖 Bring Bolt back</button>
    );
  }
  return (
    <div className="bolt">
      <span className="bface">🤖</span>
      <span className="bline">{line}</span>
      <button className="bbtn" title="Read it to me" onClick={() => speak(plain(line), 0.92)}>🔊</button>
      <button className="bbtn" title="Hide Bolt" onClick={onToggle}>✕</button>
    </div>
  );
}

/* Bolt's line depends on where you are and what's next. */
function boltLine(view, progress) {
  const np = nextPart(progress);
  const trophies = Object.keys(progress.mastered || {}).length;
  switch (view.name) {
    case "map":
      if (!progress.car || !progress.car.name) return "Welcome! Pick any challenge to start building your car. You can name it in My Garage.";
      return np ? "Pick a challenge. Finishing it builds your car, any score counts!" : "Your car is complete. Take it for a drive!";
    case "region": return "Tap any lesson card to start. Lessons with a 🏆 are done, but you can play them again.";
    case "concept": return "Follow the 3 steps: learn the goal, see how it works, then try the questions. Tap 🔊 to hear any line.";
    case "garage": return np ? `${np.emoji} ${np.name} is next. ${np.how}.` : "Every part is on. She's ready to roll!";
    case "spell": return "Hear the word, build it from letters, then put the sentence in order.";
    case "mathdrill": return "Fifteen right in one run gets you the turbo.";
    case "typing": return "Fingers on F and J. Right keys first — speed comes with practice!";
    case "timed": return "Don't freeze on a hard one. Skip it and come back.";
    case "collection": return `${trophies} of ${CONCEPTS.length} trophies so far. Every run counts, even the tricky ones.`;
    default: return "Let's build something.";
  }
}

/* ---------------- Garage showroom: the real 3D car on a turntable ----------------
   Parts that aren't earned yet show as see-through blue "blueprint" pieces. */
function GarageShowroom({ car, progress }) {
  const mountRef = useRef(null);
  const [failed, setFailed] = useState(false);
  const earnedIds = partsEarned(progress).map((p) => p.id).join(",");
  const look = JSON.stringify([car.color || "", car.name || "", car.picks || {}, earnedIds]);
  const world = useRef(null);      // { scene, HIGH, hasEnv, srgb, flag, carGroup }

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "low-power" });
    } catch {
      setFailed(true);
      return undefined;
    }
    let HIGH = true;
    try { HIGH = window.localStorage.getItem(GFX_KEY) !== "low"; } catch { /* ignore */ }
    let w = mount.clientWidth || 640, h = mount.clientHeight || 320;
    renderer.setPixelRatio(HIGH ? Math.min(window.devicePixelRatio || 1, 2) : 1);
    renderer.setSize(w, h);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.shadowMap.enabled = HIGH;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    const disposables = [];
    const srgb = (tex) => { tex.colorSpace = THREE.SRGBColorSpace; disposables.push(tex); return tex; };
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x151d2b);
    scene.fog = new THREE.Fog(0x151d2b, 11, 26);            // floor fades into the dark garage
    let pmrem = null;
    if (renderer.capabilities.isWebGL2) {
      try {
        pmrem = new THREE.PMREMGenerator(renderer);
        const room = new RoomEnvironment();
        const env = pmrem.fromScene(room, 0.04).texture;
        scene.environment = env;
        disposables.push(env);
        if (room.dispose) room.dispose();
      } catch { scene.environment = null; }
    }
    scene.add(new THREE.HemisphereLight(0xcfe0ff, 0x10151f, 0.7));
    const key = new THREE.DirectionalLight(0xffffff, 2.3);
    key.position.set(-6, 9, 7);
    if (HIGH) {
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      const sc = key.shadow.camera;
      sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 30;
      key.shadow.bias = -0.0004;
      key.shadow.normalBias = 0.03;
    }
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x6fb0ff, 1.4);    // cool blue edge light, like a showroom
    rim.position.set(6, 5, -8);
    scene.add(rim);

    const floor = new THREE.Mesh(new THREE.CircleGeometry(60, 64),
      new THREE.MeshStandardMaterial({ color: 0x1d2636, roughness: 0.55, metalness: 0.2 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.5, 0.12, 64),
      new THREE.MeshStandardMaterial({ color: 0x2c3850, roughness: 0.35, metalness: 0.5 }));
    deck.position.y = 0.06;
    deck.receiveShadow = true;
    scene.add(deck);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(3.45, 0.035, 8, 120), new THREE.MeshBasicMaterial({ color: 0x4fb3ff }));
    ring.rotation.x = Math.PI / 2;
    ring.position.y = 0.125;
    scene.add(ring);

    /* the garage around the turntable */
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(13, 13, 8, 48, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x1b2433, roughness: 0.8, side: THREE.BackSide }));
    wall.position.y = 4;
    scene.add(wall);
    const glow = new THREE.MeshBasicMaterial({ color: 0x4fb3ff });
    for (let i = 0; i < 12; i++) {                                    // vertical light strips on the wall
      const a = (i / 12) * Math.PI * 2;
      const strip = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.2, 0.12), glow);
      strip.position.set(Math.sin(a) * 12.8, 3.2, Math.cos(a) * 12.8);
      scene.add(strip);
    }
    const band = new THREE.Mesh(new THREE.TorusGeometry(12.8, 0.06, 6, 96), new THREE.MeshBasicMaterial({ color: 0xffb020 }));
    band.rotation.x = Math.PI / 2; band.position.y = 1.2;
    scene.add(band);
    const cabMat = new THREE.MeshStandardMaterial({ color: 0xc62828, roughness: 0.45, metalness: 0.3 });
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xd9dee8, roughness: 0.3, metalness: 0.8 });
    const tyreMat = new THREE.MeshStandardMaterial({ color: 0x15181e, roughness: 0.9 });
    const place = (obj, a, r) => { obj.position.set(Math.sin(a) * r, 0, Math.cos(a) * r); obj.rotation.y = a + Math.PI; scene.add(obj); };
    [2.3, 4.0].forEach((a) => {                                        // red tool cabinets with drawers
      const cab = new THREE.Group();
      const box = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.6, 0.9), cabMat); box.position.y = 0.8; cab.add(box);
      for (let d = 0; d < 4; d++) {
        const drawer = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.05, 0.05), trimMat);
        drawer.position.set(0, 0.35 + d * 0.36, 0.47); cab.add(drawer);
      }
      const top = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.08, 1.0), trimMat); top.position.y = 1.64; cab.add(top);
      cab.traverse((o) => { o.castShadow = HIGH; });
      place(cab, a, 10.2);
    });
    [1.2, 5.1].forEach((a) => {                                        // stacks of spare tyres
      const stack = new THREE.Group();
      for (let k = 0; k < 4; k++) {
        const tyre = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.26, 12, 32), tyreMat);
        tyre.rotation.x = Math.PI / 2; tyre.position.y = 0.26 + k * 0.5; stack.add(tyre);
      }
      stack.traverse((o) => { o.castShadow = HIGH; });
      place(stack, a, 10.4);
    });
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(5.5, 0.08, 0.5), new THREE.MeshBasicMaterial({ color: 0xe8f1ff }));
    lamp.position.set(0, 6.2, 0);                                        // overhead light bar
    scene.add(lamp);

    world.current = { scene, HIGH, hasEnv: !!scene.environment, srgb, flag: null, carGroup: null };
    setReady((n) => n + 1);            // let the car effect below build the car into this scene

    const camera = new THREE.PerspectiveCamera(34, w / h, 0.1, 200);
    let reduce = false;
    try { reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { /* ignore */ }
    let angle = 0.9, dragging = false, lastX = 0, idleUntil = 0, t = 0, frame = 0;
    const R = 7.4;
    function loop() {
      t += 0.016;
      if (!reduce && !dragging && performance.now() > idleUntil) angle += 0.004;   // slow turntable spin
      const fl = world.current && world.current.flag;
      if (fl) fl.rotation.y = Math.sin(t * 5) * 0.2;
      camera.position.set(Math.sin(angle) * R, 2.4, Math.cos(angle) * R);
      camera.lookAt(0, 0.8, 0);
      renderer.render(scene, camera);
      frame = requestAnimationFrame(loop);
    }
    loop();

    /* drag (mouse or finger) or arrow keys to spin the car */
    const down = (e) => { dragging = true; lastX = e.clientX; };
    const move = (e) => { if (!dragging) return; angle -= (e.clientX - lastX) * 0.01; lastX = e.clientX; };
    const up = () => { dragging = false; idleUntil = performance.now() + 2500; };
    const keys = (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        angle += e.key === "ArrowLeft" ? 0.3 : -0.3;
        idleUntil = performance.now() + 2500;
      }
    };
    mount.addEventListener("pointerdown", down);
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    mount.addEventListener("keydown", keys);
    const onResize = () => {
      w = mount.clientWidth || w; h = mount.clientHeight || h;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frame);
      mount.removeEventListener("pointerdown", down);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      mount.removeEventListener("keydown", keys);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => m.dispose());
      });
      disposables.forEach((tex) => { try { tex.dispose(); } catch { /* ignore */ } });
      try { if (pmrem) pmrem.dispose(); } catch { /* ignore */ }
      renderer.dispose();
      world.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* (re)build just the car whenever its look or earned parts change */
  const [ready, setReady] = useState(0);
  useEffect(() => {
    const wd = world.current;
    if (!wd) return;
    const have = {};
    GARAGE_PARTS.forEach((x) => { have[x.id] = x.need(progress); });
    const built = buildCarModel({
      have, picks: car.picks || {}, bodyColor: car.color || "#1B62E8",
      name: (car.name || "RACER").toUpperCase().slice(0, 8), HIGH: wd.HIGH, hasEnv: wd.hasEnv, srgb: wd.srgb, ghost: true,
    });
    built.carGroup.position.y = 0.12;
    wd.scene.add(built.carGroup);
    wd.carGroup = built.carGroup; wd.flag = built.flagMesh;
    return () => {
      wd.scene.remove(built.carGroup);
      built.carGroup.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) (Array.isArray(obj.material) ? obj.material : [obj.material]).forEach((m) => { if (m.map) m.map.dispose(); m.dispose(); });
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look, ready]);

  const earned = partsEarned(progress).length;
  const label = `Your car${car.name ? `, ${car.name}` : ""}, with ${earned} of ${GARAGE_PARTS.length} parts. Use the arrow keys to spin it.`;
  if (failed) return (
    <div className="gr-stage gr-fallback">
      <img src={ART.main_car} alt="" />
      <p>3D view isn't available on this device, but your parts are listed below.</p>
    </div>
  );
  return <div className="gr-stage" ref={mountRef} tabIndex={0} role="img" aria-label={label} />;
}

/* the style each part uses before the child picks one (matches the 3D car) */
const DEFAULT_PICK = { wheels: "classic", top: "spoiler", horn: "beep", flag: "star" };

/* ---------------- Garage screen ---------------- */
function Garage({ progress, push, go }) {
  const car = progress.car || {};
  const [name, setName] = useState(car.name || "");
  const [saved, setSaved] = useState(false);
  const earned = partsEarned(progress);
  const locked = GARAGE_PARTS.filter((p) => !p.need(progress));
  const np = nextPart(progress);
  const goal = np && np.goal ? np.goal(progress) : null;
  const npHave = goal ? Math.min(goal.have, goal.need) : 0;
  const setCar = (patch) => push({ ...progress, car: { ...car, ...patch } });
  const setPick = (partId, val) => push({ ...progress, car: { ...car, picks: { ...(car.picks || {}), [partId]: val } } });
  const canDrive = (progress.sessions || 0) >= 1;
  const paintOn = earned.some((p) => p.id === "paint");
  const badgeCounts = { gold: 0, silver: 0, bronze: 0, try: 0 };
  Object.values(progress.badges || {}).forEach((b) => { if (badgeCounts[b.tier] !== undefined) badgeCounts[b.tier]++; });
  const earnIt = (part) => go(part.goTo ? { ...part.goTo, k: Math.random() } : { name: "map" });
  const saveName = () => { setCar({ name: name || "RACER" }); setSaved(true); };
  useEffect(() => {
    if (!saved) return undefined;
    const id = setTimeout(() => setSaved(false), 2500);
    return () => clearTimeout(id);
  }, [saved]);
  const partIcon = (part) => <PartIcon id={part.id} name={car.name} />;

  return (
    <div className="gr stack">
      <header className="gr-head">
        <div>
          <h1>🔧 My Garage</h1>
          <p className="gr-sub">Build your ride by finishing activities.</p>
        </div>
        <button className="btn ghost" onClick={() => go({ name: "map" })}>← Back to challenges</button>
      </header>
      <p className="gr-how">
        <b>How to build your car:</b> Finish activities anywhere in the app to earn car parts. Any score counts.
        Score 80% or higher on a stop to earn a 🏆 trophy too.
      </p>

      <div className="gr-top">
        <section className="gr-carbox" aria-labelledby="gr-car-title">
          <div className="gr-carhead">
            <h2 id="gr-car-title">Your car{car.name ? `: ${car.name}` : ""}</h2>
            <span className="gr-count">{earned.length} of {GARAGE_PARTS.length} parts</span>
          </div>
          <GarageShowroom car={car} progress={progress} />
          <div className="gr-legend">
            <span><i className="gr-dot solid" aria-hidden="true" /> Installed</span>
            <span><i className="gr-dot ghost" aria-hidden="true" /> See-through blue = still to earn</span>
            <span className="gr-spin">Drag or use ← → to spin</span>
          </div>
          <div className="lr-nbar" aria-hidden="true"><i style={{ width: `${(earned.length / GARAGE_PARTS.length) * 100}%` }} /></div>
          <div className="gr-badges" aria-label="Badges earned">
            <span>🥇 {badgeCounts.gold}</span><span>🥈 {badgeCounts.silver}</span>
            <span>🥉 {badgeCounts.bronze}</span><span>🎯 {badgeCounts.try}</span>
          </div>
        </section>

        <aside className="gr-side">
          <div className="gr-next">
            <h2>{np ? "Next part to unlock" : "Your car is complete! 🏁"}</h2>
            {np && goal ? (
              <>
                <div className="gr-nextrow">
                  <span className="gr-picon" aria-hidden="true">{partIcon(np)}</span>
                  <div>
                    <b className="gr-nextname">{np.name}</b>
                    <span className="gr-nexthow">{np.short}{np.anyScore ? " · Any score counts!" : ""}</span>
                  </div>
                </div>
                <div className="lr-nrow">
                  <div className="lr-nbar" role="progressbar" aria-label={`Progress toward ${np.name}`}
                    aria-valuemin={0} aria-valuemax={goal.need} aria-valuenow={npHave}>
                    <i style={{ width: `${Math.round((npHave / goal.need) * 100)}%` }} />
                  </div>
                  <span className="lr-ncount">{npHave} of {goal.need}</span>
                </div>
                <button className="btn" onClick={() => earnIt(np)}>Go earn {np.name.toLowerCase()} →</button>
              </>
            ) : (
              <p>Every part is on. Take it for a spin!</p>
            )}
          </div>
          <div className="gr-drive">
            {canDrive ? (
              <button className="btn gold lr-drive" onClick={() => go({ name: "drive3d" })}>🏎️ Drive my car</button>
            ) : (
              <p><b>🔒 Driving unlocks after your first activity.</b> Finish any challenge to start driving.</p>
            )}
          </div>
        </aside>
      </div>

      <section className="card gr-custom" aria-labelledby="gr-custom-title">
        <h2 id="gr-custom-title">🎨 Customize your ride</h2>
        <div className="gr-customgrid">
          <div>
            <label className="gr-label" htmlFor="gr-name">Car name</label>
            <div className="namerow">
              <input id="gr-name" className="nameinput" value={name} maxLength={8} placeholder="RACER"
                onChange={(e) => { setName(e.target.value.replace(/[^a-zA-Z0-9 ]/g, "")); setSaved(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); saveName(); } }} />
              <button className="btn" onClick={saveName}>Save</button>
            </div>
            <p className="gr-saved" role="status" aria-live="polite">{saved ? `✓ Saved! Your car is called ${name || "RACER"}.` : ""}</p>
          </div>
          <div>
            <span className="gr-label" id="gr-paint-label">Paint colour</span>
            <div className="swatches" role="group" aria-labelledby="gr-paint-label">
              {CAR_COLORS.map(([label, hex]) => (
                <button key={hex} className={`swatch ${(car.color || "#1B62E8") === hex ? "on" : ""}`}
                  style={{ background: hex }} title={label} aria-label={label}
                  aria-pressed={(car.color || "#1B62E8") === hex} onClick={() => setCar({ color: hex })} />
              ))}
            </div>
            {!paintOn && <p className="gr-hint">🔒 Your colour shows once you earn the Paint job. You can pick it now.</p>}
          </div>
        </div>
      </section>

      <section aria-labelledby="gr-earned-title">
        <h2 id="gr-earned-title" className="gr-sechead">✅ Earned parts ({earned.length})</h2>
        {earned.length ? (
          <div className="gr-parts">
            {earned.map((part) => (
              <div key={part.id} className="gr-part got">
                <div className="gr-parthead">
                  <span className="gr-picon" aria-hidden="true">{partIcon(part)}</span>
                  <div><b>{part.name}</b><span className="gr-state">Installed ✓</span></div>
                </div>
                {part.choices && (
                  <div className="gr-styles" role="group" aria-label={`${part.name} style`}>
                    {part.choices.map(([val, label]) => {
                      const on = ((car.picks || {})[part.id] || DEFAULT_PICK[part.id]) === val;
                      return (
                        <button key={val} className={`btn ${on ? "" : "ghost"}`} aria-pressed={on}
                          onClick={() => setPick(part.id, val)}>{label}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="gr-empty">No parts yet. Finish any activity to earn your first part: wheels!</p>
        )}
      </section>

      {locked.length > 0 && (
        <section aria-labelledby="gr-locked-title">
          <h2 id="gr-locked-title" className="gr-sechead">🔒 Still to earn ({locked.length})</h2>
          <div className="gr-parts">
            {locked.map((part) => {
              const g = part.goal ? part.goal(progress) : null;
              const hv = g ? Math.min(g.have, g.need) : 0;
              const isNext = np && np.id === part.id;
              return (
                <div key={part.id} className={`gr-part locked ${isNext ? "next" : ""}`}>
                  <div className="gr-parthead">
                    <span className="gr-picon" aria-hidden="true">{partIcon(part)}</span>
                    <div>
                      <b>{part.name}</b>
                      <span className="gr-state">{isNext ? "Next up!" : "Locked"}</span>
                    </div>
                  </div>
                  <p className="gr-how2">{part.short || part.how}</p>
                  {g && (
                    <div className="lr-nrow">
                      <div className="lr-nbar small" aria-hidden="true"><i style={{ width: `${Math.round((hv / g.need) * 100)}%` }} /></div>
                      <span className="lr-ncount">{hv} of {g.need}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

/* ---------------- celebration popup ---------------- */
const CHEERS = [
  ["GREAT JOB!", "😀"], ["AWESOME!", "🤩"], ["NAILED IT!", "😎"],
  ["YOU GOT IT!", "🥳"], ["BRILLIANT!", "🌟"], ["WAY TO GO!", "🚀"],
];

function Cheer({ title, sub, emoji, onClose }) {
  const pick = React.useMemo(() => CHEERS[Math.floor(Math.random() * CHEERS.length)], []);
  const headline = title || pick[0];
  const face = emoji || pick[1];
  useEffect(() => {
    const t = setTimeout(onClose, 4000);   // gets out of the way on its own
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className="cheer" onClick={onClose}>
      <div className="cheerin" onClick={(e) => e.stopPropagation()}>
        <div className="confetti">
          {Array.from({ length: 14 }).map((_, k) => <i key={k} style={{ "--d": `${k * 0.06}s`, "--x": `${(k % 7) * 15 - 45}%` }} />)}
        </div>
        <div className="cface">{face}</div>
        <h1 className="chead">{headline}</h1>
        {sub && <p className="csub">{sub}</p>}
        <button className="btn gold" onClick={onClose}>Keep going</button>
      </div>
    </div>
  );
}

/* ---------------- Typing Speedway: learn to type, race to the finish ----------------
   Three levels. A wrong key doesn't move the cursor — it flashes red and counts as a miss,
   so accuracy = right keys ÷ all keys pressed. The clock is optional; when it's on,
   words per minute uses the standard typing-test rule (every 5 letters or spaces = 1 word). */
const TYPE_LEVELS = [
  { id: "easy", name: "Easy", note: "Three-word sentences", eg: "See Jim run.", caps: false, rounds: 5 },
  { id: "moderate", name: "Moderate", note: "Five to seven words", eg: "The red car went up the hill.", caps: true, rounds: 5 },
  { id: "hard", name: "Hard", note: "Long sentences with commas and capitals", eg: "After school, Maya raced her bike down the hill.", caps: true, rounds: 4 },
];
const TYPE_SENTENCES = {
  easy: [
    "See Jim run.", "I can hop.", "The cat sat.", "We like dogs.", "Pam can swim.", "Look at me.",
    "Go car go.", "Dad is tall.", "I see Mom.", "The dog ran.", "It is fun.", "We can play.",
    "Kim got wet.", "Run to me.", "The bus stops.", "I like red.", "Bob can jump.", "Cars go fast.",
    "My hat fell.", "She can sing.", "Fish can swim.", "The sun rose.", "Tim sat down.", "I love pizza.",
    "Ben has gum.", "Birds can fly.", "We won again.", "Stop and go.",
  ],
  moderate: [
    "The red car went very fast.", "My dog likes to play ball.", "We went to the park today.",
    "I can see the finish line.", "Mom made eggs for breakfast.", "The blue car passed the green one.",
    "Jen read a book about sharks.", "Please pass me the orange juice.", "The bell rang and we lined up.",
    "My team won the big game.", "A bird sat on the fence.", "We drove down a long road.",
    "Grandpa fixed the flat tire.", "The frog jumped into the pond.", "I packed my lunch for school.",
    "Our class planted a small garden.", "The pit crew changed four tires.", "Tom kicked the ball very far.",
    "Rain fell on the tin roof.", "We cheered for the fastest car.",
  ],
  hard: [
    "After school, Maya raced her bike down the long hill.",
    "The pit crew changed all four tires in just ten seconds.",
    "Do you know how many laps are left in this race?",
    "On Saturday, Leo and his sister built a track in the backyard.",
    "The fastest car on the track was painted bright yellow and black.",
    "When the flag waved, every driver pressed the gas pedal at once.",
    "Texas has big cities, wide deserts, and tall green pine forests.",
    "If you practice every day, your typing will get faster and faster.",
    "Can you name three animals that live in the ocean?",
    "The crowd cheered loudly as the race car crossed the finish line.",
    "Sofia packed water, crackers, and apples for the long car trip.",
    "Before the big race, the drivers checked their brakes and lights.",
    "My favorite part of the day is reading a good book at night.",
    "How far can a car travel on one full tank of gas?",
  ],
};

/* keyboard map: which finger presses each key (standard touch-typing) */
const KB_ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l", ";", "'"],
  ["z", "x", "c", "v", "b", "n", "m", ",", ".", "/"],
];
const FINGER = {
  q: "lp", a: "lp", z: "lp", w: "lr", s: "lr", x: "lr", e: "lm", d: "lm", c: "lm",
  r: "li", f: "li", v: "li", t: "li", g: "li", b: "li",
  y: "ri", h: "ri", n: "ri", u: "ri", j: "ri", m: "ri",
  i: "rm", k: "rm", ",": "rm", o: "rr", l: "rr", ".": "rr",
  p: "rp", ";": "rp", "/": "rp", "'": "rp", " ": "th",
};
const FINGER_NAME = {
  lp: "left pinky", lr: "left ring finger", lm: "left middle finger", li: "left pointer finger",
  ri: "right pointer finger", rm: "right middle finger", rr: "right ring finger", rp: "right pinky", th: "thumb",
};
/* which physical key makes a character, and whether Shift is needed */
function keyFor(ch) {
  if (ch === " ") return { key: " ", shift: false };
  if (ch === "?") return { key: "/", shift: true };
  if (ch === "\"") return { key: "'", shift: true };
  if (ch === "!") return { key: "1", shift: true };
  const lo = ch.toLowerCase();
  return { key: lo, shift: ch !== lo };
}

function pickSentences(level, n) {
  const pool = [...TYPE_SENTENCES[level]];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  return pool.slice(0, n);
}
const wpmOf = (chars, ms) => (ms > 0 ? Math.round((chars / 5) / (ms / 60000)) : 0);

function TypeIcon() {
  return (
    <svg viewBox="0 0 96 80" aria-hidden="true">
      <rect x="4" y="22" width="88" height="50" rx="9" fill="#2F6BFF" stroke={INK} strokeWidth="4" />
      <rect x="4" y="22" width="88" height="10" rx="5" fill="#8FB4FF" opacity=".55" />
      {[0, 1, 2].map((r) => Array.from({ length: 7 - (r === 2 ? 1 : 0) }).map((_, c) => (
        <rect key={`${r}${c}`} x={12 + c * 11 + (r === 1 ? 4 : r === 2 ? 9 : 0)} y={30 + r * 11} width="8.5" height="8" rx="2"
          fill={r === 1 && (c === 3 || c === 4) ? "#FFD21F" : "#fff"} stroke={INK} strokeWidth="1.6" />
      )))}
      <rect x="26" y="62" width="44" height="6" rx="2" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <g transform="translate(62 2)">
        <line x1="2" y1="0" x2="2" y2="22" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        <path d="M3 1 L 26 3 L 26 14 L 3 12 Z" fill="#fff" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="3" y="1.5" width="5.8" height="5.3" fill={INK} /><rect x="14.5" y="2.3" width="5.8" height="5.3" fill={INK} />
        <rect x="8.8" y="6.8" width="5.8" height="5.3" fill={INK} /><rect x="20.3" y="7.6" width="5.8" height="5.3" fill={INK} />
      </g>
    </svg>
  );
}

function OnScreenKeyboard({ next }) {
  const k = next ? keyFor(next) : null;
  const shiftSide = k && k.shift ? (FINGER[k.key] || "").startsWith("l") ? "right" : "left" : null;   // use the opposite hand's Shift
  return (
    <div className="ty-kb" aria-hidden="true">
      {KB_ROWS.map((row, r) => (
        <div key={r} className={`ty-kbrow r${r}`}>
          {r === 2 && <span className={`ty-key wide ${shiftSide === "left" ? "on" : ""}`}>⇧ Shift</span>}
          {row.map((c) => (
            <span key={c} className={`ty-key f-${FINGER[c]} ${k && k.key === c ? "on" : ""} ${c === "f" || c === "j" ? "bump" : ""}`}>{c.toUpperCase()}</span>
          ))}
          {r === 2 && <span className={`ty-key wide ${shiftSide === "right" ? "on" : ""}`}>Shift ⇧</span>}
        </div>
      ))}
      <div className="ty-kbrow">
        <span className={`ty-key space f-th ${k && k.key === " " ? "on" : ""}`}>space</span>
      </div>
    </div>
  );
}

function TypingGame({ progress, push, go }) {
  const [level, setLevel] = useState(() => progress.typing?.lastLevel || "easy");
  const [timed, setTimed] = useState(() => !!progress.typing?.timed);
  const [phase, setPhase] = useState("setup");        // setup | play | over
  const [lines, setLines] = useState([]);
  const [li, setLi] = useState(0);                     // which sentence
  const [pos, setPos] = useState(0);                   // cursor inside the sentence
  const [right, setRight] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [missed, setMissed] = useState({});            // character -> times missed
  const [flash, setFlash] = useState(0);               // bumps on every wrong key (restarts the shake)
  const [lastWrong, setLastWrong] = useState("");
  const [lineDone, setLineDone] = useState(false);
  const [focused, setFocused] = useState(true);
  const [now, setNow] = useState(0);
  const [showCheer, setShowCheer] = useState(true);
  const [beat, setBeat] = useState(null);
  const inputRef = useRef(null);
  const timeRef = useRef({ total: 0, lineStart: 0, chars: 0 });
  const saved = useRef(false);
  const lv = TYPE_LEVELS.find((l) => l.id === level) || TYPE_LEVELS[0];
  const stats = progress.typing || {};
  const best = stats[level] || {};

  const target = lines[li] || "";
  const totalChars = lines.reduce((n, s) => n + s.length, 0);
  const doneChars = lines.slice(0, li).reduce((n, s) => n + s.length, 0) + pos;
  const keysPressed = right + wrong;
  const acc = keysPressed ? Math.round((right / keysPressed) * 100) : 100;
  const elapsed = timeRef.current.total + (timeRef.current.lineStart && phase === "play" && !lineDone ? now - timeRef.current.lineStart : 0);
  const liveWpm = wpmOf(timeRef.current.chars + pos, elapsed);

  /* live clock while typing (only matters when the clock is on) */
  useEffect(() => {
    if (phase !== "play" || !timed) return undefined;
    const id = setInterval(() => setNow(performance.now()), 250);
    return () => clearInterval(id);
  }, [phase, timed]);

  const focusBox = () => { if (inputRef.current) inputRef.current.focus({ preventScroll: true }); };
  useEffect(() => { if (phase === "play") setTimeout(focusBox, 50); }, [phase, li]);

  const start = () => {
    saved.current = false;
    setLines(pickSentences(level, lv.rounds));
    setLi(0); setPos(0); setRight(0); setWrong(0); setMissed({}); setLastWrong(""); setLineDone(false);
    setBeat(null); setShowCheer(true);
    timeRef.current = { total: 0, lineStart: 0, chars: 0 };
    setPhase("play");
  };

  /* every keystroke arrives through the (invisible) text box, so phones and tablets work too */
  const onType = (e) => {
    const val = e.target.value;
    if (lineDone || phase !== "play") return;
    const typed = target.slice(0, pos);
    if (val.length <= typed.length) return;             // Backspace does nothing — no need to fix
    const added = val.slice(typed.length);
    let p = pos, r = 0, w = 0; const miss = { ...missed }; let lw = "";
    for (const ch of added) {
      if (p >= target.length) break;
      if (!timeRef.current.lineStart) timeRef.current.lineStart = performance.now();
      const want = target[p];
      const ok = ch === want || (!lv.caps && ch.toLowerCase() === want.toLowerCase());
      if (ok) { p++; r++; }
      else { w++; miss[want] = (miss[want] || 0) + 1; lw = ch; }
    }
    if (r) setRight((n) => n + r);
    if (w) { setWrong((n) => n + w); setMissed(miss); setFlash((f) => f + 1); setLastWrong(lw); }
    else setLastWrong("");
    setPos(p);
    if (p >= target.length) {
      const tr = timeRef.current;
      tr.total += performance.now() - (tr.lineStart || performance.now());
      tr.lineStart = 0;
      tr.chars += target.length;
      setNow(performance.now());
      setLineDone(true);
      setTimeout(() => {
        setLineDone(false);
        if (li + 1 >= lines.length) setPhase("over");
        else { setLi(li + 1); setPos(0); setLastWrong(""); }
      }, 650);
    }
  };

  /* save once when the round ends */
  useEffect(() => {
    if (phase !== "over" || saved.current) return;
    saved.current = true;
    const ms = timeRef.current.total;
    const wpm = timed ? wpmOf(timeRef.current.chars, ms) : null;
    const prev = (progress.typing || {})[level] || {};
    const rec = {
      runs: (prev.runs || 0) + 1,
      bestAcc: Math.max(prev.bestAcc || 0, acc),
      bestWpm: wpm !== null ? Math.max(prev.bestWpm || 0, wpm) : (prev.bestWpm || 0),
      lastAcc: acc,
      lastWpm: wpm !== null ? wpm : (prev.lastWpm ?? null),
    };
    const newAcc = prev.runs && acc > (prev.bestAcc || 0);
    const newWpm = wpm !== null && prev.bestWpm && wpm > prev.bestWpm;
    if (newWpm) setBeat(`${wpm} words per minute — your fastest yet!`);
    else if (newAcc) setBeat(`${acc}% accurate — your best yet on ${lv.name}!`);
    const history = [...((progress.typing || {}).history || []), { lv: level, acc, wpm, ts: Date.now() }].slice(-30);
    const p = {
      ...progress,
      sessions: (progress.sessions || 0) + 1,        // counts as a finished activity for car parts
      typing: { ...(progress.typing || {}), [level]: rec, history, lastLevel: level, timed },
      badges: awardBadge(progress, `typing_${level}`, acc),
    };
    push(p);
  }, [phase]); // eslint-disable-line

  /* ---- setup ---- */
  if (phase === "setup") {
    return (
      <div className="stack">
        <div className="hero ty-hero">
          <span className="ty-heroicon"><TypeIcon /></span>
          <div>
            <h1>Typing Speedway</h1>
            <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
              Type each sentence to drive your car to the finish line. Go for the right keys first. Speed comes with practice.
            </p>
          </div>
        </div>

        <div className="card ty-tip">
          <b>Start on the home row</b>
          <p>Rest your pointer fingers on <kbd>F</kbd> and <kbd>J</kbd>. Feel the little bumps? Your other fingers line up next to them.
            Use your thumb for the space bar.</p>
        </div>

        <h3 style={{ margin: "6px 0 0", fontSize: 19 }}>Pick a level</h3>
        <div className="stack">
          {TYPE_LEVELS.map((l) => {
            const b = stats[l.id];
            return (
              <button key={l.id} className={`stop ${level === l.id ? "done" : ""}`} onClick={() => setLevel(l.id)} aria-pressed={level === l.id}>
                <span className="badge">{level === l.id ? "✅" : l.id === "easy" ? "1" : l.id === "moderate" ? "2" : "3"}</span>
                <span className="t">
                  <b>{l.name}</b>
                  <span className="small">{l.note} · like “{l.eg}”{!l.caps ? " · capital letters optional" : ""}</span>
                  {b && b.runs ? (
                    <span className="small ty-best">Best: {b.bestAcc}% accurate{b.bestWpm ? ` · ${b.bestWpm} WPM` : ""} · {b.runs} {b.runs === 1 ? "run" : "runs"}</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>

        <label className={`ty-toggle ${timed ? "on" : ""}`}>
          <input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} />
          <span className="ty-switch" aria-hidden="true"><i /></span>
          <span>
            <b>⏱ Time me</b>
            <span className="small">Show how many words per minute (WPM) I type. Leave it off to just practice.</span>
          </span>
        </label>

        <div className="footer"><div className="in">
          <button className="btn ghost" onClick={() => go({ name: "map" })}>Back</button>
          <button className="btn gold" onClick={start}>🏁 Start typing</button>
        </div></div>
      </div>
    );
  }

  /* ---- results ---- */
  if (phase === "over") {
    const badge = badgeTier(acc);
    const wpm = timed ? wpmOf(timeRef.current.chars, timeRef.current.total) : null;
    const tricky = Object.entries(missed).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const nextLv = TYPE_LEVELS[TYPE_LEVELS.findIndex((l) => l.id === level) + 1];
    return (
      <div className="stack">
        {beat && showCheer && <Cheer emoji="⌨️" title="NEW RECORD!" sub={beat} onClose={() => setShowCheer(false)} />}
        <div className="stamp card">
          <div className="big">{acc >= 95 ? "🏆" : acc >= 80 ? "🏁" : "🔧"}</div>
          <h1 style={{ fontSize: 32, margin: "8px 0" }}>{acc}% accurate</h1>
          <div className="badgechip">{badge.emoji} {badge.label} badge earned!</div>
          <div className="ty-results">
            <div><b>{right}</b><span>keys right</span></div>
            <div><b className="r">{wrong}</b><span>missed keys</span></div>
            {wpm !== null && <div><b>{wpm}</b><span>words per minute</span></div>}
            {wpm !== null && <div><b>{fmtClock(timeRef.current.total / 1000)}</b><span>typing time</span></div>}
          </div>
          <p className="lede" style={{ color: "#4A5764", margin: "10px 0 0" }}>
            {acc >= 95 ? "Super clean typing!" : acc >= 80 ? "Nice driving! A few bumps along the way." : "Slow down a little and look for each key. Accuracy first, then speed."}
            {acc >= 90 && nextLv ? ` You're ready to try ${nextLv.name}.` : ""}
          </p>
        </div>
        {tricky.length > 0 && (
          <div className="card stack">
            <h3 style={{ margin: 0, fontSize: 19 }}>Keys to practice</h3>
            <p className="small" style={{ margin: 0 }}>These keys were missed this run. Find them on the keyboard before the next race.</p>
            <div className="wordlist">
              {tricky.map(([c, n]) => (
                <span key={c} className="chip ty-chip"><kbd>{c === " " ? "space" : c}</kbd> <b className="r">×{n}</b>
                  <span className="small">{FINGER_NAME[FINGER[keyFor(c).key]] || ""}</span></span>
              ))}
            </div>
          </div>
        )}
        <div className="btnrow">
          <button className="btn gold" onClick={start}>🔁 Type again</button>
          {acc >= 90 && nextLv && <button className="btn" onClick={() => { setLevel(nextLv.id); setPhase("setup"); }}>Try {nextLv.name}</button>}
          <button className="btn ghost" onClick={() => setPhase("setup")}>Change level</button>
          <button className="btn ghost" onClick={() => go({ name: "map" })}>Home</button>
        </div>
      </div>
    );
  }

  /* ---- typing ---- */
  const next = lineDone ? null : target[pos];
  const nk = next ? keyFor(next) : null;
  const pct = totalChars ? (doneChars / totalChars) * 100 : 0;
  return (
    <div className="stack">
      <div className="ty-road" aria-hidden="true">
        <span className="ty-lane" />
        <span className="ty-flag" />
        <span className="ty-car" style={{ left: `calc(${pct}% * 0.9)` }}>
          <svg viewBox="0 0 64 30"><path d="M4 22 L 6 14 Q 8 11 14 10 L 22 5 Q 26 3 34 3 L 42 4 Q 48 6 52 11 L 60 13 Q 62 14 62 18 L 61 22 Z" fill={progress.car?.color || "#1B62E8"} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
            <path d="M24 7 L 33 5 L 40 6 L 44 11 L 22 11 Z" fill="#BFE0FF" stroke={INK} strokeWidth="1.6" />
            <circle cx="17" cy="23" r="5.5" fill="#1d2027" stroke={INK} strokeWidth="2" /><circle cx="17" cy="23" r="2" fill="#ccd" />
            <circle cx="50" cy="23" r="5.5" fill="#1d2027" stroke={INK} strokeWidth="2" /><circle cx="50" cy="23" r="2" fill="#ccd" /></svg>
        </span>
      </div>

      <div className="smbar ty-bar">
        <span className="pill">Sentence {Math.min(li + 1, lines.length)} of {lines.length}</span>
        <span className={`pill ${acc >= 90 ? "ok" : acc >= 75 ? "" : "no"}`}>🎯 {acc}% accurate</span>
        {timed && <span className="pill timer">⏱ {fmtClock(elapsed / 1000)}</span>}
        {timed && <span className="pill gold">⚡ {liveWpm} WPM</span>}
        <button className="pill tap" onClick={() => { speak(target, 0.85); focusBox(); }} aria-label="Read the sentence out loud">🔊 Hear it</button>
      </div>

      <div className={`ty-board ${lineDone ? "done" : ""}`} onClick={focusBox}>
        <p className="ty-line" aria-label={target}>
          {target.split("").map((c, i) => {
            const cls = i < pos ? "ok" : i === pos && !lineDone ? `cur ${flash && lastWrong ? "bad" : ""}` : "todo";
            return (
              <span key={i === pos ? `c${i}-${flash}` : i} className={`ty-ch ${cls} ${c === " " ? "sp" : ""}`}>
                {c === " " ? (i === pos && !lineDone ? "␣" : "\u00A0") : c}
              </span>
            );
          })}
        </p>
        <p className="ty-help" role="status" aria-live="polite">
          {lineDone ? "✓ Nice! Next sentence…" :
            lastWrong ? `Oops — that was “${lastWrong === " " ? "space" : lastWrong}”. Find ${nk.shift ? "Shift + " : ""}${nk.key === " " ? "the space bar" : `the ${nk.key.toUpperCase()} key`} (${FINGER_NAME[FINGER[nk.key]] || "any finger"}).` :
            nk ? `Next: ${nk.key === " " ? "space bar" : `${nk.shift ? "Shift + " : ""}${nk.key.toUpperCase()}`} · ${FINGER_NAME[FINGER[nk.key]] || "any finger"}` : ""}
        </p>
        <input ref={inputRef} className="ty-input" value={target.slice(0, pos)} onChange={onType}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          autoCapitalize="off" autoCorrect="off" autoComplete="off" spellCheck={false} aria-label="Type the sentence here" />
        {!focused && !lineDone && <button className="ty-refocus" onClick={focusBox}>Tap here to keep typing</button>}
      </div>

      <OnScreenKeyboard next={next} />
      <div className="ty-legend" aria-hidden="true">
        <span className="f-lp">Pinky</span><span className="f-lr">Ring</span><span className="f-lm">Middle</span>
        <span className="f-li">Pointer</span><span className="f-th">Thumb</span>
      </div>

      <div className="footer"><div className="in">
        <button className="btn ghost" onClick={() => setPhase("over")} disabled={keysPressed === 0}>Stop</button>
        <button className="btn ghost" onClick={() => setPhase("setup")}>Change level</button>
      </div></div>
    </div>
  );
}

/* ---------------- Speed Math: timed fact drill ---------------- */
const SM_LEVELS = [
  { id: 1, name: "Single digit", note: "Numbers 1–9" },
  { id: 2, name: "Double digit", note: "Numbers 10–99" },
  { id: 3, name: "Triple digit", note: "Numbers 100–999" },
];
const rnd = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

function makeProblem(level, ops) {
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a, b;
  if (op === "×") {
    // Multiplication stays sane: the big number is only ever times a single digit.
    if (level === 1) { a = rnd(2, 9); b = rnd(2, 9); }
    else if (level === 2) { a = rnd(11, 99); b = rnd(2, 9); }
    else { a = rnd(101, 999); b = rnd(2, 9); }
    return { a, b, op, answer: a * b };
  }
  const [lo, hi] = level === 1 ? [1, 9] : level === 2 ? [10, 99] : [100, 999];
  a = rnd(lo, hi); b = rnd(lo, hi);
  if (op === "−") {
    if (b > a) { const t = a; a = b; b = t; }   // keep it positive
    return { a, b, op, answer: a - b };
  }
  return { a, b, op, answer: a + b };
}

function SpeedMath({ progress, push, go }) {
  const [level, setLevel] = useState(1);
  const [ops, setOps] = useState(["+", "−"]);
  const [secs, setSecs] = useState(60);
  const [phase, setPhase] = useState("setup");   // setup | play | over
  const [left, setLeft] = useState(60);
  const [p, setP] = useState(null);
  const [input, setInput] = useState("");
  const [flash, setFlash] = useState(null);      // null | 'ok' | 'no'
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [beat, setBeat] = useState(false);
  const [showCheer, setShowCheer] = useState(true);
  const saved = useRef(false);
  const bestKey = `sm${level}`;

  useEffect(() => {
    if (phase !== "play") return;
    if (left <= 0) { setPhase("over"); return; }
    const t = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, left]);

  useEffect(() => {
    if (phase !== "over" || saved.current) return;
    saved.current = true;
    let p = record(progress, "Speed Math", score, misses.length);
    const prev = p.speedMath?.[bestKey] || 0;
    if (score > prev && score > 0) { p.speedMath = { ...(p.speedMath || {}), [bestKey]: score }; setBeat(true); }
    const total = score + misses.length;
    p.badges = awardBadge(p, `speedmath_${bestKey}`, total > 0 ? Math.round((score / total) * 100) : 100);
    push(p);
  }, [phase]); // eslint-disable-line

  const start = () => {
    if (!ops.length) return;
    saved.current = false;
    setScore(0); setMisses([]); setStreak(0); setBestStreak(0); setBeat(false); setShowCheer(true);
    setInput(""); setFlash(null); setLeft(secs);
    setP(makeProblem(level, ops));
    setPhase("play");
  };

  const submit = () => {
    if (input === "" || flash) return;
    const right = Number(input) === p.answer;
    if (right) {
      setScore((s) => s + 1);
      setStreak((s) => { const n = s + 1; setBestStreak((b) => Math.max(b, n)); return n; });
      setFlash("ok");
    } else {
      setMisses((m) => [...m, `${p.a} ${p.op} ${p.b} = ${p.answer}`]);
      setStreak(0);
      setFlash("no");
    }
    setTimeout(() => {
      setFlash(null); setInput("");
      setP(makeProblem(level, ops));
    }, right ? 350 : 1400);
  };

  /* physical keyboard support during play, alongside the tap pad */
  useEffect(() => {
    if (phase !== "play") return;
    function onKeyDown(e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (flash) return;
      if (e.key === "Enter") e.preventDefault();
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        setInput((v) => (v.length < 6 ? v + e.key : v));
      } else if (e.key === "Backspace") {
        e.preventDefault();
        setInput((v) => v.slice(0, -1));
      } else if (e.key === "Delete" || e.key === "Escape") {
        setInput("");
      } else if (e.key === "Enter") {
        submit();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [phase, flash, input, p, level, ops]);

  const toggleOp = (o) =>
    setOps((cur) => (cur.includes(o) ? (cur.length > 1 ? cur.filter((x) => x !== o) : cur) : [...cur, o]));

  /* ---- setup ---- */
  if (phase === "setup") {
    return (
      <div className="stack">
        <div className="hero">
          <h1>⚡ Speed Math</h1>
          <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
            As many as you can before the clock runs out. Wrong answers show you the right one and keep going.
          </p>
        </div>

        <h3 style={{ margin: "6px 0 0", fontSize: 19 }}>How big are the numbers?</h3>
        <div className="stack">
          {SM_LEVELS.map((l) => (
            <button key={l.id} className={`stop ${level === l.id ? "done" : ""}`} onClick={() => setLevel(l.id)}>
              <span className="badge">{level === l.id ? "✅" : l.id}</span>
              <span className="t"><b>{l.name}</b><span className="small">{l.note}</span></span>
            </button>
          ))}
        </div>

        <h3 style={{ margin: "6px 0 0", fontSize: 19 }}>Which operations?</h3>
        <div className="btnrow">
          {["+", "−", "×"].map((o) => (
            <button key={o} className={`btn ${ops.includes(o) ? "" : "ghost"}`} onClick={() => toggleOp(o)}
              style={{ minWidth: 78, fontSize: 26 }}>{o}</button>
          ))}
        </div>
        {ops.includes("×") && level === 3 && (
          <p className="small">Heads up: triple-digit multiplying is past third grade. It'll be 3 digits times 1 digit.</p>
        )}

        <h3 style={{ margin: "6px 0 0", fontSize: 19 }}>How long?</h3>
        <div className="btnrow">
          {[60, 120, 180].map((t) => (
            <button key={t} className={`btn ${secs === t ? "" : "ghost"}`} onClick={() => setSecs(t)}>
              {t / 60} min
            </button>
          ))}
        </div>

        <div className="small" style={{ marginTop: 8 }}>
          Best at {SM_LEVELS.find((l) => l.id === level).name.toLowerCase()}: {progress.speedMath?.[bestKey] || 0} correct
        </div>

        <div className="footer"><div className="in">
          <button className="btn ghost" onClick={() => go({ name: "map" })}>Back</button>
          <button className="btn" onClick={start}>Start the clock</button>
        </div></div>
      </div>
    );
  }

  /* ---- results ---- */
  if (phase === "over") {
    const total = score + misses.length;
    const pct = total > 0 ? Math.round((score / total) * 100) : 100;
    const badge = badgeTier(pct);
    return (
      <div className="stack">
        {beat && showCheer && (
          <Cheer emoji="⚡" title="NEW RECORD!" sub={`${score} right — your best yet at this level.`}
            onClose={() => setShowCheer(false)} />
        )}
        <div className="stamp card">
          <div className="big">⚡</div>
          <h1 style={{ fontSize: 32, margin: "8px 0" }}>{score} right, {misses.length} wrong — {pct}%</h1>
          <div className="badgechip">{badge.emoji} {badge.label} badge earned!</div>
          <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
            Best streak in a row: {bestStreak}. {score > (progress.speedMath?.[bestKey] || 0) ? "That's a new record." : ""}
          </p>
        </div>
        {misses.length > 0 && (
          <div className="card stack">
            <h3 style={{ margin: 0, fontSize: 19 }}>Worth another look</h3>
            <div className="wordlist">
              {misses.slice(0, 12).map((m, k) => <span key={k} className="chip">{m}</span>)}
            </div>
          </div>
        )}
        <div className="btnrow">
          <button className="btn" onClick={start}>Run it again</button>
          <button className="btn ghost" onClick={() => setPhase("setup")}>Change settings</button>
          <button className="btn ghost" onClick={() => go({ name: "map" })}>Back to zones</button>
        </div>
      </div>
    );
  }

  /* ---- playing ---- */
  return (
    <div className="stack">
      <div className="smbar">
        <span className={`pill timer ${left < 15 ? "low" : ""}`}>⏱ {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}</span>
        <span className="pill">✅ {score}</span>
        <span className="pill gold">🔥 {streak}</span>
      </div>

      <div className={`smcard ${flash === "ok" ? "ok" : flash === "no" ? "no" : ""}`}>
        <div className="smprob">{p.a} {p.op} {p.b}</div>
        <div className="smanswer">{flash === "no" ? p.answer : (input === "" ? "?" : input)}</div>
        {flash === "no" && <div className="smnote">The answer was {p.answer}</div>}
      </div>

      <div className="pad" style={{ justifyContent: "center", margin: "0 auto" }}>
        {["1","2","3","4","5","6","7","8","9","C","0","⌫"].map((k) => (
          <button key={k} disabled={!!flash} onClick={() => {
            if (k === "C") setInput("");
            else if (k === "⌫") setInput(input.slice(0, -1));
            else if (input.length < 6) setInput(input + k);
          }}>{k}</button>
        ))}
      </div>

      <div className="footer"><div className="in">
        <button className="btn ghost" onClick={() => setPhase("over")}>Stop</button>
        <button className="btn" disabled={input === "" || !!flash} onClick={submit}>Enter</button>
      </div></div>
    </div>
  );
}

/* ---------------- collection: stats + every trophy ---------------- */
/* Sprint (worksheet drill) records live in their own storage key so the main
   progress save never overwrites them. The 🏁 Sprint panel writes them. */
const SPRINT_KEY = "brickdash-sprints-v1";
function loadSprintRecords() {
  try { return JSON.parse(window.localStorage.getItem(SPRINT_KEY) || "{}") || {}; } catch { return {}; }
}
function saveSprintRecords(s) {
  try { window.localStorage.setItem(SPRINT_KEY, JSON.stringify(s)); } catch { /* ignore */ }
}
const fmtClock = (sec) => { const s = Math.max(0, Math.round(sec)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const sprintLabel = (r) => `${r.op === "×" ? "Multiply by" : r.op === "−" ? "Subtract with" : "Add by"} ${r.n} · ${r.count} problems`;

function Collection({ progress, push, go }) {
  const [sprints, setSprints] = useState(() => loadSprintRecords());
  useEffect(() => {
    const refresh = () => setSprints(loadSprintRecords());
    window.addEventListener("brickdash-sprints-updated", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("brickdash-sprints-updated", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);
  const sprintRows = Object.values(sprints).filter((r) => r && typeof r.bestSec === "number").sort((a, b) => a.bestSec - b.bestSec);
  const fastestSprint = sprintRows[0];
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const mastered = Object.keys(progress.mastered || {}).length;
  const acc = progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0;
  const zonesCleared = REGIONS.filter((r) => conceptsIn(r.id).every((c) => progress.mastered?.[c.id])).length;

  const exportBackup = () => {
    try {
      const blob = new Blob([JSON.stringify({ ...progress, sprintRecords: loadSprintRecords() }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `learn-and-race-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMsg("Backup saved. Keep it somewhere safe.");
    } catch { setMsg("Couldn't save the backup file here."); }
  };

  const importBackup = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(String(r.result));
        if (typeof d !== "object" || d === null) throw new Error("bad shape");
        const { sprintRecords, ...rest } = d;
        if (sprintRecords && typeof sprintRecords === "object") { saveSprintRecords(sprintRecords); setSprints(sprintRecords); }
        push({ ...blank, ...rest });
        setMsg("Progress restored from backup.");
      } catch { setMsg("That file couldn't be read as a Learn & Race backup."); }
    };
    r.onerror = () => setMsg("Couldn't read that file.");
    r.readAsText(f);
    e.target.value = "";
  };

  return (
    <div className="stack">
      <div className="hero">
        <h1>🏆 Your trophy case</h1>
        <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
          Everything you've won so far. Trophies stay saved, even if you close the app.
        </p>
      </div>

      <div className="stats">
        <div className="stat"><b>{mastered}</b><span>of {CONCEPTS.length} trophies</span></div>
        <div className="stat"><b>{zonesCleared}</b><span>of 6 zones cleared</span></div>
        <div className="stat"><b>{progress.correct || 0}</b><span>questions right</span></div>
        <div className="stat"><b>{acc}%</b><span>correct overall</span></div>
        <div className="stat"><b>{progress.bestTimed || 0}</b><span>best Speed Run</span></div>
        <div className="stat"><b>{fastestSprint ? fmtClock(fastestSprint.bestSec) : "—"}</b><span>best Sprint time</span></div>
        <div className="stat"><b>{progress.driveBestCoins || 0}</b><span>most coins in one drive</span></div>
        <div className="stat"><b>{progress.raceWins || 0}</b><span>races won ({progress.races || 0} raced)</span></div>
        <div className="stat"><b>{Object.keys(progress.seen || {}).length}</b><span>stops tried</span></div>
        <div className="stat"><b>{Object.keys(progress.words || {}).length}</b><span>sight words spelled</span></div>
      </div>

      <h3 style={{ margin: "16px 0 0", fontSize: 21 }}>Right and wrong by activity</h3>
      <div className="table">
        <div className="tr th"><span>Activity</span><span>Right</span><span>Wrong</span><span>Correct</span></div>
        {["Concept stops", "Speed Run", "Speed Math", "Word Forge", "Drive challenges"].map((a) => {
          const d = (progress.areas || {})[a] || { right: 0, wrong: 0 };
          const tot = d.right + d.wrong;
          return (
            <div className="tr" key={a}>
              <span>{a}</span>
              <span className="g">{d.right}</span>
              <span className="r">{d.wrong}</span>
              <span>{tot ? Math.round((d.right / tot) * 100) + "%" : "—"}</span>
            </div>
          );
        })}
        <div className="tr tf">
          <span>Everything</span>
          <span className="g">{progress.correct || 0}</span>
          <span className="r">{Math.max(0, (progress.attempts || 0) - (progress.correct || 0))}</span>
          <span>{progress.attempts ? Math.round(((progress.correct || 0) / progress.attempts) * 100) + "%" : "—"}</span>
        </div>
      </div>

      <h3 style={{ margin: "16px 0 0", fontSize: 21 }}>🏁 Sprint best times</h3>
      {sprintRows.length ? (
        <div className="table">
          <div className="tr th"><span>Sprint</span><span>Best time</span><span>Right</span><span>Under 2:00?</span></div>
          {sprintRows.map((r) => (
            <div className="tr" key={`${r.op}_${r.n}_${r.count}`}>
              <span>{sprintLabel(r)}</span>
              <span><b>{fmtClock(r.bestSec)}</b></span>
              <span className="g">{r.bestCorrect ?? "—"}/{r.count}</span>
              <span>{r.bestSec <= 120 ? "✅ Yes" : "Not yet"}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="small" style={{ margin: 0 }}>
          No sprint times yet. Tap 🏁 Sprint in the corner. Finish every problem with 80% or more right to set a best time.
        </p>
      )}

      <h3 style={{ margin: "16px 0 0", fontSize: 21 }}>⌨️ Typing Speedway</h3>
      {(() => {
        const ty = progress.typing || {};
        const rows = TYPE_LEVELS.filter((l) => ty[l.id] && ty[l.id].runs);
        if (!rows.length) return <p className="small" style={{ margin: 0 }}>No typing runs yet. Find Typing Speedway under More ways to play.</p>;
        const recent = (ty.history || []).slice(-8).reverse();
        return (
          <>
            <div className="table">
              <div className="tr th"><span>Level</span><span>Best accuracy</span><span>Best WPM</span><span>Last run</span></div>
              {rows.map((l) => {
                const d = ty[l.id];
                return (
                  <div className="tr" key={l.id}>
                    <span>{l.name} · {d.runs} {d.runs === 1 ? "run" : "runs"}</span>
                    <span className="g"><b>{d.bestAcc}%</b></span>
                    <span>{d.bestWpm ? d.bestWpm : "—"}</span>
                    <span>{d.lastAcc}%{d.lastWpm ? ` · ${d.lastWpm} WPM` : ""}</span>
                  </div>
                );
              })}
            </div>
            {recent.length > 1 && (
              <p className="small" style={{ margin: "6px 0 0" }}>
                Recent runs (newest first): {recent.map((h) => `${h.acc}%${h.wpm ? `/${h.wpm}wpm` : ""}`).join(", ")}
              </p>
            )}
          </>
        );
      })()}

      <h3 style={{ margin: "16px 0 0", fontSize: 21 }}>🏁 Race best times</h3>
      {(() => {
        const rb = progress.raceBest || {};
        const rows = RACE_LEVELS.filter((l) => rb[l.bestKey]);
        const drv = (progress.areas || {})["Drive challenges"];
        const miss = (progress.driveQ && progress.driveQ.miss) || {};
        const weak = Object.entries(miss).filter(([, n]) => n > 0).sort((x, y) => y[1] - x[1]).slice(0, 4)
          .map(([id]) => (DRIVE_TOPICS.find((t) => t.id === id) || CONCEPTS.find((c) => `c:${c.id}` === id) || { title: id }).title);
        return (
          <>
            {rows.length ? (
              <div className="table">
                <div className="tr th"><span>Level · track</span><span>Best time</span><span>Place</span><span></span></div>
                {rows.map((l) => (
                  <div className="tr" key={l.id}>
                    <span>{l.name} · {TRACKS[l.track].name}</span><span><b>{fmtRace(rb[l.bestKey].time)}</b></span>
                    <span>{placeWord(rb[l.bestKey].place)}</span><span>{rb[l.bestKey].place === 1 ? "🏆" : ""}</span>
                  </div>
                ))}
              </div>
            ) : <p className="small" style={{ margin: 0 }}>No races yet. Tap Drive my car, then pick a race level.</p>}
            {drv && weak.length ? <p className="small" style={{ margin: "6px 0 0" }}>Drive questions that need more practice: <b>{weak.join(", ")}</b>. These come up more often until they're right.</p> : null}
          </>
        );
      })()}

      <h3 style={{ margin: "16px 0 0", fontSize: 21 }}>Every stop</h3>
      {REGIONS.map((r) => {
        const cs = conceptsIn(r.id);
        return (
          <div key={r.id} className="stack" style={{ marginTop: 6 }}>
            <h3 style={{ margin: "10px 0 0", fontSize: 21 }}>{r.icon} {r.name}</h3>
            <div className="shelf">
              {cs.map((c) => {
                const got = !!progress.mastered?.[c.id];
                const best = progress.best?.[c.id];
                const st = (progress.stop || {})[c.id] || { right: 0, wrong: 0, runs: 0 };
                return (
                  <button key={c.id} className={`trophy ${got ? "got" : ""}`} style={{ "--rc": r.rc }}
                    onClick={() => go({ name: "concept", cid: c.id })}>
                    <span className="bi">{got ? "🏆" : c.icon}</span>
                    <span className="bt">{c.title}</span>
                    <span className="bs">
                      {got ? "Collected" : best !== undefined ? `Best ${best}/5 — try again` : "Not started"}
                    </span>
                    {st.runs > 0 && (
                      <span className="bs"><span className="g">{st.right} right</span> · <span className="r">{st.wrong} wrong</span> · {st.runs} {st.runs === 1 ? "run" : "runs"}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {(() => {
        const tricky = Object.entries(progress.wordStats || {})
          .filter(([, d]) => d.wrong > 0)
          .sort((a, b) => b[1].wrong - a[1].wrong)
          .slice(0, 16);
        if (!tricky.length) return null;
        return (
          <div className="card stack" style={{ marginTop: 14 }}>
            <h3 style={{ margin: 0, fontSize: 19 }}>Words worth practising again</h3>
            <p className="small" style={{ margin: 0 }}>Missed most often. Tap one to hear it.</p>
            <div className="wordlist">
              {tricky.map(([w, d]) => (
                <span key={w} className="chip" onClick={() => speak(w, 0.92)}>{w} <b className="r">×{d.wrong}</b></span>
              ))}
            </div>
          </div>
        );
      })()}

      <div className="card stack" style={{ marginTop: 14 }}>
        <h3 style={{ margin: 0, fontSize: 19 }}>Backup</h3>
        <p className="small" style={{ margin: 0 }}>
          Progress saves automatically on this device. Save a backup file if you want to move it to
          another device, or keep a copy in case the browser data gets cleared.
        </p>
        <div className="btnrow">
          <button className="btn ghost" onClick={exportBackup}>Save backup file</button>
          <button className="btn ghost" onClick={() => fileRef.current && fileRef.current.click()}>Restore from backup</button>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json" onChange={importBackup} style={{ display: "none" }} />
        {msg && <p className="small" style={{ margin: 0, fontWeight: 800, color: "var(--bluebonnet)" }}>{msg}</p>}
      </div>

      <div className="card stack" style={{ marginTop: 14 }}>
        <h3 style={{ margin: 0, fontSize: 19 }}>Start over</h3>
        <p className="small" style={{ margin: 0 }}>
          Clears every trophy and all scores. There's no undo.
        </p>
        {confirmReset ? (
          <div className="btnrow">
            <button className="btn" style={{ background: "var(--clay)", boxShadow: "0 4px 0 #9E2519" }}
              onClick={() => { push({ ...blank }); saveSprintRecords({}); setSprints({}); setConfirmReset(false); go({ name: "map" }); }}>
              Yes, erase everything
            </button>
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>Keep my trophies</button>
          </div>
        ) : (
          <button className="btn ghost" onClick={() => setConfirmReset(true)}>Reset progress</button>
        )}
      </div>
    </div>
  );
}

/* ---------------- region ---------------- */
/* ---------------- lesson overview content (display only) ----------------
   blurb: one line for the lesson card · objective: the goal in one sentence
   skills: badge labels shown to the child · remember: a quick memory helper */
const OVERVIEW = {
  placevalue: { blurb: "Learn what each digit is worth and break numbers into parts.",
    objective: "Learn how the value of a digit depends on where it sits in a number.",
    skills: ["Place value", "Expanded form", "Number sense"],
    remember: "A digit's value changes with its place. The 7 in 4,706 is worth 700." },
  expnotation: { blurb: "Write numbers as digit × place value, like (4 × 1,000).",
    objective: "Learn to write a number as each digit times its place value.",
    skills: ["Expanded notation", "Place value", "Form vs. notation"],
    remember: "Expanded notation has × signs. Expanded form just adds the values." },
  compare: { blurb: "Decide which number is bigger and round to friendly numbers.",
    objective: "Compare numbers place by place and round them to the nearest 10 or 100.",
    skills: ["Comparing numbers", "Greater and less than", "Rounding"],
    remember: "Start at the biggest place. The first place that's different decides." },
  fractions: { blurb: "Read fractions, find them on a number line, and spot equal ones.",
    objective: "Understand what the top and bottom numbers of a fraction tell you.",
    skills: ["Fractions", "Number lines", "Equivalent fractions"],
    remember: "More pieces means smaller pieces. 1/8 is smaller than 1/4." },
  addsub: { blurb: "Add and subtract to 1,000 and solve two-step word problems.",
    objective: "Solve one- and two-step problems by finding the hidden middle number.",
    skills: ["Adding and subtracting", "Two-step problems", "Checking answers"],
    remember: "Two steps? Find the middle number first, then answer the question." },
  mult: { blurb: "See multiplying as equal groups and arrays.",
    objective: "Understand multiplying as equal groups, arrays, and \"times as many.\"",
    skills: ["Multiplying", "Arrays", "Equal groups"],
    remember: "7 × 6 means 7 groups with 6 in each." },
  div: { blurb: "Share things out equally and find missing factors.",
    objective: "Understand dividing as fair sharing and use multiplication facts to divide.",
    skills: ["Dividing", "Fact families", "Missing factors"],
    remember: "Stuck dividing? Flip it: 56 ÷ 8 is the same as 8 × ? = 56." },
  tables: { blurb: "Find the hidden rule in an input-output table.",
    objective: "Find the rule in a table and test it on every row.",
    skills: ["Patterns", "Input-output tables", "Testing a rule"],
    remember: "A rule has to work on every row, not just the first one." },
  shapes: { blurb: "Sort flat and solid shapes by sides, corners, and faces.",
    objective: "Sort shapes by what they have: sides, corners, and faces.",
    skills: ["2D shapes", "3D shapes", "Quadrilaterals"],
    remember: "Any shape with exactly 4 straight sides is a quadrilateral." },
  area: { blurb: "Find how many square units cover a shape.",
    objective: "Find area by counting squares or multiplying rows by squares in each row.",
    skills: ["Area", "Rows × columns", "Square units"],
    remember: "Area fills the inside. It's measured in square units." },
  perimeter: { blurb: "Add every side to measure the distance around.",
    objective: "Find the perimeter of a shape and work out a missing side.",
    skills: ["Perimeter", "Adding lengths", "Missing sides"],
    remember: "Perimeter goes around the outside. Area fills the inside." },
  measure: { blurb: "Add and subtract time and pick the right unit.",
    objective: "Add and subtract time, and choose units for liquid and weight.",
    skills: ["Elapsed time", "Liquid volume", "Weight"],
    remember: "Count forward in time: whole hours first, then minutes." },
  graphs: { blurb: "Read bar graphs, pictographs, and dot plots carefully.",
    objective: "Read graphs correctly by checking the scale and the key first.",
    skills: ["Bar graphs", "Pictographs", "Dot plots"],
    remember: "Check the scale and the key before you read any bar or picture." },
  money: { blurb: "Count coins and bills and learn about saving and borrowing.",
    objective: "Count money and tell earning, saving, spending, and borrowing apart.",
    skills: ["Counting money", "Saving", "Borrowing"],
    remember: "Count coins from biggest to smallest." },
  vocab: { blurb: "Use clues and word parts to figure out new words.",
    objective: "Figure out new words using context clues and word parts.",
    skills: ["Context clues", "Word parts", "Synonyms and homophones"],
    remember: "Read the sentences around a new word. The clues are usually there." },
  infer: { blurb: "Make smart guesses from clues and prove them with the text.",
    objective: "Make inferences and back them up with evidence from the text.",
    skills: ["Inferring", "Text evidence", "Theme"],
    remember: "Clues from the text + what you already know = an inference." },
  infotext: { blurb: "Tell texts that teach apart from texts that try to convince.",
    objective: "Find the central idea or claim, and tell facts from opinions.",
    skills: ["Central idea", "Claims and reasons", "Fact vs. opinion"],
    remember: "Ask: is the author teaching me, or trying to convince me?" },
  craft: { blurb: "Find the author's purpose and notice word choices.",
    objective: "Figure out why the author wrote something and how word choices help.",
    skills: ["Author's purpose", "Figurative language", "Point of view"],
    remember: "Authors write to inform, persuade, or entertain." },
  grammar: { blurb: "Fix sentences so they sound and look right.",
    objective: "Edit sentences for subject-verb agreement, punctuation, and capitals.",
    skills: ["Editing", "Subject-verb agreement", "Punctuation"],
    remember: "Read the sentence in your head. Your ear catches most mistakes." },
  revise: { blurb: "Make writing clearer, cut what doesn't belong, and end strong.",
    objective: "Revise writing to make it clearer and stronger.",
    skills: ["Revising", "Staying on topic", "Strong endings"],
    remember: "Editing fixes mistakes. Revising makes good writing better." },
};

/* labeled 3-step tracker shown on every lesson stage */
const STAGE_LABELS = ["Learn the goal", "See how it works", "Try the questions"];
function StageTrack({ stage }) {
  return (
    <ol className="ls-track" aria-label="Lesson steps">
      {STAGE_LABELS.map((label, i) => {
        const n = i + 1;
        const state = n < stage ? "done" : n === stage ? "now" : "next";
        return (
          <li key={n} className={`ls-tstep ${state}`} aria-current={n === stage ? "step" : undefined}>
            <span className="ls-tnum" aria-hidden="true">{n < stage ? "✓" : n}</span>
            <span className="ls-tlabel">{label}{n < stage && <span className="sr-only"> (done)</span>}</span>
          </li>
        );
      })}
    </ol>
  );
}
const stopSpeech = () => { try { if (window.speechSynthesis) window.speechSynthesis.cancel(); } catch { /* ignore */ } };

function RegionView({ rid, progress, go }) {
  const r = REGIONS.find((x) => x.id === rid);
  const cs = conceptsIn(rid);
  const trophies = cs.filter((c) => progress.mastered?.[c.id]).length;
  return (
    <div className="zn stack" style={{ "--rc": r.rc, "--rcfg": r.fg || "#fff" }}>
      <header className="zn-head">
        {r.art && ART[r.art] && <img className="zn-art" src={ART[r.art]} alt="" />}
        <div className="zn-headtext">
          <h1>{r.name}</h1>
          <p className="zn-topic">{r.sub}</p>
        </div>
      </header>
      <p className="zn-intro">
        Pick a lesson to start learning. Each lesson has 3 parts: learn the goal, see how it works, then try 5 questions.
      </p>

      <div className="zn-layout">
        <aside className="zn-about" aria-labelledby="zn-about-title">
          <h2 id="zn-about-title">About this zone</h2>
          <dl className="zn-facts">
            <div><dt>Learn zone</dt><dd>{r.icon} {r.name}</dd></div>
            <div><dt>Topic</dt><dd>{r.sub}</dd></div>
            <div><dt>Trophies</dt><dd>🏆 {trophies} of {cs.length} earned</dd></div>
          </dl>
          <h3>What you'll do</h3>
          <ol className="zn-do">
            <li><span aria-hidden="true">1</span>Learn the idea</li>
            <li><span aria-hidden="true">2</span>See how it works</li>
            <li><span aria-hidden="true">3</span>Answer 5 questions</li>
          </ol>
          <h3>Skills you can earn</h3>
          <ul className="zn-skills">
            {cs.map((c) => {
              const got = !!progress.mastered?.[c.id];
              const skill = (OVERVIEW[c.id] && OVERVIEW[c.id].skills[0]) || c.title;
              return (
                <li key={c.id} className={got ? "got" : ""}>
                  <span aria-hidden="true">{got ? "✓" : "★"}</span> {skill}
                  {got && <span className="sr-only"> (earned)</span>}
                </li>
              );
            })}
          </ul>
        </aside>

        <section className="zn-lessons" aria-labelledby="zn-pick-title">
          <h2 id="zn-pick-title">Pick a lesson</h2>
          <div className="zn-grid">
            {cs.map((c) => {
              const done = !!progress.mastered?.[c.id];
              const tried = !!progress.seen?.[c.id];
              const best = progress.best?.[c.id] || 0;
              const status = done ? ["done", "🏆 Trophy earned"] : tried ? ["tried", `Best: ${best} of ${c.qs.length}`] : ["new", "New lesson"];
              const cta = done ? "Play again" : tried ? "Try again" : "Start lesson";
              return (
                <button key={c.id} className={`zn-card ${status[0]}`} onClick={() => go({ name: "concept", cid: c.id })}>
                  <span className="zn-cicon" aria-hidden="true">{c.icon}</span>
                  <span className="zn-cbody">
                    <span className="zn-status">{status[1]}</span>
                    <span className="zn-ctitle">{c.title}</span>
                    {OVERVIEW[c.id] && <span className="zn-cblurb">{OVERVIEW[c.id].blurb}</span>}
                    <span className="zn-cmeta"><span>{c.qs.length} questions</span><span>TEKS {c.teks}</span></span>
                  </span>
                  <span className="zn-cta">{cta} <span aria-hidden="true">→</span></span>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- concept: teach then practice ---------------- */
function ConceptView({ cid, progress, push, go, onWord }) {
  const c = byId(cid);
  const zone = REGIONS.find((r) => r.id === c.region) || { name: "", icon: "" };
  const L = LESSONS[cid] || { goals: [], steps: [] };
  const ov = OVERVIEW[cid] || { objective: plain(c.idea).split(". ")[0] + ".", skills: [c.title], remember: "" };
  const [stage, setStage] = useState(1);
  const [showAnother, setShowAnother] = useState(false);
  useEffect(() => { try { window.scrollTo(0, 0); } catch { /* ignore */ } }, [stage]);   // each stage starts at the top

  const AudioBar = ({ text }) => (
    <div className="ls-audio">
      <button className="ls-audiobtn" onClick={() => speak(text, 0.9)}>🔊 Read to me</button>
      <button className="ls-audiobtn" onClick={stopSpeech} aria-label="Stop reading">⏹ Stop</button>
    </div>
  );

  /* ---- Stage 1: lesson overview ---- */
  if (stage === 1) {
    const readAll = [
      `${c.title}.`, `Objective. ${ov.objective}`, "What you will learn.",
      ...L.goals.map(([, t]) => plain(t) + "."), "Skills you will earn.", ov.skills.join(", ") + ".",
    ].join(" ");
    return (
      <div className="ls stack">
        <StageTrack stage={1} />
        <header className="ls-head">
          <div className="crumb">{zone.icon} {zone.name} · Stage 1 of 3</div>
          <h1>{c.icon} {c.title}</h1>
          <div className="ls-meta"><span>{c.qs.length} questions</span><span>TEKS {c.teks}</span></div>
          <AudioBar text={readAll} />
        </header>

        <section aria-labelledby="ls-ov-title">
          <h2 id="ls-ov-title" className="ls-sechead">Lesson overview</h2>
          <div className="ls-ovgrid">
            <div className="ls-panel ls-objective">
              <h3>🎯 Objective</h3>
              <p className="ls-big">{ov.objective}</p>
            </div>
            <div className="ls-panel">
              <h3>📘 What you will learn</h3>
              <ul className="ls-list">
                {L.goals.map(([ico, t], k) => (
                  <li key={k}>
                    <span className="ls-li" aria-hidden="true">{ico}</span>
                    <span className="ls-lt"><RichText text={t} onWord={onWord} /></span>
                    <button className="ls-say" onClick={() => speak(plain(t), 0.9)} aria-label={`Hear: ${plain(t)}`}>🔊</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="ls-panel">
              <h3>🏅 Skills you will earn</h3>
              <ul className="ls-skills">{ov.skills.map((s) => <li key={s}>{s}</li>)}</ul>
              <p className="ls-note">Score 80% or higher on the questions to earn this stop's 🏆 trophy.</p>
            </div>
          </div>
        </section>

        <div className="ls-ready">
          <div className="ls-readytext"><b>Ready?</b><span>Next, see how it works with steps and an example.</span></div>
          <div className="btnrow">
            <button className="btn ghost" onClick={() => go({ name: "region", rid: c.region })}>Back</button>
            <button className="btn" onClick={() => setStage(2)}>Next: Learn how to do it →</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Stage 2: quick lesson ---- */
  if (stage === 2) {
    const scope = [
      `${c.title}.`,
      `Big idea. ${plain(c.idea)}`,
      "Here are the steps.",
      ...L.steps.map((x, k) => `Step ${k + 1}. ${plain(x)}`),
      ov.remember ? `Remember: ${ov.remember}` : "",
    ].join(" ");
    return (
      <div className="ls stack">
        <StageTrack stage={2} />
        <header className="ls-head">
          <div className="crumb">{zone.icon} {zone.name} · Stage 2 of 3</div>
          <h1>How to do it: {c.title}</h1>
          <AudioBar text={scope} />
        </header>

        <section className="ls-bigidea" aria-labelledby="ls-idea-title">
          <h2 id="ls-idea-title">💡 Big idea</h2>
          <p className="ls-big"><RichText text={c.idea} onWord={onWord} /></p>
          <div className="ls-example">
            <span className="ls-exlabel">Example</span>
            <div className="ls-extext"><RichText text={c.example} onWord={onWord} /></div>
          </div>
        </section>

        <section aria-labelledby="ls-steps-title">
          <h2 id="ls-steps-title" className="ls-sechead">Step by step</h2>
          <ol className="ls-steps">
            {L.steps.map((x, k) => (
              <li key={k}>
                <span className="ls-sn" aria-hidden="true">{k + 1}</span>
                <span className="ls-lt"><RichText text={x} onWord={onWord} /></span>
                <button className="ls-say" onClick={() => speak(`Step ${k + 1}. ${plain(x)}`, 0.9)} aria-label={`Hear step ${k + 1}`}>🔊</button>
              </li>
            ))}
          </ol>
          <p className="ls-note">Tap a <span className="vw">dotted word</span> to see what it means.</p>
        </section>

        <div className="ls-twocol">
          <section className="ls-another" aria-labelledby="ls-another-title">
            {showAnother ? (
              <>
                <h2 id="ls-another-title">🔄 Another way to see it</h2>
                <p><RichText text={c.another} onWord={onWord} /></p>
                <button className="ls-audiobtn" onClick={() => speak(plain(c.another), 0.9)}>🔊 Read this to me</button>
              </>
            ) : (
              <>
                <h2 id="ls-another-title">🤔 Need a different explanation?</h2>
                <p>Try the same idea explained a new way.</p>
                <button className="btn ghost" onClick={() => setShowAnother(true)}>Show me another way</button>
              </>
            )}
          </section>
          {ov.remember && (
            <aside className="ls-remember" aria-labelledby="ls-rem-title">
              <h2 id="ls-rem-title">📌 Remember</h2>
              <p>{ov.remember}</p>
            </aside>
          )}
        </div>

        <div className="ls-ready">
          <div className="ls-readytext"><b>Your turn!</b><span>Answer {c.qs.length} questions. Any score builds your car.</span></div>
          <div className="btnrow">
            <button className="btn ghost" onClick={() => setStage(1)}>Back</button>
            <button className="btn" onClick={() => { stopSpeech(); setStage(3); }}>Now try the {c.qs.length} questions →</button>
          </div>
        </div>
      </div>
    );
  }

  /* ---- Stage 3: practice ---- */
  return (
    <div className="ls stack">
      <StageTrack stage={3} />
      <Practice
        concept={c}
        questions={c.qs}
        onWord={onWord}
        onDrive={() => go({ name: "drive3d", seconds: 120, returnTo: { name: "region", rid: c.region } })}
        onDone={(score) => {
          const wrong = c.qs.length - score;
          let p = record(progress, "Concept stops", score, wrong);
          p.seen = { ...p.seen, [c.id]: true };
          p.best = { ...p.best, [c.id]: Math.max(p.best?.[c.id] || 0, score) };
          const st = (p.stop && p.stop[c.id]) || { right: 0, wrong: 0, runs: 0 };
          p.stop = { ...(p.stop || {}), [c.id]: { right: st.right + score, wrong: st.wrong + wrong, runs: st.runs + 1 } };
          if (score >= passThreshold(c.qs.length)) p.mastered = { ...p.mastered, [c.id]: true };
          p.badges = awardBadge(p, c.id, Math.round((score / c.qs.length) * 100));
          push(p);
        }}
        goBack={() => go({ name: "region", rid: c.region })}
        reteach={() => setStage(2)}
      />
    </div>
  );
}

/* ---------------- practice engine ---------------- */
function Practice({ concept, questions, onWord, onDone, goBack, reteach, timed, onDrive }) {
  const zoneLabel = concept ? `${(REGIONS.find((r) => r.id === concept.region) || {}).name || ""} · ` : "";
  const [i, setI] = useState(0);
  const [val, setVal] = useState(undefined);
  const [locked, setLocked] = useState(false);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [cheer, setCheer] = useState(false);
  const reported = useRef(false);

  const q = questions[i];
  const passage = q?.passage ? PASSAGES[q.passage] : concept?.passage ? PASSAGES[concept.passage] : null;

  const check = () => {
    setLocked(true);
    if (isCorrect(q, val)) setScore((s) => s + 1);
  };
  const next = () => {
    if (i + 1 >= questions.length) {
      setFinished(true);
    } else {
      setI(i + 1); setVal(undefined); setLocked(false); setHint(false);
    }
  };

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onDone(score);
      if (score >= passThreshold(questions.length)) setCheer(true);
    }
  }, [finished, score, onDone, questions.length]);

  /* Physical keyboard support, alongside the touch/tap controls — types digits for
     number-entry questions, letter/number keys pick a multiple-choice option,
     Enter checks the answer or moves to the next question. */
  useEffect(() => {
    function onKeyDown(e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      if (finished) return;
      if (e.key === "Enter") e.preventDefault(); // stop a focused button from also firing a click
      if (locked) {
        if (e.key === "Enter") next();
        return;
      }
      if (q.type === "entry") {
        if (/^[0-9]$/.test(e.key)) {
          e.preventDefault();
          setVal((v) => (String(v ?? "").length < 6 ? String(v ?? "") + e.key : v));
        } else if (e.key === "Backspace") {
          e.preventDefault();
          setVal((v) => String(v ?? "").slice(0, -1));
        } else if (e.key === "Delete" || e.key === "Escape") {
          setVal("");
        } else if (e.key === "Enter" && isAnswered(q, val)) {
          check();
        }
      } else if (q.type === "mc") {
        const letterIdx = "abcde".indexOf(e.key.toLowerCase());
        const numIdx = "12345".indexOf(e.key);
        const pick = letterIdx !== -1 ? letterIdx : numIdx;
        if (pick !== -1 && q.options && pick < q.options.length) {
          setVal([pick]);
        } else if (e.key === "Enter" && isAnswered(q, val)) {
          check();
        }
      } else if (e.key === "Enter" && isAnswered(q, val)) {
        check();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [q, val, locked, finished]);

  if (finished) {
    const perfect = score === questions.length;
    const pct = Math.round((score / questions.length) * 100);
    const badge = badgeTier(pct);
    return (
      <div className="stack">
        {cheer && (
          <Cheer
            emoji={perfect ? "🏆" : null}
            sub={`${concept ? concept.title : "Stop"} — ${score} out of ${questions.length} (${pct}%). Trophy won!`}
            onClose={() => setCheer(false)}
          />
        )}
        <div className="stamp card">
          <div className="big">{perfect ? "🏆" : score > questions.length / 2 ? "⚡" : "🔧"}</div>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>
            {perfect ? "Stop cleared!" : `${score} out of ${questions.length} — ${pct}%`}
          </h1>
          <div className="badgechip">{badge.emoji} {badge.label} badge earned!</div>
          <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
            {perfect
              ? "Every single one. Trophy won."
              : score >= passThreshold(questions.length)
              ? "Trophy won — strong run, 80% or higher earns it!"
              : `You're getting it. Reread the steps in stage 2, then run these again — ${passThreshold(questions.length)} out of ${questions.length} (80%) earns the trophy.`}
          </p>
        </div>
        {onDrive && (
          <div className="lr-drivecall">
            <div><b>🏁 Your car is ready!</b><span>Any score counts. Go race!</span></div>
            <button className="btn gold" onClick={onDrive}>🏎️ Drive for 2 minutes!</button>
          </div>
        )}
        <div className="btnrow">
          <button className="btn" onClick={() => { setI(0); setVal(undefined); setLocked(false); setHint(false); setScore(0); setFinished(false); reported.current = false; }}>
            Try again
          </button>
          {reteach && <button className="btn ghost" onClick={reteach}>Reread the idea</button>}
          <button className="btn ghost" onClick={goBack}>Back</button>
        </div>
      </div>
    );
  }

  const answered = isAnswered(q, val);
  const right = locked && isCorrect(q, val);

  return (
    <div className="stack">
      <div className="qnum">{zoneLabel}Question {i + 1} of {questions.length}{concept ? ` · ${concept.title}` : ""}</div>

      {passage && (
        <div className="passage">
          <h4>{passage.title}</h4>
          {passage.body.map((p, k) => <p key={k}>{p}</p>)}
        </div>
      )}

      <p className="prompt" style={{ whiteSpace: "pre-line" }}>
        <RichText text={q.prompt} onWord={onWord} />
      </p>

      {(q.type === "mc" || q.type === "multi") && <MC q={q} value={val} onChange={setVal} locked={locked} onWord={onWord} />}
      {q.type === "place" && <PlaceQ q={q} value={val} onChange={setVal} locked={locked} />}
      {q.type === "inline" && <InlineQ q={q} value={val} onChange={setVal} locked={locked} />}
      {q.type === "entry" && <EntryQ value={val} onChange={setVal} locked={locked} />}
      {q.type === "shade" && <ShadeQ q={q} value={val} onChange={setVal} locked={locked} />}

      {q.type === "multi" && !locked && (
        <div className="small">Pick exactly {q.pick || 2}.</div>
      )}

      {hint && !locked && <div className="hintbox">💡 <RichText text={q.hint} onWord={onWord} /></div>}

      {locked && (
        <div className={`fb ${right ? "ok" : "no"}`}>
          <h3>{right ? "That's it — nice thinking." : "Here's why that one isn't right —"}</h3>
          <p><RichText text={q.exp} onWord={onWord} /></p>
        </div>
      )}

      <div className="footer"><div className="in">
        {!locked && !hint && <button className="btn ghost" onClick={() => setHint(true)}>Hint</button>}
        {!locked && <button className="btn" disabled={!answered} onClick={check}>Check</button>}
        {locked && <button className="btn" onClick={next}>{i + 1 >= questions.length ? "See how I did" : "Next question"}</button>}
      </div></div>
    </div>
  );
}

/* ---------------- timed trek ---------------- */
function TimedTrek({ startSecs = 240, progress, push, go, onWord }) {
  const [pool] = useState(() => {
    const all = CONCEPTS.flatMap((c) => c.qs.map((q) => ({ ...q, passage: q.passage || c.passage, _c: c.title })));
    return all.sort(() => Math.random() - 0.5).slice(0, 30);
  });
  const [secs, setSecs] = useState(() => startSecs);
  const [running, setRunning] = useState(true);
  const [i, setI] = useState(0);
  const [val, setVal] = useState(undefined);
  const [locked, setLocked] = useState(false);
  const [score, setScore] = useState(0);
  const [wrongN, setWrongN] = useState(0);

  useEffect(() => {
    TIMER_LEFT = secs;
    if (!running) return;
    const t = setInterval(() => setSecs((s) => { const n = s - 1; TIMER_LEFT = n; if (n <= 0) setRunning(false); return n; }), 1000);
    return () => clearInterval(t);
  }, [running, secs]);

  const over = secs <= 0 || i >= pool.length;

  const reported = useRef(false);
  useEffect(() => {
    if (!over || reported.current) return;
    reported.current = true;
    let p = record(progress, "Speed Run", score, wrongN);
    if (score > (p.bestTimed || 0)) p.bestTimed = score;
    push(p);
  }, [over]); // eslint-disable-line

  if (over) {
    return (
      <div className="stack">
        <div className="stamp card">
          <div className="big">⚡</div>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>Time! {score} right, {wrongN} wrong</h1>
          <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
            On the real test you get hours, not minutes. The point of this is to notice when you're
            rushing — and to keep going when a question feels hard instead of freezing on it.
          </p>
        </div>
        <div className="btnrow">
          <button className="btn" onClick={() => go({ name: "map" })}>Back to the zone map</button>
        </div>
      </div>
    );
  }

  const q = pool[i];
  const passage = q.passage ? PASSAGES[q.passage] : null;
  const answered = isAnswered(q, val);
  const right = locked && isCorrect(q, val);

  return (
    <div className="stack">
      <div className="qnum">Question {i + 1} · {q._c}</div>
      {passage && (
        <div className="passage">
          <h4>{passage.title}</h4>
          {passage.body.map((p, k) => <p key={k}>{p}</p>)}
        </div>
      )}
      <p className="prompt" style={{ whiteSpace: "pre-line" }}><RichText text={q.prompt} onWord={onWord} /></p>

      {(q.type === "mc" || q.type === "multi") && <MC q={q} value={val} onChange={setVal} locked={locked} onWord={onWord} />}
      {q.type === "place" && <PlaceQ q={q} value={val} onChange={setVal} locked={locked} />}
      {q.type === "inline" && <InlineQ q={q} value={val} onChange={setVal} locked={locked} />}
      {q.type === "entry" && <EntryQ value={val} onChange={setVal} locked={locked} />}
      {q.type === "shade" && <ShadeQ q={q} value={val} onChange={setVal} locked={locked} />}

      {locked && (
        <div className={`fb ${right ? "ok" : "no"}`}>
          <h3>{right ? "That's it — nice thinking." : "Here's why that one isn't right —"}</h3>
          <p><RichText text={q.exp} onWord={onWord} /></p>
        </div>
      )}

      <div className="footer"><div className="in">
        {!locked && <button className="btn ghost" onClick={() => { setI(i + 1); setVal(undefined); }}>Skip</button>}
        {!locked && <button className="btn" disabled={!answered} onClick={() => { setLocked(true); if (isCorrect(q, val)) setScore((s) => s + 1); else setWrongN((n) => n + 1); }}>Check</button>}
        {locked && <button className="btn" onClick={() => { setI(i + 1); setVal(undefined); setLocked(false); }}>Next</button>}
      </div></div>
    </div>
  );
}

/* ============================================================
   ARTWORK: comic-game illustrations for ages 8-13, embedded as WebP data URIs
   so the app needs no network. Zone art is composed as comic panels (art on
   the right, space for the title on the left). Logo, step icons and most car-part
   icons are inline SVG (see "drawn artwork").
   ============================================================ */
const ART = {
  build_yard: "data:image/webp;base64,UklGRuRbAABXRUJQVlA4INhbAACQTgGdASowAu4APlUmkEWjoiGUzFyUOAVEszSgL1mjGzam36AdGshH807qrVwb2b1+dbCp/3rH/+eLEod/GZHx50BreIPOj2SjNWM5X6Z/ePNS9ADHis7QP+P+Uf5VfMhaP7t/fP8L/o/73+33yu/7PoB115d/nP7F/yf7//mP2v+Y3+V/53+S93n9P/wH+7/P/6A/1g/1f+H/x//s/0HxaftV7rf8P/rfUJ/Rv7x/7f8Z7sP+n/9P+y9zX9e/yn7Tf8n5Af6d/jP/b7W3/c///uZf4//o///3EP24///s7/9j9x/+58qv9j/5f7c/Az/Sv8x/8PYA///t48+fto9jtmL5B9K/mP7j+5f+H+Pj730R+k/5//U9Ev5p97P3X+J9Fv+1/ZvJf59f33qC/mX9H/0P3I/En+F2/NsfQF9tvsH/A/vn5ae5h+P/4fTP7Mf9b/KfAD+tf/J8t7w+/VfYF/T/7Ue7X/rf/X/Xen79g/2n/n/1HwLfzj+9f9v/HEqRxcsGTkw9gyEzzaHTttYPMU2RnPXQcTp+8QyrBH2Jm4nK2oyPuIULl9IubMruXwcPUas101OGBX6Z76fzWvLofWIJ3y16CMeyzmSHzhNLM5L8uzSqiVmfPZ4nQpyW+uUrqsmaR/ur2ZlKPtbRqLDsHAK/ifLTHt9mjKd7Ya71HHXdPLlOp8xzGm2v5wcCOV4paQOrpF8jmBD3F11I9DQWwr/KuvFa/Ymi3qxkvFNslkeh/g4OGmErJxJKJ91Z3w0fahCUin/ao7kzClyTIvc6mabGLki7xJ4Nmqew6matyE1IOtwxQy4rynLsnjUvH+9ZRWzvqmFld+iIh5WzY548kGpgLcZd/mvKdLf/jQPPpBLJILOYgtBvyuc2p0iOVDXot3G529gHvjm6o5vxSjswss00QLWWSLb0OMemlD52r+lLYn6BEseM0knZ9u/YsFZEevOj+aAwr/PDQasL7rsQo5QAyR1IYlBMQKxLGiyO5bNUHxofPbpXUZEBLCLtUR+AMNgtIPQ6zj+W7IlHGn9x22oaOSdOBTPsBm1fa/HLLjb+rYEBLoufQwb6ldsu6tRD/Bcjx19HJKQpkKh6ftIiKLHSz+SRGdKaJ2//tE0cNFdwTDM5j9IegSLOzWDfcc+QJ+zXGsp/2idHXodfqJNGwGS1MC2ooez3Y8NrKsC9Lanz36iqzrw+lKnhiDgJGV+Q+2ZbEkkA9Ye0a1kAlYPe6Ogibym6iAL6RKU+QEL7+7s5fF1IW2aVLmozJ3sbbOvJwcrXK0Rx57fkHbn8djweY3q4BZnbA7RHYICGgys8XPsp/C3w29xqM3Pga/KTWKhsblG4OSxL4gJsKeBx1HyVJreukiKrbHyCPr76S1sJDyCUizxGIJ2RQC9g4ACgMHHdUp3eiOwux+/RtVEVDaOczh7maX9i8k4cptiKQWMnFaWuPdzZ1rcRqdViZJWhOue029MWHRzH4NehFFSBp4r+eJPqZo09IJoKdJ695lhgYU0UrYNruN1RO81lFLKBWZUkHKR7UnrtnHukQUVIbgtzNt85sJnzQLaU/BcUnK9HdArFjcj7YTLAKPFO44FxZkXwUveVdD69jKUOCcAJtgSDib9XLu+C8hK4i4D+uY05Hu1rOBAxVu77iYI7iC+9++uKr8MvSxnGRHLBp9yYE9A0FPxURy3q+y3O2v7YjmtMu6I/kLcZo493Z/fO5wWrLTHicFGqyhAU+a69wrZE4drYNsG73v7YhFssJXCmjYELICsQF6IU8MVxHwZyTgxy0/aDs6/l/i6A2bIWZ2/DhiwVg0IF0a0lvqgC/n3M7FDVpZdcNtrQrvTymXZBa1vscNmRza9HckQwh9N0XwvqtWJwymM7HAFu+bFzAm0SJhMkoJBK54A4WM7bLOm/jYSvKKYCcTv34QqUGvRTVhm/gVrlAOd7PTaVOuzt3GAmh6jbO8xG9vq2F2YS57oFdq8dhg/4S74N81YXdG/7ieHs2zDJA92DBh5nj0q0v8mclZBe0aulfkVTCKWG2WZVAVgKSS85TV1F3OeEC0oAfdoZk/Z/M4GeyvK7KQQ3pCGrbrTXHEwrSqy57Db5zVVn7rE+oCciQT0rs1upiz2H91N2zYZSDZ1G0W9QFwxkT1RKSuuYYHdCreIU5DeRiQ2aUQzLUUR7g397jpH7W9nt9PAwg48sKI7USksVlwQBtUMKwClnK1x8wgFxJQ/S+rCFnw5IxqYX8Wzv3A1BiJOdUj7yQXUs3zDgMzOHJ7WZ004YQ800/U+UHcDoSl/A1r3HkfnzhUv5/anKNmikEqAC8qHIjMg0yiF/rjLMMmOEFhZcZYWBYHLAAb4V1+5Ah5x4NceyPEGGoucB742ls+4FZK1vZPcS5mn5CUzdZGZDRTRyHhMwlHpHtkqnvuZ5gP5rvkoYpYwrwbV/JwyrK47MA6gVumjQCS3kqeFJ5PLNKTBTwg2wmuyBngu0Vj+m5U+B3dAZ+Zz7gcwsspNaTnhy89XoR2VqPybQNBBlKqCor0/BJTwWMN3WHsz+55p4/Os3QJ18Fk/8okOS+Ii/3b/21ldIAIcEMaNygmePkcuExT2/4BOu1K1kp8dOtg4/yaiSbMcY93JuS+i/Ad/UA2iaw5+jy0ZK/HbU+s/NdCyHACgWy8oJt7UY91qeEob1UDV4PmaYye1csm3UWIgvRwh6qmG7nmrTnT6QulEkiciH8x2FNi1ErpBzmQkyAL0VYXPZpofFV8VaMSp6AdmRAFvV+JIl4X7Iey5lWfp2k+iws4OjuxR9XNTXjbXpB5ttmOURVLZkysCufF2VjSMF0LpedE+5lddvX4Pu8AhVP2b0o0P9411cpIMsJ6vk3kht/vj08gsoSIFjcF8orP42pAHr3GzXAIoZmNA/CGWd/Fz8ofnXJxhiAYOi/dI9nvmyOYJezRMjH/35j/6FabpXRy67WC9gcal/s4dTemrjsPxxaNsxUsuR0m+j0eqqJWCuXMkYB7nd76GQ9eArvqq+loX4NJvh4moTwI8kmCLWasrv2Xg7IYU0sEBwE+3MaCEn32DDAK3AERB3Mgk6R5iAJ9VC40uQ3JPsXLe1kiIPXjyS2E6tOBHg4aK/CmNxETCkHzvFzOo9tYYvrivTp2Gm9IfGg9DVh9nWdnJGprnY2I+u6alBBUogBfPk7KSUQV/zzOhmdxdt9jsuauf97WXLyQKLhDJ2Rn6HG1kSknf3l4xXMLSasWfQW0uRZ/eu1FyKX4vHOTJYuYqbrSiHu5hruxuLVh/0GBfQflI38Hl0gCxKIGTCyoCgvGTwKJAT9li6UxoAn7EYEWOiUTM+W+K//4aP51ZeSP8AHjv85VS7QzYGDilkHny0So0pClM/KxUnAyIpSsnRR8EpDtMfIFjZrhpqlBrYQHR689qrR+uQ48AVi8cqY/9ScdNiLNn4Xxy1ZBNMupXUqPSeOQZT9XGJ/I424gs4NZfp0TnYMg7BIE6r9i/EFWbhNP5MXRx1/zafT68EyC9UnttEYPWbDv6f1650KYU3gGLMJBLJTRApCWFfHfKlijzBSDxtO+kP2EReKcuJsUAA/vpFycteSPehL2pAiiEK3/9PE5WPIK9m//ihMC2XaUvf+U3mqn41F+GnjVmDH+I4EeXNv8Ir4D99srY1+hE4FsqXpBRUI4DPZPsZXvHBUiSLVn4hkB/qEHSHllZcHU3DExzsaQ/0KQ/pMQIbVukR42mSVmMFOEnmK10Sq3YAIPz0UlcC+Z8M4WRALP3T2G/BdwpsCvJgVEJ/Om4Phdb4Ra5iab1RmAWqZeq1eeKZB6qctt1SMwiCxm0YYprN8dUhjMGagAF3CI54ZczHd+VxtSiiXeDJ1MtecONEDQYN7h+T+pcmOcwJmHShxtHtYorMyuC8//z/3keMqxLkJLBEwz5BsZ6xn+rpbF0N38vrsGFLDTuBe//9Tg0r4ByClk0nbEF3Ojjl1RGX5rqQqyS9RJgvD3G35koPVyd9UCQKrGaDtBDpkrQM6vnkVzjWKAvd4QneFAa0yKQODtSycAGSd8+Z8W4Urvx79Hfg+dzkOI1auOLCVOywsHkJuQJRhRAk+QyxFtskGU2GroU1q1iCeWXP3We6zYXzyQr37KgH2D/ANj65b3BAPBmkJCKkCiz02msCe71SNyYeb0/DYqUSrpDBqe/WYZQNrQqQYkxdLkhfi/mchcHkixOVH3vj/oAJRgkRNWYvn7c56Rg1AhivMMI5CbXB+uTzOBnUsP+q6WJ3NAM3UGS0DzsU5AeqFwmQDSBUGmqiz2RvKTiAvYYtNSs52gYga1eKT30lzV3koHCMVDr02p5ikiPqwPdr5Cl1SOAC8uz0MihD1QWrA8UZVi3e6w39OYWq/mnro7FbJvBSeB15LR20jgbyR4Uqwhmy/kV+yMV0TvJb7LA+fAmfnMEYY/Q0KSU5/PC5J8bzKLq3FIZlmwO/tK/577H1dPx69HNzjf9kfrx6geIeFBPcdppJW1t0W9bLIuJUsxCFrGU27jc+maaI04WV0V4IKhOfWMqOS675egWBlY9kvudQps8gifUlVxOSeofTIQdSAFqQLfynAkngkNetlIwva/EpWh+WmZ+eFyB8XMmyGoNxo7tvZE1pzBJbcrzBah6PzgeKdZVvmjVmiVH+ZZMGYTil1iQulQlS62tfYfwFevGgAcTKfIhh83TNaFcd4ZqmWsA14Wb4qnTPwGhWoSqvBnWyCP3dLLoMolT+ltYZAKG7ttMCx7DxAthnOuvkdLmQKiQJKYZaJAEbUglOUPU+TNu7nejg2YwfifU6AP8qecuTBc/+vIfoAc/NbtpW4lEJGrpOB06rbu05Q4c8SV1bwIgrmG0wKpOxhOaJSVCszuCOTz8Y9CLHcgv0bznPoHic4OCxNM/GIt2//KZdN7GwVfHOpyzNs/MnPxkB7nzB41r7Y5Ggf7ohu4MeOVXX2PljpLPOhsoq5zI5oyT0g08qWb5crRQHxOMntPlrznFJDlrTlesbhMlXdkc+eD45TZfHz37EeQQJTDW671arflHcdkGFpbI+japBGAzbKAaKAn9yxNBlQlMqy4UMf8ir2LNU39FKf7GC4mspD3uWBlyX4Cv0POHyAfpAYEF1M8X7YljNS3gBedbpGaYsfbOZLWYAWzqp9MMQ865Q+VOAVsgA8TNYhinvl+ImFzlpLRguLjCQMTb7kOcT0R34PqbWuR03YN20otVbIyr43nJoKv8Ge2sqB5rWLhkkzxOkNTGhfk7nzpi/qOAG2ot/aiXVdVBhAZK6SQlKCr472aR+G/ajtPqkx3l7FdVFljNIgw1pKl0XJ51nme0mJFbfM6TppL1e3MzkWNeLO7POCAdm1DVVVa8LWqhlCEv+pB+oaQrmABiXHWD9mnAGsBfFNqW5eZ4624ENEgpqn7uQucge3N6eTKCZ6fZeE/x7TBeVFfLNmYZKhhtspD2j1jbV7lelBWHvL8lDct0vkdGBGPoYARSI7KonE+M7c/di0cJr0eZgXZj+8p1qCsLWRSf/rXbAqeSoffVX2imjQqCXxBdMN8vLio9Hm92TvvDvp++pUFVEbkzwZoAX7swwWKlHTqLmFY5zXDtec3/+eXBCLknlat8Z2UbqO++yQRNkZTQTDQr/5xxtqwcjtgofmI889ujALgA81/Gaw8gTIT68TsV8VVpzNCjkdPz4bctK564i9/2UrR6zirgL90Ooek5PPXgcKO8mUejt17C9M3q7Uq/2MSfK1Q4TBOL0hdX01gCnYK0DaW7Vxoq4hvOM8BsPdzermryASmvs7mOVu5J4rb2YXgXFGGCbLDn9040fxS4wCgNHEY0pQEwdxHflaAmuapU1dfshjDPySdEQRMoWDaDa/HDzYVq8wv6/NqkunJIYfkpEWbTd3Op1DjT8ayC1kvazt3F8+BxUVAOEQdrGcCrL3I4eKzqKU51iArNi+EcxKJlfStZbdArTEPqK/UJaO7pCU4ztaEB7/y4TPheRM1twpxGpW2lCDIaLM5Y5u1ROmhu8pwrrJDkGZOkbs4e+BztnJpwIoJkXX3BcwFolAHob9x46KISO0/9Wawnjtkco/dcatcYBvlrzRIGCpTpmeO8afw5irXr1Iz8ieLnMIJHQNKfokIEigWU5pLiP/K736JH+VpchA/BkfDWaW+mMVa+u3OP+gAm9PbdCaocmrnvm1pHIfTJzNPh3VqaeRiOa6LbqOgHNMxGXcOIEeWd+U0kAyEMVX9UAj5iEQwN3MnzBQ0AS0ujCfStZgQDc8YaM1n5fHvLJalup3C73wCl3T4cu9+/hLmBFgQw+8buXSHML05CHUBvYhKz2La7tFyz1780NqRyKA5HYN83gCiabTFxT1GLheNy2NRHUpXjLZRy8MBkihrEEXVshV64ObWKebINxBa0HIs8MyaacWIquJh3T/3EaUj+iWhrWnYoDIVVNl8MgoAKbFPeRcAEKQFZfiZZXuPg5K/qurxgN7A4Sb8k07AUaUZsT4aXRP49K8q3orMRsDtc6aqeL6EREQHJrRJ7o3sWe2u2dEzaI1wVsEpWMSIc7jFIkefVn8bgbIffTm5wtdX4YoI/xYUWqnSxi3NQQ9NW528ARQF1VDpMbzXe2HNetK6RbYaQ9jmxqs0d1cyW5uMd0e12uSkFie0mJdmXk+A+9nzKG2804jXGVEK4WaxpCy+MUXaIJP5Qv2q/BWrNBR2Z0K9GByNjFXpWFETO0LAZIlI8HfXM0x4rgoEkOc88jOgzLpDa8at2luYKUsDVHt/RljPUQMsQHs5PQIl+Mz0ZKBrV/s6BrqY63pNEfwZRLqMyufGgMOT9oxO3rWjzP0jD5X/IITran5ITRFxiGXOtFCatdqHoDM97WmowLZtsZdDRm8vUamMGD02FuH3LOrgLfa4YSL69OOu2xX++ZGk3foFTKezsWLms4z6T7wUAFFXM57/O8HFVcocsgOrdjuZ1K8/3+Y8Dr12D/Vr8jxj15oZrXgvTqPykkB+lPwjjg8klVg/8ezFvGLGmbYznqU76bB3+WBf6RY01t+PuAYUzc606ga22B5L75/8iv3P5uekEsPSJnviqjnhf8OHioU5Mv+ddWqNcdFgMk2VXpv+ore3AfiYTQ/L3+gGLrSBPp3K6wXwZczFP0JR+7KWan09OTM8+r2lnBBJ5jxutKMPCXzYGgW/aUzmr2YdtSBo+aBs/2lGny5SY/upJgH34oaCyRvz3KPVF/2s1PFpEFfMXiS2BGfkAspIBU5xNUK5fUpHch6+mDODMpw63VEqAGVf/crP7/vx7QKB1vxhrqytjX6ETfR+ZByxKrU2O2YNNzVlPXz+o/PvQGpTw14xHF3d6IYLFWMot1LYkl6yjjII9j/Vl4FWrv2XcqmyD89FJXAvis9yxKrU2O2YNUywuDVbFHViaeBLDCuOcrbY5+kS0pdUmXhligP5pEuQyIYRCehIW890aFZYS5+5R1Tw+flk2KmWGnoGkV936yKty52Xspdu7N0vt8hs9g/IXR/6PBvoLT76BIeYl+xMTiI8RHaIKyukgP5t7Mrz4QrWqo5sEHXNLN4j2HAJ73T7FY01sDPnEkn0uEj7bW9H7qhYFs0iOwslgl8O0aE8u2/cq61nJ/AYKKqAaggsYTGrbtHxhDvhqcCdVwY6tdtGOl2O41pxhgGnwOOOv8oQJEEFawCyDKre5lATj9xK9QVOkI0RDhVB+Q75mjsTpCroYr1qgIrkF3SKIZTqWmv8kE+H+cE9rgpafxe187b+fqlcEB9lKrxJF40aoG3JDyrLp7pDWr0bASlsSo9iwFeosldW4mXIbzqv+vQSJrJwTT8/zVsIsKuqJF+zcxom317GNDs/YmSo+fOC3WQuvsZGUaWw2eBr/ypVo88yy5Zen9ncQ+s35C1E3yvD0rrtdFE4+eNjitiB7P1/83aMfCs8pvQOC+hAFmVS/F9FbfcKVxSi7EJ2fymiO+NtxjqC6E3Xk01cuPB3U7VbKEIwvxw5phtdtS0rkp0A62iRoWdGJ7ufHtHTFBytDl2S7BlNm67pVsahmw09QhH+QSmWq4X5/FTwgE1jQZhpux8oaBDrSBNIkftUx5xbZIu3YN873e+wS+IqaJfvL2OYf+Cc51K8TOEBTsLm3RhhR80egyX3rAFObB7wJ1eM8mUI+0vmnwEHGVVL439LgPhtw0upPxN+aTaTwsYNOqPoi4CjC+6vy+cX7djpMzubSUuT6wO99LuS54oWZ4eONgg9Rrsa2AAsbb1wZytTx2+9V3kpHOy0aS59kd/OW2RK7g64ddoRbtnNA6nZa0PvGQNCNg254QKAmKcHbfSUXM3QxM1gSLnQnigYzXqjvljiJOXgzZoxC4mEdcG9jsnvHet3eBDh8ZOAjBBTcGzEVgajBdW+4pj6p8uiUO3CbqBca/DGBn3Vgsb/n0aXVdRcX1qW/gShS7mV4tWogDr6BWomS9fOuq7jMd6FkKFOAtlcS6POR+tLqKe8SsENui+3kTseYup2T9SZYqMKdifUqIN2p5pZlDwQHzwSyHtBST0vlKQhQYw3LteV/0tPhaT5ywQf+abIsXpQPVWdgwgzIlpt/OMX1XDaxnwixbLa7WATbLG1hJwQ6ZRn0Ntyrr5NpIkQ549+h3I+n34Cfae0MpyuGD+kDhq4OM1Ay2i8fJ/Yua5LB1QSLbOSq2VZrRX82VoGuKmLvxxwL5SlgZb4Xe5miAttRG4MB8W3J3oh5+FPnJ54TeNnNgg9Gm8k3IMxn2QZ4g7w7y+utxTiAGBPijzKE0LBOkYv7rfF7h/CU4mc5EFTNnhm+4BqNYXIjO1144aEzqhOIEFmXjlBynwSOZV3h6+q9HA1wSJAz9D6wxuSsYlx2ejOy3MbnQ6ZnZPEbO2CvFo2M0vfYH0UsbnlkVx3mo3Yhhp5Bve7436faxPYzF0aiOJ5B73mEMaxPiJcB3Q7STsaMke5FIHlHcf2BsjEEIgHPK4CHc1bzzAh5nbS36VwzX8YhsWA3kNPgemP2zLI+O69clV9k4vm3942chKU7flbAMuT5yE05JAqNouDObai7sREaCbg20yBjoO3EierurrBKSzdW0Tt+rCvL5yitXDY+PXeKGjI5tvFNYfSwC6Uru/e42fnDgdCq2yge1JY6bkJwqL4xGkMHZVtj9eHKCShAo1TTXSppAgrUv3BQitnL7sTDxI+V8xi9L+jpLv98JDv1tPL324+PZ0fLC4TjNa01uAYiqoyzl4fvg4xoPbr8P33u2s7gHO5YEF5sluerfRKDK5InIwvl9Ot6co3LyXF2/kSASjP2PptRc0rWCZ0LYk6t6b+i/CEwh8YdVmDDCvwmSFFhveiGvtWWd/dCcL0NiHKTjSvoau+qPwP18iYZ1hMMr89P+pR5rRpcg9wmQw+Xkydsh+8qqIIVvEHEUBJChQ2McQjhpnqKUktW4oCDCyHcDpD1BCFPqdezBiOMUKuTMJJZSPnpmR6MjqhGQ8WwSv1Ll+lFqzysx9uYVwTW62KVLSaEjycnUH1+gE04vpqIA3LYWJdZ80yW6OO4PWgjRTUJ/8Cgl2xLmpZLeaBaeqUASD/TtVT+G9RTZyTDRSH6yFzMRHjB2HJv8Wf54h9rId/spzRufRv+8EI0SchlSf4lyaYO61xEzde3Be3j3bz9l2BdTknS9nz6oyd4c5x+2hw8LWBksSgc6LoM19mG5GbWMvNjPo6IcGr/QHv4RlCKRZt0/+PB+3mAzJsNmZ+2KNUGx8PvD36f0iTd1uT+wqu1ik7WHzTU5tiioc7Hu5GZfj0E7A1Bb5ZB9Ok3PX+oH3puDqWhpSBQPPCcu9xDKW6s2NXxDUvNs8Xxbl8sCa6UwPEOFP2/U+AWqCUiCjw8fs67BF9UKlQ1E1IXN2U0Q5LG3B5kTSHGGeaxSJDf2v1XNQetFXCknV6FVHMeKLKW8gLqoA1SyWFTDXRiU9w3tairRpXNpKsy4qFm012daKUMGDBHcpeqNcJudpaNYwf4t/np8QJ8+krLlQYrRIQbNKV9O01KqjgGTgNoQahJyl2eCjkvjBKl2Gm7HZob8F/gvq0YR2jmez4/w1kmWxfQJN33KrWbloEzBDmDPLe3B7XMsBdUmx1cjHI+I1D3G1twbmo8MSfjJrKgkvCmHWP/SEFag1llDiRsRQTo7buZyiLL68/sa83oLeMZpL20JLN/2cIskqaBGvB3sIhDik8KtT3OjOi97wuMDYBF09/lt0FyHUIhZojU3OP9evbZvn8bkSDNef6UafnzjTIpqlKRD2vNMLSnpASUjVHI5D0lGASrUQHzZbuz9m9qASJlspcS03Jc/RB1ZHwERuAY0s2UNgVbSMZfIz5OStKb+8SLf5N5IRNgc9+oaiT66ff240iVokMnPe5UYUqL2TsapfQLab9L6j05D4Zq2TEaAofsrJ9YQ2IYaComJvBs3Iu2zRhKhs5DSmFCuRnTgb0TapkHHryrFuzig83fpeiuiKdIcrf9X4UbgEw2bFvwrHwSDh/3TyOrAE/BMmj/cfL4GK6vZvvVkVVX9M+crQLmCZ7RU9X0CexNcnOQ8JgT5hTq6C2pT6QWKq6vgri6k1fOcRPh/+/US5fo6GK1cJXPzvz63uhgA28hGACcs2LGquautBFFxCCTNgZeeynNXRr1SxvYiJU51nj5muGl9G0Bij6k/6ZTgeDjVsw/yJzqQwBo7OUKkXVzwO4iOFGJtw1lNTCyU7nGMN7ZajacodgiFoTTUEX2allpTU4SrEBtMTUXhdCdxwkQFWy57/oayEOVOOJYmIL3LC8FJTFjqhG9PGPpPddz48Z8kgIWhXQjAgNcCGQsEzHCTCUKHzt1Rh1MeQFBrB0bFLWSYrr2JerjuAbCbVNLKArVsWg8ut05iN1hZTk+e1pyq148wQGCSWK+X9Arlh14IzZir/Ovm7d1RY/QlRr7o97tfEQRPphI+dWlHG2q0NyKVRmm3vKO5ESuSTclh/XSAj3XvLQIlTb1RNU4cGaM+ce3XrdqlJuFQulLpgdteeR/zgqa+FcjihQzZCo3y/6RttcqAunox7mgRKM1PKb8deizAy2+ZHTmqQGXVks97hRSZWRc6CTyJipg64tH1f52rYmJkymjfWMNc3NXL+2mp+A9auTSYkYuVUtWhxXoWpFxtBgbtGHZFTSDReo9esv83T/4S0pW/9hSC/G62nZlmFECKdnqeYoV+1EkQfLKUcclBV8eZDhzlEYyyanW1bsGaVv8PxRF50HRm7hgBfzaYNWfdEQ6cFbDcOeEe1tqMH1Vz8B2VpS36szaDmmgwuh7WraVi+0tQigsMvyNnTkwi9ZE5bSYo/mefzULj1uWKvj7Ki7iXF1+YuTOYIIKd1opcuPmNZ8S4pr6GXiX4ESk/9TDvJl4u4LtdV5nLbU8wW7fHeM5Bx6GOhtuSL+5Xgu5g/E3LpE4QY48nL+RlaYHgU5LwWbThHWC6SlNVjLan3Z5uj93BdpqUSRoY2P8VLys1x/Bg7uLMd0Ep5yh0pV6q3akAmeuLbs/8J4v7kyxKLtU9r3ltQi1PBr4JXKQfk+em8KQ4lgcwl0z9UqIQhNCVr0lOS6GcEok76cTYaCtgg06c+ZUhBNhtHda3WfWRCFwYfIBUtYk1YMl7TtWKgyOgcQGROruRUCOn8UzoSm3tgjoI/cl9V5ayMnSlP2zKm/o0ZKplEzeDJMq3mWWmQeELI/WTyNTeO1uJlUUAvcLhXgAG5mfYENlb1eAO0W/vv+5n/qEauZE84HGAZ3P3Ca/QaKFwdfVIEhC6afkCM7yO03oiINdlBB+xMAMOyaQfys+weyzwYcQKflWpOPT+S6+i1Z1Bvi/RHXzLg1X9Cs8d0p9TF+BoqQ8WFKQfRbrmM8xUHTP5Q+VIxkGy5gls9GYduoQpCfrdZUMMgED4NVNdoW0hBRQO5pCZyrRjTsKX8HUJ+i0EHKZr3eO7L3tBUkVObM7z3D0DwPSW2OhsYJk4VZfGVl9JI30aPbUp099sGEjmKdJcegCPLgMj5w5XLpPci0e/YpHsDnctl9t2O5Ra4usd+EtL2SZuyMwvAOu8ogIaB0TitvuUIQSyTbUzKe5YMiixpO5GRhBxIGhRdjo1BucJFNxScy93wgfoAZotHxgKDnKfYnKodbvJtd/E9OxO+yu/4wYNkYSCDOAUqsak/jH1cKhavaMfaUxhLZ9Ak9yeXRjhPDvglNpuoYwYq+pXn+52as6JtjqclN5K00yJyO9SBzvXHSKGGaHuEMYRoCXE5Zc2BpyIEbp7FIgTCtCBzhpY+s+JbZWMA03yEUaMYZhj0Qh4GhxXTaOYSBW6+wvMim4b+H+oADkDWe+HNYBI7/qOnkWZYuy6hk37JZN2V/U7yzS5MPA+3ATSkn0XNi2nYBDv5DDYFE/w1xM+j4H8iB5kRiAT8o2mCfy+WFTcR6kqnTbpM/xeCPq2qC2GIEAH1Tb2oOIJbC1PsaFh5lyxnqWjiviCXdsnxarGeMXqkm4gvK1UWMkVHE/09IzCSS06piH7jsziCAZSqRt47zM57hocz8RXEh7JER6HR8b/mCFq84vh/7ltX/JCmrf20oGf0BFeYLVUwv5ZEjsG9Z2n5MmB7bS0WAbwfcasGzf+47ZM//r1lxpdKM5qcMbceOqwBzyajto9jV1lJrzmCRXiKxz6ifDcZr1JjL2EBLlRqqGU8WLRxzxOlOIM9oACh0cssdF2c6BU5GcUaZRlhHLwuWfL5HIAG/DtzRrTZKbuZXjvwm3n2iNiTgnBT+sQZ+NLxoP05a96PyRoCtuBQ1HSCfaeom2Kp7GZa+A41AK4mT/Vt7StySwXRVQxw/YkVqxwWWldl3zQFjvPZHhXakEK3Ba7EFXBqe9b4sDcoAnr9qvAcKLSoYLKVet2oKGyel/+A7L/+TE0FvYMsEFaptDy+aP7+laB9AQxhye+sxk0nhq/BxtULPVfzEkdLMc6zYS5uUzW6elAUzsM08P/ECEpjvQ+NxRXQeqVkS/pDN06zP40VYkz3zYWo7R/xoskloCN/QoAlcWtCIrAKlIzvkNRp3jScdApKyGKP9OuZ9CR4Uc2eb/T/r5EmJZ60IepfZK1xPUVjsNxFmVI3OQisLcMhiSVRmWM+rGCGA9BSJOEcuaed+UPhjtiwPvAm+Ric9UMtuAQI5//AhES8K8NWutSlMoyNdF/y4fTd38pCjJj0O/ZwGylQ/hJ1o2kRJK946qoXsXETMhk+T+iDFVEKji3trVKfE2TUoyWACyswVs9z11Y8SvH4ow1SgEWOv/qwzQ0J7bUVN+2HbkmFnXML9ABhq1fHIWse1zmAYbA0pWBv8lD75t6vWxTtfMdTykShWO3a7z2vO6n8rp9L+fvk3n4dRdHTUfR/JWCxE3Lk9s2w9W1LHn8vVNEaeoxqvEgkjG73fwRrlSsXiaGLLdAxXo76wpu3/Vl0RP37kt7SPyM/We+8Ibh5+O5OjGmCWxlvbuwEJSsQvnzEpHiPZrSlGX8Pgtubp9Q+WUFQHvRt821HVFXcaBWAYhxVtVBeLs/QSZKTIMWetmldA+Wps5HJh/pIPQi/Noad5DPkbmB+jfEFL2qkw12gncbONID0bBLVcfmvMrKa0XEbup+PZfZWilAkmL+kZEk8p3ORHyIIultzyWD0fsXmDo+YX0BmyYc50npQRRkENOtO34p3n06HtDyXhgU7um2KG9pVQ8bkn/MW7MJLfZcx4q2/Bdis6CrhSIOblbaS38G6+/ARGJq7IrnF2NwuN6macHhsrG1p8iJpZGmupaA/6a7ntVdNrZvHRGTmYpnZ0YU3cdWDkkHbqD2qeNTy01zr2iGA7c7gHopXOVO5DQ2mZPXGXiDwRhSQUVqQOTTaF7bn1hyk6RxA24tQD5FE14Xz2o2ytTgnIsQdfaAOQY+6k7dYCyn390yivKN4tFv6E+WOErXN6CPnEeq7j66z7u2AS8YEPjFbRUud/JC6DdT3gAA+6LrXFb0+2rdSjKXw8BXDzg3WewierFu8C9atgWWNwzzfS+IqgHrE7pPosJu3PTuuWXbxAyPREjp6DpJhmhk4sW32Iyu/WESRkOV5I6F+t65VbZv3XujRWULBu1UhDfojGiAmrjPgP6YTCX91VnE6fnIeyAEH4addsG39jvIoBGrJUjq3uMAu35atxEp515yk2h2Kbv6/643TH7PsHobnjNPIwkwJC4Im7bADZEWE+C6wNfm0/fYFA7s+KVdkYSMstvr6U04kP5wngOpFdhFHoUXDAtBSdBFYyEezYTv2Eo4T+P5khcBsuayZuUgS0riP8WkZZ88YAtAq1t0i0BzpGirHKGUDefEnplcw0coFw0dTUpCwvfVVLhZN7RlAEV60NtyRevFV2VCAwO2Rfz0GV4x5lDkoBznIsa7ZNpxzjoRb2h58utjLf9sZ2Ox+vdJ2+FYYdbU3OblUgOcqqeELYJYCeL+GNagfEXDuK8hzXE/GU2mnvZANYfqgesiP6lY8tDHGTF6s5M+cW+gJw3xiD2V9aMIfn09cD/HSaoU2mDCA6CMTdx/AEmto4GG5kLabBXNzD590Wh/EccAd4/C+0noBEwuq/hwWFzVqCfNoqcRoeyvXpehhLcdmnAVnhIpszJfGB4P1y6drabfLGh/WgqzTYHWy7odil8e8YpjOWuXlsM10coZm9McXTv0Fc+Cwt2N7qF+OPWiSxf+fraClnGeigkO0zwd8P1ZA5ah6jQgXyOWkahR7z7uvi/lD5tXP3pVYAkU8NTqrpv2riJgs+dcRw4KGVakxGWISRjKJeXEkTL11R5rBdibJVkMuZCKBsXlogrRkhoG0ZaQqXJnuN9QaVnBDbvZKdzho0DUuKKOzTYiyYZiRH9AsCdtAgh7xAcm46Y5LoVsa+J640S/VVK7TaRCJxGRaIVvBf1gw8rcNRfgNKxL5B8hg8a81AcooweQckSdwwGNQtEzEGyjoJUdSO1aT5tkuWsEX/WVGj1c/qN+E+smiO7qCh/MlkoTAxacCjj02leFKOI6uYZOMgGro0c5TaEu9RkoPTsirrdZQ/pAwmvEBtm/X9MVC7MNkjLvxOcKiuiRPt5ca+2niFGZWXr+XCPxl9opyhNK7OQmwqthjp9yEtuOGHuDq/EMx7cwj2BaI0O7wHeUR4lHGnJ3pI7Vs6bBNAvJ1sjzyQaBri56YgL8uqaK2nDiXfve+ZgQA4FbHbzzrsrcXOzgzRAZQjPV6I42A8DGC7OK4vR4KVsaN4OiCRaZ1rGqd9WqrXRzesEZCPDsGVxBm7s4jGHe+HvmJ9M7BBRZFpJy2CpSxwrvEoRuurtp7xb+R6SSDPT+JRD1F8R9+VpbYVtjM84wJWhBH8OsUAGwS9zW3B69VIwoYG0OOO/a502Ur2ykPAFfdBleaGW5lJWGhJvJ6vb3JbWIrhMgHWJyEHDpaJ31zn53v1OheWDAGXGhvgOCa2ZK5Z7xnh5U2DRKfI4MbBPXOjlOx8UA4vMmCLbPHP9dysTlW+kuL9m9rTrLZN32RAJC9mw3vQ656OvD1sGTGNsukKWmg0kgKZT3/z7yDdC8dIJeT93B9SXhG46qjVdGSl7k6ewYzDriLnh6B/qEHVlqkwGhb0dDF2asBnsn5rAABS0fo02BRBU4zcL/WAOhlmwjQKRqEl/hY3I4tiAfq+4cRbAZBJ4YTu+8H/BIeKF2bzfQzrjwnaZ8G+vwcv6oMts2WURYXfJ6guuhw/WQvzMRJ1MoTUW0O9QKrrTMwYy1zTQ2hjec0hQb1n03kzS8v2ZGturMSrvWDQ5uRkf6lXhKAIPgeR5zzp6JMFnSPJDI37Uh/uaBSo4TYkbNQ2KuVT5tK3xPnvGptFpQ8GKjeYn6jn9CF3MZrJHkAgwpVY+SsQnVu9n9juKOrUIYmesiPHwX4YHuo1Kl5P1hXLb+PgLN41z91fOu9JQf73OMJ1YNanTY7cZaK/7reDW0BsTCGlg314nQjBGGapBsLzampOXAhIhcx2vCACflhns4S/X1nOyasxhbGhfeTMYFpa9uL9oi85zarB/0kcH6s+/beIXAtyTFS89Xe31UTXrGqE5DgoMJe/6/0jNA5Eshdv3DT+/q9kO/07CrjBhqA8vAa28+dKcUHH+xcDumPCsYWtLR/ryC0fOsPgVQc6V/DiCE+PVRRJ+5HNNmCnMj/9VnCIP9qGseVCVACwmkCZlEn/RNlljaeoHKq1e0vWKZXRevxCBekz79XezvFe+DtYmJngnK3bQCW4zhlhrU2na8sZ9my8TRtS2sNdCGjrKU2tVNNhiGVurjuXKEm0BN92xEga7pAweB8C8p0t9vGvhphFCu/pmuVlr+ZUEB5fatL5saJRAB+zbUeOzzvHQDoIxyqeLXAZDA95564Kudi6T8aZBklupaJSPYMbJBY58Bgbx7Nn+4AclUUySX7OfqHztggHjK3V/UgX8mESCe3+A0vTGQ1SOGXQla8wQG2E/n7AgOs/KGDy22gFrX0H1Xc0QR5j88Ls137Yor0G1XwVTz2Y4RwHIVIx+zXQOcTB+UpFDpJ7aRDGWYMEj0E1xHu4wHDAye87U6auFbOgr7inDWdyURD8sqPhF06YppE1mIPCQQ1TlHO6wIKGWkIqIyoWGioy8H9AmCz91uOedwTOo2EV1gj6YC12THeDfHO5EzSEQPRI6VkkXKhnWo6Ej4fazFM68M6pd7NGI41I+Zo8/zBGbAsuC9RGL1dyB7VFWLxkm0SlyHNH1CQObGDAhgFlBPd57ZqXovo6grB2/bNLCsH5X1Tqb9akp3Ge/zCFpDjwA7xrb4IkGiNYWB9G1gH+YC/xMh5VEbTbJ/DvMfAQ7pXMcCjBt08cEskrVuOLzCgpZggn02gGt9aFp/1joqDphwTo7pos81N9b/t20+V5xwiDifiZlbREDJlFJCbi+ZMbLnN6k0NMa6ujKINNElJIDN6Z9pRVBiCrsp6Lq40vOwnVR0xpp1uarpewzTrgC4LBU7XC869j8euMbuGIMiZ6AJQWWKk63H7eWcanRk/Q5aPay4Nz6+qBAdiFlL48bnVY7LABLAuthuHNpQH6DM6MlZVeCcrQeAOOQOxKWWTeCI7BzJHGt/nhRZ8v2Ir96BzamGWCQ0MZ6I2AUWtfGXE6Zj4Z02dCB14JX6sU62K7S7PMZmySmOLkJ6GHf2sJ5Xxv7w+ArQRKOa6tWE9MN4iV8iQJprNSsXg55naKh7vB46P2DmBWCrXhAAOrwVdP6zeDycg1m81H4L6OYh7RQhKosGx76s046VXkd56EYTjQz+slYEdTp7G1q+SKejHNSH89pqXmcuSDNM+YS/SrWjTk7BdFhIJU/n4EWDiYBzUSFqI17cEptHep+Jgnpbv81PxeI1xrBVzY/eYdr5JcTkBWRe/FUBAUqPdb123ye4PXzgBIfmbYKKlemdfSYnbOhfQSSyD8xt2TV/KF/BGVyMItOvkKE+zOg/9LVpxe5h74qgUBTPlV5uIFAuo8hcC0M+JkbTI9cxzNUTmR1iWubVZZaZfC1cT9xtqKye9eKt4uvW09JAmIdS97BvSLcRyHC2vh/TodIMOObkxz6Zlg11Pp3PAvctAmzf0xsSosU58UNW+fzXKBQBJQZfdHkGEtDhvIbX7+W1H9aK6d2ORVQ+NqT6dxfws3Q0OymBcRHGtkvTEJwwosumd8xWWMQIjhyK/MIrl1ZACTa3TJuG5fIrWuo/62ejHQQP+wN6+1Lx4QCHv8m5Az/X64oL635E0uTVfmR+KqjoG98kWD9UuqWDtSIyDmJ9QQ/CV5/VoVH5ugkP6OkX/qdwI3YKZCGJSR9VqJM2kkGnxYTbyUzpK2En+knEaxiuvkXntXDGMACi9jtqel5sYy+q0DSPWJunmCvAWUXEBxwvlAZ6FPo1xxXH3uYIze+78r5VFIHJboWugIksf7F/TaxGQX1G5N0tvfLo+nWgU/oUy1DXITgu9eZQqKgZS1LuqJ79iKvJWaaHkcTMRgFLaKhd75vGtXlAx+4nIkYaS8ZmatI0u/X8e6BPUgXREeKSdglmZX4x4l7RJA7LvGxB/w5Cei7AuEkks9/BajLdvZicQwf0hXexay2yIhuycTyKXWIFa5MP+hVwwlY3NGclRYEnGSkOwMZDGN1JM3XKh5xhy8Sq4r0K6zv5stHimyLw7eNvTs9Wzx3U1Iv/nBMZj04rcWIzSejEitr+GuBSiBtHT4/CODC8TdQREEiaYeW0Hdvlpt69V4hHXAaLeGjF63khp9DFgcIAjZWOdzlKvteEesWvIILbS0HcNaIQt5v9mzV6RNJ9UTiBxgJz09du8qUAT7DlG0yP4M7xYqPJWiBL0nPh8yOhV/AW80OEdP9SEIfJPdyGE4X2t+BHu4fkXdRE2qQ0RDxNaHqg1pOFfsrW+3NOf1lgXbfcr+cUxIETfkA9yRhhZ2NxQ5uwmBlLTYC74a0KokF8klJhKCg1R5ScdUmCsweNvUjPao380oaL3mhghK7fGeBu0qYdZVN6flmZCm7Mr9anuRbMTi9K+7VJuHwG1IXirPjOTWlW5myoxNoRCP+EsO9kExjr3KZzMaLGuOkBIzVr17rZgaEx2iDwKFdz2N61CrBANeAty9SiTdULm0a837nvUm5qyBjZ0Loet849HrnIZvVoX5kbrJ+Cb6NhE+oe72UnW2fsZfnCACUYD8DQWTwa4wbS/x90zChLGNnyEsEzHDjMjc5BCo3u1PssQejTM04MIg86HeJWbn1/tHcSb4+2dS98sHMldHh3ss9tzK3NYJnQlkBYTqpUMyT5YmvuGOV+gAkFc4fy6IMNpVlP4nwjc6s5sn7ahb9WYKXujnjnUmmkP9Qg6stUmBMUX82l9THmG8yQhOMMTuvKvslcEO2ERuTig2QxrdBJeVM+BeimZ28OLTLr9COB2Mn2abOnlqy41avrdHWnrEGcO0aU3zSC183xXgubZWl/oTcMlP0G6pKVusiZjvl4cL4QFsSTLFqG2u7U8Mv1CTfCFKpL0B252/WJxxIQkIu0sGVydr0ABIYErxU6E7Lw3Uu9ZhsD6bURphQnB/rm9bj2n5cClyOOpqTsgbfJZ/Su6t8bp6CMzA5+xyemO2R8dILZvxhrgKtFWwK5aoFYPHGXqVHJwvq3+TCXlx4VkVbywCptC5yO4m1wW8MxOOIv8F7hy3rppfOmwdM+fzApgLAXmfvbJ2QUdnrUHAUyyYJohtiuLM8ijkTpf8UyUiiQ5smqBeTV76bfmD4jSYHvsN9oeDCr3C4p7krSNtDlGiMGCeSrofo/FoGNYejv+0DOVi4T/yoWQEoNlTDH713IQSkn/9Q/2oCyMb3Q84ROobFjY4LOTKVt9AXdfyrzWkP7/2FmTS+H5Lp8nSnY9oNPpyZg5dVj/JLyBztRUvqJPnPrOIB1erFbu6p30+FbhddOzAdhCGnge7ZMqptFKEKwH2F+a+DFdY/X2xWdRHJlaFnwsfiMOEPqwfhyVJp+t/jt9nFMZdkflXd1xEHWBJ5onin0VEoqORPQtAPd6rvWYW6TY/vuxmF+liJ74jv0tzXTchlhTxgtYM14iEsDzG9nH/QhvyLX1aVUgXM1XWinFMDyp5nz3lt8xQC6ybBeChIgi0ZBZVt2H6kJa4SkSOdziSDBc97R8d/qRCShdHM8/rDIhnVNZN6oXpeVGv5lg8VlX58MFMAucTOjFhTwNQ/TdGAmkmMKkhXoGw2nwjSxSh1bcrGmvBkoZdMCw2KuEJRIZ9iyRLGB/Wx1E6GQ+1+uSmabo7pNJr+CtZ7rntpxNWnI4XrwhMN4R657cSn9uU9gyJt37VVS1W9mheP00GS5AeJ4ToVVR5ySstjfkx3XfTFW+eDxpmkynsga72TrDyckrZjcpgRUY8o8eUS5TiCXv5UTq8vJapsludg9KwLk+KbUzO84YPgvrx384g/ZIBNdttPnpKkgaztsRVzOjq0snQtz3VRrxEiLPXeZB6yN1jGWZrAEte0dvhpCO+snROIHxie3wI0bj1ZtiSazHJu9i2Lq3a/SDjfEoloxKgp5OdnuUUe7Eyr52gT5bcu6CLrpGkcYDaOe7jz6FGMCBkSrpmcxRiwi9+rbfiRUOxwzgWEhguAV5NQJYOZNWSiG7g2VhK18t2X2RWMREAuy8XEPRwGA4NTfbWMKCSqKjpE4PT6Q+qMcAHbFeIrx7nSM8AiGLqthZVfFq1xTtA1ryFOi+PYkJGeBS4TI2oAMPZuhsm+YQ7HoOdpNfklxvymfUhZz1wj3v68gHEwy+u4dw7SL+dxDOcRCGtxB6FsO+jR7MizS7uzGCn2M/4IrKA0k2/ke6CY9ncm5cLDY5v7CeZO2jOaJgWlJ/l7n7jlv78Qs0BaOJsvCO93XccAaAueLrvm4HwpDNAC3uV9FYAnMbKtozEtKQAUOoFFGEaXWodTF2PJhHyWo2+YDV3/BWETFhY1pvw8417LkkcmILq7auh8hwvaWxwYsryUZD/+lWz0EDnSSywHEtntwbxKGny9SclQ1sPpRVphG2TmehFmAfgvWQH5+VPmHy/iBSB8fPwhLJjRjvWnRoblHbTPkyWo9D/vZPaRRe44DAs8uh33Qn+7bkwws4+TC7qEDvQYAEY3MBq5Wi5Fq36fevf+Qm6hX5lemVmQO2L3agh0mcA7HsfsnT1P8Cs808jQ/zOGFUenjiew/byWX0r/hXP2qCeHPvZaaywbCMAtpWKL0ZJ5GRCjSxGESeBgolkGQWuT2DnJ0sYMLimRdpFNMaUptMzQOLdC6kfJc3ap8mPqqR78ZWr/C4hMlhfATg7zYmaXZ7U2VF3GPcW1vKc+ZUbSC/1Wac/AkGnvuI+f35iwdOhb/9qRUwlpE8GJS8jhEN+6QC56X754KvEcnVkUjp0tEEK6IkWwGQ/xThQEGplBhNb2cXn+wlG9AOVcV/16D/p377im1BdAae8xuudkw5PcjInBOTOXRDzeDuDVwXnqytaRjdqyn+oqr+fKHqGPgErmF91I2C1istiOi7TwG9mRmT4/6FFejKp1LEa25Ect45QKwVbG+OMMkerTUTd6F6jT93SuCGNkCeCOfmi5Xa6k5nHv7vHpSBy5ng41p/dAVb0b2EoC+KVRzANX+zNeA8bvwXjSd7uYELshOmhD0jAdFPONjWBihQhivddK8wi93D6Jal21NoD5KlLdGrN218U/rLZMOfzRlvJeh4lsOYyoxv0dJxlA03uREt43N9DnZSXctkp9lPzJ0jzxAFjMPOS0v3e6Kml59ePydGtWLqqE6hzNdMm3j3wJCA5KkL2c2M2VAcEDwgTqweonvTSs9wlrbFD7MvXpim3fys5vhn5gxtrqiRMa5A4c+ZuD8bLEskxxa/30op0zsnz7ThUYHDqV5405CkSHEezLKxlW0VlRsG1opvoZbLsU3Fd+Y7NwB75fNodVTxQ8PzWIeqlDLNl1TMTepalOCfaQ9vqGjGU+xi8Xx9HnCcIqOW+Kp6R9QrcT75WoVF2lL/b+LGTXwa+g7xslzGQk0QMofSPlAwVX1VX7TS80iRD9ceXjVZT0nA5PUdWJ1rsaTmtPNZ2bnP9aI7CeP+PVeBNOjMHPOzWUHkE2khvIBRE0trDQi5ZfgnF+qJ2NApiUqbN4v5qJDLAX5Plw66Jydr1Lwi84vNluinWyoRuyOuaw6vgndwKCz9xqug7kbEFCQzuq6PYf6pO6eyUYjasQidQ2SnO5hCiD/Lm5vCOCu//m6bBnM+X+ekJupBPxwhPlZBP3TvzPqJMGf+hP+lxQL1pFZS+uAYeJZgiBLev8s18Eh0ESaOPUwph7tuD3lNMAQEoNr2Npg6u+xSFrrD/ZV0nPqhuJKA5g6IV+pSCHorcVAOcHnYzRdslHfLhDR+HliCS2/F79jgaD7MSWcDzjpfQjFdpGaqRe28cNp1KI8kYXgJVYXXiwMZZYZ8DaD3Z9uM+gJy1fNruCF7bC6sYxYWbQ2OXgVvFQtdDejkqSU48kHpdUjqVOVE5VjEUXhDa7fXUpzidbG1fx9q7UXptvFdhxc1dffAZrppTNIOUKnl09gy8XopJHYzpepNm4iyxp0QDXbLJW6oR4odhkwmflppD+ZhP23OaMal2ltLO9Dtb+/wxvPxJfp6GX0dKvR8W9eYbhco7inPMeRUqSO60zaeMJM59HJP5dtZupfWY6Y2jJdW8rmCyXj5BPjdeVmI4hirRva/CJ3MQg7GYfVba4NKAYCosyRbU7+qh2tMjrWAfYgLr+k51RRSro/rRx65bonTRZVXZimcpTCX7MOVhvoiEosyU9y7Fo5zIkrJ78CQcWPoh9iGdJER6KTcibhEynstwYtm9ldTXG+RI7ucRL9Ut3gfW2X2eO4YhR9hgTd12cd9AicjdrdG+xPL/j7iT4owp0F5qUEp4efu7oHvEohNG2c7g7/SIsLKpwH8/DTYQG4nnvCmLeSF8rI2Z8cmGgG/QTu08GtGBmgebAvfuwiz9p1lPrqusQnZYv+rcaqagqPutLetc/6hgbSE6Ukmvf5ahOn4je2K57IzpBd0fU80G/tqAwOenqySnxbqtimdFgPRlgI+6Luk1eme3MhJ+84eX6k25fvjOOIoNXkCvCG9a5JVCdFf+ZBbyHTBa+TedQ6phK9RCXy7SJ6sTGgLMiiWe0Lk8qU40YtMU9rIN7kBaszEnpM5bmv58+Gl9VbApf/JpeTLBJQZ7ViGkj1A3/wTZ5TgqAjRilGzXcD9XwkGG8wUsTT6Zmw7idAviIWItLUhpGNb+HUKelqUSmDjP7UiMRHG9uAxZk6FbcEDkEYAJPmuhj4C7QCFAP6A9TMGMNK8eFoVt/px3R8jy5i5d2l4z1Go/tVjWMOv2DeOumk9fPGz4SACgaDOPmRacwJidKrvqK+BnFqEe+tXy3tvvKl36lTHoYzWmZFJY7tGVJWG6p3ehIp+KFx76KanmBnc3EUmjVK03uqCUX2nkwFOoLUEfC3+E5Cv19SHUZ0X2GZHBDkGRsqYthlYbE3D6VDgA3Iy3R6jyys7vlAKIPxx0gHk2xWSIEXoW3VZBJm6OHcWYPxIaetoCezqhzRDxTkIVP5mzQW8v5rfYz80ZsfrNdnut2zRR7C/bpqDxnP68tXRfc1dqoAlOQSoy8Mx3y9NE2nU1fjGbrwgjiBhPWmu+8E3BYeLMf6qrZWCWu8R4Dohmkrlg893zuneLnGTL3LgQsGew6wAAMwcdcLq/4VlH2TFhyrUlwXUxVkwbYaw/a4vWfvV9/7Ppc4o0UhMmrGdA2wcHF5gXodRcBkE/lkif3+ABiVPES/0BEKXz4Rho3yOxkaG3MwduzQ7Re1seSOmryEctVJdpEoVVmb3boH6vweqFEKXjGzTxqI2IXhTZjx6i1s5sdpMBBLTdcvOI5NS+0BEdd/XZu3iyn10aYjdvt45s2zWBwJkdJnNoZSKvEub/tSRlGT4iuM6NHElK/ylgDYIEEcjekLw/Q3LOqWiQwIS16EOPf6x89woSkla/pAXXmH0+zY1SYI/jTWrqk2rNk3l9z+sRBcaXndHgEaL48kSzl3xGvvUK7lSmnJVSQ7eUvvdiJvlv6Nt06e305ERtSH8iDYTYKQQE3G0KxprE4vFgYwGCZ2nH9GEnkY3vjIb6H1zVf+/yLiTto+zvMjPl/w31gzzzyoprFScDcFl6OqP9mJverHIDdXAFM8LMKmb1SYrqRbItGauLPU+LVI1+OW2pYZlbINxLdga/Xfyt3OP5WANjDqNEdY8OIYqcZtvCJzeHwGFMxXVnyXxiHIQ6+cNDuFZpk+7gtrTV+SQheN8siXieDUbgzqaCfSDDRYhez5c6J/SoQ4hfG73PxP6JXTbpPmIu/brsS3yp3+tXgchuoO66qv1gxRzfv5ui2bXLIKl7vNkNvNzzNN5qrs22Xe/MSfiwvXHDoDoopmIgpJWXeadbNUssZ2F5S7aHTWg854cHIwKkZNLwo5kaX7x8Qregi7g7yOCgKfFeO3FOlepHhr6LxZDchpvNC7vdI4aph2UQ+izd4esUxDELW2gOr4SA6yH5b7uAu9h4jw4nQUhFKElxi86al8mmO83UxILSAT92+shqg+DnL121h9wnf9YL4THNPCWtdtJ6E4lElTxykzOa7R8yGfK6ilVSmRFuaxt+7ZNVsCXYEXo8avoaRPI92+TiQZytqbQu8xveeVCI2MWdovP7rPpdCkkWRjJ+jB+xaMSidMrdGANK3KIIEixy4z4deO1uy0lBcghRgNa5i4EmSfCqobdXhgZLzXPk3p9CIZmeJXoqr+Nw0CuRFX00Hur7ZN1BaklfKRj9jiRIEURwRMpGARDJk4hM/xC2N3c5jo8NTVzvJTIvUK0HpZrIUdz+uHPf3+PAd3Cn7CVmCp+qnntzlu61M1yJ46kcg2Cy3JzmeS5t/UzFsvxFTt/wvOKSjyc0UVWnv43DanJEkNa9512xu2it28PIsDxHTtEBFKOR7rJNzyr/yMR5sPZ4yajtjAiLfoh6226mPjzRyU1RIIYJLDMf4jpTPpT/eQt4MlKAqz1RaB0I4FUPOeM49mSc/AkkItRcOmfKX4LA2vOpOvdPHxdK6bkDQV9t3plsyv1FR3BDwIE+1y6xlwxD8LGcrPl1aQoHqJpNBHVSNgjtvEs7XK34vxCr9dg/cfh4BM5W6zb3Tya4sZN8sbqQ37vyX6ney+wNvJGJNBbF/XHO1EfbzO6EvM2WWvmn6XWw9HnEaB1v+4FYGbZLKsreL6TAQqjzb416vE+RZUJWThJ6nr1LEHI8dy3PTSYR0Xz//nNZjpRGmYIGG9WWbiH9t3H3+0E7XXERX7JIbDQbmAhUfpDRXtbO+54V3JHi+KI//PXREL8bmb7pLr9ISa+A2EHtSUkCJQLZbzUZESJRhuitCNg+rWrLSkURPW+hWjMWpppE4VTVxnQtXfriUCJvodvck0whaCbGhVoLyRMmqKWlygkGEQsZB+eijXrxT/M4WQ8sTKnmMokpUskDhHtQUoqA//WSPAvItdpZ3FsBksddAqtKYxubN6b0gUGeRW6DLDwJjeW5KWVibC36tGpVgdU37xscZGXuSpQH1t1DG4UXvVSPeLeAa1hvuYjgPbJ/y+hfN9+TRq6vpTgNaNCEBXPc4yxkkZioYCB7ALmYLwiDIBGNlfFbX5n7bhf9YzJOunzqfygK4CSb2rpPgjUDPADKJLAyqyC5CoZ/71pcWQRQq56ebGB0qCSgeVcYyHS9H4Wf2hV37m8bsSsJqJ+um7T2U7vvp1CMCT/QnU8ET4vPiOfdE6OsYhr+Hg35RYlkJSG9MyU5d82jGDX7owYCTig4pmaELSLFsV+9QJ1T3d9JwfQiiB44RfKvQVRCoSuAuH2DC2EzdF86s8qEJkTsi3Ob+rVaHW5oKGSnb770VwUznzJRkhDih+O3Q6J4mpSXm+iw6Mgugmbb9Iuf7pRjpJAn5EISH0IvIQM5xzkF59iAulEqITm7/GxYJcOvemEdxNGAh5jSVkpSfjhEPiH3Rgl7s5638BSF9gf5uuD4feNDLtntUtcqV2himJ8UK1wdbAtmDFJQf5c6M6dautl1Wqtqhly2mii9Hk2uLJ4eFi4AkGwtU2oRhdljwON1LA6EWP5oKLqxfwFAx8qj5RPCDoRkWSYWVnEam3k2GKPa4jS7HPuwePhrjMJLd6UqjczseB1Yk1nk2cgT1g7L2t2PCqWb+eSDgdpHZwP5TMMktCCvQcfYMNfWu2/OUARc2HMmq8ksYUZFN4TIx+QaQHAGEq/IjUM9t/PMk9KYj39d3p5izCQ2+RqZBYIowe13fiBdcZNwPilSvSI7aDMCI3VWwS2zkLuCSDtK22Os4LRcjLW0cNFzVclblA3rFcSjH/9IMkAu+Ldv6NzWBeYkuKVcNij9TiBSXbgYfZ0rzD64x3WzrzhLQrKEK3aAsUbwPtiesIr71/1880m89Lndzaf5KhUIVtSWPbHETRwy/4UdbPqy2j1gQ/18PWqMbnCaQ2Y2A0yLA66h2WZm/kNnNRNbpZ3gRUWkoj9aI5owzGpd6fRM7AolXCJ0TeTKJOYxar2diFY3WydXlO//4EMybKDpM2pv9vJuSrYvDaW06pX4luueO6PCuI73Ne5sxJethoYw+T8EehE4xPerRpMWlcECyEa6o20Sq8MUjguUM5u4IVKCTmn343dIcR55jyP+lN9m2XsUpKQo9rzEj51X7KhsL0/ydTCZb5ML6qr1/cEdA5iFPBCwtowvCEmdL2mkEqyyWMrnCzulkCqUKSfSY0cW1Yl5QE5tLBTWRboWuQNWJp4jU2Irfk3NNQoCqI3iXSktNg6a3BbLBHNibOr2XoTSh594kpKNSAFjeZy5P1cb547qElZr2Q5JBqwsthCsCZO8nkMska/5t8/FJpS81UmbgPVicLWTgxOadSVtTRGuuWAp+tyIYpXUSehS/14rjKlaWoM3S6eKoOVW4SiLXSuKuHcpz/udn4PUmEhmXBFj4y/YpTFG5N+ySBNsZf9GAHu80S08A6OoL+ASWt4nIn3L7cALf4dTZNEsJK4Thpux3uLHPJWX59ablW38NvY0Op181oMsPxnwKc3aLcRAMXCUUbgSAt/UboiIxgdYz5JiazEHuNMffZtvH/h5WXXOfvtLrsXCrBmvphAik6Dwji4eil1fyGQ/dGdyZgdHw11D1fmv6JLXZarhwkcYB+hjWxKFbH8wFKJG6kb2bYtRK81LcB/xL9fjIpkYbkNQF9Dh1g0W+dB9cDQ+cgXqHsUIzSJDD1PNZiLfU8dnUPj2Rq7tu5ZqHR2PaLx2EnInbOsF5ONc6Ldby9g9EDtbzKRjiNXAd/ksWqf8fqk2pMMTTAeOYcFAEAJTerJIhcVnjPjRtkToH6+luzQYtbelbfDo9P4r9aMIvmlOtsVGo+kUF1u6JUhKszb4SmywcpS20oY3b6JUDNqcxGbL87kZvburPUGF230fEy9rbbzjh7ATylriEOLlDkrUm+u1ZyRkPA7uy1T92d8WIsahwcMDN8vNl9QiQ/11vKME0Wl8XiAag3TQvq9YO/t3tCpYKMI1vAhngaAXYcTr0naS30pkMVf0cE0n9rIvU1OxxkQUemZnG777i1UxA0+V9t4kfk1ANEgF6sMhiCgwtfs5tgXuU7vqQIe8Wm3VjOBc2N67QmFnqx9RLp7amlgdtTSNXqU1PqquKIjgM1xrxKNfYwZPfTsdC3cPm5UYpA8NP4sMMkefzA2IBrAYUVSJoyKGNiFuqUSW9EIZkqaiwzaqIer7KQ/oU3FvksRwlFzA7skcCS2bru5qYrAz3ttbxzF5LADiplMvr7CVE/eJv9DvGzIuahhtAQojegD2sgaoDThdnJfwg9fNOZ4TMQpEBPZ/3+ljHKY7LbG3YXDZIqfienKS97gzawegK35JNIPJCyfl2xqGk4U+IE9z/Ja8ucb3NBTt1FYSJFl8+LSKw8b2qf85iueXw8wyAsBeOk11jITKtAA+m9GgKDQfUzGINoxxyVQ5GigxDspHjFOIm6zBFPG6epdltYRZ8UWQhWO+bZ0WBvw8edkbsDV5EBULj4l3NzlWnap3jLmIHG+0ijRrPtl3yEuq0TtqQgvrFpXLoXVGbQqVo9umv1XTbCdFXqNb5qT5i465J4EYJ4kvqkL4vLf0jdrr9JbfZ8kqxN09g5odWdQFVJyw8P/dIVvN61PVnZpc2/wVbrQadNhUSZEEf8DgFVjY/nhI3pUa3KN62RH0JKPypwROqvq6yRqS6N2KKajgtWn60Jvoct4g5jUFPs4v4rIXkY050kRd+FhdRhdl71ybY+L6zQlqGr9/MtsSK/pSbCRyl+8Of6Nw5C/VOP2hEIbv8i7O8AIpw6y0iGt1gNrqSMcsYL5Z9oZPvQGmU/AV645kDJIi9Xme+9klR6W9ABMgC/vN5QjsZ0ZhNrtw5ENDsAO3GDl9vAK7COI9dNzYVDatb3RGjTF6ti/og4SJ7f/FTWEF8/zvduVOlzh9x2pvZD3NoVYnQpGJqLqKWS502iP9n4SohXeJRgvRGq0FXKj/AniUXwLBAFJsFtNbJ2Y0k0qAw+WEPupDn4LHUBD97zVfJI1BNkrmhFVpfJux9P/Hljzj6EIqsRbFp4GzAprSMgGWTlJI5g/+xqIKKyAePDF+sH5lzRga/wdPbaBSrrNHVjfCzbvWNoiz4hkQ3KOVM6Wk7nMGGeWR9P9KLDBllTyLcJLiXrZtW71IgvF2GGpTyiau00ipTAEV44MbSZ54R0xZ3I3Ui+wv0kLQ1xoOeFrgwLIPAznxXopwlpfUJO5D43wXlFOYaNj9f5BuFhodvP5nHPXoJwnQ/UU62bN0WgjSElA1Pt8THVFHplQzo/1KwF1nvmo9fT7MX6grwGo4rtl8yloZq2LzQv+U+xzN8Zp0/7+U6XouOJ6AWIAF3sw+fuZFY7XkEbZNE+X1+S5TzQy0Dr4/nI8RAl7gJy7XQa9awtBB6SabzQHp16AN0k0aKmx82ADMvDtfv+Grk0XlVkbh/gnweX5gAVFDO5cl1dzsRmqQfgW/qchpF/w7yUjFIV5OIl5SQV0SPwbA+B6LbBhwRcGRtzpkfcCRasqP08jDynkW4ZaMbQB6ewKVhC0HNsdzylxaWkMnoSHuDPWA11hQvUzu6j4g8Qubn6EF3SZu0a9lIx4h2P+6cS6G3w9p2nkHos7M8P5Ypizs77zhj5vNA5sUf5m9MPaJHzLgpke5KVbSFoYEPzcmm9w3AwmRSO+JQ+UA/YFtUh2vAKaJLmPyT0NlMKf7spcC3ibbx42JH/u+A0D6WRTz2BrURco4kRK3bOjoykA6jAGEJ52yaBY1b8Fl1Rd602EBvk8baEthoMkZA6YAxy8he16ZWB3lRb5zMbkLvos4WVrAvQoic/2LHthz/Q2jQjnaa4vL9d9MDjoV6N3ZGVtAlsnWPyHcxatT/GY6hSdLm3e351BkiHXLs9F5gMlbnnR4cbK1NwUOOGolhMDhG1D0viLydr18/PDYkZnyQ8/dlFPVtbKSfIIzAyxNXD3svStc2d1tdTiiDJ4R258ndF80TKPx+G1vfNWUb5a6o9p3DKkC1VJEa/ZLGR2OEnqrBx2SPyguOx2Hz//U+C5c6QvgGiauFOmoGgNAouQjREh+t3b0m8seTPVG0llzvcwbl3z/aoGGtp3X89DA2Xp2inDLW+n2/TyVdBPjzI6u7OKSUmOpEdRRdXk7A7eKbv8xwvwPgzS8DqgTvsseIcoTZOkMo2RO/kSy1f7veKCDHyNBAEskq8eXZnl60W2PpoIz5TIe7B9zkgrf8xFOp/Ua7lRE+lR9wRusfmJRNPqFo/HIl5e0n+qWYjAnZc2xRjHjMY2bc/07EC+g6GmCIzkFy3U7vSOJlweFH2zn9jGKesh3uDySklVYYOOKI+3N20SE1XIeQ03vVO711yjiWTeeMX1KluV6LA29WxSqeXjUuKnGchx5H0pjpkhAP1fcOItgMgk8MJ3feD/gnFgPSXNyiC+zkzU4B4VkXQ8fNi3ZGYeR5NSTT/YDUkqmTniqne96D8snqtWpu75oLflPEIWn6EFCAB2XCOGqFYnJJPjVKRjvGs75MJsR0e+dZRnZ1iJZo6mz4KkPXFdwiQEWFBMy0RQwY0btl403JhlAzcmpj5c3eQwxjSPVFu3IORlfkaWcfPOMQBPqH7P9Uwz1wAAZ7+NJZox1uVh0kJFiPczZPCPZS+NqfzhxFDfqqcxLVszRTezA98KPsCb8KpoAY9KbWB+0dbBBIXWDmm2oEdoJ4nx6+IwQl5mPR7jExtqqP3RhCIjz/2OYmMMWO8i3sLHXrKR+EWaEz3AAy0rtWoJBHhmCetX0v00fm+IgJP5gN9Vil7luKLX/+BvKCRL/O9dldTnf2juYiykUTkoivtmHVG16JBxWqKsBWiMck5sv24flMDkJOGtZoD8UTQwQFZeGV98U/vpLhL0ehNadPfL0kG01zx9DQMwFx8Jwcc2JnENPm9dixQYLqkAUf1QlxPpSysOyi1M/6aI0C9w4qT2Ij7ipfUomm2VU9AEx9RReEKCRdjWj5MXyZYpLnBvvkDQJ+/YACrHZEXXUVjEtKVrN8C4tNdVvEZQCFLM2gmFOmDtxE1vzg87okCgJwPvhHb9LIejQvpF/dfryNpkAMPJHUjqL3lMSwPq+aOzhJ91DPqZhlR0eIOCNvNbtLsl3meXYW6sqSuBqAoK6aDtybX1WoZfWpEYAMwlXpImlWl0DYYfnw2dExA4eV/3ZoPpajM8whRQuWBIkhuXyQGQ3Ny/17e8WSTGuuWDgcVPJ2yrFVOyt57j1VSz4kWa8dhyJYpB4OWCQdUI3Q7FoGrf81xhPBm0qQJ3eJsQHoE5AwGkT6e/LpzW6Z3o7NT3Pb9RKU5jxQTUhE/MZiZibAQ2xpQQ76BnZ8n2NhB9r3ioAbt1sdozSv9NK9dX88evtow1lveAbrOv0ortv4hkXOs+U0z5dwF0Q5BH8DHc5Wkq8s67jQZMd3ya78vQ5KctEfVTPUH86lwGrH6dH3FmusK4U/BNkTAmNTmtVTNgM+fSowJvkOaVKv3HbdAV9Y3N5k6RpuHqAgcOYmDUxHrULpONI+kk21mCxU1pKtGBu/QdL7PUQr9+YgFzup240h/f/fQPigvwyHhtBYxpr8AqwQakfTvtxBhMAUOHS79u9KjF4dg8iGDs6/IccGFwSTce/NEEQpy6Elf16WKrTRG/7f+dl3f4mL8/u5//V1rw+/cGtdR9bzkrTZ/oU9uilzs5NJOPpH5Pej53AC0Nghe9HY9X53VxAaLolsRPNcHkyFEkh5+UBVbTYSoh64Vrnk+xXJyEGo4OeIegHFvng436TegZOipPQbNop78kAEce8ys2cdTTAgR7EQdvidB99jJGE82s56h+nCw1YJNerGCZboOMsjXF1LVAV6/Y9oqFZD6Dy7XgGPufmpKmOW4rCescKgdGJa0SpP1+W7f5HVGN4kMPM3D971SEMZPW37AJ+qQhvXWKu5YpJkjVr0nYA99scQQqVvpkbK38boe7k/LoiYAuC927KL5WcyGt0olT9H15ZS+dTBSdyKeuo42f+oXzfdubykDEmhHTwHVjgG5i6Ki8Y8UeuaDVts+mCwq7M5P7mMwUnlhEO8GscJqH5d4lHGSS9JM5sos/ucVfhuaas4+nxxgXEDeSGAUkQQCVrlUY76FIs9lF8iD1bfE2VjTAFXm87i7u4257DrocahGp2Dh5cy46pELUl6l1cl+KI/AZKj5RMXXC9/Ls4MAD9F6MjFNk2RWLWfylt5H6aMoqYl+bNomvF6XgAKkQjYWQGgbL5IkKAAA",
  gear_works: "data:image/webp;base64,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",
  build_deck: "data:image/webp;base64,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",
  score_tower: "data:image/webp;base64,UklGRu5UAABXRUJQVlA4IOJUAABwOwGdASowAu4APlUmkEWjoiGTuk18OAVEsjUJMRmePSdc1Yq0t/LfMC+VdM7+u0CdeMnv/5aqf/WixK+0hGiRCOA1U8g/bcbef+78iv1fZtNLry/B/LH2ruN+631f+E/yX+z/u/7f/Lr/o+S/X3mJebfv3/Q/w/5TfOP/k/9v2o/2X/K/+D/I/v/9BH9M/sX+v/xf5WfWL/mesr9y/yK+BH9N/y37R+6V/uP/P/s/dr/Y/8//5/9B/rvkE/sf+C/7vtdf9L9//hk/wH/N///uN/0j/Rf/f14f3J/9Hyzf1z/jfuD7nP+M/9vZz88dn78j+rf139+/c7/G/IJ+l6K/Vf7X/1/6z1U/l/4x/h/4v94var/xeOPzN/wvzc/0PyEe2f8t+bv989Y/cd3C/7HqHe5H2b/b/4b95P7/7mv5fnz9k/YB/Wz/f8nFQc/r3+79Wj/R/+v+79Vf1T/7f9X8C/84/u3/IJ41pJ+F712zGU7lIhP4meNFJipS2lHF4oQMrzpw67MlFEQlAgybdn+Xhhn3+MCLqJKZOpLONqJWBO5sWtSsHYiGvaX4OFniKQdIaIh6whjwbCTko7C6dWysKzMIbfEXqSwzk+pZ/Xp9SZEOGUYjPSiM0SH6sWZ+7Fkg0lpoVlZLMl8w8RpZVA0B7KGzp8nCKFbfD4dMTyxKG5pAziirFBg6CDLdoO1aXqs5oI0H0KcNstqg+Lm8ZMAfWgkn/24RtKfe3v6r73ldOBeq18r7c2rAePKmQ20SwuzW06ypROhKfhd3oH8or0ReojA05BGJ2KTB2EpddJ95cPa2DNNnHKVfupGV+ohEldOq1gawuHf0w/0hUXB8wmm1MG2+V3YchcKNaFie6/mVBVmU8FldVursB/yTdN43vtK2ICKeo2q+QfdzOu2Uvv6o052bN/6yR//NcokojOk3LYIXrdfPladSj2zfivrY5M8UDfNwphUYHCWe2Vmtliihe3IwgKxKxWSPOvK3/lRLWg+oqktkyl0fWS8DEQTuTMVrWQvkyu5RISVqiPCZ2tC4ZmZgjk6UiKp4Av7qtWFJkzYzZeZKa6Gg0gHnBVJB9t+Wjgwyn6+3yydcuRgggo9QasoQsVFUClfnj3Q+m4g4dOfAIRlSJt7VlUtR8g1uFDsVaMEFiTIxI9wb/Jn/RQgpsWLXWtK07XTPXWbSxsf8RO2MlCB5G9C97aaXz8b0b9Du+DQnUGK/Yhzh2c5Pm8uI4NMsP87x9QxUje7tQjDVNLocEDjenn160KLLVKTsEXbt3UFdWQ8rJBuJfESCKPUeYFlq4POyxa6G12M9zmzoyJDOXrdaW9uqpWV3wB2ArYwnNnV4gyo4T4kDTgbRn9qvnSZvICU5gFWHPFJzI+ZRoB/Q9tU5FIq3C8C+MXIewQwoxZAO7Y2WQTN/yiaeGpe7epGpXvd/jxqnrOZ8C4z/aNz5sT0bdmk1pbpG6ySrjpWvwRRArzpvujf6ZC0kR9Ube3GrGZzqse5iqh/cmD1TCJJbI4QdYQKqHJrmNRvl35zvGvyjOPeJul1l8fEAxKG0YAZV6V6AcsAE4EZtMOrieG3eXPmkzc8PC1iYHGqc9kvK55utrlwvrlujAkPcb4SSvqSuyC1QoHX6dUwEtJI3WnXDxD/iM97UEQsF/AQSvKxtR2GE0QhzjOJ/HJtLflBoKPXLEkde0Pp0bW0AEeXVl87rFEbFz0jRHjvwZW9z5Ytz2psWtIgc856sfMyjyGtqXfXNQ2q1p+4JSkPVJmeGfoMxYDt0HdFFphLt7SagSg4pDRXrytW8iMWD8ocEAFwBZqK38B3wxoCkr0toLg4rsheZwrhdtUbBmlKfRTt/QwWLzgXMLthFQa0AnOqhhm4cHblTbQS17TwdrSc/f3npEPK83Yj5XYzo2vInDzAmJU3a8NTVgm9dsE3jx4Lb9Vw3MGCgvDVm7hH4jAs19mkcEoY/vxjrM2GTysgyhVlkHI1IVHDbQQVLnJiZzfLtLn3nBwMR4TgH6o7HE19Fx1bLqHl9P053OvJP+4rpJz1KZA4tvMNqdGOtCWmFiWKZBP3Da6viAImypdPLLawRufdjpHdCPIQv1ns5Df/w90MuENEWGODS3qzd2kJlbEZ1ve0tADPN9vp3/9RxwtD4Lb2O0cyh7ag2AxG/hX4lM+00S9lTEEvCQRYhkVLJtYlETyabEuCpG/fg8LbQt5x/7pI2B9rbGoQkO9pmegteXRblFcC+68Bgt7JgiRYF55m9JeaT0mScvNY8Y7iYodVl0ZU5na1a6yoVainhJSLUg8xfq//ETcfKywIs2Prg4vePz9QihukQUBhumLvz1lh3XNqtzjiKOU2RI0HiitPaix1HB5cMOK72x/gns/Ho/HVVoVt/FJz2bueeQUb3DWBdqDBVQDA/KjwHwB9r0XigzTScDtbDZ+2svGMj3srWNJstFmwsbjrSLnJyR+/z8gjO7T4qlLdSoT/jQEOoUal6oP/4x9Xxv2g/b/Ebnzydhz6ayXNGu3UFj6g0+iEpQUFCvSyRm9k45067fJ9IGLeS1B8HJ9Z6W1BZWCffQGKHHQmc16vaJ3rit96jkFRWr+AkoA3PdDbqxFyvETcpdpI4XJqVriXR5gMGxCIRtZox2pjAADKej0snKklJL+QsZThelKuRdM2Jipu5Tfmucb/9vorJBAC3uTg7kh4Xx/vv/vy3HVHVMDm1eXjvLpIgqPLJoVElXLuvkyqNtWpOOARu4vG4kj/5JMiFyNqJGM/ayhcHb83orHYJAiY3Dp3NNv+C0htdFy4QVDjX+wTWk85b+ICbVr0CQcUu+jilPn72HgRwb0aG3qy/slihSncn4023ZMbYunpni3/8M9DcvmpfLHGmR+O/gwPVlCDG0+kVj47ZGCTgL/n+DKd0cxhtxNtGlxNc3kcNcQKqL2bqckTZoAGgkR/UHHWetieuAnpmSdJHHi/p8wp9uDGDurcIi7pRbLg2A2vEaDMq9ir/oaOc2T5AhPEnV32lsjA0rWoTER0L99wi2dqlhBa/yYEwkTJ/jcWHdBI77JosYJlrQpGufGk1mf7Wnw30AZB1h5v1oXQgCPHIj1EDhXEiG/UsNb/32nu2X+2w60Cmv28jpccddhv1I8eu/7CkrV4qjemAQYzZvRhCNqV6hryDBqKssN8if8p4btFww2q3x/uwzlCzDnVWVcgXYuZVwFdUN+mmRkYT5thvbhmJVA2w65rJ7S/Q8tRDIefEXV6U13grzgHFkTLGbe/5zRIDVk2bqNFClHszM362VD3g8M/QlxuKjw4NW3In7eQ7JciQiy6qJsLTVixSI+47kKisqfN3nNlYjUcbnERZ69CFVT6e1Tuir9cU/ba7bM5vdsAA/t6A5kIlWRxpO3e9Wn8u//12P/Ox/52Oi7//AWuJrcFLSODevpNOdNNfqr9/cgf/i96cOI/ReFk/DUANh77JVyR1p7504zz7+9U2ejhIu3WKue+6CEOAbE29GAB4u5OQ7pRRRrz+inj4jsaBADc0Hz12wefsfkVBltBvvQq4aoY4/OJ2Em4IW/MOvuw697bN7uwUxOxf2v8MhoV6cj8SkuNRrGCH7OOeTMzAjsvYmrejj3AoR1XGRDH5tE/N+cwoEPihzA1dRnWn/ldjx4yM0BARe4cqHBXnVT9v2BJDu3iltQGNWx5CI9dukKZzdj9GO9QAFCWgTzjjOu5N3gAz9fqTds/ZaCNGo2Sx4mi6j6ZJwUff5gjBK+CkMpC6cyZjzPlI2W8n4GAWZWiXCEtHm63vSFkWeCUvGL88AY5x7pz6s/958c6hvIciwNJOfE4D47oa0WGrcUWDfAoMI6rpncOgj615FM4ANsC/iPKIQ6t/VLB7wiaGH6plQHfueBs29Tl88LW+wiuq+6toOOipBF7yX4Zv8ng7QwcGXAKywSJaoaNRgkO3nTRQSW1Cn4XLGTbrRx2e79ue554WaUlYxJ1w/u4H0s0nw3wPPgoVZbFvWfRX7ERZ3p2tIRw9g3KGy3IIyVVheQpphf631zzg9f+bXdcz/huzXdBak8tDm3ntSZdRvFAepKWsCXV2Z7eE+GYoMGUkn/lWgLAayaZV8QneKHnWlTqBtqe1z1cUhs6dezxb+76/LH7mLMVtj+sF/Zj7bEzv3TiOjzt54KMTkMu/EnPsWXY8HVPoC/rLM/XF3YMIP4fpRZvVgtwPRqNJ05JMCA6UjyYtVmk//XUpLtn9j1AUHrErljupcXkFa3V5effgv2ph4+KaC+kPUUtnlrn6OYC+NVteXhgiuNXA8efDPC/eJwn2s4yH1cTV/L7nd3lrekFJ3Z/0+EB42xL2I7Y276YT0QhxGMdAS9dVxVulQajuT07sVMNJ37SUtbgYTY5hnpkSocecg3r1rRP//dO1Aoa0xjPmoH4T2LEhuLj2YEor6oiuAbAUscxc0DGDvUHWLQ+kF+nih3ep6o0Ik0DtsGc+JZuQDCsYXvtg/ww4jpAP3MkLIiySokbQoW7+YKKJ6VGcOEvKeeouZL7iJ8Pey3NSwKLg6/noWQY9Hg9b/dfFdjEmj62v/myveKDQPzIrw4ylQzOIkOShQlL1uXXxd1uTjTrNDyRsD7iITnaOinEtxGxkPIlb3VpNKSsJtLbBhHe1W/TVQrMfeFmBj/X1AI9KK9+BLg2PzGzKR+dsg2QPJ3wYzsTKgKUIRpj4g7/IPQR6zmRU+ThWuALS9TBWjXmP3Na2LO+MAmoYZtgRScCruOmrTsLOofOUbSaHyMicM0jTrmWjZybp57UKgDAeeNpQSk6+rkjxqgt1ts8osSuzZh3XM+y9tUDY+dElJtQl3LSDzPDaV2gCbLtPSsG4Lf42OrsJvjpJWXOHiF3QcmMUH3ZajuoYwXInhAvT4AXn1DAx45ey0+3tT1+kad7QGSVm2pxrTreUBZR/HSt7xj77M/3bHE5/yTgsfmQs9Y90EdIj4NAbZukMJLJbplFpsqUT2g7yyaRLo8m4XXJ38xFjW3Hm4Cz1a+lE3/BjUiLhSNUEa+QfabI9ndv/5+sqkZ1oAByxWOTYAqf6WpfMrSmHkBDfHeOgDTpR7DmkCgaY1XZrYjVMEm5vrJL9qKVCRFVsrGBZBkvz7NT2femJlZTBonNq8e5FG/SMb4HTwZJfV37DKXAI3q3y9nSFjUwYHi/0ksIwbtQxAKAiL0zaseNDyXB4w7J3iRGj8PaJaq9eGS4JNo+6llPHtPmpnD+/cSFBM6wbAV22DjivaW98jqcqbATpm3vNbxMT+Q6ppE3rk1F+P/OHrGkD3jIJb2vdQIC1XgEGM8p643bbmsumps5BfDic6cvPbQL0F9Q0xns3quLB+qSWmrc5h0RH3ACUr5M60+E1eLt8zQkcrUrA4Kw8jq9foJxnqJTh3pDst1g0n0ZwVSyXqc/NATI2fQiH+r8KxUV/DDQrmgLpjAQJD2Hq8+hht3AjpLEzl4XSobHzOGw6urWOWBg9CD1SaWVRLxudy7WCw6LSQDUkm96vm38F6YSgpw4/1ButCTXlY9eTnzB7pLkJbzFwL49DU1NMYcGdCfOV391c02lapTWMnMd9yKgtqpjxjg9hrv/6nKLXccn6eKcdqMz5rMG39d7ibwwsMsFWNUItUZDTnAwS+QS1YN34wyGcj/Nm6G7meYoSSIUZpNpK854jqQFDaVs5zf5/trrAVD5CpfO6fij6mm6wQLxyJuNggRk/EebH8jcy8Nd7h3RDS7kYjHYswaDqUCq3k1t2jQt7h/r4wf4QuLQVbfrhXRnVTS4T0UMAQJj+AlEj6KpEr/0FanmgxHYmjsCUO6phe9Nc0MyNsXt7bXYLs8SgwfruMfbkUKyk1kGBlEcAC80vVOl8fAsqkq7pXGA3Hh9V0k0T8yXeic0d9lpQJyJMePwOm8P1ye3iQQRmA492k3IQyoESiNszx6VEpKLy0vhrkpC/nDU0htVfDRehA+1J0YBU6FaKKgarOyCb088tX0V8qtBhaB1OMYrT4bSGep+Jl1QmSg61QxyAOpseREkc2CVuHXhg7CEkLL2Vw1/TlvUtWVIqxBkmAYZhab91qgqw567dyc48tzAXNi4YhNyZVU/OHAiz5Ai/x/uB2VWI3xtK1WC5VE+PgN8iIXF3gFtAhDaYqZj0Mr1MqcBqjpqJZ3IbK5Lenc6jpCSg3oFFWOvja3/fNcQN7YxKLuumZKP9GXK6ek6ynthwBywRUVamvpiQqMX4MnkDs0vjer87+BoOOjGp1uCpKjYikz8ML6N4MxGHjn8OOI1RXwau5mKvmiAjsb6kJA4uOun42IggJeWW7AQ9IJbrU8nDIrcRtDuwcTNTQDvJiTGwF0f3VdBYcfq6CrBQwVoPpdNS15PsxRf0mKL/iNig+oWdfSWz/2A65NPAMRpDShk8sXe4IZLFsJwgTewR0E6iJVgl4Qmf2a5Yb8zWZgE9iU2rVEGld4Cjxj2FVFA+GpsTY1J934HrWj0otLthQBeVURdczWL1//Vdqh5h4KOImbD9M5zasxVb6B4ouMV/PN1PFeIPYdWYoYr1r6W5tJYOBcyAT1ZzYUXxKzmZit5U3iaRrx7kgBZbwgjOIeUnbuktJP/AOdKCvGPMx2I9bDIvq00Xl4y0rlz9jP4kyVeXRStejqDHe6V7MlRC+n/FTm7wDVyyOim9ALP/TxjqBKbRaTbyoMD/gdnJFAVH5wAweTJxeIPhVL/IWizIAwNnHDah99DuaIyMTd7J1a+u3XIgebu606/YbfXNKv5jky7DohJ1XzSZQbPcVmQNPv03ZJdH4xnxQkHbQgtEV5xc/q5MiVbw8Q34TrbgIN0P1RP//Rxp67lP1XXWTEm7a7W8VqsIgCR8Za+7MrmDv1vhvY2lF+8Cjy3rNv85BLQY/lfIZ5ef/WAs/01/8z3rYeyPoAin79tKSqeXp+Xejkld5+KfTTRqsxPkAZswOI8Jg1ZIam+4Vhcm6ZF6GHEPgtPZER5p4ypgHdS9FxSqt9TvJMah4GBZYXjdBjr/45BqeWd2FDAafuhbYUhlJTMbGq+4mB3OacTWmMvQr1yH0aSDwr+4MP1PphxJ/3OB4Bln+G+EsicTIpu1T9XBM8ukWcHMKwTSntETupxY2TORHle0+FFE7JIa9wKp+2LCM792HN9dOxvah+t9bfnYt+QAUW8+/5kR8sBS2RS4KYIh+VUjIRCrTyhzt92bGczSD89/SdhDKN0AuAlmt8El7GC2lqZ6tRX6pbxiFf3I751Sxyg9zM+q6P9nPR6NqkJGQK3NYMB+OzKzqh7dOOlATvH7AE/njkDYZTR6+ZXV3dMYhpdsof4vVws4XmiFD5HgyKiP3bMdA8KbtPGTzV4km0y4GBWcQjsdZFN2Am8jUDlrS0QCGUq/dkHhVG3x9U0+rr6KPMpcMZ0zW17gwSyLrBJ+3aafLaZK52OdSG/nS5b43a/4pn4nu4RsgH9nTldglDUz3pqvATwR5RRgim9F10vZrdNnWauibWjnHhunSGuVXylG00tWSX1RiVDxill9DSRm1PCVqYYh2UuM/TjiQYJmVcVTfAPC0sKzsO6OsAEFeC5Gn3HqiowJoI9ZAfIczqvarG+piFqCMZeMzX9o6v/AzaYiABKejAVnVWD3XoB4M8KXkLXPID3dlAJqPbTaWUfz8uWtwJoJoh4EMmimujt+dzmnoNi5wOC+wDriCrph7zYeqWHaUisDrPSUTuqUmaNomcTPvbD1KsjmbYvxDrnaYkZaNKqs/ACl708hUjoe1OpbTzXCPA3Mh0PdnohBqicRASRY7kU06b98Q4W/jIXCP4VCJmSZ1RPn95J2I/JEXpagBIUKMFRWJ3CCJKp+c/CFa/1sqxq/68Grfnx4+/c3VqtSIY0IcGMV2wNhQlp/yOtKReFQEYub2svjAeSDty0Z/DDumbeNXAsyYFDmsaf/nPIYK0WPPMtSd4L5Cw17m/6GJVChlUpKOL8CRtUV+Y8XSF/6u0yMThliY3SLeOuMPzZF9fS1bLojyCD8V2dr1BTO+O8qlE++8Dw0O4QVDMByoWWUEmCOWaMOVi+Ap8+ZdIX5kKIkYKlIRN9sI4aTQgKJnUWKMrr6hUMBxYkwaERno4mAhiAaLVhktdHOWO/qSOHh3WGTM5F1UIX6+RlWA7O96GFpeOwWOhFcrhrVgcXYvznuST1USDzH+9QE3xVlzpy2eUwk9FoWipAX6SUEOVhNRbwKkZ7S5RLJ3a6IGE2dNDTXXkPK/5QeV8PMCqRlxXoQ5ekdeCPMYpqYTlbLpPFOEyowLnKwBlBpked0FU47XHZRVFKmjnQsn2tNYIW3lN/iqp6TKy7GrhiPaeM2p38q04yctJ1kAn3Nph97BLojyzf0Jk42pbmdIoMaP1Nf/Y5tzsVPwJ1n5tf/hm8RYMbKDyoO5KNkAWat8aTOfPiewxBYbqSOxASMuuhu0bwnugv5Vk8QdfwL1XnotVGxxElyiskr+NbL2kXlfOCqp+bLsdKQk/8E7bk6r6euCVmaztaDyC1YVl14th2XH2+ACzYuluZdhIVt0pU0F4luDhQgM12/A/yYPhUP4AX0vHUXxzPYESfhNw1eJnzk3VrC7CPasdQEdyDF/d5vmPvOK/b7CJ+lEnvxCHyF+dKUsktAFLTNMM516WOttv17bXoGQYrR7FVJo4BmU42U1ihvnANW9FQ9fiJVpsvHLCCOkDHW/fEW4ITRrb5Fre123bIdyZQqeE0EY8pa7KCjnGWeH6SbiSIfqYi6XwibUVgWG8QYrqxgncAIeceM9z19J4z5mBlF9Lh7fML/70FVyaMRxud5qFklJV21RQeo5NZFbqrQnN4sPYmb50yE8vaj0vDpFgU6hdcwIvr9xm+lS/VrU4ohfSxY7fH1Ux0VMBS+iXYvSwj2lXjzUfqGLj2ko0jIGHHYxIvnCJ0w4jWjn9/xOe+msCiFXAgj8g05ebxOFkmZqUfxLlsU/Ctyr+V91wOk4P9apHEw7NaF2ypCAGmwD1jDGCuQUjx5e2iI3Qj8e0+w0qP2kGrvuF8einzhpgyo3HEsDQoxQwKN2vk/Cu+lYe7c5a5I4DHpEBSqrjfVB0B6JF9wNoUHbWLLjhYGY/2G5U3NhLuAaCmaeTN31JCFmFha4dIi6j43wd6PLcWfrTDK5LCBvW3Gvj4CFH/cc3rpKe5vYt4m3JYYlb6NW9iTyvhF+eI6Gb2LhHfBun/DB1UwS72BVOwAMwZSEtyPAzIqY5fXLDLCfTowGckIEUzpTJ2COHqPnF2FdeKTdfA5/UaCH9nHqIuCwhyxm2sFQbvnsR+O884IwY95H1+sZa5ZEPuJ/i5l1E8SIxPlWofiZ4xqZra/WPVCpF4EN/CyxFW1s83ZQwXK5ZZScK1HGYzs/G94t4HWcrBPTHP5Qi/6RrI6cMguDIGQ4m7tJrZ+eCGI7yNeVAyDRKgcrzaygXmr4doeb+gS9/YO/1AudLwf6tl3957avdokhuDdRe8qzhoHB0n1Pksd4NjCsVuq6Qfk41bAyM9lXQp1IG3IU3DKV8YfAHo701/5BzT+yOW5/opHpNiMIDvr7MG37IKDokABx6o0x5CdaXenCV7BV35nOkmJ26MQw4IXzr83RjRBABvkW4hiQDmiidX3BHxoiyq0nYiwKSY9wVbhme+KXp371+vliN/l0jLuWc0HueQFCjI+DI6KyAmL0l2TDkOo4aez14BmH/2Fgckl40BIRR1HLmYKlMHXv8ypzKVB3r0bmZpGrih1g1GMbLpLmL3hwnVpj1HeYCYkYrxCm5r7bcsknJzOmL1wW+DotvVrETgBz75yoRv3pgrEspa4lcG8LooT/tLym/P2h1KkuoJwIQDv08C+FrY63NU5nqcF7JlJu17gruFTBgwJEghcs7NPGUCfV24aLLYnvvzxcxLtRWrhbFll7je/XECvIN83UUaVtcZBuPMkv8g1CBvzkRQxnmNtT/NIj29ayzlIiihqiLhmPCZCatK4SXhnCVbQO9A1wPoTwe4jiQtRXQlxtYORIKQqLK/yCGF+UJ2sp6EBJpyA6dWiT6XQMRf7AghfaCpj6eKCNX2/wNEQxIgTCFtchKQhPi89HJlfv33cbbYlASyITdSr8bmJuyuYZAaiyj+/65RnfMxz0iSa9FxJrqBUpTM9Et1NaV6KxxDlq6D/ph/LNZIHpCMnqBAKS73Hdcm8w4HsemngNsTZB+dkNPmJJ/v6FhSq5HhoWGVIXPFQLjq7khkbUIjs2twc5aOdOU7n9RKkFW8ao0W9ZNrsNJzRFrTeV5D96B+KTKqC9z+/Ox7jQrIppvdsK8byPEFAU2rY86OWr331fvGMvEXu3YGnvA9ix93s0OvNEUHrFMc7IVzLb7zMSxXMsMuNvbvqi/WeGptYXoK1JuyEBfIyXVtx8Aprne2zE6x9F88S7gQ9WzBtgKLdXbVANIWVngG3kQh5wri+/nva4+Iic5FBrKLfWFBaMc+zEeP3sCpAbvByNrr9QAUz5o+H/AxkWAoV5aS3NeeAlu7sbDUex4c+BtxNGk4Tdztwpc5bOv7yf/5niqldxeyQbVM7Llm/B5Jcqac1f95vRdo4Xs4hTgD2lyj/9tIEhqc4z1qa3p6+9os6pL7MKG4eOtolUzOusiPlYvJ3qMR6CUNvnYW1VUE0a46ie/Ps0N1qblfnvM1ZJ2Co9p8nhJdc889+vLtnpRSvEBkq12t4PnXpUOd9KzdcWr8r6wwAcf5Z/XqeRXyXOCVSrRPHXn2a3OmNJGzvGSxDXXBQrHd6ion1Dc+YBKldTFCm51wbCGqGh4ds5KHWhJg5J0XIZmxvl/lhSVY72RWuS9ROqRlpwP8G3dCc3mr2dv8QoMgehkeJWF7dahUx1OdCOfAsZcuKbxQKQjJmnozVFqlu8Wy/SStDDNGM6XSBXL7g+Gc84nbqMwG8GMziE1dYNuG/Bc7vrGKPD7P28uaZ9aCMN3hygPmMLYAP7qK7Z2fYqcR8MA9uxr+WENZWFu8Qf7EC1Wy+Y1DJOtYsEVUiDwUr+tcNKeBfg6idpAan/YISRIrdbgKA87JrmB49BfUDB9/ywjp9kFqenfsRJOgJV+Js3cX9H0jt7tfOQ5hYd0oX2YK1fcqGgn+lbS618dxBFsoR4aPvfNVON0yP8t6Qiu7mxNbr6eKuhiIiYylNXeoYScCv3XSYnbQk5i+2HVcIDkrwWl8Om9Lm0zlGtSMDSyqPjg4GtcfyO4CxJd/L7lZdEMWpFAHSXTid279gGyvWP4tGdefk7JuQtYFB62KcluUq4J1HIu+i79SMc2L1vWlrFppySWGGEc4rTowLwqNs95Yru9oxQc9JKUnGZdbBt3SRcUpHX7V/ok6UZyCNYXnKZQtwKblPwgSHdUrVe8BNc//Ibkk3bvfdjra3e+fAId0ZyGJLvZ1dcSIoOCPFPH0b2DvIpKf4iXo8u72nJMeP/oMlgGDOYqtAIMhXF3G8hxz9LuBJE3gPbUY9/dc4PHcP3WoYohvcXdfY8rlpc3oY+8M/Sb3HZr/526JLZQeQvuOJC5fog2Xnbx5Hc12DFs0tylSXXTpSrS+hpVUPwwF/9QnH4gE6Ad17wqdTxoRMT+ZIiBnHMw0J9NvlEAsx0ZMKdZJoIq9a6DsaiQncV12Qs/ybjDhSqGmJ5voenxlIA8Wl5+lAFRojYWhjuKlpoFyqtUnB/j+nH7QJrvxjZSWfLgVBEJdAoiVLRo0+iCmJw7X2/eYI1RRE7X0J7gJxGOQhpb3J7cpNPY3EyQXF95Z7lGldso8t1MKBzRpaPx+syAtmELGnDaP2l+AAgfBWY81zJTR2FAysnyeGrk8q6uF55EP9cD6tCPY0I6gqFGGjrge4Aa8f092tU51OphF/ZHgs9VbLc0W3O+C/P70KxE9BWO9avPhhhJSnhfeVfvzKdhiX+zciKj4wQXjaSj2p4DJFFpLyIeEZWE59bVrnNNLHwMOmvOphSuPppsEwbwll9aIu9RPQvDu1VRwP9UEzOuU00HH5n5He8er8XM2rQLCLSIY3+5vaOsRitUQhlT9FiywmNu3Pk7qB7CQI7fYYbysNVcIouDwitFejU8fAnX7VDezVpdfLyjJ+aluYvNtJ8MkFflp2Uz3vCjgVTkFBueuFySWJgUXbV1FkO/gv2lvAzv1o4kGrwLtXANKt6XXKpyDIZlbcY1NrCcCcGLCMFO+Q5KdnLYPV4yyBGXqopxGS3wntiseSZsAjWeLO1ta6068NJHUkgRax/i9idX6/RWRbqH8M7YBGd+u1kq8FAWBsdr9mqa1RGkYO+/ZyPlUTSoeWm+e781S0PXsmjquDRfhm5XIbAhmae9FU28Gd87pXMlv6uhyZRlkQaQWfwSMRVBpzYxUyMCWoLwHuOrLmXpnHx+tuLtguwTZtWbJQewxKUWZyELyh5E9TB0anXBNFhH5Rqfr8rHFrnUVKeETZf6eCjYp7+Sjr0TFG3rUzSQIW0Uv4HKdeYA2M2CCJhdpew3rpl9LxtfiF/707qR/Fr5U9Z1COcOQpKcBqm/76pkQeKAqXs2y0/g6vc4dhppTMHIouUvTIX1uw0u4bIyJAAwwCUCamsZQSIzZ4C6c+lr3sxVJxcSYE94KbeD2NAh0mmezO70+ulDNLXItJ+VZnDxmnuEAkoALbuXGeWxL6rqNED50AOxq/4F8OniisCmtW1JWDK61AbXvdgJgT5zcPlzeeAmjI5uW4frTdn/5S9DOXZjqcbJE0aQDFX92SS6sPXPcsOCh2Xq+88Pwem/+6Xa3Br0dsoCSounPBMANghPhMd7nL2Wtvp6HG41jLmGRw8lHqxkA2dz2niWyWKzR3PrF+tOU6aKNgzMeL4SHZ+kqlB9/LzsdpbQGc/Qg7iohd5ZBqLfhNn9Hcl+ufPJedBd/6E6+NIH4/K1lfVU3Y0xV5mHb7XJy9R1ykB1qRHm1Pc5M+RqFM1UOFGFStTNtY5dRWP82UA/uxjpt9aO+44j0W+3N5sxoE4kt9OUQygCO+phdFJPa3ouiAvM79DpWUeK9p3GseEqefcPRJXd1X/Si70EzqKH9SAH1lBsoXIsgvIcNO8HDzP+mzCVIq/6P3sOfA9QrmATdOQ2cfVIeQYqQP5hXis/gye/EwoDbE1EHzgGuvV0d9W9ZaMaPuRj0MjwkpeIK5iuUvfqW9Y35omzGJt8Y9oy0LSY0EYPtHXmGMN0q61+8q5MV7nJx9dlsdyHaEn8j8u7mTrem5+MgtxoUKpPfBvXPTkjf3Ju9ufuqGKZ+p5gJW8r8bHdomCQJfbKjnX+CYMnm9sKrH8Epi1zk5MrIr0p8Mdw28tMO+iZxYRzY+AY6nQdg13h6iaTICjiO0cT+fEWzRPfbLRtk2TKM855sXCTdfD02E1zki1Bk6Xy7gehHVtr9OUSYSuK0zS4lz/t5r9Czoc7pIwPD7m8NpqhK1p3hsShLus1KMYO9QQkwfi+YpAwWka4GkSC+A+67EJZ+A/Os73HWoG76pp8WVoZtWKYzCihYxaM7v5CI00/sHos/SGlj2454o9xhTKfsGsYoj6KEXFL0piV0zLVmyiySsV8MjqCRl0klH2zmtDS953CYpOr5UmTesXF9OuW/GNIuvxWc+XcQtN2bsRThN8iJCCXbOGcYSasJa3gxbnZgt3RuHjFmJTx7nsOK85xKYwcDxNPS03PdHxoMVPrF1QaBLYVI3bsqyUhWVehp9nVuX76SeG5m2gketE3x5rI1mHoIHwYGWwdkpkKFUtQWPVli1yqt/U78tx9ChAXoGC4yBQdtcLlIvaaSKHvVOvPxkzByW3miXVkegjaZxkZDJabL/H+3Ylso7UomMhGPatMLv34IeOl4WwXuJtQM/KtII/bwpLKygeNDEQCjMQ+anBLFTOa5OZ1mFHvdNuqlzX47/a/cAUuOpO1P01m8E+G/E1Zd2cTuP4UeVpCMqQ5KmUVdqACkI8U/ZtjBsL74hnGjf3yslGU1o2gYi3A6wPVdOncOlb/Be73/aJpWs1QK3Kpd1cgTDNVTuieZWJhFXwNqpCrNF4BIzrqecA2KntkDWU1NFyYz4zlv41DtcZ1haEYrhQr4w1a9fEGFUjiIQMB5WSigrggD0RwwC8tMD73mYbZ9k0pfse4kBr3uEtw0oOFRfq1sB0VwZ4d5X2CChpiBZTte23mwwNFsu9uKPjESdPFXmPoUp5zzVc9KCs+6N++OA5XoTsaf/Ccf7exoz++3sudAJDG14a/aw/ZUruKeLuIsmXhv44yPqV8NBVY6vw02D3IT2D2l3Ah927l45IQpdbzdDLY6SOARv5tpt/e7FHDC32oedtqsPyQPFKQiRTu5WveiwTGZXmN9CvYsKeIPfcx8eTN1GWq1zYOE2X6teMpTVeneDTcAIkhBIgciCTNBhKT2UaW05iW84SgTVImT+CFFOF8bovgZMwW++DPhf70SmvUmsqTu7xOp6AIqLpTkayL69o30kCgcLDUVeNQPffAbKuRU2GxYgxxqEwHyblnzG79odRM99sa+kok1sElVhnf/pYaiu71MsGeEfYYWeLV/bCLnTaeM079QCZrnWZnT2MWavNJo2I9mKCW61Owiq74MkLsNQx6sBuXzoNk16hf1G7qj/ZAWXbyiLBI0pUlRcpQ0rMT4/ITH5LrY0VbZQisWX+8HQb4Ow7025NLdqV3sNt3zecC7ZrazMS2ggKNzEtV1dzMtFztZM3RVfJ86iOLi4nVG/qJclzfZPGbf2cHm8kCQO16/uOakqEGQ1EKeWjk8RThLUfLXtd4D5DM5s9NrwjMlwXP+jAVR5sHEpUn4v5FZaXLNETtUiz/X8ta0jn/1ueiHo/vB1ngy2+egJz6MsG3vV4ztP9VSfxo9brtCOziSbqmYl/mTRcYJcCOvOvS68/nBvzB66lAyBZkTry1c8ksKj6HHBTerBFswDKX35FARScHgiZibAtb69tYjmHwX+tAUbtg+1wwgSXK0N+gjS1fPpeo9FpTYmmnYRSLeTBi/jtnObpOKu1XQbz83MPTtRMSM3vbTtPHRt//o7EvIExpqjUygJyPxaQQrSnRlxjeUwzlpF3rifAceeKWiakzW2yOWlViDJL1Y6YA/oves9R8jJlAwCy7On81pOV7u++d5EvfhCeCk2JsZ8tRUoIkJTmL2JWLmgLbHi61/NF5zEmb6BIt0kGqqIhNVPGKRE59SU2kj9PNzcsMcQGIFNWrN2K8p5N3gpAF8f56jlFZXUNUW1sTQA6dN4LQO/4bufDrd0Dj540kA9h0u+neLsnsBdNs09ZfcVsjt7fCru/U6FXvEjw1GV63vWN1rKyd95HcsnW7QGYhhZQ8WguJ56y1LwLgOJcN/YpGyE7Wbnar+9po8CwiYR08Ap6/9J2KHrJWzBwPTjVzH0Fm9TwFWv2NmBbzOFoyYN3nCmz72BubyxijKp/1eaN1pVBsMFvq/VklvQjp6R6aLWyd9ReKXR0ES6gPOwaP9AT+izXeEb35806GFaMGleaIS76Rkh0CEqTUCYXsf4fLjcVSWI9aHBWYpIhr6H8X1o6nXA3WZpwGVcNmB7YhDBPTwv07nuTHlpX7FnTo2S6eAAtGAsddueK6+OH9fnw0NnjOVXaAHppMbjzfaR8RMWB47Y7UI1iw2PWYTuGO9mKOhpKax0i6hFm5Fl3dSI3e4jxVkhNXWdjK+6dcuPcKmfLafAIJYeCPKrRLElwzRWHdZfbh+QtMtmb6RkTigrPQVpahxL+esAZ88qknxQ74D/Ygoio/p0Udo0jIpYtM6xASECVnXk0BxnCqUDnQZknidFRXizVDDYXCizdWefzWLuhksRFQeqokUKVbTeeYlpEwS58A/nNGS97O14Hr3zPGalWuG1RTTtiA7wbXZNTYy1MRmin4/A3Nsk3b/U4qS5K1y6hcvtJi2HFUp9kaCvS34WlX/XwAzIMUN6EytJBOMIUQso9YfpsUeXlw2Hai63Se38+m9HWICE1exHj9NEP52Whi8Srir3Bc0bWsODxjfktGfYFh2dNc7lKNfJWIW6XG0JU36sn8FU453jOVimuul7DgGokVz0ZLmytyzNZ8AtAYWElf/W3OJgxsLLdxZ3Hj/BAE0LgDiy/kl+Cqtr0cvwk8GFfcmLcdZTYJY1+yPY79sAeaYdhArmZLwFk5ZrM6MLANeg0uQ80AGP6zFQXg4baW8EkrPkowvyvJOBOZc5QvkLx9fMVngKP51BICVMzLfkhykfjKjgPXVdKaFUnm9EYzVrs9/UyXXg4OTwH7q8qewpnsnRrxU1KSRlKd6CuFMq/u75u6vMe3FdCkM/T6dx0nZUbhBvlfjOjh1QdJBn5FtNrNjMnjUrNG7lXIaQEsmJkCFQF++DaZrlwjAE6SZLbBjJHEJ0Mhgey6SUdGavaYo4ydaAHpWEy2Y6sGW/Vjns977zCY+cDqTl9hA0Vc2Gu0ZIei1+qHqk/FoNFFO+l03TnDDaQwLa5pjP9eEy5LROY3gr98ZjoRb6UtnusiORXEqLjL2ue2J9grhgloxJMi9Lhc8GfH62MV5joz2owXtG7UlKzegi3rGN1yLNQYeUK7EIZF+1NyoewX7LM+KnKH1ZCO48XtLwXoukBw6C8AQR2Y5SdLr76k7C60dsbadFoGvzWtsEIjfafowskOU+ZY0LNXaVC/nZBicTzI4s2VL1F+V6YNqIAUOHRKCxoHByGyFaEid3oBP+Ys2UQ4FPMP/zyk/iby7Wx33t57BnaEb6tC49mBKJaCD06Zdanr2eLqcQzgh1KcJILz1hJPrOfqIU58wI7dMWCF3w4K82yOoG5/sG4FKhQmJ7UHpgSlhvYQdAw2RH7ymo94yA0mamXvvK+la2OysZDHnwXIF2EiYprfxu8zmmgKtK71oSjU9RTluhUMvQjIzWKnVFwtkBXuWB2SSiMAk7cvIyxWh9oKSWEvNBAZ4YRwuh4cLJxnXk7Z/FwIvFI1QU9rQfcbLzmP9Q4oU6aDng2TO3je460vwUIh9GeDZT065Vj0EBdYeNdW/5n+fHHBvjl9HAaJ1e9+GBghttzv639ZOhFW0GkNbuHwQJA52+riIawwskMpQs1JZCxgrqKpU46PvvYydUP507Tg9LEwxpP2gklIXywUwJ87W87SseV6KzP5vVX0i5qFbWs1t2iCFia+lIuj+QR6i36+dkpI77BLg9p973cfvjwPNMZLK/wjacYuH6taJT0BrQPXjrRx24v8V/BdNLMMn9z84mwEnDxsJ3P8Q46f04vy5xA6HwymgiewAa6DsA2V3O/j/w/N75vYnSwUqMQfxXY+cEX6puFX9of56QhPEKlTerKQ1SsqHGzGEcLxiXp+cEqkugEjQ+Fse7xp5HXvd++pyb4WDDIvcEDJ8oQzs2/P0OrG9q0TjTO2/8kpPtdd7R0VRq5Km5HSL+L/r75/NYBpDgBWRyS499NVKIfU5P/a8DDx7mJgibyPcIqUL0r2axMCK12i43ODBs/NXk+jo6NLVwbcoxsOQYZXHR9ijoTl7bWnnZjoNRMWqyIcmq+uNmq4zViJkAm2AndkjLqBjtTbWAY6V3PR1p0Z9zKdcaIdG/RC6PpV+LWgjFxmG/65hEzbFXvEAp8tpYg5FY3J7f+UJstkD8NyQj0h1fQKY4pDfSj3HCwe2FKmMjwh9Kk6nhdpLUqrXQniQKSOr510NXZ/trhrOIOOpOKDsiSXE4ELdUFDhOobvN6UMAzFWDRBecf/ILdMyRLIlnAVV1FSkEpS7HPiXDUPahe7j20WNQJ507pFoYqas6QLO9Jbj0PAPbDAHJqbz9rVTCYuI8EJKsvoE1rnoeZHaSfLNW8hMLSsDNRh2EqZAllhFMJz3CFJ33QNxA9t30mEHJhNbhBGlwreHpxkY75OOwqcYEBHgCQSjjb+yHmPfMiqoIGkj0opnWMym+Jkiqu2s/cvKi38pDvz1fGlxdl2wu4kmHpGlLfEFPGs0CPTGogVsydUWsj9mH9aW4Wx9wZ2OhEt6cSKwcStU21jq6MptAiyjiCfadY74w1ZTnU5mXz6yJU4vwq/t09jq537D+iIAmc7TFpdf7tjP/axkFd0qYN1kaJn95acncYAKqEZvnr201nSkgr5kgOAyMEjbSKeXpCcxO3rjiaDfLAlv7Qyi89SHUclQoLR5d3tzqAOJRRgBN63XFhnJoLEhdZqCxgR8cs4/o5SM7CnM+8VoI53w6foI4Abd3M5cUqQWL4HSRgPHi4vPPoVf1QfhA3Zg7SknE9Lb2pknXPDnIGivHXfqWle/xiuHkBBrHaF+Fmj10LvN5lgNfUF643DzR5H++4DEeMCq890C3HDY2tk+kWmreISR5NpdcXgGB+e87J9IKmf/Nn3RTb6BZJoLLSYnEDUBGCTDjsXX1BvnA7sBLpy1eHkGPQVSEP188LpPZwAhD9BSI1aLcXL5/e7sQAFEuc1K2Zg4yDECdi20HfFnab9T0YaXw0qVtEdf399ZjoD97SoSL2IgbOFr18NxLi7+l7Ww1ZyPWB018EybezljOFGe/iEUZK7pN6ha5gjM4V9q/991o78Hx5KtWTyODxGD2Vw4j9F4B+fFIYfbNh76Fx2Het/lPo8ZBdCctEEasUCu4nf/BDCIqcaSUD28NyD6E8xMDbg2jBUfjOp0ybiQ4Xaga1ClaRzn1LYTZd+i7i9GC6Z4Xr7oHLqVifTlZSGcStblJFQlacTjAGyqdel7ML4mkL0sDSMmbSbuEwiVInLSQ1JXb+FDGOyKAFdK/ucxt6UizaVfRjQpGzKbXNZTUFWUw2hRgDcHxIPvBoQouvfIsS2A7TIdWlK2v3RgFhC9KaB/V8mHr30htT1PWQRQZWZEWLevA+yqzGJ7LP+NxJfKUBlsvmNh+FRdpgvaQ3dc/3MTiwGhhER0qLMxan4WMBen4VB1bDxUQTevtljB8BhKtme+lu2OmKRhoGrwtJwM+Os8lDlVm7vddLPUqViwOWl2SeifoXIWAQu26vQq3jhNx3AO9cnaN+kHzKsOj7L5VzLoZ8Sah8Jxw4Pr22HTyPDucVOlZkRapcLCqnFwAXuf1qnR4MG4EQBKXehqIxa3qO01Yqgoow8DuCfo9/VJCo3ZeHI6JHS6+fvnsUn8Xm0wNjMgX1t85n8Z/G9F4ZYvEm8fbsxnIFkne4twyfEUCCMNFg0qDEAkqJ6YZQhDKEbJDASiX4iDPmWlklzs11xPDGXgTj7LnoAThgfC1uAK+KRv6b6DA3shL/Jqfbvd4/Je1GmsvpbjRyqSc8ecbb3u/idLHwHySycETufC+Y5ONDFslSVU5KKNTT68F/GvhWCEU/SCzws8A3AtoU0bofiRtpg5Vt8gNBC5yKW+aRUMYzpWyFv3g9/YySsL+EGo/XBCOFEGxM++iKr5XHPqGy0yvDX2+8tfFrDVbiPVZBMVzInUwlcLnp0qY3cDosL/cz6vCOASm5ZNc6RyTKicsTUJbtsgNOAzdXz6SQIp70ePy0aqz4eTG68c5ZQGjpIpoPocnff6SQJyd60hPI6N0/jj22RCwVOUhhAzghaLCeQpe87JlrhK7GDSi+pzNFf+m47taL7FJhK7CjnI7Mqm6oTmDtltxVDjWxlbtgUKV1NlqgTdu9tDAixQDmkGditw6+aNBmfwXAhteTzR4miV/f8pnNel0g6u3755mbdlL8JnoeTPNc/Vj4KZGp4VkhCYOu86UN2Od/iD40EdzlfUWQ79tYdovhYSQEVC3gIUnVwmZDCsl7g422YTYm5WxTRL6yXVBffKjtBu24GbvTZJLLLm70omdgIxAx4KkZplShrBwYkZceKvQM8K2B6Nb8Mj6QfIq8+NieEidm/7h+vDDqkFLC3O4nVUteME1fVALXtblrdSJWoUw4kp85iDsQZB3yjNPAt1VCSKiV7iRvD4+GFdiTbmT7IqP2TrN2FJAP3OjnCj16eptY8+MU8x5KsdwoA8AveWThwON4yPQ9Ne1HOgc/nHMmXYTJd0DOYfWdbPdnvMemUEvbZ3bqQhNuapSuwyFvCj8kjGXUYJqUgxWM17dq41gMMlaXNg5+jP1c0WYNuzmDNceB3GCy7u+3w4HZ83YFDj3tSdsV7n59348/SfF3oCPAl0Av2PRVtOBS0ST1D6AeXkhMORMA3L0BdrH7Jd1To0sM+aqO2XpsJPGJoskKttNeInGvBNNSGdm5FfuFdMY4raDfLe2wZ27Gg+3TK8AqG3sPZPTR4xqxy1s9dBMuigNA6mGrFMcEbc63ZnuYP+0KFOwbA60uJYHBYwt/3K0VQ/YLicNpBh1LYkxcVXl5lxclWSHJEv+wVJhwcqosk8gM3dXaH3WeNhBKKWqPsRnWRe/meRUUHCW3gdlMzUvJdPJ2rVFuRlneEo8x9iu/ozaI4UNdPssAYAu7cadyaFSH5g7HsiuFJ9NknqcDx9SfbhMxDnWrbP0MR19J5q0C7XfVsjsj6cjbdbstQHFjsFkXQZXxU3x6udDbc1Q2XuxOytpDw2X0mKFTUXrYFZ0Wta8dBectMKaGebs5/4jCycqw/cq4iyNxwj/ANqjIarbOkvZHoXhYebodBQdNHgX7fMyBvYiDlpTw/HolV6alAfGYJXYSHAc/lTk1sNzwy6js6So39rGkNkdWqZHupW1YNms+MGpEBQN8pWC5aAzjJTNVhkl/sMiv5dOP8vSc7YyIiB23UBDldlCnTJRGUdfh4pBXIrbMYAStq59HBlVS+xb/3IS38OrfobUJhHo9ZNWQi8fzTkg8T45dKQTtOCYXjwh0cLw3NFa0Ypn88gupHUJ6vQE6d6NquNZ2oviPh/mv9mVqsN9eO93nfqBOtSWgFLBt4p1w3sEjPJUEmOX45X6BU3XhORq18Q7wn+Kesphq+rCTC8oJjQcdqcJ9EJP2EvsOPm64JTETPR2oftDrewwrNrI1c8x7iRUyMi41iyjbcBzxTbnQyXFTQS+hZYBGhDkcfJd5am6yrKiL7juSAGM81K3boaSQqNQaMLn3Is/ScXpWe5DFSHF1zga1YAXp/SKJt7pqS/0rUNh7+rth3nzv7yR37hGTsrvRFW91RvIM77AczBHAHTpA/Vn7zWUtbE5qh/HDvDjyyJzs9aiyBzCBx6eFZdIaZZumAJ9JrMeb6bO9j8xoMrLqb7ckGLc1P4+6oC5H1TQlEcIGnGn7qyNOO0UQ8nT5FvYz1u+ZyYq9Je0ddiV/zEGiTB11Gi7iNkPOJb9dPH6vPGcrzFB3qEA55g3mABdA/iQ0yQ1ewg0m+ZgTFmJ5jmyaPAvVQwM8dlvmTZ8C42m0NF5fVUdGx1DZ4uVOUCKwH7TsQmOzMeLAwmvE8Trj0MhwjbjGjZHMlcU7g3KcNSVXvg0YpFBSxCwGGm9T5/0I27Sjq/iQijJXwmfLmwOaZ0bwwcv8R7xqXgxvI9OWtVM2SEdb3C95zdR/QxyLAd6cLa0vqoEYEzoZG8k2p9lLpLlDu0WalQDEnXnd0kDrK1T3Hbeuu1z+p19uwQaYb9hfmhtn8gqxMZLiIW13pYEDqsBSJtO6k45yv/sKBrGiFHq9dsRxwUngR+d9RQ8Qi1SgR+3HWsCV4GHqwrrXIv3ucxfHArP+uqzXAYEDxE3J8iM15KZgXHjZZ09+Ser+sO8xItC8KTS7fDXAOw6gedtteS3G2s+o548O9lhd5/rFpyevsQnttS7pJ9hvQQ7Bz2j/7S8pvz9N3Mm1QTkwWMPCPLj8ogFhkMZM4wVD/5dOAItcBEXsyU+FDtMmuoct96Uk0KaTHCja/OMrYgcIB3O7XmIDecYucfnJgc10bWx1didrXFFH7zqNQHaT5muw1RIffIbjO3v0XS5Xb+raI6Omc8ov/59a5E61zGhZrBVO6xf1Z5V2RnSecTx+VhfjBv01u9tPHGwc3/yacfQG/swocnk4IQODtNiYgzz5YTg/xsE/ez0sjyu/+j4Xx8T+XMMstagzAAPnGrBXj6lYJoAKwo97KDVQ5YvzAd7h+YqR886NjRZdA/aIJP8TsG5BttIFJ9XZVvXGB2VlScAdMhqOZT3Lx9b/S23rX0N7jTZTobfuS/h+WLr93qtxNDhm+8LMsN4zEQOiNvQjLmlcQvecVwr8X/M5RmlKla+EpBMFMKIx7Lc+QVeybsOeVdjdkl389I09mcR5SjfGW8IQL9RpiSv5yP+GZvHIygEa6CzeGeKjt2ly2zmV+eSVHg9Z1BkyBxpPUx0Om35CrZpBOjBa6wsNDM44sUShsYPO42tFe3lptWcvCWHn5rJJevXMzgpeunsQHzHJSXSvFArUO1LB6itktYfRJOaoZMDQ3XYm1ZtIrhvllpiXpR7fq5wx+03kbPBS4pYTyiK8hnflPE9k0F+2QeLXS34AoVLU2wXdp0TW8yn7qS6j+a8W78P3r09uQlrVMzdEzJeeEoQk1yvYByu2qSaR9Aijyw2yXVjcr62fCbtFVhqAt4eDAs0AZJAcl5DhMcgqtcNEtgSNk8mpJ10fTd4w98TTQKU3zoqe3jY1tOXYLTxVh2T0UW/lvPiKF58QKYpov/VqupqgXbFAisHJhkhYw7nSG8hjJnGIaINAyIEqwlyegps6WNUjeVfxKjT9im7HZGB3xHuCvuPoXaKtM1r6IVc4IKQSvi4H2dO72QBMPlkn/CyF+AqBGkgaNqujTkDg9UMdb9uiQVYpHa8WS8DXKRivXH5Hx9Kdweo+5P1+AaW47MHI3AtKYKsRnU8u381/Z0+p3uRT8INrv2SMb86hqlF1nTWzXWy84L+JtSCHLCTeAVZ/0d6oMzisARvWPL5XgNsfgLu0UvWrX+m16xvKrVJn7mIJ1f1mskH5QlnqNaUVvHo1DyJCWKgFCihGz/BfD4rQhylVKHAbrFgU0isJ/6fNhkUOTSXTr7QUqeG3eOFWLyJ12ROGoJ6kTbV4Ufs2sDehmqH7XJEboSq+khivd0cJOwjjdiwczdJBryztD2cKhBIOSY8m/NIjpk/oMLWMvxm2ZFpQPAmAHuhoWx7zCR5scdRPyXLGX9eClYF7FX5DEyD87MkOMPzBe66YCi8nprDcTQi232vb78zTltp0j41VacXJQSsU4I3zx+dyed4h0HL+Btis4T3wiVP+ClGsb910ZpMXuJr6Re56ww0F8lM3dUVKRsBJWkP9iU9lp3AaqZDatNcx1C0/zTXGdmF1sY50HOJeusH1pwbo46ZL98bezCh5Gw6zEyfhY6TYbfzqmaoqtYGCDSj/HMis9tybTIWTPBOXdDppPApVdJtYZFk9TOQNRtmTGXUlBl2gy0RFyjyxDNkFrHFCgbozYPgzKMAn1OBvG4A8SwUGfHr+jcYTme2wyuPw5HBG7Jhwz+sXkwg0S61JK1LGCZ7WAuNc7ZHGCrPv5m3LNfPW6vczgG8iqh3T1+x0ZbopnYsmHK0ZMTdep20QBF7PfmR4dgxewWou775VLmPd+rmJ5Rvn6XuqBxMxP+1dckXInezDji3T8gIYEaDLOji2j2kPNn7K0YoO+vMFwOxva25BjtvemekiDDTrzTO/NGV/hzkoCyDZQtHs8Sv0XhZPaEWXSJbnIjE6axC/MTdyYsaqX/9fuTgzKuuN9mvo939QOFkl3QgJnlVu1jjstXY4lyD94hJ5Q/nzJlTcs/ZompM1qdzQt3ADYe+yQ+f3tb0I6p3LK7Y5H+f1xBfLttkj1K5QnA8k8elLs9+S5jQCr9JOmdcxHTBCcH320N2Fe3KIgOmCLIIDude114DiYlnsYsd3jAMWaJw7HZCMnWq++JP+UyKJzL4SHUhZhT0bvQrUC/bEP+REQPV2lciS/Oyb/e92wzrI/xRuq7d4b2lQ+RxqdQYi0jh3WHUAWppls/84uGgprnfPlZ1g7oPWH+UjQthMoRn7VSoobjTGoKWIzp/GFeYmgXZJ0C9GesoH/bzQgncyh4N8yTywr/p9kfB3LNbHpxBDJVEC8cZZ5bmiI7iZ+gIzyK/pUSyPXwAI4mTudZ3idEjBJCrvYcMJ7D/UAascztTBYkqh6/hhZzZxeQh/QXnEn+y4+KCHi3VD0Nb+U78ALlzASHIVzCvTvw+GXQbbsEtkCAsJRKrKq8RL00VEcNRHmzLjIrImfus8ufoHizl2O1NP8MoIKAfKyPvBF5g3q0Tr5OS2RWevwKqVCBD0jDh46CVkswicAjl8aAnzehzt7AqouoxG4mD5h3OTMNdpWyYVTrL3vfQ0h0Ks4STJefZ4bTKPddC5uMbqzbo76m5sFkFsFw4EUEt4Xu/vTfu25u0zucL7em+SoSkAwOEcc6ipftMXAgaxulNRZP4G3JQ8jDp7hyZdehnS7HYHuDpD8gZDGm1NLUiK1+XHk3ypRsw/4ALxw4HTkCSqyP0f2iyfkd8u60Pk7Jd+ZmhLILSuzZLhjdzusnbzeICWRk5Tod1K1XLQeeFkpFth3ZBVFLnrSecAO7X89k7isd2P1bqgOyFGkopsbubwytSPUW1pOWwoOc99P1cdPdH1MRAJLLaMZosdCws7JIlanj6zZBO9O5HI9UUF2nBNauLmuCK8I/mpGOLfu8idcXRxBCqyq7LPl71yFb1qyTVIo3oSM1VCKbo6nwkMmVS1hrWhfzHRvCl8cnAwrgy1wITgBeQSFk9OGJryjtOv0TeOHPoajn1TjX+ZgEQDEgNYQtyQUrV816sVs8uyBGerPLv0+4Ra0st1sFQa2CynvdyxDLuGCEHCun0Oex0DCCE/QCwRWhKzWt44lFz6DSQ3mfqMzUviz3M1IxbE2wTlQ02GddBMtdrM6iIVrxU453wAXM+eCiBWGxzmSlL2fy23AuoVp3Cmdu+T+J20wFWNxVMWyUa/KzGxMoVkHizHuNHhhLV6fjmg+VRnYgRPgNE0LkJBWwn8rof0bB/15UV3b4oisAxWxkFgi/+fIgzSajVequ7nMn0aXtmjYHFipmjIkf0gLC9t/xaPltfl/VYmBiG4mMRe1c4SRI70Rh18PpxhLn4j61lBoLoVKSnWYtIhuPMa6GezvgdUIVTiTfMGGs1WUhRJiEvAywDw2Z63EAZF1F8PB3sZX7NFhmNJtJletIvocPE2ynC8iQ4ot+CF0Bn6Uuj31y0Pzx1qMtrW4/AM/36WeQyJ81e/4YMc8sACkQBP2+XGrEEDPDvt0n4nfNJo3ZCEXFFjYobVdoZ2LIx5Wp33vJ9XZwlGRLnsQKise2SU6dmnMW0NXKFkVBU5QJ85dDtwmgSrue9fZ6F3xY37dXr/+fPdgubksp6QQtb+62efRa67G7qWWbZ9/PG8LBYAOyxtKBotrSl8Tgf994Pj2DrrVQKajP/K2gY0xgeWkmbToMFnCaEbZth9kABgGC9CDhzlQ2Mih+4jHDfOj0nlxVNNFH3GepaaxoWaxScR5dGHxwOsEVmRlngq5l/H5i2def0aasGCFK0jcXJz/cxWavmusay0/rMc8TBQ45IlF3TsYfgdX2JqIc3bodchUM7Z3+on/ahTt9UXyI+SRWYkhyJdctstuhJUDpwTK0goFZM6eA+5yry8y4uSnFPCm6svaxJQ/rqsRzBvbd0i3rRjXv6kAOSWyvfllRy8KaQ2aUPumIo1osQrgW2L2zG4NP0yGJ4wLdatWDr92T5cnBDe4ANv9d/Z68wU6u++VMrm8wStyYQf5jVI0FBq/SpKTFvvcZQ+rlfRHOL/lthQQIesDI/SmlKo/Km04aFVu85yZxC9aZdcfkl5IudFf7sobwOx/KhjNSq2Vh1bH63RHR0H3uLjHDQ4mxpzKmSuKyJLFUce8HZa/J+73bYfeQa+LBDTrO9uCzgLkKFdpMSe4ZTun081b5HOULb1P4vDayiR+Iq97mdre+aXkHPdtm557zqwE/0OIVIpLQ5GCs48rMMu+QKwyte1NaddSydDOgJ8v5Cyrtlg79DXnyb6wVhS0EAebSAgNfqrXGqPbOCmjZGSDnKgA4xTgx/wefK5tsIM+4t5v8yND39Qbsnag6Sw75q4BolQhuWEP4T3oG0UfzU6qKh4c1UXxNv+vlX3pUx17g7GKrdq5igg+FqLOCNNaQUHoHKDzosp6UsH51SzBkw+D2QE7qDVTypdmsWHogmOQyykHGAZmger9IOncU6BnvY1wFmvmMYQg0oKa7g+iANIlPd0OznY5a+RDL7uKVDNMXUQxQ7SjvyOdoTOxzygxEJaAT24b6teHyGPcz0zIx/5cnp/Et7leJd7tV2thtXEZsw2fYdmLsC4Mal61i81Wl+3G2kLCGoCY97LHTcKZ5AAWgTtg1FjEk5CYJTUynQTMH2SBB+y3BgVJIfQvROo002eAHCTMwaS8CJbxGPsKfUE6dkRfunar4LvRUZEEMlUU8wX23dvSdS3J3PK8K0/pAF64HK5rcWpi2xGw96i1vRv4XvKd6mhOkT8DaMA6hZ5EJbvR+FUqCBgzFq9mMRN7dksBtk+QpY9YcBsN5jMdo0LT4mT7K3k69/RGsZ7H65KlMz5k/czo75V4j1A+ic85gJOTfnd+bmg1g7N+pKS2TOB+DZs54/OQHNESoBJ9s6qEsV8STV9MbJJ+SCQ3W9vbhq/2vtdp+Dxl/C8/JqApM9IqEpCL2QRvcn+XQpIBBcMbgAWX3hEBvlnbLPthIx0BnOXnquHCBV3Znz4XKBKzfounRf1KvZWU806Ehgqt7KgfQ1qd4s5BoP2Y9hjaZW/u9KJF1d/t6DdbFeb/yX86XzDSZipuQ3bFNfNjnsh0/eTHIizO4k/pKtfALfHbHcK7qOPg8JTJeVpxYeq02i6m0FQe0m9BDOYOhzifTlpTaRH8IL8r7aLspHE1OAdkJagETpIxltXLKhUOnes1wBA8CSHQUPkhQv9QTv+IXtBFVaCD/G9VCVqsNI9Pwtq8MeErnonRmQlN+Gk1lacGNenlmFnmt6qtGdQDXdAuTqixFqqdS29PjsbZv9juBCMMxOJXdhbaGw1WLOjfvqCsuwgm9528vRuxI82BDJC2TksBdNiH9xfIgY5oYdyV+IyhfKpCgX1H1zh8IN+xO2ElEjj9NcKno1+qjHTnAf/sUjJbUD85/c3QSlN0HucZ2pydR+IdlxNoxallo4s4kdtV3ha2G5rb5F76x8Erly7FcSZEYl8DT7MQJR/j1zs374d4mIMqXB2nnz1n8xVLoYC5cYt6T5G2i2Igg0iCLRn75/J0TO2HCfTfbbLjuNAIWeegFn/nsv0FAA5lYsAvljxmivctpc8cMjE4oWkAol7swrLO4ePIE+fTjIy5oPlpMFDpm8frBpNEWg69WXjzXvNDqoZsMGOpbYUyPDHDxUorlf/yfyDQyog/uhNJ4xQvSJkuI3JZR9ZE38Ki4VarZ5ue8Vw+woGo8VartydYerswpcwWzVHcCSccLN9WrGqBQTaRG3FTVAFmw+W8M8xDY+/AnjyNGETNwXuqCeNNXaiYkZ/Jg2HDQkndoSjXCA89SnqYe7xW4rCWG+h7n0S//y5Q/bOwMIoBkRLH2urC91b/58DG3nA6mrldh86ondcytZUMqRcSVmSuCF26UtyGvzjffI8j+QE1rqgcHMzV/ZxJ2Ly2FwCHmiXpr5DBUc/ImYYtvZi1bnwkX5SKU6OO3IZ8LEdMJ/XjUJ4ls+c1oDVUkY0RgUdO+tm5cZl7JpvFH244a7aU6MUYi1eJsNaQh4Xv4tFjKo0DkStRs66n2uS3ZVOqPkkQOd9xBkq1nxt54XN4jVoqnO1wrIoGKnOKQytMkxQFSTepeXUk8eJVzIJ8Osd0yROtILVcOcurV5FdytEOdehPFawioGRv0xfKbTcX9QHWoa3Qdsdiglof8UA52lekPHLToAT007cDD6EE0H3sPmah3+wtsZpAwpDdaP0ww3DjXldnYIa7YZpAPEKRPw3A27ZIDhw79BFIUMuh09TX2Kwovafhxff/wp5LpnDJUEWyrD2JBoN8bErLXmzpgXljHTOj0tbp9XcpZTEdfuPfUOHl+FWKiHWaDKYx1iHRe/m3XaLk31yg2niLS6UthMMFm3OYXvV7gdGiHRwFhZKc7gzpw9GCIYaXwXN0UZ6kv2BBgcKS6NNyl2WuQIvleTSCg6aiyPbtVG4Ky4dGzsu3weg+ku2H6DzcHdVOlZfA7VjMk2LgkZd/rc40IMBJdXD26fXuP+tx3xNOwvnH2OlnXf0/cVz4ToTG8FMHpycmMCX9ksZLA9QXdqKH4nk3/23uuTdQbi48W4jKC52lT5OxTCv2/VQusO99oiPQxweQlIbf+ve94MnTrCr/XV81Xx0KziuJbkgQF6WcCF0KNQ+W46xFu7QmRnagcP5Zv/tLUpTzy/wrXJaQ531VM501ME3D5pLICYwr07sZ9AwJu1aM8xTbwbFxJQhxW1+A9mYRDdBOH9WdaNwXFxgSRXPrTKLNrBdfLCUwHpkhCafbXs3VAXM0rC2I/gEnbglwN9o1qfK7D2nYU3a8aqh9lrjZoPHElBH2wOYZD5VmB7g9Vd8GuEvcMCN/DSk4GdkqoZPVqZwMdfslkna/f8uds+2yybGmhVT3t9JGSjiGp/aKLALN/xxWgGVOt3kx0TZbdlMuRgj3I4aXYuP2bR9OIrxjwPZvxDtOFy7UCY20ghRqJMW2mKDCj+4SmZolltJcUhTFhRSW0K+aMxYp2NCKq/afQvdtBz+NY+TjxMrhhqwCg/e2vKW+JXoN1peY21qliT6phdRfkymH0m8+OvesqrhRlvm89buagRDnsLe1ctsN9aX5/FUlQio8KpeDjtIm9uomSqsDOFbAh6l1Z1r+FmOmeT5sck7pA2l8EPrlxAP7JVDFKsLTdQuLdfZ07cf4cC6vDVgQD6dHtr0PcPGbgloeeaGU5QWdn7+di6BiHkLACGZyaiXIRnlOwBZWq3WEuYYRrGTT3O+AVtHMfTCE7MiAyOQzK3xGuJEPG2isqojA5hYuW2fQp1DMgGIHAuCN5QYkSIf/p1GHBT2jxzBBZ3yxl00oQ2IXYNd1u5n8JP0WjEa8AA",
  story_mode: "data:image/webp;base64,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",
  repair_bay: "data:image/webp;base64,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",
  main_car: "data:image/webp;base64,UklGRqI0AABXRUJQVlA4WAoAAAAQAAAA8wAAeAAAQUxQSE8GAAABoCz/n9u2EQCBI8igygukJ8IQKmQIxTk3dxpMT97GuSXXHHvvDem9d4JDaCzKeIcUFdKNYMEMd/ePBbi7/2tEwIJtNW7Dw5GEVKkjb6AF/88JA80wGRjanNIgVl7ZqdYoVJ0ygr2uGSTP84OwQyEMfA/odaRa0eZtpz7Ni+JewqAXR1CvM62QLExibiNok7zRJGUwGYG9zrbCXmuGhkLsk26P5HFiMgJaYa41ujpDU32sP4Ql/K2w1xqpDiiKSizXtUZVBxRVrkDniBVYHVS0Tj9T1SldORmAsZkVbQPPVENTotT/6gCIzbJoL46UeX/py0Q6TglmL8i+v1RWjFMqyP01FSir2CGPVJj7q+7Y85rKigkooKttuFJFNIPWSfMeWcWErLb7yTSiS0MWMUKr5JrOd7DFBBYM+93g5IosQtN5s0V0UnJ28x/CRw6+8mURmtXwCnly02c31yEDxkS4rEtCA+DsAmMMvIccQjnYdIIj9ux+4ns84yv2CfaQQ3j4lRxVLPlxwj6+4ohjfGVhPdifHjKxHFWUvCjJHmMAW9l+bC9JWeBRhVnrAJ3J1UoUX01ZyFWFBAWhLh5NslqB/hO5ShGWpGB6NY54ryaMeOn87rUkGY2vdR/bJk8NHNmsvN3qRPE/F99xFxbWPz7KR9K1K7qm75175mzFot+YeVjCdkW36OwbKeum5EV5SL52T9jim7Ia8MZUBCbD/WB9QXz7DiBlINl7dN3WZRi3WCQJdeDqHlEFJZjU9Z7IWURSVVD8Sd02qAypSEHQDDIgLd6kLlFxVcTQ5VClRs9EnNRVF1uVRhDSo2eiTXGqjM3KO7s9evRsWZ/9AxOKKY1pe2RCP1BnrSRZTt1nY6pjyO4c77+/Zs7YrgljOqY8Xln02gPmzfn/TIm+TkckpkBuHn8iTlgNabYJ06VNVhVyP95hNJYkfmzd1sHnoKEVHnaTVJGYjNgXeLJzd9kEUHa2ip45px5H6kUSP7FdY+H5wd+B7xWqIJXq7YFaCRgu7LCI4t6AmjlvuOViivMMxij09oIwmtAz591P/LpDBIpJiz+FHLeZZRKFpPGIjKBlEkpKy7BMoqg0Ji3lNH3MWihSWpljOiWvI0ZaWZa+VDlKmXzJkYMX+xWLPwcv7u++UzG5c/DC5Nquv6rz5mCG/tc8lcGzvXi2U324m6TYMccQ5Usf/zdOseP9wDWzfh6Z5mCHpJtZgcVOfCJXwQmbZ4IbRREHISg6vwTSIkkgiKOP4WCbTOqjG1ArDdENqDludIN0CjwDmPANUpSDFOUgRTlIUQ5SVIPAMfGlQbtewpeS2F+iCd0kvjQIqyaj52Oa7NRMxp5Dlli7HVz+hCSRJYzsCpCduEdtTsSPTOej/TG1HuAT/y4/CMkmVOyI2UM+urr3ScMtl8pOldpsjBoBvgL+3X103Z7XqP0VZOIMN2L5/TfcBQ1edIoWRV4J8OOztmZlLS7GTOmFFiBTaxThALPhdf5V5MH+GLN5FF7YJ77uI2a6cwf6qt9NELNucu2RQKzSnD4VKP0Xo598PhWoZff9MTYT4B85Zl4vZjWv+XWftvMwWehQgOty8hC9Gu9Mq0VmQYtmzOdxxme6wX+Xnjje/OpwjIsqZN3mrq9vbHLvnLBPfPZzfXHl5JQxUXmNGy48++JLb/7w3pmKbc5z/Lm+fM/Tt5u0nzYkTBvgZ+vsez++//rpLfc2i8eR6I0WZfN93cdCKQDEtnPnmddee+nZCzcYvI5S9NVmnKBgwma9Huy19fXpTz5XbgiIm8B6aqCZbDE+a/b6XxNHUYX74ISgaIV4fEj70izY12oGorin1D+FfGnWawX71M2A5wehek2BybB3qd2awYd04P3dVdoUUOt2xsH+xVAAD9Kqennye86kdusK4EFm8fiOAmlMe4dlnecL4Mhv7SHKZaPyHKo0KU+4onjNN2548vXfqeqHE7XtUl0R68tO1m3rpHqfuITiwWiCj6c30Owvuw3qw1kcqoPcnQ76TxHWxRulN/CoDlCnS9jtGf5TDE3Ybx9wqQ5gpwPdXjBGEzH8p1QdW5fnIxBwp0PdXgzAczNjHHXDVqv153v3HJPy84BgtxcD+NzMGORo/f3DUzcacn8dsRhknBshsHm7pdgvSAqAjIJzAFZQOCAsLgAAMIEAnQEq9AB5AD5FGolDoqGhGZ1m0CgERLYAZr4aaC/l/NUrL9s/tn9u/y35b9CPUHlXdC/83+/flF8wf8D/2P8B7k/zT/tP7T+830AfqP/pf71+S3xo+qL9qvUV/Sv7b/xf8p+//zS/8f9nfc3/lfUC/tP+X/7vri+w1+7vsCfs76aX7qfCJ/WP9/+3PwI/0H/M/+rsv/4B/9uI2/r3ab/b/yR/p/or+P/Ov4z+5fth+U/xm4z+tD/F9Df5L98v2H+G/c/+9+3f/I/vni/+X/r3+f/vH7i/4/5BfyL+d/4b8sPzE+nr3v/d/sB/tPE+2v/Ef7H+/ewL7GfQ/8z/fv28/vn7w+3d/heh32I+7H6AP6L/Wf9F+Y3+E/+v2V/qfCZ/If7/2Bv5x/bv+H/k/yY+mL+s/7X+h/1n7se5L87/wn/V/yn5VfYV/Kv6b/rv7//k//H/k//5/6vvX9ov7X+zf+07CBZrre+nud3oP7hnKtmVykgCduZ45bkIBCeTOx0s6aNr3jqp57V2Wj/kXbFBzer3jQUz+iezTjvGGKF02JADgCVZSfm0t5OUZ1A9hTWwpaK1ekz17didLuvnEHJNvC/oyh2i/3q2Ffyh8wt7jwcZIkVuQtOl2Znk61UqFT1j1+oKPkB7QsjQQLVfHPMDKERmc/4eQ379KAKenE9ktjZ0zVviIIC2wdnkTzH2SvBaZ08ySv7+7sWqkqdWJIKv3ed9rUldqwHOKJExC74Hpif56ACD2P4GYZc6TsOyebbtZGTn8r/fx0LKFkeVeYdALAO3+y5jQumB7MFNG6VixuGky1DjGH8+Y2AOXj/jsR569UzEkJy/MGTUChRswSoJC6SKpam9bYg9HDHBBxPEwGCH4uWHcRZCRfbB2xW38I73zRyy71x3qj1/vQrDZlk9yU8GbWf/bOjnnaILh/oHPUab7mWpYXrrkUmYm0Z3O1Odoot+Eg4Edt9dOiVjNfnOfzb0lW9C9VTI7h3qe1wXGFe81O4kpre8OxWK3FFGf3xaGUgGNN8kmrB8hft9nvzF7F3z+cV3efWxdDBI45LBOH83rLCaBwGxW5nw8GnQ1iofzGWNnzwtMFe+CwBAUrDXr+lne3nO+yx3IzHFyfO1URbuq3Tz2zjG9ff/6TlsyNhF0wl3WnFdcII/pwZ/eTXJ4J36yNd2frmpiTu7yvtyJ8j0SQCl1v/GNZ2HmKAr4i2Yxihxg1CqYtC2zjFBpMlBrirLZ7xrrNJ6vk0+Y8reo5ODiaGccywFpSzKX1lKEpL17ZlfmNzyoRlPuFHBOwvEu4Or0pSx6iu4xur7LATd3Vfk2/mb4H8vq4evL56JjNgDLwWv8y77Hr33/aYOZ2DjAvWfqrGP+eWXmNmMbFhlIAD+/pHT7//5z//dldjpBh7BKslf9LiMak+xu7mq/l9S0FQIHt+3Zna1ck8gMhnMtFbeOWepRrwK0NdgFURbDydMBO9wEiOWl1ovI/r1MrQXVguxr0ePMrBHiD0DPABB97PKGGqnAOJmHG+PH3wauxmf4IKW2ytsb0OSB3+gC94nWfHcb4cksmemlpcDNUhB8/5CFNNp7ixKB5/8U8RDOwcKJ6VY3FeSIYCtQuzLECkanEsbmU7tcnGFinynnmB0xnOxKVsXNOkjlh8qkUPD5uAqZ9vBh0jYfHQ3naZVaiXal+V1HY76HlVxZiLLZIxZM3AY4+edNmePAisgp/lCP/rSJbNJwCq5Jcfe200u/g9z0iSzno159bUoJjaYwwT6h12x2oEwvrBo4adbfEDOGimqDP9uqc2hBGtaWbFSh2fv/gqcmMncg/5hQAYogSyAj7GKUkwkxeQXPNSpC89grYrAAK06y6bA04SaeGcfk6paaEouvQGsSrwoY6yrcsC1rrY/yGkfP3JsPsQd4DdL9zm4El5QrtjX1YzmNbgdr9zan/nfK7W83WFTkClUcF7TPu+P/cRuKm9uR4SdBqSu6xzWbxifI2yKRSx+usqwlrmfFWx56x/lSpsx2tU1RSmESMfmzgz1SsoukI0XAXpzi0glmlAU8boJ1NtVS2yODqTp/vV+9rnzzF5kaKcFdoZSgN8MaxGdl1ycz5iK3XTuFNKua0LYY3igVr65t6olwuR3HSIvXHzbXyLQU2dTvfON/6HGGtPQPkFgTQZuhoHkjHK8ELzaIErbqFlZGu/hYIsF4Rc1+Mj3MiUz9sMznq/Ksi0xDX7MV2HSdCWfArhKLf87x5z6PfFBV/x7L1bkRgThMCENHJ6J6ALjX0qNj1GIXB7+J7oj4JQerzgnE5lNvV2qW19c5HiZYyiQH6OQ9rqvX4msfl7LGkuC6mImpLpIfTQg0sZTWwd7veJCzX3pW82y2pUIPd/F8vcHd/OPkAABEJkXDfzeqkHFeQVgWpdiMsp4EdVxDm5d/0/+M7i3ir5jG7DKrM+/6CvBGIxlkAX6rxlnv94DR15w8wCLC5twtrkJkkrMfx4FkIYNLy9/QituI9KsbTtWl6FlZjkkStl2F/a/i/9xlq7yZjB4WG4pHFzPXkBMuCpqnFCzU97Fqr2Y+DqRdm0pQE7vPonsz6vuix96WB8HPgPkdwHpoLp6OgeJd48PeKIeZ8Yof9ipr+Mh6MfWS/smH0B1gBCNxkPL63b25sC4LqUmb+uburwfabHbwbpHnJaiXqaKZmhGhXzgaWnB052qZjQOXeQWEMZnvGZvwbJq8omfqSvxMCfGm+KObO4KTAvrTJs0Wr/XHbMz/m1Tw3zmLIazEThjg0wDbDYepo2Gk/8GqSCenT/c77kgrPbS6QXLFGT8F7LAZLf+H/nhRBQiajVzauodsSykSM/U6IdKdUPpUF/NWHWCmg2veSaWZViA2AyBiAL1Syh3hCWw9Pe9NfJ2cVab6rmB62P0W5uRJO1yBuma2svEPIRuKcNLqgdcAyhx7z2XKSIyVi2O5eBX/kN2glzQ2OKmXGAtMiSyS3PVIjXNBjnYdJ4PE5O+MJVKQHE1JmGpXFoOm/+W22JLgEtIZZdkV45zJ1TroO+EOH7zpHm2rTxfzZzNvYZ3n6InVv/o1Y0UpnRA9YPX/lOVgL78i5J8BACGKHx3stnhNYN3s1sjDmyVr9H2dQhQUW8TtXdcrJ+aPm4KwQR5FmKdkMQtE0BPCnsvjgFSG1Cq4vwej6eSfT9z8/vPvROoeeDfMJC3xTxv5QrDkOb8hZlpwVmkIXSf2HVWgMfTVVEbCVJ9LPzMqgdMwsqjuZa6m50mhTuLXdIIxoce1OFbQ3wGStED5GMd68Mt0JpJYZ1B23UJeNQhGSlAOx3t6z8zh0JjDAFbPDZX0tS2W243/GmK8URg5aufPmoLTGlzpkaQkveQgLs+6GdIR+gnTCkLjTWJ4y2lx7jN003we6ZoHp1IFweHQq1YnNFOanVhSBsiiQOPZ0KHppg9VIS6Dwy03t7k66sBOe5AD5YrIVGl2l9jG6kaou5JK4q4igYKbuXypYAtmxZkI05hl0liGv8MyjLXENV4JBREeh1afbzdpD2l6fN9vOF6iqQ85Zd4T0YEUZ9QDp/y8w3O29OtRbBNw26W9wVswucCODlHTE4aInszAJVvzSHkRvA7jWkFeDoWG5dkjRwebNimj31MmqgQMvLUuSGWbwDrX3sFQZJBdglvgXtv4PEAzc5KusPQoHs/wysHcslvDdVxJa2Rg1EdQOAKuMp2nlIlhCJdQ2E4uce2JXfh9BetQwF/Ek4is/eTY/e50k0AuBPzywH/GOFOOuSJ5p61FeB2K7b6f4o/+3UNURHR/RWuVDF1kF6Rv+cSmMFBMwm772oYf+f3vrUyw+fu50s3QOzBDcuEHuKqA9PoFyTlOUyeTKVjxuMFlPIkK5ClGeaL2Mbsevo7N9goh6yCbTtsbzAtAVmtw3fjRU81p0P1aJPxa6H81w+XDBSgDUpbNykRU6wQJOpLKVu3i4+eD4xtx2El5eOcoL1aL6jUP82/8YGyBV/0OdVsHx7SYFfrJo9j/9XJXL8OdC1oFgjBy7enmx1uny3JzdMHfLJdeMoS/zZT/rLbp7ZRaP+saM28oeWXIeLPiTKYMy32CFFgSQl5Yk0RlsZm5UGduUK1Aly1CbBi62gu8W8ABBMNNfcJt+JjvuwClJPUES/BCW2keKccNfxuySML6CauM9LLWoov4TOuxJ05VC9tm037xbDx8VYM5k3MCtetJpS/VdQ3134OOdQp/lmsuqokOv1Go9aJyaQhYpxbnPozUEJKVUc9AJmf9JRanfz7lQDf8aJswcOA1LLoCWZumroqE89PPNMbpDslF5SztHaAkK8ygVdkQ/7+zONA0fHn+HjMoxc0VaBIUMJFAJQILA0J/g18PRVt9c2My23gNMRl0jtKQNZGnWOy5w5iTWIArfZlspMBrZj8xYPu+MWb3GtCz5Zq3hNh37WKrmJw2lZmiz3TtYtbAHCREnYOY/c0zfjB90HEE0G1QR1Op0wkpEPMeU7BVde2ENvyBnsvHmZFrofl+dce2i+rcrVdEyULR80fBnjXOTsI+RSaa6vgsFzQoWzR9D/C3ifOrBHxDs9RByfqtOmBkGROqET5awRW3eyGDFDBA5zM/RbkC9orwETgZxamMbS3qJX6eKDQfifyFm8jdD1VuI0Z2K/aQ1zq1PU86URZCA1JA+YIoUcFIfwtxYKWWHP+xTfPPSlXv+sc95L1U1bJAZMvy1/JHf1CsX39MV+Fb21621ZRJYXQn1Q815rWTkpVa86b+GwJHc+KkvRdzZz5ynOSiULTN5SYXLW6ljmh0+aPmkB8XOPr+L06uTU/iGU1cFSSrugJSekBTTnDqKjkf4Cr2GuggLbbYmDmoGkePTrp9x+Kt5FpO/DITuyIQJNBkWxVNWqDSPhEiP9F2TcQEw1LiD8aaGN/FsEgX/Mfl8vVLAjvPHHKBAafgCCFmpWpRIjcjhnhCJfGlkcnwBFSSUv5qUUVvnRLFepOH3MiTVA8noKHcjpzmQwVHMoTK9NDkXe9R9HgL0JnpulWRUuXWyhav+jxRIe+zFmX013nyPmluuIziKM2rN3LxrEcFg9NklpJuUsc8MM7CbrDFWEEPeDJX7u0iWvdRhXgftZWX/gvcygt1lvBF9WzFHlqItMJL0aY4BXfzS2S9zDQKXPf4EsytKqk8788B3L6WHFM+LgXvVyD7AAj2XkK7gFukmAmX4Jijy/8KqS+7r30Ps/MatYsRN5OUuQsAy8oFnUx7hlEtRXwuBKbmUj6UX/wdbk/5YIz3Wqb0uUeAm03SRMNfYv4fX80uEdl0nGN4CBjMNeariZ1+u61s5Hu4nyNijf98Oq2s5HewwYp2q5cD+Ve93foVFKOObcIfdTGvuCIn3G2rcd7Y/mlC+qB8oTi1PgAJHc9k6htrvVro6TfftGh70k5dtEsLpRi2aj9XNi6leW3cg9epWej+sdILYae46ep5Ip8YcFH6WjybV3psFgiQeR19MNKpjccodq3FfEY6pDfYJ5DRVLvxE84iHn0YEbwX6PmjXecdqtG3ORfN5ruT6mA0aY8OQHPY2BzZ7RftYWNONTickdP1xVXi3N3S+n1Xy6M4yNtQdE2N3qz70UZi1FY6gMoy/3awexotcQfjPXWDpYRtVqDBDOC/QMg0DkmagADjJPUbxBrxMwFpuXaQY8mQ5oACh5mWkDKj+PdJXOdj+WIE8eO9mT59uwLvB0QevkvxVQxU21L+62oHbEko6n4ufS4HcYGfX3hwpqSBarEM2Pqb6R8KJC7QbnUgbU53DkVYroAb2Lg4ZQal3F91bg9c2/76GnLeW/C0z24nPDX4RzEUO1WujmkVXdPwx+jG7fGsEFc3BBApNKxQQiHOIr1O5TgUIH943g3eOCxKaMH5QjRa+/PtxO6nWpC09OvyzLEP9qMJnVQpvZvnCHv8MDZL16D+y6cgzqWdu2f/xpdxd2QbhtxFt2eo3zJFMMtX2iA87VuzRbOMoJxmy7Kb4o71KwINS6DPN5lqe9Y94Q948dY7iiDHdukaG9pAzP9S0//5T81AFAo6V7s3DxtqaKN1qhRNhao96fsBQ6AQepf81NJJ32yPD16XmzaXypMPrTa/c40DS6pSqgHfrAP7WOkg5v43dLLxT9kw0buHCgA2IRMZyHD+e4y0YG4c2J/BC/O5nvk8Bf/ZFyQ+vU6y9Og6nBLNb/vH4jzZz+6Y9/NWqDhi8usPR1BwN021RqTwKMp+IGmyuz7vKWmy3WYmKAc2AINLVgxt14+qTwNH2rfIg/8Ki5sld9ftEp5udhYDqwUSfT1GlZCxUqmzmfsdR4cALTsV0/i1e3OexFT+17CbYT0XkKHwQlAdE4Vfs69xHALYCdQu1c7V5DxujVG/a4+P0cvCivcMiUO6HyqpdBFXIYnSvGCqg5/tRbha6+Aqn98QiBTi9NOSqyxwerKTG6/Q/oXG/A0mYLYOqHmy8itVYmo4QpCuvN2jlL6H32ULCGCy9x0W3QtnyW45K3luQ2IaMEk4JX18V4ZZ87JRI1vnwfF8hd/YpWCQBJpXwdlAH3hXF93Itfr5RGGeNRjAjaXb5d/ckci7l179G59jPy+XH0aLxssUPdrTIUtJiEc5NzW69Odfx3iqBJkGqvVvOAI+rhCvIRCU6PpiMHbgv5EoVqcjvkgYi44jHMPFVUr8xwiws38n1VM21QOaLMliVF7gfqLkfb+/x2oW02xxK1KI9S/tGltoypD6OZ+F5J1rv5Bhqd9Rusd7Ofv3eJaGLc0OkC4ZNDrGiiBdZx3rsrTwQukzEiUmvp5T4wCIOd2Az8Wj9MGz7fOx6s90tjhyLfd4FCzcqEDSVRyY9GDPTsDy67/N9BXJWRETNONa6m1rx8jpvlNfp/LgwQZo/z9TogRLmuUYQC98hU41acVQRxr4c9x5h37kiRS4Zgjwh8ah8S2zRCPnXMKG6WCFT6wJ81VUohnBOAfF5+JE5MNuRAHdP33Wl09/cK2w0d03gC89kiKE6vIo8rhFu0xlw5FSR1aVIU1TATQJG0Qi93NOTXkGTnkRO5LwL1vpCFf/rTcKD52j1iu5r95G0YPa4a8+PgztVBgBBJl9eqFS+fnaivniYzu8b9RsLjL/hUnrL0M/8i+GZqwEQAmp4IbvsjEfCQ+T9nwRwLGmcLahpMY3OJYmsCdbBd7sLgjMCD0WWUAVut1AivVG/8AfNdtH3fd1d43Jf4hk7V4ytnCbhQO75Ae6/GfjbHIUqO9xsQFRRmbqq7FjGMRUyZcZl3nZyN06g3I1ir/+NT0LYNe0bY30vQhsST1bzTj1AszUAXuWrCBrnh+bvZAP0gbQFA2upuE6iKIHL2T/JMBBLZiKeA284Aq+2qt0OXUghvo+JdfWtAUAaoKa/U6hBpcxI0s7H/DakRxTvD1xqOTeRzgyXPXe4NtGeM1espzR5kK5Q3nJ7mUfOAalzroWhD0454ZO+/1819/qtmJeOBZbB2aEQcPceELyvQ1PtUru15it1tngDyAWNTyzcXkVvHWWgrCqYorrCGTHHJfLHbH7wmHDJGgXOYjtYygvclugvam6Ay1jk4Xq9hbkKlWycSWo5fyNAcM5CFYCBhTtXD8QB+ckG5P8TXotMzD0olSQGQHkjatwp3qyQDKywDSLdocrI/mCG8yMrnrLprpbueUmelvzTacRnwXlTJuM0Ry/NadbRO7MsV5mt7O/YzfdcGGLbv8213aFRYqLOwC5woGDPwIKfy6UhBhPLr+ZLYgaE9U+9k0/F1lyJfYo9IjWssuVjU+XtCPV4aOUdx08TrSpPYxE9jp13PAcFeYVgpoiZqxVTf8VolV9M/5XcHoK2EEC1XhfYDe2jSkmktSkyCsf0fKiB1a36vJOD5VvQdllrgHXvqmeM8yl11LWRwAL7XSNC3bV+G0zu0UyQRdEsVYV9Vi/UBn+J0zUW+OlRpesl6Ef/4NEt07mUPJhT6KgjGdNGFHgNavzcjIjkLWKDKAzBVlwn0OQ5Lc74Jq6GznydZALW68/g4j8WEXocfEuzwBkaE7Vz1UHfVQ7pUGDgMeswob2rJkMF7AH3pdaZ8ISKTTL2NS+0MvO1GmKShDYfN5g/sv3zm4YKpg6tMx2ugq6YHgWaGA4Go5rsrK8N6wxbdy1KTCfSotNjH187Z4JfnMXPJbHLBRPoRQvxK1nFus/EiAub42w+0uq3iaABLgapEKPeppXdyvlY2ftvvv+G5a+NqumhRnunR337P7kWoG/MGGY+qEbKXIkGLY2TeqT+It3VgkzwqVOdFXfUWZECV6D1VKupWcNNdHzPqbgHZbwh1/2Bs/giylTyOm67BaTxDQTcZpHAAb8Rz3b2NaqvAhiQxHPWU8NS+fsKyXyUTvyuem/d9BiuFoHilVbi37Eze5cWBq0EcIifiU7cWi9jUtkoWmK7oM/TEvYZjDHyc9+whMF9OBfmaPyTfY+xTwTfd4ihfmHegMsPQbJ91k0BC+S67tIEsL+wdz6qT3jxmPTOpwqT4PQvrhU4Mnsu/uHwj8aq52ATOV7/uzgrCZPDUGSB/sTY+GdEIhX21E9pMdZMvLQMH1Npn5cVckbfcQIDP14K/Bn8Ys47FmzLMKXKGgIXGCGouo5J+qN8tkceWFFwUGcM2bBsaIarMFTfwHOc+620X+MO8PdF4HulXYXh4JgmIEasVqJT9j0KVdQZYPfULxfcopneFMDq9yKjr+E9VlkP2Mb/nQyMQ8vPX1f6jVjh3I5V00XJ4knFkFai39BJ0EHzIk8TApREufafPGeeGmztuL+je+petbbKEqLdGG0ziCaTbxK6PIkGb6QQYn6SjtzE0VqXR4Qow5cMqNPbOF68z+31+yloSLwAD74Lz8UbQfQ2WhAV9M6ERfU3pb553KwSkokJ5cwc/93lFLYBfFwtiHvgxQo6Y8vh4WMqU5dVExf9lAZT5W7kfWAf12Bms6G3Jr1Vyoy1ld5Htx096O6xLX/prwYWX9I1rY0GW6yEqN46Mc9Ms2fEF9vrQr1c93yvTxamcgnxdKxab3vVUgSTA81fqy2Lz9XyyQAf6ibp54jrOcidQdz6SSzJWY7OFqh8cpTGksLt6rCjidXEbvosCIS0BTWUz2pAQD+TEcDCgoIw4+YR78tOrNBkREJO7Rv/CS9G+kFga0sxkYLHyC7KvCAkvW9S2uhiYQvwp45uWLuj5p52y+T8fT+gPEenDaq7qhoSDhtx8rOVBrWveFc5SXvroKOprl+el274y6QHcn7vNN97ebzScjwCj1baPipbPOid3HCa6Jngupfw9Z4rQytvSfmcBXf72OTWDhVlW4gmvaYYFA4mzMU82JLocFC+nGn/EGAWijByT3KNdDpkSR1PbSoheL3ZLJrBio53dNvx9J//G9guTODMCu4PUOh0x0KwkfscUL9VA7hHV5ag3mAcSlkos34UHETWWgfEHwFw3XB3+thTI9vKyxm8cvsXLSLrhQ9+yykYPhx4NCcfwgXFA41qALfuLW/g4Rmclw8jAZH13E/LU5OLmrTGyJ5N+KcVKoCXw/lUnuwQYDgu3nPWIQK9XeECP344e4347bBi1utCvD7Dg+DOEePkHvj5rsiY9NZQe9oURJ/a/2N4tC7U4J455Tv9IilcjtkAOGh3qceoi536epg0pxpOBHNm9F3PeUzyOJsK51qZ1bD/ZlXtByEOvVhlDW9vtPflKw58Hj5Hm8Jwr08FoUre22zvMB1eSzDOoAx9HeHd66t69uY+mGnCU44XEDq8tbl8J13BxBDsy1L/05GWj92KSJfOB2P0Eyf7NUz1RQyMVr2kr/w9yWNszYZEzdTpE+ojUTR1TY4zz8wAPmXDkAq73XG7PW5OfEKRqxuu+EP8nZfwUI40zQnzzocwgIJYXy/D//eqrYQowctqY3IIgTdzrwip4avj6m7NYyTs9KOxT1gYlO/WUyYmcuXGKWud+Al5mUAcOSsAXj+4LrPDVtshfNztOnLWZU2o/EokZ1qC27Rw5p1o7T/o8sDcCPJ1eXdT1IpldO9xYtf743yzpFZKt5RP8kl8jmvVqbGKqVJakZDDfhsiJfygjDdP9LRY0th0rBZ9Gj2xsn+6WGkppSsfsTrQSFQuogX54EXJDCkYzbkKi02hQok5TfqB5D91D6uXAH6foRr68C2Deb4HhnClgbApGBO8j9NE9krliL/ovjbxBCMr80NSVh3PTJDIuZcw7OXoizC25Hprd4YAp/W/AVV5yCGql1kYdAk8gHuTWH6DBxdiguC841joEZnQnvuHNHIWAgslYoeer+GXHvteCTK0tze3pfEYhOjG0unNTONHFRcsEEHzVTYHIgmUQcONmwIE46noyx3sZCR7uwMlUi+jlcZDROxW1Esszu3NDSxl1Yu+0Yk7fXKzEkWsPlfSFvyCYc+3rGvjNszvkylBLCunV3pKJDhaw8jKk8Hr//0DPUoJTCLX4LYFrzMGOPIS8O1ThBLwKfM0zsTAqwUY6usOInhjCYaUkXmEhs8c71Fh3YDNFNxL+N2xx0E5mM5fRbrDhTgGWlJPRz0xemUgqjHJ1Q6VfVtP5zN4EVBiBvp6V058DgIdFPZw76DepkCLJsVUp/R8KGM+bwtkwjpsHtdBUhnHUt6IoX9dvW+8Kz5Ze0UaBbBeLuM6tZljvYG+9oq0/eWkBLQZLHyuQBvgt/CyjaxTlJOy0eyk/Yo+o5Q4uBxYvuxm5jtFfJc38sjiHpHU+8a+EnPq+RSVKK/UqF5Lg/1VqknPWv448FCOVbOk2hmRlJGlgLOAmuf4ioAsWUd2sfGSuSqpkLRPuP+LaOqmWcwvhAJwp0CvgJGmyIvZuEkm9KIYC9FVuEJyA1irLFP/MnCq8DRp667EvSq9FLN3S/v1Qavx6ZINc/gW30eaLxoGad2Ma7YGfXvO99wskwex69H+ZSC+CMoIfX+Z8fE5DLieLvR24o54B02Nfn3XuwNu6+XgEvNcSJ/EoAesL6IiwWZ0xrRXYPbcp1iqvcQO7q1WBV4zxncNpmYhp/cPBgbb77l1ZOUoTt8VC6xQoQJnRD8y0MxfIjVCQhq9zwPcZvFW9Q5s3DuMqZe9LCp2R+ivNQgsPKGZ+67WBc0V6yzfpfKN+ES7T/YQp2o+Y/+Q38I5fjbTHZ7+yWcUtFzM9Oj8i6uUC/aiRcSypArR9mF1LBRWo5bTaQ9Ziv78CVORmZOUDSkZapinlK4e/N16xnvEwy9nU6/yiu8tIvRpSdN2BgVqBZp/Tg1YeDkrLHbP7IAHmVvcuxQsMzW59rt2M2cQ05mPX8dzLtEyboRwzgTV0/PJYlae7JCLSGAS4JvK8MXH3z2qkci2x0vCQ8CjIo5hxahLyeBlLJAaLbPCPtYY3m42vvr8Qwev/9L0v/60PILOiPaht9JXo/k7fc3+FeAdmMQBeiYnrLJ0U7RRnNBoBQ/m4I3064bxzyDCvxv8zUe0bqXFdNdK+qM50ZJviAs//pNs1HScIE/bndYR4CQg/bm1w+N2BHHhgEwF7M1WerQPqdGeEYkUOQQzQROZxqQ7Mk3k6EeZZrGZ4aJa7K4SPf28EgsGoaX1kZ2v2nVimE5T+RDZQLWb3nBexpROQ4lO/0VaK1nhC/B9fLNa0Yeb09XFZUEddTeOeJN4flaNXHAnFxBLC6kM+rVLZj24TygWKajoypKv/kAUqWMrxDJiRlwqGCcMHZS2x9OKRlTRY+6I5MYdP4KvcfoBxrHPlPQ5cIcy3rUxI4vBrAdETurt8MzHc15cjeMVAZTWQUQnEODiXjq+cOkbpHFQ2/1wjYolxZ+SWZ2d5sexPlb8y9HvmuxBnoJ7lmXga+z9CV1Mopl6gUKS4MNMvyey4OFPin+vtEPeYsSkKwXbG6zT3isotk73Y9drr2xIEqKqT5yYBdtlbVEBcqlTP81bRsXPOcvxAKEdX0UzNL0NSUf6AzXTZUkM+TrZNn4tknHMbOIQ/FfF3FUQU/j9XBHP8yaFbnlgvFbDmPycSdcZO0fJCSJbuMkbuHe9juhIXPqir94j2csxFQpL3QD8W2znaMOZ2VrAvau14zWiRwiGTZaVxhLpNuBiYNI0oCMJ0ux/ZQP+K4G7YlGxyXYyv2EfMj9qNlE6IlTfaU+PFhDgotqcydtxdOujKInwq1lNLRvxXdQyUYFShQKMUL20uBAqp5bfxqHoTS69LSWgWKjw+YtF4KH/Bop+84dnyzvtjsqKayIr5PBcz37B+RrwZykUwk00fUtZG4KfRMmjMhfhFac1CNydO3gZxDp/6lZ7GNnHU7+SE/ts9eA8RLRvQwPHKwQEbQQpVbKZ0nN/ifpW2/l5qicpAEtMW7wJRkiAuocbaxDPCC4DwiYG68JVMAZeMRQgMCw/E0VCnjUkyh6ioelhVbYumIBhAFoWt3DisExC3H89OU2wgd8pRZKBycgcGmhC43UOJW6kxPXRy/3IrKXDANYYA4PP1LxZMhLAYkiWtsMdAe4+G5mUt91cgGJ3jcQEnbWN8Hn1kv2qDBYbnSvpNhv05tvvZMBnHTJdkW8xN9wwZpmLsvkHT+hMRxjTMYdybOpjiCAZd7rL3Tl69PUJ013xtzAjRxjgdxQUqHZ0UEF/jEMgRVGb1Ya101nC39LP5EpZQf85EhUWvvYLYjZPsaumEiBaY8Afhi1hlYqwcn1EwJMqypDncM4i3jIZBfytnzrkPSsT5qNUhhYzubE3mWEoay+2qxpGGb1G5cSWVyeaJabde+5Y4S4W0L8Sovp6ozXRtMu4IgnbbBBUERjxwaZkIjPCBZwYYMaAPMxY9f7K1onobJatQ1odwNJF+/ol4KMjSPYn2q1oOt9ftHAEpBAGqo3wTA0AF/0Cvje2NlyjJpXOJIdp6mZz0bxjRGJ88a5w8YWb4Xh/al9Ejx4JRgnJhdb6JruHAL/A/8/pSm4lQT7T3kEe6tMnUcDYjalNmvcdXu2eaL/uqKgqgBj3nrRFuVSj97MY0JiHmRVGlZSOdrnwMnp0k6zYqIzx6ngG3d50/B6ybgsMKiqJLcX5h4cvR09l80CkIDtra6/+sdD+bSkPPJXL2bVSKIhUfAqv9N6Gde41MaTdE8wpLTE7CpRfPjbRad0DZuavtR/hgsRk2RnDr2MSwgkaVEGmFHaSwV9uQD+Gjyr04U2B3DU6jUorlCCW4H2km+MoGslWYIfgVUsmBHrKT/krtW4RykYZXxj2iAKZ5plcMTy0fv7OBJ81ReD/4LaPAQXuDFMVaJ+zXiJVANBdx0+0rqS/vhw6VbITL9EBxU5Y9W1iCg5+Swi41gPZNzWYhucT8k0DsTb74GAPCn371WuYEE7XHyuAtxRLk5QY/UJUAVrLutjOUhYEIZDpVvoRkIhG0xASvCjwzUkWtypPKRz/N+GY5l/3Ds6eU3VTBbs9qwiEP5L9l8XWx6nlnqlTpGlQ7BSphLb3pdLZpfxgwt4P9OQqBBpN6n/laXU2rZzXPrBG4RD/e1BgQ0mXtFGrQnGDtMA6ivEuXDU/3pXTzhjc2MnOw+MfiowTOrslwz1Xv01q7XcW9mjch5HjCGeytSaU9FpcR4HuVOIAAXa0FFoA3NR+UjztKC6srdiZKYoKRmSm44f49dlFnDFNnA3Kp8aDEswH/qvctJaxmsnT9MrmJVXw3Kw7p3bgT8YzswWMLT1plIQmGZ747iGVtmTBEGosqR23+CZpuzdtMnfyY6WYJRIMGSK2KBT1YnOeO5lgCARanAUKq6pG0DjJSygnBRx2Fqoek5vH+PPcKLWhs5ZUfI2zh1jXI9hAmjlRm1PPhFU0NOHuJf6BSZTRJOPJ5CtJlEpGh1tikiTNaOg2l8VkUO164Cr1StsdGGxy26AfzrRRv9Cdc1kJn29/es0z8ITBXfGUVohrGqthB2AvE1P05HhWAmQbpMlP+k7r/lwY+CJRe49Z9nFf9G+6j4v/UaRPnzu5Eg26RAotj1qnym81CJ75IHkAi6Uv9steqBD7j0SsWWzekOpNz+PH9D1mH9Kss6sGldomsH+W2ldtMawfMWf3nQe160MmzKPjTqZEeB6YIw9IqN3BCGuDtwWBmBF+MI/Z0PUeDDJ85b0RsEVYGJWi4MGKaKM5ldyzJdkbd7WODSxO/TScJNCirVTXtwhpk9q34BzY1fIqOJeCek8e+w6CRgaHZG3LyMtI3LKlQIyqVYRfQ2Cm2WzAVSfW7PtvfnzJpSOryjmkdancRPKmdcJ/sjhD8ZoZSO1OeGeO5irMnucT9ewGRNRqOnP/BcGfddz0dvXJUcNCqGPMn12LBg9iTj485wJomzxzoetoMcGzrrDs1aUbcOcHB++z60OhkqTUG79iwhPseGMcmZDrZgnjpvOH7NeryBzPdTO2d620twPiHM8kYhvLZXaIbu3VlTGPC4fNeHYnqL7vzpm22bi8Qtzb8h17QyaFprN/6She7YSPmpAwXd9D6TI95OfajwV1FfcN805m3JP+aapjPcWWGmP2B2a6A65ed87DNpQEaN9FtT1LkgkB5zE8d0AgYyTBcofFU5fw7qgkxMwx4DLWY0hTLy/GfgeUYF9fm7KiQ7sLg02W2OODaRPi0cJ/EpBwBP52ZEARXj7Mp3Sqty50fUOzFQvfLQjyyFlFdP1avJU4FKSUWaUgldEaDLV5InjzjBe+tdqAEVGmsa1Z3WX7Ss2Hu8btpY+zA2fj+IlQUZ57dgKxnZys2w78SKWUnmWo5GYCsHBGdtClpixTzobfwSnZmvXc91zj7Kn+vNsQupWeI+ygGCjJDY3JIGHSIHaVR/bJ/jzmEUXHe4lweIDYOUZHdZZzgz7+jJqsYgNOMrWAA++B30/QryxqdAQe/UnRJOl27hh35W0Ce+RLfwleDKGPDEmKHKC1Al9IvEVr6xtOvmLkDKrOKtPgCrUUZs3vP1i+Ur0YCEPj31P0hvAqxU5d5Fj8NUry3EgFixOTuNZ0sdz5COH6A00GvvAPNGS8rTFwn22HtjRhexzzl1NiIxk5mhKpkAP9VcfETKIVI561HiAhvo33pCGafT9AWet5LEZkwVQKeKx/XrFJwH4ByOvKBJdQpuk3JH27gNM2mBYyyq3LWNAjNdZBvtRbK9rPcihQ544s3c2/ul5ieyWlIOfuwIALDeO/xSobjFi70b2Yrs5cwj758NK9zW6yXXs6wPcHCmIqmfIRGFbFCVThxeBDra5Jt7ng+qhci9bMGmqYxMumhWLLjdHX1qNh6lasFVhBuEOzt1oP5BrFtCFsLyUKRSWClq/NvwtU3p7YegX46V/ZdstZfEnsy8DjzyIhz6+6ITdiP4H1l050dx2F17j91SpG/gf/zZlt+JSnoAQJQrNcKAt3B5CKVB/40ROPsrYS3X252iEELMggSRdUpnRJbweTXZZObZXRv1QS77zCvthEekodYC5RUwXMo03iCrjVQSEI53AdAzkP7X9C6WtU0gFi2Ct7T8qSkq08Jp2JTWxWFXzhYSDMk5GgtfXYVBccPIAHrw1HJBpqeBLcDKIn70XmvN6E7yJztoSm3+yIcOEr6AeI/xaPcEgSWAtvykgzJ3gwCaTHD+xbDSQlY5bLn00zhoEPuP2Sf/YCEK+GZCCKcMf7bcqbZWEEEwsYGZ8mPXCPMjBlFDO9isYctaNzN2Y4mPDiTgfT67GmIVvnNc+qJFhbwVn+DUQplNelN4gyugXwawSklD0NjXjSlz4wPz/6GsxM2V6et9itmKl4m2N3kh6GdST104ABedYO3UX9p5VJYCBTTd1aOxc0Wq0BCnhWAA",
  speed_math: "data:image/webp;base64,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",
  word_forge: "data:image/webp;base64,UklGRqARAABXRUJQVlA4WAoAAAAQAAAATgAAUAAAQUxQSG4EAAABoG3/n5vGQcjjRViw5QHibs0xnFgKYveu996X+HHSe73rvTdKeu8NeRHx4p0nSK/gWByLonOk0cyfke5yExEQJMmN2+zaSXhEhCgAWvAJCeGUZCkRG0oyQuqkmozNWAbr5smHD25NxmXsTMWyyS/vHRntI8myBDGbZYsks8Y6rtsf/PP+YXUUKPNzCt8UvIQVVk+BMTb0fA7+LmMEB1p45LZJmb2dKJV7+buXcymEEN2zEhoLc9PSR8HcbbsnGK6nYN0wiqXWf61S0TAMk+oJjTHgNgw0SiPkcUl1UlVyL9cbDZs4A4fYDd+CcA8Ao8aDJKNtBx8+ubPU6rrUhg77rk+6B47RLnbD2fd/IU3ieFyCwfdfjlfKk3d9eW190Pd3QRhYri2NqVjXsTrG/EM9sdql5wqFomkZhDK5UxXLqpzKMYMemQ3XEw6EX3jjjGmeqbU6rttpVZhBigyxsM1xytb638S2yXpv6HnDXhCkUYGcyUqSnDYbm33a6RhBGg28djWvZLC5TDi2bq4UxiOCu1baFcSpA9isiOA5pAmK03YFo4gwBEbGpmUIgVDHNdPxAlkuxgqeQ2w6eaRMGw7Rj5J+ceRLxPXiwURSxYUztTXHiwvUw+WVIN7jAoTLf1PpNTbQrU0vTgwW/N8Bw74bLzjEZiEmL5VYpR7XNtMIV9rQ7YeyPxxVgmXPEBe4/Q0YbYiQ5Un/cdN2YXKlaMBY5AgikPoIJsLEVAoFTKUQh2mOAIVoo/APoGqSFE3jqOMEMqwNxtMDyU1GN0zTIe2Zl49pChv4xXr46a0PIDODfwPuPo3nPn3uputkTmGnGxTNs+//OwDMDPk7WCEq2vX5OYVbbYS47cgH67CZwDbD6DF4WZ/cfqbFMnnYvXo6m/Bxpes/TYjeFEGUq7YZoda5+soi8rH05WqTOAA1LIbZ061A5HeI3bAqpxaVhI/5u07sLK25AK0u6Ff5J2JblTOmwSi3lElVyVfb/LYgqgcePmnqOINYxaAkS5TPi2+Hi2WEuD5CRySnHfFpDrWUiLaQe4NoaLfl+23EUBYvk244l7SrORQxkPbC6p+hmpOeHTXw639cWy6agTIfebawqGrWzTRdNwSzIwfKvf7pEqIWc4IaORE51X13zSNqUae5K40EkReB/Kii8oZuOWS5aAhjENUU1UluKk5S9xUUI+2W3RBGKuf4LBy5fQ7x/g6tdLhstdquOHYoEXDlq9ceX2BiYs+d8yh0Q9i8kbhClZrPf945schsyNP3vW+kpNB2p8XXrC45u53zzs4cLV/Mq0leRS34NIf5t5RAhW9+LB9WYYjgYG1B8WF1fntdQ/H48bSGAj+qPx8hyJksE3gC333C1DVF+GkENM3jHfjUs0tpJEssCNKs/SHsRHfL5E1PP0FNA2HYD4cJSK92XJobnANiZS7nX4AF3dpgh1s4iPkMzsMbFOsvYiYk2Vc/IKUXul4oxUCYwXo4AymjvbCwzktVzBc4QMJxzQKbxzRQNBNWUDggDA0AADA1AJ0BKk8AUQA+RRqJQ6KhoRqszZgoBES2AF2ZyaUCSpXP6p+B/yh5kamfJ85p/033JfPr0L/dj7gH6h/33qReYz+Vf0b9gPek/ED3hfsh+sfwD/1j/MdZH6AH7VemZ+5/wm/2L/h/sx8Bf7G/+e81PuP5AftV6r+Fbyl7N8nboPzO/kH3I/I/l76+/5nwh+Hv8x6hf5L/L/8N+ZP5ScczWz/O+oF7DfNv8T+YP9q9NPUm7vf5v3AP1H/zP5h8zt9e/1PsD/x/+tf8H/Aflf8d3+r/jvzI9yv5//gP+z/hf8d/yfoL/lH9J/2P99/eP++f//lff2KQRVA2YqK+PNbdXDL3eGas375PRnhloJML2L29DhTQ47+A/Q5zn/jvgIs1VKYnpRkXMVLrwe4zBYuh8qFHWPcE8aIyRpMZZgIqspKbkDH/LfDJDfQsbRxUeS+jtdS+x5ruDR9mA2kxdAArQQvsZKx6sqp99VF8pJ9QsMWxm7ef5Uc7GwJ28hJ3RaSW4sIP0q6yhVOp2lMee1Nwht8bBGeVv+JybsLXUuOK0HH/qgIaX5GcpvSNQDekWziAAP7tON/vHE/wKJxJWa2b79TpBLYL5eOOB2LT7GoAmn3E9msLF9dE2esu/dY385CkhX2Kuu3KmlI4KCld4kyKgTeA/o73/rvHwPWwuoDaXe2MG1pZ8KIhc752PY66uX/MKHIp5r0mR3mCxJCNXXimDjz9s2Fk7WUNvVIDPq7hLDQTr3f9w+pr7q9hEiDXD7eDOPR5dU0z+y/Ractvo9jDUpPIwlLNmHfrXx5zUk7Y6cLSKYmD+ptFuPBfmoyD159TaGUEe3CPGH5qL8HYOczIoCD1MnNsXchShkkvWQ/ffjHNUpswgXSjgRgAm1n2sCYGg7FpUVgs7bL62WkDB7elL3b8AGkoSCCZ7QT8JcmuT5qMjkP6S2lLZf1RP0GzkiHvEfDRGGNFiqLl1PK3fgfcqDIIUZPlh8/5jMHr6KxK4NeP5ocE3P8QHqANQvzzEnicBfV2bvhgLAMpJrN/DVQKDmwtLGJumACHJT699XQSCCMHlrLwZIOoz0G6FfeLcKMX7CZ7K2YyHdfBZBpKt4Uuj6Gpv3Kc5NCW292VOI2q6TKpjX90biUAuyxVeqnOiZBOz8lbnm500VWO7i1QdLG4IVfKnVfpE7toVZEg+PU/1bEiazOQxl4AAlOmIbMQlj3k2KQtOscgpuFr93kGgIUZhQC1rxgSnWv9Z2CdVVDfNNg3t9hYPUrmWpuZWsDGNHiLcV7JV3i4NaF+q6hQpUECr4Ut/secN6BY72HbCHIpcp11RizhWAfIcAQ8Cm1OLRVvRvH6ladm7IdTnDmurr76ldcBkmZQOvNCaXrILM2sz9TTBvTsXoTk+wUsbl/9hRy6BnM8N8yN8woX+CLA3KlXey9L5AxP6kcAVcWnj7wF3F1KuO80+9CBRbUxLDBfiKjS6ATUnFd3ptPsbRlKfF/UPDRwlG8VTLR4ZkieZozc5ia9j9lmhrhHRg9ukGlzPrDxPVgMIgkBG+pVvgZ8PyAeMZ5V88x/yQVUvXev1HHGPuBnP7tS8WTj4fQeuS/SioxGyscjBe79wVJgKYtsAxjSwOEojZWJLCz4lm3t4ykxBcAPJ8csFOSBHZmg+tmiFlRm6tEQ7oY2HjpfhfMVNobZg68k4dRT0uUIsIoRgq5Dd0/UMYviJxnK9oR6gHdcwllr8YxMHakmKb+Vz2DSz050Q+ovyN9oTTqdWJmtr6lWUgLi/3/X/3Dl9nEqx9pZSAB17Buql1ucnVEffY5VY5kzD8OdrLkoSVVULY0TOLPqL/+4fWBJZoUuBx6r8k4e2YylG0VRoXFNVg/J+DwidxrwZmnUr/q52rhgyhRL+jxrhwXip10M2Pn+NvhhhL2DH0nFAMpI9Q5RuEo40Oy0tifxNJRIfn5mYQrNK61wGNIwZw0jTblGLneKkulNe78cHlz3zOUsr8zQDSmSS2EbZOD5HPnobCOmYkeG86lzTcQsF7T3+uu1WZB32lDCIuiEQN5YAT1ucgqPyc2kIEon45n8eHbY0IBaX4KAVn/bnlF6+6HqDfwqOOeoExXbr7nhzhU/Mfj1RhE20iCx116ogl5SlNbmjAl80D1WWLnaM6SwLIw/7cy4RatYEG1rSGXt9imeLncZ0FVm4x47Al0rLhWyPL1lQU3ZxSUzSPP7M4Gos9I65NDZVHChRGAC1BPn6UzdrpsDzo/EK1I8Ku5n5C4dOaUwiYn/fTdL6avrsSWH9KQ0viDeIOJG75iuE3c5fsWhNlb4QCd8MOG3j5SAJ0gWcGhTRpelhi0sw16lr48KlERdaWAlo9bf7upIn2sXYXTPc72l/bDDSw9dEHh1ijY9BCgJmrczal9PZkJm4DXk2GcJeyl6p+C6HcfuCldYTmfHsxu4fQGnGSQRWJlrihV+sO8Z52CbAsxuNbJgloh8QbbKaY9NmoqmGJ2OO9cWceKFcnSHR0H+EltbQ9L7k1D2uf8pulywcqpNWNQcMdzh6MUa8yFiti0wdT/L2zve2uCcJHoPV0TZbPeNYvJKtIRyHoT0rqAT/BnHPWNwUCUpgI/iG8ghjy/FTh4lRNNfyxXtNSzrYeIVZZ8jcWcb8CPh6k4f1AjQ0WpqJy24SxJ2fdv/YIVakivFyogiG9GU/n3afwT3G9GEnCzhzoEjRL4EPFBITnTkQTxy6V5POfosCc8o6epw0F7XhtmGUjUrJPHd1c1NKn1//5fziJYEjxDQb/OpQ+h2ryK9o1RkTdpvnx0WPKmTKfPikSx1bL/KSCW0Ah5WV2mwDfZwLP5RXzCSrYnAzDcby2bc5xcQy8Pg7f2lIRIAKTjDosdZFRBKxiLGxt2/wHjoI7LxX7J4MZTAk+f+KosArmYmIyHWZM2eMHmfCON18Rilfi4+lRsi107r1Q3GZ6Y3qjqY8djBDIVtl8c1hdw/e4gXZ45pSxi1KWUrVARiQN70JQaKVn0oc837v5C4Kb0uVX6Do8sPuSFoKm8QQyrHHKIXSi6R9fC0zI3KOB1US/jufW7Zm53y/veGIJngKXMkK3PP6BNzM9GdpAdPegXHp6psP+ZGAuN/8E2dlOS8byOOpABtVsFf6XNTPi3xc32s1oaheyfcTTguCDMcjGrRQq7kaNuumScFu00TbTkbCnTqQO3qTNxtbqbeAMFRNNLOAGgFKF9DzQ/4nM+pLe4/2jhQf/TvocOoN8RLOp368FVe4gAR8fzXpb6r5YgcEr7JgZ60Mp6jR3jux5CHMUs5Qwq/3ucf1+ZzzQjqegwsgGARhgMOk1mV8rgikyAf5xzBB97NG86kDu7KGLK25H+PW9LnoAvlv/sD1Lxrqfd0CrIWyVu1tDP0t5IXEh956TKyyofF8l1iZJj9IN5Ooq1XU7oflzEkPb76jvjJoHlcKke0sgSFhKv4Az+/qzxNYPckJu576oKsXymvF9JgIG4GKcbSnOdqGnzFqlAL/x55e7VZbUXRDMefU1b50R/SE6BlSjgiubliu1GZU6RGYMbOKPvwU9eo2ynFvn13i7DMViBdOQVbwxak6PHBHMpwv/ervNuEipy6I4aXfyuUQJ0H+ZO0b49C3M7l7s2GHhv8UMtbEEr/rLoJjQhv+2H5xlrzp4onjMzeQH4ytOFp4Ip25YuuKMS53QE4zXsVqSQEDEwk+YNVb5xZYd6dDjwqvO4gRhL5D6NfWSjUiFIhmIXklnCp96MEmc0G8817YrhABXKuN3W3JV2mXSeRX2Fs1/bJJgdDBnyHy3O0c9mz0msu8JZqUO3Bx+5ov5czZX26nMrS5cyTSIvUmgmzEnosdjl3LFFkY6l3afrZ704t8stDrDzn8Q4g4gTKUa25w5eGu/Y23tnehcUtIcRv0QyLYMAkwRi1vDrOVEBJGbIchsqje7sp2MbUa3g6JtGjPdOchVPm+BhvWHdnTf+tOKMLlSJRVkP3GV92CTf9NEe0XKHpsXNj6uCpPmlgDdxHlRBa+Wu/V5Ink6aL7qMsNoaDKBo424z3tPNKj5+o7ftSQyiY444nCXkAAT3rV6hRoFzXqjuTN+/Hec0HFM7hVXeGLJBR42vxTDQ79FdU2U46Hi36GScEjqY2JfO3pE6qs1G4o3fJUANaetumVHnw8a601BcHnBcUfPvFGz2lpjm2b47IY55QFvPqpqI97X86PGfLd35NlBwS9uvztsuUZtdrCEVPUQ1JM7WSdB6/BORfKiNZyML4ca81D9NZQpxetArMkDHVOOwEWgwBLy1ZIoV9T/ESNvFQmqjCTj9zjkXH2hk/9jjVAcrbLgoropn43tNcXpqJJ7m1FzaU6L03wQADTmVRBK47roYTk7m0HAL2rkAnOYaF8CaLI00f4a+rxewMDAAaPlbPnDQIfj13Coq2gGOYDvNU2mxF/Ct4VqlKgP/Q7KkAAAA=",
  speed_run: "data:image/webp;base64,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",
  part_wheel: "data:image/webp;base64,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",
  part_turbo: "data:image/webp;base64,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",
};

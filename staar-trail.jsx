import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

/* ============================================================
   TEXAS TRAIL — STAAR Grade 3 concept practice
   Regions map to STAAR reporting categories.
   ============================================================ */

const CSS = `
/* Fonts are embedded in the page as data URIs. No external requests. */

.tt * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.tt {
  --caliche:#E9EFFA; --paper:#FFFFFF; --ink:#0F1F3D; --soft:#5B6B87;
  --bluebonnet:#1B62E8; --bluebonnet-lt:#DCE7FD;
  --juniper:#12A05A; --juniper-lt:#DAF3E6;
  --sunset:#F5C518; --sunset-lt:#FEF3CE;
  --clay:#D8362A; --clay-lt:#FBE0DE;
  --line:#CFDAEC;
  --display:'Cherry Cream Soda',ui-rounded,'Avenir Next Rounded',system-ui,cursive;
  --ui:'Playpen Sans',ui-rounded,'SF Pro Rounded',system-ui,sans-serif;
  --read:'Nunito',-apple-system,'Avenir Next',system-ui,sans-serif;
  font-family:var(--ui);
  color:var(--ink); background:var(--caliche);
  min-height:100vh; touch-action:manipulation;
  -webkit-text-size-adjust:100%;
}
.tt h1,.tt h2,.tt h3,.tt .display { font-family:var(--display); font-weight:400; letter-spacing:0; }

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
.region::after { content:""; position:absolute; top:14px; right:14px; width:58px; height:16px;
  background-image:radial-gradient(circle at 9px 8px, var(--rc) 6px, transparent 6px),
                   radial-gradient(circle at 29px 8px, var(--rc) 6px, transparent 6px),
                   radial-gradient(circle at 49px 8px, var(--rc) 6px, transparent 6px);
  opacity:.35; }
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
.brick { text-align:left; background:var(--paper); border:2px solid var(--line);
  border-radius:16px; padding:14px; cursor:pointer; box-shadow:0 4px 0 var(--line);
  font-family:var(--ui); color:var(--ink); display:block; }
.brick:active { transform:translateY(3px); box-shadow:0 1px 0 var(--line); }
.brick.got { border-color:var(--rc); background:linear-gradient(0deg, rgba(245,197,24,.14), rgba(245,197,24,.14)), var(--paper); }
.brick .bi { font-size:28px; display:block; filter:grayscale(1); opacity:.45; }
.brick.got .bi { filter:none; opacity:1; }
.brick .bt { display:block; font-weight:800; font-size:15px; line-height:1.3; margin:4px 0 2px; }
.brick .bs { display:block; font-size:12px; font-weight:700; color:var(--soft); }

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
.lr-ztitle { position:absolute; left:12px; top:8px; font-family:var(--display); font-size:clamp(24px,2.6vw,30px);
  line-height:1.05; color:#fff;
  text-shadow:0 2px 0 #0F1F3D,2px 0 0 #0F1F3D,-2px 0 0 #0F1F3D,0 -2px 0 #0F1F3D,2px 2px 0 #0F1F3D,
    -2px 2px 0 #0F1F3D,2px -2px 0 #0F1F3D,-2px -2px 0 #0F1F3D,0 5px 0 rgba(15,31,61,.35); }
.lr-zfoot { display:flex; align-items:center; gap:10px; padding:12px 14px 14px; }
.lr-ztext { flex:1; min-width:0; display:flex; flex-direction:column; gap:6px; }
.lr-ztag { font-size:18px; font-weight:800; line-height:1.25; }
.lr-zbricks { display:flex; align-items:center; gap:8px; font-size:14px; font-weight:700; color:#4A5764; }
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
  brick: {
    title: "The Last Gold Brick",
    body: [
      "There was exactly one gold brick left in the whole set, and Milo had been saving it for the top of his tower. It had been his plan since Tuesday.",
      "But Saturday morning, his little sister Rosa was already standing under the high shelf. Her hand was stretched up. Her fingers wiggled. She could not quite reach the bin.",
      "Milo opened his mouth. Then he looked at her face, at how hard she was trying, at how she had sorted every loose piece into the right tray each morning without being asked.",
      "He walked over, lifted her up by the waist, and said nothing at all.",
      "Rosa pulled out the gold brick. She turned it over twice, then held it out to him. \"We build it together,\" she said. Their grandpa, watching from the doorway, smiled into his coffee.",
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
  { id: "num", name: "Build Yard", sub: "Numbers & Fractions", subject: "Math", rc: "#1B62E8", icon: "🧱",
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
      { type: "mc", prompt: "A shop sold 15 small brick sets. Large sets sold = 3 × 15. Which statement is true?",
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
    passage: "brick",
    qs: [
      { type: "mc", prompt: "Why does Milo say nothing at all when he lifts Rosa up?",
        options: ["He is too angry to speak.", "He has decided to give up his plan without making a fuss.", "He does not know her name.", "He is afraid of his grandpa."],
        a: 1, hint: "Look at what he noticed right before he moved.",
        exp: "He looked at how hard she was trying and how she had sorted the pieces every morning. He changes his mind and gives up the brick quietly. The text never says angry or afraid." },
      { type: "mc", prompt: "What is the [[theme]] of this story?",
        options: ["Gold bricks are the best pieces.", "Big brothers make unfair rules.", "Sometimes giving something up brings you something better.", "Building towers is hard work."],
        a: 2, hint: "[[Theme]] is the lesson, not the topic. The topic is a brick. What's the lesson?",
        exp: "Milo gives up his plan, and Rosa offers to build together anyway. The lesson is about generosity coming back around. 'Gold bricks' and 'building' are topics, not lessons." },
      { type: "mc", prompt: "Which sentence is the best [[evidence]] that Rosa worked hard for the set?",
        options: ["\"Her hand was stretched up.\"", "\"she had sorted every loose piece into the right tray each morning without being asked\"", "\"Rosa pulled out the gold brick.\"", "\"Their grandpa, watching from the doorway, smiled into his coffee.\""],
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
    goals: [["🔤", "Figure out a word you've never seen"], ["🧱", "Use word parts to unlock meaning"], ["👯", "Spot homophones and synonyms"]],
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
    { type: "mc", prompt: "What can you infer about the grandpa at the end?", options: ["He is upset the tower was ruined.", "He is pleased with how the children handled it.", "He did not notice what happened.", "He wanted the gold brick himself."], a: 1,
      hint: "What does someone's smile usually mean?", exp: "He smiles into his coffee while watching. Smiling shows approval, so he's pleased — even though the text never says so directly." },
    { type: "mc", prompt: "What is the [[conflict]] in this story?", options: ["Rosa cannot reach the bin and Milo had already claimed the gold brick.", "The grandpa runs out of coffee.", "The tower falls over.", "Milo forgets to sort the pieces."], a: 0,
      hint: "The conflict is the problem the character has to face.", exp: "The problem is that two people both have a claim on one gold brick. Everything else in the story flows from that." },
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
    ["an", "She ate ___ apple at lunch."], ["any", "Do you have ___ red bricks left?"],
    ["as", "The cheetah is ___ fast lightning."], ["ask", "You can ___ me for help."],
    ["by", "The bag is right ___ the door."], ["could", "I ___ hear the music from here."],
    ["every", "She reads ___ single night."], ["fly", "Watch the falcon ___ over the hill."],
    ["from", "This letter came ___ my grandma."], ["give", "Please ___ the ball to Rosa."],
    ["going", "We are ___ to the park today."], ["had", "He ___ two cookies at lunch."],
    ["has", "She ___ a new blue bike."], ["her", "I gave ___ the last gold brick."],
    ["him", "Milo asked ___ to wait outside."], ["his", "That red helmet is ___."],
    ["how", "Show me ___ you built the tower."], ["just", "I ___ finished my homework."],
    ["know", "Do you ___ the answer yet?"], ["let", "Please ___ the dog come inside."],
    ["live", "We ___ near the school."], ["may", "You ___ pick one more brick."],
    ["of", "I drank a glass ___ milk."], ["old", "That is a very ___ tree."],
    ["once", "We went there ___ last summer."], ["open", "Please ___ the window a little."],
    ["over", "The ball flew ___ the fence."], ["put", "___ your shoes by the door."],
    ["round", "The wheel is ___ and smooth."], ["some", "I saved ___ pieces for you."],
    ["stop", "The car will ___ at the light."], ["take", "___ your jacket with you."],
    ["thank", "I want to ___ you for helping."], ["them", "Give the bricks to ___."],
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
    ["five", "I have ___ gold bricks left."], ["found", "He ___ his lost helmet."],
    ["gave", "She ___ me half her sandwich."], ["goes", "This piece ___ on the top."],
    ["green", "The grass is bright ___."], ["its", "The dog wagged ___ tail."],
    ["made", "We ___ a tower out of bricks."], ["many", "How ___ pieces do you need?"],
    ["off", "Please turn ___ the lights."], ["or", "Do you want milk ___ juice?"],
    ["pull", "___ the door open slowly."], ["read", "I like to ___ before bed."],
    ["right", "You got that answer ___."], ["sing", "We ___ that song every Friday."],
    ["sit", "Please ___ next to me."], ["sleep", "I ___ better with the fan on."],
    ["tell", "Can you ___ me a story?"], ["their", "The kids finished ___ project."],
    ["these", "___ bricks are the small ones."], ["those", "Hand me ___ pieces over there."],
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
    ["if", "Tell me ___ you need help."], ["keep", "You can ___ that brick."],
    ["kind", "She is ___ to everyone."], ["laugh", "That joke made me ___."],
    ["light", "Please turn on the ___."], ["long", "That was a very ___ movie."],
    ["much", "How ___ does this cost?"], ["myself", "I built this all by ___."],
    ["never", "I have ___ seen that before."], ["only", "There is ___ one piece left."],
    ["own", "This is my ___ tower."], ["pick", "___ any color you like."],
    ["seven", "I counted ___ wheels."], ["shall", "___ we start building now?"],
    ["show", "Please ___ me your work."], ["six", "The box holds ___ pieces."],
    ["small", "That is a very ___ brick."], ["start", "Let us ___ over again."],
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
    ["anyone", "Does ___ know the answer?"], ["love", "I ___ building with bricks."],
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
export default function BrickDash() {
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
          🧱 {mastered}/{totalConcepts}
        </button>
        {view.name === "timed" && <TimerPill />}
      </div>

      <div className={`shell ${view.name === "map" ? "wide" : ""}`}>
        {loaded && (
          <Bolt line={boltLine(view, progress)} hidden={progress.boltOff}
            onToggle={() => push({ ...progress, boltOff: !progress.boltOff })} />
        )}
        {!loaded && <p className="lede" style={{ padding: 40 }}>Loading your zones…</p>}
        {loaded && view.name === "map" && <TrailMap progress={progress} go={setView} />}
        {loaded && view.name === "collection" && <Collection progress={progress} push={push} go={setView} />}
        {loaded && view.name === "garage" && <Garage progress={progress} push={push} go={setView} />}
        {loaded && view.name === "mathdrill" && <SpeedMath progress={progress} push={push} go={setView} />}
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
/* Car parts that have their own cartoon art; the rest use their emoji. */
const PART_ART = { wheels: "part_wheel", horn: "part_horn", turbo: "part_turbo", flag: "part_flag" };

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
            <div><b>Finish the activity</b><p>Any score moves your car forward. Score 80%+ to earn a brick too!</p></div>
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
          <p className="lr-logo"><span className="lr-logo-a">Learn &amp;</span> <span className="lr-logo-b">Race!</span></p>
          <p className="lr-tag">Learn. Build your car. Race!</p>
          <div className="lr-carstage" aria-hidden="true">
            <span className="lr-road" />
            <img className="lr-car" src={ART.main_car} alt="" />
          </div>
        </div>

        <div className="lr-panels">
          <div className="lr-how">
            <h1 id="lr-race-title">🏎️ Want to race your car?</h1>
            <ol className="lr-steps">
              <li><span className="lr-sicon" aria-hidden="true">📖</span><b>1. Pick a challenge</b></li>
              <li><span className="lr-sicon" aria-hidden="true">⭐</span><b>2. Finish it</b><span className="lr-any">Any score counts!</span></li>
              <li><span className="lr-sicon" aria-hidden="true">🏎️</span><b>3. Drive your car!</b></li>
            </ol>
            <button className="lr-helpbtn" onClick={() => setHelp(true)}>❓ How do I race?</button>
          </div>

          <div className="lr-next">
            <div className="lr-nicon" aria-hidden="true">
              {np && PART_ART[np.id] ? <img src={ART[PART_ART[np.id]]} alt="" /> : <span>{np ? np.emoji : "🏁"}</span>}
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
                    <span className="lr-zbricks">
                      <span className="lr-zbar" aria-hidden="true"><i style={{ width: `${(done / cs.length) * 100}%` }} /></span>
                      {done} of {cs.length} bricks
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
            <span className="lr-mart lr-mflag" aria-hidden="true"><img src={ART.part_flag} alt="" /></span>
            <div className="lr-mbody">
              <h3>Sprint</h3>
              <p>Worksheet-style speed drill. Beat 2:00!</p>
              <p className="small">Your best times show in Your collection.</p>
              <div className="btnrow">
                <button className="btn" onClick={openSprint}>Open Sprint</button>
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
   Doing the work builds the car. Mastering the skill earns the brick.
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
    how: `Collect all ${CONCEPTS.length} bricks`, need: (p) => Object.keys(p.mastered || {}).length >= CONCEPTS.length,
    short: `Collect all ${CONCEPTS.length} bricks (80%+ on every stop)`, goal: (p) => ({ have: Object.keys(p.mastered || {}).length, need: CONCEPTS.length }),
    choices: [["star", "Star"], ["bolt", "Lightning"], ["check", "Checkers"]] },
];

const partsEarned = (p) => GARAGE_PARTS.filter((x) => x.need(p));
const nextPart = (p) => GARAGE_PARTS.find((x) => !x.need(p));

/* ---------------- the car ---------------- */
function Car({ car = {}, progress, driving, small }) {
  const color = car.color || "#1B62E8";
  const picks = car.picks || {};
  const have = {};
  GARAGE_PARTS.forEach((x) => { have[x.id] = x.need(progress); });
  const wheelStyle = picks.wheels || "classic";
  const topStyle = picks.top || "spoiler";
  const flagStyle = picks.flag || "star";
  const plate = (car.name || "BRICK").toUpperCase().slice(0, 8);

  const Wheel = ({ cx }) => {
    const r = wheelStyle === "monster" ? 25 : 20;
    return (
      <g>
        <circle cx={cx} cy={116} r={r} fill="#22304A" />
        {wheelStyle === "monster" && Array.from({ length: 8 }).map((_, k) => (
          <rect key={k} x={cx - 2.5} y={116 - r} width="5" height="7" rx="2" fill="#0F1B2E"
            transform={`rotate(${k * 45} ${cx} 116)`} />
        ))}
        <circle cx={cx} cy={116} r={r * 0.5} fill="#E6ECF6" />
        {wheelStyle === "moon" ? (
          <>
            <circle cx={cx - 4} cy={113} r="3" fill="#B9C4D6" />
            <circle cx={cx + 5} cy={119} r="2" fill="#B9C4D6" />
          </>
        ) : (
          <circle cx={cx} cy={116} r={r * 0.18} fill="#22304A" />
        )}
      </g>
    );
  };

  return (
    <svg viewBox="0 0 320 160" className={`car ${driving ? "driving" : ""} ${small ? "small" : ""}`}
      role="img" aria-label="Your car">
      <ellipse cx="160" cy="141" rx="105" ry="8" fill="rgba(15,31,61,.14)" />

      {/* turbo flames behind */}
      {have.turbo && (
        <g className="flame">
          <path d="M52 104 L22 98 L48 94 L26 88 L56 92 Z" fill="#EE7B1B" />
          <path d="M52 99 L32 95 L50 92 Z" fill="#F5C518" />
        </g>
      )}

      {/* roof gear */}
      {have.top && topStyle === "spoiler" && (
        <g><rect x="238" y="62" width="46" height="8" rx="4" fill="#22304A" />
          <rect x="246" y="68" width="7" height="16" fill="#22304A" />
          <rect x="270" y="68" width="7" height="16" fill="#22304A" /></g>
      )}
      {have.top && topStyle === "rack" && (
        <g><rect x="112" y="34" width="84" height="7" rx="3.5" fill="#22304A" />
          <rect x="120" y="41" width="6" height="12" fill="#22304A" />
          <rect x="182" y="41" width="6" height="12" fill="#22304A" /></g>
      )}

      {/* body */}
      {have.paint ? (
        <>
          <path d="M46 112 Q40 84 66 82 L104 80 Q124 48 160 48 L200 48 Q226 50 238 80 L268 84 Q282 88 280 112 Z" fill={color} />
          <path d="M46 112 Q40 100 44 96 L278 96 Q282 104 280 112 Z" fill="rgba(0,0,0,.12)" />
        </>
      ) : (
        <path d="M46 112 Q40 84 66 82 L104 80 Q124 48 160 48 L200 48 Q226 50 238 80 L268 84 Q282 88 280 112 Z"
          fill="#DCE3EE" stroke="#9FAEC6" strokeWidth="3" strokeDasharray="8 6" />
      )}

      {/* windows */}
      <path d="M118 78 Q133 56 158 56 L158 78 Z" fill="#CFE3F7" />
      <path d="M166 56 L196 56 Q216 58 226 78 L166 78 Z" fill="#CFE3F7" />

      {/* dashboard glow through the windscreen */}
      {have.dash && <><circle cx="150" cy="72" r="4" fill="#12A05A" /><circle cx="140" cy="72" r="3" fill="#F5C518" /></>}

      {/* headlights */}
      {have.lights && (
        <g><circle cx="272" cy="92" r="9" fill="#FFF3C4" stroke="#E8C24A" strokeWidth="3" />
          <path d="M281 92 L318 76 L318 108 Z" fill="rgba(245,197,24,.35)" /></g>
      )}

      {/* horn */}
      {have.horn && (
        <g><rect x="150" y="40" width="20" height="7" rx="3" fill="#22304A" />
          <path d="M170 36 L184 30 L184 57 L170 51 Z" fill="#F5C518" stroke="#22304A" strokeWidth="2" /></g>
      )}

      {/* name plate */}
      {have.plate && (
        <g><rect x="240" y="112" width="46" height="17" rx="4" fill="#FFFDF6" stroke="#22304A" strokeWidth="2" />
          <text x="263" y="125" textAnchor="middle" fontSize="11" fontWeight="800"
            fill="#22304A" fontFamily="system-ui, sans-serif">{plate}</text></g>
      )}

      {/* victory flag */}
      {have.flag && (
        <g><rect x="70" y="16" width="4" height="66" fill="#22304A" />
          <path d="M74 18 L112 27 L74 36 Z" fill={flagStyle === "check" ? "#22304A" : flagStyle === "bolt" ? "#F5C518" : "#D8362A"} />
          {flagStyle === "star" && <text x="86" y="33" fontSize="12" fill="#FFF">★</text>}
          {flagStyle === "bolt" && <text x="86" y="33" fontSize="12" fill="#22304A">⚡</text>}
        </g>
      )}

      {/* wheels */}
      {have.wheels ? (<><Wheel cx={100} /><Wheel cx={228} /></>) : (
        <><circle cx="100" cy="116" r="20" fill="none" stroke="#9FAEC6" strokeWidth="3" strokeDasharray="7 6" />
          <circle cx="228" cy="116" r="20" fill="none" stroke="#9FAEC6" strokeWidth="3" strokeDasharray="7 6" /></>
      )}
    </svg>
  );
}

/* ---------------- 3D driving mode ---------------- */
const GFX_KEY = "brickdash-gfx-v1";   // remembers High / Fast graphics on this device

function Drive3DScene({ car = {}, progress, push, onExit, timeLimitSec }) {
  const mountRef = useRef(null);
  const [secsLeft, setSecsLeft] = useState(timeLimitSec || null);
  const [coins, setCoins] = useState(0);
  const [stars, setStars] = useState(0);
  const [challenge, setChallenge] = useState(null);   // { q, title, key }
  const [ans, setAns] = useState(undefined);
  const [locked, setLocked] = useState(false);
  const pausedRef = useRef(false);                     // true while a question is open
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
  const usedQs = useRef(new Set());
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const onExitRef = useRef(onExit);
  onExitRef.current = onExit;

  /* leaving the drive: remember the best coin run, then exit */
  const finish = () => {
    const p = progressRef.current;
    if (push && coinsRef.current > (p.driveBestCoins || 0)) push({ ...p, driveBestCoins: coinsRef.current });
    onExitRef.current();
  };
  const finishRef = useRef(finish);
  finishRef.current = finish;

  useEffect(() => {
    if (!timeLimitSec) return;
    const id = setInterval(() => {
      setSecsLeft((s) => (pausedRef.current || s <= 0 ? s : s - 1));   // clock stops during a question
    }, 1000);
    return () => clearInterval(id);
  }, [timeLimitSec]);
  useEffect(() => {
    if (timeLimitSec && secsLeft === 0) finishRef.current();
  }, [secsLeft, timeLimitSec]);

  /* random question from any stop (reading-passage questions skipped — too long mid-drive) */
  const pickQuestion = () => {
    const pool = [];
    CONCEPTS.forEach((c) => c.qs.forEach((q, i) => {
      if (!q.passage && !c.passage) pool.push({ q, title: c.title, key: `${c.id}:${i}` });
    }));
    let fresh = pool.filter((x) => !usedQs.current.has(x.key));
    if (!fresh.length) { usedQs.current.clear(); fresh = pool; }
    const pick = fresh[Math.floor(Math.random() * fresh.length)];
    usedQs.current.add(pick.key);
    return pick;
  };
  /* called from the 3D loop each time a coin is picked up */
  const onCoinRef = useRef(null);
  onCoinRef.current = (n) => {
    setCoins(n);
    if (n % 5 === 0) {
      pausedRef.current = true;
      setAns(undefined);
      setLocked(false);
      setChallenge(pickQuestion());
    }
  };
  const checkChallenge = () => {
    if (!challenge || locked || !isAnswered(challenge.q, ans)) return;
    const ok = isCorrect(challenge.q, ans);
    setLocked(true);
    if (ok) {
      setStars((n) => n + 1);
      if (timeLimitSec) setSecsLeft((n) => n + 15);
    }
    if (push) {
      const p = progressRef.current;
      const prev = (p.areas && p.areas["Drive challenges"]) || { right: 0, wrong: 0 };
      push({
        ...p,
        areas: { ...(p.areas || {}), "Drive challenges": { right: prev.right + (ok ? 1 : 0), wrong: prev.wrong + (ok ? 0 : 1) } },
        correct: (p.correct || 0) + (ok ? 1 : 0),
        attempts: (p.attempts || 0) + 1,
      });
    }
  };
  const resume = () => {
    setChallenge(null); setAns(undefined); setLocked(false);
    pausedRef.current = false;
  };
  /* keyboard for the question card: digits, A–E / 1–5, Backspace, Enter */
  useEffect(() => {
    if (!challenge) return;
    function onKey(e) {
      if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      const q = challenge.q;
      if (e.key === "Enter") { e.preventDefault(); if (locked) resume(); else checkChallenge(); return; }
      if (locked) return;
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
  }, [challenge, ans, locked]);

  useEffect(() => {
    const mount = mountRef.current;
    let width = mount.clientWidth, height = mount.clientHeight;

    const have = {};
    GARAGE_PARTS.forEach((x) => { have[x.id] = x.need(progress); });
    const picks = car.picks || {};
    const bodyColor = car.color || "#1B62E8";
    const name = (car.name || "BRICK").toUpperCase().slice(0, 8);
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
    scene.fog = new THREE.Fog(0xdcecf8, 75, 200);

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
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400),
      std({ map: grassTex, roughness: 1, envMapIntensity: 0.25 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    /* a ring-shaped race track with red-and-white curbs and a dashed centre line */
    const TRACK_IN = 30, TRACK_OUT = 40, TRACK_MID = 35;
    const asphaltTex = noiseTexture(256, "#44484f", ["#3a3e45", "#4f535a", "#575b62", "#3f434a"], HIGH ? 5000 : 2000, 14);
    const track = new THREE.Mesh(new THREE.RingGeometry(TRACK_IN, TRACK_OUT, HIGH ? 180 : 96, 1),
      std({ map: asphaltTex, roughness: 0.92, envMapIntensity: 0.3 }));
    track.rotation.x = -Math.PI / 2;
    track.position.y = 0.02;
    track.receiveShadow = true;
    scene.add(track);

    const dummy = new THREE.Object3D();
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
    const curbRed = new THREE.Color(0xd8362a), curbWhite = new THREE.Color(0xf6f6f2);
    const curbN = HIGH ? 120 : 72;
    [TRACK_IN, TRACK_OUT].forEach((r) => {
      ringInstances(new THREE.BoxGeometry(0.9, 0.14, ((2 * Math.PI * r) / curbN) * 0.97),
        std({ roughness: 0.6 }), curbN, r, 0.07, (i) => (i % 2 ? curbWhite : curbRed));
    });
    ringInstances(new THREE.BoxGeometry(0.3, 0.03, 1.8), std({ color: 0xf2efe4, roughness: 0.7 }), 56, TRACK_MID, 0.04);

    /* bluebonnet patches in the grass, a nod to Texas */
    const bbN = HIGH ? 900 : 300;
    const bonnets = new THREE.InstancedMesh(new THREE.ConeGeometry(0.13, 0.5, 6), std({ roughness: 0.7 }), bbN);
    const blues = [0x3f55d1, 0x4a63e0, 0x5a4fcf, 0x3b4cb8].map((c) => new THREE.Color(c));
    const cream = new THREE.Color(0xf4f1e6);
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
    scene.add(bonnets);

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

    /* trees: rounded leafy ones and pines */
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
    const treeN = HIGH ? 30 : 14;
    for (let i = 0; i < treeN; i++) {
      const ang = (i / treeN) * Math.PI * 2 + Math.random() * 0.2;
      const r = 64 + Math.random() * 30;
      scene.add(makeTree(Math.cos(ang) * r, Math.sin(ang) * r, i));
    }

    /* ================= the car ================= */
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
        ? new THREE.MeshPhysicalMaterial({ color: bodyColor, metalness: scene.environment ? 0.55 : 0.15, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.06 })
        : std({ color: bodyColor, metalness: scene.environment ? 0.4 : 0.1, roughness: 0.4 }))
      : std({ color: 0xc3ccd8, metalness: 0.1, roughness: 0.7 });   // grey primer until the paint job is earned
    const glassMat = std({ color: scene.environment ? 0x18222e : 0x2a3a4c, metalness: scene.environment ? 0.9 : 0.3, roughness: 0.06, side: THREE.DoubleSide });
    const darkMat = std({ color: 0x1b1f27, roughness: 0.8 });
    const METAL = scene.environment ? 1 : 0.35;     // without reflections, full metal looks black
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

    const headMat = have.lights
      ? std({ color: 0xfff6d8, emissive: 0xfff1c0, emissiveIntensity: 2.2 })
      : std({ color: 0x9aa4b2, metalness: 0.6, roughness: 0.3 });
    const headGeo = new THREE.SphereGeometry(0.16, 24, 16);
    [-0.62, 0.62].forEach((x) => {
      const h = new THREE.Mesh(headGeo, headMat);
      h.scale.set(1, 0.7, 0.5);
      h.position.set(x, 0.8, 2.28);
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
    }

    const topPick = picks.top || "spoiler";
    if (have.top && topPick === "spoiler") {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.06, 0.42), darkMat);
      wing.position.set(0, 1.4, -2.0);
      bodyGroup.add(wing);
      [-0.6, 0.6].forEach((x) => {
        const strut = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.34, 0.12), darkMat);
        strut.position.set(x, 1.22, -1.98);
        bodyGroup.add(strut);
      });
    }
    if (have.top && topPick === "rack") {
      [-0.6, 0.6].forEach((x) => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 1.1), chromeMat);
        rail.position.set(x, 1.66, -0.18);
        bodyGroup.add(rail);
      });
      [-0.6, -0.18, 0.24].forEach((z) => {
        const bar = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.05, 0.05), chromeMat);
        bar.position.set(0, 1.69, z);
        bodyGroup.add(bar);
      });
    }
    if (have.top && topPick === "sunroof") {
      const sr = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.7), glassMat);
      sr.position.set(0, 1.61, -0.2);
      bodyGroup.add(sr);
    }
    if (have.horn) {
      const horn = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 16), std({ color: 0xf5c518, metalness: METAL, roughness: 0.3 }));
      horn.rotation.x = -Math.PI / 2;               // little brass horn on the front bumper, bell facing forward
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
    }

    /* wheels: rubber tires, rims and hubs that spin */
    const tireMat = std({ color: 0x1e2127, roughness: 0.92 });
    const rimMat = wheelStyle === "moon" ? std({ color: 0xd6dce6, metalness: 0.3, roughness: 0.55 })
      : wheelStyle === "monster" ? std({ color: 0x2c313a, metalness: 0.7, roughness: 0.35 })
      : chromeMat;
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
      [[tireGeo, tireMat], [rimGeo, rimMat], [hubGeo, chromeMat]].forEach(([geo, mat]) => {
        const part = new THREE.Mesh(geo, mat);
        part.rotation.z = Math.PI / 2;
        spin.add(part);
      });
      const face = side * (wheelW / 2 + 0.012);
      if (wheelStyle === "moon") {
        [[0.12, 0.08], [-0.1, -0.12], [0.02, -0.16]].forEach(([y, zz]) => {
          const cr = new THREE.Mesh(craterGeo, darkMat);
          cr.rotation.z = Math.PI / 2;
          cr.position.set(face, y, zz);
          spin.add(cr);
        });
      } else {
        for (let k = 0; k < 5; k++) {
          const sp = new THREE.Mesh(spokeGeo, wheelStyle === "monster" ? darkMat : chromeMat);
          sp.position.x = face;
          sp.rotation.x = (k / 5) * Math.PI * 2;
          spin.add(sp);
        }
      }
      if (wheelStyle === "monster") {
        for (let k = 0; k < 12; k++) {
          const a = (k / 12) * Math.PI * 2;
          const knob = new THREE.Mesh(knobGeo, tireMat);
          knob.rotation.x = a;
          knob.position.set(0, Math.cos(a) * wheelR, Math.sin(a) * wheelR);
          spin.add(knob);
        }
      }
      carGroup.add(holder);
      wheels.push(spin);
    });
    carGroup.traverse((o) => { if (o.isMesh) o.castShadow = HIGH; });
    scene.add(carGroup);
    carGroup.position.set(TRACK_MID, 0, 0);        // start on the track, facing along it
    camera.position.set(TRACK_MID, 3.2, 7);

    /* ---- coins: gold discs that spin and bob; drive through them to collect ---- */
    const coinGeo = new THREE.CylinderGeometry(0.8, 0.8, 0.18, 28);
    const coinMat = std({ color: 0xffc93c, metalness: METAL, roughness: 0.22, emissive: 0x6b4a00, emissiveIntensity: scene.environment ? 0.5 : 1 });
    const coinRimGeo = new THREE.TorusGeometry(0.8, 0.08, 12, 32);
    const coinRimMat = std({ color: 0xe0a800, metalness: METAL, roughness: 0.3 });
    const coinsOnField = [];
    function spawnCoin() {
      let x = 0, z = 0, tries = 0;
      do {
        const ang = Math.random() * Math.PI * 2;
        const r = Math.random() < 0.6                 // most coins sit on the track
          ? TRACK_IN + 1.5 + Math.random() * (TRACK_OUT - TRACK_IN - 3)
          : Math.sqrt(Math.random()) * (RADIUS - 8);
        x = Math.cos(ang) * r; z = Math.sin(ang) * r; tries++;
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
    for (let i = 0; i < 8; i++) spawnCoin();

    /* little "ding" made in code — no sound files */
    let audioCtx = null;
    function ding() {
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = audioCtx || new AC();
        const now = audioCtx.currentTime;
        const o = audioCtx.createOscillator(), gn = audioCtx.createGain();
        o.type = "triangle";
        o.frequency.setValueAtTime(880, now);
        o.frequency.setValueAtTime(1320, now + 0.08);
        gn.gain.setValueAtTime(0.18, now);
        gn.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        o.connect(gn); gn.connect(audioCtx.destination);
        o.start(now); o.stop(now + 0.3);
      } catch { /* sound is optional */ }
    }

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

    let heading = Math.PI;
    let speed = 0;
    let frameId;

    let t = 0;
    let perfFrames = 0, perfStart = 0, perfChecked = false;
    function animate() {
      const paused = pausedRef.current;
      if (paused) {                            // freeze the car while a question is open
        speed = 0;
        Object.keys(keys).forEach((k) => { keys[k] = false; });
        touch.fwd = touch.back = touch.left = touch.right = false;
      }
      const accel = (keys["arrowup"] || keys["w"] || touch.fwd) ? 1
        : (keys["arrowdown"] || keys["s"] || touch.back) ? -1 : 0;
      const turn = (keys["arrowleft"] || keys["a"] || touch.left) ? 1
        : (keys["arrowright"] || keys["d"] || touch.right) ? -1 : 0;

      speed += accel * 0.02;
      speed *= 0.955;
      if (Math.abs(speed) < 0.004) speed = 0;
      speed = Math.max(-0.25, Math.min(0.45, speed));
      if (Math.abs(speed) > 0.01) heading += turn * 0.035 * (speed > 0 ? 1 : -1);

      carGroup.position.x += Math.sin(heading) * speed;
      carGroup.position.z += Math.cos(heading) * speed;
      carGroup.rotation.y = heading;

      const dist = Math.hypot(carGroup.position.x, carGroup.position.z);
      if (dist > RADIUS - 3) {
        const k = (RADIUS - 3) / dist;
        carGroup.position.x *= k; carGroup.position.z *= k;
        speed *= 0.4;
      }

      t += 0.016;
      for (let i = coinsOnField.length - 1; i >= 0; i--) {
        const c = coinsOnField[i];
        c.rotation.y += 0.05;
        c.position.y = 1.3 + Math.sin(t * 3 + c.userData.phase) * 0.2;
        if (!pausedRef.current && Math.hypot(c.position.x - carGroup.position.x, c.position.z - carGroup.position.z) < 2.3) {
          scene.remove(c);
          coinsOnField.splice(i, 1);
          coinsRef.current += 1;
          ding();
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
  }, [quality]);

  const setTouch = (key, val) => {
    if (mountRef.current && mountRef.current.touchState) mountRef.current.touchState[key] = val;
  };

  return (
    <div className="drive3d">
      <div className="drive3d-top">
        <b>🚗 {(car.name || "BRICK").toUpperCase()}</b>
        {secsLeft !== null && (
          <span className="bd-timer-badge">⏱ {Math.floor(secsLeft / 60)}:{String(secsLeft % 60).padStart(2, "0")}</span>
        )}
        <button className="btn ghost" onClick={toggleQuality} title="Switch graphics quality">
          {quality === "high" ? "✨ Graphics: High" : "⚡ Graphics: Fast"}
        </button>
        <button className="btn ghost" onClick={finish}>✕ Done driving</button>
      </div>
      <div className="drive3d-mount" ref={mountRef}>
        <p className="drive3d-hint">Drive through the 🪙 coins! Every 5th coin is a challenge question.</p>
        {gfxNote && <div className="drive3d-note">{gfxNote}</div>}
        <div className="drive3d-hud">
          🪙 {coins} <span>· {5 - (coins % 5)} to next challenge</span>{stars > 0 && <> · ⭐ {stars}</>}
        </div>
      </div>
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
      {challenge && (() => {
        const q = challenge.q;
        const noop = () => {};
        const right = locked && isCorrect(q, ans);
        return (
          <div className="drive3d-quiz">
            <div className="drive3d-quizin stack">
              <div className="qnum">🪙 {coins} coins — challenge question · {challenge.title}</div>
              <p className="prompt" style={{ whiteSpace: "pre-line" }}><RichText text={q.prompt} onWord={noop} /></p>
              {(q.type === "mc" || q.type === "multi") && <MC q={q} value={ans} onChange={setAns} locked={locked} onWord={noop} />}
              {q.type === "place" && <PlaceQ q={q} value={ans} onChange={setAns} locked={locked} />}
              {q.type === "inline" && <InlineQ q={q} value={ans} onChange={setAns} locked={locked} />}
              {q.type === "entry" && <EntryQ value={ans} onChange={setAns} locked={locked} />}
              {q.type === "shade" && <ShadeQ q={q} value={ans} onChange={setAns} locked={locked} />}
              {q.type === "multi" && !locked && <div className="small">Pick exactly {q.pick || 2}.</div>}
              {locked && (
                <div className={`fb ${right ? "ok" : "no"}`}>
                  <h3>{right ? (timeLimitSec ? "Right! +15 seconds of driving ⭐" : "Right! You earned a star ⭐") : "Here's why that one isn't right —"}</h3>
                  <p><RichText text={q.exp} onWord={noop} /></p>
                </div>
              )}
              <div className="btnrow" style={{ justifyContent: "center" }}>
                {!locked
                  ? <button className="btn" disabled={!isAnswered(q, ans)} onClick={checkChallenge}>Check</button>
                  : <button className="btn gold" onClick={resume}>🚗 Keep driving</button>}
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
  const bricks = Object.keys(progress.mastered || {}).length;
  switch (view.name) {
    case "map":
      if (!progress.car || !progress.car.name) return "Welcome! Pick any challenge to start building your car. You can name it in My Garage.";
      return np ? "Pick a challenge. Finishing it builds your car, any score counts!" : "Your car is complete. Take it for a drive!";
    case "region": return "Pick a stop. Three stages: what you'll learn, how to do it, then five questions.";
    case "concept": return "Stage one tells you what you're learning. Tap a line to hear it.";
    case "garage": return np ? `${np.emoji} ${np.name} is next. ${np.how}.` : "Every part is on. She's ready to roll!";
    case "spell": return "Hear the word, build it from letters, then put the sentence in order.";
    case "mathdrill": return "Fifteen right in one run gets you the turbo.";
    case "timed": return "Don't freeze on a hard one. Skip it and come back.";
    case "collection": return `${bricks} of ${CONCEPTS.length} bricks so far. Every run counts, even the tricky ones.`;
    default: return "Let's build something.";
  }
}

/* ---------------- Garage screen ---------------- */
function Garage({ progress, push, go }) {
  const car = progress.car || {};
  const [name, setName] = useState(car.name || "");
  const [driving, setDriving] = useState(false);
  const earned = partsEarned(progress);
  const np = nextPart(progress);
  const setCar = (patch) => push({ ...progress, car: { ...car, ...patch } });
  const setPick = (partId, val) => push({ ...progress, car: { ...car, picks: { ...(car.picks || {}), [partId]: val } } });
  const canDrive = (progress.sessions || 0) >= 1;
  const sessions = progress.sessions || 0;
  const badgeCounts = { gold: 0, silver: 0, bronze: 0, try: 0 };
  Object.values(progress.badges || {}).forEach((b) => { if (badgeCounts[b.tier] !== undefined) badgeCounts[b.tier]++; });

  return (
    <div className="stack">
      <div className="hero">
        <h1>🔧 My Garage</h1>
        <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
          {earned.length} of {GARAGE_PARTS.length} parts on. Doing the work adds the parts — they never come off.
        </p>
        <p className="lede" style={{ color: "#4A5764", margin: "4px 0 0", fontSize: 15 }}>
          💡 For most parts, just <b>finishing</b> a task anywhere — a stop, Speed Math, spelling, a timed trek — unlocks
          the next one, no matter the score. Scoring <b>80% or higher</b> on a stop also earns a 🧱 brick (that's the
          separate mastery record on the map). Finish just 1 task and "Take it for a real drive" shows up here.
        </p>
        <div className="progressbar" aria-hidden="true">
          <div className="progressbar-fill" style={{ width: `${Math.min(100, (earned.length / GARAGE_PARTS.length) * 100)}%` }} />
        </div>
        <p className="small" style={{ margin: "4px 0 0" }}>
          {sessions} task{sessions === 1 ? "" : "s"} finished so far
          {np ? ` — keep going for your next part: ${np.emoji} ${np.name}` : " — every part is on!"}
        </p>
        <div className="badgeshelf">
          <span>🥇 {badgeCounts.gold}</span>
          <span>🥈 {badgeCounts.silver}</span>
          <span>🥉 {badgeCounts.bronze}</span>
          <span>🎯 {badgeCounts.try}</span>
        </div>
      </div>

      <div className="stage">
        <Car car={car} progress={progress} driving={driving} />
      </div>

      {canDrive && (
        <div className="btnrow">
          <button className="btn gold" onClick={() => go({ name: "drive3d" })}>
            🏁 Take it for a real drive
          </button>
        </div>
      )}

      <div className="card stack">
        <h3 style={{ margin: 0, fontSize: 19 }}>Name your ride</h3>
        <div className="namerow">
          <input className="nameinput" value={name} maxLength={8} placeholder="BRICK"
            onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9 ]/g, ""))} />
          <button className="btn" onClick={() => setCar({ name: name || "BRICK" })}>Save</button>
        </div>
        <h3 style={{ margin: "6px 0 0", fontSize: 19 }}>Colour</h3>
        <div className="swatches">
          {CAR_COLORS.map(([label, hex]) => (
            <button key={hex} className={`swatch ${(car.color || "#1B62E8") === hex ? "on" : ""}`}
              style={{ background: hex }} title={label} onClick={() => setCar({ color: hex })} />
          ))}
        </div>
      </div>

      <h3 style={{ margin: "12px 0 0", fontSize: 21 }}>Parts</h3>
      <div className="stack">
        {GARAGE_PARTS.map((part) => {
          const got = part.need(progress);
          return (
            <div key={part.id} className={`partrow ${got ? "got" : ""}`}>
              <div className="phead">
                <span className="pemoji">{got ? part.emoji : "🔒"}</span>
                <span className="t">
                  <b>{part.name}</b>
                  <span className="small">{got ? `Earned in ${part.zone}` : part.how}</span>
                </span>
                {!got && np && np.id === part.id && <span className="pill gold">Next up</span>}
              </div>
              {got && part.choices && (
                <div className="btnrow" style={{ marginTop: 10 }}>
                  {part.choices.map(([val, label]) => (
                    <button key={val} className={`btn ${(car.picks || {})[part.id] === val ? "" : "ghost"}`}
                      style={{ fontSize: 15, padding: "11px 15px", minHeight: 46 }}
                      onClick={() => setPick(part.id, val)}>{label}</button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="footer"><div className="in">
        <button className="btn ghost" onClick={() => go({ name: "map" })}>Back</button>
        {np && <button className="btn" onClick={() => go({ name: "map" })}>Go earn {np.name.toLowerCase()}</button>}
      </div></div>
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

/* ---------------- collection: stats + every brick ---------------- */
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
        <h1>🧱 Your collection</h1>
        <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
          Everything you've built so far. Bricks stay saved, even if you close the app.
        </p>
      </div>

      <div className="stats">
        <div className="stat"><b>{mastered}</b><span>of {CONCEPTS.length} bricks</span></div>
        <div className="stat"><b>{zonesCleared}</b><span>of 6 zones cleared</span></div>
        <div className="stat"><b>{progress.correct || 0}</b><span>questions right</span></div>
        <div className="stat"><b>{acc}%</b><span>correct overall</span></div>
        <div className="stat"><b>{progress.bestTimed || 0}</b><span>best Speed Run</span></div>
        <div className="stat"><b>{fastestSprint ? fmtClock(fastestSprint.bestSec) : "—"}</b><span>best Sprint time</span></div>
        <div className="stat"><b>{progress.driveBestCoins || 0}</b><span>most coins in one drive</span></div>
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
                  <button key={c.id} className={`brick ${got ? "got" : ""}`} style={{ "--rc": r.rc }}
                    onClick={() => go({ name: "concept", cid: c.id })}>
                    <span className="bi">{got ? "🧱" : c.icon}</span>
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
          Clears every brick and all scores. There's no undo.
        </p>
        {confirmReset ? (
          <div className="btnrow">
            <button className="btn" style={{ background: "var(--clay)", boxShadow: "0 4px 0 #9E2519" }}
              onClick={() => { push({ ...blank }); saveSprintRecords({}); setSprints({}); setConfirmReset(false); go({ name: "map" }); }}>
              Yes, erase everything
            </button>
            <button className="btn ghost" onClick={() => setConfirmReset(false)}>Keep my bricks</button>
          </div>
        ) : (
          <button className="btn ghost" onClick={() => setConfirmReset(true)}>Reset progress</button>
        )}
      </div>
    </div>
  );
}

/* ---------------- region ---------------- */
function RegionView({ rid, progress, go }) {
  const r = REGIONS.find((x) => x.id === rid);
  const cs = conceptsIn(rid);
  return (
    <div className="stack">
      <div className="hero">
        <h1>{r.icon} {r.name}</h1>
        <p className="lede" style={{ color: "#4A5764", margin: "0 0 4px" }}>{r.sub}</p>
      </div>
      <h2 style={{ margin: "4px 0 0", fontSize: 26 }}>Pick your challenge!</h2>
      <p className="small" style={{ margin: 0 }}>Tap one to start. Each one takes about 8 minutes.</p>
      <div className="stack">
        {cs.map((c) => {
          const done = !!progress.mastered?.[c.id];
          return (
            <button key={c.id} className={`stop ${done ? "done" : ""}`} onClick={() => go({ name: "concept", cid: c.id })}>
              <span className="badge">{done ? "🧱" : c.icon}</span>
              <span className="t">
                <b>{c.title}</b>
                <span className="small">{done ? "Cleared — replay anytime" : `${c.qs.length} questions · TEKS ${c.teks}`}</span>
              </span>
              <span style={{ fontSize: 22, color: "#6C7A87" }}>›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- concept: teach then practice ---------------- */
function ConceptView({ cid, progress, push, go, onWord }) {
  const c = byId(cid);
  const zone = REGIONS.find((r) => r.id === c.region) || { name: "", icon: "" };
  const L = LESSONS[cid] || { goals: [], steps: [] };
  const [stage, setStage] = useState(1);
  const [showAnother, setShowAnother] = useState(false);

  const StageDots = () => (
    <div className="dots">
      {[1, 2, 3].map((n) => <span key={n} className={n === stage ? "on" : n < stage ? "past" : ""} />)}
    </div>
  );

  /* ---- Stage 1: what you're learning ---- */
  if (stage === 1) {
    return (
      <div className="stack">
        <StageDots />
        <div className="hero">
          <div className="crumb">{zone.icon} {zone.name} · Stage 1 of 3</div>
          <h1>{c.icon} {c.title}</h1>
        </div>

        <h2 style={{ margin: "2px 0 0", fontSize: 25 }}>What you will learn is…</h2>
        <ul className="goals">
          {L.goals.map(([ico, t], k) => (
            <li className="goal" key={k} onClick={() => speak(plain(t), 0.9)}>
              <span className="gi">{ico}</span>
              <span className="gt"><RichText text={t} onWord={onWord} /></span>
              <span className="gspk">🔊</span>
            </li>
          ))}
        </ul>
        <p className="small">Tap any line to hear it read out loud.</p>

        <div className="footer"><div className="in">
          <button className="btn ghost" onClick={() => go({ name: "region", rid: c.region })}>Back</button>
          <button className="btn" onClick={() => setStage(2)}>Learn more →</button>
        </div></div>
      </div>
    );
  }

  /* ---- Stage 2: how to do it ---- */
  if (stage === 2) {
    const scope = [
      `${c.title}.`,
      plain(c.idea),
      "Here are the steps.",
      ...L.steps.map((x, k) => `Step ${k + 1}. ${plain(x)}`),
    ].join(" ");
    return (
      <div className="stack">
        <StageDots />
        <div className="hero">
          <div className="crumb">{zone.icon} {zone.name} · Stage 2 of 3</div>
          <h1>How to do it: {c.title}</h1>
        </div>

        <div className="btnrow">
          <button className="btn gold" onClick={() => speak(scope, 0.9)}>🔊 Read this to me</button>
          <button className="btn ghost" onClick={() => window.speechSynthesis && window.speechSynthesis.cancel()}>⏹ Stop</button>
        </div>

        <div className="idea">
          <h2>The idea</h2>
          <p><RichText text={c.idea} onWord={onWord} /></p>
          <div className="egbox"><RichText text={c.example} onWord={onWord} /></div>
        </div>

        <h2 style={{ margin: "2px 0 0", fontSize: 25 }}>The steps</h2>
        <ol className="steps">
          {L.steps.map((x, k) => (
            <li key={k} onClick={() => speak(`Step ${k + 1}. ${plain(x)}`, 0.9)}>
              <span className="sn">{k + 1}</span>
              <span className="gt"><RichText text={x} onWord={onWord} /></span>
              <span className="gspk">🔊</span>
            </li>
          ))}
        </ol>
        <p className="small">Tap any step to hear just that one. Tap a <span className="vw">dotted word</span> to see what it means.</p>

        {showAnother ? (
          <div className="idea" style={{ background: "#FEF3CE", borderColor: "#EBCB92" }}>
            <h2>Another way to see it</h2>
            <p><RichText text={c.another} onWord={onWord} /></p>
            <button className="btn ghost" onClick={() => speak(plain(c.another), 0.9)}>🔊 Read this to me</button>
          </div>
        ) : (
          <button className="btn ghost" onClick={() => setShowAnother(true)}>Show me another way →</button>
        )}

        <div className="footer"><div className="in">
          <button className="btn ghost" onClick={() => setStage(1)}>Back</button>
          <button className="btn" onClick={() => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setStage(3); }}>
            Now try 5 questions
          </button>
        </div></div>
      </div>
    );
  }

  /* ---- Stage 3: practice ---- */
  return (
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
            emoji={perfect ? "🧱" : null}
            sub={`${concept ? concept.title : "Stop"} — ${score} out of ${questions.length} (${pct}%). Brick collected!`}
            onClose={() => setCheer(false)}
          />
        )}
        <div className="stamp card">
          <div className="big">{perfect ? "🧱" : score > questions.length / 2 ? "⚡" : "🔧"}</div>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>
            {perfect ? "Stop cleared!" : `${score} out of ${questions.length} — ${pct}%`}
          </h1>
          <div className="badgechip">{badge.emoji} {badge.label} badge earned!</div>
          <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
            {perfect
              ? "Every single one. Brick collected."
              : score >= passThreshold(questions.length)
              ? "Brick collected — strong run, 80% or higher earns it!"
              : `You're getting it. Reread the steps in stage 2, then run these again — ${passThreshold(questions.length)} out of ${questions.length} (80%) earns the brick.`}
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
   ARTWORK — cartoon illustrations, embedded so the app needs no network.
   Cropped from the "Learn & Race" production asset sheet (WebP, base64).
   To swap in cleaner exports later, replace a value with a new data URI.
   ============================================================ */
const ART = {
  build_yard: "data:image/webp;base64,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",
  gear_works: "data:image/webp;base64,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",
  build_deck: "data:image/webp;base64,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",
  score_tower: "data:image/webp;base64,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",
  story_mode: "data:image/webp;base64,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",
  repair_bay: "data:image/webp;base64,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",
  speed_math: "data:image/webp;base64,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",
  word_forge: "data:image/webp;base64,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",
  speed_run: "data:image/webp;base64,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",
  part_wheel: "data:image/webp;base64,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",
  part_horn: "data:image/webp;base64,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",
  part_turbo: "data:image/webp;base64,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",
  part_flag: "data:image/webp;base64,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",
  main_car: "data:image/webp;base64,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",
};

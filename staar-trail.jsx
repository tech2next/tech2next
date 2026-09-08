import React, { useState, useEffect, useRef, useCallback } from "react";

/* ============================================================
   TEXAS TRAIL — STAAR Grade 3 concept practice
   Regions map to STAAR reporting categories.
   ============================================================ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:ital,wght@0,400;0,600;0,800;1,600&display=swap');

.tt * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.tt {
  --caliche:#E9EFFA; --paper:#FFFFFF; --ink:#0F1F3D; --soft:#5B6B87;
  --bluebonnet:#1B62E8; --bluebonnet-lt:#DCE7FD;
  --juniper:#12A05A; --juniper-lt:#DAF3E6;
  --sunset:#F5C518; --sunset-lt:#FEF3CE;
  --clay:#D8362A; --clay-lt:#FBE0DE;
  --line:#CFDAEC;
  font-family:'Nunito',-apple-system,'Avenir Next',system-ui,sans-serif;
  color:var(--ink); background:var(--caliche);
  min-height:100vh; touch-action:manipulation;
  -webkit-text-size-adjust:100%;
}
.tt h1,.tt h2,.tt h3,.tt .display { font-family:'Fredoka','Avenir Next',system-ui,sans-serif; font-weight:600; letter-spacing:-0.01em; }

.shell { max-width:900px; margin:0 auto; padding:0 18px 96px; }

/* ---- top bar ---- */
.topbar { position:sticky; top:0; z-index:30; background:var(--caliche);
  border-bottom:2px solid var(--line); padding:12px 18px;
  display:flex; align-items:center; gap:12px; }
.topbar .home { font-family:'Fredoka'; font-size:19px; background:none; border:none;
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
.btn { font-family:'Fredoka'; font-size:19px; font-weight:600; border:none; cursor:pointer;
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
.hero h1 { font-size:38px; line-height:1.05; margin:0 0 8px; }
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
.stop .t b { font-family:'Fredoka'; font-weight:600; font-size:18px; display:block; }

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
  padding:16px 18px; max-height:34vh; overflow:auto; font-size:17px; line-height:1.65; }
.passage h4 { font-family:'Fredoka'; margin:0 0 8px; font-size:19px; }
.passage p { margin:0 0 10px; }

.opts { display:grid; gap:10px; }
.opt { display:flex; gap:12px; align-items:center; text-align:left; width:100%;
  background:var(--paper); border:2px solid var(--line); border-radius:16px;
  padding:15px 16px; font-size:18px; font-weight:600; cursor:pointer; min-height:58px;
  font-family:'Nunito'; color:var(--ink); }
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
  background:var(--paper); font-size:17px; font-weight:700; cursor:pointer; min-height:52px; font-family:'Nunito'; color:var(--ink); }
.tile.armed { border-color:var(--sunset); background:var(--sunset-lt); }
.tile.used { opacity:.3; }
.slots { display:grid; gap:10px; }
.slot { display:flex; align-items:center; gap:12px; background:var(--paper);
  border:2px solid var(--line); border-radius:16px; padding:12px 14px; min-height:60px; }
.slot .lab { flex:1; font-size:17px; font-weight:600; }
.drop { min-width:110px; min-height:46px; border-radius:12px; border:2px dashed #C9C5B2;
  display:grid; place-items:center; font-weight:800; font-size:17px; background:var(--caliche);
  cursor:pointer; padding:0 12px; font-family:'Nunito'; color:var(--ink); }
.drop.filled { border-style:solid; border-color:var(--bluebonnet); background:var(--bluebonnet-lt); }
.drop.right { border-style:solid; border-color:var(--juniper); background:var(--juniper-lt); }
.drop.wrong { border-style:solid; border-color:var(--clay); background:var(--clay-lt); }

/* inline choice */
.sentence { font-size:20px; line-height:2.1; font-weight:600; }
.inlinepick { display:inline-block; }
.inlinepick select { font-family:'Nunito'; font-size:18px; font-weight:700; padding:8px 10px;
  border-radius:12px; border:2px solid var(--bluebonnet); background:var(--bluebonnet-lt);
  color:var(--ink); min-height:46px; }

/* entry */
.entry { display:flex; flex-direction:column; align-items:center; gap:14px; }
.readout { font-size:38px; font-family:'Fredoka'; min-width:200px; text-align:center;
  background:var(--paper); border:2px solid var(--line); border-radius:16px; padding:12px 20px;
  font-variant-numeric:tabular-nums; }
.pad { display:grid; grid-template-columns:repeat(3,86px); gap:10px; }
.pad button { height:66px; font-size:26px; font-family:'Fredoka'; border-radius:14px;
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
@keyframes pop { from { transform:scale(.2) rotate(-25deg); opacity:0 } to { transform:none; opacity:1 } }
@media (prefers-reduced-motion:reduce){ .stamp .big { animation:none } }

.fixup { font-size:13px; font-weight:800; color:var(--clay); margin-right:8px; white-space:nowrap; }

/* word forge */
.bigword { font-family:'Fredoka'; font-size:56px; letter-spacing:.04em; margin:6px 0 18px; color:var(--bluebonnet); }
.wordslots { display:flex; gap:8px; justify-content:center; flex-wrap:wrap; margin:6px 0; }
.ws { width:48px; height:62px; border-radius:12px; border:3px solid var(--line);
  background:var(--paper); display:grid; place-items:center;
  font-family:'Fredoka'; font-size:30px; text-transform:lowercase; }
.ws.ok { border-color:var(--juniper); background:var(--juniper-lt); }
.ws.no { border-color:var(--clay); background:var(--clay-lt); }
.tile.letter { min-width:58px; height:58px; font-family:'Fredoka'; font-size:26px;
  padding:0 14px; text-align:center; }
.wordlist { display:flex; flex-wrap:wrap; gap:8px; }
.chip { padding:9px 14px; border-radius:999px; border:2px solid var(--line);
  background:var(--paper); font-weight:800; font-size:16px; cursor:pointer; }
.chip.ok { border-color:var(--juniper); background:var(--juniper-lt); }

/* progress display */
.pill.ok { background:var(--juniper-lt); border-color:#A8D9C3; color:var(--juniper); }
.pill.no { background:var(--clay-lt); border-color:#E8B3AB; color:var(--clay); }
.g { color:var(--juniper); font-weight:800; }
.r { color:var(--clay); font-weight:800; }
.progsum { display:block; width:100%; text-align:center; cursor:pointer;
  box-shadow:0 4px 0 var(--line); margin-bottom:4px; font-family:'Nunito'; color:var(--ink); }
.progsum:active { transform:translateY(3px); box-shadow:0 1px 0 var(--line); }
.ps { display:flex; justify-content:space-around; gap:10px; }
.ps > span { display:flex; flex-direction:column; }
.ps b { font-family:'Fredoka'; font-size:34px; line-height:1.1; color:var(--bluebonnet); }
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
.smprob { font-family:'Fredoka'; font-size:46px; line-height:1.1; font-variant-numeric:tabular-nums; }
.smanswer { font-family:'Fredoka'; font-size:40px; color:var(--bluebonnet); margin-top:10px;
  font-variant-numeric:tabular-nums; }
.smcard.no .smanswer { color:var(--clay); }
.smnote { font-size:15px; font-weight:800; color:var(--clay); margin-top:6px; }

/* collection */
.pill.tap { cursor:pointer; font-family:'Nunito'; color:var(--ink); }
.pill.tap:active { transform:translateY(2px); }
.stats { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
@media (min-width:560px){ .stats { grid-template-columns:repeat(3,1fr); } }
.stat { background:var(--paper); border:2px solid var(--line); border-radius:18px;
  padding:16px; text-align:center; box-shadow:0 4px 0 var(--line); }
.stat b { display:block; font-family:'Fredoka'; font-size:34px; line-height:1.1; color:var(--bluebonnet); }
.stat span { font-size:14px; font-weight:700; color:var(--soft); }
.shelf { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
@media (min-width:560px){ .shelf { grid-template-columns:repeat(3,1fr); } }
.brick { text-align:left; background:var(--paper); border:2px solid var(--line);
  border-radius:16px; padding:14px; cursor:pointer; box-shadow:0 4px 0 var(--line);
  font-family:'Nunito'; color:var(--ink); display:block; }
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

/* stage 1 objectives */
.goals { display:grid; gap:12px; }
.goal { display:flex; align-items:center; gap:16px; background:var(--paper);
  border:2px solid var(--line); border-radius:18px; padding:18px;
  font-size:19px; font-weight:700; line-height:1.4; }
.goal .gi { font-size:34px; flex:none; width:52px; height:52px; border-radius:15px;
  background:var(--sunset-lt); display:grid; place-items:center; }

/* stage 2 steps */
.steps { list-style:none; margin:0; padding:0; display:grid; gap:10px; counter-reset:s; }
.steps li { display:flex; gap:14px; align-items:flex-start; background:var(--paper);
  border:2px solid var(--line); border-radius:18px; padding:16px;
  font-size:18px; line-height:1.55; }
.steps .sn { flex:none; width:34px; height:34px; border-radius:11px; background:var(--bluebonnet);
  color:#fff; display:grid; place-items:center; font-family:'Fredoka'; font-size:18px; }
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
  "expanded form": "Writing a number as its pieces added together, like 300 + 40 + 2.",
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
  { id: "num", name: "Brick Yard", sub: "Numbers & Fractions", subject: "Math", rc: "#1B62E8", icon: "🧱" },
  { id: "ops", name: "Gear Works", sub: "Adding, Multiplying, Dividing", subject: "Math", rc: "#12A05A", icon: "⚙️" },
  { id: "geo", name: "Build Deck", sub: "Shapes & Measuring", subject: "Math", rc: "#D8362A", icon: "📐" },
  { id: "dat", name: "Score Tower", sub: "Graphs & Coins", subject: "Math", rc: "#F5C518", icon: "🏆" },
  { id: "read", name: "Story Mode", sub: "Reading & Understanding", subject: "Reading", rc: "#8B3FD6", icon: "📖" },
  { id: "write", name: "Repair Bay", sub: "Fixing & Upgrading Writing", subject: "Reading", rc: "#0FA3B1", icon: "🔧" },
];

const CONCEPTS = [
  /* ---------------- LIMESTONE CANYON ---------------- */
  {
    id: "placevalue", region: "num", icon: "🔢", teks: "3.2A, 3.2B",
    title: "Place value and expanded form",
    idea: "Every digit has a job. Its job depends on where it sits. In 4,706 the 7 isn't just 'seven' — it is 7 hundreds, worth 700.",
    another: "Think of it like money. A 5 in the thousands spot is five $1,000 bills. The same 5 in the tens spot is five $10 bills. Same digit, very different pile.",
    example: "6,203 = 6,000 + 200 + 3   (there are no tens, so nothing to add)",
    qs: [
      { type: "mc", prompt: "Which expression shows the [[expanded form]] of 92,060?",
        options: ["(9 × 1,000) + (2 × 1,000) + (6 × 100)", "(9 × 10,000) + (2 × 100) + (6 × 10)", "(9 × 10,000) + (2 × 1,000) + (6 × 10)", "(9 × 1,000) + (2 × 100) + (6 × 10)"],
        a: 2, hint: "Say the number out loud: ninety-two thousand, sixty. What is the 9 really worth?",
        exp: "9 sits in the ten thousands spot, so it is 9 × 10,000 = 90,000. The 2 is 2 × 1,000 = 2,000. The 6 is in the tens spot, 6 × 10 = 60. Nothing in hundreds or ones." },
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
    steps: ["Start at the right and name each spot: ones, tens, hundreds, thousands, ten thousands.", "Point at your digit and say the spot name out loud.", "Multiply the digit by that spot's value. The 7 in the hundreds spot is 7 × 100 = 700.", "For expanded form, do that for every digit and add them with plus signs. Skip a spot only if the digit is 0."],
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
const KEY = "texas-trail-progress-v1";
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
  return n;
}

async function loadProgress() {
  try {
    const r = await window.storage.get(KEY);
    return r ? { ...blank, ...JSON.parse(r.value) } : { ...blank };
  } catch {
    return { ...blank };
  }
}
async function saveProgress(p) {
  try { await window.storage.set(KEY, JSON.stringify(p)); } catch { /* offline is fine */ }
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
          <button className="home" onClick={() => setView({ name: "map" })}>← Zone map</button>
        ) : (
          <span className="home">Brick Dash</span>
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

      <div className="shell">
        {!loaded && <p className="lede" style={{ padding: 40 }}>Loading your zones…</p>}
        {loaded && view.name === "map" && <TrailMap progress={progress} go={setView} />}
        {loaded && view.name === "collection" && <Collection progress={progress} push={push} go={setView} />}
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

/* ---------------- map ---------------- */
function TrailMap({ progress, go }) {
  return (
    <div className="stack">
      <div className="hero">
        <h1>Pick your zone.</h1>
        <p className="lede" style={{ maxWidth: 520, color: "#4A5764" }}>
          Six zones to clear. Each stop runs in three stages: what you're learning,
          how to do it, then five questions. Four right and the brick is yours.
        </p>
      </div>

      <button className="card progsum" onClick={() => go({ name: "collection" })}>
        <div className="ps">
          <span><b className="g">{progress.correct || 0}</b><span>right</span></span>
          <span><b className="r">{Math.max(0, (progress.attempts || 0) - (progress.correct || 0))}</b><span>wrong</span></span>
          <span><b>{progress.attempts ? Math.round(((progress.correct || 0) / progress.attempts) * 100) : 0}%</b><span>correct</span></span>
        </div>
        <div className="small" style={{ marginTop: 10, fontWeight: 800 }}>See everything you've done →</div>
      </button>

      <div className="trail">
        {REGIONS.map((r) => {
          const cs = conceptsIn(r.id);
          const done = cs.filter((c) => progress.mastered?.[c.id]).length;
          return (
            <button key={r.id} className="region" style={{ "--rc": r.rc }} onClick={() => go({ name: "region", rid: r.id })}>
              <h3>{r.icon} {r.name}</h3>
              <div className="meta">{r.sub} · {r.subject}</div>
              <div className="bar"><i style={{ width: `${(done / cs.length) * 100}%` }} /></div>
              <div className="meta" style={{ marginTop: 6 }}>{done} of {cs.length} bricks</div>
            </button>
          );
        })}
      </div>

      <div className="card stack" style={{ marginTop: 8 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>⚡ Speed Math</h2>
        <p className="lede" style={{ margin: 0 }}>
          Timed drill on adding, subtracting, and multiplying. Pick single, double, or triple digits.
        </p>
        <div className="small">
          Best runs — single {progress.speedMath?.sm1 || 0} · double {progress.speedMath?.sm2 || 0} · triple {progress.speedMath?.sm3 || 0}
        </div>
        <div className="btnrow">
          <button className="btn" onClick={() => go({ name: "mathdrill" })}>Open Speed Math</button>
        </div>
      </div>

      <div className="card stack" style={{ marginTop: 8 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>🔤 Word Forge</h2>
        <p className="lede" style={{ margin: 0 }}>
          Sight words, six at a time. Hear the word, build it from letters, then use it in a sentence.
        </p>
        <div className="small">Words spelled right so far: {Object.keys(progress.words || {}).length}</div>
        <div className="btnrow">
          {[1, 2, 3, 4].map((lv) => (
            <button key={lv} className={`btn ${lv === 3 ? "" : "ghost"}`}
              onClick={() => go({ name: "spell", level: lv, k: Math.random() })}>
              Grade {lv}
            </button>
          ))}
        </div>
      </div>

      <div className="card stack" style={{ marginTop: 8 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>⚡ Speed Run</h2>
        <p className="lede" style={{ margin: 0 }}>
          Questions from every zone, mixed up, with a clock running. Start at 4 minutes and work up —
          this is how you get used to the real test's pressure.
        </p>
        <div className="small">Best run so far: {progress.bestTimed || 0} correct</div>
        <div className="btnrow">
          <button className="btn" onClick={() => go({ name: "timed", secs: 240 })}>4 minutes</button>
          <button className="btn ghost" onClick={() => go({ name: "timed", secs: 480 })}>8 minutes</button>
          <button className="btn ghost" onClick={() => go({ name: "timed", secs: 900 })}>15 minutes</button>
        </div>
      </div>
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
  const [useChoice, setUseChoice] = useState(null);
  const [won, setWon] = useState([]);
  const [rightN, setRightN] = useState(0);
  const [wrongN, setWrongN] = useState(0);
  const [wordTally, setWordTally] = useState({});
  const [done, setDone] = useState(false);
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

  /* three wrong options for the sentence step */
  const useOptions = React.useMemo(() => {
    const others = list.map((x) => x[0]).filter((w) => w !== word).sort(() => Math.random() - 0.5).slice(0, 2);
    return [word, ...others].sort(() => Math.random() - 0.5);
  }, [word, list]);

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
    setFirstTry(true); setUseChoice(null);
  };

  if (done) {
    return (
      <div className="stack">
        <div className="stamp card">
          <div className="big">{won.length === round.length ? "🔤" : "⚡"}</div>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>{won.length} of {round.length} spelled first try</h1>
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
              <div className="fb ok"><h3>Spelled it.</h3><p>Now let's use it.</p></div>
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

      {/* STEP 3 — use it in a sentence */}
      {step === "use" && (
        <>
          <p className="prompt">Which word finishes the sentence?</p>
          <div className="idea"><p style={{ fontSize: 21, margin: 0 }}>{sentence.replace("___", "________")}</p></div>
          <div className="opts">
            {useOptions.map((o, k) => {
              let cls = "";
              if (useChoice !== null) cls = o === word ? "right" : useChoice === o ? "wrong" : "";
              return (
                <button key={k} className={`opt ${cls}`} disabled={useChoice !== null}
                  onClick={() => { setUseChoice(o); tally(word, o === word); }}>
                  <span className="k">{"ABC"[k]}</span><span>{o}</span>
                </button>
              );
            })}
          </div>
          {useChoice !== null && (
            <div className={`fb ${useChoice === word ? "ok" : "no"}`}>
              <h3>{useChoice === word ? "That's it — nice thinking." : "Here's why that one isn't right —"}</h3>
              <p>
                {useChoice === word
                  ? `"${sentence.replace("___", word)}"`
                  : `Read it back with your choice: "${sentence.replace("___", useChoice)}" — that doesn't sound right. The sentence needs "${word}".`}
              </p>
            </div>
          )}
          <div className="footer"><div className="in">
            {useChoice !== null && <button className="btn" onClick={nextWord}>{i + 1 >= round.length ? "See how I did" : "Next word"}</button>}
          </div></div>
        </>
      )}
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
    if (score > prev) p.speedMath = { ...(p.speedMath || {}), [bestKey]: score };
    push(p);
  }, [phase]); // eslint-disable-line

  const start = () => {
    if (!ops.length) return;
    saved.current = false;
    setScore(0); setMisses([]); setStreak(0); setBestStreak(0);
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
    return (
      <div className="stack">
        <div className="stamp card">
          <div className="big">⚡</div>
          <h1 style={{ fontSize: 32, margin: "8px 0" }}>{score} right, {misses.length} wrong</h1>
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
function Collection({ progress, push, go }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, setMsg] = useState("");
  const fileRef = useRef(null);
  const mastered = Object.keys(progress.mastered || {}).length;
  const acc = progress.attempts ? Math.round((progress.correct / progress.attempts) * 100) : 0;
  const zonesCleared = REGIONS.filter((r) => conceptsIn(r.id).every((c) => progress.mastered?.[c.id])).length;

  const exportBackup = () => {
    try {
      const blob = new Blob([JSON.stringify(progress, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `brickdash-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
        push({ ...blank, ...d });
        setMsg("Progress restored from backup.");
      } catch { setMsg("That file couldn't be read as a Brick Dash backup."); }
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
        <div className="stat"><b>{Object.keys(progress.seen || {}).length}</b><span>stops tried</span></div>
        <div className="stat"><b>{Object.keys(progress.words || {}).length}</b><span>sight words spelled</span></div>
      </div>

      <h3 style={{ margin: "16px 0 0", fontSize: 21 }}>Right and wrong by activity</h3>
      <div className="table">
        <div className="tr th"><span>Activity</span><span>Right</span><span>Wrong</span><span>Correct</span></div>
        {["Concept stops", "Speed Run", "Speed Math", "Word Forge"].map((a) => {
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
              onClick={() => { push({ ...blank }); setConfirmReset(false); go({ name: "map" }); }}>
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
        <p className="lede" style={{ color: "#4A5764", margin: 0 }}>{r.sub}</p>
      </div>
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
          <div className="small" style={{ fontWeight: 800 }}>Stage 1 of 3</div>
          <h1>{c.icon} {c.title}</h1>
          <p className="lede" style={{ color: "#4A5764", margin: 0 }}>Here's what you'll be able to do when you finish this stop.</p>
        </div>
        <div className="goals">
          {L.goals.map(([ico, t], k) => (
            <div className="goal" key={k}><span className="gi">{ico}</span><span><RichText text={t} onWord={onWord} /></span></div>
          ))}
        </div>
        <div className="footer"><div className="in">
          <button className="btn ghost" onClick={() => go({ name: "region", rid: c.region })}>Back</button>
          <button className="btn" onClick={() => setStage(2)}>Show me how →</button>
        </div></div>
      </div>
    );
  }

  /* ---- Stage 2: how to do it ---- */
  if (stage === 2) {
    return (
      <div className="stack">
        <StageDots />
        <div className="hero">
          <div className="small" style={{ fontWeight: 800 }}>Stage 2 of 3</div>
          <h1>How to do it</h1>
        </div>
        <div className="idea">
          <h2>The idea</h2>
          <p><RichText text={c.idea} onWord={onWord} /></p>
          <div className="egbox"><RichText text={c.example} onWord={onWord} /></div>
        </div>
        <ol className="steps">
          {L.steps.map((s, k) => (
            <li key={k}><span className="sn">{k + 1}</span><span><RichText text={s} onWord={onWord} /></span></li>
          ))}
        </ol>
        {showAnother ? (
          <div className="idea" style={{ background: "#FBEDD5", borderColor: "#EBCB92" }}>
            <h2>Another way to see it</h2>
            <p><RichText text={c.another} onWord={onWord} /></p>
          </div>
        ) : (
          <button className="btn ghost" onClick={() => setShowAnother(true)}>Show me another way →</button>
        )}
        <p className="small">Tap any <span className="vw">dotted word</span> to see what it means.</p>
        <div className="footer"><div className="in">
          <button className="btn ghost" onClick={() => setStage(1)}>Back</button>
          <button className="btn" onClick={() => setStage(3)}>Try 5 questions</button>
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
      onDone={(score) => {
        const wrong = c.qs.length - score;
        let p = record(progress, "Concept stops", score, wrong);
        p.seen = { ...p.seen, [c.id]: true };
        p.best = { ...p.best, [c.id]: Math.max(p.best?.[c.id] || 0, score) };
        const st = (p.stop && p.stop[c.id]) || { right: 0, wrong: 0, runs: 0 };
        p.stop = { ...(p.stop || {}), [c.id]: { right: st.right + score, wrong: st.wrong + wrong, runs: st.runs + 1 } };
        if (score >= c.qs.length - 1) p.mastered = { ...p.mastered, [c.id]: true };
        push(p);
      }}
      goBack={() => go({ name: "region", rid: c.region })}
      reteach={() => setStage(2)}
    />
  );
}

/* ---------------- practice engine ---------------- */
function Practice({ concept, questions, onWord, onDone, goBack, reteach, timed }) {
  const [i, setI] = useState(0);
  const [val, setVal] = useState(undefined);
  const [locked, setLocked] = useState(false);
  const [hint, setHint] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
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
    if (finished && !reported.current) { reported.current = true; onDone(score); }
  }, [finished, score, onDone]);

  if (finished) {
    const perfect = score === questions.length;
    return (
      <div className="stack">
        <div className="stamp card">
          <div className="big">{perfect ? "🧱" : score > questions.length / 2 ? "⚡" : "🔧"}</div>
          <h1 style={{ fontSize: 30, margin: "8px 0" }}>
            {perfect ? "Stop cleared!" : `${score} out of ${questions.length}`}
          </h1>
          <p className="lede" style={{ color: "#4A5764", margin: 0 }}>
            {perfect
              ? "Every single one. Brick collected."
              : score >= questions.length - 1
              ? "Brick collected — strong run. Read the one you missed once more before you go."
              : "You're getting it. Reread the steps in stage 2, then run these again — four out of five earns the brick."}
          </p>
        </div>
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
      <div className="qnum">Question {i + 1} of {questions.length}{concept ? ` · ${concept.title}` : ""}</div>

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

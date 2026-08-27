export type Project = {
  slug:string; number:string; name:string; category:string; role:string; year:string;
  description:string; narrative:string; image:string; alt:string; theme:string; statement:string;
};
export const profile = {
  name:"A / FORM", location:"Singapore", timezone:"Asia/Singapore", year:"2026",
  title:"Independent Designer",
  description:"An independent design practice exploring the space between clear systems and unexpected expression.",
};
export const projects: Project[] = [
 {slug:"phase-matter",number:"01",name:"PHASE MATTER",category:"BRAND IDENTITY",role:"Strategy / Identity / Art direction",year:"2026",description:"A new language for a world in constant transformation.",narrative:"An imagined material-research practice where science becomes tangible. A fluid, reflective form sits against a rigorous typographic framework: a visual identity built around the tension between changing matter and lasting structure.",image:"/images/phase.png",alt:"An original smoked-glass folded sculpture with silver and cobalt reflections",theme:"phase",statement:"NOTHING STAYS STILL."},
 {slug:"tidal-index",number:"02",name:"TIDAL INDEX",category:"DIGITAL EXPERIENCE",role:"Concept / Digital design / Art direction",year:"2026",description:"Making the invisible rhythms of the ocean visible.",narrative:"A self-initiated digital exhibition about the ocean as a living archive. Photographic currents meet measured typography, translating the idea of changing tides into an editorial visual system. Displayed figures are illustrative, not live scientific data.",image:"/images/tidal.png",alt:"A silver tidal current crossing a deep cobalt ocean",theme:"tidal",statement:"EVERY CURRENT LEAVES A TRACE."},
 {slug:"after-signal",number:"03",name:"AFTER SIGNAL",category:"CAMPAIGN",role:"Creative direction / Campaign / Editorial",year:"2026",description:"A visual frequency for sound beyond the familiar.",narrative:"An imagined gathering for experimental listening. Repeated contours turn sound into a physical gesture, while oversized typography gives the campaign a direct, almost tactile presence. A study in rhythm, interruption and resonance.",image:"/images/signal.png",alt:"Sculptural silver sound-wave ribbons in a black void",theme:"signal",statement:"LISTEN BEYOND THE NOISE."},
 {slug:"common-field",number:"04",name:"COMMON FIELD",category:"ART DIRECTION",role:"Visual system / Spatial graphics / Art direction",year:"2026",description:"An open framework for art in everyday public space.",narrative:"A concept for a public-art programme that belongs to everyone. A simple folded plane becomes a spatial marker, a printed symbol and an invitation. The system connects architecture and typography through one unmistakable blue.",image:"/images/common.png",alt:"A cobalt-blue folded steel sculpture in a pale concrete plaza",theme:"common",statement:"SPACE FOR EVERYONE."},
];
export const getProject = (slug:string) => projects.find(p=>p.slug===slug);


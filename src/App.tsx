import { useState, useMemo, useEffect, useCallback } from "react";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";

const supabase = createClient(
  "https://ybbtqkvxglsucoxqglml.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InliYnRxa3Z4Z2xzdWNveHFnbG1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NTExMDcsImV4cCI6MjA4ODMyNzEwN30.B1YXuce-Wu6pLG6Tk-Eo2bgyvePaKnQ6lu2DfLtMlHM"
);

// ── EVENT NAME MIGRATION ──
const EVENT_RENAME_MAP = {
  "50y Back":"50 Back","50y Breast":"50 Breast","50y Fly":"50 Fly","50y Free":"50 Free",
  "100y Back":"100 Back","100y Breast":"100 Breast","100y Fly":"100 Fly","100y Free":"100 Free",
  "200y Free":"200 Free","200y IM":"200 IM","500y Free":"500 Free"
};

// ── CONSTANTS ──
const INDIVIDUAL_EVENTS = ["50 Back","50 Breast","50 Fly","50 Free","100 Back","100 Breast","100 Fly","100 Free","200 Free","200 IM","500 Free"];
const RELAY_EVENTS = ["200 Medley Relay","200 Free Relay","400 Free Relay"];
const ALL_EVENTS = [...INDIVIDUAL_EVENTS, ...RELAY_EVENTS];

// Meet entry order (individual only — relays handled separately)
const MEET_EVENT_ORDER = [
  "200 Free","200 IM","50 Free","100 Fly","100 Free","500 Free","100 Back","100 Breast"
];
const ENTRY_ONLY_EVENTS = ["50 Back","50 Breast","50 Fly"]; // individual logging only, not in grid

const RELAY_LEGS = {
  "200 Medley Relay": [
    {label:"Back",  event:"50 Back (MR)"},
    {label:"Breast",event:"50 Breast (MR)"},
    {label:"Fly",   event:"50 Fly (MR)"},
    {label:"Free",  event:"50 Free (MR)"},
  ],
  "200 Free Relay": [
    {label:"Leg 1",event:"50 Free (FR)"},
    {label:"Leg 2",event:"50 Free (FR)"},
    {label:"Leg 3",event:"50 Free (FR)"},
    {label:"Leg 4",event:"50 Free (FR)"},
  ],
  "400 Free Relay": [
    {label:"Leg 1",event:"100 Free (FR)"},
    {label:"Leg 2",event:"100 Free (FR)"},
    {label:"Leg 3",event:"100 Free (FR)"},
    {label:"Leg 4",event:"100 Free (FR)"},
  ],
};

// Groups relay splits with their base event on swimmer profile
const RELAY_SPLIT_VARIANTS = {
  "50 Free":  ["50 Free (MR)","50 Free (FR)"],
  "50 Back":  ["50 Back (MR)"],
  "50 Breast":["50 Breast (MR)"],
  "50 Fly":   ["50 Fly (MR)"],
  "100 Free": ["100 Free (FR)"],
};

// Full meet entry order including relays
const FULL_MEET_ORDER = [
  {type:"relay",  name:"200 Medley Relay"},
  {type:"individual", name:"200 Free"},
  {type:"individual", name:"200 IM"},
  {type:"individual", name:"50 Free"},
  {type:"individual", name:"100 Fly"},
  {type:"individual", name:"100 Free"},
  {type:"individual", name:"500 Free"},
  {type:"relay",  name:"200 Free Relay"},
  {type:"individual", name:"100 Back"},
  {type:"individual", name:"100 Breast"},
  {type:"relay",  name:"400 Free Relay"},
];

// ── YEAR HELPERS ──
function getCurrentSeniorGradYear() {
  const now = new Date();
  return now.getMonth() >= 8 ? now.getFullYear() + 1 : now.getFullYear();
}
function gradYearToLabel(gradYear) {
  if (!gradYear) return "";
  const diff = Number(gradYear) - getCurrentSeniorGradYear();
  if (diff === 0) return "SR";
  if (diff === 1) return "JR";
  if (diff === 2) return "SO";
  if (diff === 3) return "FR";
  if (diff < 0) return "GR";
  return `'${String(gradYear).slice(2)}`;
}

// ── SEED DATA ──
const SEED_SWIMMERS = [
  {name:"Dylan Wellington",grad_year:2026},{name:"Ambrose Teague",grad_year:2026},
  {name:"Aiden Cusick",grad_year:2026},{name:"Harrys Yankam",grad_year:2026},
  {name:"Caden Medeiros",grad_year:2027},{name:"Mia Koulopoulos",grad_year:2027},
  {name:"Justin Nelson",grad_year:2027},{name:"Charlie Wise",grad_year:2027},
  {name:"Melanie Bradley",grad_year:2028},{name:"Megan Eaton",grad_year:2028},
  {name:"Patrick Conners",grad_year:2028},{name:"Adelaide Teague",grad_year:2028},
  {name:"Laque Joseph",grad_year:2028},{name:"Karley O'Connor",grad_year:2029},
  {name:"Seana Kane",grad_year:2029},{name:"Lillian Brokvist",grad_year:2029},
  {name:"Elizabeth Olson",grad_year:2029},{name:"Nunez Jesiah",grad_year:2026},
  {name:"Abigail Troisi",grad_year:2027},{name:"Nell Russell",grad_year:2027},
  {name:"Mason Gadea",grad_year:2028},{name:"Daria Alic",grad_year:2028},
  {name:"Charlotte Franco",grad_year:2029},{name:"Megan Burke",grad_year:2029},
  {name:"Vinaja Allen",grad_year:2026},{name:"Kamille Suplice",grad_year:2027},
  {name:"Isaiah Mwangi",grad_year:2028}
];
const SEED_MEETS = [
  {name:"Gloucester", season:"2024-25", date:"2024-11-05"},
  {name:"Swampscott", season:"2024-25", date:"2024-11-12"},
  {name:"Danvers",    season:"2024-25", date:"2024-11-19"},
  {name:"Masco",      season:"2024-25", date:"2024-12-03"},
  {name:"Salem",      season:"2024-25", date:"2024-12-10"},
  {name:"Marblehead", season:"2024-25", date:"2024-12-17"},
];
const SEED_TIMES_RAW = [
  [1,"500 Free",366.56,"Gloucester"],[1,"500 Free",369.76,"Swampscott"],[2,"50 Free",25.25,"Masco"],
  [2,"50 Free",25.53,"Danvers"],[3,"50 Free",25.67,"Gloucester"],[1,"50 Free",25.89,"Gloucester"],
  [3,"50 Free",25.97,"Masco"],[3,"50 Free",26.13,"Swampscott"],[2,"100 Breast",76.94,"Gloucester"],
  [4,"200 IM",158.94,"Danvers"],[3,"50 Free",26.25,"Danvers"],[5,"100 Breast",85.21,"Gloucester"],
  [6,"100 Back",72.47,"Gloucester"],[2,"50 Free",26.34,"Swampscott"],[7,"100 Back",79.02,"Gloucester"],
  [8,"200 Free",145.53,"Gloucester"],[9,"200 Free",151.27,"Gloucester"],[10,"200 Free",161.97,"Gloucester"],
  [6,"200 IM",166.6,"Gloucester"],[2,"50 Free",26.37,"Salem"],[8,"100 Fly",73.65,"Gloucester"],
  [11,"50 Free",26.44,"Salem"],[11,"50 Free",26.57,"Swampscott"],[4,"100 Breast",80.44,"Danvers"],
  [11,"50 Free",26.72,"Danvers"],[12,"100 Back",95.81,"Gloucester"],[9,"100 Breast",96.32,"Gloucester"],
  [11,"50 Free",26.73,"Masco"],[3,"50 Free",26.82,"Marblehead"],[6,"50 Back",32.9,"Gloucester"],
  [5,"100 Breast",90.47,"Salem"],[7,"50 Fly",30.51,"Gloucester"],[11,"50 Free",26.84,"Gloucester"],
  [1,"50 Free",27.3,"Gloucester"],[3,"50 Free",27.43,"Salem"],[4,"200 IM",150.13,"Gloucester"],
  [11,"50 Free",29.85,"Marblehead"],[13,"50 Free",31.15,"Danvers"],[10,"50 Free",31.22,"Danvers"],
  [3,"50 Back",31.74,"Gloucester"],[2,"50 Breast",33.13,"Gloucester"],[8,"50 Free",31.62,"Gloucester"],
  [14,"200 IM",201.69,"Gloucester"],[4,"100 Fly",74.81,"Gloucester"],[13,"50 Free",32.33,"Gloucester"],
  [15,"100 Fly",86.51,"Gloucester"],[9,"50 Free",32.77,"Gloucester"],[5,"100 Breast",86.09,"Swampscott"],
  [10,"50 Free",33.22,"Masco"],[1,"50 Free",33.4,"Marblehead"],[14,"50 Free",34.64,"Gloucester"],
  [13,"50 Free",35.78,"Salem"],[16,"50 Free",36.78,"Salem"],[17,"50 Free",37.75,"Gloucester"],
  [17,"50 Free",37.78,"Danvers"],[4,"50 Free",29.24,"Gloucester"],[2,"100 Breast",81.38,"Marblehead"],
  [4,"50 Fly",30.46,"Gloucester"],[6,"100 Back",72.01,"Marblehead"],[18,"50 Free",38.08,"Danvers"],
  [1,"500 Free",370.12,"Danvers"],[7,"100 Back",83.97,"Marblehead"],[15,"100 Back",88.19,"Marblehead"],
  [9,"200 Free",154.93,"Marblehead"],[8,"200 IM",164.5,"Marblehead"],[13,"50 Free",38.09,"Masco"],
  [5,"100 Breast",87.78,"Masco"],[8,"100 Fly",73.44,"Marblehead"],[17,"200 Free",204.69,"Marblehead"],
  [7,"200 IM",178.65,"Marblehead"],[6,"100 Fly",74.41,"Marblehead"],[18,"50 Free",38.24,"Gloucester"],
  [19,"100 Back",115.33,"Marblehead"],[15,"200 IM",192.56,"Marblehead"],[7,"500 Free",375.76,"Masco"],
  [7,"500 Free",382.32,"Gloucester"],[16,"100 Breast",108.02,"Marblehead"],[20,"50 Free",38.32,"Masco"],
  [18,"50 Free",38.96,"Masco"],[20,"50 Free",39.41,"Salem"],[2,"100 Breast",77.29,"Salem"],
  [6,"100 Back",73.94,"Salem"],[4,"100 Fly",71.4,"Marblehead"],[21,"50 Free",39.71,"Danvers"],
  [17,"50 Free",39.82,"Swampscott"],[7,"500 Free",382.44,"Danvers"],[8,"100 Fly",73.06,"Salem"],
  [5,"100 Breast",85.65,"Danvers"],[8,"200 Free",142.66,"Salem"],[15,"200 Free",171.0,"Salem"],
  [14,"200 Free",180.69,"Salem"],[6,"200 IM",170.14,"Salem"],[4,"100 Breast",83.72,"Marblehead"],
  [1,"500 Free",387.05,"Masco"],[9,"500 Free",388.62,"Danvers"],[7,"100 Back",89.82,"Salem"],
  [14,"100 Breast",100.69,"Salem"],[19,"50 Free",40.58,"Swampscott"],[22,"50 Free",40.59,"Swampscott"],
  [21,"50 Free",41.16,"Masco"],[23,"100 Back",111.44,"Salem"],[22,"50 Free",41.78,"Salem"],
  [23,"50 Free",42.25,"Danvers"],[19,"50 Free",42.42,"Salem"],[5,"100 Fly",94.03,"Masco"],
  [1,"100 Fly",76.25,"Salem"],[24,"50 Free",42.78,"Salem"],[21,"50 Free",43.03,"Swampscott"],
  [19,"100 Back",122.78,"Salem"],[17,"100 Breast",159.81,"Salem"],[25,"50 Free",43.63,"Gloucester"],
  [25,"50 Free",43.96,"Swampscott"],[9,"500 Free",398.26,"Swampscott"],[23,"50 Free",44.09,"Masco"],
  [26,"50 Free",44.38,"Danvers"],[8,"200 IM",160.93,"Swampscott"],[4,"200 IM",161.38,"Masco"],
  [4,"100 Breast",80.32,"Masco"],[6,"100 Back",72.97,"Swampscott"],[8,"100 Fly",72.87,"Swampscott"],
  [9,"500 Free",403.28,"Marblehead"],[1,"200 Free",134.14,"Swampscott"],[7,"100 Back",79.14,"Swampscott"],
  [5,"100 Fly",93.44,"Danvers"],[9,"200 Free",152.38,"Swampscott"],[15,"200 Free",164.85,"Swampscott"],
  [7,"200 IM",176.19,"Swampscott"],[1,"500 Free",406.09,"Salem"],[12,"100 Back",100.32,"Swampscott"],
  [6,"100 Fly",75.72,"Swampscott"],[27,"200 IM",193.81,"Swampscott"],[14,"100 Breast",101.22,"Swampscott"],
  [9,"200 Free",156.6,"Masco"],[1,"200 Free",149.09,"Masco"],[10,"200 Free",161.46,"Masco"],
  [8,"200 IM",163.04,"Masco"],[4,"200 IM",161.22,"Salem"],[15,"200 IM",183.9,"Masco"],
  [2,"100 Free",56.89,"Danvers"],[2,"100 Free",57.62,"Masco"],[2,"100 Free",57.85,"Marblehead"],
  [2,"100 Free",58.03,"Gloucester"],[2,"100 Free",58.15,"Swampscott"],[1,"100 Free",58.69,"Marblehead"],
  [11,"100 Free",62.12,"Gloucester"],[11,"100 Free",62.18,"Masco"],[11,"100 Free",63.25,"Danvers"],
  [11,"100 Free",65.22,"Marblehead"],[6,"100 Fly",77.18,"Masco"],[8,"100 Fly",74.46,"Masco"],
  [5,"100 Free",72.15,"Marblehead"],[11,"100 Free",65.5,"Salem"],[11,"100 Free",65.76,"Swampscott"],
  [27,"100 Free",70.93,"Gloucester"],[5,"200 Free",172.65,"Marblehead"],[7,"500 Free",432.1,"Salem"],
  [15,"500 Free",441.41,"Swampscott"],[19,"100 Back",114.83,"Masco"],[7,"100 Back",80.81,"Masco"],
  [6,"100 Back",73.81,"Masco"],[12,"100 Back",95.46,"Masco"],[14,"100 Breast",101.5,"Masco"],
  [12,"200 Free",180.66,"Danvers"],[9,"200 Free",149.57,"Danvers"],[1,"200 Free",135.34,"Danvers"],
  [27,"200 Free",166.35,"Danvers"],[8,"200 IM",160.65,"Danvers"],[4,"100 Fly",71.02,"Swampscott"],
  [15,"200 IM",180.34,"Danvers"],[19,"100 Free",74.38,"Danvers"],[27,"100 Free",74.38,"Danvers"],
  [10,"100 Free",75.19,"Swampscott"],[15,"100 Free",77.81,"Masco"],[10,"100 Free",78.22,"Salem"],
  [20,"100 Free",86.5,"Gloucester"],[17,"100 Free",92.72,"Salem"],[8,"100 Fly",73.68,"Danvers"],
  [6,"100 Fly",76.07,"Danvers"],[5,"50 Breast",37.05,"Gloucester"],[22,"100 Free",93.63,"Masco"],
  [19,"100 Free",94.71,"Gloucester"],[19,"100 Free",100.54,"Salem"],[15,"500 Free",467.42,"Salem"],
  [5,"500 Free",488.95,"Gloucester"],[1,"500 Free",541.34,"Marblehead"],[20,"100 Back",99.21,"Danvers"],
  [7,"100 Back",81.91,"Danvers"],[6,"100 Back",72.5,"Danvers"],[12,"100 Back",94.25,"Danvers"],
  [16,"100 Breast",107.22,"Danvers"],[14,"500 Free",565.39,"Marblehead"],[4,"100 Breast",81.38,"Swampscott"],
  [14,"100 Breast",100.87,"Danvers"]
];

// ── HELPERS ──
function formatTime(s) {
  if (!s && s !== 0) return "—";
  const mins = Math.floor(s / 60);
  const secs = (s % 60).toFixed(2).padStart(5, "0");
  return mins > 0 ? `${mins}:${secs}` : `${secs}s`;
}
function parseTime(str) {
  if (!str) return null;
  const clean = str.trim();
  if (clean.includes(":")) { const [m,s]=clean.split(":").map(Number); return m*60+s; }
  return parseFloat(clean)||null;
}
function formatDisplayDate(d) {
  if (!d) return "";
  const [y,m,day]=d.split("-");
  return `${m}/${day}/${y}`;
}

// ── SWIMMER AUTOCOMPLETE — defined outside main component so it never remounts ──
function SwimmerInput({cellKey, value, onChange, onSelectSuggestion, swimmers, swimmerDropdown, setSwimmerDropdown}) {
  const suggestions = value.trim().length >= 2
    ? swimmers.filter(s => s.name.toLowerCase().includes(value.toLowerCase())).slice(0, 6)
    : [];
  const showDrop = swimmerDropdown[cellKey] && suggestions.length > 0;
  const inputSmall = {background:"#0a1520",border:"1px solid #1a3050",borderRadius:6,color:"#e0eaf8",padding:"7px 10px",fontSize:13,fontFamily:"Barlow, sans-serif",width:"100%"};
  const card = "#0d1a2e"; const border = "#1a3050"; const text = "#e0eaf8"; const muted = "#4a7090";
  return (
    <div style={{position:"relative",flex:1}}>
      <input
        style={inputSmall}
        placeholder="Swimmer name…"
        value={value}
        onChange={e=>{onChange(e.target.value);setSwimmerDropdown(d=>({...d,[cellKey]:true}));}}
        onBlur={()=>setTimeout(()=>setSwimmerDropdown(d=>({...d,[cellKey]:false})),150)}
        onFocus={()=>setSwimmerDropdown(d=>({...d,[cellKey]:true}))}
      />
      {showDrop&&(
        <div style={{position:"absolute",top:"100%",left:0,right:0,background:card,border:`1px solid ${border}`,borderRadius:8,zIndex:50,boxShadow:"0 8px 24px rgba(0,0,0,0.5)",marginTop:2}}>
          {suggestions.map(s=>(
            <div key={s.id}
              onMouseDown={()=>{onSelectSuggestion(s.name);setSwimmerDropdown(d=>({...d,[cellKey]:false}));}}
              style={{padding:"8px 12px",color:text,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:8,background:"transparent"}}
              onMouseEnter={e=>e.currentTarget.style.background="#1a3050"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              {s.name}<YearBadge gradYear={s.grad_year}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function isRelaySplit(eventName) {
  return eventName.includes("(MR)") || eventName.includes("(FR)");
}
function baseEventOfSplit(eventName) {
  return eventName.replace(/\s*\((MR|FR)\)/, "").trim();
}

function CutBadge({cuts,event,time}) {
  const c=cuts?.find(x=>x.event===event);
  if (!c) return null;
  if (c.cut_a&&time<=c.cut_a) return <span style={{background:"#FFD700",color:"#1a1a2e",padding:"2px 8px",borderRadius:99,fontSize:11,fontWeight:700,letterSpacing:1}}>A CUT</span>;
  if (c.cut_b&&time<=c.cut_b) return <span style={{background:"#C0C0C0",color:"#1a1a2e",padding:"2px 8px",borderRadius:99,fontSize:11,fontWeight:700,letterSpacing:1}}>B CUT</span>;
  return null;
}
function ImprovementArrow({delta}) {
  if (!delta&&delta!==0) return null;
  const improved=delta<0;
  return <span style={{color:improved?"#00e5a0":"#ff6b6b",fontWeight:700,fontSize:13}}>{improved?"▼":"▲"} {Math.abs(delta).toFixed(2)}s</span>;
}
function YearBadge({gradYear,style={}}) {
  const label=gradYearToLabel(gradYear);
  const colors={FR:"#00e5a0",SO:"#00b4ff",JR:"#a78bfa",SR:"#FFD700",GR:"#888"};
  const color=colors[label]||"#888";
  return <span style={{background:`${color}22`,border:`1px solid ${color}55`,color,padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:700,...style}}>{label}</span>;
}

// ── MAIN COMPONENT ──
export default function SwimTracker() {
  const [loaded,setLoaded]=useState(false);
  const [saveStatus,setSaveStatus]=useState("idle");
  const [tab,setTab]=useState("dashboard");
  const [swimmers,setSwimmers]=useState([]);
  const [times,setTimes]=useState([]);
  const [meets,setMeets]=useState([]);
  const [events,setEvents]=useState([]);
  const [cuts,setCuts]=useState([]);
  const [relayResults,setRelayResults]=useState([]);

  // Swimmer profile
  const [selectedSwimmer,setSelectedSwimmer]=useState(null);
  const [chartEvent,setChartEvent]=useState("");
  const [editingSwimmer,setEditingSwimmer]=useState(null);
  const [editSwimmerName,setEditSwimmerName]=useState("");
  const [editSwimmerGradYear,setEditSwimmerGradYear]=useState("");

  // Roster filters
  const [rosterYearFilter,setRosterYearFilter]=useState("ALL");
  const [rosterEventFilter,setRosterEventFilter]=useState("");
  const [rosterSort,setRosterSort]=useState("cuts");

  // Meets
  const [leaderboardEvent,setLeaderboardEvent]=useState("");
  const [editingMeet,setEditingMeet]=useState(null);
  const [editMeetName,setEditMeetName]=useState("");
  const [editMeetSeason,setEditMeetSeason]=useState("");
  const [editMeetDate,setEditMeetDate]=useState("");
  const [collapsedSeasons,setCollapsedSeasons]=useState({});

  // Enter Results
  const [resultsMeet,setResultsMeet]=useState("");
  const [resultsGrid,setResultsGrid]=useState({});
  const [relayGrid,setRelayGrid]=useState({});
  const [relayTotals,setRelayTotals]=useState({});
  const [showConflicts,setShowConflicts]=useState(null);
  const [pendingSave,setPendingSave]=useState(null);
  const [swimmerSearch,setSwimmerSearch]=useState({});
  const [swimmerDropdown,setSwimmerDropdown]=useState({});

  // Modals
  const [showAddTime,setShowAddTime]=useState(false);
  const [showAddSwimmer,setShowAddSwimmer]=useState(false);
  const [showAddMeet,setShowAddMeet]=useState(false);
  const [showAddEvent,setShowAddEvent]=useState(false);
  const [showEditCut,setShowEditCut]=useState(null);
  const [showConfirmDelete,setShowConfirmDelete]=useState(null);
  const [newTime,setNewTime]=useState({swimmer_id:"",event:"",time:"",meet:""});
  const [newSwimmer,setNewSwimmer]=useState({name:"",grad_year:""});
  const [newMeet,setNewMeet]=useState({name:"",season:"",date:""});
  const [newEvent,setNewEvent]=useState("");
  const [editCutA,setEditCutA]=useState("");
  const [editCutB,setEditCutB]=useState("");

  const flash=useCallback((status)=>{
    setSaveStatus(status);
    setTimeout(()=>setSaveStatus("idle"),status==="error"?3000:2000);
  },[]);

  // ── LOAD & MIGRATE ──
  useEffect(()=>{
    async function load() {
      try {
        // Run migration first
        for (const [oldName,newName] of Object.entries(EVENT_RENAME_MAP)) {
          await supabase.from("times").update({event:newName}).eq("event",oldName);
          await supabase.from("events").update({name:newName}).eq("name",oldName);
          await supabase.from("cuts").update({event:newName}).eq("event",oldName);
        }

        // Ensure relay_results table exists by attempting a select
        await supabase.from("relay_results").select("id").limit(1);

        const [sw,me,ev,ti,cu,rr]=await Promise.all([
          supabase.from("swimmers").select("*").order("id"),
          supabase.from("meets").select("*").order("id"),
          supabase.from("events").select("*").order("id"),
          supabase.from("times").select("*").order("id"),
          supabase.from("cuts").select("*").order("id"),
          supabase.from("relay_results").select("*").order("id"),
        ]);

        if (!sw.data?.length) {
          const {data:seededSwimmers}=await supabase.from("swimmers").insert(SEED_SWIMMERS).select();
          const swMap={};
          seededSwimmers.forEach((s,i)=>{swMap[i+1]=s.id;});
          const {data:seededMeets}=await supabase.from("meets").insert(SEED_MEETS).select();
          const meetDateMap={};
          seededMeets.forEach(m=>{meetDateMap[m.name]=m.date;});
          await supabase.from("events").insert(INDIVIDUAL_EVENTS.map(name=>({name})));
          const timesToInsert=SEED_TIMES_RAW.map(([idx,event,time,meet])=>({
            swimmer_id:swMap[idx],event,time,meet,date:meetDateMap[meet]||"2024-11-05"
          }));
          for (let i=0;i<timesToInsert.length;i+=50) {
            await supabase.from("times").insert(timesToInsert.slice(i,i+50));
          }
          const [sw2,me2,ev2,ti2,cu2,rr2]=await Promise.all([
            supabase.from("swimmers").select("*").order("id"),
            supabase.from("meets").select("*").order("id"),
            supabase.from("events").select("*").order("id"),
            supabase.from("times").select("*").order("id"),
            supabase.from("cuts").select("*").order("id"),
            supabase.from("relay_results").select("*").order("id"),
          ]);
          setSwimmers(sw2.data||[]); setMeets(me2.data||[]);
          setEvents((ev2.data||[]).map(e=>e.name)); setTimes(ti2.data||[]);
          setCuts(cu2.data||[]); setRelayResults(rr2.data||[]);
          setLeaderboardEvent((ev2.data||[])[3]?.name||"");
        } else {
          setSwimmers(sw.data||[]); setMeets(me.data||[]);
          setEvents((ev.data||[]).map(e=>e.name)); setTimes(ti.data||[]);
          setCuts(cu.data||[]); setRelayResults(rr.data||[]);
          setLeaderboardEvent((ev.data||[])[3]?.name||"");
        }
      } catch(e){console.error(e);}
      setLoaded(true);
    }
    load();
  },[]);

  const meetDateMap=useMemo(()=>{
    const m={};
    meets.forEach(meet=>{m[meet.name]=meet.date||"";});
    return m;
  },[meets]);

  const pbMap=useMemo(()=>{
    const map={};
    times.forEach(t=>{
      const k=`${t.swimmer_id}-${t.event}`;
      if (!map[k]||t.time<map[k]) map[k]=t.time;
    });
    return map;
  },[times]);

  const seasons=useMemo(()=>[...new Set(meets.map(m=>m.season||""))].sort(),[meets]);
  const meetsBySeason=useMemo(()=>{
    const groups={};
    meets.forEach(m=>{const s=m.season||"";if(!groups[s])groups[s]=[];groups[s].push(m);});
    Object.values(groups).forEach(arr=>arr.sort((a,b)=>(a.date||"").localeCompare(b.date||"")));
    return groups;
  },[meets]);

  const swimmerTimesSorted=useCallback((sid)=>{
    return times
      .filter(t=>t.swimmer_id===sid)
      .map(t=>({...t,meetDate:meetDateMap[t.meet]||t.date||""}))
      .sort((a,b)=>a.meetDate.localeCompare(b.meetDate));
  },[times,meetDateMap]);

  const leaderboard=useMemo(()=>{
    if (!leaderboardEvent) return [];
    return swimmers.map(sw=>{
      const best=times.filter(t=>t.swimmer_id===sw.id&&t.event===leaderboardEvent).sort((a,b)=>a.time-b.time)[0];
      return best?{swimmer:sw,time:best.time}:null;
    }).filter(Boolean).sort((a,b)=>a.time-b.time);
  },[swimmers,times,leaderboardEvent]);

  // ── ACTIONS ──
  const addTime=async()=>{
    const parsed=parseTime(newTime.time);
    if (!newTime.swimmer_id||!newTime.event||!parsed||!newTime.meet) return;
    const date=meetDateMap[newTime.meet]||"";
    setSaveStatus("saving");
    const {data,error}=await supabase.from("times").insert({
      swimmer_id:Number(newTime.swimmer_id),event:newTime.event,time:parsed,meet:newTime.meet,date
    }).select().single();
    if (error){flash("error");return;}
    setTimes(t=>[...t,data]);
    setNewTime({swimmer_id:"",event:"",time:"",meet:""}); setShowAddTime(false); flash("saved");
  };

  const addSwimmer=async()=>{
    if (!newSwimmer.name) return;
    setSaveStatus("saving");
    const {data,error}=await supabase.from("swimmers").insert({
      name:newSwimmer.name,grad_year:Number(newSwimmer.grad_year)||null
    }).select().single();
    if (error){flash("error");return;}
    setSwimmers(s=>[...s,data]);
    setNewSwimmer({name:"",grad_year:""}); setShowAddSwimmer(false); flash("saved");
  };

  const saveSwimmerEdit=async()=>{
    if (!editSwimmerName.trim()) return;
    setSaveStatus("saving");
    const {error}=await supabase.from("swimmers").update({
      name:editSwimmerName.trim(),grad_year:Number(editSwimmerGradYear)||null
    }).eq("id",editingSwimmer);
    if (error){flash("error");return;}
    setSwimmers(s=>s.map(x=>x.id===editingSwimmer?{...x,name:editSwimmerName.trim(),grad_year:Number(editSwimmerGradYear)||null}:x));
    setEditingSwimmer(null); flash("saved");
  };

  const addMeet=async()=>{
    const name=newMeet.name.trim();
    if (!name||meets.some(m=>m.name===name)) return;
    setSaveStatus("saving");
    const {data,error}=await supabase.from("meets").insert({name,season:newMeet.season.trim(),date:newMeet.date||null}).select().single();
    if (error){flash("error");return;}
    setMeets(m=>[...m,data]); setNewMeet({name:"",season:"",date:""}); setShowAddMeet(false); flash("saved");
  };

  const saveMeetEdit=async()=>{
    const newName=editMeetName.trim(); if (!newName) return;
    const meet=meets.find(m=>m.id===editingMeet);
    const oldName=meet.name;
    setSaveStatus("saving");
    const {error}=await supabase.from("meets").update({name:newName,season:editMeetSeason.trim(),date:editMeetDate||null}).eq("id",editingMeet);
    if (error){flash("error");return;}
    setMeets(m=>m.map(x=>x.id===editingMeet?{...x,name:newName,season:editMeetSeason.trim(),date:editMeetDate||null}:x));
    if (oldName!==newName){
      await supabase.from("times").update({meet:newName}).eq("meet",oldName);
      setTimes(t=>t.map(x=>x.meet===oldName?{...x,meet:newName}:x));
    }
    if (editMeetDate){
      await supabase.from("times").update({date:editMeetDate}).eq("meet",newName);
      setTimes(t=>t.map(x=>x.meet===newName?{...x,date:editMeetDate}:x));
    }
    setEditingMeet(null); flash("saved");
  };

  const addEvent=async()=>{
    const name=newEvent.trim(); if (!name||events.includes(name)) return;
    setSaveStatus("saving");
    const {error}=await supabase.from("events").insert({name});
    if (error){flash("error");return;}
    setEvents(e=>[...e,name]); setNewEvent(""); setShowAddEvent(false); flash("saved");
  };

  const removeEvent=async(ev)=>{
    await supabase.from("events").delete().eq("name",ev);
    await supabase.from("cuts").delete().eq("event",ev);
    setEvents(e=>e.filter(x=>x!==ev));
    setCuts(c=>c.filter(x=>x.event!==ev));
    setShowConfirmDelete(null);
    if (leaderboardEvent===ev) setLeaderboardEvent(events.filter(x=>x!==ev)[0]||"");
  };

  const saveCut=async(evName)=>{
    const A=parseTime(editCutA),B=parseTime(editCutB);
    setSaveStatus("saving");
    const existing=cuts.find(c=>c.event===evName);
    if (!A&&!B){
      if (existing) await supabase.from("cuts").delete().eq("event",evName);
      setCuts(c=>c.filter(x=>x.event!==evName));
    } else if (existing){
      await supabase.from("cuts").update({cut_a:A||null,cut_b:B||null}).eq("event",evName);
      setCuts(c=>c.map(x=>x.event===evName?{...x,cut_a:A||null,cut_b:B||null}:x));
    } else {
      const {data}=await supabase.from("cuts").insert({event:evName,cut_a:A||null,cut_b:B||null}).select().single();
      setCuts(c=>[...c,data]);
    }
    setShowEditCut(null); flash("saved");
  };

  const removeCut=async(evName)=>{
    await supabase.from("cuts").delete().eq("event",evName);
    setCuts(c=>c.filter(x=>x.event!==evName));
    setShowConfirmDelete(null);
  };

  const toggleSeason=s=>setCollapsedSeasons(c=>({...c,[s]:!c[s]}));

  // ── ENTER RESULTS ──
  const initResultsGrid=(meetName)=>{
    const grid={};
    MEET_EVENT_ORDER.forEach(ev=>{
      grid[ev]=[{swimmerName:"",time:""},{swimmerName:"",time:""},{swimmerName:"",time:""},{swimmerName:"",time:""}];
    });
    const rGrid={};
    const rTotals={};
    RELAY_EVENTS.forEach(relay=>{
      rGrid[relay]=RELAY_LEGS[relay].map(()=>({swimmerName:"",time:""}));
      rTotals[relay]="";
    });
    setResultsGrid(grid);
    setRelayGrid(rGrid);
    setRelayTotals(rTotals);
    setSwimmerSearch({});
    setSwimmerDropdown({});
  };

  const updateResultsCell=(event,rowIdx,field,value)=>{
    setResultsGrid(g=>({...g,[event]:g[event].map((r,i)=>i===rowIdx?{...r,[field]:value}:r)}));
  };

  const updateRelayCell=(relay,rowIdx,field,value)=>{
    setRelayGrid(g=>({...g,[relay]:g[relay].map((r,i)=>i===rowIdx?{...r,[field]:value}:r)}));
  };

  const addRowToEvent=(event)=>{
    setResultsGrid(g=>({...g,[event]:[...g[event],{swimmerName:"",time:""}]}));
  };

  const matchSwimmer=(name)=>{
    if (!name.trim()) return null;
    return swimmers.find(s=>s.name.toLowerCase()===name.toLowerCase().trim())||null;
  };

  const prepareSaveData=()=>{
    const meet=meets.find(m=>m.name===resultsMeet);
    if (!meet) return {timesToSave:[],relayTimesToSave:[],relayResultsToSave:[]};
    const date=meet.date||"";
    const timesToSave=[];
    const relayTimesToSave=[];
    const relayResultsToSave=[];

    // Individual events
    MEET_EVENT_ORDER.forEach(event=>{
      (resultsGrid[event]||[]).forEach(row=>{
        const sw=matchSwimmer(row.swimmerName);
        const t=parseTime(row.time);
        if (sw&&t) timesToSave.push({swimmer_id:sw.id,event,time:t,meet:resultsMeet,date});
      });
    });

    // Relays
    RELAY_EVENTS.forEach(relay=>{
      const legs=RELAY_LEGS[relay];
      (relayGrid[relay]||[]).forEach((row,i)=>{
        const sw=matchSwimmer(row.swimmerName);
        const t=parseTime(row.time);
        if (sw&&t) relayTimesToSave.push({swimmer_id:sw.id,event:legs[i].event,time:t,meet:resultsMeet,date});
      });
      const total=parseTime(relayTotals[relay]);
      if (total) relayResultsToSave.push({meet:resultsMeet,relay,total_time:total,date});
    });

    return {timesToSave,relayTimesToSave,relayResultsToSave};
  };

  const handleSaveMeetResults=()=>{
    if (!resultsMeet) return;
    const {timesToSave,relayTimesToSave,relayResultsToSave}=prepareSaveData();
    const allTimes=[...timesToSave,...relayTimesToSave];
    if (!allTimes.length&&!relayResultsToSave.length) return;

    // Check conflicts
    const conflicts=[];
    allTimes.forEach(t=>{
      const existing=times.find(x=>x.swimmer_id===t.swimmer_id&&x.event===t.event&&x.meet===t.meet);
      if (existing){
        const sw=swimmers.find(s=>s.id===t.swimmer_id);
        conflicts.push({swimmerName:sw?.name,event:t.event,oldTime:existing.time,newTime:t.time,existingId:existing.id});
      }
    });

    if (conflicts.length>0){
      setShowConflicts(conflicts);
      setPendingSave({allTimes,relayResultsToSave});
    } else {
      executeSave(allTimes,relayResultsToSave,false);
    }
  };

  const executeSave=async(allTimes,relayResultsToSave,overwrite)=>{
    setSaveStatus("saving");
    setShowConflicts(null);
    const toInsert=overwrite?allTimes:allTimes.filter(t=>!times.find(x=>x.swimmer_id===t.swimmer_id&&x.event===t.event&&x.meet===t.meet));
    const toUpdate=overwrite?allTimes.filter(t=>times.find(x=>x.swimmer_id===t.swimmer_id&&x.event===t.event&&x.meet===t.meet)):[];
    const toInsertClean=toInsert.filter(t=>!times.find(x=>x.swimmer_id===t.swimmer_id&&x.event===t.event&&x.meet===t.meet));

    if (toInsertClean.length){
      const {data}=await supabase.from("times").insert(toInsertClean).select();
      if (data) setTimes(t=>[...t,...data]);
    }
    for (const t of toUpdate){
      const existing=times.find(x=>x.swimmer_id===t.swimmer_id&&x.event===t.event&&x.meet===t.meet);
      if (existing){
        const {data}=await supabase.from("times").update({time:t.time}).eq("id",existing.id).select().single();
        if (data) setTimes(ts=>ts.map(x=>x.id===existing.id?data:x));
      }
    }
    for (const rr of relayResultsToSave){
      await supabase.from("relay_results").insert(rr);
    }
    setRelayResults(r=>[...r,...relayResultsToSave]);
    setPendingSave(null);
    initResultsGrid(resultsMeet);
    flash("saved");
  };

  // ── STYLES ──
  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&display=swap');
    * { box-sizing:border-box; margin:0; padding:0; }
    body { background:#080d1a; }
    ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#0d1526} ::-webkit-scrollbar-thumb{background:#1e3a5f;border-radius:3px}
    input,select{outline:none} input::placeholder{color:#3a5a7a}
    .meet-row:hover{border-color:#1e4070 !important;}
    .swimmer-card:hover{border-color:#1e4070 !important;transform:translateY(-1px);}
    .swimmer-card{transition:border-color 0.2s,transform 0.15s;}
    .suggestion-item:hover{background:#1a3050 !important;}
    @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
  `;
  const bg="#080d1a",card="#0d1a2e",border="#1a3050",accent="#00b4ff",gold="#FFD700",text="#e0eaf8",muted="#4a7090",danger="#ff4d4d";
  const inputStyle={background:"#0a1520",border:`1px solid ${border}`,borderRadius:8,color:text,padding:"10px 14px",fontSize:14,fontFamily:"Barlow, sans-serif",width:"100%"};
  const inputSmall={...inputStyle,padding:"7px 10px",fontSize:13};
  const btnPrimary={background:`linear-gradient(135deg,${accent},#0077cc)`,border:"none",borderRadius:8,color:"#fff",padding:"10px 22px",fontFamily:"Barlow Condensed, sans-serif",fontSize:15,fontWeight:700,letterSpacing:1,cursor:"pointer",boxShadow:"0 0 20px rgba(0,180,255,0.3)"};
  const btnSecondary={background:"transparent",border:`1px solid ${border}`,borderRadius:8,color:muted,padding:"10px 22px",fontFamily:"Barlow Condensed, sans-serif",fontSize:15,cursor:"pointer"};
  const btnDanger={background:"transparent",border:`1px solid ${danger}44`,borderRadius:8,color:danger,padding:"7px 14px",fontFamily:"Barlow Condensed, sans-serif",fontSize:13,cursor:"pointer"};
  const modalBox={background:card,border:`1px solid ${border}`,borderRadius:16,padding:28,width:440,maxWidth:"95vw",boxShadow:"0 24px 60px rgba(0,0,0,0.6)",animation:"fadeIn 0.2s ease"};
  const overlay={position:"fixed" as const,inset:0,background:"rgba(0,0,0,0.75)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100};
  const tabDefs=[
    {id:"dashboard",label:"Dashboard"},{id:"swimmers",label:"Swimmers"},
    {id:"meets",label:"Meets"},{id:"results",label:"Enter Results"},
    {id:"leaderboard",label:"Leaderboard"},{id:"cuts",label:"Qualifying Cuts"},
    {id:"settings",label:"⚙ Settings"}
  ];

  if (!loaded) return (
    <><style>{css}</style>
    <div style={{background:bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}>
      <div style={{width:40,height:40,border:`3px solid ${border}`,borderTop:`3px solid ${accent}`,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}/>
      <div style={{color:muted,fontFamily:"Barlow Condensed, sans-serif",fontSize:16,letterSpacing:2}}>LOADING DATA…</div>
    </div></>
  );

  // ── DASHBOARD ──
  const renderDashboard=()=>{
    const totalACuts=Object.entries(pbMap).filter(([k,t])=>{const ev=k.split(/-(.+)/)[1];const c=cuts.find(x=>x.event===ev);return c&&c.cut_a&&t<=c.cut_a}).length;
    const totalBCuts=Object.entries(pbMap).filter(([k,t])=>{const ev=k.split(/-(.+)/)[1];const c=cuts.find(x=>x.event===ev);return c&&c.cut_b&&t<=c.cut_b&&(!c.cut_a||t>c.cut_a)}).length;
    const recentTimes=[...times].sort((a,b)=>(meetDateMap[b.meet]||b.date||"").localeCompare(meetDateMap[a.meet]||a.date||"")).slice(0,8);
    return (
      <div style={{display:"flex",flexDirection:"column",gap:24}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
          {[{label:"Swimmers",value:swimmers.length,color:accent},{label:"Times Logged",value:times.length,color:"#a78bfa"},{label:"A Cuts",value:totalACuts,color:gold},{label:"B Cuts",value:totalBCuts,color:"#C0C0C0"}].map(stat=>(
            <div key={stat.label} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"20px 24px"}}>
              <div style={{fontSize:36,fontFamily:"Barlow Condensed, sans-serif",fontWeight:900,color:stat.color,lineHeight:1}}>{stat.value}</div>
              <div style={{color:muted,fontSize:13,marginTop:6,textTransform:"uppercase",letterSpacing:0.5}}>{stat.label}</div>
            </div>
          ))}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700,color:text,letterSpacing:1}}>RECENT TIMES</h3>
              <button style={{...btnPrimary,padding:"7px 16px",fontSize:13}} onClick={()=>setShowAddTime(true)}>+ LOG TIME</button>
            </div>
            {recentTimes.map(t=>{
              const sw=swimmers.find(s=>s.id===t.swimmer_id);const isPB=pbMap[`${t.swimmer_id}-${t.event}`]===t.time;
              return (<div key={t.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                <div><div style={{color:text,fontSize:14,fontWeight:600}}>{sw?.name}</div><div style={{color:muted,fontSize:12}}>{t.event} · {t.meet}</div></div>
                <div style={{textAlign:"right"}}>
                  <div style={{color:isPB?gold:text,fontSize:16,fontFamily:"Barlow Condensed, sans-serif",fontWeight:700}}>{formatTime(t.time)}{isPB&&<span style={{fontSize:11,marginLeft:4}}>PB</span>}</div>
                  <CutBadge cuts={cuts} event={t.event} time={t.time}/>
                </div>
              </div>);
            })}
          </div>
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24}}>
            <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700,color:text,letterSpacing:1,marginBottom:18}}>TEAM CUTS STATUS</h3>
            {swimmers.map(sw=>{
              const aCuts=cuts.filter(c=>c.cut_a&&pbMap[`${sw.id}-${c.event}`]&&pbMap[`${sw.id}-${c.event}`]<=c.cut_a).length;
              const bCuts=cuts.filter(c=>c.cut_b&&pbMap[`${sw.id}-${c.event}`]&&pbMap[`${sw.id}-${c.event}`]<=c.cut_b&&(!c.cut_a||pbMap[`${sw.id}-${c.event}`]>c.cut_a)).length;
              return (<div key={sw.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${border}`}}>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <div style={{color:text,fontSize:14,fontWeight:600}}>{sw.name}</div>
                  <YearBadge gradYear={sw.grad_year}/>
                </div>
                <div style={{display:"flex",gap:8}}>
                  {aCuts>0&&<span style={{background:gold,color:"#1a1a2e",padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:700}}>{aCuts}×A</span>}
                  {bCuts>0&&<span style={{background:"#C0C0C0",color:"#1a1a2e",padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:700}}>{bCuts}×B</span>}
                  {aCuts===0&&bCuts===0&&<span style={{color:muted,fontSize:12}}>No cuts yet</span>}
                </div>
              </div>);
            })}
          </div>
        </div>
      </div>
    );
  };

  // ── ENTER RESULTS ──
  const renderResults=()=>(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>ENTER MEET RESULTS</h2>
      </div>

      {/* Meet selector */}
      <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:20,marginBottom:24}}>
        <label style={{color:muted,fontSize:12,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:8}}>Select Meet</label>
        <div style={{display:"flex",gap:12,alignItems:"center"}}>
          <select style={{...inputStyle,maxWidth:320}} value={resultsMeet} onChange={e=>{setResultsMeet(e.target.value);initResultsGrid(e.target.value);}}>
            <option value="">— Choose a meet —</option>
            {[...meets].sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(m=>(
              <option key={m.id} value={m.name}>{m.name}{m.date?` (${formatDisplayDate(m.date)})`:""}</option>
            ))}
          </select>
          {resultsMeet&&<div style={{color:muted,fontSize:13}}>Date will be inherited from meet</div>}
        </div>
      </div>

      {!resultsMeet&&<div style={{color:muted,textAlign:"center",padding:60,fontSize:16}}>Select a meet above to begin entering results.</div>}

      {resultsMeet&&(
        <>
          {FULL_MEET_ORDER.map((item,sectionIdx)=>{
            if (item.type==="relay") {
              const relay=item.name;
              const legs=RELAY_LEGS[relay];
              return (
                <div key={relay} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:22,marginBottom:16}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                    <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700,color:accent,letterSpacing:1}}>{relay.toUpperCase()}</h3>
                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                      <span style={{color:muted,fontSize:12}}>Total time:</span>
                      <input style={{...inputSmall,width:120}} placeholder="e.g. 1:42.50"
                        value={relayTotals[relay]||""}
                        onChange={e=>setRelayTotals(r=>({...r,[relay]:e.target.value}))}/>
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {(relayGrid[relay]||[]).map((row,rowIdx)=>(
                      <div key={rowIdx} style={{display:"flex",gap:10,alignItems:"center"}}>
                        <div style={{width:60,color:accent,fontSize:12,fontWeight:700,fontFamily:"Barlow Condensed, sans-serif",letterSpacing:0.5,flexShrink:0}}>{legs[rowIdx]?.label||`Leg ${rowIdx+1}`}</div>
                        <SwimmerInput
                          cellKey={`relay-${relay}-${rowIdx}`}
                          value={row.swimmerName}
                          onChange={v=>updateRelayCell(relay,rowIdx,"swimmerName",v)}
                          onSelectSuggestion={v=>updateRelayCell(relay,rowIdx,"swimmerName",v)}
                          swimmers={swimmers}
                          swimmerDropdown={swimmerDropdown}
                          setSwimmerDropdown={setSwimmerDropdown}
                        />
                        <input style={{...inputSmall,width:110,flexShrink:0}} placeholder="Split time"
                          value={row.time}
                          onChange={e=>updateRelayCell(relay,rowIdx,"time",e.target.value)}/>
                        {row.swimmerName&&!matchSwimmer(row.swimmerName)&&(
                          <span style={{color:danger,fontSize:11,flexShrink:0}}>No match</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            // Individual event
            const event=item.name;
            return (
              <div key={event} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:22,marginBottom:16}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700,color:text,letterSpacing:1}}>{event.toUpperCase()}</h3>
                  <button onClick={()=>addRowToEvent(event)}
                    style={{background:"transparent",border:`1px solid ${border}`,borderRadius:7,color:muted,padding:"4px 12px",fontSize:12,fontFamily:"Barlow Condensed, sans-serif",cursor:"pointer"}}>
                    + Add Row
                  </button>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {(resultsGrid[event]||[]).map((row,rowIdx)=>(
                    <div key={rowIdx} style={{display:"flex",gap:10,alignItems:"center"}}>
                      <div style={{width:24,color:muted,fontSize:12,textAlign:"center",flexShrink:0}}>{rowIdx+1}</div>
                      <SwimmerInput
                        cellKey={`${event}-${rowIdx}`}
                        value={row.swimmerName}
                        onChange={v=>updateResultsCell(event,rowIdx,"swimmerName",v)}
                        onSelectSuggestion={v=>updateResultsCell(event,rowIdx,"swimmerName",v)}
                        swimmers={swimmers}
                        swimmerDropdown={swimmerDropdown}
                        setSwimmerDropdown={setSwimmerDropdown}
                      />
                      <input style={{...inputSmall,width:120,flexShrink:0}} placeholder="Time"
                        value={row.time}
                        onChange={e=>updateResultsCell(event,rowIdx,"time",e.target.value)}/>
                      {row.swimmerName&&!matchSwimmer(row.swimmerName)&&(
                        <span style={{color:danger,fontSize:11,flexShrink:0}}>No match</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{display:"flex",justifyContent:"flex-end",marginTop:8,marginBottom:40}}>
            <button style={{...btnPrimary,fontSize:17,padding:"14px 36px"}} onClick={handleSaveMeetResults}>
              Save Meet Results
            </button>
          </div>
        </>
      )}

      {/* Conflict dialog */}
      {showConflicts&&(
        <div style={overlay}>
          <div style={{...modalBox,width:520,maxHeight:"80vh",overflowY:"auto"}}>
            <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:8}}>EXISTING TIMES FOUND</h3>
            <p style={{color:muted,fontSize:13,marginBottom:20}}>The following swimmers already have a time for this meet. Do you want to overwrite them?</p>
            <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:20}}>
              {showConflicts.map((c,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"#0a1520",borderRadius:8}}>
                  <div>
                    <span style={{color:text,fontWeight:600,fontSize:14}}>{c.swimmerName}</span>
                    <span style={{color:muted,fontSize:12,marginLeft:8}}>{c.event}</span>
                  </div>
                  <div style={{display:"flex",gap:10,alignItems:"center",fontSize:13}}>
                    <span style={{color:muted}}>{formatTime(c.oldTime)}</span>
                    <span style={{color:muted}}>→</span>
                    <span style={{color:accent,fontWeight:700}}>{formatTime(c.newTime)}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button style={btnPrimary} onClick={()=>executeSave(pendingSave.allTimes,pendingSave.relayResultsToSave,true)}>
                Overwrite All
              </button>
              <button style={{...btnSecondary}} onClick={()=>executeSave(pendingSave.allTimes,pendingSave.relayResultsToSave,false)}>
                Skip Conflicts
              </button>
              <button style={btnSecondary} onClick={()=>{setShowConflicts(null);setPendingSave(null);}}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── SWIMMERS ──
  const renderSwimmers=()=>{
    if (selectedSwimmer){
      const sw=swimmers.find(s=>s.id===selectedSwimmer);
      const swTimes=swimmerTimesSorted(selectedSwimmer);
      // Group: individual events, then relay splits grouped with base event
      const individualEventNames=[...new Set(swTimes.filter(t=>!isRelaySplit(t.event)).map(t=>t.event))];
      const relaySplitNames=[...new Set(swTimes.filter(t=>isRelaySplit(t.event)).map(t=>t.event))];

      // Build event groups: base event + its relay splits
      const eventGroups=individualEventNames.map(ev=>{
        const variants=(RELAY_SPLIT_VARIANTS[ev]||[]).filter(v=>swTimes.some(t=>t.event===v));
        return {baseEvent:ev,relayVariants:variants};
      });
      // Add relay splits that don't have a matching individual event (e.g. 100 Free (FR) if no 100 Free swum)
      const coveredRelayEvents=eventGroups.flatMap(g=>g.relayVariants);
      const uncoveredRelays=relaySplitNames.filter(r=>!coveredRelayEvents.includes(r));
      if (uncoveredRelays.length) eventGroups.push({baseEvent:null,relayVariants:uncoveredRelays});

      const allChartEvents=[...individualEventNames,...relaySplitNames];
      const activeChartEvent=chartEvent&&allChartEvents.includes(chartEvent)?chartEvent:individualEventNames[0]||"";
      const chartTimes=swTimes.filter(t=>t.event===activeChartEvent);
      const chartData=chartTimes.map(t=>({meet:t.meet,time:t.time}));

      const isEditing=editingSwimmer===sw.id;
      return (<div style={{animation:"fadeIn 0.2s ease"}}>
        <button style={{...btnSecondary,marginBottom:20}} onClick={()=>setSelectedSwimmer(null)}>← Back to Roster</button>
        <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:28,marginBottom:24}}>
          {isEditing?(
            <div style={{display:"flex",gap:12,flexWrap:"wrap",alignItems:"flex-end"}}>
              <div style={{flex:"2 1 200px"}}>
                <label style={{color:muted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:6}}>Name</label>
                <input style={inputStyle} value={editSwimmerName} onChange={e=>setEditSwimmerName(e.target.value)} autoFocus/>
              </div>
              <div style={{flex:"1 1 120px"}}>
                <label style={{color:muted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:6}}>Graduation Year</label>
                <input style={inputStyle} placeholder="e.g. 2027" value={editSwimmerGradYear} onChange={e=>setEditSwimmerGradYear(e.target.value)} type="number"/>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button style={{...btnPrimary,padding:"10px 18px"}} onClick={saveSwimmerEdit}>Save</button>
                <button style={{...btnSecondary,padding:"10px 14px"}} onClick={()=>setEditingSwimmer(null)}>Cancel</button>
              </div>
            </div>
          ):(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
                  <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:32,fontWeight:900,color:text}}>{sw?.name}</h2>
                  <YearBadge gradYear={sw?.grad_year} style={{fontSize:14,padding:"3px 12px"}}/>
                </div>
                <div style={{color:muted,fontSize:13}}>Class of {sw?.grad_year} · {swTimes.length} times logged</div>
              </div>
              <div style={{display:"flex",gap:10}}>
                <button style={{...btnSecondary,padding:"8px 16px",fontSize:13}} onClick={()=>{setEditingSwimmer(sw.id);setEditSwimmerName(sw.name);setEditSwimmerGradYear(sw.grad_year||"");}}>✎ Edit</button>
                <button style={{...btnPrimary,padding:"8px 16px",fontSize:13}} onClick={()=>{setNewTime(t=>({...t,swimmer_id:selectedSwimmer}));setShowAddTime(true);}}>+ LOG TIME</button>
              </div>
            </div>
          )}
        </div>

        {/* Progress chart */}
        {allChartEvents.length>0&&(
          <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24,marginBottom:24}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
              <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:20,fontWeight:700,color:text}}>PROGRESS CHART</h3>
              <select value={activeChartEvent} onChange={e=>setChartEvent(e.target.value)} style={{...inputStyle,width:220}}>
                {individualEventNames.map(ev=><option key={ev} value={ev}>{ev}</option>)}
                {relaySplitNames.length>0&&<optgroup label="Relay Splits">
                  {relaySplitNames.map(ev=><option key={ev} value={ev}>{ev}</option>)}
                </optgroup>}
              </select>
            </div>
            {chartData.length<2?(
              <div style={{color:muted,fontSize:13,textAlign:"center",padding:24}}>Need at least 2 times to show a chart.</div>
            ):(
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData} margin={{top:5,right:20,left:10,bottom:5}}>
                  <CartesianGrid strokeDasharray="3 3" stroke={border}/>
                  <XAxis dataKey="meet" tick={{fill:muted,fontSize:12}} axisLine={{stroke:border}} tickLine={false}/>
                  <YAxis tick={{fill:muted,fontSize:12}} axisLine={{stroke:border}} tickLine={false}
                    tickFormatter={v=>formatTime(v)} domain={["dataMin - 2","dataMax + 2"]} reversed={true}/>
                  <Tooltip contentStyle={{background:card,border:`1px solid ${border}`,borderRadius:8}}
                    labelStyle={{color:accent,fontWeight:700,marginBottom:4}}
                    formatter={(v)=>[formatTime(v),"Time"]}/>
                  <Line type="monotone" dataKey="time" stroke={accent} strokeWidth={2.5}
                    dot={{fill:accent,r:5,strokeWidth:0}} activeDot={{r:7,fill:gold}}/>
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Individual events + grouped relay splits */}
        {eventGroups.map((group,gi)=>{
          const allGroupEvents=group.baseEvent?[group.baseEvent,...group.relayVariants]:group.relayVariants;
          const groupTimes=swTimes.filter(t=>allGroupEvents.includes(t.event));
          const indivTimes=group.baseEvent?swTimes.filter(t=>t.event===group.baseEvent):[];
          const pb=indivTimes.length?Math.min(...indivTimes.map(t=>t.time)):null;
          const sectionTitle=group.baseEvent||group.relayVariants[0];
          return (
            <div key={gi} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24,marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:20,fontWeight:700,color:text}}>{sectionTitle}</h3>
                {pb!==null&&(
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <span style={{color:muted,fontSize:13}}>PB:</span>
                    <span style={{color:gold,fontSize:20,fontFamily:"Barlow Condensed, sans-serif",fontWeight:700}}>{formatTime(pb)}</span>
                    <CutBadge cuts={cuts} event={group.baseEvent} time={pb}/>
                  </div>
                )}
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:6}}>
                {groupTimes.map((t,i,arr)=>{
                  const sameEventPrev=arr.slice(0,i).filter(x=>x.event===t.event);
                  const prev=sameEventPrev[sameEventPrev.length-1];
                  const delta=prev?t.time-prev.time:null;
                  const isRelay=isRelaySplit(t.event);
                  const isPB=!isRelay&&t.time===pb;
                  return (
                    <div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"#0a1520",borderRadius:8,border:isPB?`1px solid ${gold}44`:"1px solid transparent"}}>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <span style={{color:muted,fontSize:12,minWidth:70}}>{formatDisplayDate(meetDateMap[t.meet])}</span>
                        <span style={{color:muted,fontSize:12}}>{t.meet}</span>
                        {isRelay&&<span style={{background:`${accent}22`,color:accent,fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99,border:`1px solid ${accent}44`}}>{t.event.match(/\((.+)\)/)?.[1]}</span>}
                      </div>
                      <div style={{display:"flex",gap:12,alignItems:"center"}}>
                        {delta!==null&&<ImprovementArrow delta={delta}/>}
                        {isPB&&<span style={{color:gold,fontSize:10,fontWeight:700,letterSpacing:1}}>PB</span>}
                        {!isRelay&&<CutBadge cuts={cuts} event={t.event} time={t.time}/>}
                        <span style={{color:isPB?gold:isRelay?accent:text,fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700}}>{formatTime(t.time)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        {eventGroups.length===0&&<div style={{color:muted,textAlign:"center",padding:40}}>No times logged yet.</div>}
      </div>);
    }

    // Roster
    const eventsWithTimes=events.filter(ev=>times.some(t=>t.event===ev));
    let filtered=[...swimmers];
    if (rosterYearFilter!=="ALL") filtered=filtered.filter(sw=>gradYearToLabel(sw.grad_year)===rosterYearFilter);
    if (rosterEventFilter) filtered=filtered.filter(sw=>times.some(t=>t.swimmer_id===sw.id&&t.event===rosterEventFilter));
    if (rosterSort==="cuts") {
      filtered.sort((a,b)=>{
        const aC=cuts.filter(c=>{const pb=pbMap[`${a.id}-${c.event}`];return pb&&((c.cut_a&&pb<=c.cut_a)||(c.cut_b&&pb<=c.cut_b))}).length;
        const bC=cuts.filter(c=>{const pb=pbMap[`${b.id}-${c.event}`];return pb&&((c.cut_a&&pb<=c.cut_a)||(c.cut_b&&pb<=c.cut_b))}).length;
        return bC-aC;
      });
    } else {
      filtered.sort((a,b)=>a.name.localeCompare(b.name));
    }

    return (<div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>ROSTER ({filtered.length})</h2>
        <button style={btnPrimary} onClick={()=>setShowAddSwimmer(true)}>+ ADD SWIMMER</button>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20,alignItems:"center"}}>
        <div style={{display:"flex",gap:4}}>
          {["ALL","FR","SO","JR","SR"].map(yr=>(
            <button key={yr} onClick={()=>setRosterYearFilter(yr)}
              style={{background:rosterYearFilter===yr?`${accent}22`:"transparent",border:`1px solid ${rosterYearFilter===yr?accent:border}`,borderRadius:7,color:rosterYearFilter===yr?accent:muted,padding:"6px 14px",fontFamily:"Barlow Condensed, sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>
              {yr}
            </button>
          ))}
        </div>
        <select value={rosterEventFilter} onChange={e=>setRosterEventFilter(e.target.value)} style={{...inputStyle,width:180,padding:"6px 12px",fontSize:13}}>
          <option value="">All Events</option>
          {eventsWithTimes.map(ev=><option key={ev} value={ev}>{ev}</option>)}
        </select>
        <select value={rosterSort} onChange={e=>setRosterSort(e.target.value)} style={{...inputStyle,width:160,padding:"6px 12px",fontSize:13}}>
          <option value="cuts">Sort: Top Cuts</option>
          <option value="name">Sort: Name A–Z</option>
        </select>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
        {filtered.map(sw=>{
          const swTimes=times.filter(t=>t.swimmer_id===sw.id);
          const pbs=[...new Set(swTimes.map(t=>t.event))].length;
          const swCuts=cuts.filter(c=>{const pb=pbMap[`${sw.id}-${c.event}`];return pb&&((c.cut_a&&pb<=c.cut_a)||(c.cut_b&&pb<=c.cut_b))}).length;
          return (<div key={sw.id} className="swimmer-card" onClick={()=>setSelectedSwimmer(sw.id)}
            style={{background:card,border:`1px solid ${border}`,borderLeft:`3px solid ${accent}`,borderRadius:14,padding:22,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
              <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text}}>{sw.name}</div>
              <YearBadge gradYear={sw.grad_year}/>
            </div>
            <div style={{color:muted,fontSize:12,marginBottom:14}}>Class of {sw.grad_year}</div>
            <div style={{display:"flex",gap:16}}>
              {[{v:swTimes.length,l:"Times",c:accent},{v:pbs,l:"Events",c:accent},{v:swCuts,l:"Cuts",c:gold}].map(s=>(
                <div key={s.l}><div style={{color:s.c,fontSize:20,fontFamily:"Barlow Condensed, sans-serif",fontWeight:700}}>{s.v}</div><div style={{color:muted,fontSize:11,textTransform:"uppercase"}}>{s.l}</div></div>
              ))}
            </div>
          </div>);
        })}
        {filtered.length===0&&<div style={{color:muted,padding:40,gridColumn:"1/-1",textAlign:"center"}}>No swimmers match the current filters.</div>}
      </div>
    </div>);
  };

  // ── MEETS ──
  const MeetCard=({meet})=>{
    const mt=times.filter(t=>t.meet===meet.name);
    const uniq=[...new Set(mt.map(t=>t.swimmer_id))].length;
    const pbs=mt.filter(t=>pbMap[`${t.swimmer_id}-${t.event}`]===t.time).length;
    const isEditing=editingMeet===meet.id;
    if (isEditing){
      const allSeasons=[...new Set(meets.map(m=>m.season).filter(Boolean))];
      return (
        <div style={{background:card,border:`2px solid ${accent}55`,borderRadius:14,padding:20,marginBottom:12,animation:"fadeIn 0.15s ease"}}>
          <div style={{display:"flex",gap:10,alignItems:"flex-start",flexWrap:"wrap"}}>
            <div style={{flex:"2 1 160px"}}>
              <label style={{color:muted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5}}>Meet Name</label>
              <input style={inputSmall} value={editMeetName} onChange={e=>setEditMeetName(e.target.value)} autoFocus
                onKeyDown={e=>{if(e.key==="Enter")saveMeetEdit();if(e.key==="Escape")setEditingMeet(null);}}/>
            </div>
            <div style={{flex:"1 1 120px"}}>
              <label style={{color:muted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5}}>Date</label>
              <input style={inputSmall} type="date" value={editMeetDate} onChange={e=>setEditMeetDate(e.target.value)}/>
            </div>
            <div style={{flex:"1 1 120px"}}>
              <label style={{color:muted,fontSize:11,textTransform:"uppercase",letterSpacing:0.5,display:"block",marginBottom:5}}>Season</label>
              <input style={inputSmall} list="seasons-list" value={editMeetSeason} placeholder="e.g. 2024-25" onChange={e=>setEditMeetSeason(e.target.value)}/>
              <datalist id="seasons-list">{allSeasons.map(s=><option key={s} value={s}/>)}</datalist>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"flex-end",marginTop:"auto",paddingTop:20}}>
              <button style={{...btnPrimary,padding:"7px 16px",fontSize:13}} onClick={saveMeetEdit}>Save</button>
              <button style={{...btnSecondary,padding:"7px 14px",fontSize:13}} onClick={()=>setEditingMeet(null)}>Cancel</button>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="meet-row" style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:"18px 22px",marginBottom:12,transition:"border-color 0.2s"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:mt.length>0?14:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:20,fontWeight:800,color:text}}>{meet.name}</h3>
            {meet.date&&<span style={{color:muted,fontSize:12}}>{formatDisplayDate(meet.date)}</span>}
            {meet.season&&<span style={{background:"#0f2040",border:`1px solid ${border}`,color:accent,fontSize:11,fontWeight:700,padding:"2px 10px",borderRadius:99}}>{meet.season}</span>}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:20}}>
            <div style={{display:"flex",gap:16}}>
              {[{v:uniq,l:"Swimmers",c:accent},{v:mt.length,l:"Swims",c:accent},{v:pbs,l:"PBs",c:gold}].map(s=>(
                <div key={s.l} style={{textAlign:"center"}}>
                  <div style={{color:s.c,fontSize:20,fontFamily:"Barlow Condensed, sans-serif",fontWeight:700}}>{s.v}</div>
                  <div style={{color:muted,fontSize:10,textTransform:"uppercase"}}>{s.l}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>{setEditingMeet(meet.id);setEditMeetName(meet.name);setEditMeetSeason(meet.season||"");setEditMeetDate(meet.date||"");}}
              style={{background:"transparent",border:`1px solid ${border}`,borderRadius:7,color:muted,width:32,height:32,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>✎</button>
          </div>
        </div>
        {mt.length>0&&(
          <div style={{display:"flex",flexDirection:"column",gap:5}}>
            {mt.slice(0,5).map(t=>{
              const sw=swimmers.find(s=>s.id===t.swimmer_id);const isPB=pbMap[`${t.swimmer_id}-${t.event}`]===t.time;
              return (<div key={t.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"#0a1520",borderRadius:8}}>
                <div style={{display:"flex",gap:10,alignItems:"center"}}><span style={{color:text,fontWeight:600,fontSize:13}}>{sw?.name}</span><span style={{color:muted,fontSize:12}}>{t.event}</span></div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}>
                  {isPB&&<span style={{color:gold,fontSize:10,fontWeight:700}}>PB</span>}
                  <CutBadge cuts={cuts} event={t.event} time={t.time}/>
                  <span style={{color:isPB?gold:text,fontFamily:"Barlow Condensed, sans-serif",fontSize:16,fontWeight:700}}>{formatTime(t.time)}</span>
                </div>
              </div>);
            })}
            {mt.length>5&&<div style={{color:muted,fontSize:12,textAlign:"center",padding:"4px 0"}}>+{mt.length-5} more swims</div>}
          </div>
        )}
      </div>
    );
  };

  const renderMeets=()=>{
    const unassigned=meetsBySeason[""]||[];
    const namedSeasons=seasons.filter(s=>s!=="");
    return (
      <div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>MEETS</h2>
          <div style={{display:"flex",gap:10}}>
            <button style={btnSecondary} onClick={()=>setShowAddMeet(true)}>+ ADD MEET</button>
            <button style={btnPrimary} onClick={()=>setShowAddTime(true)}>+ LOG TIME</button>
          </div>
        </div>
        {namedSeasons.map(season=>{
          const seasonMeets=meetsBySeason[season]||[];
          const collapsed=collapsedSeasons[season];
          const totalSwims=seasonMeets.reduce((acc,m)=>acc+times.filter(t=>t.meet===m.name).length,0);
          return (
            <div key={season} style={{marginBottom:28}}>
              <div onClick={()=>toggleSeason(season)} style={{display:"flex",alignItems:"center",gap:12,cursor:"pointer",marginBottom:12,userSelect:"none"}}>
                <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:accent}}>{collapsed?"▶":"▼"} {season}</div>
                <div style={{flex:1,height:1,background:border}}/>
                <div style={{color:muted,fontSize:12}}>{seasonMeets.length} meet{seasonMeets.length!==1?"s":""} · {totalSwims} swims</div>
              </div>
              {!collapsed&&seasonMeets.map(m=><MeetCard key={m.id} meet={m}/>)}
            </div>
          );
        })}
        {unassigned.length>0&&(
          <div style={{marginBottom:28}}>
            {namedSeasons.length>0&&(
              <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:13,fontWeight:700,letterSpacing:2,textTransform:"uppercase",color:muted}}>NO SEASON</div>
                <div style={{flex:1,height:1,background:border}}/>
              </div>
            )}
            {unassigned.map(m=><MeetCard key={m.id} meet={m}/>)}
          </div>
        )}
        {meets.length===0&&<div style={{color:muted,textAlign:"center",padding:60,fontSize:16}}>No meets yet.</div>}
      </div>
    );
  };

  const renderLeaderboard=()=>(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
        <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>LEADERBOARD</h2>
        <select value={leaderboardEvent} onChange={e=>setLeaderboardEvent(e.target.value)} style={{...inputStyle,width:220}}>
          {events.map(e=><option key={e} value={e}>{e}</option>)}
        </select>
      </div>
      {leaderboard.length===0?<div style={{color:muted,textAlign:"center",padding:60,fontSize:16}}>No times logged for this event.</div>
        :leaderboard.map((entry,i)=>(
          <div key={entry.swimmer.id} style={{background:i===0?`linear-gradient(135deg,#2a1f00,#1a1500)`:card,border:`1px solid ${i===0?gold:border}`,borderRadius:14,padding:"18px 24px",display:"flex",alignItems:"center",gap:20,marginBottom:10}}>
            <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:42,fontWeight:900,color:i===0?gold:i===1?"#C0C0C0":i===2?"#CD7F32":muted,width:50,textAlign:"center",lineHeight:1}}>{i+1}</div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text}}>{entry.swimmer.name}</div>
                <YearBadge gradYear={entry.swimmer.grad_year}/>
              </div>
              <div style={{color:muted,fontSize:13}}>Class of {entry.swimmer.grad_year}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:32,fontWeight:900,color:i===0?gold:text}}>{formatTime(entry.time)}</div>
              <CutBadge cuts={cuts} event={leaderboardEvent} time={entry.time}/>
            </div>
          </div>
        ))}
    </div>
  );

  const renderCuts=()=>(
    <div>
      <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:800,color:text,marginBottom:24}}>QUALIFYING CUTS</h2>
      {cuts.length===0&&<div style={{color:muted,textAlign:"center",padding:60}}>No qualifying cuts set. Add cuts in ⚙ Settings.</div>}
      {cuts.map(c=>{
        const qualifiers=swimmers.map(sw=>{
          const pb=pbMap[`${sw.id}-${c.event}`];if(!pb) return null;
          const level=c.cut_a&&pb<=c.cut_a?"A":c.cut_b&&pb<=c.cut_b?"B":null;
          return level?{swimmer:sw,pb,level}:null;
        }).filter(Boolean).sort((a,b)=>a.pb-b.pb);
        return (<div key={c.event} style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:24,marginBottom:16}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text}}>{c.event}</h3>
            <div style={{display:"flex",gap:16}}>
              {c.cut_a&&<span style={{color:muted,fontSize:13}}>A: <span style={{color:gold,fontWeight:700}}>{formatTime(c.cut_a)}</span></span>}
              {c.cut_b&&<span style={{color:muted,fontSize:13}}>B: <span style={{color:"#C0C0C0",fontWeight:700}}>{formatTime(c.cut_b)}</span></span>}
            </div>
          </div>
          {qualifiers.length===0?<div style={{color:muted,fontSize:14}}>No swimmers have achieved this cut yet.</div>:(
            <div style={{display:"flex",flexWrap:"wrap",gap:10}}>
              {qualifiers.map(q=>(
                <div key={q.swimmer.id} style={{background:"#0a1520",border:`1px solid ${q.level==="A"?gold:"#C0C0C0"}`,borderRadius:10,padding:"10px 16px",display:"flex",alignItems:"center",gap:10}}>
                  <span style={{color:text,fontWeight:600,fontSize:14}}>{q.swimmer.name}</span>
                  <YearBadge gradYear={q.swimmer.grad_year}/>
                  <span style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:18,fontWeight:700,color:q.level==="A"?gold:"#C0C0C0"}}>{formatTime(q.pb)}</span>
                  <span style={{background:q.level==="A"?gold:"#C0C0C0",color:"#1a1a2e",padding:"1px 8px",borderRadius:99,fontSize:11,fontWeight:700}}>{q.level} CUT</span>
                </div>
              ))}
            </div>
          )}
        </div>);
      })}
    </div>
  );

  const renderSettings=()=>(
    <div style={{display:"flex",flexDirection:"column",gap:32}}>
      <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div>
            <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text}}>EVENTS</h2>
            <p style={{color:muted,fontSize:13,marginTop:4}}>Events available for individual time logging.</p>
          </div>
          <button style={{...btnPrimary,padding:"8px 18px",fontSize:13}} onClick={()=>setShowAddEvent(true)}>+ ADD EVENT</button>
        </div>
        <div style={{marginTop:20,display:"flex",flexDirection:"column",gap:6}}>
          {events.map(ev=>{
            const cnt=times.filter(t=>t.event===ev).length;const hasCut=cuts.some(c=>c.event===ev);
            return (<div key={ev} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#0a1520",borderRadius:10,gap:12}}>
              <div style={{flex:1}}>
                <span style={{color:text,fontWeight:600,fontSize:15}}>{ev}</span>
                <span style={{color:muted,fontSize:12,marginLeft:12}}>{cnt} time{cnt!==1?"s":""} logged</span>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                {hasCut?<span style={{background:"#1a3050",color:accent,padding:"2px 10px",borderRadius:99,fontSize:12,fontWeight:600}}>Has cuts</span>:<span style={{color:"#1a3050",fontSize:12}}>No cuts</span>}
                <button style={{background:"transparent",border:`1px solid ${accent}44`,borderRadius:7,color:accent,padding:"5px 12px",fontFamily:"Barlow Condensed, sans-serif",fontSize:12,cursor:"pointer"}}
                  onClick={()=>{setShowEditCut(ev);const c=cuts.find(x=>x.event===ev);setEditCutA(c?.cut_a?formatTime(c.cut_a).replace("s",""):"");setEditCutB(c?.cut_b?formatTime(c.cut_b).replace("s",""):"");}}>
                  {hasCut?"Edit Cut":"Set Cut"}
                </button>
                <button style={btnDanger} onClick={()=>setShowConfirmDelete({type:"event",value:ev})}>Remove</button>
              </div>
            </div>);
          })}
        </div>
      </div>
      <div style={{background:card,border:`1px solid ${border}`,borderRadius:14,padding:28}}>
        <h2 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:4}}>QUALIFYING CUTS</h2>
        <p style={{color:muted,fontSize:13,marginBottom:20}}>A and B standard times.</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {cuts.map(c=>(
            <div key={c.event} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px",background:"#0a1520",borderRadius:10}}>
              <span style={{color:text,fontWeight:600,fontSize:15,flex:1}}>{c.event}</span>
              <div style={{display:"flex",gap:20,alignItems:"center"}}>
                {c.cut_a&&<span style={{color:muted,fontSize:13}}>A: <span style={{color:gold,fontWeight:700,fontFamily:"Barlow Condensed, sans-serif",fontSize:16}}>{formatTime(c.cut_a)}</span></span>}
                {c.cut_b&&<span style={{color:muted,fontSize:13}}>B: <span style={{color:"#C0C0C0",fontWeight:700,fontFamily:"Barlow Condensed, sans-serif",fontSize:16}}>{formatTime(c.cut_b)}</span></span>}
                <button style={{background:"transparent",border:`1px solid ${accent}44`,borderRadius:7,color:accent,padding:"5px 12px",fontFamily:"Barlow Condensed, sans-serif",fontSize:12,cursor:"pointer"}}
                  onClick={()=>{setShowEditCut(c.event);setEditCutA(c.cut_a?formatTime(c.cut_a).replace("s",""):"");setEditCutB(c.cut_b?formatTime(c.cut_b).replace("s",""):"");}}>Edit</button>
                <button style={btnDanger} onClick={()=>setShowConfirmDelete({type:"cut",value:c.event})}>Remove</button>
              </div>
            </div>
          ))}
          {cuts.length===0&&<div style={{color:muted,fontSize:14,textAlign:"center",padding:24}}>No qualifying cuts set. Use "Set Cut" on any event above.</div>}
        </div>
      </div>
    </div>
  );

  const saveColors={saving:accent,saved:"#00e5a0",error:danger};
  const saveLabels={saving:"Saving…",saved:"✓ Saved",error:"Save failed"};

  return (
    <><style>{css}</style>
    <div style={{background:bg,minHeight:"100vh",fontFamily:"Barlow, sans-serif",color:text}}>
      <div style={{background:`linear-gradient(180deg,#0a1830 0%,${bg} 100%)`,borderBottom:`1px solid ${border}`,padding:"0 24px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <div style={{padding:"14px 0"}}>
            <div style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:24,fontWeight:900,color:text,letterSpacing:2,display:"flex",alignItems:"center",gap:8}}>
              <span style={{color:accent}}>⬡</span> AQUA TRACKER
            </div>
            <div style={{color:muted,fontSize:11,letterSpacing:2,textTransform:"uppercase"}}>Peabody Swim Team</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            {saveStatus!=="idle"&&<div style={{fontSize:12,color:saveColors[saveStatus],fontFamily:"Barlow, sans-serif"}}>{saveLabels[saveStatus]}</div>}
            <div style={{display:"flex",gap:2,flexWrap:"wrap"}}>
              {tabDefs.map(t=>(
                <button key={t.id} onClick={()=>{setTab(t.id);setSelectedSwimmer(null);setEditingMeet(null);}}
                  style={{background:tab===t.id?`linear-gradient(135deg,${accent}22,${accent}11)`:"transparent",border:tab===t.id?`1px solid ${accent}66`:"1px solid transparent",color:tab===t.id?accent:muted,padding:"8px 12px",borderRadius:8,fontFamily:"Barlow Condensed, sans-serif",fontSize:13,fontWeight:700,letterSpacing:1,cursor:"pointer"}}>
                  {t.label.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"24px"}}>
        {tab==="dashboard"&&renderDashboard()}
        {tab==="swimmers"&&renderSwimmers()}
        {tab==="meets"&&renderMeets()}
        {tab==="results"&&renderResults()}
        {tab==="leaderboard"&&renderLeaderboard()}
        {tab==="cuts"&&renderCuts()}
        {tab==="settings"&&renderSettings()}
      </div>

      {showAddTime&&(<div style={overlay} onClick={e=>e.target===e.currentTarget&&setShowAddTime(false)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:20}}>LOG TIME</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <select style={inputStyle} value={newTime.swimmer_id} onChange={e=>setNewTime(t=>({...t,swimmer_id:e.target.value}))}>
              <option value="">Select Swimmer</option>
              {swimmers.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select style={inputStyle} value={newTime.event} onChange={e=>setNewTime(t=>({...t,event:e.target.value}))}>
              <option value="">Select Event</option>
              {[...INDIVIDUAL_EVENTS].map(e=><option key={e} value={e}>{e}</option>)}
            </select>
            <input style={inputStyle} placeholder="Time (e.g. 56.23 or 1:02.45)" value={newTime.time} onChange={e=>setNewTime(t=>({...t,time:e.target.value}))}/>
            <select style={inputStyle} value={newTime.meet} onChange={e=>setNewTime(t=>({...t,meet:e.target.value}))}>
              <option value="">Select Meet</option>
              {[...meets].sort((a,b)=>(a.date||"").localeCompare(b.date||"")).map(m=>(
                <option key={m.id} value={m.name}>{m.name}{m.date?` (${formatDisplayDate(m.date)})`:""}</option>
              ))}
            </select>
            {newTime.meet&&meetDateMap[newTime.meet]&&(
              <div style={{color:muted,fontSize:12,padding:"6px 12px",background:"#0a1520",borderRadius:8}}>
                Date: <span style={{color:accent}}>{formatDisplayDate(meetDateMap[newTime.meet])}</span>
              </div>
            )}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={addTime}>Save Time</button>
              <button style={btnSecondary} onClick={()=>setShowAddTime(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showAddSwimmer&&(<div style={overlay} onClick={e=>e.target===e.currentTarget&&setShowAddSwimmer(false)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:20}}>ADD SWIMMER</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input style={inputStyle} placeholder="Full Name" value={newSwimmer.name} onChange={e=>setNewSwimmer(s=>({...s,name:e.target.value}))}/>
            <div>
              <input style={inputStyle} placeholder="Graduation Year (e.g. 2027)" type="number" value={newSwimmer.grad_year} onChange={e=>setNewSwimmer(s=>({...s,grad_year:e.target.value}))}/>
              {newSwimmer.grad_year&&<div style={{color:muted,fontSize:12,marginTop:5}}>Year: <span style={{color:accent,fontWeight:700}}>{gradYearToLabel(Number(newSwimmer.grad_year))}</span></div>}
            </div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={addSwimmer}>Add Swimmer</button>
              <button style={btnSecondary} onClick={()=>setShowAddSwimmer(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showAddMeet&&(<div style={overlay} onClick={e=>e.target===e.currentTarget&&setShowAddMeet(false)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:20}}>ADD MEET</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div>
              <label style={{color:muted,fontSize:12,display:"block",marginBottom:6}}>Meet Name</label>
              <input style={inputStyle} placeholder="e.g. Gloucester" value={newMeet.name} onChange={e=>setNewMeet(m=>({...m,name:e.target.value}))}/>
            </div>
            <div>
              <label style={{color:muted,fontSize:12,display:"block",marginBottom:6}}>Date</label>
              <input style={inputStyle} type="date" value={newMeet.date} onChange={e=>setNewMeet(m=>({...m,date:e.target.value}))}/>
            </div>
            <div>
              <label style={{color:muted,fontSize:12,display:"block",marginBottom:6}}>Season <span style={{color:"#2a4060"}}>(optional)</span></label>
              <input style={inputStyle} list="add-seasons-list" placeholder="e.g. 2024-25" value={newMeet.season} onChange={e=>setNewMeet(m=>({...m,season:e.target.value}))}/>
              <datalist id="add-seasons-list">{[...new Set(meets.map(m=>m.season).filter(Boolean))].map(s=><option key={s} value={s}/>)}</datalist>
            </div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={addMeet}>Add Meet</button>
              <button style={btnSecondary} onClick={()=>setShowAddMeet(false)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showAddEvent&&(<div style={overlay} onClick={e=>e.target===e.currentTarget&&setShowAddEvent(false)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:8}}>ADD EVENT</h3>
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <input style={inputStyle} placeholder="e.g. 200 Backstroke" value={newEvent} onChange={e=>setNewEvent(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEvent()}/>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={addEvent}>Add Event</button>
              <button style={btnSecondary} onClick={()=>{setShowAddEvent(false);setNewEvent("");}}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showEditCut&&(<div style={overlay} onClick={e=>e.target===e.currentTarget&&setShowEditCut(null)}>
        <div style={modalBox}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:4}}>SET QUALIFYING CUTS</h3>
          <p style={{color:accent,fontSize:14,fontWeight:600,marginBottom:4}}>{showEditCut}</p>
          <p style={{color:muted,fontSize:13,marginBottom:20}}>Enter as seconds (56.23) or min:sec (1:02.45). Leave blank to remove.</p>
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div>
              <label style={{color:gold,fontSize:13,fontWeight:700,letterSpacing:1,display:"block",marginBottom:6}}>A STANDARD</label>
              <input style={inputStyle} placeholder="e.g. 57.50" value={editCutA} onChange={e=>setEditCutA(e.target.value)}/>
            </div>
            <div>
              <label style={{color:"#C0C0C0",fontSize:13,fontWeight:700,letterSpacing:1,display:"block",marginBottom:6}}>B STANDARD</label>
              <input style={inputStyle} placeholder="e.g. 62.00" value={editCutB} onChange={e=>setEditCutB(e.target.value)}/>
            </div>
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button style={btnPrimary} onClick={()=>saveCut(showEditCut)}>Save Cuts</button>
              <button style={btnSecondary} onClick={()=>setShowEditCut(null)}>Cancel</button>
            </div>
          </div>
        </div>
      </div>)}

      {showConfirmDelete&&(<div style={overlay} onClick={e=>e.target===e.currentTarget&&setShowConfirmDelete(null)}>
        <div style={{...modalBox,width:380}}>
          <h3 style={{fontFamily:"Barlow Condensed, sans-serif",fontSize:22,fontWeight:800,color:text,marginBottom:12}}>
            {showConfirmDelete.type==="event"?"REMOVE EVENT?":"REMOVE CUT?"}
          </h3>
          <p style={{color:muted,fontSize:14,lineHeight:1.6,marginBottom:24}}>
            {showConfirmDelete.type==="event"
              ?<>Removing <span style={{color:text,fontWeight:600}}>"{showConfirmDelete.value}"</span> hides it from the event picker. Logged times won't be deleted, but its cuts will be removed.</>
              :<>Remove qualifying cuts for <span style={{color:text,fontWeight:600}}>"{showConfirmDelete.value}"</span>? Logged times are unaffected.</>}
          </p>
          <div style={{display:"flex",gap:10}}>
            <button style={{...btnPrimary,background:`linear-gradient(135deg,${danger},#cc0000)`,boxShadow:"none"}}
              onClick={()=>showConfirmDelete.type==="event"?removeEvent(showConfirmDelete.value):removeCut(showConfirmDelete.value)}>
              Yes, Remove
            </button>
            <button style={btnSecondary} onClick={()=>setShowConfirmDelete(null)}>Cancel</button>
          </div>
        </div>
      </div>)}
    </div></>
  );
}

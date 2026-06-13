import { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

const T = {
  bg:"#080C12", surface:"#0E1520", surfaceRaised:"#131D2C",
  border:"#1A2A3E", borderActive:"#254060",
  inkPrimary:"#C8D8E8", inkSecondary:"#4A6080", inkMuted:"#1E2D42",
  data:"#5BA8D0", alert:"#E8A020", ok:"#4CAF7D", critical:"#C84040",
  sat:[
    "#5BA8D0","#9B7FD4","#4CAF7D","#E8A020","#D06080","#7BB8C8",
    "#F4A460","#66CCAA","#CC7788","#88BBDD","#AABB44","#DD9944",
    "#77CCFF","#FF8877","#99DDBB","#CC88FF","#FFCC55","#88CCEE",
    "#FF7799","#BBDD88",
  ],
};
const F = { mono:"'IBM Plex Mono',monospace", cond:"'IBM Plex Sans Condensed',sans-serif" };
const DESIGNATIONS = [
  "ASTRA-1","SOLARIS-3","NEXUS-7","POLAR-2","GEOSAT-4","RELAY-9",
  "STARLINK-42","COSMOS-88","IRIDIUM-5","TERRA-11","AQUA-3","GOES-16",
  "SENTINEL-2","LANDSAT-9","INTELSAT-7","METEOSAT-11","NOAA-20","CBERS-4",
  "SPOT-7","KOMPSAT-5",
];

function hexRgba(hex,a){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function computeBid(s,α=1.2,β=0.8,γ=0.5){
  return α*((s.pc*100)/Math.max(s.propellant,0.01))+β*s.missionPriority+γ*s.recoveryTime;
}
async function sha256(msg){
  const buf=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(msg));
  return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,"0")).join("");
}
function orbitPos(inc,raan,radius,phase){
  const x0=radius*Math.cos(phase),y0=radius*Math.sin(phase);
  const cosI=Math.cos(inc),sinI=Math.sin(inc),cosO=Math.cos(raan),sinO=Math.sin(raan);
  return new THREE.Vector3(cosO*x0-sinO*cosI*y0,sinI*y0,sinO*x0+cosO*cosI*y0);
}
function predictOrbit(s,steps=96){
  const pts=[];
  for(let i=0;i<=steps;i++) pts.push(orbitPos(s.inc,s.raan,s.radius,s.phase+(i/steps)*Math.PI*2));
  return pts;
}
function getLonLat(pos){
  const r=pos.length();
  return {
    lat:(Math.asin(pos.y/r)*180/Math.PI).toFixed(2),
    lon:(Math.atan2(pos.z,pos.x)*180/Math.PI).toFixed(2),
    alt:((r-1)*6371).toFixed(0),
  };
}
function makeSat(id){
  const incGroup=[0.15,0.35,0.6,0.9,1.15,1.4,1.6,1.75,2.0,2.2,2.5,2.7,2.9,0.45,0.75,1.05,1.35,1.65,1.9,2.1];
  return {
    id, inc:incGroup[id],
    raan:((id/20)*Math.PI*2)+(Math.random()-0.5)*0.3,
    radius:1.38+Math.random()*0.35,
    phase:(id/20)*Math.PI*2,
    propellant:0.35+Math.random()*0.65,
    missionPriority:1+Math.random()*9,
    recoveryTime:1+Math.random()*10,
    pc:0, maneuvering:false, maneuverTimer:0,
    maneuverBurst:{vInc:0,vRaan:0},
    altitude:350+Math.round(Math.random()*1200),
    designation:DESIGNATIONS[id],
    trail3D:[],
  };
}
function initSats(){ return Array.from({length:20},(_,i)=>makeSat(i)); }
let ledgerSeq=1;
async function makeLedgerEntry(sA,sB,winner,loser,bA,bB){
  const p={seq:ledgerSeq++,ts:new Date().toISOString(),
    designA:sA.designation,designB:sB.designation,
    bidA:bA.toFixed(4),bidB:bB.toFixed(4),winner,loser,
    winnerDesig:winner===sA.id?sA.designation:sB.designation,
    loserDesig:loser===sA.id?sA.designation:sB.designation,
  };
  const hash=await sha256(JSON.stringify(p));
  return {p,hash:hash.slice(0,32)};
}

// ─── Earth textures ───────────────────────────────────────────────────────────
function buildEarthTexture(){
  const W=2048,H=1024,cv=document.createElement("canvas");
  cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  const ocean=ctx.createLinearGradient(0,0,0,H);
  ocean.addColorStop(0,"#0a1f3a"); ocean.addColorStop(0.5,"#0e2d52"); ocean.addColorStop(1,"#071525");
  ctx.fillStyle=ocean; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#2a4a22";
  [
    [[480,180],[580,160],[640,200],[660,280],[620,360],[560,400],[500,380],[440,320],[420,260],[440,200]],
    [[530,420],[570,400],[610,450],[590,540],[540,580],[500,560],[490,500],[510,450]],
    [[780,170],[840,160],[870,190],[850,230],[800,250],[760,240],[750,200]],
    [[780,270],[840,260],[880,320],[870,420],[820,500],[770,510],[730,460],[720,380],[740,300]],
    [[860,150],[1060,130],[1180,160],[1240,220],[1200,300],[1100,340],[980,320],[900,280],[850,220]],
    [[1100,440],[1180,420],[1220,460],[1210,520],[1160,540],[1110,520],[1090,480]],
    [[590,110],[650,100],[680,140],[650,180],[600,190],[570,160]],
    [[300,930],[700,920],[1100,925],[1500,920],[1800,928],[2000,940],[2048,960],[0,960]],
  ].forEach(pts=>{
    ctx.beginPath(); ctx.moveTo(pts[0][0],pts[0][1]);
    pts.forEach(p=>ctx.lineTo(p[0],p[1])); ctx.closePath(); ctx.fill();
    ctx.strokeStyle="#3a6a30"; ctx.lineWidth=2; ctx.stroke();
  });
  ctx.fillStyle="#385030";
  [[900,200,60,20],[1050,180,40,15],[800,290,30,12],[530,230,25,10]].forEach(([x,y,w,h])=>{
    ctx.beginPath(); ctx.ellipse(x,y,w,h,0.4,0,Math.PI*2); ctx.fill();
  });
  [[0,80],[H-90,90]].forEach(([y,h])=>{
    const g=ctx.createLinearGradient(0,y,0,y+h);
    g.addColorStop(0,"rgba(220,235,250,0.9)"); g.addColorStop(1,"rgba(180,210,240,0)");
    ctx.fillStyle=g; ctx.fillRect(0,y,W,h);
  });
  ctx.fillStyle="rgba(255,240,180,0.5)";
  [[490,220],[820,200],[870,195],[900,210],[780,220],[1060,200],[1120,210],[550,460]].forEach(([x,y])=>{
    ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
  });
  return new THREE.CanvasTexture(cv);
}
function buildNightTexture(){
  const W=1024,H=512,cv=document.createElement("canvas");
  cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  ctx.fillStyle="#000008"; ctx.fillRect(0,0,W,H);
  [[240,110],[415,105],[435,98],[450,108],[390,110],[530,100],[560,105],[275,230],[600,340],[700,320]].forEach(([x,y])=>{
    const g=ctx.createRadialGradient(x,y,0,x,y,6);
    g.addColorStop(0,"rgba(255,240,150,0.9)"); g.addColorStop(1,"rgba(255,220,100,0)");
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(x,y,6,0,Math.PI*2); ctx.fill();
  });
  return new THREE.CanvasTexture(cv);
}
function buildSpecularTexture(){
  const W=512,H=256,cv=document.createElement("canvas");
  cv.width=W; cv.height=H;
  const ctx=cv.getContext("2d");
  ctx.fillStyle="#667788"; ctx.fillRect(0,0,W,H);
  ctx.fillStyle="#111";
  [[240,90,50,30],[265,200,40,45],[390,85,65,35],[440,150,30,30],[550,75,90,30],[550,210,50,30]].forEach(([x,y,w,h])=>{ctx.fillRect(x,y,w,h);});
  return new THREE.CanvasTexture(cv);
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function OrbitalNegotiator(){
  const mountRef=useRef(null);
  const satsRef=useRef(initSats());
  const animRef=useRef(null);
  const pausedRef=useRef(false);
  const speedRef=useRef(1.0);
  const showTrailsRef=useRef(true);
  const showPredictRef=useRef(true);
  const lockedSatRef=useRef(-1);
  const zoomRef=useRef(4.5);
  const threeRef=useRef({});
  const forcedTimerRef=useRef(0);
  const rotStateRef=useRef({rotX:0.22,rotY:0,targetRotX:0.22,targetRotY:0,isDragging:false,lastMX:0,lastMY:0});

  const [ledger,setLedger]=useState([]);
  const [conjunctions,setConjunctions]=useState([]);
  const [stats,setStats]=useState({resolved:0,active:0});
  const [paused,setPaused]=useState(false);
  const [showTrails,setShowTrails]=useState(true);
  const [showPredict,setShowPredict]=useState(true);
  const [speed,setSpeed]=useState(1.0);
  const [satSnap,setSatSnap]=useState(()=>initSats());
  const [lockedSat,setLockedSat]=useState(-1);
  const [zoom,setZoom]=useState(4.5);
  const [selectedSat,setSelectedSat]=useState(null);
  // Collision toast: always rendered, opacity-driven, NEVER shifts layout
  const [toastMsg,setToastMsg]=useState("");
  const [toastVisible,setToastVisible]=useState(false);
  // Maneuver history panel
  const [histSatId,setHistSatId]=useState(null); // which sat's history to show
  const [maneuverHistory,setManeuverHistory]=useState([]); // all resolved events
  const [showTrajViz,setShowTrajViz]=useState(false); // show trajectory visualizer

  useEffect(()=>{showTrailsRef.current=showTrails;},[showTrails]);
  useEffect(()=>{showPredictRef.current=showPredict;},[showPredict]);
  useEffect(()=>{speedRef.current=speed;},[speed]);
  useEffect(()=>{lockedSatRef.current=lockedSat;},[lockedSat]);
  useEffect(()=>{zoomRef.current=zoom;},[zoom]);

  const resolve=useCallback(async(sA,sB)=>{
    const bA=computeBid(sA),bB=computeBid(sB);
    const winner=bA>=bB?sA.id:sB.id,loser=bA>=bB?sB.id:sA.id;
    const ls=satsRef.current.find(s=>s.id===loser);
    if(ls&&!ls.maneuvering){
      const incGroup=[0.15,0.35,0.6,0.9,1.15,1.4,1.6,1.75,2.0,2.2,2.5,2.7,2.9,0.45,0.75,1.05,1.35,1.65,1.9,2.1];
      const targetInc = incGroup[loser] + (Math.random() - 0.5) * 0.15;
      const targetRaan = ((loser/20)*Math.PI*2) + (Math.random() - 0.5) * 0.5;

      ls.maneuvering=true;
      ls.maneuverTimer=200;
      ls.maneuverBurst={
        vInc: (targetInc - ls.inc) / 2.0,
        vRaan: (targetRaan - ls.raan) / 2.0
      };
      ls.propellant=Math.max(0.01,ls.propellant-0.055);
    }
    const entry=await makeLedgerEntry(sA,sB,winner,loser,bA,bB);
    setLedger(prev=>[entry,...prev].slice(0,10));
    setStats(s=>({...s,resolved:s.resolved+1}));
    // Maneuver history record — store orbit params snapshot for trajectory viz
    const rec={
      seq:entry.p.seq, ts:entry.p.ts,
      satA:sA.id, satB:sB.id,
      designA:sA.designation, designB:sB.designation,
      winner, loser,
      winnerDesig:winner===sA.id?sA.designation:sB.designation,
      loserDesig:loser===sA.id?sA.designation:sB.designation,
      bidA:parseFloat(entry.p.bidA), bidB:parseFloat(entry.p.bidB),
      hash:entry.hash,
      // Orbit snapshot for trajectory visualisation
      orbitA:{inc:sA.inc,raan:sA.raan,radius:sA.radius,phase:sA.phase},
      orbitB:{inc:sB.inc,raan:sB.raan,radius:sB.radius,phase:sB.phase},
      trailA:[...sA.trail3D.map(v=>({x:v.x,y:v.y,z:v.z}))],
      trailB:[...sB.trail3D.map(v=>({x:v.x,y:v.y,z:v.z}))],
      maneuverBurst:ls?{vInc:ls.maneuverBurst.vInc,vRaan:ls.maneuverBurst.vRaan}:null,
    };
    setManeuverHistory(prev=>[rec,...prev]);
    // Toast inside globe — opacity driven, no layout shift ever
    setToastMsg(`⚡ ${sA.designation} ↔ ${sB.designation} → ${rec.loserDesig} MANEUVERS`);
    setToastVisible(true);
    setTimeout(()=>setToastVisible(false),2500);
  },[]);

  // ── Three.js setup ─────────────────────────────────────────────────────────
  useEffect(()=>{
    const container=mountRef.current;
    if(!container) return;
    const W=container.clientWidth||600,H=container.clientHeight||560;

    const renderer=new THREE.WebGLRenderer({antialias:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
    renderer.setSize(W,H);
    renderer.toneMapping=THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure=1.1;
    container.appendChild(renderer.domElement);

    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(42,W/H,0.01,200);
    camera.position.set(0,1.5,4.5);

    scene.add(new THREE.AmbientLight(0x223355,0.9));
    const sun=new THREE.DirectionalLight(0xfff5e8,3.2);
    sun.position.set(8,4,6); scene.add(sun);
    const fillLight=new THREE.DirectionalLight(0x334466,0.4);
    fillLight.position.set(-5,-2,-3); scene.add(fillLight);

    // Stars
    const sv=[];
    for(let i=0;i<2000;i++){
      const th=Math.random()*Math.PI*2,ph=Math.acos(2*Math.random()-1),r=20+Math.random()*8;
      sv.push(r*Math.sin(ph)*Math.cos(th),r*Math.cos(ph),r*Math.sin(ph)*Math.sin(th));
    }
    const starGeo=new THREE.BufferGeometry();
    starGeo.setAttribute("position",new THREE.Float32BufferAttribute(sv,3));
    scene.add(new THREE.Points(starGeo,new THREE.PointsMaterial({color:0xaabbdd,size:0.04,sizeAttenuation:true})));

    // Earth
    const earth=new THREE.Mesh(
      new THREE.SphereGeometry(1,96,96),
      new THREE.MeshPhongMaterial({
        map:buildEarthTexture(),specularMap:buildSpecularTexture(),
        specular:new THREE.Color(0x224466),shininess:28,
        emissiveMap:buildNightTexture(),emissive:new THREE.Color(0xffffff),emissiveIntensity:0.18,
      })
    );
    scene.add(earth);
    const clouds=new THREE.Mesh(
      new THREE.SphereGeometry(1.012,64,64),
      new THREE.MeshPhongMaterial({color:0xffffff,transparent:true,opacity:0.12,depthWrite:false})
    );
    scene.add(clouds);
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.1,48,48),
      new THREE.MeshPhongMaterial({color:0x2255AA,transparent:true,opacity:0.11,side:THREE.BackSide,depthWrite:false})
    ));

    // Grid lines
    const gridMat=new THREE.LineBasicMaterial({color:0x1A3050,transparent:true,opacity:0.22});
    for(let lat=-75;lat<=75;lat+=15){
      const pts=[];
      for(let lo=0;lo<=360;lo+=3){const lR=lat*Math.PI/180,lO=lo*Math.PI/180;pts.push(new THREE.Vector3(Math.cos(lR)*Math.cos(lO),Math.sin(lR),Math.cos(lR)*Math.sin(lO)));}
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gridMat));
    }
    for(let lo=0;lo<360;lo+=15){
      const pts=[];
      for(let la=-90;la<=90;la+=2){const lR=la*Math.PI/180,lO=lo*Math.PI/180;pts.push(new THREE.Vector3(Math.cos(lR)*Math.cos(lO),Math.sin(lR),Math.cos(lR)*Math.sin(lO)));}
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),gridMat));
    }

    // Satellite scene objects
    const satMeshes=[],trailLines=[],predictLines=[],haloMeshes=[],lockRings=[];
    satsRef.current.forEach((s,i)=>{
      const col=new THREE.Color(T.sat[i]);
      const mesh=new THREE.Mesh(
        new THREE.OctahedronGeometry(0.022,0),
        new THREE.MeshPhongMaterial({color:col,emissive:col,emissiveIntensity:0.7,shininess:90})
      );
      mesh.userData={satId:i}; scene.add(mesh); satMeshes.push(mesh);

      const tl=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.45}));
      scene.add(tl); trailLines.push(tl);

      const pl=new THREE.LineLoop(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:0.14}));
      scene.add(pl); predictLines.push(pl);

      // Conjunction halo
      const halo=new THREE.Mesh(
        new THREE.RingGeometry(0.04,0.055,32),
        new THREE.MeshBasicMaterial({color:0xE8A020,side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:false})
      );
      scene.add(halo); haloMeshes.push(halo);

      // Lock ring (always present, invisible unless locked) — thick cyan ring
      const lr=new THREE.Mesh(
        new THREE.RingGeometry(0.055,0.085,32),
        new THREE.MeshBasicMaterial({color:0x00ffff,side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:false})
      );
      scene.add(lr); lockRings.push(lr);

      // Second outer pulsing ring for locked sat
      const lr2=new THREE.Mesh(
        new THREE.RingGeometry(0.10,0.12,48),
        new THREE.MeshBasicMaterial({color:0x00ffcc,side:THREE.DoubleSide,transparent:true,opacity:0,depthWrite:false})
      );
      scene.add(lr2);
    });

    // Conjunction lines pool
    const conjLines=[];
    for(let k=0;k<40;k++){
      const l=new THREE.Line(new THREE.BufferGeometry(),new THREE.LineBasicMaterial({color:0xE8A020,transparent:true,opacity:0}));
      scene.add(l); conjLines.push(l);
    }

    const lockRingAngle=new Float32Array(satsRef.current.length); // spin angle per ring
    // Store outer rings for locked sat glow
    const outerRings=scene.children.filter(c=>c.geometry&&c.geometry.parameters&&c.geometry.parameters.innerRadius===0.10);
    let lastUpdateTime=0; // for throttling setSelectedSat
    const raycaster=new THREE.Raycaster();
    const mouse2=new THREE.Vector2();
    threeRef.current={renderer,scene,camera,earth,clouds,satMeshes,trailLines,predictLines,haloMeshes,lockRings,conjLines};

    const screenPos=mesh=>{
      const v=mesh.position.clone().project(camera);
      const rect=renderer.domElement.getBoundingClientRect();
      return {x:(v.x*0.5+0.5)*rect.width,y:(-v.y*0.5+0.5)*rect.height};
    };

    // ── Input handlers (ALL work regardless of pause) ──────────────────────
    const rs=rotStateRef.current;

    const onMouseDown=e=>{rs.isDragging=true;rs.lastMX=e.clientX;rs.lastMY=e.clientY;};
    const onMouseUp=()=>{rs.isDragging=false;};
    const onMouseMove=e=>{
      if(!rs.isDragging) return;
      const dx=(e.clientX-rs.lastMX)*0.007;
      const dy=(e.clientY-rs.lastMY)*0.005;
      rs.targetRotY+=dx;
      rs.targetRotX+=dy;
      rs.targetRotX=Math.max(-1.3,Math.min(1.3,rs.targetRotX));
      rs.lastMX=e.clientX; rs.lastMY=e.clientY;
      // NOTE: dragging no longer unlocks — user can orbit around locked sat
    };
    const onWheel=e=>{
      e.preventDefault();
      const nz=Math.max(1.5,Math.min(9,zoomRef.current+e.deltaY*0.003));
      zoomRef.current=nz;
      setZoom(nz);
    };
    const onClick=e=>{
      const rect=renderer.domElement.getBoundingClientRect();
      mouse2.x=((e.clientX-rect.left)/rect.width)*2-1;
      mouse2.y=-((e.clientY-rect.top)/rect.height)*2+1;
      raycaster.setFromCamera(mouse2,camera);
      const hits=raycaster.intersectObjects(satMeshes);
      if(hits.length>0){
        const sid=hits[0].object.userData.satId;
        const sat=satsRef.current[sid];
        const ll=getLonLat(satMeshes[sid].position);
        lockedSatRef.current=sid; setLockedSat(sid);
        setSelectedSat({id:sid,...ll,designation:sat.designation,
          propellant:sat.propellant,missionPriority:sat.missionPriority,
          pc:sat.pc,status:sat.maneuvering?"MANEUVERING":sat.pc>0.4?"CONJUNCTION":sat.pc>0.1?"PROXIMITY":"NOMINAL",
          screenX:300,screenY:200});
      } else {
        lockedSatRef.current=-1; setLockedSat(-1); setSelectedSat(null);
      }
    };
    const onTouchStart=e=>{rs.isDragging=true;rs.lastMX=e.touches[0].clientX;rs.lastMY=e.touches[0].clientY;};
    const onTouchMove=e=>{
      if(!rs.isDragging) return;
      rs.targetRotY+=(e.touches[0].clientX-rs.lastMX)*0.007;
      rs.targetRotX+=(e.touches[0].clientY-rs.lastMY)*0.005;
      rs.targetRotX=Math.max(-1.3,Math.min(1.3,rs.targetRotX));
      rs.lastMX=e.touches[0].clientX; rs.lastMY=e.touches[0].clientY;
    };
    const onTouchEnd=()=>{rs.isDragging=false;};

    renderer.domElement.addEventListener("click",onClick);
    renderer.domElement.addEventListener("mousedown",onMouseDown);
    window.addEventListener("mouseup",onMouseUp);
    window.addEventListener("mousemove",onMouseMove);
    renderer.domElement.addEventListener("wheel",onWheel,{passive:false});
    renderer.domElement.addEventListener("touchstart",onTouchStart,{passive:true});
    window.addEventListener("touchmove",onTouchMove,{passive:true});
    window.addEventListener("touchend",onTouchEnd);
    const onResize=()=>{
      const w=container.clientWidth,h=container.clientHeight;
      renderer.setSize(w,h); camera.aspect=w/h; camera.updateProjectionMatrix();
    };
    window.addEventListener("resize",onResize);

    // ── Render loop ────────────────────────────────────────────────────────
    const BASE=0.005;
    let tick=0;

    const loop=()=>{
      animRef.current=requestAnimationFrame(loop);
      const spd=speedRef.current;
      const lk=lockedSatRef.current;
      const z=zoomRef.current;
      const sats=satsRef.current;

      // ── Physics (only when not paused) ──────────────────────────────────
      if(!pausedRef.current){
        // Forced collision timer
        forcedTimerRef.current+=spd;
        if(forcedTimerRef.current>300){
          forcedTimerRef.current=0;
          const free=sats.filter(s=>!s.maneuvering);
          if(free.length>=2){
            const a=free[Math.floor(Math.random()*free.length)];
            let b=free[Math.floor(Math.random()*free.length)];
            if(b.id===a.id) b=free[(free.indexOf(a)+1)%free.length];
            b.inc=a.inc+(Math.random()-0.5)*0.04;
            b.raan=a.raan+(Math.random()-0.5)*0.04;
            b.phase=a.phase+(Math.random()-0.5)*0.06;
          }
        }

        sats.forEach((s,i)=>{
          s.phase+=BASE*spd*(1/(s.radius*s.radius));
          if(s.phase>Math.PI*2) s.phase-=Math.PI*2;
          if(s.maneuvering){
            s.inc+=s.maneuverBurst.vInc*0.01;
            s.raan+=s.maneuverBurst.vRaan*0.01;
            s.maneuverTimer--;
            if(s.maneuverTimer<=0){s.maneuvering=false;s.maneuverBurst={vInc:0,vRaan:0};}
          }
          s.pc*=0.97;
          const pos=orbitPos(s.inc,s.raan,s.radius,s.phase);
          satMeshes[i].position.copy(pos);
          satMeshes[i].rotation.y+=0.04;
          s.trail3D.push(pos.clone());
          if(s.trail3D.length>70) s.trail3D.shift();
        });

        const conj=[];
        for(let i=0;i<sats.length;i++) for(let j=i+1;j<sats.length;j++){
          const d=satMeshes[i].position.distanceTo(satMeshes[j].position);
          const pc=Math.max(0,1-d/0.22);
          sats[i].pc=Math.max(sats[i].pc,pc);
          sats[j].pc=Math.max(sats[j].pc,pc);
          if(pc>0.18){
            conj.push({a:i,b:j,pc,d});
            if(pc>0.52&&!sats[i].maneuvering&&!sats[j].maneuvering) resolve(sats[i],sats[j]);
          }
        }
        conjLines.forEach((line,k)=>{
          if(k<conj.length){
            line.geometry.dispose();
            line.geometry = new THREE.BufferGeometry().setFromPoints([satMeshes[conj[k].a].position.clone(),satMeshes[conj[k].b].position.clone()]);
            line.material.opacity=conj[k].pc*0.65;
            line.material.color.set(conj[k].pc>0.55?0xC84040:0xE8A020);
          } else line.material.opacity=0;
        });

        sats.forEach((s,i)=>{
          // Trail
          if(showTrailsRef.current&&s.trail3D.length>1){
            trailLines[i].geometry.dispose();
            trailLines[i].geometry = new THREE.BufferGeometry().setFromPoints(s.trail3D);
            trailLines[i].visible=true;
          } else trailLines[i].visible=false;
          // Predict
          if(showPredictRef.current){
            predictLines[i].geometry.dispose();
            predictLines[i].geometry = new THREE.BufferGeometry().setFromPoints(predictOrbit(s));
            predictLines[i].visible=true;
          } else predictLines[i].visible=false;
          // Conjunction halo
          haloMeshes[i].position.copy(satMeshes[i].position);
          haloMeshes[i].lookAt(camera.position);
          haloMeshes[i].material.opacity=s.pc>0.12?s.pc*0.8:0;
          haloMeshes[i].material.color.set(s.pc>0.55?0xC84040:0xE8A020);
          haloMeshes[i].scale.setScalar(0.7+s.pc*2);
        });

        earth.rotation.y+=0.0006*spd;
        clouds.rotation.y+=0.00065*spd;

        if(tick%4===0){
          setConjunctions([...conj]);
          setSatSnap(sats.map(s=>({...s,trail3D:[]})));
          setStats(prev=>({...prev,active:conj.length}));
        }
        tick++;
      }

      // ── Conjunction halos orientation (always updated so they face camera when paused) ──
      satsRef.current.forEach((s,i)=>{
        if(haloMeshes[i]) haloMeshes[i].lookAt(camera.position);
      });

      // ── Lock ring + glow for locked satellite (always updated) ──────────
      satMeshes.forEach((mesh,i)=>{
        const isLocked=i===lk;
        const mat=mesh.material;
        if(isLocked){
          const pulse=Math.sin(Date.now()*0.007);
          mat.emissiveIntensity=3.0+pulse*0.8; // very strong pulsing glow
          mat.color.set(0x00ffe0);   // bright cyan-green highlight
          mat.emissive.set(0x00ffe0);
          mesh.scale.setScalar(2.4+pulse*0.3); // pulsing size
        } else {
          mat.color.set(T.sat[i]);
          mat.emissive.set(T.sat[i]);
          mat.emissiveIntensity=0.7;
          mesh.scale.setScalar(1.0);
        }
        // Lock ring — bright cyan spinning ring
        if(isLocked) lockRingAngle[i]+=0.05;
        lockRings[i].position.copy(mesh.position);
        lockRings[i].rotation.set(0,0,lockRingAngle[i]);
        lockRings[i].lookAt(camera.position);
        if(isLocked){
          lockRings[i].material.color.set(0x00ffe0);
          lockRings[i].material.opacity=0.95+Math.sin(Date.now()*0.005)*0.05;
        } else {
          lockRings[i].material.opacity=0;
        }
        // Outer pulsing ring for locked satellite
        if(outerRings[i]){
          outerRings[i].position.copy(mesh.position);
          outerRings[i].lookAt(camera.position);
          if(isLocked){
            const p2=Math.sin(Date.now()*0.003)*0.5+0.5;
            outerRings[i].material.opacity=0.35+p2*0.4;
            outerRings[i].material.color.set(0x00ffcc);
            outerRings[i].scale.setScalar(1.5+p2*1.2);
          } else {
            outerRings[i].material.opacity=0;
          }
        }
      });

      // ── Camera (always updated so pan/zoom works while paused) ──────────
      if(lk>=0){
        const tgt=satMeshes[lk].position.clone();
        const curZ=zoomRef.current;
        // Allow dragging to orbit around the locked satellite
        if(!rs.isDragging) {
          // Auto-orbit only when not paused
          if(!pausedRef.current) rs.targetRotY+=0.0003*spd;
        }
        rs.rotX+=(rs.targetRotX-rs.rotX)*0.08;
        rs.rotY+=(rs.targetRotY-rs.rotY)*0.08;
        // Compute camera offset relative to locked sat using drag angles
        const orbitDist=curZ*0.55;
        const offX=orbitDist*Math.sin(rs.rotY)*Math.cos(rs.rotX);
        const offY=orbitDist*Math.sin(rs.rotX)+curZ*0.12;
        const offZ=orbitDist*Math.cos(rs.rotY)*Math.cos(rs.rotX);
        const camTarget=tgt.clone().add(new THREE.Vector3(offX,offY,offZ));
        camera.position.lerp(camTarget,0.12);
        camera.lookAt(tgt);
        // Update info card live coords — throttled with plain variable
        const frameNow=Date.now();
        if(frameNow-lastUpdateTime>80){
          lastUpdateTime=frameNow;
          const sat=sats[lk];
          const ll=getLonLat(satMeshes[lk].position);
          const sp=screenPos(satMeshes[lk]);
          setSelectedSat(prev=>prev&&prev.id===lk?{...prev,...ll,
            propellant:sat.propellant,pc:sat.pc,
            missionPriority:sat.missionPriority,
            status:sat.maneuvering?"MANEUVERING":sat.pc>0.4?"CONJUNCTION":sat.pc>0.1?"PROXIMITY":"NOMINAL",
            screenX:sp.x,screenY:sp.y}:prev);
        }
      } else {
        // Free camera — drag and zoom always work regardless of pause
        if(!rs.isDragging) rs.targetRotY+=0.0012*(pausedRef.current?0:spd);
        rs.rotX+=(rs.targetRotX-rs.rotX)*0.08;
        rs.rotY+=(rs.targetRotY-rs.rotY)*0.08;
        const curZ=zoomRef.current;
        const cx=curZ*Math.sin(rs.rotY)*Math.cos(rs.rotX);
        const cy=curZ*Math.sin(rs.rotX);
        const cz=curZ*Math.cos(rs.rotY)*Math.cos(rs.rotX);
        camera.position.lerp(new THREE.Vector3(cx,cy,cz),0.12);
        camera.lookAt(0,0,0);
      }

      renderer.render(scene,camera);
    };
    animRef.current=requestAnimationFrame(loop);

    return()=>{
      cancelAnimationFrame(animRef.current);
      renderer.domElement.removeEventListener("click",onClick);
      renderer.domElement.removeEventListener("mousedown",onMouseDown);
      window.removeEventListener("mouseup",onMouseUp);
      window.removeEventListener("mousemove",onMouseMove);
      renderer.domElement.removeEventListener("wheel",onWheel);
      renderer.domElement.removeEventListener("touchstart",onTouchStart);
      window.removeEventListener("touchmove",onTouchMove);
      window.removeEventListener("touchend",onTouchEnd);
      window.removeEventListener("resize",onResize);
      renderer.dispose();
      if(container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  },[resolve]);

  const togglePause=()=>{pausedRef.current=!pausedRef.current;setPaused(p=>!p);};
  const reset=()=>{
    satsRef.current=initSats(); ledgerSeq=1; forcedTimerRef.current=0;
    setLedger([]); setManeuverHistory([]); setStats({resolved:0,active:0});
    setSelectedSat(null); setLockedSat(-1); lockedSatRef.current=-1; setHistSatId(null); setShowTrajViz(false);
  };
  const unlockSat=()=>{lockedSatRef.current=-1;setLockedSat(-1);setSelectedSat(null);};
  const handleSpeed=e=>{const v=parseFloat(e.target.value);setSpeed(v);speedRef.current=v;};
  const handleZoom=e=>{
    const f=parseFloat(e.target.value);
    const z=9.0-(f-1.0)*1.5;
    setZoom(z);
    zoomRef.current=z;
  };

  const speedPct=((speed-0.1)/3.9*100).toFixed(1);
  const zoomFactor=1.0+(9.0-zoom)/1.5;
  const zoomPct=((zoomFactor-1.0)/5.0*100).toFixed(1);

  // Maneuver history for selected satellite
  const histSatHistory=histSatId!==null
    ?maneuverHistory.filter(r=>r.satA===histSatId||r.satB===histSatId)
    :[];

  return(
    <div style={css.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans+Condensed:wght@500;600;700&display=swap');
        *{box-sizing:border-box;}
        ::-webkit-scrollbar{width:4px;background:#080C12;}
        ::-webkit-scrollbar-thumb{background:#1A2A3E;}
        button:hover{background:${T.surfaceRaised}!important;border-color:${T.borderActive}!important;}
        input[type=range]{-webkit-appearance:none;appearance:none;height:3px;border-radius:0;outline:none;cursor:pointer;}
        input[type=range].speed{background:linear-gradient(to right,${T.data} 0%,${T.data} ${speedPct}%,${T.border} ${speedPct}%,${T.border} 100%);}
        input[type=range].zoom{background:linear-gradient(to right,${T.ok} 0%,${T.ok} ${zoomPct}%,${T.border} ${zoomPct}%,${T.border} 100%);}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;border-radius:0;background:${T.inkPrimary};cursor:pointer;}
        input[type=range]::-moz-range-thumb{width:10px;height:10px;border-radius:0;background:${T.inkPrimary};cursor:pointer;border:none;}
        @keyframes fadeInDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseRing{0%,100%{opacity:0.7}50%{opacity:0.3}}
        @keyframes spinRing{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}</style>

      {/* Top bar */}
      <header style={css.topBar}>
        <div style={css.topLeft}>
          <span style={css.sysLabel}>ORBITAL NEGOTIATOR</span>
          <span style={css.sysVersion}>STM PROTOCOL · v4 · 20-SAT · 3D GLOBE</span>
        </div>
        <div style={css.topRight}>
          <StatusPill label="ENGINE" value={paused?"PAUSED":"NOMINAL"} color={paused?T.alert:T.ok}/>
          <StatusPill label="SATELLITES" value="20" color={T.data}/>
          <StatusPill label="CONJUNCTIONS" value={stats.active} color={stats.active>0?T.alert:T.inkSecondary}/>
          <StatusPill label="RESOLVED" value={stats.resolved} color={T.data}/>
          <StatusPill label="UTC" value={new Date().toISOString().slice(11,19)+"Z"} color={T.inkSecondary} mono/>
        </div>
      </header>

      {/* Main layout */}
      <div style={css.main}>

        {/* Globe column */}
        <div style={css.canvasCol}>
          <PanelHeader label="3D ORBITAL DISPLAY" sub="CLICK SAT TO TRACK · SCROLL ZOOM · DRAG ROTATE">
            <CtrlBtn active={!paused} onClick={togglePause}>{paused?"▶ RESUME":"⏸ PAUSE"}</CtrlBtn>
            <CtrlBtn onClick={reset}>RESET</CtrlBtn>
            <CtrlBtn active={showTrails} onClick={()=>setShowTrails(v=>!v)}>TRAILS</CtrlBtn>
            <CtrlBtn active={showPredict} onClick={()=>setShowPredict(v=>!v)}>PREDICT</CtrlBtn>
            {lockedSat>=0&&<CtrlBtn onClick={unlockSat}>🔓 UNLOCK</CtrlBtn>}
          </PanelHeader>

          {/* Globe wrapper — position:relative with fixed height so overlays NEVER shift layout */}
          <div style={{position:"relative",lineHeight:0,width:600,height:560,flexShrink:0,overflow:"hidden"}}>
            <div ref={mountRef} style={css.globeWrap}/>

            {/* Toast — always rendered, opacity-driven, zero layout impact */}
            <div style={{...css.toast,opacity:toastVisible?1:0,transition:"opacity 0.3s ease-out"}}>{toastMsg||"\u00A0"}</div>

            {/* Paused overlay badge */}
            {paused&&(
              <div style={css.pausedBadge}>⏸ PAUSED — drag &amp; zoom still active</div>
            )}

            {/* Satellite info card — always overlaid inside globe */}
            {selectedSat&&(
              <div style={{
                ...css.satCard,
                left:Math.min(Math.max((selectedSat.screenX||300)+14,6),580-230),
                top: Math.min(Math.max((selectedSat.screenY||200)-10,6),560-210),
              }}>
                <div style={css.satCardHeader}>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:8,height:8,background:T.sat[selectedSat.id],borderRadius:"50%"}}/>
                    <span style={{color:T.sat[selectedSat.id],fontWeight:700,fontFamily:F.mono,fontSize:11}}>{selectedSat.designation}</span>
                  </div>
                  <button onClick={unlockSat} style={css.closeBtn}>✕</button>
                </div>
                <div style={css.satCardBody}>
                  <SatRow label="LAT"    val={`${selectedSat.lat}°`}/>
                  <SatRow label="LON"    val={`${selectedSat.lon}°`}/>
                  <SatRow label="ALT"    val={`${selectedSat.alt} km`}/>
                  <SatRow label="FUEL"   val={`${(selectedSat.propellant*100).toFixed(0)}%`} color={selectedSat.propellant>0.4?T.ok:selectedSat.propellant>0.2?T.alert:T.critical}/>
                  <SatRow label="Pc"     val={`${(selectedSat.pc*100).toFixed(1)}%`} color={selectedSat.pc>0.3?T.critical:selectedSat.pc>0.1?T.alert:T.inkSecondary}/>
                  <SatRow label="STATUS" val={selectedSat.status} color={
                    selectedSat.status==="MANEUVERING"?T.alert:selectedSat.status==="CONJUNCTION"?T.critical:selectedSat.status==="PROXIMITY"?T.alert:T.ok}/>
                  <SatRow label="C_BID"  val={computeBid(satSnap[selectedSat.id]||{pc:0,propellant:0.5,missionPriority:5,recoveryTime:5}).toFixed(3)} color={T.data}/>
                </div>
                <div style={css.satCardFoot}>🔒 CAMERA LOCKED · scroll to zoom</div>
              </div>
            )}
          </div>

          {/* Speed + Zoom sliders */}
          <div style={css.controlsBar}>
            <div style={css.sliderRow}>
              <span style={css.sliderLabel}>SPEED</span>
              <input type="range" className="speed" min="0.1" max="4.0" step="0.05" value={speed} onChange={handleSpeed} style={{flex:1}}/>
              <span style={{...css.sliderVal,color:speed>2?T.alert:T.data}}>{speed.toFixed(2)}×</span>
            </div>
            <div style={css.sliderDivider}/>
            <div style={css.sliderRow}>
              <span style={css.sliderLabel}>ZOOM</span>
              <input type="range" className="zoom" min="1.0" max="6.0" step="0.1" value={zoomFactor} onChange={handleZoom} style={{flex:1}}/>
              <span style={{...css.sliderVal,color:T.ok}}>{zoomFactor.toFixed(1)}×</span>
            </div>
          </div>
          <div style={css.canvasFooter}>
            <span style={css.footNote}>● ring = predicted orbit</span>
            <span style={css.footNote}>— fading = trail history</span>
            <span style={css.footNote}>⬟ halo = conjunction</span>
            <span style={css.footNote}>✦ glow = locked sat</span>
          </div>
        </div>

        {/* Right column */}
        <div style={css.rightCol}>

          {/* Satellite telemetry list */}
          <div style={css.panel}>
            <PanelHeader label="SATELLITE TELEMETRY" sub={`CLICK NAME FOR MANEUVER HISTORY · ${conjunctions.length} CONJUNCTIONS ACTIVE`}/>
            <div style={{maxHeight:270,overflowY:"auto"}}>
              <table style={css.table}>
                <thead>
                  <tr>
                    {["#","DESIGNATION","ALT","FUEL","Pc","STATUS"].map(h=>(
                      <th key={h} style={css.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {satSnap.map((s,i)=>{
                    const stTxt=s.maneuvering?"MNV":s.pc>0.4?"CONJ":s.pc>0.1?"PROX":"NOM";
                    const stCol=s.maneuvering?T.alert:s.pc>0.4?T.critical:s.pc>0.1?T.alert:T.ok;
                    const isLocked=lockedSat===i;
                    const isHistSel=histSatId===i;
                    return(
                      <tr key={i} style={{
                        ...css.tr,
                        background:isLocked?hexRgba(T.sat[i],0.13):i%2===0?T.surface:T.surfaceRaised,
                        borderLeft:isLocked?`2px solid ${T.sat[i]}`:isHistSel?`2px solid ${T.alert}`:"2px solid transparent",
                      }}>
                        <td style={{...css.td,color:T.sat[i],fontWeight:700,fontSize:10}}>{i+1}</td>
                        <td style={{...css.td,padding:"4px 4px 4px 8px"}}>
                          <div style={{display:"flex",gap:5,alignItems:"center"}}>
                            {/* Lock button */}
                            <button onClick={()=>{
                              lockedSatRef.current=i; setLockedSat(i);
                              const sat=satsRef.current[i];
                              const ll=getLonLat(threeRef.current.satMeshes?.[i]?.position||new THREE.Vector3(1.5,0,0));
                              setSelectedSat({id:i,...ll,designation:sat.designation,propellant:sat.propellant,
                                missionPriority:sat.missionPriority,pc:sat.pc,
                                status:sat.maneuvering?"MANEUVERING":sat.pc>0.4?"CONJUNCTION":sat.pc>0.1?"PROXIMITY":"NOMINAL",
                                screenX:300,screenY:200});
                            }} style={{...css.tinyBtn,color:isLocked?T.sat[i]:T.inkMuted,borderColor:isLocked?T.sat[i]:T.border}}>🔒</button>
                            {/* History button */}
                            <button onClick={()=>setHistSatId(prev=>prev===i?null:i)}
                              style={{...css.tinyBtn,color:isHistSel?T.alert:T.inkMuted,borderColor:isHistSel?T.alert:T.border,fontSize:9}}>
                              📋
                            </button>
                            <span style={{color:T.sat[i],fontWeight:600,fontSize:10,cursor:"pointer"}}
                              onClick={()=>setHistSatId(prev=>prev===i?null:i)}>
                              {s.designation}
                            </span>
                          </div>
                        </td>
                        <td style={{...css.tdMono,fontSize:9}}>{s.altitude}</td>
                        <td style={{...css.td,padding:"4px 6px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:4}}>
                            <div style={{width:30,height:3,background:T.border,position:"relative"}}>
                              <div style={{position:"absolute",left:0,top:0,height:"100%",width:`${s.propellant*100}%`,background:s.propellant>0.4?T.ok:s.propellant>0.2?T.alert:T.critical}}/>
                            </div>
                            <span style={{fontSize:8,color:T.inkSecondary}}>{(s.propellant*100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td style={{...css.tdMono,fontSize:9,color:s.pc>0.3?T.critical:s.pc>0.1?T.alert:T.inkSecondary}}>
                          {(s.pc*100).toFixed(0)}%
                        </td>
                        <td style={{...css.tdStatus,fontSize:8,color:stCol}}>{stTxt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Maneuver History panel */}
          {histSatId!==null&&(
            <div style={{...css.panel,border:`1px solid ${T.alert}`,animation:"fadeInDown 0.2s ease-out"}}>
              <PanelHeader
                label={`MANEUVER HISTORY — ${DESIGNATIONS[histSatId]}`}
                sub={`${histSatHistory.length} EVENTS · trajectory replay available`}
              >
                <CtrlBtn active={showTrajViz} onClick={()=>setShowTrajViz(v=>!v)}>
                  {showTrajViz?"HIDE TRAJECTORY":"SHOW TRAJECTORY"}
                </CtrlBtn>
                <CtrlBtn onClick={()=>{setHistSatId(null);setShowTrajViz(false);}}>CLOSE ✕</CtrlBtn>
              </PanelHeader>

              {/* Trajectory Visualizer */}
              {showTrajViz&&(
                <TrajectoryViz
                  satId={histSatId}
                  events={histSatHistory}
                  satColor={T.sat[histSatId]}
                />
              )}

              {histSatHistory.length===0?(
                <EmptyState msg="No maneuvers recorded for this satellite yet"/>
              ):(
                <div style={{maxHeight:220,overflowY:"auto"}}>
                  {histSatHistory.map((r,idx)=>{
                    const isManeuver=r.loser===histSatId;
                    const otherDesig=r.satA===histSatId?r.designB:r.designA;
                    const otherId=r.satA===histSatId?r.satB:r.satA;
                    return(
                      <div key={idx} style={{
                        display:"flex",flexDirection:"column",gap:3,
                        padding:"8px 12px",borderBottom:`1px solid ${T.border}`,
                        background:idx%2===0?T.surface:T.surfaceRaised,
                        borderLeft:`3px solid ${isManeuver?T.alert:T.ok}`,
                      }}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{display:"flex",gap:6,alignItems:"center"}}>
                            <span style={{
                              fontFamily:F.mono,fontSize:8,fontWeight:700,
                              color:isManeuver?T.alert:T.ok,
                              border:`1px solid ${isManeuver?T.alert:T.ok}`,
                              padding:"1px 5px",letterSpacing:"0.06em",
                            }}>{isManeuver?"MANEUVERED":"RETAINED"}</span>
                            <span style={{fontFamily:F.mono,fontSize:9,color:T.inkSecondary}}>vs</span>
                            <div style={{display:"flex",alignItems:"center",gap:4}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:T.sat[otherId]}}/>
                              <span style={{fontFamily:F.mono,fontSize:10,color:T.sat[otherId],fontWeight:600}}>{otherDesig}</span>
                            </div>
                          </div>
                          <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary}}>#{String(r.seq).padStart(4,"0")}</span>
                        </div>
                        <div style={{display:"flex",gap:16}}>
                          <div style={{display:"flex",gap:4,alignItems:"center"}}>
                            <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary}}>BID</span>
                            <span style={{fontFamily:F.mono,fontSize:9,color:T.data,fontWeight:600}}>
                              {r.satA===histSatId?r.bidA.toFixed(3):r.bidB.toFixed(3)}
                            </span>
                          </div>
                          <div style={{display:"flex",gap:4,alignItems:"center"}}>
                            <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary}}>OTHER BID</span>
                            <span style={{fontFamily:F.mono,fontSize:9,color:T.inkSecondary}}>
                              {r.satA===histSatId?r.bidB.toFixed(3):r.bidA.toFixed(3)}
                            </span>
                          </div>
                          <div style={{display:"flex",gap:4,alignItems:"center"}}>
                            <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary}}>TIME</span>
                            <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary}}>{r.ts.slice(11,19)}Z</span>
                          </div>
                        </div>
                        <div style={{fontFamily:F.mono,fontSize:7,color:T.inkMuted,letterSpacing:"0.04em",marginTop:1}}>
                          SHA: {r.hash}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Pricing engine */}
          <div style={css.panel}>
            <PanelHeader label="PRICING ENGINE" sub="DETERMINISTIC BID FORMULA"/>
            <div style={css.formulaBlock}>
              <div style={css.formulaEq}>C<sub>bid</sub> = α·(Δv/M<sub>prop</sub>) + β·P<sub>miss</sub> + γ·T<sub>rec</sub></div>
              <div style={css.formulaCoeffs}>
                <CoeffChip label="α" val="1.2" note="Δv cost"/>
                <CoeffChip label="β" val="0.8" note="mission"/>
                <CoeffChip label="γ" val="0.5" note="recovery"/>
              </div>
              <div style={css.formulaRule}>Higher bid retains orbit · Lower bid executes maneuver</div>
            </div>
            {conjunctions.length===0
              ?<EmptyState msg="No active conjunctions — monitoring 20 satellites"/>
              :conjunctions.slice(0,4).map((c,i)=><ConjRow key={i} c={c} sats={satSnap}/>)
            }
          </div>

        </div>
      </div>

      {/* Ledger */}
      <div style={{...css.panel,margin:"0 16px 16px"}}>
        <PanelHeader label="AUDIT LEDGER" sub="SHA-256 CRYPTOGRAPHIC MANEUVER LOG · TAMPER-EVIDENT"/>
        {ledger.length===0
          ?<EmptyState msg="No maneuver agreements recorded yet — system monitoring"/>
          :<div style={{overflowX:"auto"}}>
            <div style={css.ledgerHead}>
              {["SEQ","TIME UTC","CONJUNCTION","RETAIN","MANEUVER","BID (R)","BID (M)","SHA-256"].map(h=>(
                <div key={h} style={css.lhCell}>{h}</div>
              ))}
            </div>
            {ledger.map((e,i)=>(
              <div key={i} style={{...css.ledgerRow,background:i%2===0?T.surface:"transparent"}}>
                <div style={{color:T.inkSecondary,fontFamily:F.mono,fontSize:9}}>#{String(e.p.seq).padStart(4,"0")}</div>
                <div style={{color:T.inkSecondary,fontFamily:F.mono,fontSize:9}}>{e.p.ts.slice(11,23)}Z</div>
                <div style={{color:T.inkPrimary,fontFamily:F.mono,fontSize:9}}>{e.p.designA} ↔ {e.p.designB}</div>
                <div style={{color:T.ok,fontFamily:F.mono,fontSize:9,fontWeight:600}}>{e.p.winnerDesig}</div>
                <div style={{color:T.alert,fontFamily:F.mono,fontSize:9,fontWeight:600}}>{e.p.loserDesig}</div>
                <div style={{color:T.data,fontFamily:F.mono,fontSize:9,textAlign:"right"}}>{e.p.bidA}</div>
                <div style={{color:T.inkSecondary,fontFamily:F.mono,fontSize:9,textAlign:"right"}}>{e.p.bidB}</div>
                <div style={{color:T.inkSecondary,fontFamily:F.mono,fontSize:8,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.hash}</div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}

// ─── Trajectory Visualizer ───────────────────────────────────────────────────
function hexToRgba(hex,a){
  const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}
function buildOrbit2D(inc,raan,radius,steps=120){
  const pts=[];
  for(let i=0;i<=steps;i++){
    const ph=(i/steps)*Math.PI*2;
    const x0=radius*Math.cos(ph),y0=radius*Math.sin(ph);
    const cI=Math.cos(inc),sI=Math.sin(inc),cO=Math.cos(raan),sO=Math.sin(raan);
    pts.push({x:cO*x0-sO*cI*y0,y:sI*y0,z:sO*x0+cO*cI*y0});
  }
  return pts;
}
function TrajectoryViz({satId,events,satColor}){
  const canvasRef=useRef(null);
  const animRef=useRef(null);
  const [activeEvent,setActiveEvent]=useState(0);
  const [isReplayPaused,setIsReplayPaused]=useState(false);
  const [isDragging,setIsDragging]=useState(false);

  const rotXRef=useRef(0.5);
  const rotYRef=useRef(-0.3);
  const zoomRef=useRef(82);
  const isDraggingRef=useRef(false);
  const isScrubbingRef=useRef(false);
  const draggedRef=useRef(false);
  const lastMXRef=useRef(0);
  const lastMYRef=useRef(0);
  const replayTimeRef=useRef(0);
  const lastTimeRef=useRef(null);

  useEffect(()=>{
    replayTimeRef.current=0;
    lastTimeRef.current=null;
  },[satId,activeEvent]);

  const W=586,H=260,CX=W/2,CY=H/2;

  // Dynamic parameter calculator for maneuvering/warping orbits
  function getOrbitParams(orbit,isLoser,k,burst){
    let inc=orbit.inc;
    let raan=orbit.raan;
    if(isLoser && k>0){
      const t=Math.min(k,200);
      const vInc=burst?burst.vInc:0.05;
      const vRaan=burst?burst.vRaan:0.03;
      inc+=vInc*0.01*t;
      raan+=vRaan*0.01*t;
    }
    return {inc,raan,radius:orbit.radius,phase:orbit.phase};
  }

  useEffect(()=>{
    const cv=canvasRef.current;
    if(!cv) return;
    const ctx=cv.getContext("2d");
    let frame=0;
    let rafId=0;

    const onMouseDown=e=>{
      const rect=cv.getBoundingClientRect();
      const canvasX=((e.clientX-rect.left)/rect.width)*W;
      const canvasY=((e.clientY-rect.top)/rect.height)*H;

      // Check if click is on/near the timeline bar at y = 16
      const hitTimeline = canvasY>=6 && canvasY<=30 && canvasX>=30 && canvasX<=W-30;

      if(hitTimeline){
        isScrubbingRef.current=true;
        const pct=Math.max(0,Math.min(1,(canvasX-40)/(W-80)));
        replayTimeRef.current=pct*10000;
        setIsReplayPaused(true);
      } else {
        isDraggingRef.current=true;
        setIsDragging(true);
        draggedRef.current=false;
        lastMXRef.current=e.clientX;
        lastMYRef.current=e.clientY;
      }
    };

    const onMouseMove=e=>{
      const rect=cv.getBoundingClientRect();
      const canvasX=((e.clientX-rect.left)/rect.width)*W;
      const canvasY=((e.clientY-rect.top)/rect.height)*H;

      // Update cursor dynamically when hovering over the timeline
      const hitTimeline = canvasY>=6 && canvasY<=30 && canvasX>=30 && canvasX<=W-30;
      if(hitTimeline && !isDraggingRef.current && !isScrubbingRef.current){
        cv.style.cursor="pointer";
      } else {
        cv.style.cursor=isDraggingRef.current?"grabbing":isScrubbingRef.current?"pointer":"grab";
      }

      if(isScrubbingRef.current){
        const pct=Math.max(0,Math.min(1,(canvasX-40)/(W-80)));
        replayTimeRef.current=pct*10000;
      } else if(isDraggingRef.current){
        const dx=(e.clientX-lastMXRef.current)*0.007;
        const dy=(e.clientY-lastMYRef.current)*0.005;
        if(Math.abs(e.clientX-lastMXRef.current)>2 || Math.abs(e.clientY-lastMYRef.current)>2){
          draggedRef.current=true;
          if(!isReplayPaused){
            setIsReplayPaused(true); // Auto-pause on drag rotation
          }
        }
        rotYRef.current+=dx;
        rotXRef.current=Math.max(-1.4,Math.min(1.4,rotXRef.current+dy));
        lastMXRef.current=e.clientX;
        lastMYRef.current=e.clientY;
      }
    };

    const onMouseUp=e=>{
      if(isScrubbingRef.current){
        isScrubbingRef.current=false;
      } else if(isDraggingRef.current){
        isDraggingRef.current=false;
        setIsDragging(false);
        // Toggle play/pause if it was just a quick click on the canvas (no dragging)
        if(!draggedRef.current){
          setIsReplayPaused(p=>!p);
        }
      }
    };

    const onWheel=e=>{
      e.preventDefault();
      const dz=e.deltaY*-0.8;
      zoomRef.current=Math.max(30,Math.min(250,zoomRef.current+dz));
    };

    const onTouchStart=e=>{
      const rect=cv.getBoundingClientRect();
      const touch=e.touches[0];
      const canvasX=((touch.clientX-rect.left)/rect.width)*W;
      const canvasY=((touch.clientY-rect.top)/rect.height)*H;

      const hitTimeline = canvasY>=6 && canvasY<=30 && canvasX>=30 && canvasX<=W-30;

      if(hitTimeline){
        isScrubbingRef.current=true;
        const pct=Math.max(0,Math.min(1,(canvasX-40)/(W-80)));
        replayTimeRef.current=pct*10000;
        setIsReplayPaused(true);
      } else {
        isDraggingRef.current=true;
        setIsDragging(true);
        draggedRef.current=false;
        lastMXRef.current=touch.clientX;
        lastMYRef.current=touch.clientY;
      }
    };

    const onTouchMove=e=>{
      const rect=cv.getBoundingClientRect();
      const touch=e.touches[0];
      const canvasX=((touch.clientX-rect.left)/rect.width)*W;
      const canvasY=((touch.clientY-rect.top)/rect.height)*H;

      if(isScrubbingRef.current){
        const pct=Math.max(0,Math.min(1,(canvasX-40)/(W-80)));
        replayTimeRef.current=pct*10000;
      } else if(isDraggingRef.current){
        const dx=(touch.clientX-lastMXRef.current)*0.007;
        const dy=(touch.clientY-lastMYRef.current)*0.005;
        if(Math.abs(touch.clientX-lastMXRef.current)>2 || Math.abs(touch.clientY-lastMYRef.current)>2){
          draggedRef.current=true;
          if(!isReplayPaused){
            setIsReplayPaused(true);
          }
        }
        rotYRef.current+=dx;
        rotXRef.current=Math.max(-1.4,Math.min(1.4,rotXRef.current+dy));
        lastMXRef.current=touch.clientX;
        lastMYRef.current=touch.clientY;
      }
    };

    const onTouchEnd=()=>{
      if(isScrubbingRef.current){
        isScrubbingRef.current=false;
      } else if(isDraggingRef.current){
        isDraggingRef.current=false;
        setIsDragging(false);
        if(!draggedRef.current){
          setIsReplayPaused(p=>!p);
        }
      }
    };

    const onKeyDown=e=>{
      if(e.code==="Space"){
        e.preventDefault();
        setIsReplayPaused(p=>!p);
      }
    };

    cv.addEventListener("mousedown",onMouseDown);
    window.addEventListener("mousemove",onMouseMove);
    window.addEventListener("mouseup",onMouseUp);
    cv.addEventListener("wheel",onWheel,{passive:false});
    cv.addEventListener("touchstart",onTouchStart,{passive:true});
    window.addEventListener("touchmove",onTouchMove,{passive:true});
    window.addEventListener("touchend",onTouchEnd);
    window.addEventListener("keydown",onKeyDown);

    function draw(){
      ctx.clearRect(0,0,W,H);
      // Background
      ctx.fillStyle="#080C12";
      ctx.fillRect(0,0,W,H);

      // Grid dots
      ctx.fillStyle="rgba(26,42,62,0.5)";
      for(let gx=0;gx<W;gx+=24) for(let gy=0;gy<H;gy+=24){
        ctx.beginPath(); ctx.arc(gx,gy,0.8,0,Math.PI*2); ctx.fill();
      }

      const vRotX=rotXRef.current;
      const vRotY=rotYRef.current;
      const vZoom=zoomRef.current;

      function proj(x,y,z){
        // Y-rotation (horizontal drag)
        const cosY=Math.cos(vRotY),sinY=Math.sin(vRotY);
        const x1=x*cosY - z*sinY;
        const z1=x*sinY + z*cosY;
        const y1=y;

        // X-rotation (vertical drag)
        const cosX=Math.cos(vRotX),sinX=Math.sin(vRotX);
        const x2=x1;
        const y2=y1*cosX - z1*sinX;
        const z2=y1*sinX + z1*cosX;

        return {px:CX+x2*vZoom, py:CY-y2*vZoom};
      }

      // Earth
      const ep=proj(0,0,0);
      const earthRad = 24 * (vZoom/82);
      const eg=ctx.createRadialGradient(ep.px,ep.py,0,ep.px,ep.py,earthRad);
      eg.addColorStop(0,"rgba(30,74,122,1)");
      eg.addColorStop(0.7,"rgba(14,45,82,1)");
      eg.addColorStop(1,"rgba(7,21,37,0)");
      ctx.fillStyle=eg;
      ctx.beginPath(); ctx.arc(ep.px,ep.py,earthRad,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#254060"; ctx.lineWidth=1.5;
      ctx.beginPath(); ctx.arc(ep.px,ep.py,earthRad,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle="#5BA8D0"; ctx.font="bold 7px 'IBM Plex Mono',monospace";
      ctx.textAlign="center"; ctx.textBaseline="middle";
      ctx.fillText("EARTH",ep.px,ep.py);
      ctx.textBaseline="alphabetic";

      if(!events||events.length===0){
        ctx.fillStyle="#4A6080"; ctx.font="10px 'IBM Plex Mono',monospace";
        ctx.textAlign="center";
        ctx.fillText("NO MANEUVER EVENTS YET — WAITING FOR CONJUNCTIONS",CX,CY+2);
        frame++;
        rafId=requestAnimationFrame(draw);
        return;
      }

      const evIdx=Math.min(activeEvent,events.length-1);
      const ev=events[evIdx];
      if(!ev){frame++; rafId=requestAnimationFrame(draw); return;}

      const isMain=ev.satA===satId;
      const mainOrbit=isMain?ev.orbitA:ev.orbitB;
      const otherOrbit=isMain?ev.orbitB:ev.orbitA;
      const otherId=isMain?ev.satB:ev.satA;
      const otherColor=T.sat[otherId]||"#888";
      const otherDesig=DESIGNATIONS[otherId]||"UNKNOWN";

      // ── Replay Calculation (10s total: 5s before, 5s after) ──────────────
      const now = Date.now();
      if(!lastTimeRef.current) {
        lastTimeRef.current = now;
      }
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;

      if(!isReplayPaused) {
        replayTimeRef.current = (replayTimeRef.current + dt) % 10000;
      }
      const elapsed = replayTimeRef.current;
      const tau = (elapsed - 5000) / 1000; // -5.0s to +5.0s
      const k = tau * 60; // simulation tick offset (-300 to +300)

      // Draw all previous event orbits as ghost lines
      events.forEach((r,ei)=>{
        if(ei===evIdx) return;
        const im=r.satA===satId;
        const mo=im?r.orbitA:r.orbitB;
        const oo=im?r.orbitB:r.orbitA;
        [mo,oo].forEach(o=>{
          const pts=buildOrbit2D(o.inc,o.raan,o.radius);
          ctx.save(); ctx.globalAlpha=0.08; ctx.strokeStyle="#5BA8D0"; ctx.lineWidth=0.8;
          ctx.beginPath();
          pts.forEach((p,pi)=>{const{px,py}=proj(p.x,p.y,p.z);pi===0?ctx.moveTo(px,py):ctx.lineTo(px,py);});
          ctx.closePath(); ctx.stroke(); ctx.restore();
        });
      });

      // Active event — get dynamic orbits at current replay tick k
      const mainParams=getOrbitParams(mainOrbit,ev.loser===satId,k,ev.maneuverBurst);
      const otherParams=getOrbitParams(otherOrbit,ev.loser===otherId,k,ev.maneuverBurst);

      const mainPts=buildOrbit2D(mainParams.inc,mainParams.raan,mainParams.radius);
      const otherPts=buildOrbit2D(otherParams.inc,otherParams.raan,otherParams.radius);

      // Main sat orbit (solid)
      ctx.save(); ctx.globalAlpha=0.55; ctx.strokeStyle=satColor; ctx.lineWidth=1.2; ctx.setLineDash([]);
      ctx.beginPath();
      mainPts.forEach((p,pi)=>{const{px,py}=proj(p.x,p.y,p.z);pi===0?ctx.moveTo(px,py):ctx.lineTo(px,py);});
      ctx.closePath(); ctx.stroke(); ctx.restore();

      // Other sat orbit (dashed)
      ctx.save(); ctx.globalAlpha=0.55; ctx.strokeStyle=otherColor; ctx.lineWidth=1.2; ctx.setLineDash([5,4]);
      ctx.beginPath();
      otherPts.forEach((p,pi)=>{const{px,py}=proj(p.x,p.y,p.z);pi===0?ctx.moveTo(px,py):ctx.lineTo(px,py);});
      ctx.closePath(); ctx.stroke(); ctx.restore();

      // Trail history — grows dynamically as sat approaches conjunction, fully drawn after
      const trailMain=isMain?ev.trailA:ev.trailB;
      const trailOther=isMain?ev.trailB:ev.trailA;
      const trailProgress = tau < 0 ? (tau + 5) / 5 : 1.0;
      [[trailMain,satColor],[trailOther,otherColor]].forEach(([trail,col])=>{
        if(!trail||trail.length<2) return;
        const drawLen=Math.floor(trailProgress*trail.length);
        ctx.save(); ctx.lineWidth=2.2;
        for(let pi=1;pi<Math.min(drawLen,trail.length);pi++){
          const a=0.2+(pi/trail.length)*0.8;
          ctx.globalAlpha=a; ctx.strokeStyle=col;
          const{px:x1,py:y1}=proj(trail[pi-1].x,trail[pi-1].y,trail[pi-1].z);
          const{px:x2,py:y2}=proj(trail[pi].x,trail[pi].y,trail[pi].z);
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        }
        ctx.restore();
      });

      // Animated sat dots along orbits (using phase-aligned positioning + dynamic warp)
      const phaseM=mainOrbit.phase+k*0.005*(1/(mainOrbit.radius*mainOrbit.radius));
      const phaseO=otherOrbit.phase+k*0.005*(1/(otherOrbit.radius*otherOrbit.radius));

      function getPosAtPhase(orbit,ph){
        const x0=orbit.radius*Math.cos(ph),y0=orbit.radius*Math.sin(ph);
        const cI=Math.cos(orbit.inc),sI=Math.sin(orbit.inc),cO=Math.cos(orbit.raan),sO=Math.sin(orbit.raan);
        return {x:cO*x0-sO*cI*y0,y:sI*y0,z:sO*x0+cO*cI*y0};
      }
      const mPos=getPosAtPhase(mainParams,phaseM);
      const oPos=getPosAtPhase(otherParams,phaseO);

      // Project to 2D to measure distance and offset labels to prevent overlaps
      const p1=proj(mPos.x,mPos.y,mPos.z);
      const p2=proj(oPos.x,oPos.y,oPos.z);
      const dx=p2.px-p1.px;
      const dy=p2.py-p1.py;
      const dist=Math.sqrt(dx*dx+dy*dy);

      let label1Align="left";
      let label1OffX=8;
      let label2Align="left";
      let label2OffX=8;

      if(dist<55){
        if(dx>=0){
          label1Align="right";
          label1OffX=-8;
          label2Align="left";
          label2OffX=8;
        } else {
          label1Align="left";
          label1OffX=8;
          label2Align="right";
          label2OffX=-8;
        }
      }

      [[mPos,satColor,DESIGNATIONS[satId],ev.loser===satId,true,label1Align,label1OffX],
       [oPos,otherColor,otherDesig,ev.loser===otherId,false,label2Align,label2OffX]].forEach(([pos,col,desig,isLoser,isSel,align,offX])=>{
        if(!pos) return;
        const{px,py}=proj(pos.x,pos.y,pos.z);
        // Outer glow ring
        const gr=ctx.createRadialGradient(px,py,0,px,py,12);
        gr.addColorStop(0,hexToRgba(col,0.45));
        gr.addColorStop(1,hexToRgba(col,0));
        ctx.fillStyle=gr;
        ctx.beginPath(); ctx.arc(px,py,12,0,Math.PI*2); ctx.fill();
        // Dot
        ctx.fillStyle=col;
        ctx.beginPath(); ctx.arc(px,py,isSel?5.5:4,0,Math.PI*2); ctx.fill();
        // White center
        ctx.fillStyle="rgba(255,255,255,0.9)";
        ctx.beginPath(); ctx.arc(px,py,isSel?2:1.5,0,Math.PI*2); ctx.fill();

        // Thruster exhaust flame effect for maneuvering satellite during execution
        if(isLoser && tau > 0 && tau < 3.33){
          ctx.fillStyle="#FF5500";
          ctx.beginPath();
          const plumeAngle=frame*0.4;
          const pxPl=px - Math.cos(plumeAngle)*5.5;
          const pyPl=py - Math.sin(plumeAngle)*5.5;
          ctx.arc(pxPl,pyPl,1.5 + Math.sin(frame*0.3)*1.2,0,Math.PI*2);
          ctx.fill();
        }

        // Label (display full name, no truncation, with anti-overlap alignment)
        ctx.save(); ctx.fillStyle=col; ctx.font=`bold 8px 'IBM Plex Mono',monospace`;
        ctx.textAlign=align;
        ctx.fillText(desig,px+offX,py-3);
        if(isLoser){
          const isFiring = tau > 0 && tau < 3.33;
          ctx.fillStyle=isFiring ? "#FF7700" : T.alert;
          ctx.font=`bold 7px 'IBM Plex Mono',monospace`;
          ctx.fillText(isFiring ? "THRUSTING" : "MANEUVER",px+offX,py+7);
          
          // Pulsing ring
          const fa=0.4+Math.sin(frame*0.18)*0.4;
          ctx.globalAlpha=fa; ctx.strokeStyle=isFiring ? "#FF7700" : T.alert; ctx.lineWidth=1.2;
          ctx.beginPath(); ctx.arc(px,py,9+Math.sin(frame*0.12)*3,0,Math.PI*2); ctx.stroke();
        } else {
          ctx.fillStyle=T.ok;
          ctx.font=`7px 'IBM Plex Mono',monospace`;
          ctx.fillText("HOLD",px+offX,py+7);
        }
        ctx.restore();
      });

      // Conjunction point marker — midpoint of closest approach
      if(trailMain&&trailMain.length>0&&trailOther&&trailOther.length>0){
        const mEnd=trailMain[trailMain.length-1];
        const oEnd=trailOther[trailOther.length-1];
        if(mEnd&&oEnd){
          const mx=(mEnd.x+oEnd.x)/2,my=(mEnd.y+oEnd.y)/2,mz=(mEnd.z+oEnd.z)/2;
          const{px,py}=proj(mx,my,mz);
          const ca=0.5+Math.sin(frame*0.1)*0.5;
          ctx.save(); ctx.globalAlpha=ca; ctx.strokeStyle=T.critical; ctx.lineWidth=1;
          ctx.beginPath(); ctx.arc(px,py,6,0,Math.PI*2); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(px-5,py); ctx.lineTo(px+5,py); ctx.moveTo(px,py-5); ctx.lineTo(px,py+5); ctx.stroke();
          ctx.restore();
        }
      }

      // ── Timeline HUD Player ────────────────────────────────────────────────
      const ty=16;
      ctx.strokeStyle="rgba(26,42,62,0.6)"; ctx.lineWidth=3; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(40,ty); ctx.lineTo(W-40,ty); ctx.stroke();

      const playedPercent=elapsed/10000;
      ctx.strokeStyle="rgba(91,168,208,0.8)"; ctx.lineWidth=3;
      ctx.beginPath(); ctx.moveTo(40,ty); ctx.lineTo(40+playedPercent*(W-80),ty); ctx.stroke();

      ctx.fillStyle="rgba(200,64,64,0.7)";
      ctx.fillRect(CX-1,ty-4,2,9);

      const hx=40+playedPercent*(W-80);
      ctx.fillStyle="#5BA8D0";
      ctx.beginPath(); ctx.arc(hx,ty,4.5,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle="#C8D8E8"; ctx.lineWidth=1; ctx.stroke();

      ctx.fillStyle="rgba(74,96,128,0.75)"; ctx.font="7px 'IBM Plex Mono',monospace";
      ctx.textAlign="left"; ctx.fillText("-5.0s (entry)",40,ty+12);
      ctx.textAlign="right"; ctx.fillText("+5.0s (exit)",W-40,ty+12);
      ctx.textAlign="center"; ctx.fillStyle=T.critical;
      ctx.fillText("CONJUNCTION EVENT (0.0s)",CX,ty+12);

      ctx.fillStyle="#5BA8D0"; ctx.font="bold 8px 'IBM Plex Mono',monospace"; ctx.textAlign="left";
      ctx.fillText(`REPLAY: ${tau>=0?"+":""}${tau.toFixed(2)}s`,10,18);

      // Warning screen overlay on close approach
      if(Math.abs(tau)<0.35){
        ctx.save();
        ctx.fillStyle="rgba(200,64,64,0.12)";
        ctx.fillRect(0,0,W,H);
        ctx.strokeStyle=T.critical; ctx.lineWidth=1.5;
        ctx.strokeRect(6,6,W-12,H-12);
        ctx.fillStyle=T.critical; ctx.font="bold 9px 'IBM Plex Mono',monospace"; ctx.textAlign="center";
        ctx.fillText("⚠ CONJUNCTION WARNING — RESOLVED ⚠",CX,H-48);
        ctx.restore();
      }

      // Legend bar (display full names, no truncation)
      ctx.fillStyle="rgba(8,12,18,0.82)";
      ctx.fillRect(6,H-34,W-12,28);
      ctx.strokeStyle="#1A2A3E"; ctx.lineWidth=0.5;
      ctx.strokeRect(6,H-34,W-12,28);
      const lg=[
        {col:satColor,txt:`${DESIGNATIONS[satId]||"SAT"} (selected)`,dash:false},
        {col:otherColor,txt:`${otherDesig} (encounter)`,dash:true},
        {col:T.alert,txt:"▶ MANEUVER"},
        {col:T.ok,txt:"● RETAIN"},
        {col:T.critical,txt:"✕ CLOSEST APPROACH"},
      ];
      lg.forEach(({col,txt,dash},ii)=>{
        const x=14+ii*112,y=H-14;
        if(dash){
          ctx.save(); ctx.strokeStyle=col; ctx.lineWidth=1.5; ctx.setLineDash([3,2]);
          ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+10,y); ctx.stroke(); ctx.restore();
        } else {
          ctx.fillStyle=col; ctx.beginPath(); ctx.arc(x+4,y,3,0,Math.PI*2); ctx.fill();
        }
        ctx.fillStyle=col; ctx.font=`7px 'IBM Plex Mono',monospace`; ctx.textAlign="left";
        ctx.fillText(txt,x+13,y+2.5);
      });

      frame++;
      rafId=requestAnimationFrame(draw);
    }

    draw();
    return()=>{
      cancelAnimationFrame(rafId);
      cv.removeEventListener("mousedown",onMouseDown);
      window.removeEventListener("mousemove",onMouseMove);
      window.removeEventListener("mouseup",onMouseUp);
      cv.removeEventListener("wheel",onWheel);
      cv.removeEventListener("touchstart",onTouchStart);
      window.removeEventListener("touchmove",onTouchMove);
      window.removeEventListener("touchend",onTouchEnd);
      window.removeEventListener("keydown",onKeyDown);
    };
  },[events,satId,satColor,activeEvent,isReplayPaused]);

  return(
    <div style={{borderBottom:`1px solid ${T.border}`,background:"#080C12",position:"relative"}}>
      {events&&events.length>0&&(
        <div style={{display:"flex",gap:0,padding:"5px 8px",borderBottom:`1px solid ${T.border}`,overflowX:"auto",flexWrap:"nowrap",background:T.surfaceRaised,alignItems:"center"}}>
          <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary,marginRight:8,whiteSpace:"nowrap",flexShrink:0}}>EVENT:</span>
          {events.map((r,idx)=>{
            const isMnv=r.loser===satId;
            const oid=r.satA===satId?r.satB:r.satA;
            const ocol=T.sat[oid]||"#888";
            return(
              <button key={idx} onClick={()=>setActiveEvent(idx)} style={{
                background:activeEvent===idx?hexToRgba(ocol,0.18):"transparent",
                border:`1px solid ${activeEvent===idx?ocol:T.border}`,
                color:activeEvent===idx?ocol:T.inkSecondary,
                fontFamily:F.mono,fontSize:8,padding:"2px 7px",cursor:"pointer",
                borderRadius:0,whiteSpace:"nowrap",marginRight:4,flexShrink:0,
              }}>
                #{String(r.seq).padStart(3,"0")} vs {DESIGNATIONS[oid]||"SAT"}
                <span style={{color:isMnv?T.alert:T.ok,marginLeft:4}}>{isMnv?"↗MNVR":"●HOLD"}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Floating Replay & HUD controls */}
      {events&&events.length>0&&(
        <div style={{
          position:"absolute",top:34,left:12,display:"flex",gap:6,zIndex:10
        }}>
          <button
            onClick={()=>setIsReplayPaused(p=>!p)}
            style={{
              background:T.surfaceRaised,
              border:`1px solid ${isReplayPaused?T.alert:T.border}`,
              color:isReplayPaused?T.alert:T.inkPrimary,
              fontFamily:F.mono,fontSize:8,padding:"2px 8px",cursor:"pointer",
              borderRadius:2,display:"flex",alignItems:"center",gap:4
            }}
          >
            {isReplayPaused?"▶ PLAY":"⏸ PAUSE"}
          </button>
          <button
            onClick={()=>{
              rotXRef.current=0.5;
              rotYRef.current=-0.3;
              zoomRef.current=82;
            }}
            style={{
              background:T.surfaceRaised,
              border:`1px solid ${T.border}`,
              color:T.inkSecondary,
              fontFamily:F.mono,fontSize:8,padding:"2px 8px",cursor:"pointer",
              borderRadius:2
            }}
          >
            RESET CAM
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        style={{
          display:"block",
          width:"100%",
          height:"auto",
          cursor:isDragging?"grabbing":"grab"
        }}
      />
      <div style={{display:"flex",justifyContent:"space-between",padding:"3px 10px",background:T.surfaceRaised,borderTop:`1px solid ${T.border}`}}>
        <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary}}>SOLID=selected orbit · DASHED=encounter orbit · BRIGHT TRAIL=approaching path · ✕=conjunction · REPLAY LOOP (10s)</span>
        <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary}}>3D INTERACTIVE · DRAG TO ROTATE · SCROLL TO ZOOM · CLICK TO PLAY/PAUSE · DRAG TIMELINE TO SCRUB · SPACEBAR</span>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function PanelHeader({label,sub,children}){
  return(
    <div style={css.panelHeader}>
      <div>
        <div style={css.panelLabel}>{label}</div>
        {sub&&<div style={css.panelSub}>{sub}</div>}
      </div>
      {children&&<div style={css.panelControls}>{children}</div>}
    </div>
  );
}
function StatusPill({label,value,color,mono}){
  return(
    <div style={css.pill}>
      <span style={css.pillLabel}>{label}</span>
      <span style={{...css.pillValue,color,fontFamily:mono?F.mono:F.cond}}>{value}</span>
    </div>
  );
}
function CtrlBtn({children,onClick,active}){
  return(
    <button style={{
      ...css.ctrlBtn,
      color:active===undefined?T.inkPrimary:active?T.data:T.inkSecondary,
      borderColor:active?T.borderActive:T.border,
    }} onClick={onClick}>{children}</button>
  );
}
function SatRow({label,val,color}){
  return(
    <div style={{display:"flex",justifyContent:"space-between",padding:"2px 0"}}>
      <span style={{color:T.inkSecondary,fontFamily:F.mono,fontSize:9,letterSpacing:"0.07em"}}>{label}</span>
      <span style={{color:color||T.inkPrimary,fontFamily:F.mono,fontSize:9,fontWeight:600}}>{val}</span>
    </div>
  );
}
function ConjRow({c,sats}){
  const sA=sats[c.a],sB=sats[c.b];
  if(!sA||!sB) return null;
  const bA=computeBid(sA),bB=computeBid(sB);
  const winner=bA>=bB?sA:sB,loser=bA>=bB?sB:sA;
  return(
    <div style={css.conjRow}>
      <div style={css.conjLeft}>
        <span style={{color:T.alert,fontWeight:600}}>⚠</span>
        <span style={{color:T.inkPrimary,fontSize:10}}>{sA.designation}</span>
        <span style={{color:T.inkSecondary}}>↔</span>
        <span style={{color:T.inkPrimary,fontSize:10}}>{sB.designation}</span>
        <span style={{color:T.critical,marginLeft:6,fontSize:10}}>Pc {(c.pc*100).toFixed(0)}%</span>
      </div>
      <div style={css.conjRight}>
        <span style={{color:T.ok,fontSize:9,fontFamily:F.mono}}>{winner.designation}</span>
        <span style={{color:T.inkSecondary,margin:"0 5px",fontSize:9}}>→ maneuver</span>
        <span style={{color:T.alert,fontSize:9,fontFamily:F.mono}}>{loser.designation}</span>
      </div>
    </div>
  );
}
function CoeffChip({label,val,note}){
  return(
    <div style={css.coeffChip}>
      <span style={{fontFamily:F.mono,fontSize:8,color:T.inkSecondary}}>{label} =</span>
      <span style={{fontFamily:F.mono,fontSize:12,color:T.inkPrimary,fontWeight:600}}>{val}</span>
      <span style={{fontFamily:F.mono,fontSize:7,color:T.inkMuted,marginTop:1}}>{note}</span>
    </div>
  );
}
function EmptyState({msg}){return <div style={css.empty}>{msg}</div>;}

// ─── Styles ───────────────────────────────────────────────────────────────────
const css={
  root:{background:T.bg,minHeight:"100vh",color:T.inkPrimary,fontFamily:F.cond,fontSize:13,lineHeight:1.4},
  topBar:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0 16px",height:48,borderBottom:`1px solid ${T.border}`,background:T.surface,flexShrink:0},
  topLeft:{display:"flex",flexDirection:"column",gap:1},
  sysLabel:{fontFamily:F.cond,fontWeight:700,fontSize:14,letterSpacing:"0.12em",color:T.inkPrimary},
  sysVersion:{fontFamily:F.mono,fontSize:8,color:T.inkSecondary,letterSpacing:"0.08em"},
  topRight:{display:"flex",gap:14,alignItems:"center",flexWrap:"wrap"},
  pill:{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:1},
  pillLabel:{fontFamily:F.mono,fontSize:8,color:T.inkSecondary,letterSpacing:"0.1em"},
  pillValue:{fontFamily:F.cond,fontWeight:600,fontSize:12},
  main:{display:"flex",gap:16,padding:16,flexWrap:"wrap",alignItems:"flex-start"},
  canvasCol:{display:"flex",flexDirection:"column",gap:0,flexShrink:0},
  globeWrap:{width:600,height:560,background:T.bg,cursor:"grab",overflow:"hidden",display:"block"},

  // Toast INSIDE the globe wrapper — no layout impact
  toast:{
    position:"absolute",bottom:12,left:"50%",transform:"translateX(-50%)",
    background:hexRgba("#0E1520",0.95),
    border:`1px solid ${T.critical}`,
    color:T.inkPrimary,fontFamily:F.mono,fontSize:10,
    padding:"6px 14px",whiteSpace:"nowrap",zIndex:20,
    animation:"fadeInDown 0.25s ease-out",
    pointerEvents:"none",
  },
  pausedBadge:{
    position:"absolute",top:8,left:"50%",transform:"translateX(-50%)",
    background:hexRgba("#0E1520",0.88),border:`1px solid ${T.alert}`,
    color:T.alert,fontFamily:F.mono,fontSize:9,padding:"4px 10px",
    zIndex:20,pointerEvents:"none",letterSpacing:"0.06em",
  },

  satCard:{
    position:"absolute",zIndex:15,minWidth:210,
    background:hexRgba("#0E1520",0.97),
    border:`1px solid ${T.borderActive}`,
    backdropFilter:"blur(6px)",
    animation:"fadeInDown 0.18s ease-out",
    boxShadow:`0 0 20px rgba(91,168,208,0.15)`,
  },
  satCardHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",borderBottom:`1px solid ${T.border}`,background:T.surfaceRaised},
  satCardBody:{padding:"8px 10px",display:"flex",flexDirection:"column",gap:3},
  satCardFoot:{padding:"4px 10px",borderTop:`1px solid ${T.border}`,fontFamily:F.mono,fontSize:8,color:T.inkSecondary},
  closeBtn:{background:"transparent",border:"none",color:T.inkSecondary,cursor:"pointer",fontSize:11,padding:"0 2px",lineHeight:1},

  controlsBar:{display:"flex",alignItems:"center",gap:0,border:`1px solid ${T.border}`,borderTop:"none",background:T.surfaceRaised},
  sliderRow:{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",flex:1},
  sliderDivider:{width:1,height:28,background:T.border,flexShrink:0},
  sliderLabel:{fontFamily:F.mono,fontSize:8,color:T.inkSecondary,letterSpacing:"0.1em",whiteSpace:"nowrap",minWidth:42},
  sliderVal:{fontFamily:F.mono,fontSize:11,fontWeight:600,minWidth:36,textAlign:"right"},
  canvasFooter:{display:"flex",gap:14,padding:"5px 10px",background:T.surface,border:`1px solid ${T.border}`,borderTop:"none"},
  footNote:{fontFamily:F.mono,fontSize:8,color:T.inkSecondary},

  rightCol:{flex:1,minWidth:320,display:"flex",flexDirection:"column",gap:10},
  panel:{background:T.surface,border:`1px solid ${T.border}`},
  panelHeader:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 12px",borderBottom:`1px solid ${T.border}`,background:T.surfaceRaised,gap:8},
  panelLabel:{fontFamily:F.cond,fontWeight:700,fontSize:11,letterSpacing:"0.12em",color:T.inkPrimary},
  panelSub:{fontFamily:F.mono,fontSize:8,color:T.inkSecondary,marginTop:1},
  panelControls:{display:"flex",gap:5,flexWrap:"wrap",flexShrink:0},
  ctrlBtn:{background:"transparent",border:`1px solid ${T.border}`,fontFamily:F.mono,fontSize:8,letterSpacing:"0.06em",padding:"3px 7px",cursor:"pointer",transition:"all 0.12s",borderRadius:0,color:T.inkPrimary},
  tinyBtn:{background:"transparent",border:`1px solid ${T.border}`,fontFamily:F.mono,fontSize:10,padding:"1px 4px",cursor:"pointer",borderRadius:0,lineHeight:1.2},

  table:{width:"100%",borderCollapse:"collapse"},
  th:{padding:"4px 8px",textAlign:"left",fontSize:8,color:T.inkSecondary,letterSpacing:"0.1em",fontWeight:500,borderBottom:`1px solid ${T.border}`,background:T.surfaceRaised},
  tr:{borderBottom:`1px solid ${T.border}`},
  td:{padding:"4px 8px",fontSize:10,color:T.inkPrimary},
  tdMono:{padding:"4px 8px",fontSize:10,fontFamily:F.mono,color:T.inkPrimary,textAlign:"right"},
  tdStatus:{padding:"4px 8px",fontFamily:F.mono,letterSpacing:"0.06em",fontWeight:600},

  formulaBlock:{padding:"10px 14px",borderBottom:`1px solid ${T.border}`},
  formulaEq:{fontFamily:F.mono,fontSize:12,color:T.data,textAlign:"center",padding:"6px 0 8px"},
  formulaCoeffs:{display:"flex",gap:8,justifyContent:"center",marginBottom:6},
  formulaRule:{fontFamily:F.mono,fontSize:8,color:T.inkSecondary,textAlign:"center",borderTop:`1px solid ${T.border}`,paddingTop:6,marginTop:4},
  coeffChip:{display:"flex",flexDirection:"column",alignItems:"center",border:`1px solid ${T.border}`,padding:"3px 10px",background:T.surfaceRaised},

  conjRow:{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 12px",borderBottom:`1px solid ${T.border}`,fontFamily:F.mono,gap:6,flexWrap:"wrap",background:hexRgba(T.alert,0.04)},
  conjLeft:{display:"flex",gap:5,alignItems:"center"},
  conjRight:{display:"flex",alignItems:"center",gap:3},

  empty:{padding:"12px",fontFamily:F.mono,fontSize:10,color:T.inkSecondary,textAlign:"center"},
  ledgerHead:{display:"grid",gridTemplateColumns:"44px 90px 1fr 110px 110px 70px 70px 150px",padding:"4px 12px",background:T.surfaceRaised,borderBottom:`1px solid ${T.border}`,gap:6},
  lhCell:{fontFamily:F.mono,fontSize:8,color:T.inkSecondary,letterSpacing:"0.07em"},
  ledgerRow:{display:"grid",gridTemplateColumns:"44px 90px 1fr 110px 110px 70px 70px 150px",padding:"4px 12px",gap:6,borderBottom:`1px solid ${T.border}`,alignItems:"center"},
};

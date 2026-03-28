import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

// ─── PALETA ────────────────────────────────────────────────────────────────────
const C = {
  bg:"#F7F6F2", surface:"#FFFFFF", border:"#E8E4DC",
  navy:"#1A2332", teal:"#0D7377", tealLight:"#E6F4F4",
  amber:"#C8841A", amberLight:"#FDF3E3",
  red:"#C0392B", redLight:"#FDEDEC",
  green:"#1E7E4E", greenLight:"#E8F8EF",
  gray:"#7A7A7A", grayLight:"#F0EEE9", text:"#1A2332",
};

// ─── DATOS MAESTROS ────────────────────────────────────────────────────────────
const EQUIPO_INICIAL = [
  { id:1, nombre:"Marycarmen Reséndiz", rol:"Project Manager" },
  { id:2, nombre:"Marycarmen Reséndiz", rol:"Formuladora" },
  { id:3, nombre:"Anabel Zárate",        rol:"Regulatorios" },
  { id:4, nombre:"Mario Alberto García", rol:"Empaque" },
  { id:5, nombre:"Eder Fabián Estudillo",rol:"Diseño" },
];
const MAQUILADORES = [
  { nombre:"MMN", pais:"México" },
  { nombre:"Procaps", pais:"Colombia" },
  { nombre:"Absara", pais:"México" },
];
const CATEGORIAS = ["OTC","Cosmético","Ambos"];
const FORMAS = ["Tableta","Cápsula","Sachet","Jarabe","Crema","Shampoo","Loción","Gel","Spray","Otro"];
const PRIORIDADES = ["Alta","Media","Baja"];
const ESTADOS_TAREA = ["Pendiente","En progreso","Completado","Bloqueado"];
const ESTADOS_ETAPA = ["Pendiente","En progreso","Completado","Bloqueado"];

const ETAPAS_DEFECTO = [
  { id:"registro",     label:"Registro Sanitario",   icon:"🏛️" },
  { id:"brief",        label:"Brief",                icon:"📋" },
  { id:"diseno",       label:"Diseño",               icon:"🎨" },
  { id:"cotizaciones", label:"Cotizaciones",         icon:"💲" },
  { id:"contrato",     label:"Contrato",             icon:"📝" },
  { id:"pruebas",      label:"Pruebas",              icon:"🧪" },
  { id:"codigos_v",    label:"Códigos vacíos",       icon:"🏷️" },
  { id:"arte",         label:"Arte",                 icon:"🖼️" },
  { id:"specs",        label:"Especificaciones",     icon:"📐" },
  { id:"printcard",    label:"Printcard",            icon:"🖨️" },
  { id:"codigos_c",    label:"Códigos completos",    icon:"✅" },
  { id:"oc",           label:"Órdenes de compra",    icon:"🛒" },
  { id:"fabricacion",  label:"Fabricación",          icon:"🏭" },
  { id:"pt_cedis",     label:"PT en CEDIS",          icon:"🚛" },
];
const ENTREGABLES_DEFECTO = {
  registro:    ["Registro COFEPRIS vigente","Número de registro sanitario"],
  brief:       ["Brief firmado por cliente","Ficha técnica preliminar"],
  diseno:      ["Brief de diseño aprobado","Concepto visual alineado"],
  cotizaciones:["Cotización maquilador","Cotización materiales","P&L aprobado"],
  contrato:    ["Contrato firmado","NDA firmado","Orden de inicio"],
  pruebas:     ["Fórmula maestra aprobada","Reporte de estabilidad","Lote piloto"],
  codigos_v:   ["Códigos SAP creados (vacíos)","BOM preliminar"],
  arte:        ["Arte aprobado cliente","Arte aprobado Regulatorios"],
  specs:       ["Especificación PT","Especificación materiales empaque"],
  printcard:   ["Printcard firmada por todas las áreas"],
  codigos_c:   ["Códigos SAP completos","BOM final aprobada"],
  oc:          ["OC emitida a maquilador","OC materiales","Confirmación capacidad"],
  fabricacion: ["Lote fabricado","Liberación calidad","COA disponible"],
  pt_cedis:    ["PT físico en CEDIS","Factura emitida","Entrega confirmada"],
};

const mkEtapas = () => ETAPAS_DEFECTO.map(e => ({
  ...e, status:"Pendiente", fechaInicio:"", fechaFin:"", responsable:"", notas:"",
  entregables:(ENTREGABLES_DEFECTO[e.id]||[]).map(d=>({id:uid(),desc:d,done:false})),
}));

const PROYECTOS_EJEMPLO = [
  { id:1, nombre:"Genocurol", categoria:"OTC", forma:"Tableta", cliente:"Genomma Lab", maquilador:"MMN", pais:"México", color:"#0D7377", responsable:"Marycarmen Reséndiz", fechaInicio:"2026-01-10", fechaLanzamiento:"2026-08-30", descripcion:"Analgésico/antiinflamatorio OTC.", equipo:EQUIPO_INICIAL,
    etapas: ETAPAS_DEFECTO.map((e,i)=>({...e,status:i<5?"Completado":i===5?"En progreso":"Pendiente",fechaInicio:i===0?"2026-01-10":i===1?"2026-01-20":i===2?"2026-02-01":i===3?"2026-02-15":i===4?"2026-03-01":i===5?"2026-03-15":"",fechaFin:i===0?"2026-01-18":i===1?"2026-01-28":i===2?"2026-02-10":i===3?"2026-02-28":i===4?"2026-03-10":"",responsable:i<3?"Anabel Zárate":"Marycarmen Reséndiz",notas:"",entregables:(ENTREGABLES_DEFECTO[e.id]||[]).map(d=>({id:uid(),desc:d,done:i<5}))})),
    tareas:[{id:1,nombre:"Reporte estabilidad 3 meses",responsable:"Marycarmen Reséndiz",fechaLimite:"2026-04-15",status:"En progreso",prioridad:"Alta",notas:"40°C/75%HR"}], minutas:[] },
  { id:2, nombre:"Medicasp", categoria:"Cosmético", forma:"Shampoo", cliente:"Genomma Lab", maquilador:"MMN", pais:"México", color:"#1E7E4E", responsable:"Marycarmen Reséndiz", fechaInicio:"2025-09-15", fechaLanzamiento:"2026-05-01", descripcion:"Shampoo anticaspa con zinc piritionato.", equipo:EQUIPO_INICIAL,
    etapas: ETAPAS_DEFECTO.map((e,i)=>({...e,status:i<10?"Completado":i===10?"En progreso":"Pendiente",fechaInicio:"",fechaFin:"",responsable:"",notas:"",entregables:(ENTREGABLES_DEFECTO[e.id]||[]).map(d=>({id:uid(),desc:d,done:i<10}))})),
    tareas:[{id:1,nombre:"Completar BOM en SAP",responsable:"Mario Alberto García",fechaLimite:"2026-03-31",status:"En progreso",prioridad:"Alta",notas:"Faltan 3 materiales"}], minutas:[] },
];

// ─── HELPERS ───────────────────────────────────────────────────────────────────
const progreso = p => { const d=p.etapas.filter(e=>e.status==="Completado").length; return p.etapas.length?Math.round(d/p.etapas.length*100):0; };
const diasR = f => Math.ceil((new Date(f)-new Date())/86400000);
const uid = () => Math.random().toString(36).slice(2)+Date.now().toString(36);
const fmtDate = d => { if(!d)return""; const dt=new Date(d+"T12:00:00"); return dt.toLocaleDateString("es-MX",{day:"2-digit",month:"short"}); };

// ─── COMPONENTES BASE ──────────────────────────────────────────────────────────
function Badge({label}){
  const m={Completado:{bg:C.greenLight,c:C.green},"En progreso":{bg:C.tealLight,c:C.teal},Pendiente:{bg:C.amberLight,c:C.amber},Bloqueado:{bg:C.redLight,c:C.red},Alta:{bg:C.redLight,c:C.red},Media:{bg:C.amberLight,c:C.amber},Baja:{bg:C.greenLight,c:C.green},admin:{bg:"#EDE9FE",c:"#5B21B6"},viewer:{bg:C.grayLight,c:C.gray}};
  const s=m[label]||{bg:C.grayLight,c:C.gray};
  return <span style={{background:s.bg,color:s.c,borderRadius:5,padding:"2px 9px",fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{label}</span>;
}
function Pill({label,color}){return <span style={{background:color+"22",color,borderRadius:20,padding:"2px 10px",fontSize:11,fontWeight:600,border:`1px solid ${color}44`}}>{label}</span>;}
function Bar({value,color,h=5}){return(<div style={{background:"#E8E4DC",borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${Math.min(100,value)}%`,background:color,height:"100%",borderRadius:99,transition:"width .6s"}}/></div>);}
function Avatar({nombre,size=28}){const ini=(nombre||"?").split(" ").slice(0,2).map(n=>n[0]).join("").toUpperCase();const hue=(nombre||"").split("").reduce((a,c)=>a+c.charCodeAt(0),0)%360;return(<div style={{width:size,height:size,borderRadius:"50%",background:`hsl(${hue},45%,88%)`,color:`hsl(${hue},45%,35%)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.35,fontWeight:700,flexShrink:0}}>{ini}</div>);}
function Btn({children,v="primary",...p}){const s={primary:{background:C.teal,color:"#fff",border:"none"},secondary:{background:C.surface,color:C.gray,border:`1px solid ${C.border}`},danger:{background:C.redLight,color:C.red,border:"none"},ghost:{background:"transparent",color:C.teal,border:`1px solid ${C.teal}`},purple:{background:"#EDE9FE",color:"#5B21B6",border:"none"}};return <button {...p} style={{padding:"7px 15px",borderRadius:8,cursor:"pointer",fontSize:13,fontWeight:500,whiteSpace:"nowrap",...(s[v]||s.primary),...(p.style||{})}}>{children}</button>;}
function Field({label,children}){return(<div><label style={{fontSize:11,color:C.gray,display:"block",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{label}</label>{children}</div>);}
function Inp({...p}){return <input {...p} style={{width:"100%",padding:"8px 11px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box",outline:"none",background:C.surface,fontFamily:"inherit",...(p.style||{})}}/>;}
function Sel({children,...p}){return <select {...p} style={{width:"100%",padding:"8px 11px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,boxSizing:"border-box",outline:"none",background:C.surface,fontFamily:"inherit",...(p.style||{})}}>{children}</select>;}
function Overlay({children}){return <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:70,display:"flex",alignItems:"center",justifyContent:"center"}}>{children}</div>;}
function Spinner(){return <div style={{width:32,height:32,border:`3px solid ${C.border}`,borderTopColor:C.teal,borderRadius:"50%",animation:"spin 0.8s linear infinite"}}><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;}

// ══════════════════════════════════════════════════════════════════════════════
// ─── PANTALLA DE LOGIN ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function LoginScreen({onLogin}){
  const [mode,setMode]=useState("login"); // login | register | forgot
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [nombre,setNombre]=useState("");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const [msg,setMsg]=useState("");

  const handleLogin=async()=>{
    if(!email||!password){setError("Completa email y contraseña");return;}
    setLoading(true);setError("");
    const {error}=await supabase.auth.signInWithPassword({email,password});
    if(error)setError(error.message==="Invalid login credentials"?"Email o contraseña incorrectos":error.message);
    setLoading(false);
  };

  const handleRegister=async()=>{
    if(!email||!password||!nombre){setError("Completa todos los campos");return;}
    if(password.length<6){setError("La contraseña debe tener al menos 6 caracteres");return;}
    setLoading(true);setError("");
    const {data,error}=await supabase.auth.signUp({email,password});
    if(error){setError(error.message);setLoading(false);return;}
    if(data.user){
      await supabase.from("user_profiles").update({nombre}).eq("id",data.user.id);
    }
    setMsg("¡Cuenta creada! Ya puedes iniciar sesión.");
    setMode("login");setLoading(false);
  };

  const handleForgot=async()=>{
    if(!email){setError("Escribe tu email");return;}
    setLoading(true);setError("");
    const {error}=await supabase.auth.resetPasswordForEmail(email);
    if(error)setError(error.message);
    else setMsg("Te enviamos un link para restablecer tu contraseña.");
    setLoading(false);
  };

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,padding:16}}>
      <div style={{background:C.surface,borderRadius:20,padding:36,width:"100%",maxWidth:400,boxShadow:"0 8px 40px rgba(0,0,0,0.1)"}}>
        {/* Logo */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:14,background:C.teal,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,margin:"0 auto 12px"}}>💊</div>
          <div style={{fontSize:20,fontWeight:800,color:C.text,letterSpacing:-0.5}}>Gestión de Proyectos</div>
          <div style={{fontSize:13,color:C.gray,marginTop:2}}>OTC · Cosméticos · Manufactura</div>
        </div>

        {msg&&<div style={{background:C.greenLight,color:C.green,borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16,textAlign:"center"}}>{msg}</div>}
        {error&&<div style={{background:C.redLight,color:C.red,borderRadius:8,padding:"10px 14px",fontSize:13,marginBottom:16}}>{error}</div>}

        {mode==="login"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Field label="Email"><Inp type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com" onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></Field>
            <Field label="Contraseña"><Inp type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&handleLogin()}/></Field>
            <button onClick={handleLogin} disabled={loading}
              style={{padding:"11px 0",borderRadius:9,border:"none",background:C.teal,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?<Spinner/>:"Iniciar sesión"}
            </button>
            <div style={{textAlign:"center",fontSize:13,color:C.gray,display:"flex",gap:12,justifyContent:"center",marginTop:4}}>
              <button onClick={()=>{setMode("register");setError("");}} style={{background:"none",border:"none",color:C.teal,cursor:"pointer",fontSize:13}}>Crear cuenta</button>
              <span>·</span>
              <button onClick={()=>{setMode("forgot");setError("");}} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:13}}>¿Olvidaste tu contraseña?</button>
            </div>
          </div>
        )}

        {mode==="register"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <Field label="Nombre completo"><Inp value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Tu nombre"/></Field>
            <Field label="Email"><Inp type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/></Field>
            <Field label="Contraseña (mín. 6 caracteres)"><Inp type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></Field>
            <button onClick={handleRegister} disabled={loading}
              style={{padding:"11px 0",borderRadius:9,border:"none",background:C.teal,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:4,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?<Spinner/>:"Crear cuenta"}
            </button>
            <button onClick={()=>{setMode("login");setError("");}} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:13,textAlign:"center"}}>← Volver al login</button>
          </div>
        )}

        {mode==="forgot"&&(
          <div style={{display:"flex",flexDirection:"column",gap:12}}>
            <div style={{fontSize:13,color:C.gray,marginBottom:4}}>Ingresa tu email y te enviaremos un link para restablecer tu contraseña.</div>
            <Field label="Email"><Inp type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="tu@email.com"/></Field>
            <button onClick={handleForgot} disabled={loading}
              style={{padding:"11px 0",borderRadius:9,border:"none",background:C.teal,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {loading?<Spinner/>:"Enviar link"}
            </button>
            <button onClick={()=>{setMode("login");setError("");}} style={{background:"none",border:"none",color:C.gray,cursor:"pointer",fontSize:13,textAlign:"center"}}>← Volver al login</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── GESTIÓN DE USUARIOS (solo admin) ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
function UsuariosModal({onClose}){
  const [usuarios,setUsuarios]=useState([]);
  const [loading,setLoading]=useState(true);
  const [invEmail,setInvEmail]=useState("");
  const [invNombre,setInvNombre]=useState("");
  const [invRol,setInvRol]=useState("viewer");
  const [invPass,setInvPass]=useState("");
  const [msg,setMsg]=useState("");
  const [err,setErr]=useState("");

  useEffect(()=>{
    supabase.from("user_profiles").select("*").order("created_at").then(({data})=>{setUsuarios(data||[]);setLoading(false);});
  },[]);

  const changeRol=async(id,rol)=>{
    await supabase.from("user_profiles").update({rol}).eq("id",id);
    setUsuarios(u=>u.map(x=>x.id===id?{...x,rol}:x));
  };

  const invitar=async()=>{
    if(!invEmail||!invPass||!invNombre){setErr("Completa todos los campos");return;}
    setErr("");setMsg("");
    const {data,error}=await supabase.auth.admin.createUser({email:invEmail,password:invPass,email_confirm:true});
    if(error){
      // Si no tenemos service_role key usamos signUp normal
      const {data:d2,error:e2}=await supabase.auth.signUp({email:invEmail,password:invPass});
      if(e2){setErr("Error: "+e2.message);return;}
      if(d2.user){
        await supabase.from("user_profiles").update({nombre:invNombre,rol:invRol}).eq("id",d2.user.id);
        setMsg(`✅ Usuario ${invNombre} creado. Comparte las credenciales.`);
        setUsuarios(u=>[...u,{id:d2.user.id,email:invEmail,nombre:invNombre,rol:invRol}]);
      }
    } else {
      if(data.user){
        await supabase.from("user_profiles").update({nombre:invNombre,rol:invRol}).eq("id",data.user.id);
        setMsg(`✅ Usuario ${invNombre} creado.`);
        setUsuarios(u=>[...u,{id:data.user.id,email:invEmail,nombre:invNombre,rol:invRol}]);
      }
    }
    setInvEmail("");setInvNombre("");setInvPass("");
  };

  return(<Overlay><div style={{background:C.surface,borderRadius:16,padding:24,width:"92%",maxWidth:540,maxHeight:"88vh",overflowY:"auto"}}>
    <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>Gestión de usuarios</div>
    <div style={{fontSize:13,color:C.gray,marginBottom:18}}>Los <b>admin</b> pueden crear/editar proyectos. Los <b>viewer</b> solo pueden consultar.</div>

    {/* Lista usuarios */}
    {loading?<div style={{textAlign:"center",padding:20}}><Spinner/></div>:
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
        {usuarios.map(u=>(
          <div key={u.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:C.grayLight,borderRadius:9}}>
            <Avatar nombre={u.nombre||u.email} size={32}/>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:600,color:C.text}}>{u.nombre||"Sin nombre"}</div>
              <div style={{fontSize:11,color:C.gray}}>{u.email}</div>
            </div>
            <Sel value={u.rol} onChange={e=>changeRol(u.id,e.target.value)} style={{width:100,fontSize:12,padding:"4px 8px"}}>
              <option value="admin">admin</option>
              <option value="viewer">viewer</option>
            </Sel>
          </div>
        ))}
      </div>
    }

    {/* Crear usuario */}
    <div style={{background:C.tealLight,borderRadius:10,padding:16}}>
      <div style={{fontSize:13,fontWeight:600,color:C.teal,marginBottom:12}}>Crear nuevo usuario</div>
      {msg&&<div style={{background:C.greenLight,color:C.green,borderRadius:7,padding:"8px 12px",fontSize:12,marginBottom:10}}>{msg}</div>}
      {err&&<div style={{background:C.redLight,color:C.red,borderRadius:7,padding:"8px 12px",fontSize:12,marginBottom:10}}>{err}</div>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <Field label="Nombre"><Inp value={invNombre} onChange={e=>setInvNombre(e.target.value)} placeholder="Nombre completo"/></Field>
          <Field label="Rol"><Sel value={invRol} onChange={e=>setInvRol(e.target.value)}><option value="viewer">viewer</option><option value="admin">admin</option></Sel></Field>
        </div>
        <Field label="Email"><Inp type="email" value={invEmail} onChange={e=>setInvEmail(e.target.value)} placeholder="email@empresa.com"/></Field>
        <Field label="Contraseña temporal"><Inp type="text" value={invPass} onChange={e=>setInvPass(e.target.value)} placeholder="Mín. 6 caracteres"/></Field>
        <Btn onClick={invitar} style={{width:"100%"}}>+ Crear usuario</Btn>
      </div>
    </div>

    <div style={{marginTop:16,display:"flex",justifyContent:"flex-end"}}>
      <Btn v="secondary" onClick={onClose}>Cerrar</Btn>
    </div>
  </div></Overlay>);
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── COMPONENTES DE PROYECTO (mismos de antes, adaptados) ─────────────────────
// ══════════════════════════════════════════════════════════════════════════════

function ResponsablesModal({equipo,onSave,onClose}){
  const [lista,setLista]=useState(equipo.map(e=>({...e})));
  const [nuevo,setNuevo]=useState({nombre:"",rol:""});
  const add=()=>{if(!nuevo.nombre||!nuevo.rol)return;setLista(l=>[...l,{...nuevo,id:uid()}]);setNuevo({nombre:"",rol:""});};
  const del=(id)=>setLista(l=>l.filter(e=>e.id!==id));
  return(<Overlay><div style={{background:C.surface,borderRadius:16,padding:24,width:"92%",maxWidth:480,maxHeight:"85vh",overflowY:"auto"}}>
    <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:18}}>Gestionar responsables</div>
    <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
      {lista.map(e=><div key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:C.grayLight,borderRadius:8}}>
        <Avatar nombre={e.nombre} size={28}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:600}}>{e.nombre}</div><div style={{fontSize:11,color:C.gray}}>{e.rol}</div></div>
        <button onClick={()=>del(e.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:16}}>✕</button>
      </div>)}
    </div>
    <div style={{background:C.tealLight,borderRadius:10,padding:14,marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:600,color:C.teal,marginBottom:10}}>Agregar responsable</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
        <Field label="Nombre"><Inp value={nuevo.nombre} onChange={e=>setNuevo(f=>({...f,nombre:e.target.value}))} placeholder="Nombre completo"/></Field>
        <Field label="Rol"><Inp value={nuevo.rol} onChange={e=>setNuevo(f=>({...f,rol:e.target.value}))} placeholder="Ej. QA, Diseño…"/></Field>
      </div>
      <Btn onClick={add} style={{width:"100%"}}>+ Agregar</Btn>
    </div>
    <div style={{display:"flex",gap:10}}>
      <Btn v="secondary" style={{flex:1}} onClick={onClose}>Cancelar</Btn>
      <Btn style={{flex:1}} onClick={()=>{onSave(lista);onClose();}}>Guardar</Btn>
    </div>
  </div></Overlay>);
}

function EtapaModal({etapa,idx,proyecto,onSave,onClose}){
  const [form,setForm]=useState({...etapa,entregables:[...etapa.entregables.map(e=>({...e}))]});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const [nuevoEnt,setNuevoEnt]=useState("");
  const toggleEnt=(i)=>{const ents=[...form.entregables];ents[i]={...ents[i],done:!ents[i].done};set("entregables",ents);};
  const delEnt=(i)=>set("entregables",form.entregables.filter((_,j)=>j!==i));
  const addEnt=()=>{if(!nuevoEnt.trim())return;set("entregables",[...form.entregables,{id:uid(),desc:nuevoEnt.trim(),done:false}]);setNuevoEnt("");};
  const nombres=[...new Set(proyecto.equipo.map(e=>e.nombre))];
  return(<Overlay><div style={{background:C.surface,borderRadius:16,padding:26,width:"92%",maxWidth:520,maxHeight:"90vh",overflowY:"auto"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
      <span style={{fontSize:22}}>{etapa.icon}</span>
      <div><div style={{fontSize:16,fontWeight:700,color:C.text}}>{etapa.label}</div><div style={{fontSize:12,color:C.gray}}>Paso {idx+1}</div></div>
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <Field label="Estado"><Sel value={form.status} onChange={e=>set("status",e.target.value)}>{ESTADOS_ETAPA.map(s=><option key={s}>{s}</option>)}</Sel></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Fecha inicio"><Inp type="date" value={form.fechaInicio} onChange={e=>set("fechaInicio",e.target.value)}/></Field>
        <Field label="Fecha fin compromiso"><Inp type="date" value={form.fechaFin} onChange={e=>set("fechaFin",e.target.value)}/></Field>
      </div>
      <Field label="Responsable"><Sel value={form.responsable} onChange={e=>set("responsable",e.target.value)}><option value="">— Seleccionar —</option>{nombres.map(n=><option key={n}>{n}</option>)}</Sel></Field>
      <Field label="Notas"><textarea value={form.notas} onChange={e=>set("notas",e.target.value)} rows={3} style={{width:"100%",padding:"8px 11px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,resize:"vertical",boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/></Field>
      <Field label="Entregables">
        <div style={{display:"flex",flexDirection:"column",gap:7,marginTop:4}}>
          {form.entregables.map((ent,i)=>(
            <div key={ent.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",background:ent.done?C.greenLight:C.grayLight,borderRadius:8,border:`1px solid ${ent.done?C.green+"44":C.border}`}}>
              <div onClick={()=>toggleEnt(i)} style={{width:18,height:18,borderRadius:4,border:`2px solid ${ent.done?C.green:C.border}`,background:ent.done?C.green:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>
                {ent.done&&<span style={{color:"#fff",fontSize:11}}>✓</span>}
              </div>
              <span onClick={()=>toggleEnt(i)} style={{fontSize:13,flex:1,cursor:"pointer",color:ent.done?C.green:C.text,textDecoration:ent.done?"line-through":"none"}}>{ent.desc}</span>
              <button onClick={()=>delEnt(i)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:14,padding:"0 2px"}}>✕</button>
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <Inp value={nuevoEnt} onChange={e=>setNuevoEnt(e.target.value)} placeholder="Nuevo entregable…" onKeyDown={e=>e.key==="Enter"&&addEnt()} style={{flex:1}}/>
            <Btn onClick={addEnt} style={{padding:"7px 14px"}}>+</Btn>
          </div>
        </div>
      </Field>
    </div>
    <div style={{display:"flex",gap:10,marginTop:20}}>
      <Btn v="secondary" style={{flex:1}} onClick={onClose}>Cancelar</Btn>
      <Btn style={{flex:1}} onClick={()=>{onSave(form,idx);onClose();}}>Guardar etapa</Btn>
    </div>
  </div></Overlay>);
}

function EtapasConfigModal({etapas,onSave,onClose}){
  const [lista,setLista]=useState(etapas.map(e=>({...e})));
  const [nueva,setNueva]=useState({label:"",icon:"📌"});
  const iconos=["📋","🎨","💲","📝","🧪","🏷️","🖼️","📐","🖨️","✅","🛒","🏭","🚛","📊","🔬","📦","🎯","🔧","📌"];
  const move=(i,dir)=>{const l=[...lista];const t=l[i];l[i]=l[i+dir];l[i+dir]=t;setLista(l);};
  const del=(id)=>setLista(l=>l.filter(e=>e.id!==id));
  const add=()=>{if(!nueva.label.trim())return;setLista(l=>[...l,{id:"custom_"+uid(),label:nueva.label.trim(),icon:nueva.icon,status:"Pendiente",fechaInicio:"",fechaFin:"",responsable:"",notas:"",entregables:[]}]);setNueva({label:"",icon:"📌"});};
  return(<Overlay><div style={{background:C.surface,borderRadius:16,padding:24,width:"92%",maxWidth:540,maxHeight:"90vh",overflowY:"auto"}}>
    <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:4}}>Configurar etapas del proceso</div>
    <div style={{fontSize:13,color:C.gray,marginBottom:16}}>Reordena, agrega o elimina etapas.</div>
    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:16}}>
      {lista.map((e,i)=>(
        <div key={e.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:C.grayLight,borderRadius:8}}>
          <span style={{fontSize:16}}>{e.icon}</span>
          <span style={{flex:1,fontSize:13,fontWeight:500}}>{e.label}</span>
          <button onClick={()=>i>0&&move(i,-1)} style={{background:"none",border:"none",cursor:"pointer",color:C.gray,fontSize:14,opacity:i===0?0.3:1}}>↑</button>
          <button onClick={()=>i<lista.length-1&&move(i,1)} style={{background:"none",border:"none",cursor:"pointer",color:C.gray,fontSize:14,opacity:i===lista.length-1?0.3:1}}>↓</button>
          <button onClick={()=>del(e.id)} style={{background:"none",border:"none",cursor:"pointer",color:C.red,fontSize:14}}>✕</button>
        </div>
      ))}
    </div>
    <div style={{background:C.tealLight,borderRadius:10,padding:14,marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:600,color:C.teal,marginBottom:10}}>Agregar etapa</div>
      <div style={{display:"grid",gridTemplateColumns:"auto 1fr",gap:10,marginBottom:10,alignItems:"end"}}>
        <Field label="Ícono"><Sel value={nueva.icon} onChange={e=>setNueva(f=>({...f,icon:e.target.value}))} style={{width:70}}>{iconos.map(ic=><option key={ic}>{ic}</option>)}</Sel></Field>
        <Field label="Nombre de la etapa"><Inp value={nueva.label} onChange={e=>setNueva(f=>({...f,label:e.target.value}))} placeholder="Ej. Validación Clínica"/></Field>
      </div>
      <Btn onClick={add} style={{width:"100%"}}>+ Agregar etapa</Btn>
    </div>
    <div style={{display:"flex",gap:10}}>
      <Btn v="secondary" style={{flex:1}} onClick={onClose}>Cancelar</Btn>
      <Btn style={{flex:1}} onClick={()=>{onSave(lista);onClose();}}>Guardar</Btn>
    </div>
  </div></Overlay>);
}

function Pipeline({proyecto,onEtapaClick}){
  return(
    <div style={{overflowX:"auto",paddingBottom:8}}>
      <div style={{display:"flex",alignItems:"flex-start",gap:0,minWidth:"max-content"}}>
        {proyecto.etapas.map((etapa,i)=>{
          const done=etapa.status==="Completado";
          const isActual=etapa.status==="En progreso";
          const bg=done?C.teal:isActual?proyecto.color:"#E8E4DC";
          return(
            <div key={etapa.id} style={{display:"flex",alignItems:"center"}}>
              <div onClick={()=>onEtapaClick(etapa,i)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:3,cursor:"pointer",padding:"0 4px"}}>
                <div style={{width:32,height:32,borderRadius:"50%",background:bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,border:isActual?`3px solid ${proyecto.color}`:"none",boxShadow:isActual?`0 0 0 3px ${proyecto.color}33`:"none"}}>
                  {done?<span style={{color:"#fff",fontSize:13}}>✓</span>:<span style={{fontSize:12}}>{etapa.icon}</span>}
                </div>
                <span style={{fontSize:9,color:done?C.teal:isActual?proyecto.color:C.gray,fontWeight:isActual?700:500,maxWidth:58,textAlign:"center",lineHeight:1.2}}>{etapa.label}</span>
                {(etapa.fechaInicio||etapa.fechaFin)&&(
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,marginTop:2}}>
                    {etapa.fechaInicio&&<span style={{fontSize:8,color:C.teal,fontWeight:600,background:C.tealLight,borderRadius:3,padding:"1px 4px"}}>{fmtDate(etapa.fechaInicio)}</span>}
                    {etapa.fechaFin&&<span style={{fontSize:8,color:C.amber,fontWeight:600,background:C.amberLight,borderRadius:3,padding:"1px 4px"}}>{fmtDate(etapa.fechaFin)}</span>}
                  </div>
                )}
              </div>
              {i<proyecto.etapas.length-1&&<div style={{width:18,height:2,background:done?C.teal:"#E8E4DC",marginBottom:etapa.fechaFin?28:18,flexShrink:0}}/>}
            </div>
          );
        })}
      </div>
      <div style={{display:"flex",gap:12,marginTop:6,fontSize:10,color:C.gray}}>
        <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:C.teal,display:"inline-block"}}/>Inicio</span>
        <span style={{display:"flex",alignItems:"center",gap:4}}><span style={{width:8,height:8,borderRadius:2,background:C.amber,display:"inline-block"}}/>Compromiso</span>
      </div>
    </div>
  );
}

function GanttTab({proyecto}){
  const today=new Date();
  const start=new Date(proyecto.fechaInicio||"2026-01-01");
  const end=new Date(proyecto.fechaLanzamiento||"2026-12-31");
  const totalDays=Math.max(1,Math.ceil((end-start)/86400000));
  const todayPct=Math.min(100,Math.max(0,Math.ceil((today-start)/86400000)/totalDays*100));
  const barColor={Completado:C.teal,"En progreso":proyecto.color,Pendiente:"#D1D5DB",Bloqueado:C.red};
  const exportCSV=()=>{
    const header=["Etapa","Responsable","Fecha Inicio","Fecha Fin","Status","Entregables completados","Entregables totales"];
    const rows=proyecto.etapas.map(e=>[`"${e.label}"`,`"${e.responsable||""}"`,e.fechaInicio||"",e.fechaFin||"",e.status,e.entregables.filter(x=>x.done).length,e.entregables.length]);
    const csv=[header,...rows].map(r=>r.join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download=`Gantt_${proyecto.nombre.replace(/\s/g,"_")}.csv`;a.click();URL.revokeObjectURL(url);
  };
  const months=[];let cur=new Date(start);
  while(cur<=end){months.push({year:cur.getFullYear(),month:cur.getMonth(),label:cur.toLocaleDateString("es-MX",{month:"short",year:"numeric"})});cur.setMonth(cur.getMonth()+1);}
  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
        <span style={{fontSize:13,fontWeight:600,color:C.text}}>Gantt — {proyecto.nombre}</span>
        <Btn v="ghost" onClick={exportCSV} style={{fontSize:12,padding:"5px 14px"}}>📥 Exportar a Excel (CSV)</Btn>
      </div>
      <div style={{overflowX:"auto"}}>
        <div style={{display:"flex",marginLeft:180,marginBottom:4}}>
          {months.map((m,i)=>{const mStart=new Date(m.year,m.month,1);const mEnd=new Date(m.year,m.month+1,0);const pctStart=Math.max(0,Math.ceil((mStart-start)/86400000)/totalDays*100);const pctEnd=Math.min(100,Math.ceil((mEnd-start)/86400000)/totalDays*100);const width=pctEnd-pctStart;return <div key={i} style={{flex:`0 0 ${width}%`,fontSize:10,color:C.gray,borderLeft:`1px dashed ${C.border}`,paddingLeft:4,overflow:"hidden",whiteSpace:"nowrap"}}>{m.label}</div>;})}
        </div>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:`calc(180px + ${todayPct}%)`,top:0,bottom:0,width:2,background:C.red,zIndex:3,opacity:0.6}}/>
          {proyecto.etapas.map((etapa)=>{
            const s=etapa.fechaInicio?new Date(etapa.fechaInicio):null;const e=etapa.fechaFin?new Date(etapa.fechaFin):null;
            let sp=0,width=4;
            if(s&&e){sp=Math.max(0,Math.ceil((s-start)/86400000)/totalDays*100);const ep=Math.min(100,Math.ceil((e-start)/86400000)/totalDays*100);width=Math.max(1,ep-sp);}
            else if(s){sp=Math.max(0,Math.ceil((s-start)/86400000)/totalDays*100);width=6;}
            return(
              <div key={etapa.id} style={{display:"flex",alignItems:"center",marginBottom:7}}>
                <div style={{width:180,flexShrink:0,fontSize:12,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",paddingRight:8,display:"flex",alignItems:"center",gap:6}}><span>{etapa.icon}</span><span>{etapa.label}</span></div>
                <div style={{flex:1,height:22,background:"#F3F4F6",borderRadius:5,position:"relative",overflow:"hidden"}}>
                  {(s||e)&&<div style={{position:"absolute",left:`${sp}%`,width:`${width}%`,height:"100%",background:barColor[etapa.status]||"#D1D5DB",borderRadius:4,opacity:0.85,display:"flex",alignItems:"center",paddingLeft:6,minWidth:6}}><span style={{fontSize:9,color:"#fff",whiteSpace:"nowrap",overflow:"hidden"}}>{etapa.responsable}</span></div>}
                </div>
                <Badge label={etapa.status}/>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{display:"flex",gap:14,marginTop:10,flexWrap:"wrap"}}>
        {[["Completado",C.teal],["En progreso",proyecto.color],["Pendiente","#D1D5DB"],["Hoy",C.red]].map(([l,co])=>(<div key={l} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:C.gray}}><div style={{width:10,height:10,borderRadius:2,background:co}}/>{l}</div>))}
      </div>
      <div style={{marginTop:14,padding:12,background:C.grayLight,borderRadius:10,fontSize:12,color:C.gray}}>💡 Las barras aparecen cuando asignas fechas inicio y fin en cada etapa. Exporta a CSV para abrir en Excel.</div>
    </div>
  );
}

function CalendarioTab({proyecto}){
  const now=new Date();const [year,setYear]=useState(now.getFullYear());const [month,setMonth]=useState(now.getMonth());
  const meses=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
  const days=new Date(year,month+1,0).getDate();const first=new Date(year,month,1).getDay();
  const cells=Array(first).fill(null).concat(Array.from({length:days},(_,i)=>i+1));
  const eventos={};
  const addEvt=(dateStr,item)=>{if(!dateStr)return;const d=new Date(dateStr+"T12:00:00");if(d.getFullYear()===year&&d.getMonth()===month){const k=d.getDate();if(!eventos[k])eventos[k]=[];eventos[k].push(item);}};
  proyecto.tareas.forEach(t=>addEvt(t.fechaLimite,{label:t.nombre,color:C.amber}));
  proyecto.etapas.forEach(e=>{addEvt(e.fechaInicio,{label:`▶ ${e.label}`,color:C.teal});addEvt(e.fechaFin,{label:`⏱ ${e.label}`,color:proyecto.color});});
  const prev=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);};
  const next=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);};
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
        <Btn v="secondary" style={{padding:"5px 12px"}} onClick={prev}>‹</Btn>
        <span style={{fontWeight:700,fontSize:15,color:C.text,flex:1,textAlign:"center"}}>{meses[month]} {year}</span>
        <Btn v="secondary" style={{padding:"5px 12px"}} onClick={next}>›</Btn>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:10,flexWrap:"wrap",fontSize:11}}>
        {[["Tarea",C.amber],["Inicio etapa",C.teal],["Fin etapa",proyecto.color]].map(([l,c])=>(<span key={l} style={{display:"flex",alignItems:"center",gap:4,color:C.gray}}><span style={{width:8,height:8,borderRadius:"50%",background:c,display:"inline-block"}}/>{l}</span>))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
        {["Do","Lu","Ma","Mi","Ju","Vi","Sa"].map(d=><div key={d} style={{textAlign:"center",fontSize:11,fontWeight:600,color:C.gray,padding:"4px 0"}}>{d}</div>)}
        {cells.map((day,i)=>{
          const evts=day?(eventos[day]||[]):[];const isToday=day===now.getDate()&&month===now.getMonth()&&year===now.getFullYear();
          return(<div key={i} style={{minHeight:64,borderRadius:7,padding:"3px 5px",background:day?(isToday?"#EFF6FF":"#FAFAFA"):"transparent",border:day?`1px solid ${isToday?C.teal:C.border}`:"none"}}>
            {day&&<div style={{fontSize:11,fontWeight:isToday?700:400,color:isToday?C.teal:C.text,marginBottom:2}}>{day}</div>}
            {evts.slice(0,3).map((ev,j)=><div key={j} style={{fontSize:9,background:ev.color+"22",color:ev.color,borderRadius:3,padding:"1px 4px",marginBottom:2,overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontWeight:600}}>{ev.label}</div>)}
            {evts.length>3&&<div style={{fontSize:9,color:C.gray}}>+{evts.length-3}</div>}
          </div>);
        })}
      </div>
    </div>
  );
}

function TareaModal({tarea,equipo,onSave,onClose}){
  const [form,setForm]=useState(tarea||{nombre:"",responsable:"",fechaLimite:"",status:"Pendiente",prioridad:"Media",notas:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const nombres=[...new Set(equipo.map(e=>e.nombre))];
  return(<Overlay><div style={{background:C.surface,borderRadius:16,padding:24,width:"92%",maxWidth:440}}>
    <div style={{fontSize:15,fontWeight:700,color:C.text,marginBottom:18}}>{tarea?"Editar tarea":"Nueva tarea"}</div>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Field label="Descripción *"><Inp value={form.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Describe la tarea"/></Field>
      <Field label="Responsable"><Sel value={form.responsable} onChange={e=>set("responsable",e.target.value)}><option value="">— Seleccionar —</option>{nombres.map(n=><option key={n}>{n}</option>)}</Sel></Field>
      <Field label="Fecha límite"><Inp type="date" value={form.fechaLimite} onChange={e=>set("fechaLimite",e.target.value)}/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <Field label="Estado"><Sel value={form.status} onChange={e=>set("status",e.target.value)}>{ESTADOS_TAREA.map(s=><option key={s}>{s}</option>)}</Sel></Field>
        <Field label="Prioridad"><Sel value={form.prioridad} onChange={e=>set("prioridad",e.target.value)}>{PRIORIDADES.map(p=><option key={p}>{p}</option>)}</Sel></Field>
      </div>
      <Field label="Notas"><textarea value={form.notas} onChange={e=>set("notas",e.target.value)} rows={3} style={{width:"100%",padding:"8px 11px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,resize:"vertical",boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/></Field>
    </div>
    <div style={{display:"flex",gap:10,marginTop:18}}>
      <Btn v="secondary" style={{flex:1}} onClick={onClose}>Cancelar</Btn>
      <Btn style={{flex:1}} onClick={()=>{if(form.nombre){onSave(form);onClose();}}}>Guardar</Btn>
    </div>
  </div></Overlay>);
}

function MinutaModal({proyecto,onSave,onClose}){
  const [fase,setFase]=useState("form");
  const [form,setForm]=useState({titulo:"",fecha:new Date().toISOString().slice(0,10),asistentes:[],acuerdos:"",proximos:"",linkTeams:""});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const nombres=[...new Set(proyecto.equipo.map(e=>e.nombre))];
  const toggleAs=(n)=>setForm(f=>({...f,asistentes:f.asistentes.includes(n)?f.asistentes.filter(a=>a!==n):[...f.asistentes,n]}));
  const entrarTeams=()=>{if(form.linkTeams){window.open(form.linkTeams,"_blank");}setFase("teams");};
  const generarMinuta=()=>{setFase("generando");setTimeout(()=>setFase("done"),2000);};
  const guardar=()=>{onSave({id:uid(),fecha:form.fecha,titulo:form.titulo,asistentes:form.asistentes,acuerdos:form.acuerdos.split("\n").filter(Boolean),proximos:form.proximos.split("\n").filter(Boolean),linkTeams:form.linkTeams});onClose();};
  return(<Overlay><div style={{background:C.surface,borderRadius:16,padding:24,width:"92%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
      <div style={{width:36,height:36,borderRadius:8,background:"#5059C9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💬</div>
      <div><div style={{fontSize:15,fontWeight:700,color:C.text}}>Minuta de reunión</div><div style={{fontSize:12,color:C.gray}}>{proyecto.nombre}</div></div>
    </div>
    <div style={{background:"#EEF0FB",borderRadius:10,padding:14,marginBottom:16}}>
      <div style={{fontSize:12,fontWeight:600,color:"#5059C9",marginBottom:8}}>🔗 Reunión en Microsoft Teams</div>
      <div style={{display:"flex",gap:8}}>
        <Inp value={form.linkTeams} onChange={e=>set("linkTeams",e.target.value)} placeholder="Pega aquí el link de la reunión Teams…" style={{flex:1}}/>
        <button onClick={entrarTeams} style={{padding:"8px 14px",borderRadius:8,border:"none",background:"#5059C9",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,whiteSpace:"nowrap"}}>{form.linkTeams?"Unirse 🚀":"Simular"}</button>
      </div>
      {fase==="teams"&&<div style={{marginTop:10,padding:10,background:"#fff",borderRadius:8,fontSize:12,color:"#5059C9",border:"1px solid #5059C922"}}>✅ Conectado. Llena los acuerdos al terminar y genera la minuta.</div>}
    </div>
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      <Field label="Título *"><Inp value={form.titulo} onChange={e=>set("titulo",e.target.value)}/></Field>
      <Field label="Fecha"><Inp type="date" value={form.fecha} onChange={e=>set("fecha",e.target.value)}/></Field>
      <Field label="Asistentes">
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:4}}>
          {nombres.map(n=>(<div key={n} onClick={()=>toggleAs(n)} style={{display:"flex",alignItems:"center",gap:6,padding:"4px 10px",borderRadius:20,background:form.asistentes.includes(n)?C.tealLight:C.grayLight,border:`1px solid ${form.asistentes.includes(n)?C.teal+"66":C.border}`,cursor:"pointer",fontSize:12}}><Avatar nombre={n} size={18}/><span style={{color:form.asistentes.includes(n)?C.teal:C.gray}}>{n.split(" ")[0]}</span></div>))}
        </div>
      </Field>
      <Field label="Acuerdos (uno por línea)"><textarea value={form.acuerdos} onChange={e=>set("acuerdos",e.target.value)} rows={4} style={{width:"100%",padding:"8px 11px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,resize:"vertical",boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/></Field>
      <Field label="Próximos pasos"><textarea value={form.proximos} onChange={e=>set("proximos",e.target.value)} rows={3} style={{width:"100%",padding:"8px 11px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,resize:"vertical",boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/></Field>
    </div>
    {fase==="generando"&&<div style={{marginTop:14,padding:12,background:C.tealLight,borderRadius:10,textAlign:"center",color:C.teal,fontSize:13}}>⏳ Generando minuta…</div>}
    {fase==="done"&&<div style={{marginTop:14,padding:12,background:C.greenLight,borderRadius:10,color:C.green,fontSize:13}}>✅ Minuta generada. Revisa y guarda.</div>}
    <div style={{display:"flex",gap:10,marginTop:18,flexWrap:"wrap"}}>
      <Btn v="secondary" style={{flex:1}} onClick={onClose}>Cancelar</Btn>
      <Btn v="ghost" style={{flex:1}} onClick={generarMinuta}>✨ Generar</Btn>
      <Btn style={{flex:1}} onClick={guardar} disabled={!form.titulo}>Guardar</Btn>
    </div>
  </div></Overlay>);
}

function TeamsModal({tareas,onClose}){
  const [sent,setSent]=useState(false);
  return(<Overlay><div style={{background:C.surface,borderRadius:16,padding:24,width:"92%",maxWidth:420}}>
    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
      <div style={{width:38,height:38,borderRadius:9,background:"#5059C9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>💬</div>
      <div><div style={{fontSize:15,fontWeight:700}}>Microsoft Teams</div><div style={{fontSize:12,color:C.gray}}>Recordatorio tareas vencidas</div></div>
    </div>
    {!sent?(<>
      {tareas.length===0?<div style={{color:C.green,marginBottom:16}}>✅ Sin tareas vencidas.</div>:tareas.map(t=>(<div key={t.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:C.amberLight,borderRadius:8,marginBottom:7,fontSize:13}}><div><div style={{fontWeight:600,color:C.text}}>{t.nombre}</div><div style={{fontSize:11,color:C.gray}}>Vence: {t.fechaLimite}</div></div><div style={{display:"flex",alignItems:"center",gap:6}}><Avatar nombre={t.responsable||"?"} size={24}/><span style={{fontSize:12,color:C.gray}}>{(t.responsable||"").split(" ")[0]}</span></div></div>))}
      <div style={{display:"flex",gap:10,marginTop:14}}>
        <Btn v="secondary" style={{flex:1}} onClick={onClose}>Cancelar</Btn>
        <button onClick={()=>setSent(true)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",background:"#5059C9",color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600}}>Enviar por Teams</button>
      </div>
    </>):(
      <div style={{textAlign:"center",padding:"12px 0"}}>
        <div style={{fontSize:28,marginBottom:8}}>✅</div>
        <div style={{fontSize:15,fontWeight:700,color:C.green,marginBottom:4}}>¡Recordatorios enviados!</div>
        <div style={{fontSize:13,color:C.gray,marginBottom:18}}>Los responsables recibirán un mensaje en Microsoft Teams</div>
        <Btn onClick={onClose}>Cerrar</Btn>
      </div>
    )}
  </div></Overlay>);
}

function ProyectoModal({proyecto,equipoGlobal,onSave,onClose}){
  const blank={nombre:"",categoria:"OTC",forma:"Tableta",cliente:"",maquilador:"MMN",pais:"México",responsable:"Marycarmen Reséndiz",fechaInicio:"",fechaLanzamiento:"",descripcion:"",color:"#0D7377"};
  const [form,setForm]=useState(proyecto?{...proyecto}:blank);
  const [equipoCheck,setEquipoCheck]=useState(equipoGlobal.map(e=>proyecto?proyecto.equipo.some(pe=>pe.id===e.id):true));
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const colores=["#0D7377","#7B3FA0","#C8841A","#1E7E4E","#C0392B","#1A5276","#7D6608"];
  const handleMaq=(v)=>{const m=MAQUILADORES.find(x=>x.nombre===v);set("maquilador",v);if(m)set("pais",m.pais);};
  const nombres=[...new Set(equipoGlobal.map(e=>e.nombre))];
  const handleSave=()=>{
    if(!form.nombre||!form.cliente)return;
    const equipoSel=equipoGlobal.filter((_,i)=>equipoCheck[i]);
    const etapas=proyecto?proyecto.etapas:mkEtapas();
    onSave({...form,equipo:equipoSel,etapas,tareas:proyecto?.tareas||[],minutas:proyecto?.minutas||[]});
    onClose();
  };
  return(<Overlay><div style={{background:C.surface,borderRadius:16,padding:26,width:"92%",maxWidth:520,maxHeight:"92vh",overflowY:"auto"}}>
    <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:20}}>{proyecto?"Editar proyecto":"Nuevo proyecto"}</div>
    <div style={{display:"flex",flexDirection:"column",gap:13}}>
      <Field label="Nombre del producto *"><Inp value={form.nombre} onChange={e=>set("nombre",e.target.value)} placeholder="Ej. Genocurol, Tukol Sachet…"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Categoría"><Sel value={form.categoria} onChange={e=>set("categoria",e.target.value)}>{CATEGORIAS.map(c=><option key={c}>{c}</option>)}</Sel></Field>
        <Field label="Forma farmacéutica"><Sel value={form.forma} onChange={e=>set("forma",e.target.value)}>{FORMAS.map(f=><option key={f}>{f}</option>)}</Sel></Field>
      </div>
      <Field label="Cliente *"><Inp value={form.cliente} onChange={e=>set("cliente",e.target.value)} placeholder="Ej. Genomma Lab"/></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Maquilador"><Sel value={form.maquilador} onChange={e=>handleMaq(e.target.value)}>{MAQUILADORES.map(m=><option key={m.nombre}>{m.nombre}</option>)}<option>Otro</option></Sel></Field>
        <Field label="País"><Inp value={form.pais} onChange={e=>set("pais",e.target.value)}/></Field>
      </div>
      <Field label="Responsable del proyecto"><Sel value={form.responsable} onChange={e=>set("responsable",e.target.value)}>{nombres.map(n=><option key={n}>{n}</option>)}</Sel></Field>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Field label="Fecha de inicio"><Inp type="date" value={form.fechaInicio} onChange={e=>set("fechaInicio",e.target.value)}/></Field>
        <Field label="Fecha de lanzamiento"><Inp type="date" value={form.fechaLanzamiento} onChange={e=>set("fechaLanzamiento",e.target.value)}/></Field>
      </div>
      <Field label="Descripción"><textarea value={form.descripcion} onChange={e=>set("descripcion",e.target.value)} rows={2} style={{width:"100%",padding:"8px 11px",borderRadius:7,border:`1px solid ${C.border}`,fontSize:13,resize:"none",boxSizing:"border-box",outline:"none",fontFamily:"inherit"}}/></Field>
      <Field label="Equipo asignado">
        <div style={{display:"flex",flexDirection:"column",gap:6,marginTop:4}}>
          {equipoGlobal.map((e,i)=>(<label key={e.id} style={{display:"flex",alignItems:"center",gap:10,padding:"7px 10px",borderRadius:7,background:equipoCheck[i]?C.tealLight:C.grayLight,cursor:"pointer",border:`1px solid ${equipoCheck[i]?C.teal+"55":C.border}`}}><input type="checkbox" checked={equipoCheck[i]} onChange={()=>setEquipoCheck(prev=>prev.map((v,j)=>j===i?!v:v))} style={{accentColor:C.teal}}/><Avatar nombre={e.nombre} size={24}/><span style={{fontSize:13,flex:1}}>{e.nombre}</span><span style={{fontSize:11,color:C.gray,background:C.surface,padding:"1px 8px",borderRadius:10}}>{e.rol}</span></label>))}
        </div>
      </Field>
      <Field label="Color del proyecto">
        <div style={{display:"flex",gap:8,marginTop:4}}>{colores.map(col=><div key={col} onClick={()=>set("color",col)} style={{width:26,height:26,borderRadius:"50%",background:col,cursor:"pointer",outline:form.color===col?`3px solid ${C.text}`:"3px solid transparent",outlineOffset:2}}/>)}</div>
      </Field>
    </div>
    <div style={{display:"flex",gap:10,marginTop:20}}>
      <Btn v="secondary" style={{flex:1}} onClick={onClose}>Cancelar</Btn>
      <Btn style={{flex:1}} onClick={handleSave}>{proyecto?"Guardar cambios":"Crear proyecto"}</Btn>
    </div>
  </div></Overlay>);
}

function TarjetaProyecto({proyecto,onClick}){
  const pct=progreso(proyecto);const dias=diasR(proyecto.fechaLanzamiento);
  const etapaActual=proyecto.etapas.find(e=>e.status==="En progreso")||proyecto.etapas[proyecto.etapas.filter(e=>e.status==="Completado").length]||proyecto.etapas[0];
  const vencidas=proyecto.tareas.filter(t=>t.status!=="Completado"&&t.fechaLimite&&new Date(t.fechaLimite)<new Date()).length;
  return(
    <div onClick={onClick} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:18,cursor:"pointer",borderLeft:`5px solid ${proyecto.color}`,transition:"box-shadow 0.2s,transform 0.15s"}}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 6px 24px rgba(0,0,0,0.1)";e.currentTarget.style.transform="translateY(-1px)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="none";e.currentTarget.style.transform="none";}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{fontSize:16,fontWeight:700,color:C.text,marginBottom:3}}>{proyecto.nombre}</div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}><Pill label={proyecto.categoria} color={proyecto.color}/><Pill label={proyecto.forma} color={C.gray}/><span style={{fontSize:12,color:C.gray}}>🏭 {proyecto.maquilador} · {proyecto.pais}</span></div>
        </div>
        {vencidas>0&&<span style={{background:C.redLight,color:C.red,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600}}>⚠️ {vencidas} vencida(s)</span>}
      </div>
      <Bar value={pct} color={proyecto.color}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:12}}>
        <span style={{color:C.gray}}>{pct}% · <b style={{color:proyecto.color}}>{etapaActual?.label}</b></span>
        <span style={{color:dias<30?C.red:C.gray,fontWeight:dias<30?600:400}}>{dias>0?`${dias} días para lanzamiento`:"⚠️ Fecha vencida"}</span>
      </div>
      <div style={{display:"flex",gap:2,marginTop:10,overflowX:"auto"}}>
        {proyecto.etapas.map((e,i)=><div key={i} title={e.label} style={{flex:1,minWidth:6,height:6,borderRadius:3,background:e.status==="Completado"?C.teal:e.status==="En progreso"?proyecto.color:"#E8E4DC"}}/>)}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,marginTop:10}}>
        <Avatar nombre={proyecto.responsable} size={20}/><span style={{fontSize:11,color:C.gray}}>{proyecto.responsable}</span>
        <span style={{marginLeft:"auto",fontSize:11,color:C.gray}}>👥 {proyecto.equipo.length} · 📋 {proyecto.tareas.length} tareas</span>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── VISTA PROYECTO ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
const TABS=["Proceso","Gantt","Calendario","Tareas","Equipo","Minutas"];

function VistaProyecto({proyecto,equipoGlobal,onUpdate,onBack,esAdmin}){
  const [tab,setTab]=useState("Proceso");
  const [modalEtapa,setModalEtapa]=useState(null);
  const [modalTarea,setModalTarea]=useState(null);
  const [modalMinuta,setModalMinuta]=useState(false);
  const [modalTeams,setModalTeams]=useState(null);
  const [confirmDel,setConfirmDel]=useState(null);
  const [editProyecto,setEditProyecto]=useState(false);
  const [configEtapas,setConfigEtapas]=useState(false);
  const [filterTarea,setFilterTarea]=useState("Todas");
  const today=new Date();

  const saveTarea=(form)=>{let t;if(modalTarea?.id)t=proyecto.tareas.map(x=>x.id===modalTarea.id?{...x,...form}:x);else t=[...proyecto.tareas,{...form,id:uid()}];onUpdate({...proyecto,tareas:t});};
  const delTarea=(id)=>{onUpdate({...proyecto,tareas:proyecto.tareas.filter(t=>t.id!==id)});setConfirmDel(null);};
  const toggleTarea=(tarea)=>{const ciclo=["Pendiente","En progreso","Completado"];const next=ciclo[(ciclo.indexOf(tarea.status)+1)%ciclo.length];onUpdate({...proyecto,tareas:proyecto.tareas.map(t=>t.id===tarea.id?{...t,status:next}:t)});};
  const saveEtapa=(form,idx)=>{const etapas=proyecto.etapas.map((e,i)=>i===idx?{...e,...form}:e);onUpdate({...proyecto,etapas});};
  const saveMinuta=(m)=>onUpdate({...proyecto,minutas:[m,...proyecto.minutas]});
  const vencidas=proyecto.tareas.filter(t=>t.status!=="Completado"&&t.fechaLimite&&new Date(t.fechaLimite)<today);
  const tareasVis=filterTarea==="Todas"?proyecto.tareas:proyecto.tareas.filter(t=>t.status===filterTarea);

  return(
    <div style={{fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",maxWidth:880,margin:"0 auto",padding:"0 16px 40px"}}>
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,paddingTop:4}}>
        <button onClick={onBack} style={{background:"none",border:"none",cursor:"pointer",color:C.teal,fontSize:22,padding:0,lineHeight:1}}>‹</button>
        <div style={{width:14,height:14,borderRadius:"50%",background:proyecto.color,flexShrink:0}}/>
        <div style={{flex:1}}><div style={{fontSize:20,fontWeight:800,color:C.text,letterSpacing:-0.5}}>{proyecto.nombre}</div><div style={{fontSize:13,color:C.gray}}>{proyecto.cliente} · {proyecto.maquilador}, {proyecto.pais}</div></div>
        <Pill label={proyecto.categoria} color={proyecto.color}/>
        {esAdmin&&<button onClick={()=>setEditProyecto(true)} style={{background:"none",border:"none",cursor:"pointer",color:C.gray,fontSize:18,padding:"2px 6px"}} title="Editar">⚙️</button>}
      </div>

      <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:14,padding:"14px 16px",marginBottom:14}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <span style={{fontSize:13,fontWeight:700,color:C.text}}>Proceso de desarrollo — {progreso(proyecto)}% completado</span>
          <div style={{display:"flex",gap:8}}>
            <span style={{fontSize:12,color:C.gray}}>🚀 {proyecto.fechaLanzamiento}</span>
            {esAdmin&&<Btn v="secondary" style={{fontSize:11,padding:"3px 10px"}} onClick={()=>setConfigEtapas(true)}>⚙ Editar etapas</Btn>}
          </div>
        </div>
        <Pipeline proyecto={proyecto} onEtapaClick={esAdmin?(etapa,idx)=>setModalEtapa({etapa,idx}):()=>{}}/>
      </div>

      <div style={{display:"flex",gap:0,borderBottom:`2px solid ${C.border}`,marginBottom:18,overflowX:"auto"}}>
        {TABS.map(t=>(<button key={t} onClick={()=>setTab(t)} style={{padding:"9px 14px",border:"none",background:"none",cursor:"pointer",fontSize:13,color:tab===t?C.teal:C.gray,fontWeight:tab===t?700:500,borderBottom:`2px solid ${tab===t?C.teal:"transparent"}`,marginBottom:-2,whiteSpace:"nowrap"}}>{t}</button>))}
      </div>

      {tab==="Proceso"&&(
        <div>
          <div style={{fontSize:12,color:C.gray,marginBottom:12}}>{esAdmin?"Haz clic en una etapa para actualizar estado, fechas, responsable y entregables.":"Vista de solo lectura."}</div>
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {proyecto.etapas.map((etapa,i)=>{
              const done=etapa.status==="Completado";const isActual=etapa.status==="En progreso";const entsDone=etapa.entregables.filter(e=>e.done).length;
              return(<div key={etapa.id} onClick={esAdmin?()=>setModalEtapa({etapa,idx:i}):undefined}
                style={{display:"flex",alignItems:"center",gap:12,padding:"10px 14px",background:done?C.greenLight:isActual?C.tealLight:C.surface,border:`1px solid ${done?C.green+"44":isActual?C.teal+"44":C.border}`,borderRadius:10,cursor:esAdmin?"pointer":"default"}}>
                <span style={{fontSize:18}}>{etapa.icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:600,color:done?C.green:isActual?C.teal:C.text}}>{etapa.label}</div>
                  <div style={{fontSize:11,color:C.gray,display:"flex",gap:10,flexWrap:"wrap"}}><span>{entsDone}/{etapa.entregables.length} entregables</span>{etapa.fechaInicio&&<span>▶ {etapa.fechaInicio}</span>}{etapa.fechaFin&&<span>⏱ {etapa.fechaFin}</span>}{etapa.responsable&&<span>👤 {etapa.responsable}</span>}</div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"center"}}><Badge label={etapa.status}/>{isActual&&<span style={{fontSize:11,background:proyecto.color+"22",color:proyecto.color,padding:"2px 8px",borderRadius:10,fontWeight:600}}>Actual</span>}</div>
              </div>);
            })}
          </div>
        </div>
      )}
      {tab==="Gantt"&&<GanttTab proyecto={proyecto}/>}
      {tab==="Calendario"&&<CalendarioTab proyecto={proyecto}/>}
      {tab==="Tareas"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <div style={{display:"flex",gap:4,flex:1,flexWrap:"wrap"}}>
              {["Todas",...ESTADOS_TAREA].map(s=>(<button key={s} onClick={()=>setFilterTarea(s)} style={{padding:"5px 11px",borderRadius:7,border:`1px solid ${filterTarea===s?C.teal:C.border}`,background:filterTarea===s?C.tealLight:C.surface,color:filterTarea===s?C.teal:C.gray,fontSize:12,cursor:"pointer",fontWeight:filterTarea===s?700:400}}>{s}</button>))}
            </div>
            {vencidas.length>0&&<Btn v="ghost" style={{fontSize:12,padding:"5px 12px"}} onClick={()=>setModalTeams(vencidas)}>🔔 Teams ({vencidas.length})</Btn>}
            {esAdmin&&<Btn onClick={()=>setModalTarea({})}>+ Tarea</Btn>}
          </div>
          {vencidas.length>0&&<div style={{background:C.amberLight,border:`1px solid ${C.amber}44`,borderRadius:10,padding:"9px 14px",marginBottom:12,fontSize:13,color:C.amber}}>⚠️ {vencidas.length} tarea(s) vencida(s) requieren atención</div>}
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {tareasVis.length===0&&<div style={{textAlign:"center",padding:"30px 0",color:C.gray}}>No hay tareas en esta categoría</div>}
            {tareasVis.map(tarea=>{
              const vencida=tarea.status!=="Completado"&&tarea.fechaLimite&&new Date(tarea.fechaLimite)<today;
              return(<div key={tarea.id} style={{background:C.surface,border:`1px solid ${vencida?C.red+"55":C.border}`,borderRadius:10,padding:"10px 13px"}}>
                <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <button onClick={()=>toggleTarea(tarea)} style={{width:22,height:22,borderRadius:"50%",border:`2px solid ${tarea.status==="Completado"?C.green:tarea.status==="En progreso"?C.teal:C.border}`,background:tarea.status==="Completado"?C.green:tarea.status==="En progreso"?C.tealLight:C.surface,cursor:"pointer",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {tarea.status==="Completado"&&<span style={{color:"#fff",fontSize:11}}>✓</span>}
                    {tarea.status==="En progreso"&&<span style={{color:C.teal,fontSize:10}}>▶</span>}
                  </button>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:3}}>
                      <span style={{fontSize:14,fontWeight:500,color:tarea.status==="Completado"?C.gray:C.text,textDecoration:tarea.status==="Completado"?"line-through":"none"}}>{tarea.nombre}</span>
                      {vencida&&<span style={{fontSize:11,background:C.redLight,color:C.red,padding:"1px 6px",borderRadius:4,fontWeight:600}}>Vencida</span>}
                    </div>
                    <div style={{display:"flex",gap:10,fontSize:12,color:C.gray,flexWrap:"wrap",alignItems:"center"}}>
                      {tarea.responsable&&<span style={{display:"flex",alignItems:"center",gap:4}}><Avatar nombre={tarea.responsable} size={16}/>{tarea.responsable.split(" ")[0]}</span>}
                      {tarea.fechaLimite&&<span>📅 {tarea.fechaLimite}</span>}
                      {tarea.notas&&<span style={{fontStyle:"italic",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>💬 {tarea.notas}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                    <Badge label={tarea.prioridad}/>
                    {esAdmin&&<><button onClick={()=>setModalTarea(tarea)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"2px 3px"}}>✏️</button><button onClick={()=>setConfirmDel(tarea.id)} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,padding:"2px 3px",color:C.red}}>🗑️</button></>}
                  </div>
                </div>
              </div>);
            })}
          </div>
        </div>
      )}
      {tab==="Equipo"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:12}}>
            {proyecto.equipo.map((persona,i)=>(<div key={i} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16,display:"flex",gap:12,alignItems:"center"}}><Avatar nombre={persona.nombre} size={40}/><div><div style={{fontSize:14,fontWeight:600,color:C.text}}>{persona.nombre.split(" ")[0]}</div><div style={{fontSize:11,color:C.gray}}>{persona.nombre.split(" ").slice(1).join(" ")}</div><div style={{marginTop:4}}><Pill label={persona.rol} color={C.teal}/></div></div></div>))}
          </div>
          <div style={{marginTop:16,background:C.grayLight,borderRadius:10,padding:14}}><div style={{fontSize:13,fontWeight:600,color:C.text,marginBottom:6}}>Maquilador</div><div style={{fontSize:13,color:C.gray}}>🏭 <b style={{color:C.text}}>{proyecto.maquilador}</b> · {proyecto.pais}</div></div>
        </div>
      )}
      {tab==="Minutas"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:14}}>
            <span style={{fontSize:13,color:C.gray}}>{proyecto.minutas.length} minuta(s)</span>
            <Btn onClick={()=>setModalMinuta(true)}>+ Nueva minuta / Unirse a Teams</Btn>
          </div>
          {proyecto.minutas.length===0&&<div style={{textAlign:"center",padding:"36px 0",color:C.gray}}>No hay minutas registradas</div>}
          {proyecto.minutas.map(m=>(<div key={m.id} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:16,marginBottom:12}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:8}}><span style={{fontSize:15,fontWeight:700,color:C.text}}>{m.titulo}</span><span style={{fontSize:12,color:C.gray}}>{m.fecha}</span></div>
            {m.linkTeams&&<div style={{fontSize:12,marginBottom:8}}><a href={m.linkTeams} target="_blank" rel="noreferrer" style={{color:"#5059C9",textDecoration:"none"}}>💬 Ver reunión Teams</a></div>}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>{m.asistentes.map(a=><div key={a} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:C.gray}}><Avatar nombre={a} size={18}/>{a.split(" ")[0]}</div>)}</div>
            {m.acuerdos.length>0&&<div style={{marginBottom:8}}><div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:5}}>Acuerdos</div>{m.acuerdos.map((a,i)=><div key={i} style={{fontSize:13,color:C.gray,paddingLeft:10,borderLeft:`2px solid ${C.teal}`,marginBottom:5}}>✓ {a}</div>)}</div>}
            {m.proximos.length>0&&<div><div style={{fontSize:12,fontWeight:600,color:C.text,marginBottom:5}}>Próximos pasos</div>{m.proximos.map((p,i)=><div key={i} style={{fontSize:13,color:C.gray,paddingLeft:10,borderLeft:`2px solid ${C.amber}`,marginBottom:5}}>→ {p}</div>)}</div>}
          </div>))}
        </div>
      )}

      {modalEtapa&&<EtapaModal etapa={modalEtapa.etapa} idx={modalEtapa.idx} proyecto={proyecto} onSave={saveEtapa} onClose={()=>setModalEtapa(null)}/>}
      {modalTarea!==null&&<TareaModal tarea={modalTarea?.id?modalTarea:null} equipo={proyecto.equipo} onSave={saveTarea} onClose={()=>setModalTarea(null)}/>}
      {modalMinuta&&<MinutaModal proyecto={proyecto} onSave={saveMinuta} onClose={()=>setModalMinuta(false)}/>}
      {modalTeams&&<TeamsModal tareas={modalTeams} onClose={()=>setModalTeams(null)}/>}
      {editProyecto&&<ProyectoModal proyecto={proyecto} equipoGlobal={equipoGlobal} onSave={p=>{onUpdate({...proyecto,...p});setEditProyecto(false);}} onClose={()=>setEditProyecto(false)}/>}
      {configEtapas&&<EtapasConfigModal etapas={proyecto.etapas} onSave={etapas=>onUpdate({...proyecto,etapas:etapas.map(e=>({...e,entregables:e.entregables||[]}))})} onClose={()=>setConfigEtapas(false)}/>}
      {confirmDel&&(<Overlay><div style={{background:C.surface,borderRadius:14,padding:24,width:300,textAlign:"center"}}><div style={{fontSize:15,fontWeight:700,marginBottom:8}}>¿Eliminar tarea?</div><div style={{fontSize:13,color:C.gray,marginBottom:20}}>Esta acción no se puede deshacer.</div><div style={{display:"flex",gap:10}}><Btn v="secondary" style={{flex:1}} onClick={()=>setConfirmDel(null)}>Cancelar</Btn><Btn v="danger" style={{flex:1}} onClick={()=>delTarea(confirmDel)}>Eliminar</Btn></div></div></Overlay>)}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════
export default function App(){
  const [session,setSession]=useState(null);
  const [perfil,setPerfil]=useState(null);
  const [proyectos,setProyectos]=useState([]);
  const [equipoGlobal,setEquipoGlobal]=useState(EQUIPO_INICIAL);
  const [proyectoActivo,setProyectoActivo]=useState(null);
  const [modalNuevo,setModalNuevo]=useState(false);
  const [modalResponsables,setModalResponsables]=useState(false);
  const [modalUsuarios,setModalUsuarios]=useState(false);
  const [busqueda,setBusqueda]=useState("");
  const [filtroMaq,setFiltroMaq]=useState("Todos");
  const [filtrocat,setFiltrocat]=useState("Todos");
  const [loading,setLoading]=useState(true);
  const [saving,setSaving]=useState(false);

  const esAdmin=perfil?.rol==="admin";

  // ── Auth listener ──
  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>setSession(session));
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_,session)=>setSession(session));
    return ()=>subscription.unsubscribe();
  },[]);

  // ── Cargar perfil y datos cuando hay sesión ──
  useEffect(()=>{
    if(!session){setLoading(false);return;}
    const cargar=async()=>{
      setLoading(true);
      // Perfil
      const {data:p}=await supabase.from("user_profiles").select("*").eq("id",session.user.id).single();
      setPerfil(p);
      // Proyectos
      const {data:proy}=await supabase.from("proyectos").select("*").order("id");
      if(proy&&proy.length>0) setProyectos(proy.map(r=>r.data));
      else {
        // Primera vez: cargar proyectos de ejemplo
        for(const p of PROYECTOS_EJEMPLO){
          await supabase.from("proyectos").insert({data:p});
        }
        setProyectos(PROYECTOS_EJEMPLO);
      }
      // Equipo global
      const {data:eq}=await supabase.from("equipo_global").select("*").limit(1);
      if(eq&&eq.length>0) setEquipoGlobal(eq[0].data);
      setLoading(false);
    };
    cargar();
  },[session]);

  // ── Guardar proyecto en Supabase ──
  const saveProyecto=async(proyecto)=>{
    setSaving(true);
    const {data:existing}=await supabase.from("proyectos").select("id").eq("data->id","eq").limit(1);
    // Upsert por proyecto.id dentro del jsonb
    const {data:all}=await supabase.from("proyectos").select("id,data");
    const row=all?.find(r=>r.data.id===proyecto.id);
    if(row) await supabase.from("proyectos").update({data:proyecto,updated_at:new Date()}).eq("id",row.id);
    else await supabase.from("proyectos").insert({data:proyecto});
    setSaving(false);
  };

  const updateProyecto=async(up)=>{
    setProyectos(prev=>prev.map(p=>p.id===up.id?up:p));
    setProyectoActivo(up);
    await saveProyecto(up);
  };

  const crearProyecto=async(form)=>{
    const nuevo={...form,id:Date.now()};
    setProyectos(prev=>[nuevo,...prev]);
    await saveProyecto(nuevo);
  };

  const saveEquipo=async(equipo)=>{
    setEquipoGlobal(equipo);
    const {data:eq}=await supabase.from("equipo_global").select("id").limit(1);
    if(eq&&eq.length>0) await supabase.from("equipo_global").update({data:equipo,updated_at:new Date()}).eq("id",eq[0].id);
    else await supabase.from("equipo_global").insert({data:equipo});
  };

  const logout=async()=>{ await supabase.auth.signOut(); setSession(null); setPerfil(null); setProyectos([]); };

  // ── Loading / Auth ──
  if(loading) return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg,flexDirection:"column",gap:16}}>
      <Spinner/><div style={{fontSize:14,color:C.gray}}>Cargando…</div>
    </div>
  );

  if(!session) return <LoginScreen onLogin={()=>{}}/>;

  // ── Vista proyecto ──
  if(proyectoActivo){
    const latest=proyectos.find(p=>p.id===proyectoActivo.id)||proyectoActivo;
    return(
      <div style={{background:C.bg,minHeight:"100vh"}}>
        {saving&&<div style={{position:"fixed",top:12,right:16,background:C.teal,color:"#fff",borderRadius:8,padding:"5px 14px",fontSize:12,zIndex:99}}>Guardando…</div>}
        <VistaProyecto proyecto={latest} equipoGlobal={equipoGlobal} onUpdate={updateProyecto} onBack={()=>setProyectoActivo(null)} esAdmin={esAdmin}/>
      </div>
    );
  }

  const filtrados=proyectos.filter(p=>{
    const txt=busqueda.toLowerCase();
    const mB=!txt||p.nombre.toLowerCase().includes(txt)||p.cliente.toLowerCase().includes(txt)||p.maquilador.toLowerCase().includes(txt);
    const mM=filtroMaq==="Todos"||p.maquilador===filtroMaq;
    const mC=filtrocat==="Todos"||p.categoria===filtrocat;
    return mB&&mM&&mC;
  });

  const stats={total:proyectos.length,enProceso:proyectos.filter(p=>progreso(p)>0&&progreso(p)<100).length,vencidos:proyectos.reduce((a,p)=>a+p.tareas.filter(t=>t.status!=="Completado"&&t.fechaLimite&&new Date(t.fechaLimite)<new Date()).length,0),avg:proyectos.length?Math.round(proyectos.reduce((a,p)=>a+progreso(p),0)/proyectos.length):0};

  return(
    <div style={{fontFamily:"'DM Sans','Segoe UI',system-ui,sans-serif",maxWidth:880,margin:"0 auto",padding:"0 16px 40px",minHeight:"100vh"}}>
      {saving&&<div style={{position:"fixed",top:12,right:16,background:C.teal,color:"#fff",borderRadius:8,padding:"5px 14px",fontSize:12,zIndex:99}}>Guardando…</div>}

      {/* Header */}
      <div style={{paddingTop:20,marginBottom:20}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10}}>
          <div>
            <div style={{fontSize:11,letterSpacing:"0.12em",textTransform:"uppercase",color:C.teal,fontWeight:700,marginBottom:4}}>Gestión de proyectos</div>
            <div style={{fontSize:26,fontWeight:900,color:C.text,letterSpacing:-1}}>Marycarmen Reséndiz</div>
            <div style={{fontSize:14,color:C.gray,marginTop:2}}>OTC · Cosméticos · Manufactura</div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
            {/* Usuario logueado */}
            <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 12px",background:C.grayLight,borderRadius:20,fontSize:13}}>
              <Avatar nombre={perfil?.nombre||perfil?.email||"?"} size={22}/>
              <span style={{color:C.text,fontWeight:500}}>{perfil?.nombre||perfil?.email}</span>
              <Badge label={perfil?.rol||"viewer"}/>
            </div>
            {esAdmin&&<Btn v="ghost" onClick={()=>setModalResponsables(true)}>👥 Equipo</Btn>}
            {esAdmin&&<Btn v="purple" onClick={()=>setModalUsuarios(true)}>🔐 Usuarios</Btn>}
            {esAdmin&&<Btn onClick={()=>setModalNuevo(true)}>+ Nuevo proyecto</Btn>}
            <Btn v="secondary" onClick={logout} style={{fontSize:12}}>Cerrar sesión</Btn>
          </div>
        </div>
      </div>

      {/* Métricas */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:20}}>
        {[{label:"Proyectos totales",value:stats.total,color:C.text},{label:"En proceso",value:stats.enProceso,color:C.teal},{label:"Tareas vencidas",value:stats.vencidos,color:stats.vencidos>0?C.red:C.green},{label:"Avance promedio",value:`${stats.avg}%`,color:C.amber}].map(m=>(<div key={m.label} style={{background:C.surface,borderRadius:12,padding:"14px 16px",border:`1px solid ${C.border}`}}><div style={{fontSize:11,color:C.gray,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.04em"}}>{m.label}</div><div style={{fontSize:24,fontWeight:800,color:m.color}}>{m.value}</div></div>))}
      </div>

      {/* Filtros */}
      <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
        <input placeholder="Buscar producto, cliente o maquilador…" value={busqueda} onChange={e=>setBusqueda(e.target.value)} style={{flex:1,minWidth:200,padding:"9px 13px",borderRadius:9,border:`1px solid ${C.border}`,fontSize:13,outline:"none",background:C.surface,fontFamily:"inherit"}}/>
        <Sel value={filtroMaq} onChange={e=>setFiltroMaq(e.target.value)} style={{width:150}}><option value="Todos">Todos los maquiladores</option>{MAQUILADORES.map(m=><option key={m.nombre}>{m.nombre}</option>)}</Sel>
        <Sel value={filtrocat} onChange={e=>setFiltrocat(e.target.value)} style={{width:130}}><option value="Todos">OTC y Cosméticos</option>{CATEGORIAS.map(c=><option key={c}>{c}</option>)}</Sel>
      </div>

      {/* Lista */}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtrados.map(p=><TarjetaProyecto key={p.id} proyecto={p} onClick={()=>setProyectoActivo(p)}/>)}
        {filtrados.length===0&&<div style={{textAlign:"center",padding:"40px 0",color:C.gray}}>{proyectos.length===0?"Cargando proyectos…":"No se encontraron proyectos"}</div>}
      </div>

      {modalNuevo&&<ProyectoModal equipoGlobal={equipoGlobal} onSave={p=>{crearProyecto(p);setModalNuevo(false);}} onClose={()=>setModalNuevo(false)}/>}
      {modalResponsables&&<ResponsablesModal equipo={equipoGlobal} onSave={saveEquipo} onClose={()=>setModalResponsables(false)}/>}
      {modalUsuarios&&<UsuariosModal onClose={()=>setModalUsuarios(false)}/>}
    </div>
  );
}

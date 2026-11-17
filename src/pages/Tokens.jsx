import React,{useMemo,useState} from 'react';
import {Plus,Copy,Download,Trash,MagnifyingGlass,Check} from '@phosphor-icons/react';
import {useStudioData} from '../data/studioStore.js';
const control={minWidth:0,padding:'9px 10px',border:'1px solid var(--line)',background:'#fff',color:'var(--ink)',font:'inherit',fontSize:11};
const action={display:'inline-flex',alignItems:'center',gap:6,padding:'8px 10px',border:'1px solid var(--ink)',background:'#242420',color:'#fff',fontSize:10,cursor:'pointer'};
function CopyValue({value}){const [done,setDone]=useState(false);return <button title="Copy" onClick={async()=>{try{await navigator.clipboard.writeText(value);setDone(true);setTimeout(()=>setDone(false),1200)}catch{}}} style={{border:0,background:'transparent',cursor:'pointer',color:'inherit'}}>{done?<Check size={14}/>:<Copy size={14}/>}</button>}
export default function Tokens(){
 const [tokens,save,reset]=useStudioData('tokens');const [query,setQuery]=useState('');const [group,setGroup]=useState('All');const [selected,setSelected]=useState([]);
 const [draft,setDraft]=useState({name:'',value:'',type:'color',description:'',group:'Primitive'});
 const visible=useMemo(()=>tokens.filter(t=>(group==='All'||t.group===group)&&[t.name,t.value,t.description].join(' ').toLowerCase().includes(query.toLowerCase())),[tokens,group,query]);
 const css=':root {\n'+tokens.map(t=>'  --atria-'+t.name.replaceAll('.','-')+': '+t.value+';').join('\n')+'\n}';
 const json=JSON.stringify(tokens.map(({name,value,type,description,group})=>({name,value,type,description,group})),null,2);
 const download=kind=>{const url=URL.createObjectURL(new Blob([kind==='json'?json:css],{type:kind==='json'?'application/json':'text/css'}));const a=document.createElement('a');a.href=url;a.download='atria-tokens.'+kind;a.click();URL.revokeObjectURL(url)};
 const add=()=>{if(!draft.name.trim()||!draft.value.trim())return;save(items=>[...items,{...draft,id:crypto.randomUUID()}]);setDraft({name:'',value:'',type:'color',description:'',group:'Primitive'})};
 const update=(id,field,value)=>save(items=>items.map(t=>t.id===id?{...t,[field]:value}:t));
 return <div className="studio-page">
  <div className="section-index">[ STUDIO / TOKENS ]</div>
  <div className="studio-page-heading"><div><span className="studio-status">DESIGN VALUES / DEVELOPER READY</span><h2>Tokens</h2></div><div style={{display:'flex',gap:6}}><button style={action} onClick={()=>download('css')}><Download size={13}/> CSS</button><button style={action} onClick={()=>download('json')}><Download size={13}/> JSON</button></div></div>
  <div style={{display:'flex',gap:8,flexWrap:'wrap',alignItems:'center',margin:'22px 0 14px'}}><div style={{display:'flex',alignItems:'center',gap:6,border:'1px solid var(--line)',background:'#fff',padding:'0 9px',flex:1,minWidth:170}}><MagnifyingGlass size={14}/><input placeholder="Find a token..." value={query} onChange={e=>setQuery(e.target.value)} style={{...control,border:0,width:'100%'}}/></div>{['All','Primitive','Semantic'].map(g=><button key={g} onClick={()=>setGroup(g)} style={{...control,background:group===g?'#242420':'#fff',color:group===g?'#fff':'var(--ink)',cursor:'pointer'}}>{g}</button>)}</div>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',margin:'12px 0'}}>
   <p style={{fontSize:10,color:'#888',margin:0}}>Select multiple tokens to copy them as CSS variables.</p>
   <button style={{...action,opacity:selected.length?1:.5}} disabled={!selected.length} onClick={()=>navigator.clipboard.writeText(':root {\\n'+tokens.filter(t=>selected.includes(t.id)).map(t=>'  --atria-'+t.name.replaceAll('.','-')+': '+t.value+';').join('\\n')+'\\n}') }><Copy size={13}/> Copy selected CSS ({selected.length})</button>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
   {visible.map(t=><article key={t.id} style={{minWidth:0,padding:14,border:'1px solid '+(selected.includes(t.id)?'#242420':'var(--line)'),background:'#fff'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:8,marginBottom:12}}><span style={{fontSize:8,letterSpacing:'.08em',color:'#999',textTransform:'uppercase'}}>{t.group} / {t.type}</span><input type="checkbox" aria-label={'Select '+t.name} checked={selected.includes(t.id)} onChange={e=>setSelected(old=>e.target.checked?[...old,t.id]:old.filter(id=>id!==t.id))} style={{accentColor:'#242420'}}/></div>
    <input value={t.name} aria-label="Token name" onChange={e=>update(t.id,'name',e.target.value)} style={{...control,width:'100%',fontWeight:600}}/>
    <div style={{display:'flex',alignItems:'center',gap:7,marginTop:10}}>
     {t.type==='color'&&<input type="color" aria-label="Token colour" value={/^#[0-9a-f]{6}$/i.test(t.value)?t.value:'#777777'} onChange={e=>update(t.id,'value',e.target.value)} style={{width:34,height:34,padding:2,border:'1px solid var(--line)',background:'#fff'}}/>}
     <input value={t.value} aria-label="Token value" onChange={e=>update(t.id,'value',e.target.value)} style={{...control,flex:1,minWidth:0}}/>
     <CopyValue value={'--atria-'+t.name.replaceAll('.','-')+': '+t.value+';'}/>
     <button title="Delete token" onClick={()=>{save(items=>items.filter(x=>x.id!==t.id));setSelected(old=>old.filter(id=>id!==t.id))}} style={{border:0,background:'transparent',cursor:'pointer'}}><Trash size={14}/></button>
    </div>
    <p style={{fontSize:10,color:'#888',lineHeight:1.5,minHeight:28,margin:'9px 0 0'}}>{t.description||'No description added.'}</p>
   </article>)}
   {!visible.length&&<p style={{padding:16,color:'#888',fontSize:11}}>No matching tokens.</p>}
  </div>
  <section style={{marginTop:20,padding:16,border:'1px solid var(--line)',background:'#fafaf8'}}><div className="placeholder-panel-heading"><div><span className="studio-kicker">ADD TO COLLECTION</span><h3>New token</h3></div></div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(135px,1fr))',gap:8}}><input aria-label="Token name" placeholder="color.brand.primary" value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})} style={control}/><input aria-label="Token value" placeholder="#171717 or 16px" value={draft.value} onChange={e=>setDraft({...draft,value:e.target.value})} style={control}/><select aria-label="Token type" value={draft.type} onChange={e=>setDraft({...draft,type:e.target.value})} style={control}><option value="color">Colour</option><option value="dimension">Dimension</option><option value="font">Font</option><option value="number">Number</option><option value="string">String</option></select><select aria-label="Token group" value={draft.group} onChange={e=>setDraft({...draft,group:e.target.value})} style={control}><option>Primitive</option><option>Semantic</option></select></div><div style={{display:'flex',gap:8,marginTop:8}}><input aria-label="Description" placeholder="Short usage note (optional)" value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})} style={{...control,flex:1}}/><button style={action} onClick={add}><Plus size={13}/> Add</button></div></section>
  <section style={{marginTop:22}}><div className="placeholder-panel-heading"><div><span className="studio-kicker">LIVE EXPORT PREVIEW</span><h3>CSS custom properties</h3></div><CopyValue value={css}/></div><pre style={{whiteSpace:'pre',overflowX:'auto',padding:15,background:'#242420',color:'#e9e7e1',fontSize:10,lineHeight:1.8}}>{css}</pre></section>
  <div style={{display:'flex',justifyContent:'flex-end',marginTop:14}}><button style={control} onClick={()=>{if(window.confirm('Restore the starter token collection?'))reset()}}>Reset starter tokens</button></div>
 </div>;
}
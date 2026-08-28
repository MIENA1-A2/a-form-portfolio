'use client';
/* eslint-disable react-hooks/immutability -- Three objects are mutated only in the render loop. */
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Component,useEffect,useMemo,useRef,useState,type ReactNode} from 'react';
import {useInView,useReducedMotion} from 'motion/react';
import {ExtrudeGeometry,TorusKnotGeometry,PMREMGenerator,MathUtils,type Mesh} from 'three';
import {SVGLoader} from 'three/addons/loaders/SVGLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {sanitizeSvg} from './assets';
import type {ModelSpec} from './document';
import {assetPath} from '../paths';

function Shape({spec,reduced}:{spec:ModelSpec;reduced:boolean}){
 const mesh=useRef<Mesh>(null),{gl,scene,invalidate}=useThree();
 const geometry=useMemo(()=>{
  if(!spec.svg)return new TorusKnotGeometry(1.15,.43,128,24,2,3);
  const parsed=new SVGLoader().parse(sanitizeSvg(spec.svg));const shapes=parsed.paths.flatMap(path=>SVGLoader.createShapes(path));
  if(!shapes.length)throw Error('SVG 没有可挤出的轮廓');
  const g=new ExtrudeGeometry(shapes,{depth:spec.depth,bevelEnabled:spec.bevel>0,bevelThickness:spec.bevel,bevelSize:spec.bevel,bevelSegments:3,curveSegments:8,steps:1});
  g.computeBoundingBox();const box=g.boundingBox!;const size=Math.max(box.max.x-box.min.x,box.max.y-box.min.y,box.max.z-box.min.z);if(!Number.isFinite(size)||size<=0){g.dispose();throw Error('SVG 尺寸无效');}g.center();g.scale(3/size,-3/size,3/size);g.computeVertexNormals();return g;
 },[spec.svg,spec.depth,spec.bevel]);
 useEffect(()=>()=>geometry.dispose(),[geometry]);
 useEffect(()=>{const gen=new PMREMGenerator(gl),room=new RoomEnvironment(),target=gen.fromScene(room,.04);scene.environment=target.texture;invalidate();return()=>{scene.environment=null;target.dispose();room.dispose();gen.dispose()}},[gl,scene,invalidate]);
 useFrame(({pointer},delta)=>{if(!mesh.current||reduced)return;const amount=spec.pointer*Math.PI/180;mesh.current.rotation.x=MathUtils.damp(mesh.current.rotation.x,.15+pointer.y*amount,3,delta);mesh.current.rotation.y=spec.rotate?mesh.current.rotation.y+Math.min(delta,.05)*.3:MathUtils.damp(mesh.current.rotation.y,.25+pointer.x*amount,3,delta)});
 return <><ambientLight intensity={.4}/><directionalLight position={[3,4,5]} intensity={4}/><pointLight position={[-3,-2,3]} color="#173bff" intensity={30}/><mesh ref={mesh} geometry={geometry} rotation={[.15,.25,0]}><meshPhysicalMaterial color={spec.color} metalness={spec.metalness} roughness={spec.roughness} transmission={spec.transmission} ior={spec.ior} clearcoat={spec.clearcoat} thickness={.5} envMapIntensity={2}/></mesh></>;
}
class Boundary extends Component<{children:ReactNode;fallback:ReactNode},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?this.props.fallback:this.props.children}}
export default function Model({spec,src,mobile}:{spec:ModelSpec;src:string;mobile:boolean}){
 const host=useRef<HTMLDivElement>(null),inView=useInView(host),reduced=useReducedMotion();const [ready,setReady]=useState(false),[visible,setVisible]=useState(true),[failed,setFailed]=useState(false);
 useEffect(()=>{const c=document.createElement('canvas');const context=c.getContext('webgl2');const timer=setTimeout(()=>setReady(!!context),0);context?.getExtension('WEBGL_lose_context')?.loseContext();const update=()=>setVisible(!document.hidden);document.addEventListener('visibilitychange',update);return()=>{clearTimeout(timer);document.removeEventListener('visibilitychange',update)}},[]);
 const fallback=<div style={{width:'100%',height:'100%',position:'relative'}}><img src={src.startsWith('/')?assetPath(src):src} alt="模型静态替代图" style={{width:'100%',height:'100%',objectFit:'contain'}}/><span style={{position:'absolute',bottom:8,left:8,color:'#fff',background:'#000b',font:'12px/1.4 Arial',padding:6,letterSpacing:0}}>{mobile?'手机静态替代图':'当前浏览器未启用 3D · 静态替代图'}</span></div>;
 return <div ref={host} style={{width:'100%',height:'100%'}}>{!ready||mobile||failed?fallback:<Boundary key={spec.svg} fallback={fallback}><Canvas camera={{position:[0,0,7],fov:34}} dpr={[1,1.5]} frameloop={!inView||!visible?'never':reduced||(!spec.rotate&&!spec.pointer)?'demand':'always'} gl={{alpha:true,antialias:true,powerPreference:'low-power'}} onCreated={({gl})=>gl.domElement.addEventListener('webglcontextlost',()=>setFailed(true),{once:true})}><Shape spec={spec} reduced={!!reduced}/></Canvas></Boundary>}</div>;
}

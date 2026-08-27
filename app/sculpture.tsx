"use client";
/* Three.js scenes are an imperative external rendering system; mutations are
   confined to effects/frame callbacks and cleaned up on unmount. */
/* eslint-disable react-hooks/immutability */
import {Canvas,useFrame,useThree} from "@react-three/fiber";
import {useEffect,useRef} from "react";
import {Mesh,PMREMGenerator,MathUtils} from "three";
import {RoomEnvironment} from "three/addons/environments/RoomEnvironment.js";
function ObjectScene({onReady}:{onReady:()=>void}){
 const mesh=useRef<Mesh>(null);const pointer=useRef({x:0,y:0});const {gl,scene}=useThree();
 useEffect(()=>{
  const generator=new PMREMGenerator(gl);const room=new RoomEnvironment();const target=generator.fromScene(room,.04);scene.environment=target.texture;onReady();
  const move=(e:PointerEvent)=>{pointer.current={x:MathUtils.clamp(e.clientX/window.innerWidth*2-1,-1,1),y:MathUtils.clamp(e.clientY/window.innerHeight*2-1,-1,1)}};
  window.addEventListener("pointermove",move,{passive:true});
  return()=>{window.removeEventListener("pointermove",move);scene.environment=null;target.dispose();room.dispose();generator.dispose()};
 },[gl,scene,onReady]);
 useFrame((_,delta)=>{if(mesh.current){mesh.current.rotation.x=MathUtils.damp(mesh.current.rotation.x,.25+pointer.current.y*.07,3,delta);mesh.current.rotation.y=MathUtils.damp(mesh.current.rotation.y,.35+pointer.current.x*.07,3,delta)}});
 return <><ambientLight intensity={.2}/><directionalLight position={[3,4,5]} intensity={4}/><pointLight position={[-3,-2,3]} color="#173bff" intensity={35}/><mesh ref={mesh} rotation={[.25,.35,-.4]}><torusKnotGeometry args={[1.15,.43,220,32,2,3]}/><meshPhysicalMaterial color="#151922" metalness={.98} roughness={.13} clearcoat={1} clearcoatRoughness={.05} envMapIntensity={2.5}/></mesh></>
}
export default function Sculpture({active,onReady,onFailure}:{active:boolean;onReady:()=>void;onFailure:()=>void}){
 return <Canvas camera={{position:[0,0,7],fov:34}} dpr={[1,1.5]} frameloop={active?"always":"never"} gl={{alpha:true,antialias:true,powerPreference:"low-power"}} onCreated={({gl})=>{gl.domElement.addEventListener("webglcontextlost",onFailure,{once:true})}}><ObjectScene onReady={onReady}/></Canvas>
}

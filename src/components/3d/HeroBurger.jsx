import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import * as THREE from 'three';

// --- INGREDIENT COMPONENTS ---
function BunBottom({ position }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <sphereGeometry args={[1.45, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.25]} />
      <meshStandardMaterial color="#E6A15C" roughness={0.3} rotation={[Math.PI, 0, 0]} side={THREE.DoubleSide} />
    </mesh>
  );
}

function Patty({ position }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[1.4, 1.4, 0.4, 64]} />
      <meshStandardMaterial color="#3E2723" roughness={0.8} />
    </mesh>
  );
}

function Cheese({ position }) {
  return (
    <mesh position={position} rotation={[0, 0.8, 0]}>
      <boxGeometry args={[2.6, 0.05, 2.6]} />
      <meshStandardMaterial color="#FFC107" roughness={0.2} />
    </mesh>
  );
}

function Tomato({ position }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[1.3, 1.3, 0.1, 64]} />
      <meshStandardMaterial color="#D32F2F" roughness={0.1} />
    </mesh>
  );
}

function Lettuce({ position }) {
  return (
    <mesh position={position}>
       <cylinderGeometry args={[1.5, 1.5, 0.05, 16]} />
       <meshStandardMaterial color="#4CAF50" roughness={0.5} wireframe={false} />
    </mesh>
  );
}

function BunTop({ position }) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <sphereGeometry args={[1.5, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.4]} />
      <meshStandardMaterial color="#E6A15C" roughness={0.3} />
    </mesh>
  );
}

// --- MAIN ANIMATED COMPONENT ---
export default function HeroBurger() {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // 1. ROTATION (Premium Speed)
    group.current.rotation.y = t * 0.25; 
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group ref={group} scale={0.65} rotation={[0.2, 0, 0]}>
        <AnimatedLayers />
      </group>
    </Float>
  );
}

function AnimatedLayers() {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // 2. BREATHING (Gentle Speed)
    const expansion = (Math.sin(t * 1.5) + 1) * 0.4; 
    
    if(group.current.children[0]) group.current.children[0].position.y = -0.9 - (expansion * 0.1);
    if(group.current.children[1]) group.current.children[1].position.y = -0.5 + (expansion * 0.2);
    if(group.current.children[2]) group.current.children[2].position.y = -0.2 + (expansion * 0.4);
    if(group.current.children[3]) group.current.children[3].position.y = 0.0 + (expansion * 0.6);
    if(group.current.children[4]) group.current.children[4].position.y = 0.15 + (expansion * 0.8);
    if(group.current.children[5]) group.current.children[5].position.y = 0.45 + (expansion * 1.2);
  });

  return (
    <group ref={group}>
      <mesh rotation={[Math.PI, 0, 0]} position={[0, -0.9, 0]}>
         <sphereGeometry args={[1.4, 64, 64, 0, Math.PI * 2, 0, Math.PI * 0.25]} />
         <meshStandardMaterial color="#E6A15C" />
      </mesh>
      <Patty position={[0, -0.5, 0]} />
      <Cheese position={[0, -0.28, 0]} />
      <Tomato position={[0, -0.1, 0]} />
      <Lettuce position={[0, 0.05, 0]} />
      <BunTop position={[0, 0.45, 0]} />
    </group>
  )
}
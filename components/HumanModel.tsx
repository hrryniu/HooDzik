'use client';

import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '@/store/useStore';

// Create smooth body curves using lathe geometry points
function createBodyCurve(points: THREE.Vector2[], segments: number = 64): THREE.LatheGeometry {
  return new THREE.LatheGeometry(points, segments);
}

// Human body component with highly realistic proportions
function HumanBody() {
  const meshRef = useRef<THREE.Group>(null);
  const breathingRef = useRef(0);
  const userProfile = useStore((state) => state.userProfile);
  const theme = useStore((state) => state.theme);

  // Breathing animation - more subtle and natural
  useFrame((state, delta) => {
    if (meshRef.current) {
      breathingRef.current += delta * 0.8;
      const breathScale = 1 + Math.sin(breathingRef.current) * 0.015;
      // Apply breathing to torso only
      const torso = meshRef.current.children.find(child => child.userData.name === 'torso');
      if (torso) {
        torso.scale.set(1, breathScale, 1);
      }
    }
  });

  // Calculate body proportions based on user data with BMI
  const getBodyScale = () => {
    const baseHeight = 1.75; // 175cm reference
    const heightScale = userProfile.height / 100 / baseHeight;
    
    const bmi = userProfile.weight / Math.pow(userProfile.height / 100, 2);
    const baseBMI = 22; // Normal BMI reference
    
    // Width scale based on BMI - more accurate body representation
    const bmiRatio = bmi / baseBMI;
    const widthScale = Math.pow(bmiRatio, 0.4) * (userProfile.gender === 'male' ? 1.0 : 0.88);
    
    // Muscle definition based on BMI (lower BMI = more defined)
    const muscleDef = Math.max(0.75, Math.min(1.25, 1.4 - (bmi - 22) * 0.04));
    
    // Body fat affects overall roundness
    const bodyFatFactor = 1 + (userProfile.bodyFat - 15) * 0.01;
    
    return {
      height: heightScale,
      width: widthScale * bodyFatFactor,
      muscle: muscleDef,
      definition: Math.max(0, 1 - (bmi - 22) * 0.03),
    };
  };

  const scale = getBodyScale();
  const isDark = theme === 'dark';

  // Material configuration
  const bodyMaterial = {
    color: isDark ? '#00d9ff' : '#3b82f6',
    wireframe: true,
    emissive: isDark ? '#00d9ff' : '#3b82f6',
    emissiveIntensity: isDark ? 0.6 : 0.3,
    transparent: true,
    opacity: isDark ? 0.85 : 0.9,
  };

  return (
    <group ref={meshRef}>
      {/* HEAD - High detail anatomical head */}
      <mesh position={[0, 1.68 * scale.height, 0]} userData={{ name: 'head' }}>
        <sphereGeometry args={[0.125 * scale.width, 64, 64]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* NECK - Smooth muscular neck */}
      <mesh position={[0, 1.50 * scale.height, 0]} scale={[1, 1.1, 0.95]} userData={{ name: 'neck' }}>
        <cylinderGeometry args={[
          0.052 * scale.width, 
          0.068 * scale.width, 
          0.16 * scale.height, 
          48
        ]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* TORSO - Realistic body shape using multiple segments */}
      <group userData={{ name: 'torso' }}>
        {/* Upper chest/shoulders */}
        <mesh position={[0, 1.32 * scale.height, 0]} scale={[1.05, 0.9, 0.68]}>
          <sphereGeometry args={[
            0.185 * scale.width * scale.muscle, 
            48, 48, 
            0, Math.PI * 2, 
            0, Math.PI * 0.55
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>

        {/* Mid chest - pectorals area */}
        <mesh position={[0, 1.18 * scale.height, 0]} scale={[0.98, 1, 0.62]}>
          <sphereGeometry args={[
            0.17 * scale.width * scale.muscle, 
            48, 48
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>

        {/* Ribcage */}
        <mesh position={[0, 1.0 * scale.height, 0]} scale={[0.92, 1.15, 0.58]}>
          <capsuleGeometry args={[
            0.155 * scale.width * scale.muscle, 
            0.18 * scale.height, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>

        {/* Upper abdomen */}
        <mesh position={[0, 0.84 * scale.height, 0]} scale={[0.88, 1, 0.55]}>
          <cylinderGeometry args={[
            0.138 * scale.width * scale.muscle,
            0.148 * scale.width,
            0.20 * scale.height,
            40
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>

        {/* Lower abdomen */}
        <mesh position={[0, 0.70 * scale.height, 0]} scale={[0.92, 1, 0.58]}>
          <cylinderGeometry args={[
            0.148 * scale.width,
            0.162 * scale.width,
            0.16 * scale.height,
            40
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
      </group>

      {/* PELVIS/HIPS - Natural hip structure */}
      <mesh position={[0, 0.56 * scale.height, 0]} scale={[1, 0.75, 0.68]} userData={{ name: 'pelvis' }}>
        <capsuleGeometry args={[
          0.165 * scale.width, 
          0.10 * scale.height, 
          40, 64
        ]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* LEFT SHOULDER - Realistic deltoid */}
      <mesh position={[-0.215 * scale.width * scale.muscle, 1.30 * scale.height, 0]} scale={[1, 1.1, 0.9]}>
        <sphereGeometry args={[0.075 * scale.width * scale.muscle, 32, 32]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* RIGHT SHOULDER - Realistic deltoid */}
      <mesh position={[0.215 * scale.width * scale.muscle, 1.30 * scale.height, 0]} scale={[1, 1.1, 0.9]}>
        <sphereGeometry args={[0.075 * scale.width * scale.muscle, 32, 32]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* LEFT ARM - Anatomically correct arm structure */}
      <group position={[-0.27 * scale.width * scale.muscle, 1.22 * scale.height, 0]} userData={{ name: 'leftArm' }}>
        {/* Upper arm - bicep/tricep region */}
        <mesh position={[0, -0.17, 0]} scale={[1, 1, 0.88]} rotation={[0, 0, 0.05]}>
          <capsuleGeometry args={[
            0.043 * scale.width * scale.muscle, 
            0.16, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Elbow joint - rounded transition */}
        <mesh position={[0, -0.36, 0]}>
          <sphereGeometry args={[0.040 * scale.width, 28, 28]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Forearm - tapered from elbow to wrist */}
        <mesh position={[0, -0.55, 0]} scale={[1, 1, 0.82]}>
          <capsuleGeometry args={[
            0.035 * scale.width, 
            0.16, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Wrist */}
        <mesh position={[0, -0.73, 0]}>
          <sphereGeometry args={[0.030 * scale.width, 24, 24]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Hand - palm and fingers combined */}
        <mesh position={[0, -0.86, 0]} scale={[0.75, 1, 1.15]}>
          <capsuleGeometry args={[
            0.026 * scale.width, 
            0.08, 
            32, 48
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
      </group>

      {/* RIGHT ARM - Anatomically correct arm structure */}
      <group position={[0.27 * scale.width * scale.muscle, 1.22 * scale.height, 0]} userData={{ name: 'rightArm' }}>
        {/* Upper arm - bicep/tricep region */}
        <mesh position={[0, -0.17, 0]} scale={[1, 1, 0.88]} rotation={[0, 0, -0.05]}>
          <capsuleGeometry args={[
            0.043 * scale.width * scale.muscle, 
            0.16, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Elbow joint - rounded transition */}
        <mesh position={[0, -0.36, 0]}>
          <sphereGeometry args={[0.040 * scale.width, 28, 28]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Forearm - tapered from elbow to wrist */}
        <mesh position={[0, -0.55, 0]} scale={[1, 1, 0.82]}>
          <capsuleGeometry args={[
            0.035 * scale.width, 
            0.16, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Wrist */}
        <mesh position={[0, -0.73, 0]}>
          <sphereGeometry args={[0.030 * scale.width, 24, 24]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Hand - palm and fingers combined */}
        <mesh position={[0, -0.86, 0]} scale={[0.75, 1, 1.15]}>
          <capsuleGeometry args={[
            0.026 * scale.width, 
            0.08, 
            32, 48
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
      </group>

      {/* LEFT LEG - Realistic leg structure with muscle definition */}
      <group position={[-0.105 * scale.width, 0.46 * scale.height, 0]} userData={{ name: 'leftLeg' }}>
        {/* Upper thigh - quadriceps */}
        <mesh position={[0, -0.13, 0]} scale={[1, 1, 0.82]}>
          <capsuleGeometry args={[
            0.070 * scale.width * Math.sqrt(scale.muscle), 
            0.14, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>

        {/* Lower thigh */}
        <mesh position={[0, -0.32, 0]} scale={[0.95, 1, 0.78]}>
          <capsuleGeometry args={[
            0.062 * scale.width, 
            0.14, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Knee joint - patella */}
        <mesh position={[0, -0.47, 0]} scale={[1, 0.95, 1.05]}>
          <sphereGeometry args={[0.058 * scale.width, 32, 32]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Upper calf - gastrocnemius */}
        <mesh position={[0, -0.62, 0]} scale={[0.85, 1, 0.95]}>
          <capsuleGeometry args={[
            0.050 * scale.width, 
            0.13, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>

        {/* Lower calf - soleus */}
        <mesh position={[0, -0.82, 0]} scale={[0.75, 1, 0.85]}>
          <cylinderGeometry args={[
            0.042 * scale.width,
            0.038 * scale.width,
            0.15,
            40
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Ankle joint */}
        <mesh position={[0, -0.98, 0]}>
          <sphereGeometry args={[0.042 * scale.width, 28, 28]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Foot - realistic foot structure */}
        <group position={[0, -1.08, 0.058]}>
          {/* Heel */}
          <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2.2, 0, 0]}>
            <capsuleGeometry args={[
              0.038 * scale.width, 
              0.055, 
              32, 48
            ]} />
            <meshStandardMaterial {...bodyMaterial} />
          </mesh>
          {/* Mid foot */}
          <mesh position={[0, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]} scale={[0.9, 1, 1]}>
            <capsuleGeometry args={[
              0.040 * scale.width, 
              0.08, 
              32, 48
            ]} />
            <meshStandardMaterial {...bodyMaterial} />
          </mesh>
        </group>
      </group>

      {/* RIGHT LEG - Realistic leg structure with muscle definition */}
      <group position={[0.105 * scale.width, 0.46 * scale.height, 0]} userData={{ name: 'rightLeg' }}>
        {/* Upper thigh - quadriceps */}
        <mesh position={[0, -0.13, 0]} scale={[1, 1, 0.82]}>
          <capsuleGeometry args={[
            0.070 * scale.width * Math.sqrt(scale.muscle), 
            0.14, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>

        {/* Lower thigh */}
        <mesh position={[0, -0.32, 0]} scale={[0.95, 1, 0.78]}>
          <capsuleGeometry args={[
            0.062 * scale.width, 
            0.14, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Knee joint - patella */}
        <mesh position={[0, -0.47, 0]} scale={[1, 0.95, 1.05]}>
          <sphereGeometry args={[0.058 * scale.width, 32, 32]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Upper calf - gastrocnemius */}
        <mesh position={[0, -0.62, 0]} scale={[0.85, 1, 0.95]}>
          <capsuleGeometry args={[
            0.050 * scale.width, 
            0.13, 
            40, 64
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>

        {/* Lower calf - soleus */}
        <mesh position={[0, -0.82, 0]} scale={[0.75, 1, 0.85]}>
          <cylinderGeometry args={[
            0.042 * scale.width,
            0.038 * scale.width,
            0.15,
            40
          ]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Ankle joint */}
        <mesh position={[0, -0.98, 0]}>
          <sphereGeometry args={[0.042 * scale.width, 28, 28]} />
          <meshStandardMaterial {...bodyMaterial} />
        </mesh>
        
        {/* Foot - realistic foot structure */}
        <group position={[0, -1.08, 0.058]}>
          {/* Heel */}
          <mesh position={[0, 0, -0.02]} rotation={[Math.PI / 2.2, 0, 0]}>
            <capsuleGeometry args={[
              0.038 * scale.width, 
              0.055, 
              32, 48
            ]} />
            <meshStandardMaterial {...bodyMaterial} />
          </mesh>
          {/* Mid foot */}
          <mesh position={[0, 0, 0.045]} rotation={[Math.PI / 2, 0, 0]} scale={[0.9, 1, 1]}>
            <capsuleGeometry args={[
              0.040 * scale.width, 
              0.08, 
              32, 48
            ]} />
            <meshStandardMaterial {...bodyMaterial} />
          </mesh>
        </group>
      </group>

      {/* Enhanced glow effect with theme support */}
      <pointLight 
        position={[0, 1.0, 0.8]} 
        color={isDark ? '#00d9ff' : '#3b82f6'} 
        intensity={isDark ? 1.5 : 0.8} 
        distance={3} 
      />
      <pointLight 
        position={[0, 1.68, 0.5]} 
        color={isDark ? '#00d9ff' : '#3b82f6'} 
        intensity={isDark ? 1.0 : 0.5} 
        distance={1.5} 
      />
      <pointLight 
        position={[0, 0.2, 0.5]} 
        color={isDark ? '#00d9ff' : '#3b82f6'} 
        intensity={isDark ? 0.8 : 0.4} 
        distance={2} 
      />
    </group>
  );
}

// Enhanced holographic grid platform with theme support
function Platform() {
  const platformRef = useRef<THREE.Group>(null);
  const theme = useStore((state) => state.theme);
  const isDark = theme === 'dark';
  
  useFrame((state) => {
    if (platformRef.current) {
      platformRef.current.rotation.z = state.clock.getElapsedTime() * 0.05;
    }
  });

  const platformColor = isDark ? '#00d9ff' : '#3b82f6';

  return (
    <group ref={platformRef} position={[0, -1.15, 0]}>
      {/* Main platform circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.8, 64]} />
        <meshBasicMaterial 
          color={platformColor} 
          wireframe 
          opacity={isDark ? 0.15 : 0.1} 
          transparent 
        />
      </mesh>
      
      {/* Multiple rings for depth */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.6, 1.8, 64]} />
        <meshBasicMaterial 
          color={platformColor} 
          opacity={isDark ? 0.4 : 0.3} 
          transparent 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[1.2, 1.25, 48]} />
        <meshBasicMaterial 
          color={platformColor} 
          opacity={isDark ? 0.5 : 0.35} 
          transparent 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <ringGeometry args={[0.8, 0.85, 32]} />
        <meshBasicMaterial 
          color={platformColor} 
          opacity={isDark ? 0.6 : 0.4} 
          transparent 
          side={THREE.DoubleSide} 
        />
      </mesh>
      
      {/* Center glow */}
      <pointLight 
        position={[0, 0.1, 0]} 
        color={platformColor} 
        intensity={isDark ? 0.5 : 0.3} 
        distance={2} 
      />
    </group>
  );
}

export default function HumanModel() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-neon-blue animate-pulse">Loading 3D Model...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full max-w-2xl mx-auto">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.5, 3.5]} fov={45} />
        
        {/* Enhanced Lighting Setup */}
        <ambientLight intensity={0.4} />
        <directionalLight 
          position={[5, 10, 5]} 
          intensity={0.8} 
          color="#00d9ff" 
          castShadow 
        />
        <directionalLight 
          position={[-5, 5, -5]} 
          intensity={0.4} 
          color="#0088ff" 
        />
        <hemisphereLight 
          skyColor="#00d9ff" 
          groundColor="#001a33" 
          intensity={0.5} 
        />
        
        {/* Rim lights for better definition */}
        <pointLight position={[2, 1, -2]} intensity={0.6} color="#00d9ff" distance={5} />
        <pointLight position={[-2, 1, -2]} intensity={0.6} color="#00d9ff" distance={5} />
        
        {/* 3D Scene */}
        <HumanBody />
        <Platform />
        
        {/* Controls with better settings */}
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          minDistance={2.5}
          maxDistance={6}
          maxPolarAngle={Math.PI / 1.5}
          minPolarAngle={Math.PI / 4}
          target={[0, 0.3, 0]}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* Loading indicator overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-neon-blue/50 text-sm">
        Przeciągnij, aby obrócić • Scroll, aby przybliżyć
      </div>
    </div>
  );
}




import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';
import { audio } from '../services/audioService';
import { LocationCategory } from '../types';

interface CosmicSceneProps {
  palette: string[];
  category: LocationCategory;
  biome: string;
  onMoteCaught: (bonus: number, x: number, y: number) => void;
}

const CosmicScene: React.FC<CosmicSceneProps> = ({ palette, category, biome, onMoteCaught }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouse = useRef(new THREE.Vector2(-10, -10));
  const mousePixels = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 4000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();

    const createCloudTexture = () => {
      const size = 256;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d');
      if (context) {
        const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.3)');
        gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.08)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.02)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        context.fillStyle = gradient;
        context.fillRect(0, 0, size, size);
      }
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    const cloudTexture = createCloudTexture();

    const paletteColors = palette.map(hex => new THREE.Color(hex));
    const primaryColor = paletteColors[0] || new THREE.Color('#4f46e5');
    const accentColor = paletteColors[paletteColors.length - 1] || new THREE.Color('#ffffff');

    const isDark = biome === 'Total Darkness';
    const starCount = isDark ? 2000 : 12000;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    const starSizes = new Float32Array(starCount);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 3500;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 3500;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 3500;
      starSizes[i] = Math.random() * 2;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
    const starMat = new THREE.PointsMaterial({ 
      color: isDark ? 0x450a0a : 0xffffff, 
      size: 1.2, 
      transparent: true, 
      opacity: 0.8,
      map: cloudTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    const createNebulaLayer = (count: number, radius: number, size: number, opacity: number, speed: number) => {
      const geo = new THREE.BufferGeometry();
      const pos = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const pSizes = new Float32Array(count);

      for (let i = 0; i < count; i++) {
        const r = radius * (0.8 + Math.random() * 0.4);
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        pos[i * 3 + 2] = r * Math.cos(phi);

        const color = paletteColors[Math.floor(Math.random() * paletteColors.length)];
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;

        pSizes[i] = size * (0.5 + Math.random());
      }

      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      geo.setAttribute('size', new THREE.BufferAttribute(pSizes, 1));

      const mat = new THREE.PointsMaterial({
        size: size,
        map: cloudTexture,
        transparent: true,
        opacity: isDark ? opacity * 0.3 : opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true,
        sizeAttenuation: true
      });

      const nebula = new THREE.Points(geo, mat);
      nebula.userData = { rotationSpeed: speed };
      return nebula;
    };

    const nebulaLayers = [
      createNebulaLayer(500, 1000, 400, 0.12, 0.00008),
      createNebulaLayer(300, 1500, 800, 0.08, -0.00005),
      createNebulaLayer(200, 600, 300, 0.15, 0.00012)
    ];
    nebulaLayers.forEach(layer => scene.add(layer));

    const atmosphereGeo = new THREE.SphereGeometry(100, 32, 32);
    const atmosphereMat = new THREE.MeshStandardMaterial({
      color: primaryColor,
      transparent: true,
      opacity: isDark ? 0.01 : 0.04,
      side: THREE.BackSide,
      emissive: primaryColor,
      emissiveIntensity: 0.1
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    atmosphere.scale.set(30, 30, 30);
    scene.add(atmosphere);

    const biomeObjects: THREE.Object3D[] = [];

    if (biome === 'Nebula') {
      const pGeo = new THREE.IcosahedronGeometry(2, 0);
      for (let i = 0; i < 40; i++) {
        const pMat = new THREE.MeshStandardMaterial({ 
          color: accentColor, 
          transparent: true, 
          opacity: 0.3,
          emissive: accentColor,
          emissiveIntensity: 0.2
        });
        const p = new THREE.Mesh(pGeo, pMat);
        p.position.set((Math.random() - 0.5) * 300, (Math.random() - 0.5) * 300, (Math.random() - 0.5) * 200);
        scene.add(p);
        biomeObjects.push(p);
      }
    } else if (biome === 'Metallic Forge') {
      const bGeo = new THREE.BoxGeometry(15, 15, 15);
      for (let i = 0; i < 15; i++) {
        const bMat = new THREE.MeshStandardMaterial({ 
          color: 0x333333, 
          wireframe: true,
          emissive: 0xff0000,
          emissiveIntensity: 0.05
        });
        const b = new THREE.Mesh(bGeo, bMat);
        b.position.set((Math.random() - 0.5) * 400, (Math.random() - 0.5) * 400, (Math.random() - 0.5) * 200);
        scene.add(b);
        biomeObjects.push(b);
      }
    } else if (biome === 'Liquid Light') {
      for (let i = 0; i < 6; i++) {
        const rGeo = new THREE.TorusGeometry(50 + i * 30, 0.8, 12, 128);
        const rMat = new THREE.MeshStandardMaterial({ 
          color: accentColor, 
          transparent: true, 
          opacity: 0.08,
          emissive: accentColor,
          emissiveIntensity: 0.1
        });
        const r = new THREE.Mesh(rGeo, rMat);
        r.rotation.x = Math.PI / 2;
        r.rotation.y = Math.random() * Math.PI;
        scene.add(r);
        biomeObjects.push(r);
      }
    } else if (biome === 'Radiant City') {
      const tGeo = new THREE.CylinderGeometry(1, 4, 120, 4);
      for (let i = 0; i < 18; i++) {
        const tMat = new THREE.MeshStandardMaterial({ 
          color: primaryColor, 
          emissive: primaryColor, 
          emissiveIntensity: 0.8,
          transparent: true,
          opacity: 0.6
        });
        const t = new THREE.Mesh(tGeo, tMat);
        t.position.set((Math.random() - 0.5) * 500, -150, (Math.random() - 0.5) * 400);
        t.rotation.x = (Math.random() - 0.5) * 0.2;
        scene.add(t);
        biomeObjects.push(t);
      }
    } else if (biome === 'Fractal Labyrinth') {
      for (let i = 0; i < 25; i++) {
        const fGeo = new THREE.OctahedronGeometry(Math.random() * 12, 0);
        const fMat = new THREE.MeshStandardMaterial({ 
          color: primaryColor, 
          wireframe: true, 
          transparent: true, 
          opacity: 0.25,
          emissive: primaryColor,
          emissiveIntensity: 0.1
        });
        const f = new THREE.Mesh(fGeo, fMat);
        f.position.set((Math.random() - 0.5) * 350, (Math.random() - 0.5) * 350, (Math.random() - 0.5) * 200);
        scene.add(f);
        biomeObjects.push(f);
      }
    } else if (biome === 'Singularity') {
      const cGeo = new THREE.SphereGeometry(25, 64, 64);
      const cMat = new THREE.MeshStandardMaterial({ 
        color: 0x000000, 
        emissive: 0x880000, 
        emissiveIntensity: 0.5,
        roughness: 0,
        metalness: 1
      });
      const core = new THREE.Mesh(cGeo, cMat);
      scene.add(core);
      biomeObjects.push(core);
    }

    const moteGeo = new THREE.SphereGeometry(1.5, 16, 16);
    const motes: THREE.Mesh[] = [];
    for (let i = 0; i < 10; i++) {
      const moteMat = new THREE.MeshBasicMaterial({ 
        color: 0xfff9c4, 
        transparent: true, 
        opacity: 0.9
      });
      const mote = new THREE.Mesh(moteGeo, moteMat);
      mote.position.set((Math.random() - 0.5) * 150, (Math.random() - 0.5) * 150, (Math.random() - 0.5) * 80);
      mote.userData = { 
        phase: Math.random() * Math.PI * 2,
        floatSpeed: 0.01 + Math.random() * 0.02,
        rotSpeed: 0.02 + Math.random() * 0.03
      };
      scene.add(mote);
      motes.push(mote);
    }

    const light = new THREE.PointLight(accentColor, 3, 1500);
    light.position.set(50, 50, 100);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040, 3.5));

    camera.position.z = 250;

    const handleMouseMove = (event: MouseEvent) => {
      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      mousePixels.current = { x: event.clientX, y: event.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let frame = 0;
    const animate = () => {
      frame++;
      requestAnimationFrame(animate);
      
      stars.rotation.y += 0.00005;
      stars.rotation.x += 0.00002;
      
      nebulaLayers.forEach(nebula => {
        nebula.rotation.y += nebula.userData.rotationSpeed;
        nebula.rotation.z += nebula.userData.rotationSpeed * 0.5;
        nebula.scale.setScalar(1 + Math.sin(frame * 0.005) * 0.02);
      });
      
      biomeObjects.forEach((obj, idx) => {
        obj.rotation.y += 0.006;
        obj.rotation.z += 0.003;
        if (biome === 'Singularity') {
          obj.scale.setScalar(1 + Math.sin(frame * 0.08) * 0.15);
        } else if (biome === 'Liquid Light') {
          obj.scale.setScalar(1 + Math.sin(frame * 0.015 + idx) * 0.08);
          obj.rotation.z += 0.01;
        } else if (biome === 'Radiant City') {
          obj.position.y += Math.sin(frame * 0.01 + idx) * 0.1;
        }
      });

      raycaster.setFromCamera(mouse.current, camera);
      const intersects = raycaster.intersectObjects(motes);
      if (intersects.length > 0) {
        const mote = intersects[0].object as THREE.Mesh;
        if (mote.visible) {
          mote.visible = false;
          audio.playMoteCatch();
          onMoteCaught(50, mousePixels.current.x, mousePixels.current.y);
        }
      }

      motes.forEach(m => {
        if (m.visible) {
          m.position.y += Math.sin(frame * 0.03 + m.userData.phase) * 0.1;
          m.position.x += Math.cos(frame * 0.01 + m.userData.phase) * 0.05;
          m.rotation.y += m.userData.rotSpeed;
          m.rotation.x += m.userData.rotSpeed * 0.5;
        }
      });

      camera.position.x += (mouse.current.x * 20 - camera.position.x) * 0.02;
      camera.position.y += (mouse.current.y * 20 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (containerRef.current?.contains(renderer.domElement)) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [palette, category, biome, onMoteCaught]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-transparent to-black/80 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-40 pointer-events-none" />
    </div>
  );
};

export default CosmicScene;


import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface CyberThreeSceneProps {
  className?: string;
}

const CyberThreeScene: React.FC<CyberThreeSceneProps> = ({ className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setClearColor(0x000000, 0);
    containerRef.current.appendChild(renderer.domElement);

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0x00ff9d, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create cyber-themed objects
    const gridGeometry = new THREE.IcosahedronGeometry(2, 1);
    const gridMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ff9d,
      wireframe: true,
      transparent: true,
      opacity: 0.5
    });
    const grid = new THREE.Mesh(gridGeometry, gridMaterial);
    scene.add(grid);

    // Add a core sphere
    const coreGeometry = new THREE.SphereGeometry(0.5, 32, 32);
    const coreMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xff00ff,
      emissive: 0xff00ff,
      emissiveIntensity: 0.5
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Rotate the objects
      grid.rotation.x += 0.003;
      grid.rotation.y += 0.005;
      core.rotation.y += 0.01;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose resources
      gridGeometry.dispose();
      gridMaterial.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full min-h-[300px] ${className || ''}`}
    />
  );
};

export default CyberThreeScene;

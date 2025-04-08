
import React, { useEffect, useRef } from 'react';

const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particles
    const particles: {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      pulseSpeed: number;
    }[] = [];
    
    const createParticles = () => {
      const particleCount = Math.floor(window.innerWidth / 12);
      
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: i % 5 === 0 ? '#00FFFF' : i % 7 === 0 ? '#FF00FF' : '#00FF41',
          opacity: Math.random() * 0.5 + 0.2,
          pulseSpeed: Math.random() * 0.02 + 0.01
        });
      }
    };
    
    createParticles();
    
    // Matrix rain characters
    const matrixCharacters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ';
    const drops: number[] = [];
    const fontSize = 12;
    const columns = Math.floor(canvas.width / fontSize);
    
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100;
    }
    
    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let mouseRadius = 150;
    
    canvas.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });
    
    // Pulse effect
    let pulseTime = 0;
    
    const animate = () => {
      // Partially clear the canvas for trail effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update pulse time
      pulseTime += 0.01;
      
      // Draw grid
      ctx.strokeStyle = 'rgba(0, 255, 65, 0.07)';
      ctx.lineWidth = 0.5;
      
      const gridSize = 40;
      
      // Horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw the digital rain
      ctx.font = fontSize + 'px monospace';
      
      for (let i = 0; i < drops.length; i++) {
        // Random character
        const text = matrixCharacters.charAt(Math.floor(Math.random() * matrixCharacters.length));
        
        // Gradient effect for the text
        const headPosition = drops[i] * fontSize;
        
        if (headPosition > 0) {
          // Head character (brighter)
          ctx.fillStyle = 'rgba(0, 255, 65, 0.9)';
          ctx.fillText(text, i * fontSize, headPosition);
          
          // Trailing characters (fading)
          for (let j = 1; j < 20; j++) {
            const y = headPosition - j * fontSize;
            if (y < 0) break;
            
            const alpha = (20 - j) / 30;
            ctx.fillStyle = `rgba(0, 255, 65, ${alpha})`;
            ctx.fillText(
              matrixCharacters.charAt(Math.floor(Math.random() * matrixCharacters.length)), 
              i * fontSize, 
              y
            );
          }
        }
        
        // Reset when it reaches bottom or randomly
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        
        // Move drop down
        drops[i] += 0.1 + Math.random() * 0.1;
      }
      
      // Update and draw particles
      for (let particle of particles) {
        // Update particle position
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Pulse opacity
        particle.opacity = 0.2 + Math.sin(pulseTime * particle.pulseSpeed) * 0.3 + 0.2;
        
        // Mouse interaction
        const dx = mouseX - particle.x;
        const dy = mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius;
          particle.speedX -= dx * force * 0.02;
          particle.speedY -= dy * force * 0.02;
        }
        
        // Boundary check
        if (particle.x < 0) {
          particle.x = 0;
          particle.speedX *= -0.5;
        } else if (particle.x > canvas.width) {
          particle.x = canvas.width;
          particle.speedX *= -0.5;
        }
        
        if (particle.y < 0) {
          particle.y = 0;
          particle.speedY *= -0.5;
        } else if (particle.y > canvas.height) {
          particle.y = canvas.height;
          particle.speedY *= -0.5;
        }
        
        // Speed dampening
        particle.speedX *= 0.99;
        particle.speedY *= 0.99;
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`).replace('rgb', 'rgba');
        ctx.fill();
        
        // Draw connections
        for (let otherParticle of particles) {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 255, 65, ${0.05 * (1 - distance / 100) * particle.opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <>
      <canvas 
        ref={canvasRef} 
        className="fixed top-0 left-0 w-full h-full -z-10" 
      />
      <div className="cyber-grid-bg" />
      <div className="fixed inset-0 -z-10 bg-cyber-radial opacity-50" />
      <div className="fixed inset-0 -z-20 bg-gradient-to-b from-[#0A0A0A] via-[#0f1321] to-[#0A0A0A]"></div>
    </>
  );
};

export default CyberBackground;

import React, { useEffect, useRef } from 'react';

export default function CyberCube() {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;

    canvas.width = 300;
    canvas.height = 300;

    // 3D vertices of a cube
    let nodes = [
      { x: -50, y: -50, z: -50 },
      { x: 50, y: -50, z: -50 },
      { x: 50, y: 50, z: -50 },
      { x: -50, y: 50, z: -50 },
      { x: -50, y: -50, z: 50 },
      { x: 50, y: -50, z: 50 },
      { x: 50, y: 50, z: 50 },
      { x: -50, y: 50, z: 50 }
    ];

    // 12 edges connecting the nodes
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // Back face
      [4, 5], [5, 6], [6, 7], [7, 4], // Front face
      [0, 4], [1, 5], [2, 6], [3, 7]  // Connectors
    ];

    // Mouse movement listeners
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      
      // Calculate normalized cursor offset
      mouseRef.current.targetX = (e.clientX - cx) * 0.005;
      mouseRef.current.targetY = (e.clientY - cy) * 0.005;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3D rotation math helper
    const rotateX = (node, theta) => {
      const sin = Math.sin(theta);
      const cos = Math.cos(theta);
      const y = node.y * cos - node.z * sin;
      const z = node.y * sin + node.z * cos;
      return { ...node, y, z };
    };

    const rotateY = (node, theta) => {
      const sin = Math.sin(theta);
      const cos = Math.cos(theta);
      const x = node.x * cos + node.z * sin;
      const z = -node.x * sin + node.z * cos;
      return { ...node, x, z };
    };

    const rotateZ = (node, theta) => {
      const sin = Math.sin(theta);
      const cos = Math.cos(theta);
      const x = node.x * cos - node.y * sin;
      const y = node.x * sin + node.y * cos;
      return { ...node, x, y };
    };

    let angleX = 0.008;
    let angleY = 0.01;
    let angleZ = 0.005;

    const drawLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Interpolate mouse movements
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // Center offset
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;
      const fov = 340; // perspective depth scale

      // Rotate nodes based on base angles + mouse tilts
      let rotatedNodes = nodes.map(n => rotateX(n, angleX + mouse.y));
      rotatedNodes = rotatedNodes.map(n => rotateY(n, angleY + mouse.x));
      rotatedNodes = rotatedNodes.map(n => rotateZ(n, angleZ));

      // Draw cyber glowing circles in the background
      ctx.strokeStyle = 'rgba(255, 0, 127, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, 90, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.beginPath();
      ctx.arc(cx, cy, 110, 0, Math.PI * 2);
      ctx.stroke();

      // Project vertices to 2D
      const projected = rotatedNodes.map(n => {
        const factor = fov / (fov + n.z);
        return {
          x: n.x * factor + cx,
          y: n.y * factor + cy
        };
      });

      // Draw edges
      edges.forEach(([u, v]) => {
        const grad = ctx.createLinearGradient(projected[u].x, projected[u].y, projected[v].x, projected[v].y);
        grad.addColorStop(0, '#00f0ff'); // Cyan hex color instead of CSS variables
        grad.addColorStop(1, '#ff007f'); // Magenta hex color instead of CSS variables

        ctx.strokeStyle = grad;
        ctx.lineWidth = 2.2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.moveTo(projected[u].x, projected[u].y);
        ctx.lineTo(projected[v].x, projected[v].y);
        ctx.stroke();
        
        ctx.shadowBlur = 0; // reset
      });

      // Draw glowing vertices
      projected.forEach(p => {
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Increment baseline rotations
      angleX += 0.003;
      angleY += 0.004;

      animationId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '300px', height: '300px' }}>
      <canvas ref={canvasRef} style={{ pointerEvents: 'none', filter: 'drop-shadow(0 0 15px rgba(0, 240, 255, 0.25))' }} />
      {/* Absolute high-tech border overlay */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '12px',
        height: '12px',
        borderTop: '2px solid var(--neon-cyan)',
        borderLeft: '2px solid var(--neon-cyan)',
        borderTopLeftRadius: '3px'
      }}></div>
      <div style={{
        position: 'absolute',
        bottom: '10px',
        right: '10px',
        width: '12px',
        height: '12px',
        borderBottom: '2px solid var(--neon-magenta)',
        borderRight: '2px solid var(--neon-magenta)',
        borderBottomRightRadius: '3px'
      }}></div>
    </div>
  );
}

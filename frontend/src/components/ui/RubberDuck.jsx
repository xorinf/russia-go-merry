import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * RubberDuck 🐤 — A fun cursor companion that appears when the user is idle.
 * After 3 seconds of no mouse movement, the duck waddles to the cursor position.
 * On any mouse movement, it hides again.
 */
export default function RubberDuck() {
  const [visible, setVisible] = useState(false);
  const [duckPos, setDuckPos] = useState({ x: 0, y: 0 });
  const [targetPos, setTargetPos] = useState({ x: 0, y: 0 });
  const timerRef = useRef(null);
  const animFrameRef = useRef(null);

  const startIdleTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, 3000);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setTargetPos({ x: e.clientX, y: e.clientY });
      setVisible(false);
      startIdleTimer();
    };

    window.addEventListener('mousemove', handleMouseMove);
    startIdleTimer();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [startIdleTimer]);

  // Smooth waddle animation: duck moves toward cursor with spring physics
  useEffect(() => {
    if (!visible) return;

    // Start the duck a bit away from the cursor
    const offsetX = targetPos.x + 40;
    const offsetY = targetPos.y + 40;
    setDuckPos({ x: offsetX, y: offsetY });

    let currentX = offsetX;
    let currentY = offsetY;
    let velX = 0;
    let velY = 0;
    const stiffness = 0.04;
    const damping = 0.75;

    const animate = () => {
      const dx = targetPos.x + 20 - currentX;
      const dy = targetPos.y + 5 - currentY;

      velX = (velX + dx * stiffness) * damping;
      velY = (velY + dy * stiffness) * damping;

      currentX += velX;
      currentY += velY;

      setDuckPos({ x: currentX, y: currentY });

      // Keep animating until close enough
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5 || Math.abs(velX) > 0.1 || Math.abs(velY) > 0.1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [visible, targetPos]);

  if (!visible) return null;

  return (
    <div
      className="rubber-duck"
      style={{
        left: `${duckPos.x}px`,
        top: `${duckPos.y}px`,
      }}
      aria-hidden="true"
    >
      🐤
    </div>
  );
}

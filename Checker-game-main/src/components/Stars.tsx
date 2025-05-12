import { useEffect, useState } from 'react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  angle: number;
  speed: number;
  size: number;
  delay: number;
}

export const Stars = () => {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      for (let i = 0; i < 100; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          delay: Math.random() * 2
        });
      }
      setStars(newStars);
    };

    const generateShootingStars = () => {
      const newShootingStars: ShootingStar[] = [];
      for (let i = 0; i < 5; i++) {
        newShootingStars.push({
          id: i,
          startX: Math.random() * 100,
          startY: Math.random() * 100,
          angle: Math.random() * 45 + 22.5, // Angle between 22.5 and 67.5 degrees
          speed: Math.random() * 2 + 3,
          size: Math.random() * 2 + 2,
          delay: Math.random() * 5
        });
      }
      setShootingStars(newShootingStars);
    };

    generateStars();
    generateShootingStars();

    const interval = setInterval(() => {
      generateShootingStars();
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
      {shootingStars.map((star) => (
        <div
          key={`shooting-${star.id}`}
          className="shooting-star"
          style={{
            left: `${star.startX}%`,
            top: `${star.startY}%`,
            width: `${star.size * 3}px`,
            height: `${star.size}px`,
            transform: `rotate(${star.angle}deg)`,
            animationDuration: `${star.speed}s`,
            animationDelay: `${star.delay}s`
          }}
        />
      ))}
    </>
  );
};
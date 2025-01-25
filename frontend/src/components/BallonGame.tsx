import React, { useState, useEffect, useRef, useCallback } from 'react';

interface Balloon {
  id: number;
  positionX: number;
  positionY: number;
  speed: number;
  color: string;
}

const BalloonGame: React.FC = () => {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const canvasRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Configuration
  const MAX_BALLOONS = 20; // Reduced number of balloons
  const SPAWN_DENSITY = 2000; // Significantly reduced spawn rate
  const BALLOON_IMAGE_COUNT = 39
  const BALLOON_COLORS = [
    { color: 'green', image: '/images/balloons/green.png' },
    { color: 'blue', image: '/images/balloons/blue.png' },
    { color: 'red', image: '/images/balloons/red.png' },
    { color: 'yellow', image: '/images/balloons/purple.png' }
  ];

  // Generate a random X position within the canvas width
  const generateRandomXPos = useCallback(() => {
    if (!canvasRef.current) return 0;
    return Math.floor(Math.random() * (canvasRef.current.clientWidth - 50));
  }, []);

  // Generate a random balloon speed (slower)
  const getRandomSpeed = () => Math.floor(Math.random() * 101) / 100; // Speed between 0 and 1

  // Create a new balloon
  const createBalloon = useCallback((): Balloon => {
    const balloonType = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    return {
      id: Date.now(),
      positionX: generateRandomXPos(),
      positionY: -100, // Start a bit higher
      speed: getRandomSpeed(),
      color: balloonType.color
    };
  }, [generateRandomXPos]);

  // Handle balloon popping
  const handleBalloonClick = useCallback((balloonId: number, event: React.MouseEvent) => {
    event.stopPropagation();

    setBalloons(prevBalloons => {
      const balloonToRemove = prevBalloons.find(b => b.id === balloonId);
      if (!balloonToRemove) return prevBalloons;

      // Select and display a random image
      const imageNo = Math.floor(Math.random() * BALLOON_IMAGE_COUNT) + 1;
      const img = new Image();
      img.src = `/images/flying_new/${imageNo}.jpeg`;

      // Create a temporary image element

      const imgElement = document.createElement('div');
      imgElement.style.backgroundImage = `url('/images/flying_new/${imageNo}.jpeg')`;
      imgElement.style.backgroundSize = 'cover';
      imgElement.style.position = 'absolute';
      if (window.innerWidth - balloonToRemove.positionX < 200) {
        imgElement.style.left = (balloonToRemove.positionX - 200) + "px"
      } else {
        imgElement.style.left = `${balloonToRemove.positionX}px`;
      }
      imgElement.style.bottom = `${balloonToRemove.positionY}px`;
      imgElement.style.width = '200px';
      imgElement.style.height = '200px';
      imgElement.style.zIndex = '30';

      // Append to canvas
      if (canvasRef.current) {
        canvasRef.current.appendChild(imgElement);

        // Remove image after a short delay
        setTimeout(() => {
          if (canvasRef.current) {
            canvasRef.current.removeChild(imgElement);
          }
        }, 900);
      }

      // Remove the balloon
      return prevBalloons.filter(b => b.id !== balloonId);
    });
  }, []);

  // Game loop for updating balloon positions
  const updateBalloons = useCallback(() => {
    setBalloons(prevBalloons => {
      // Add new balloons based on density
      const newBalloons: Balloon[] = [...prevBalloons];
      
      if (Math.random() < SPAWN_DENSITY && newBalloons.length < MAX_BALLOONS) {
        newBalloons.push(createBalloon());
      }

      // Move existing balloons (slower movement)
      return newBalloons
        .map(balloon => ({
          ...balloon,
          positionY: balloon.positionY + (1 + balloon.speed) // Slower ascent
        }))
        .filter(balloon => balloon.positionY < window.innerHeight);
    });

    // Schedule next update
    animationFrameRef.current = requestAnimationFrame(updateBalloons);
  }, [createBalloon]);

  // Start and stop game loop
  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(updateBalloons);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [updateBalloons]);

  return (
    <div 
      ref={canvasRef} 
      className="fixed inset-0 z-30 overflow-hidden pointer-events-none"
      // style={{ 
      //   // Make sure the balloons don't interfere with clicks
      //   mixBlendMode: 'overlay',
      // }}
    >
      {balloons.map(balloon => {
        const balloonType = BALLOON_COLORS.find(b => b.color === balloon.color);
        return (
          <div
            key={balloon.id}
            className="absolute w-16 h-20 balloon cursor-pointer"
            style={{
              left: `${balloon.positionX}px`,
              bottom: `${balloon.positionY}px`,
              backgroundImage: `url(${balloonType?.image})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              pointerEvents: 'auto' // Enable clicking on balloons
            }}
            onClick={(e) => handleBalloonClick(balloon.id, e)}
          />
        );
      })}
    </div>
  );
};

export default BalloonGame;
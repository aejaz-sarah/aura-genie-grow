import React, { useEffect, useRef } from "react";

export default function GenieBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const appRef = useRef<any>(null);

  const randomColors = (count: number) => {
    return new Array(count)
      .fill(0)
      .map(
        () =>
          "#" +
          Math.floor(Math.random() * 16777215)
            .toString(16)
            .padStart(6, "0")
      );
  };

  useEffect(() => {
    const initTimer = setTimeout(() => {
      import(
        "https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js"
      )
        .then((module) => {
          const TubesCursor = module.default;
          if (canvasRef.current) {
            const app = TubesCursor(canvasRef.current, {
              tubes: {
                colors: ["#5e72e4", "#8965e0", "#f5365c"],
                lights: {
                  intensity: 200,
                  colors: ["#21d4fd", "#b721ff", "#f4d03f", "#11cdef"],
                },
              },
            });
            appRef.current = app;
          }
        })
        .catch((err) => console.error("Failed to load TubesCursor module:", err));
    }, 100);

    return () => {
      clearTimeout(initTimer);
      if (appRef.current && typeof appRef.current.dispose === "function") {
        appRef.current.dispose();
      }
    };
  }, []);

  const handleClick = () => {
    if (appRef.current) {
      const newTubeColors = randomColors(3);
      const newLightColors = randomColors(4);
      appRef.current.tubes.setColors(newTubeColors);
      appRef.current.tubes.setLightsColors(newLightColors);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="fixed inset-0 z-0 h-screen w-screen overflow-hidden cursor-pointer bg-black"
    >
      <canvas ref={canvasRef} className="fixed inset-0 z-0" />
      {/* You can remove the sample text here */}
    </div>
  );
}

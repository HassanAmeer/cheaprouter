"use client";
import { PixelatedCanvas } from "./ui/pixelated-canvas";
import profileImage from "../../assets/profilehasan.png";

export function PixelatedCanvasDemo() {
  return (
    <div className="mx-auto mt-8 flex justify-center w-full my-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-8 text-white">Interactive Team Member</h2>
        <PixelatedCanvas
          src={profileImage.src}
          width={400}
          height={500}
          cellSize={3}
          dotScale={0.9}
          shape="square"
          backgroundColor="#000000"
          dropoutStrength={0.4}
          interactive
          distortionStrength={3}
          distortionRadius={80}
          distortionMode="swirl"
          followSpeed={0.2}
          jitterStrength={4}
          jitterSpeed={4}
          sampleAverage
          tintColor="#FFFFFF"
          tintStrength={0.2}
          className="rounded-xl border border-neutral-800 shadow-lg"
        />
      </div>
    </div>
  );
}

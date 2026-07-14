/* eslint-disable react/no-unknown-property */
'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import '../Dither.css';

/* ─── Shaders ─────────────────────────────────────────────────────────────── */
/*
 * A calm field of slowly drifting particles pushed through the same Bayer 8×8
 * ordered-dither + pixelation pipeline as components/Dither.jsx, so it shares
 * the site's dithered aesthetic. No mouse uniforms — interactivity lives in the
 * DOM tilt/parallax that wraps this canvas.
 */

const vertexShader = `
precision highp float;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform vec2  resolution;
uniform float time;
uniform vec3  particleColor;
uniform float colorNum;
uniform float pixelSize;
uniform float particleSize;

#define COUNT 72

float hash(float n){ return fract(sin(n) * 43758.5453123); }

/* ── Bayer 8×8 (matches Dither.jsx) ───────────────────────────────── */
float bayerValue(int x, int y){
  int idx = y*8+x;
  float B[64];
  B[0]=0.;  B[1]=32.; B[2]=8.;  B[3]=40.; B[4]=2.;  B[5]=34.; B[6]=10.; B[7]=42.;
  B[8]=48.; B[9]=16.; B[10]=56.;B[11]=24.;B[12]=50.;B[13]=18.;B[14]=58.;B[15]=26.;
  B[16]=12.;B[17]=44.;B[18]=4.; B[19]=36.;B[20]=14.;B[21]=46.;B[22]=6.; B[23]=38.;
  B[24]=60.;B[25]=28.;B[26]=52.;B[27]=20.;B[28]=62.;B[29]=30.;B[30]=54.;B[31]=22.;
  B[32]=2.; B[33]=50.;B[34]=14.;B[35]=62.;B[36]=1.; B[37]=49.;B[38]=13.;B[39]=61.;
  B[40]=34.;B[41]=18.;B[42]=46.;B[43]=30.;B[44]=33.;B[45]=17.;B[46]=45.;B[47]=29.;
  B[48]=10.;B[49]=58.;B[50]=6.; B[51]=54.;B[52]=9.; B[53]=57.;B[54]=5.; B[55]=53.;
  B[56]=42.;B[57]=26.;B[58]=38.;B[59]=22.;B[60]=41.;B[61]=25.;B[62]=37.;B[63]=21.;
  return B[idx]/64.;
}

void main(){
  if(resolution.x < 1. || resolution.y < 1.){
    gl_FragColor = vec4(0., 0., 0., 1.);
    return;
  }

  /* 1. Pixelate by snapping to pixel-cell centres */
  float ps = max(pixelSize, 1.);
  vec2 snapped = (floor(gl_FragCoord.xy / ps) + 0.5) * ps;

  /* 2. Aspect-corrected UV, centred */
  vec2 uv = snapped / resolution - 0.5;
  uv.x *= resolution.x / resolution.y;

  /* 3. Accumulate slowly drifting particles */
  float field = 0.;   // overall brightness
  for(int i = 0; i < COUNT; i++){
    float fi = float(i);

    /* pseudo-random home position spread across the panel */
    float hx = hash(fi) - 0.5;
    float hy = hash(fi + 11.3) - 0.5;

    /* gentle looping drift, each particle on its own phase */
    float sp = 0.15 + hash(fi + 3.1) * 0.25;
    vec2 pos = vec2(
      hx * 1.15 + sin(time * sp + fi * 1.7) * 0.06,
      hy * 0.95 + cos(time * sp * 0.8 + fi * 2.3) * 0.06
    );

    /* twinkle — biased bright so particles read strongly */
    float tw = 0.7 + 0.3 * sin(time * 1.5 + fi * 2.4);
    field += tw * smoothstep(particleSize, 0., length(uv - pos));
  }
  field = clamp(field * 1.35, 0., 1.);

  /* 4. Map to colour — single monotonic tint */
  vec3 col = mix(vec3(0.), particleColor, field);

  /* 5. Bayer ordered dither + quantise */
  int bx = int(mod(gl_FragCoord.x / ps, 8.));
  int by = int(mod(gl_FragCoord.y / ps, 8.));
  float thr    = bayerValue(bx, by) - 0.5;
  float levels = max(colorNum - 1., 1.);
  col = clamp(col + thr / levels, 0., 1.);
  col = floor(col * levels + 0.5) / levels;

  gl_FragColor = vec4(col, 1.);
}
`;

/* ─── Inner R3F scene ─────────────────────────────────────────────────────── */

function ParticleField({
  particleColor,
  colorNum,
  pixelSize,
  particleSize,
}) {
  const matRef = useRef(null);
  const { viewport, size, gl } = useThree();

  useEffect(() => {
    if (!matRef.current) return;
    const dpr = gl.getPixelRatio();
    matRef.current.uniforms.resolution.value.set(
      size.width * dpr,
      size.height * dpr,
    );
  }, [size, gl]);

  useFrame(({ clock }) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;

    u.time.value = clock.getElapsedTime();
    u.colorNum.value = colorNum;
    u.pixelSize.value = pixelSize;
    u.particleSize.value = particleSize;

    const dpr = gl.getPixelRatio();
    const rw = size.width * dpr;
    const rh = size.height * dpr;
    if (u.resolution.value.x !== rw || u.resolution.value.y !== rh) {
      u.resolution.value.set(rw, rh);
    }
  });

  const initialUniforms = useRef({
    time:          { value: 0 },
    resolution:    { value: new THREE.Vector2(1, 1) },
    particleColor: { value: new THREE.Color(...particleColor) },
    colorNum:      { value: colorNum },
    pixelSize:     { value: pixelSize },
    particleSize:  { value: particleSize },
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={initialUniforms.current}
      />
    </mesh>
  );
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

export default function AboutField({
  particleColor = [0.95, 0.95, 0.95],
  colorNum      = 2,
  pixelSize     = 3,
  particleSize  = 0.05,
}) {
  return (
    <Canvas
      className="dither-container"
      camera={{ position: [0, 0, 6] }}
      frameloop="always"
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false }}
    >
      <ParticleField
        particleColor={particleColor}
        colorNum={colorNum}
        pixelSize={pixelSize}
        particleSize={particleSize}
      />
    </Canvas>
  );
}

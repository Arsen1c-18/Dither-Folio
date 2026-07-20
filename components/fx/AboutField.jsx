/* eslint-disable react/no-unknown-property */
'use client';

import { useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import { useInViewport } from '@/lib/useInViewport';

import '../Dither.css';

/*
 * Animated topology-grid shader for the About card.
 *
 * Renders:
 *   • A fine dot grid that subtly breathes in brightness
 *   • Concentric iso-contour rings (like a topographic map) that slowly expand
 *   • A radial vignette so the centre glows and edges fade
 *
 * Pure GLSL, no dithering — clean, geometric, premium.
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
uniform vec3  accentColor;
uniform vec3  gridColor;

#define PI 3.141592653589793
#define TAU 6.283185307179586

/* ── helpers ──────────────────────────────────────────────────── */
float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

/* Smooth mod for contour rings */
float smod(float x, float m){ return x - m * floor(x / m); }

void main(){
  if(resolution.x < 1. || resolution.y < 1.){
    gl_FragColor = vec4(0., 0., 0., 1.);
    return;
  }

  /* 1. Aspect-correct UV centred at (0,0) */
  vec2 uv = (gl_FragCoord.xy - resolution * 0.5) / min(resolution.x, resolution.y);

  float t = time * 0.28;

  /* ── 2. Dot grid ───────────────────────────────────────────── */
  float gridScale  = 14.0;
  vec2  gridUV     = uv * gridScale;
  vec2  gridCell   = floor(gridUV);
  vec2  gridLocal  = fract(gridUV) - 0.5;

  /* stagger every other row */
  float stagger = mod(gridCell.y, 2.0) * 0.5;
  gridLocal.x += stagger;
  gridCell.x  -= stagger;

  float dotRadius = 0.08 + 0.035 * sin(t * 1.7 + hash21(gridCell) * TAU);
  float dot = 1.0 - smoothstep(dotRadius - 0.02, dotRadius + 0.02, length(gridLocal));

  /* gentle per-dot pulse */
  float pulse = 0.55 + 0.45 * sin(t * 2.1 + hash21(gridCell + 7.3) * TAU);
  dot *= pulse;

  /* ── 3. Topology contour rings ─────────────────────────────── */
  /* Layered smooth noise field used as elevation */
  float field = 0.0;
  vec2 q = uv * 1.8;
  field += 0.50 * sin(q.x * 2.1 + t * 0.9) * cos(q.y * 1.7 - t * 0.7);
  field += 0.30 * sin(q.x * 3.9 - t * 1.1 + q.y * 2.3);
  field += 0.20 * cos(q.x * 1.2 + q.y * 3.1 + t * 0.6);

  /* Distance from origin adds slow outward-expanding rings */
  float dist  = length(uv);
  float rings = dist - t * 0.18;            /* slow outward drift */
  float ringField = field * 0.35 + rings;

  /* Ring brightness — thin bright bands separated by dark gaps */
  float ringFreq   = 4.5;
  float ringPhase  = smod(ringField * ringFreq, 1.0);
  float ring = smoothstep(0.0, 0.12, ringPhase) * smoothstep(1.0, 0.88, ringPhase);
  ring = pow(ring, 1.4);

  /* ── 4. Compose layers ─────────────────────────────────────── */
  /* dots in grid colour, rings in accent, mixed */
  vec3 col = vec3(0.);
  col += gridColor * dot  * 0.55;
  col += accentColor * ring * 0.45;

  /* slight additive blend where both overlap */
  col += gridColor * dot * ring * 0.25;

  /* ── 5. Radial vignette ────────────────────────────────────── */
  float vig = 1.0 - smoothstep(0.30, 0.90, dist * 1.35);
  col *= vig;

  /* ── 6. Very subtle global breathe ────────────────────────── */
  col *= 0.80 + 0.20 * sin(t * 0.8);

  gl_FragColor = vec4(clamp(col, 0., 1.), 1.);
}
`;

/* ─── R3F scene ───────────────────────────────────────────────────────────── */

function TopologyField({ accentColor, gridColor }) {
  const matRef = useRef(null);
  const { viewport } = useThree();

  useFrame(({ clock, size, gl }) => {
    const mat = matRef.current;
    if (!mat) return;
    const dpr = gl.getPixelRatio();
    mat.uniforms.time.value        = clock.getElapsedTime();
    mat.uniforms.resolution.value.set(size.width * dpr, size.height * dpr);
    mat.uniforms.accentColor.value.set(...accentColor);
    mat.uniforms.gridColor.value.set(...gridColor);
  });

  const uniforms = useRef({
    time:        { value: 0 },
    resolution:  { value: new THREE.Vector2(1, 1) },
    accentColor: { value: new THREE.Color(...accentColor) },
    gridColor:   { value: new THREE.Color(...gridColor) },
  });

  return (
    <mesh scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms.current}
      />
    </mesh>
  );
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

export default function AboutField({
  /* accent-red tint for the rings, muted white for the dot grid */
  accentColor = [1.0, 0.23, 0.23],
  gridColor   = [0.38, 0.38, 0.38],
}) {
  /* Pause rendering while the About panel is off-screen */
  const { ref, inView } = useInViewport();

  return (
    <div ref={ref} className="dither-container">
      <Canvas
        className="dither-container"
        camera={{ position: [0, 0, 1] }}
        frameloop={inView ? 'always' : 'never'}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: false }}
        orthographic
      >
        <TopologyField accentColor={accentColor} gridColor={gridColor} />
      </Canvas>
    </div>
  );
}

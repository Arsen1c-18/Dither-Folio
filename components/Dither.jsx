/* eslint-disable react/no-unknown-property */
'use client';

import { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

import './Dither.css';

/* ─── Shaders ─────────────────────────────────────────────────────────────── */

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
uniform float waveSpeed;
uniform float waveFrequency;
uniform float waveAmplitude;
uniform vec3  waveColor;
uniform vec2  mousePos;
uniform int   enableMouseInteraction;
uniform float mouseRadius;
uniform float colorNum;
uniform float pixelSize;

/* ── Perlin helpers ───────────────────────────────────────────── */
vec4 mod289(vec4 x){return x-floor(x*(1./289.))*289.;}
vec4 permute(vec4 x){return mod289(((x*34.)+1.)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
vec2 fade2(vec2 t){return t*t*t*(t*(t*6.-15.)+10.);}

float cnoise(vec2 P){
  vec4 Pi=floor(P.xyxy)+vec4(0,0,1,1);
  vec4 Pf=fract(P.xyxy)-vec4(0,0,1,1);
  Pi=mod289(Pi);
  vec4 ix=Pi.xzxz, iy=Pi.yyww, fx=Pf.xzxz, fy=Pf.yyww;
  vec4 i=permute(permute(ix)+iy);
  vec4 gx=fract(i*(1./41.))*2.-1.;
  vec4 gy=abs(gx)-.5;
  vec4 tx=floor(gx+.5); gx-=tx;
  vec2 g00=vec2(gx.x,gy.x),g10=vec2(gx.y,gy.y),g01=vec2(gx.z,gy.z),g11=vec2(gx.w,gy.w);
  vec4 norm=taylorInvSqrt(vec4(dot(g00,g00),dot(g01,g01),dot(g10,g10),dot(g11,g11)));
  g00*=norm.x; g01*=norm.y; g10*=norm.z; g11*=norm.w;
  float n00=dot(g00,vec2(fx.x,fy.x)),n10=dot(g10,vec2(fx.y,fy.y));
  float n01=dot(g01,vec2(fx.z,fy.z)),n11=dot(g11,vec2(fx.w,fy.w));
  vec2 f=fade2(Pf.xy);
  return 2.3*mix(mix(n00,n10,f.x),mix(n01,n11,f.x),f.y);
}

float fbm(vec2 p){
  float v=0.,a=1.,fr=waveFrequency;
  for(int i=0;i<4;i++){ v+=a*abs(cnoise(p)); p*=fr; a*=waveAmplitude; }
  return v;
}

float pattern(vec2 p){
  vec2 p2=p-time*waveSpeed;
  return fbm(p+fbm(p2));
}

/* ── Bayer 8×8 ────────────────────────────────────────────────── */
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
  /* Guard: resolution not yet set */
  if(resolution.x < 1. || resolution.y < 1.){
    gl_FragColor = vec4(0.,0.,0.,1.);
    return;
  }

  /* 1. Pixelate by snapping to pixel-cell centres */
  float ps = max(pixelSize, 1.);
  vec2 snapped = (floor(gl_FragCoord.xy / ps) + 0.5) * ps;

  /* 2. NDC UV: [-0.5, 0.5], aspect-corrected */
  vec2 uv = snapped / resolution - 0.5;
  uv.x *= resolution.x / resolution.y;

  /* 3. Wave field */
  float f = pattern(uv);

  /* 4. Mouse ripple */
  if(enableMouseInteraction == 1){
    vec2 mNDC = (mousePos / resolution - 0.5) * vec2(1., -1.);
    mNDC.x *= resolution.x / resolution.y;
    float d = length(uv - mNDC);
    f -= 0.5 * (1. - smoothstep(0., mouseRadius, d));
  }

  /* 5. Map to colour */
  vec3 col = mix(vec3(0.), waveColor, clamp(f, 0., 1.));

  /* 6. Bayer ordered dither */
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

function DitheredWaves({
  waveSpeed,
  waveFrequency,
  waveAmplitude,
  waveColor,
  colorNum,
  pixelSize,
  disableAnimation,
  enableMouseInteraction,
  mouseRadius,
}) {
  const matRef   = useRef(null);
  const mouseRef = useRef(new THREE.Vector2());
  const { viewport, size, gl } = useThree();

  /* Resolution: set on mount and whenever the canvas resizes */
  useEffect(() => {
    if (!matRef.current) return;
    const dpr = gl.getPixelRatio();
    matRef.current.uniforms.resolution.value.set(
      size.width  * dpr,
      size.height * dpr,
    );
  }, [size, gl]);

  const prevColor = useRef([...waveColor]);

  useFrame(({ clock }) => {
    const mat = matRef.current;
    if (!mat) return;
    const u = mat.uniforms;

    if (!disableAnimation) u.time.value = clock.getElapsedTime();

    u.waveSpeed.value              = waveSpeed;
    u.waveFrequency.value          = waveFrequency;
    u.waveAmplitude.value          = waveAmplitude;
    u.colorNum.value               = colorNum;
    u.pixelSize.value              = pixelSize;
    u.enableMouseInteraction.value = enableMouseInteraction ? 1 : 0;
    u.mouseRadius.value            = mouseRadius;

    if (!prevColor.current.every((v, i) => v === waveColor[i])) {
      u.waveColor.value.setRGB(...waveColor);
      prevColor.current = [...waveColor];
    }

    if (enableMouseInteraction) u.mousePos.value.copy(mouseRef.current);

    /* Resolution safety-net */
    const dpr = gl.getPixelRatio();
    const rw  = size.width  * dpr;
    const rh  = size.height * dpr;
    if (u.resolution.value.x !== rw || u.resolution.value.y !== rh) {
      u.resolution.value.set(rw, rh);
    }
  });

  const handlePointerMove = (e) => {
    if (!enableMouseInteraction) return;
    const rect = gl.domElement.getBoundingClientRect();
    const dpr  = gl.getPixelRatio();
    mouseRef.current.set(
      (e.clientX - rect.left) * dpr,
      (e.clientY - rect.top)  * dpr,
    );
  };

  const initialUniforms = useRef({
    time:                   { value: 0 },
    resolution:             { value: new THREE.Vector2(1, 1) },
    waveSpeed:              { value: waveSpeed },
    waveFrequency:          { value: waveFrequency },
    waveAmplitude:          { value: waveAmplitude },
    waveColor:              { value: new THREE.Color(...waveColor) },
    mousePos:               { value: new THREE.Vector2() },
    enableMouseInteraction: { value: enableMouseInteraction ? 1 : 0 },
    mouseRadius:            { value: mouseRadius },
    colorNum:               { value: colorNum },
    pixelSize:              { value: pixelSize },
  });

  return (
    <>
      <mesh scale={[viewport.width, viewport.height, 1]}>
        <planeGeometry args={[1, 1]} />
        <shaderMaterial
          ref={matRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={initialUniforms.current}
        />
      </mesh>

      {/* Invisible hit-plane for pointer events */}
      <mesh
        onPointerMove={handlePointerMove}
        position={[0, 0, 0.01]}
        scale={[viewport.width, viewport.height, 1]}
        visible={false}
      >
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

export default function Dither({
  waveSpeed              = 0.05,
  waveFrequency          = 3,
  waveAmplitude          = 0.3,
  waveColor              = [0.5, 0.5, 0.5],
  colorNum               = 4,
  pixelSize              = 2,
  disableAnimation       = false,
  enableMouseInteraction = true,
  mouseRadius            = 1,
}) {
  return (
    <Canvas
      className="dither-container"
      camera={{ position: [0, 0, 6] }}
      frameloop="always"
      dpr={[1, 2]}
      gl={{ antialias: false, alpha: false }}
    >
      <DitheredWaves
        waveSpeed={waveSpeed}
        waveFrequency={waveFrequency}
        waveAmplitude={waveAmplitude}
        waveColor={waveColor}
        colorNum={colorNum}
        pixelSize={pixelSize}
        disableAnimation={disableAnimation}
        enableMouseInteraction={enableMouseInteraction}
        mouseRadius={mouseRadius}
      />
    </Canvas>
  );
}

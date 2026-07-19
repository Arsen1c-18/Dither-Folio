'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { Activity, Cpu, Keyboard, Smartphone, Star, Wrench, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface TimelineSlide {
  id: string;
  year?: string;
  title: string;
  tagline: string;
  description: string;
  icon: React.ElementType;
  color: string;
  graphic: React.ReactNode;
  image?: string;
}

export interface StorySectionProps {
  slides?: TimelineSlide[];
  headline?: string;
  subtitle?: string;
  scrollInstruction?: string;
}

function WheelCard({
  slide,
  idx,
  scrollProgress,
  angleSpacing,
  radius,
}: {
  slide: TimelineSlide;
  idx: number;
  scrollProgress: any;
  angleSpacing: number;
  radius: number;
}) {
  const Icon = slide.icon;
  const theta = idx * angleSpacing;

  // Calculate relative angle to center (front) of wheel
  const relativeAngle = useTransform(
    scrollProgress,
    (p: number) => theta - p * 5 * angleSpacing
  );

  // Map relative angle to opacity, keeping cards visible in the back distantly
  const opacity = useTransform(
    relativeAngle,
    [-angleSpacing * 5, -angleSpacing * 3, -angleSpacing * 2, -angleSpacing, 0, angleSpacing, angleSpacing * 2, angleSpacing * 3, angleSpacing * 5],
    [0.1, 0.18, 0.35, 0.65, 1, 0.65, 0.35, 0.18, 0.1]
  );

  // Disable pointer events on cards that are not active
  const pointerEvents = useTransform(
    relativeAngle,
    (ang) => Math.abs(ang) < 10 ? "auto" : "none"
  );

  return (
    <motion.div
      style={{
        transform: `rotateY(${theta}deg) translateZ(${radius}px)`,
        opacity,
        pointerEvents,
        position: "absolute",
        transformStyle: "preserve-3d",
      }}
      className="w-[75vw] max-w-2xl h-[46vh] rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-xl p-6 flex gap-6 items-center group overflow-hidden shadow-2xl"
    >
      {/* Glowing color gradient background */}
      <div className={cn("absolute -inset-24 bg-gradient-to-br opacity-[0.03] blur-3xl group-hover:opacity-[0.08] transition-opacity duration-700", slide.color)} />
      
      {/* Background number outline */}
      {slide.year && (
        <div className="absolute right-6 bottom-[-20px] text-[150px] font-black text-white/[0.02] tracking-tighter leading-none select-none font-mono pointer-events-none">
          {slide.year}
        </div>
      )}

      {/* Content (60% width) */}
      <div className="w-[55%] flex flex-col justify-between h-full relative z-10">
        <div>
          {slide.year && (
            <div className="flex items-center gap-2 mb-3">
              <span className="px-3 py-1 text-xs font-black bg-[#FF5C00] text-white rounded-full font-mono">
                {slide.year}
              </span>
              <span className="text-white/40 text-xs font-mono tracking-widest uppercase">Era Step 0{idx}</span>
            </div>
          )}
          <h3 className="text-2xl font-black text-white tracking-tight uppercase group-hover:text-[#FF5C00] transition-colors duration-300">
            {slide.title}
          </h3>
          <h4 className="text-xs font-bold tracking-widest text-[#FF5C00] mt-0.5 font-mono uppercase">
            {slide.tagline}
          </h4>
          <p className="text-white/60 text-[13px] leading-relaxed mt-3">
            {slide.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 mt-auto">
          <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/80 group-hover:bg-[#FF5C00]/10 group-hover:border-[#FF5C00]/20 group-hover:text-[#FF5C00] transition-all duration-300">
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] text-white/30 uppercase tracking-widest font-mono">Precision Diagnostics</span>
        </div>
      </div>

      {/* Graphic Area (45% width, folded back in 3D to curve/bend the card) */}
      <div 
        style={{ 
          transform: "rotateY(-15deg)", 
          transformOrigin: "left center",
          transformStyle: "preserve-3d"
        }}
        className="absolute right-0 top-0 bottom-0 w-[45%] bg-black/40 border-l border-white/5 z-0 flex items-center justify-center p-4 overflow-hidden transform-gpu"
      >
        {slide.image ? (
          <img 
            src={slide.image} 
            alt={slide.title}
            className="w-48 h-48 object-cover rounded-2xl border border-white/10 shadow-2xl relative z-10"
          />
        ) : (
          slide.graphic
        )}
        {/* Soft edge blend overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent pointer-events-none" />
      </div>
    </motion.div>
  );
}

function TimelineConnector({
  idx,
  scrollProgress,
  angleSpacing,
  radius,
}: {
  idx: number;
  scrollProgress: any;
  angleSpacing: number;
  radius: number;
}) {
  const halfAngle = angleSpacing / 2;
  const rad = (halfAngle * Math.PI) / 180;
  const chordWidth = 2 * radius * Math.sin(rad);
  // Place slightly further back than the card face (card face is at translateZ(radius))
  const chordZ = radius * Math.cos(rad) - 40; 
  const theta = (idx + 0.5) * angleSpacing;

  // Active range for this connector: from idx/5 to (idx+1)/5
  const startRange = idx / 5;
  const endRange = (idx + 1) / 5;

  // Calculate drawing progress of the line
  const pathLength = useTransform(
    scrollProgress,
    [startRange, endRange],
    [0, 1]
  );

  // Fade in as it starts drawing, fade out slightly as it passes
  const opacity = useTransform(
    scrollProgress,
    [startRange - 0.05, startRange, endRange, endRange + 0.05],
    [0, 1, 1, 0.35]
  );

  return (
    <motion.div
      style={{
        transform: `rotateY(${theta}deg) translateZ(${chordZ}px)`,
        width: `${chordWidth}px`,
        height: "150px",
        position: "absolute",
        transformStyle: "preserve-3d",
        opacity,
        pointerEvents: "none",
      }}
      className="flex items-center justify-center z-0"
    >
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${chordWidth} 150`}
        fill="none"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={`grad-${idx}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255, 92, 0, 0.2)" />
            <stop offset="50%" stopColor="#FF5C00" />
            <stop offset="100%" stopColor="rgba(255, 92, 0, 0.2)" />
          </linearGradient>
          <marker
            id={`arrow-${idx}`}
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto"
          >
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#FF5C00" />
          </marker>
        </defs>
        
        {/* Background track line (dimmed) */}
        <path
          d={`M 0 75 C ${chordWidth * 0.25} 125, ${chordWidth * 0.75} 25, ${chordWidth} 75`}
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1.5"
          strokeDasharray="4 6"
        />

        {/* Glowing progressive line */}
        <motion.path
          d={`M 0 75 C ${chordWidth * 0.25} 125, ${chordWidth * 0.75} 25, ${chordWidth} 75`}
          stroke={`url(#grad-${idx})`}
          strokeWidth="2.5"
          style={{ pathLength }}
          markerEnd={`url(#arrow-${idx})`}
          className="drop-shadow-[0_0_6px_rgba(255,92,0,0.6)]"
        />
      </svg>
    </motion.div>
  );
}

const defaultSlides: TimelineSlide[] = [
  {
    id: "intro",
    title: "WE GO TO THE DEPTHS",
    tagline: "WHERE OTHERS TURN BACK",
    description: "We are Cell Cure Hub. When standard repair shops label your device 'irreparable', we begin our work. From micro-soldering mainboards to BGA chip reballing, we restore tech with surgical precision.",
    icon: Activity,
    color: "from-[#FF5C00]/20 to-[#FF8C39]/5",
    image: "/story/0.webp",
    graphic: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="absolute w-48 h-48 rounded-full border border-[#FF5C00]/20 animate-[ping_4s_infinite_linear]" />
        <div className="absolute w-36 h-36 rounded-full border border-[#FF5C00]/30 animate-[ping_3s_infinite_linear]" />
        <div className="absolute w-24 h-24 rounded-full border border-[#FF5C00]/40 flex items-center justify-center bg-black">
          <Activity className="w-10 h-10 text-[#FF5C00] animate-pulse" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      </div>
    )
  },
  {
    id: "1999",
    year: "1999",
    title: "The Mechanical Spark",
    tagline: "TYPEWRITERS & CALCULATORS",
    description: "We started with the absolute fundamentals of precision. Hand-wound springs, gear linkages, and analog key assemblies. This era taught us that when dealing with complex hardware, every fraction of a millimeter matters.",
    icon: Keyboard,
    color: "from-zinc-800/30 to-zinc-900/5",
    image: "/story/1999.webp",
    graphic: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <svg className="w-40 h-40 text-zinc-700/40 animate-[spin_20s_infinite_linear]" viewBox="0 0 100 100">
          <path fill="currentColor" d="M50 35c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 25c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z" />
          <path fill="currentColor" d="M92 46.5l-6-1.5c-.3-1-.7-2-1.2-3l3.6-5.1c.6-.8.4-2-.4-2.6l-5.7-5.7c-.7-.7-1.9-.8-2.6-.2l-5.1 3.6c-1-.5-2-.9-3-1.2l-1.5-6C69.8 24 69 23 68 23h-8c-1 0-1.8 1-2 2l-1.5 6c-1 .3-2 .7-3 1.2l-5.1-3.6c-.8-.6-2-.4-2.6.4l-5.7 5.7c-.7.7-.8 1.9-.2 2.6l3.6 5.1c-.5 1-.9 2-1.2 3l-6 1.5c-1 .2-2 1-2 2v8c0 1 1 1.8 2 2l6 1.5c.3 1 .7 2 1.2 3l-3.6 5.1c-.6.8-.4 2 .4 2.6l5.7 5.7c.7.7 1.9.8 2.6.2l5.1-3.6c1 .5 2 .9 3 1.2l1.5 6c.2 1 1 2 2 2h8c1 0-1.8-1 2-2l1.5-6c1-.3 2-.7 3-1.2l5.1 3.6c.8.6 2 .4 2.6-.4l5.7-5.7c.7-.7.8-1.9.2-2.6l-3.6-5.1c.5-1 .9-2 1.2-3l6-1.5c1-.2 2-1 2-2v-8c0-1-1-1.8-2-2zM50 65c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" />
        </svg>
        <svg className="absolute w-24 h-24 text-zinc-600/30 animate-[spin_10s_infinite_reverse]" viewBox="0 0 100 100" style={{ transform: 'translate(45px, 45px)' }}>
          <path fill="currentColor" d="M50 35c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 25c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z" />
          <path fill="currentColor" d="M92 46.5l-6-1.5c-.3-1-.7-2-1.2-3l3.6-5.1c.6-.8.4-2-.4-2.6l-5.7-5.7c-.7-.7-1.9-.8-2.6-.2l-5.1 3.6c-1-.5-2-.9-3-1.2l-1.5-6C69.8 24 69 23 68 23h-8c-1 0-1.8 1-2 2l-1.5 6c-1 .3-2 .7-3 1.2l-5.1-3.6c-.8-.6-2-.4-2.6.4l-5.7 5.7c-.7.7-.8 1.9-.2 2.6l3.6 5.1c-.5 1-.9 2-1.2 3l-6 1.5c-1 .2-2 1-2 2v8c0 1 1 1.8 2 2l6 1.5c.3 1 .7 2 1.2 3l-3.6 5.1c-.6.8-.4 2 .4 2.6l5.7 5.7c.7.7 1.9.8 2.6.2l5.1-3.6c1 .5 2 .9 3 1.2l1.5 6c.2 1 1 2 2 2h8c1 0-1.8-1 2-2l1.5-6c1-.3 2-.7 3-1.2l5.1 3.6c.8.6 2 .4 2.6-.4l5.7-5.7c.7-.7.8-1.9.2-2.6l-3.6-5.1c.5-1 .9-2 1.2-3l6-1.5c1-.2 2-1 2-2v-8c0-1-1-1.8-2-2zM50 65c-8.3 0-15-6.7-15-15s6.7-15 15-15 15 6.7 15 15-6.7 15-15 15z" />
        </svg>
        <div className="absolute text-5xl font-mono text-zinc-800 select-none">1999</div>
      </div>
    )
  },
  {
    id: "2004",
    year: "2004",
    title: "The Cellular Dawn",
    tagline: "BULKY NOKIAS & TRANSCEIVERS",
    description: "The era of cellular networks and micro-circuitry. We adapted to repairing the legendary Nokia 3310, Motorola Razrs, and early transceiver chip boards. Debugging radio signal pathways and replacing monochrome screen backlights became our first foray into electronics.",
    icon: Smartphone,
    color: "from-blue-900/20 to-blue-950/5",
    image: "/story/2004.webp",
    graphic: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="relative w-28 h-48 border-2 border-blue-500/30 rounded-2xl p-2 flex flex-col justify-between bg-black/40">
          <div className="w-full h-16 border border-blue-500/20 rounded bg-blue-500/5 flex items-center justify-center font-mono text-[10px] text-blue-400">
            NOKIA 3310
          </div>
          <div className="w-full flex justify-center gap-1">
            <div className="w-6 h-6 rounded-full border border-blue-500/30" />
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-4 border border-blue-500/20 rounded-sm flex items-center justify-center text-[8px] text-blue-500/50">
                {i === 9 ? '*' : i === 10 ? '0' : i === 11 ? '#' : i + 1}
              </div>
            ))}
          </div>
        </div>
        <div className="absolute w-40 h-40 rounded-full border border-blue-500/10 animate-ping pointer-events-none" />
      </div>
    )
  },
  {
    id: "2012",
    year: "2012",
    title: "The Touch Era",
    tagline: "CAPACITIVE GLASS & LITHIUM CELLS",
    description: "Smartphones redefined everything. Glass screen assemblies, ultra-thin copper flex cables, capacitive digitizers, and highly volatile lithium-ion packs. Precision heat guns, custom display laminators, and flex micro-soldering became standard operating procedure.",
    icon: Wrench,
    color: "from-amber-950/20 to-amber-900/5",
    image: "/story/2012.webp",
    graphic: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="relative w-44 h-44 flex flex-col items-center justify-center">
          <motion.div 
            animate={{ y: [-15, -25, -15] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-16 border border-amber-500/40 bg-amber-500/5 rounded-md flex items-center justify-center text-[10px] text-amber-400 font-mono shadow-[0_4px_12px_rgba(245,158,11,0.15)]"
          >
            Capacitive Glass
          </motion.div>
          <motion.div 
            animate={{ y: [0, -5, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-32 h-16 border border-amber-600/30 bg-amber-600/5 rounded-md mt-2 flex items-center justify-center text-[10px] text-amber-500/70 font-mono"
          >
            Touch Sensor
          </motion.div>
          <motion.div 
            animate={{ y: [15, 10, 15] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="w-32 h-16 border border-amber-700/20 bg-amber-700/5 rounded-md mt-2 flex items-center justify-center text-[10px] text-amber-600/50 font-mono"
          >
            Backlight Display
          </motion.div>
        </div>
      </div>
    )
  },
  {
    id: "2026",
    year: "2026",
    title: "The Hyper-Tech Frontier",
    tagline: "BGA REBALLING & FLEXIBLE OLED",
    description: "The cutting edge. High-density, multi-layered mainboards, foldable OLED displays, under-display sensors, and dual-battery setups. We swap processors, reball BGA chips under stereoscopic microscopes, and reconstruct traces invisible to the naked eye.",
    icon: Cpu,
    color: "from-[#FF5C00]/20 to-black",
    image: "/story/2026.webp",
    graphic: (
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <div className="relative w-44 h-44 border border-[#FF5C00]/30 rounded-xl bg-black flex items-center justify-center p-4">
          <Cpu className="w-16 h-16 text-[#FF5C00] animate-pulse" />
          <div className="absolute top-8 left-8 w-2 h-2 rounded-full bg-[#FF5C00] shadow-[0_0_8px_#FF5C00]" />
          <div className="absolute bottom-8 right-8 w-2 h-2 rounded-full bg-[#FF5C00] shadow-[0_0_8px_#FF5C00]" />
          <div className="absolute top-12 right-10 w-1.5 h-1.5 rounded-full bg-[#FF5C00]/60 shadow-[0_0_6px_#FF5C00]" />
          <div className="absolute bottom-12 left-10 w-1.5 h-1.5 rounded-full bg-[#FF5C00]/60 shadow-[0_0_6px_#FF5C00]" />
          <svg className="absolute inset-0 w-full h-full text-[#FF5C00]/30" viewBox="0 0 100 100">
            <path d="M10 50 H30 L40 40 H60 L70 50 H90" fill="none" stroke="currentColor" strokeWidth="0.8" />
            <path d="M50 10 V30 L60 40 V60 L50 70 V90" fill="none" stroke="currentColor" strokeWidth="0.8" />
          </svg>
        </div>
      </div>
    )
  },
  {
    id: "trust",
    title: "Trusted by Nagpur",
    tagline: "DELIVERING COMPROMISE-FREE CARE",
    description: "Our numbers speak for our dedication. From simple touch screens to folding screen swaps and chip restorations, Cell Cure Hub delivers unmatched warranty, genuine OEM-grade replacement units, and Nagpur's highest diagnostics accuracy.",
    icon: Layers,
    color: "from-zinc-900 to-black",
    graphic: (
      <div className="grid grid-cols-2 gap-4 p-4 w-full h-full items-center">
        <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl text-center backdrop-blur-sm">
          <div className="text-3xl font-black text-[#FF5C00]">10k+</div>
          <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1 font-medium">Devices Cured</div>
        </div>
        <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl text-center backdrop-blur-sm">
          <div className="text-3xl font-black text-white">4.9★</div>
          <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1 font-medium">Google Rating</div>
        </div>
        <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl text-center backdrop-blur-sm">
          <div className="text-3xl font-black text-white">99%</div>
          <div className="text-[10px] uppercase tracking-wider text-white/50 mt-1 font-medium">Diagnostics Rate</div>
        </div>
        <div className="border border-white/5 bg-white/[0.02] p-4 rounded-xl text-center backdrop-blur-sm flex flex-col justify-center items-center">
          <Star className="w-7 h-7 text-[#FF5C00] fill-[#FF5C00] animate-bounce" />
          <div className="text-[10px] uppercase tracking-wider text-[#FF5C00] mt-1 font-bold">Best Service</div>
        </div>
      </div>
    )
  }
];

export function StorySection({
  slides = defaultSlides,
  headline = "HOW IT ALL STARTED",
  subtitle = "Our Legacy & Journey",
  scrollInstruction = "Scroll vertically to traverse the timeline."
}: StorySectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const angleSpacing = 52;
  const radius = 950;

  const wheelRotation = useTransform(
    smoothProgress,
    [0, 1],
    [0, -5 * angleSpacing]
  );

  React.useEffect(() => {
    let isSnapping = false;
    let debounceTimer: any;

    const handleScroll = () => {
      if (isSnapping || !containerRef.current) return;

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const containerHeight = containerRef.current.scrollHeight;
        const windowHeight = window.innerHeight;
        
        const startOffset = window.pageYOffset + rect.top;
        const totalScrollRange = containerHeight - windowHeight;
        const currentScroll = window.pageYOffset - startOffset;

        if (currentScroll >= 0 && currentScroll <= totalScrollRange) {
          const progress = currentScroll / totalScrollRange;
          const closestIndex = Math.round(progress * (slides.length - 1));
          const targetScroll = startOffset + (closestIndex / (slides.length - 1)) * totalScrollRange;

          if (Math.abs(window.pageYOffset - targetScroll) > 15) {
            isSnapping = true;
            window.scrollTo({
              top: targetScroll,
              behavior: "smooth"
            });
            setTimeout(() => {
              isSnapping = false;
            }, 800);
          }
        }
      }, 250);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(debounceTimer);
    };
  }, [slides.length]);

  const headlineWords = headline.split(" ");
  
  const titleContainerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    }
  };

  const wordVariants = {
    hidden: { y: "115%", rotate: 2 },
    visible: {
      y: 0,
      rotate: 0,
      transition: {
        duration: 0.7,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <section 
      ref={containerRef} 
      className="relative bg-black select-none z-20 h-auto md:h-[400vh]"
    >
      {/* Sticky viewport (Desktop) / Normal Flow (Mobile) */}
      <div className="relative md:sticky md:top-0 h-auto md:h-screen w-full overflow-visible md:overflow-hidden flex flex-col justify-start md:justify-center py-16 md:py-0">
        
        {/* Section Headline */}
        <div className="relative md:absolute top-0 md:top-12 lg:top-20 left-0 md:left-1/2 translate-x-0 md:-translate-x-1/2 w-full max-w-2xl text-center z-30 flex flex-col items-center px-4 mb-16 md:mb-0">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-center mb-2"
          >
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#FF5C00]">{subtitle}</span>
          </motion.div>
          
          <motion.h2 
            variants={titleContainerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tighter text-white uppercase flex flex-wrap justify-center gap-x-3"
          >
            {headlineWords.map((word, wordIdx) => (
              <span key={wordIdx} className="inline-block overflow-hidden h-fit py-0.5">
                <motion.span 
                  variants={wordVariants}
                  className="inline-block origin-bottom-left"
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.45 }}
            className="text-sm text-white/40 mt-1"
          >
            {scrollInstruction}
          </motion.p>
        </div>

        {/* Timeline Line removed */}

        {/* Cylindrical Wheel Carousel Container (Desktop) */}
        <div 
          className="hidden md:flex relative w-full h-[55vh] items-center justify-center overflow-visible" 
          style={{ perspective: "2000px", transformStyle: "preserve-3d" }}
        >
          <motion.div
            style={{
              transform: useTransform(wheelRotation, (r) => `translateZ(${-radius}px) rotateY(${r}deg)`),
              transformStyle: "preserve-3d",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            {slides.map((slide, idx) => (
              <WheelCard 
                key={slide.id} 
                slide={slide} 
                idx={idx} 
                scrollProgress={smoothProgress} 
                angleSpacing={angleSpacing}
                radius={radius}
              />
            ))}

            {/* horizontal progress curved arrows connecting cards in 3D */}
            {[...Array(Math.max(0, slides.length - 1))].map((_, idx) => (
              <TimelineConnector
                key={`connector-${idx}`}
                idx={idx}
                scrollProgress={smoothProgress}
                angleSpacing={angleSpacing}
                radius={radius}
              />
            ))}
          </motion.div>
        </div>

        {/* Mobile View: Standard scroll with cards stacked vertically, perfectly placed in standard document flow */}
        <div className="md:hidden w-full max-w-xl mx-auto flex flex-col gap-8 px-4 relative z-20">
          {slides.map((slide, idx) => {
            const Icon = slide.icon;
            return (
              <div 
                key={slide.id}
                className="w-full flex-shrink-0"
              >
                <div className="relative w-full rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent p-6 flex flex-col gap-5 backdrop-blur-xl overflow-hidden shadow-2xl">
                  {/* Glowing background */}
                  <div className={cn("absolute -inset-24 bg-gradient-to-br opacity-[0.03] blur-2xl pointer-events-none", slide.color)} />
                  
                  <div className="flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      {slide.year && (
                        <span className="px-3 py-1 text-xs font-black bg-[#FF5C00] text-white rounded-full font-mono">
                          {slide.year}
                        </span>
                      )}
                      <span className="text-white/40 text-[10px] font-mono tracking-widest uppercase">Era Step 0{idx}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[#FF5C00]">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="z-10">
                    <h3 className="text-xl font-black text-white tracking-tight uppercase">
                      {slide.title}
                    </h3>
                    <h4 className="text-xs font-bold tracking-widest text-[#FF5C00] font-mono uppercase mt-0.5">
                      {slide.tagline}
                    </h4>
                    <p className="text-white/60 text-xs sm:text-sm leading-relaxed mt-3">
                      {slide.description}
                    </p>
                  </div>

                  <div className="h-44 rounded-2xl border border-white/5 bg-black/40 z-10 flex items-center justify-center p-4">
                    {slide.image ? (
                      <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-36 h-36 object-cover rounded-xl border border-white/10 shadow-lg"
                      />
                    ) : (
                      slide.graphic
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

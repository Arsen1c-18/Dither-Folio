import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/sections/Hero";
import { About } from "@/components/sections/About";
import { Experience } from "@/components/sections/Experience";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";
import { Contact } from "@/components/sections/Contact";
import { GlobeStrip } from "@/components/sections/GlobeStrip";
import { LoadingScreen } from "@/components/layout/LoadingScreen";

export default function Home() {
  return (
    <>
      <LoadingScreen />
      <main>
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Contact />
        <GlobeStrip />
      </main>
      <Footer />
    </>
  );
}


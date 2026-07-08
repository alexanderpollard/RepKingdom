import React, { createContext, useState, useContext, useEffect, useRef } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { Home, Dumbbell, ShoppingCart, Swords, Volume2, VolumeX } from "lucide-react";
import * as sound from "@/engine";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components";

// ============================================================================
// 1. COMBINED RESPONSIVE RE-SIZING HOOKS
// ============================================================================

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(undefined);
  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);
  return !!isMobile;
}

export function useSize(ref) {
  const [size, setSize] = useState(null);
  useEffect(() => {
    const element = ref?.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize({ width, height });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return size;
}

// ============================================================================
// 2. ASPECT-LOCKED RESPONSIVE CORE TABS SHELL CONTROLLER
// ============================================================================

import { GameView, ShopView, WorkoutView } from "@/pages";
import { Card } from "@/components";

export default function CoreTabsLayout() {
  const [muted, setMuted] = useState(sound.isMuted());

  useEffect(() => {
    sound.setMuted(muted);
  }, [muted]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (!next) {
      sound.initSound();
      sound.startMusic();
    }
  };

  return (
    <div className="w-screen h-screen bg-stone-950 text-stone-100 relative font-sans flex flex-col overflow-hidden">
      {/* Universal Sticky Command Header Panel */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-3 py-2 bg-stone-900/90 backdrop-blur border-b border-stone-800 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base flex-shrink-0">🛡️</span>
          <span className="font-black text-xs tracking-widest bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent font-mono truncate">
            WORKOUT DEFENSE
          </span>
        </div>
        <button 
          onClick={toggleMute} 
          className="p-2 rounded-xl bg-stone-950 border border-stone-850 text-stone-400 hover:text-white active:scale-90 transition-transform cursor-pointer"
        >
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </header>

      {/* Main Extensible View Switching Tabs Platform */}
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        <Tabs defaultValue="battle" className="w-full flex flex-col h-full overflow-hidden">
          
          {/* Active Structural Injection Content Frame Segments */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            <TabsContent value="training" className="outline-none m-0 h-full">
              <WorkoutView />
            </TabsContent>
            
            <TabsContent value="armory" className="outline-none m-0 h-full">
              <ShopView />
            </TabsContent>
            
            <TabsContent value="battle" className="outline-none m-0 h-full">
              <GameView />
            </TabsContent>
          </div>

          {/* Lower Floating Dashboard Navigation Tab Bar Rail */}
          <TabsList className="sticky bottom-0 w-full bg-stone-900/95 backdrop-blur border-t border-stone-800 h-16 p-2 justify-around items-center rounded-none z-50 flex gap-1 flex-shrink-0">
            <TabsTrigger 
              value="training" 
              className="flex-1 h-full rounded-xl flex flex-col items-center justify-center gap-0.5 text-stone-500 cursor-pointer data-[state=active]:bg-stone-950 data-[state=active]:text-emerald-400 border border-transparent data-[state=active]:border-stone-800"
            >
              <Dumbbell size={16} />
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider">TRAIN</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="battle" 
              className="flex-1 h-full rounded-xl flex flex-col items-center justify-center gap-0.5 text-stone-500 cursor-pointer data-[state=active]:bg-stone-950 data-[state=active]:text-red-400 border border-transparent data-[state=active]:border-stone-800"
            >
              <Swords size={16} />
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider">BATTLE</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="armory" 
              className="flex-1 h-full rounded-xl flex flex-col items-center justify-center gap-0.5 text-stone-500 cursor-pointer data-[state=active]:bg-stone-950 data-[state=active]:text-amber-400 border border-transparent data-[state=active]:border-stone-800"
            >
              <ShoppingCart size={16} />
              <span className="text-[9px] font-mono uppercase font-bold tracking-wider">FORGE</span>
            </TabsTrigger>
          </TabsList>

        </Tabs>
      </main>
    </div>
  );
}

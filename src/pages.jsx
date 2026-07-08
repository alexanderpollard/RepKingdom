import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/state";
import { GameEngine, TOWERS, CANVAS_W, CANVAS_H, WORKOUTS, MISS_PENALTY, UPGRADES, ABILITIES, BUILD_SPOTS } from "@/engine";
import { 
  Button, Input, Label, Card, CardContent, CardHeader, CardTitle, CardDescription, 
  Badge, Progress, Alert, AlertTitle, AlertDescription, Accordion, AccordionItem, 
  AccordionTrigger, AccordionContent, AlertDialog, AlertDialogTrigger, AlertDialogContent, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogCancel, AlertDialogAction, AuthLayout, GoogleIcon
} from "@/components";
import * as sound from "@/engine"; 
import { 
  LogIn, UserPlus, Mail, Lock, Loader2, AlertTriangle, KeyRound, 
  ArrowLeft, Check, Play, RotateCcw, Dumbbell, Sparkles, Shield, Trophy, Trash2, TrendingUp 
} from "lucide-react";

// ============================================================================
// 1. INTEGRATED AUTHENTICATION VIEW HANDLERS (AuthViews)
// ============================================================================

export function AuthViews() {
  const { base44, navigateToLogin, checkUserAuth, checkAppState } = useAuth();
  const [viewMode, setViewMode] = useState("login"); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "", username: "", otp: "" });

  const handleInput = (key, val) => setFormData((prev) => ({ ...prev, [key]: val }));

  const handleAction = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (viewMode === "login") {
        await base44.auth.loginViaEmailPassword(formData.email, formData.password);
        window.location.href = "/";
      } else if (viewMode === "register") {
        if (formData.password !== formData.confirmPassword) throw new Error("Passwords do not match.");
        await base44.auth.register({ email: formData.email, password: formData.password });
        setViewMode("verify");
      } else if (viewMode === "verify") {
        const result = await base44.auth.verifyOtp({ email: formData.email, otpCode: formData.otp });
        if (result?.access_token) base44.auth.setToken(result.access_token);
        window.location.href = "/";
      } else if (viewMode === "forgot") {
        await base44.auth.resetPasswordRequest(formData.email);
        setError("Success: Recovery link sent if email exists.");
      }
    } catch (err) {
      setError(err.message || "Operation failed.");
    } finally {
      setLoading(false);
    }
  };

  const layoutProps = {
    login: { icon: LogIn, title: "Terminal Access", subtitle: "Input credentials to unlock data logs." },
    register: { icon: UserPlus, title: "Enlist Defender", subtitle: "Create an architecture saving signature." },
    verify: { icon: Mail, title: "Verify Sequence", subtitle: `Enter the code transmitted to ${formData.email}` },
    forgot: { icon: KeyRound, title: "Recover Key", subtitle: "Request a reset calibration string link." }
  }[viewMode];

  return (
    <AuthLayout 
      icon={layoutProps.icon} 
      title={layoutProps.title} 
      subtitle={layoutProps.subtitle}
      footer={
        <div className="text-center font-mono text-[11px] space-y-2 mt-4">
          {viewMode === "login" && (
            <>
              <button type="button" onClick={() => setViewMode("register")} className="text-emerald-400 font-bold hover:underline">Create Account Grid</button>
              <br />
              <button type="button" onClick={() => base44.auth.loginWithProvider("google", "/")} className="text-amber-400 font-bold hover:underline flex items-center justify-center gap-1 mx-auto mt-2">
                <GoogleIcon className="w-4 h-4 mr-1"/> Sync via Google Secure Context
              </button>
            </>
          )}
          {viewMode === "register" && <button type="button" onClick={() => setViewMode("login")} className="text-emerald-400 font-bold hover:underline">Return to Access Gateway</button>}
          {viewMode !== "login" && viewMode !== "register" && <button type="button" onClick={() => setViewMode("login")} className="text-stone-500 hover:text-stone-300 flex items-center gap-1 justify-center mx-auto"><ArrowLeft size={12}/> Back to Login</button>}
        </div>
      }
    >
      {error && <div className="mb-3 p-2.5 rounded-lg bg-red-950/20 text-red-400 border border-red-900/30 text-xs font-mono">{error}</div>}
      <form onSubmit={handleAction} className="space-y-4 font-mono text-xs">
        {viewMode === "register" && (
          <div className="space-y-1.5">
            <Label>Callsign Identifier</Label>
            <Input placeholder="Striker_Node_01" value={formData.username} onChange={(e) => handleInput("username", e.target.value)} required />
          </div>
        )}
        {viewMode !== "verify" && (
          <div className="space-y-1.5">
            <Label>Email Channel</Label>
            <Input type="email" placeholder="name@domain.local" value={formData.email} onChange={(e) => handleInput("email", e.target.value)} required />
          </div>
        )}
        {(viewMode === "login" || viewMode === "register") && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label>Encryption Pass</Label>
              {viewMode === "login" && <button type="button" onClick={() => setViewMode("forgot")} className="text-[10px] text-stone-500 hover:text-stone-300">Forgot Code?</button>}
            </div>
            <Input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => handleInput("password", e.target.value)} required />
          </div>
        )}
        {viewMode === "register" && (
          <div className="space-y-1.5">
            <Label>Confirm Pass</Label>
            <Input type="password" placeholder="••••••••" value={formData.confirmPassword} onChange={(e) => handleInput("confirmPassword", e.target.value)} required />
          </div>
        )}
        {viewMode === "verify" && (
          <div className="space-y-1.5">
            <Label>Verification PIN</Label>
            <Input placeholder="000000" maxLength={6} value={formData.otp} onChange={(e) => handleInput("otp", e.target.value)} required className="text-center font-bold text-lg tracking-widest" />
          </div>
        )}
        <Button type="submit" disabled={loading} className="w-full h-11 bg-stone-900 border border-stone-800 text-white hover:bg-stone-850 font-black">
          {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto"/> : "EXECUTE_STREAM_HANDSHAKE"}
        </Button>
      </form>
    </AuthLayout>
  );
}

// ============================================================================
// 2. ACTIVE TACTICAL BATTLE ARENA MODULE (GameView)
// ============================================================================

export function GameView() {
  const { player, updatePlayerState } = useAuth();
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [towerInfo, setTowerInfo] = useState(null);
  const [selectedWeapon, setSelectedWeapon] = useState("slingshot");
  const [stats, setStats] = useState({
    inGameMoney: 50, lives: 20, wave: 0, phase: "ready", score: 0, kills: 0
  });

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext("2d");
    const engine = new GameEngine({ unlockedTowers: player.unlockedTowers, upgrades: player.upgrades });
    engineRef.current = engine;

    const loop = () => {
      engine.update(0.016);
      engine.render(ctx);
      setStats(engine.getStats());
      requestAnimationFrame(loop);
    };
    const raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [player.unlockedTowers, player.upgrades]);

  const handleCanvasClick = (e) => {
    if (!engineRef.current || !canvasRef.current) return;
    sound.initSound();
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * CANVAS_W;
    const y = ((e.clientY - rect.top) / rect.height) * CANVAS_H;
    const spot = engineRef.current.getSpotAt(x, y);
    if (spot >= 0) {
      if (engineRef.current.isSpotOccupied(spot)) {
        setSelectedSpot(spot);
        setTowerInfo(engineRef.current.getTower(spot));
      } else {
        engineRef.current.placeTower(spot, selectedWeapon);
      }
    }
  };

  return (
    <div className="flex flex-col h-full gap-3">
      <canvas 
        ref={canvasRef} 
        width={CANVAS_W} 
        height={CANVAS_H}
        onClick={handleCanvasClick}
        className="w-full bg-stone-950 border border-stone-800 rounded-lg cursor-pointer"
      />
      <div className="grid grid-cols-4 gap-2 text-xs font-mono">
        <div className="bg-stone-900 p-2 rounded">💰 {stats.inGameMoney}</div>
        <div className="bg-stone-900 p-2 rounded">❤️ {stats.lives}</div>
        <div className="bg-stone-900 p-2 rounded">🌊 Wave {stats.wave}</div>
        <div className="bg-stone-900 p-2 rounded">⚔️ {stats.kills}</div>
      </div>
      <button onClick={() => engineRef.current?.startWave()} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded font-bold text-sm">
        {stats.phase === "ready" ? "Start Wave" : "Fighting..."}
      </button>
    </div>
  );
}

// ============================================================================
// 3. PERSISTENT ARMORY STORE MODULE (ShopView)
// ============================================================================

export function ShopView() {
  const { player, updatePlayerState } = useAuth();
  return (
    <div className="p-4 space-y-3 text-xs font-mono max-h-96 overflow-y-auto">
      <div><strong>🛍️ Tower Shop</strong></div>
      {TOWERS.map(t => (
        <div key={t.id} className="bg-stone-900 p-2 rounded border border-stone-700">
          <div className="flex justify-between">
            <span>{t.emoji} {t.name}</span>
            <span className="text-emerald-400">${t.placeCost}</span>
          </div>
          {!player.unlockedTowers.includes(t.id) && t.unlockCost > 0 && (
            <button className="w-full mt-1 bg-amber-600 text-xs p-1 rounded">
              Unlock: ${t.unlockCost}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 4. REAL-WORLD TRAINING CONVERSION MODULE (WorkoutView)
// ============================================================================

export function WorkoutView() {
  const { player, updatePlayerState } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [reps, setReps] = useState("");

  const handleLog = () => {
    if (!selectedWorkout || !reps) return;
    const workout = WORKOUTS.find(w => w.id === selectedWorkout);
    const repCount = parseInt(reps) || 0;
    const coins = repCount * (workout.moneyPer || 1);
    
    const next = JSON.parse(JSON.stringify(player));
    next.coins += coins;
    next.workouts[selectedWorkout] = (next.workouts[selectedWorkout] || 0) + repCount;
    updatePlayerState(next);
    setReps("");
  };

  return (
    <div className="p-4 space-y-3 text-xs font-mono max-h-96 overflow-y-auto">
      <div><strong>💪 Log Workouts</strong></div>
      {WORKOUTS.map(w => (
        <button
          key={w.id}
          onClick={() => setSelectedWorkout(w.id)}
          className={`w-full p-2 rounded border text-left transition-all ${
            selectedWorkout === w.id
              ? "bg-emerald-950 border-emerald-500"
              : "bg-stone-900 border-stone-700 hover:border-stone-600"
          }`}
        >
          <div className="flex justify-between">
            <span>{w.emoji} {w.name}</span>
            <span className="text-emerald-400">${w.moneyPer}/rep</span>
          </div>
        </button>
      ))}
      {selectedWorkout && (
        <div className="space-y-2 border-t border-stone-700 pt-3">
          <input
            type="number"
            placeholder="Reps"
            value={reps}
            onChange={(e) => setReps(e.target.value)}
            className="w-full p-2 bg-stone-950 border border-stone-700 rounded text-white"
            min="0"
          />
          <button
            onClick={handleLog}
            className="w-full p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded font-bold"
          >
            Log Workout
          </button>
        </div>
      )}
    </div>
  );
}

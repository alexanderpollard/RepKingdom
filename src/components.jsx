import * as React from "react"
import { useAuth } from "@/state"
import { X, ShieldAlert, Award } from "lucide-react"

// Utility to combine conditional class names safely
export function cn(...inputs) {
  return inputs.filter(Boolean).join(" ");
}

// ============================================================================
// 1. TYPOGRAPHY LABELS & FORM INPUT PRIMITIVES
// ============================================================================

export const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-xs font-mono font-bold uppercase tracking-wider text-stone-400 select-none", className)}
    {...props}
  />
));
Label.displayName = "Label";

export const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-11 w-full rounded-xl border border-stone-800 bg-stone-950 px-3 py-2 text-sm font-mono text-white placeholder:text-stone-600 outline-none focus:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

// ============================================================================
// 2. INTERACTIVE BUTTON & BADGE GRAPHICS
// ============================================================================

export const Button = React.forwardRef(({ className, disabled, ...props }, ref) => (
  <button
    ref={ref}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-mono font-black tracking-wide border transition-all active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 cursor-pointer",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";

export function Badge({ className, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-lg border border-stone-800 px-2 py-0.5 text-[10px] font-mono font-bold tracking-tight bg-stone-950 text-stone-300",
        className
      )}
      {...props}
    />
  );
}

// ============================================================================
// 3. ELEVATED PANEL MATRIX CARD CONTAINERS
// ============================================================================

export const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-2xl border border-stone-800 bg-stone-900 text-stone-100 shadow-xl overflow-hidden", className)}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3 ref={ref} className={cn("text-sm font-black font-mono tracking-wide text-white uppercase", className)} {...props} />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-xs text-stone-400 font-sans leading-normal", className)} {...props} />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-4 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

// ============================================================================
// 4. RESPONSIVE TELEMETRY PROGRESS BARS
// ============================================================================

export const Progress = React.forwardRef(({ className, value, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("relative h-2 w-full overflow-hidden rounded-full bg-stone-950 border border-stone-850", className)}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </div>
));
Progress.displayName = "Progress";

// ============================================================================
// 5. ACCORDION SUMMARY COL_LAPSE MECHANICS
// ============================================================================

export function Accordion({ children, className }) {
  return <div className={cn("w-full space-y-1", className)}>{children}</div>;
}

export function AccordionItem({ children, value, className }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className={cn("border-b border-stone-850/60 last:border-0", className)}>
      {React.Children.map(children, child => {
        if (child.type === AccordionTrigger) {
          return React.cloneElement(child, { open, onToggle: () => setOpen(!open) });
        }
        if (child.type === AccordionContent) {
          return React.cloneElement(child, { open });
        }
        return child;
      })}
    </div>
  );
}

export function AccordionTrigger({ children, open, onToggle, className }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn("flex w-full items-center justify-between py-4 text-xs font-bold font-mono text-stone-200 uppercase hover:no-underline cursor-pointer", className)}
    >
      {children}
      <span className="text-[10px] text-stone-500 transition-transform duration-200">{open ? "▼" : "▶"}</span>
    </button>
  );
}

export function AccordionContent({ children, open, className }) {
  if (!open) return null;
  return (
    <div className={cn("pb-4 font-mono text-xs text-stone-400 animate-in fade-in duration-150", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// 6. DESTRUCTIVE ACCESS SAFEGUARD MODAL DIALOGS
// ============================================================================

export function AlertDialog({ children }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      {React.Children.map(children, child => {
        if (child.type === AlertDialogTrigger) {
          return React.cloneElement(child, { onClick: () => setOpen(true) });
        }
        if (child.type === AlertDialogContent) {
          if (!open) return null;
          return React.cloneElement(child, { onClose: () => setOpen(false) });
        }
        return child;
      })}
    </>
  );
}

export function AlertDialogTrigger({ children, onClick, asChild }) {
  return React.cloneElement(children, { onClick });
}

export function AlertDialogContent({ children, onClose, className }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className={cn("w-full max-w-xs sm:max-w-sm rounded-2xl border border-stone-800 bg-stone-900 p-5 shadow-2xl text-stone-100 relative font-mono text-xs", className)}>
        {React.Children.map(children, child => {
          if (child.type === AlertDialogCancel || child.type === AlertDialogAction) {
            return React.cloneElement(child, { onClose });
          }
          return child;
        })}
      </div>
    </div>
  );
}

export function AlertDialogHeader({ children }) { return <div className="space-y-2">{children}</div>; }
export function AlertDialogTitle({ className, ...props }) { return <h2 className={cn("text-sm font-black text-red-500 uppercase tracking-wide", className)} {...props} />; }
export function AlertDialogDescription({ className, ...props }) { return <p className={cn("text-stone-400 text-xs leading-normal font-sans", className)} {...props} />; }
export function AlertDialogFooter({ children }) { return <div className="mt-4 flex justify-end gap-2">{children}</div>; }

export function AlertDialogCancel({ children, onClick, onClose, className }) {
  return (
    <button
      type="button"
      onClick={() => { onClick?.(); onClose(); }}
      className={cn("bg-stone-800 border border-stone-700 hover:bg-stone-750 text-stone-300 text-xs font-mono rounded-xl h-10 px-4 cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

export function AlertDialogAction({ children, onClick, onClose, className }) {
  return (
    <button
      type="button"
      onClick={() => { onClick?.(); onClose(); }}
      className={cn("bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold rounded-xl h-10 px-4 cursor-pointer shadow-lg", className)}
    >
      {children}
    </button>
  );
}

// ============================================================================
// 7. CONTEXT-AWARE SYSTEM TOASTER NOTIFICATIONS
// ============================================================================

export const Alert = React.forwardRef(({ className, variant, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(
      "relative w-full rounded-xl border p-3 flex gap-2.5 font-mono text-xs",
      variant === "destructive" ? "bg-red-950/10 border-red-900/30 text-red-400" : "bg-stone-950/40 border-stone-800 text-stone-300",
      className
    )}
    {...props}
  />
));
Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5 ref={ref} className={cn("font-bold tracking-wide uppercase text-[11px]", className)} {...props} />
));
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[10px] leading-normal font-medium text-stone-400 mt-0.5", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

// Global Toast Queue Registry System Broker

// ============================================================================
// 7. CONTEXT-AWARE SYSTEM TOASTER NOTIFICATIONS
// ============================================================================

const activeToastsListeners = [];

export const toast = ({ title, description, variant = "default" }) => {
  const id = Math.random().toString(36).substring(2, 9);
  const payload = { id, title, description, variant };
  activeToastsListeners.forEach(listener => listener(payload));
};

export function Toaster() {
  const [toasts, setToasts] = React.useState([]);
  React.useEffect(() => {
    const handleNewToast = (incoming) => {
      setToasts(prev => [incoming, ...prev].slice(0, 3));
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== incoming.id));
      }, 4000);
    };
    activeToastsListeners.push(handleNewToast);
    return () => {
      const idx = activeToastsListeners.indexOf(handleNewToast);
      if (idx > -1) activeToastsListeners.splice(idx, 1);
    };
  }, []);
  
  return (
    <div className="fixed bottom-0 right-0 p-4 space-y-2 z-50 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={cn("pointer-events-auto w-80 p-4 rounded-xl border shadow-2xl flex justify-between items-center gap-3 animate-in slide-in-from-bottom-5 duration-200 font-mono text-xs", t.variant === "destructive" ? "bg-red-950 border-red-900 text-red-100" : "bg-stone-900 border-stone-800 text-stone-100")}>
          {t.title && <p className={cn("font-black tracking-wide uppercase", t.variant === "destructive" ? "text-red-400" : "text-emerald-400")}>{t.title}</p>}
          {t.description && <p>{t.description}</p>}
          <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))} className="text-stone-500 hover:text-stone-300 transition-colors p-1">✕</button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 8. TABS PLATFORM NAVIGATOR ENGINE
// ============================================================================

const TabsContext = React.createContext(null);

export function Tabs({ children, defaultValue, className }) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }) {
  return <div className={cn("flex border-b border-stone-800", className)}>{children}</div>;
}

export function TabsTrigger({ children, value, className }) {
  const { activeTab, setActiveTab } = React.useContext(TabsContext);
  const isActive = activeTab === value;
  return (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={cn("px-3 py-2 text-sm font-mono font-bold border-b-2 transition-all", isActive ? "border-emerald-500 text-emerald-400" : "border-transparent text-stone-400 hover:text-stone-300", className)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className }) {
  const { activeTab } = React.useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={className}>{children}</div>;
}

// ============================================================================
// 9. AUTHENTICATION LAYOUT CONTAINER
// ============================================================================

export function AuthLayout({ icon: Icon, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-950 p-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-stone-800 bg-stone-900 p-6 shadow-xl">
          <div className="flex flex-col items-center text-center mb-6">
            {Icon && <Icon className="w-10 h-10 text-emerald-500 mb-3" />}
            <h1 className="text-lg font-mono font-black text-white uppercase tracking-wide">{title}</h1>
            <p className="text-xs text-stone-400 mt-1 font-mono">{subtitle}</p>
          </div>
          <div className="space-y-4">
            {children}
          </div>
          {footer && <div>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 10. ICON COMPONENTS
// ============================================================================

export function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

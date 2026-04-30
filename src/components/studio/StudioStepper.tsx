"use client";

import { HiOutlineCheck } from "react-icons/hi2";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Briefing", sub: "Dados básicos" },
  { id: 2, label: "Dados Obrigatórios", sub: "Cosmético ANVISA" },
  { id: 3, label: "Design", sub: "Canvas & IA" },
  { id: 4, label: "Revisão", sub: "Checklist" },
  { id: 5, label: "Exportar", sub: "Arte final" },
];

interface StudioStepperProps {
  currentStep: number;
  onStepChange: (step: number) => void;
}

export default function StudioStepper({ currentStep, onStepChange }: StudioStepperProps) {
  return (
    <div className="h-14 bg-white dark:bg-[#12121a] border-b border-border/40 dark:border-white/8 flex items-center justify-center px-4 shrink-0 z-10">
      <div className="flex items-center">
        {STEPS.map((step, i) => {
          const done = step.id < currentStep;
          const active = step.id === currentStep;
          const clickable = done;

          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => clickable && onStepChange(step.id)}
                disabled={!clickable && !active}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 rounded-xl transition-all select-none",
                  active && "bg-primary/8 dark:bg-primary/10",
                  clickable && "cursor-pointer hover:bg-muted/50 dark:hover:bg-white/5",
                  !clickable && !active && "cursor-default opacity-50"
                )}
              >
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-all",
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "bg-muted/60 dark:bg-white/10 text-muted-foreground"
                )}>
                  {done ? <HiOutlineCheck className="w-3 h-3" /> : step.id}
                </div>
                <div className="hidden sm:block">
                  <p className={cn(
                    "text-[11px] font-semibold whitespace-nowrap leading-tight",
                    active ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {step.label}
                  </p>
                  <p className="text-[9px] text-muted-foreground leading-none mt-0.5">{step.sub}</p>
                </div>
              </button>

              {i < STEPS.length - 1 && (
                <div className={cn(
                  "w-5 sm:w-8 h-px mx-0.5 shrink-0 transition-colors",
                  done ? "bg-emerald-400/60" : "bg-border/50 dark:bg-white/10"
                )} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

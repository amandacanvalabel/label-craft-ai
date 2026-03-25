"use client";

import Link from "next/link";
import {
  HiOutlineArrowLeft,
  HiOutlineCloudArrowUp,
  HiOutlineArrowDownTray,
  HiOutlineEllipsisHorizontal,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { cn } from "@/lib/utils";

interface StudioTopbarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  saved: boolean;
  onSave: () => void;
  onExport: () => void;
}

const StudioTopbar = ({ projectName, onProjectNameChange, saved, onSave, onExport }: StudioTopbarProps) => (
  <div className="h-12 bg-white dark:bg-[#12121a] border-b border-border/40 dark:border-white/8 flex items-center justify-between px-4 shrink-0 z-20">
    {/* Left */}
    <div className="flex items-center gap-3">
      <Link
        href="/dashboard/modelos-salvos"
        className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/60 dark:hover:bg-white/5 hover:text-foreground transition-all"
      >
        <HiOutlineArrowLeft className="w-4 h-4" />
      </Link>
      <div className="h-5 w-px bg-border/40 dark:bg-white/10" />
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md gradient-primary flex items-center justify-center">
          <span className="text-[8px] font-bold text-white">CL</span>
        </div>
        <input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          className="text-sm font-semibold text-foreground bg-transparent border-none outline-none focus:bg-muted/30 dark:focus:bg-white/5 px-2 py-1 rounded-lg -ml-1 max-w-[200px]"
          spellCheck={false}
        />
      </div>
    </div>

    {/* Center status */}
    <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
      {saved ? (
        <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-500">
          <HiOutlineCheckCircle className="w-3.5 h-3.5" />
          Salvo
        </div>
      ) : (
        <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          Não salvo
        </div>
      )}
    </div>

    {/* Right */}
    <div className="flex items-center gap-2">
      <button
        onClick={onSave}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground bg-muted/50 dark:bg-white/5 hover:bg-muted dark:hover:bg-white/10 rounded-lg transition-all"
      >
        <HiOutlineCloudArrowUp className="w-3.5 h-3.5" />
        Salvar
      </button>
      <button
        onClick={onExport}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold text-white bg-primary hover:bg-primary-dark rounded-lg transition-all shadow-sm shadow-primary/20"
      >
        <HiOutlineArrowDownTray className="w-3.5 h-3.5" />
        Exportar
      </button>
    </div>
  </div>
);

export default StudioTopbar;

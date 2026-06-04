"use client";

import { Fragment } from "react";
import { useStudioStore } from "../store/useStudioStore";
import { STEP_GROUPS, groupForStep, stepIdx, stepIdxInGroup } from "../data/steps";

// Porte de renderStepper(): agrupa as 13 etapas em 5 fases.
export default function Stepper() {
  const cur = useStudioStore((s) => s.cur);
  const go = useStudioStore((s) => s.go);
  const curGroup = groupForStep(cur);

  return (
    <div className="stepper" id="stepper">
      {STEP_GROUPS.map((g, giIdx) => {
        const isDone = giIdx < curGroup;
        const isActive = giIdx === curGroup;
        const clickable = isDone || (isActive && stepIdxInGroup(cur) > 0);

        let subText: string = g.sub;
        if (isActive && g.stepIds.length > 1) {
          subText = `${stepIdxInGroup(cur) + 1} de ${g.stepIds.length}`;
        } else if (isActive && g.stepIds.length === 1) {
          subText = "";
        }

        const cls = [
          "stp",
          "stp-group",
          isDone ? "done" : "",
          isActive ? "active" : "",
          isDone || isActive ? "clickable" : "",
        ]
          .filter(Boolean)
          .join(" ");

        return (
          <Fragment key={g.id}>
            {giIdx > 0 && <div className="stp-sep" />}
            <div
              className={cls}
              onClick={clickable ? () => go(stepIdx(g.stepIds[0])) : undefined}
            >
              <span className="num">
                {isDone ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" style={{ width: 11, height: 11 }}>
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  giIdx + 1
                )}
              </span>
              <span className="stp-text">
                <span className="lbl">{g.label}</span>
                {subText && <span className="lbl-sub">{subText}</span>}
              </span>
            </div>
          </Fragment>
        );
      })}
    </div>
  );
}

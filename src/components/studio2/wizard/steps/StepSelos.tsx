"use client";

import { useStudioStore } from "../../store/useStudioStore";
import type { SelosState } from "../../types";
import { MATERIAIS_RECICLAGEM, VALIDADES } from "../../data/wizardData";
import { pickFiles } from "../../hooks/useFilePicker";
import Svg from "../../ui/Svg";

type BoolSelo = "vegano" | "materialReciclavel" | "jogueLixo" | "euReciclo" | "crueltyFree" | "naoTestado";

// Porte de RENDER.selos.
export default function StepSelos() {
  const s = useStudioStore((st) => st.selos);
  const patch = useStudioStore((st) => st.patch);

  const Chip = ({ id, label, sub }: { id: BoolSelo; label: string; sub: string }) => {
    const on = s[id];
    return (
      <button className={`chip ${on ? "sel" : ""}`} onClick={() => patch("selos", { [id]: !s[id] } as Partial<SelosState>)}>
        <span className="cdot">
          {on ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : sub}
        </span>
        {label}
      </button>
    );
  };

  return (
    <div className="screen">
      <div className="eyebrow">Passo 4 · Selos e certificações</div>
      <h1 className="scr">
        Quais <span className="hl">selos</span> aparecem no rótulo?
      </h1>
      <p className="scr-sub">
        Cada selo selecionado vira um ícone vetorial editável no design. Você posiciona livremente na frente ou
        no verso depois.
      </p>

      <div className="section-h">Selos do produto</div>
      <div className="chips">
        <Chip id="vegano" label="Vegano" sub="V" />
        <Chip id="materialReciclavel" label="Material reciclável" sub="♻" />
        <Chip id="jogueLixo" label="Jogue no lixo" sub="L" />
        <Chip id="euReciclo" label="eureciclo" sub="e" />
      </div>

      <div className="section-h">Cruelty Free / Testes em animais</div>
      <div className="chips">
        <Chip id="crueltyFree" label="Cruelty Free" sub="🐰" />
        <Chip id="naoTestado" label="Não testado em animais" sub="🐰" />
      </div>

      <div className="section-h">Tipo de material (código de reciclagem)</div>
      <p className="scr-sub" style={{ marginBottom: 14, fontSize: 12.5 }}>
        Indique o material da sua embalagem — o ícone correspondente entra no rótulo.
      </p>
      <div className="chips">
        {MATERIAIS_RECICLAGEM.map((m) => {
          const on = s.tipoMaterial === m.code;
          const isNumeric = /^[1-7]$/.test(m.code);
          return (
            <button
              key={m.code}
              className={`chip compact ${on ? "sel" : ""}`}
              title={m.desc}
              onClick={() => patch("selos", { tipoMaterial: on ? null : m.code })}
            >
              <span className={`cdot${isNumeric ? "" : " wide"}`}>{m.code}</span>
              {m.name}
            </button>
          );
        })}
      </div>

      <div className="section-h">Validade após abertura</div>
      <p className="scr-sub" style={{ marginBottom: 14, fontSize: 12.5 }}>
        PAO — meses em que o produto fica bom após a abertura da embalagem.
      </p>
      <div className="chips">
        {VALIDADES.map((val) => {
          const on = s.validadeAbertura === val;
          return (
            <button
              key={val}
              className={`chip compact ${on ? "sel" : ""}`}
              onClick={() => patch("selos", { validadeAbertura: on ? null : val })}
            >
              <span className="cdot">⌛</span>
              {val}
            </button>
          );
        })}
      </div>

      <div className="section-h">Outros selos / certificações próprias</div>
      <div className="fld">
        {s.outros.length > 0 && (
          <div className="thumbs">
            {s.outros.map((src, i) => (
              <div key={i} className="thumb" style={{ backgroundImage: `url(${src})` }}>
                <button
                  className="rm"
                  onClick={() => patch("selos", { outros: s.outros.filter((_, j) => j !== i) })}
                >
                  <Svg paths='<path d="M18 6L6 18M6 6l12 12"/>' sw={3} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div
          className="drop"
          style={{ padding: 20, marginTop: s.outros.length ? 12 : 0 }}
          onClick={() => pickFiles((arr) => patch("selos", { outros: [...s.outros, ...arr] }))}
        >
          <div className="dico" style={{ width: 38, height: 38, marginBottom: 8 }}>
            <Svg paths='<path d="M12 5v14M5 12h14"/>' sw={2} />
          </div>
          <b>Anexar seus selos próprios</b>
          <span>PNG ou SVG vetorial — pode anexar vários</span>
        </div>
      </div>

      <div className="note teal" style={{ marginTop: 18 }}>
        <Svg paths='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>' sw={2.2} />
        <p>Todas as escolhas aqui são opcionais. Pode pular esta etapa se preferir adicionar os selos manualmente depois no editor.</p>
      </div>
    </div>
  );
}

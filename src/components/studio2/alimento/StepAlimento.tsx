"use client";

import { useMemo, useState } from "react";
import { useStudioStore } from "../store/useStudioStore";
import type { AlimentoState, IngredienteReceita, NutriV100, VersoState } from "../types";
import Svg from "../ui/Svg";
import {
  ALERGENOS,
  DECLARACOES_OPCOES,
  buscarIngredientes,
  calcReceita,
  defaultAlimento,
  fmt,
  receitaTemGluten,
  somaReceita,
} from "./calc";

// Ocupa o slot "Verso" do wizard quando produto === "alimento".
// Reúne tudo que a ANVISA exige do alimento: identificação, ingredientes
// (por receita ou lista direta), alérgenos, glúten/lactose, conservação,
// fabricante, lote/validade e EAN.

function useAlimento() {
  const a = useStudioStore((s) => s.alimento) || defaultAlimento();
  const set = useStudioStore((s) => s.set);
  const up = (partial: Partial<AlimentoState>) => set({ alimento: { ...a, ...partial } });
  return { a, up };
}

function Campo({ label, children, desc, req }: { label: string; children: React.ReactNode; desc?: string; req?: boolean }) {
  return (
    <div className="fld">
      <label>
        {label}
        {req && <span className="req"> *</span>}
      </label>
      {children}
      {desc && <div className="desc">{desc}</div>}
    </div>
  );
}

function AF({ label, k, placeholder, multi, desc, req }: { label: string; k: keyof AlimentoState; placeholder?: string; multi?: boolean; desc?: string; req?: boolean }) {
  const { a, up } = useAlimento();
  const value = String(a[k] ?? "");
  return (
    <Campo label={label} desc={desc} req={req}>
      {multi ? (
        <textarea className="ipt" placeholder={placeholder} value={value} onChange={(e) => up({ [k]: e.target.value } as Partial<AlimentoState>)} />
      ) : (
        <input className="ipt" placeholder={placeholder} value={value} onChange={(e) => up({ [k]: e.target.value } as Partial<AlimentoState>)} />
      )}
    </Campo>
  );
}

function AN({ label, k, placeholder, desc, req, unit }: { label: string; k: "pesoLiquido" | "porcao" | "rendimento"; placeholder?: string; desc?: string; req?: boolean; unit: string }) {
  const { a, up } = useAlimento();
  const v = a[k];
  return (
    <Campo label={`${label} (${unit})`} desc={desc} req={req}>
      <input className="ipt" inputMode="decimal" placeholder={placeholder} value={v ? String(v) : ""} onChange={(e) => up({ [k]: parseFloat(e.target.value.replace(",", ".")) || 0 } as Partial<AlimentoState>)} />
    </Campo>
  );
}

function VF({ label, k, placeholder, desc }: { label: string; k: keyof VersoState; placeholder?: string; desc?: string }) {
  const value = useStudioStore((s) => s.verso[k] || "");
  const patch = useStudioStore((s) => s.patch);
  return (
    <Campo label={label} desc={desc}>
      <input className="ipt" placeholder={placeholder} value={value} onChange={(e) => patch("verso", { [k]: e.target.value })} />
    </Campo>
  );
}

const NUTRI_FIELDS: { k: keyof NutriV100; label: string; unit: string }[] = [
  { k: "energia", label: "Valor energético", unit: "kcal" },
  { k: "carbo", label: "Carboidratos", unit: "g" },
  { k: "acucarT", label: "Açúcares totais", unit: "g" },
  { k: "acucarA", label: "Açúcares adicionados", unit: "g" },
  { k: "proteina", label: "Proteínas", unit: "g" },
  { k: "gordura", label: "Gorduras totais", unit: "g" },
  { k: "gordSat", label: "Gorduras saturadas", unit: "g" },
  { k: "gordTrans", label: "Gorduras trans", unit: "g" },
  { k: "fibra", label: "Fibras alimentares", unit: "g" },
  { k: "sodio", label: "Sódio", unit: "mg" },
];

function Receita() {
  const { a, up } = useAlimento();
  const [q, setQ] = useState("");
  const [qt, setQt] = useState("");
  const [picked, setPicked] = useState<{ id: string; nome: string } | null>(null);
  const results = useMemo(() => buscarIngredientes(q, 12), [q]);
  const un = a.categoria === "liquido" ? "ml" : "g";
  const soma = somaReceita(a.receita);
  const calc = calcReceita(a.receita, a.rendimento);

  const addItem = () => {
    if (!picked) return;
    const n = parseFloat(qt.replace(",", ".")) || 0;
    if (!(n > 0)) return;
    const next: IngredienteReceita[] = [...a.receita.filter((i) => i.id !== picked.id), { id: picked.id, nome: picked.nome, qt: n }];
    const detectados = calcReceita(next, a.rendimento)?.alergenos || [];
    up({
      receita: next,
      // Alérgenos detectados pela base entram automaticamente (a pessoa pode remover).
      alergenos: Array.from(new Set([...a.alergenos, ...detectados])),
      gluten: a.gluten ?? (receitaTemGluten(next) ? "contem" : null),
    });
    setPicked(null); setQ(""); setQt("");
  };

  return (
    <>
      <div className="fgrid g2">
        <Campo label="Buscar ingrediente na base (TACO/USDA)" desc="Digite e escolha na lista. Mais de 1.100 alimentos.">
          <input className="ipt" placeholder="Ex.: farinha de trigo, açúcar, tomate…" value={picked ? picked.nome : q} onChange={(e) => { setPicked(null); setQ(e.target.value); }} />
          {!picked && results.length > 0 && (
            <div style={{ border: "1px solid var(--line)", borderRadius: 10, marginTop: 6, maxHeight: 220, overflow: "auto", background: "var(--panel)" }}>
              {results.map((r) => (
                <button key={r.id} type="button" onClick={() => { setPicked({ id: r.id, nome: r.nome }); setQ(r.nome); }} style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "left", padding: "8px 12px", fontSize: 12.5, background: "transparent", border: 0, borderBottom: "1px solid var(--line)", color: "inherit", cursor: "pointer" }}>
                  <span>{r.nome}</span>
                  <span style={{ color: "var(--ink-faint)", fontSize: 11 }}>{r.cat} · {r.kcal} kcal</span>
                </button>
              ))}
            </div>
          )}
        </Campo>
        <Campo label={`Quantidade na receita (${un})`}>
          <div style={{ display: "flex", gap: 8 }}>
            <input className="ipt" inputMode="decimal" placeholder="0" value={qt} onChange={(e) => setQt(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addItem()} />
            <button type="button" className="btn btn-primary" disabled={!picked || !(parseFloat(qt.replace(",", ".")) > 0)} onClick={addItem} style={{ whiteSpace: "nowrap" }}>
              Adicionar
            </button>
          </div>
        </Campo>
      </div>

      {a.receita.length > 0 && (
        <div style={{ marginTop: 14, border: "1px solid var(--line)", borderRadius: 12, overflow: "hidden" }}>
          {[...a.receita].sort((x, y) => y.qt - x.qt).map((i) => (
            <div key={i.id} style={{ display: "grid", gridTemplateColumns: "1fr 110px 36px", alignItems: "center", gap: 8, padding: "8px 12px", borderBottom: "1px solid var(--line)", fontSize: 12.5 }}>
              <span>{i.nome}</span>
              <input className="ipt" inputMode="decimal" value={String(i.qt)} onChange={(e) => up({ receita: a.receita.map((x) => (x.id === i.id ? { ...x, qt: parseFloat(e.target.value.replace(",", ".")) || 0 } : x)) })} style={{ padding: "6px 8px" }} />
              <button type="button" onClick={() => up({ receita: a.receita.filter((x) => x.id !== i.id) })} title="Remover" style={{ background: "transparent", border: 0, color: "var(--ink-faint)", cursor: "pointer" }}>
                <Svg paths='<path d="M18 6L6 18M6 6l12 12"/>' sw={2.5} />
              </button>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", fontSize: 12, background: "var(--panel-2)" }}>
            <span>Peso total dos ingredientes</span>
            <b>{fmt(soma, 1)} {un}</b>
          </div>
        </div>
      )}

      <div className="fgrid g2" style={{ marginTop: 14 }}>
        <AN label="Rendimento final da receita" k="rendimento" unit={un} placeholder={soma ? String(Math.round(soma)) : "0"} desc="Quanto a receita rende depois de pronta (perde água no cozimento, por exemplo). Em branco = soma dos ingredientes." />
        <div className="fld">
          <label>Por 100 {un} do produto final</label>
          <div style={{ fontSize: 12, color: "var(--ink-dim)", lineHeight: 1.7, padding: "6px 0" }}>
            {calc ? (
              <>
                <b>{fmt(calc.v100.energia, 0)} kcal</b> · carbo {fmt(calc.v100.carbo)} g · açúc. adic. {fmt(calc.v100.acucarA)} g · prot. {fmt(calc.v100.proteina)} g · gord. sat. {fmt(calc.v100.gordSat)} g · sódio {fmt(calc.v100.sodio, 0)} mg
              </>
            ) : (
              "Adicione ingredientes para calcular."
            )}
          </div>
        </div>
      </div>
      <div className="note teal">
        <Svg paths='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>' sw={2.2} />
        <p>A lista de ingredientes do rótulo sai <b>automaticamente em ordem decrescente de quantidade</b>, como exige a RDC 727/2022. Os alérgenos presentes na base já são marcados abaixo.</p>
      </div>
    </>
  );
}

function Direto() {
  const { a, up } = useAlimento();
  const un = a.categoria === "liquido" ? "ml" : "g";
  return (
    <>
      <AF label="Lista de ingredientes (em ordem decrescente de quantidade)" k="ingredientesTexto" multi placeholder="Ex.: tomate, cebola, azeite de oliva, sal, manjericão, conservador sorbato de potássio (INS 202)" req desc="Aditivos com função e nome ou INS. Ingredientes compostos com seus componentes entre parênteses." />
      <div className="section-h" style={{ marginTop: 18 }}>Valores nutricionais por 100 {un} (laudo ou tabela)</div>
      <div className="fgrid g2">
        {NUTRI_FIELDS.map((f) => (
          <Campo key={f.k} label={`${f.label} (${f.unit})`}>
            <input className="ipt" inputMode="decimal" placeholder="0" value={a.v100Manual[f.k] ? String(a.v100Manual[f.k]) : ""} onChange={(e) => up({ v100Manual: { ...a.v100Manual, [f.k]: parseFloat(e.target.value.replace(",", ".")) || 0 } })} />
          </Campo>
        ))}
      </div>
    </>
  );
}

export default function StepAlimento() {
  const { a, up } = useAlimento();
  const un = a.categoria === "liquido" ? "ml" : "g";
  const toggleList = (k: "alergenos" | "podeConter" | "declaracoes", id: string) =>
    up({ [k]: a[k].includes(id) ? a[k].filter((x) => x !== id) : [...a[k], id] } as Partial<AlimentoState>);

  return (
    <div className="screen">
      <div className="eyebrow">Passo 3 · Dados do alimento</div>
      <h1 className="scr">
        O que a <span className="hl">ANVISA exige</span> no seu alimento
      </h1>
      <p className="scr-sub">
        Identificação, ingredientes, alérgenos e fabricante. Com isso o CanvaLabel monta o verso completo, calcula a
        tabela nutricional e decide se a lupa “ALTO EM” entra na frente. Tudo vira texto editável no rótulo.
      </p>

      <div className="section-h">§ 1 — Identificação</div>
      <div className="fgrid g2">
        <AF label="Denominação de venda" k="designacao" placeholder="Ex.: Molho de tomate com manjericão" req desc="O que o produto é, não só a marca. Vai na face principal." />
        <Campo label="Tipo de produto" req>
          <div className="chips">
            {(["solido", "liquido"] as const).map((t) => (
              <button key={t} type="button" className={`chip ${a.categoria === t ? "sel" : ""}`} onClick={() => up({ categoria: t })}>
                <span className="cdot">{a.categoria === t ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : ""}</span>
                {t === "solido" ? "Sólido / semissólido (g)" : "Líquido (ml)"}
              </button>
            ))}
          </div>
        </Campo>
        <AN label="Peso ou volume líquido" k="pesoLiquido" unit={un} placeholder="350" req />
        <AN label="Porção de referência" k="porcao" unit={un} placeholder="30" req desc="Valor de referência da IN 75/2020 para a categoria (ex.: molhos 30 g, pães 50 g, bebidas 200 ml)." />
        <AF label="Medida caseira da porção" k="medidaCaseira" placeholder="Ex.: 1 colher de sopa" />
      </div>

      <div className="section-h">§ 2 — Ingredientes e tabela nutricional</div>
      <div className="chips" style={{ marginBottom: 14 }}>
        {(["receita", "direto"] as const).map((m) => (
          <button key={m} type="button" className={`chip ${a.modo === m ? "sel" : ""}`} onClick={() => up({ modo: m })}>
            <span className="cdot">{a.modo === m ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : ""}</span>
            {m === "receita" ? "Calcular pela receita (base TACO/USDA)" : "Já tenho os valores por 100 " + un}
          </button>
        ))}
      </div>
      {a.modo === "receita" ? <Receita /> : <Direto />}

      <div className="section-h">§ 3 — Alérgenos, glúten e lactose</div>
      <Campo label="ALÉRGICOS: CONTÉM…" desc="RDC 26/2015. Marque todos os presentes na formulação.">
        <div className="chips">
          {ALERGENOS.map((al) => (
            <button key={al.id} type="button" className={`chip ${a.alergenos.includes(al.id) ? "sel" : ""}`} onClick={() => toggleList("alergenos", al.id)}>
              <span className="cdot">{a.alergenos.includes(al.id) ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : ""}</span>
              {al.label.charAt(0) + al.label.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </Campo>
      <Campo label="ALÉRGICOS: PODE CONTER… (contaminação cruzada)" desc="Só quando o controle de alergênicos da fábrica não garante ausência. Não use “por garantia”.">
        <div className="chips">
          {ALERGENOS.filter((al) => !a.alergenos.includes(al.id)).map((al) => (
            <button key={al.id} type="button" className={`chip ${a.podeConter.includes(al.id) ? "sel" : ""}`} onClick={() => toggleList("podeConter", al.id)}>
              <span className="cdot">{a.podeConter.includes(al.id) ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : ""}</span>
              {al.label.charAt(0) + al.label.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </Campo>
      <div className="fgrid g2">
        <Campo label="Glúten (Lei 10.674/2003)" req>
          <div className="chips">
            {([["contem", "CONTÉM GLÚTEN"], ["nao", "NÃO CONTÉM GLÚTEN"]] as const).map(([v, l]) => (
              <button key={v} type="button" className={`chip ${a.gluten === v ? "sel" : ""}`} onClick={() => up({ gluten: v })}>
                <span className="cdot">{a.gluten === v ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : ""}</span>
                {l}
              </button>
            ))}
          </div>
        </Campo>
        <Campo label="Lactose (RDC 135/2017)" desc="Obrigatório declarar quando houver mais de 100 mg de lactose por 100 g/ml.">
          <div className="chips">
            <button type="button" className={`chip ${a.lactose ? "sel" : ""}`} onClick={() => up({ lactose: !a.lactose })}>
              <span className="cdot">{a.lactose ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : ""}</span>
              CONTÉM LACTOSE
            </button>
          </div>
        </Campo>
      </div>
      <Campo label="Declarações obrigatórias da categoria (quando houver)">
        <div className="chips">
          {DECLARACOES_OPCOES.map((d) => (
            <button key={d} type="button" className={`chip ${a.declaracoes.includes(d) ? "sel" : ""}`} onClick={() => toggleList("declaracoes", d)}>
              <span className="cdot">{a.declaracoes.includes(d) ? <Svg paths='<path d="M20 6L9 17l-5-5"/>' sw={3.4} /> : ""}</span>
              {d.charAt(0) + d.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </Campo>

      <div className="section-h">§ 4 — Conservação e preparo</div>
      <div className="fgrid">
        <AF label="Conservação (antes de abrir)" k="conservacao" placeholder="Ex.: Conservar em local seco e arejado, ao abrigo da luz." />
        <AF label="Conservação após aberto" k="conservacaoAberto" placeholder="Ex.: Após aberto, manter refrigerado e consumir em até 5 dias." />
        <AF label="Modo de preparo (se aplicável)" k="preparo" placeholder="Ex.: Aqueça em fogo baixo por 5 minutos." />
      </div>

      <div className="section-h">§ 5 — Fabricante, rastreabilidade e código de barras</div>
      <div className="fgrid g2">
        <VF label="Razão social do fabricante" k="fabNome" placeholder="Nome da empresa como no CNPJ" />
        <VF label="CNPJ (ou CPF do produtor rural)" k="fabCnpj" placeholder="00.000.000/0001-00" />
        <VF label="Endereço da unidade produtora" k="fabEnd" placeholder="Rua, nº, cidade/UF" />
        <AF label="País de origem" k="pais" placeholder="INDÚSTRIA BRASILEIRA" />
        <AF label="Lote" k="lote" placeholder="Lote: vide embalagem" />
        <AF label="Validade" k="validade" placeholder="Validade: vide embalagem" />
        <AF label="Registro no MS / isenção" k="registroMs" placeholder="Ex.: Dispensado de registro conforme RDC 27/2010" desc="A maioria dos alimentos é dispensada de registro; declare a isenção quando aplicável." />
        <VF label="SAC" k="sac" placeholder="0800 000 0000 · sac@empresa.com" />
        <VF label="Código de barras (EAN-13)" k="codBarras" placeholder="7890000000000" desc="Será gerado um EAN-13 vetorial." />
      </div>
    </div>
  );
}

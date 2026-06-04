"use client";

import { useStudioStore } from "../../store/useStudioStore";
import type { VersoState } from "../../types";
import Svg from "../../ui/Svg";

// Campo de formulário (componente estável, fora do render do passo — evita
// remount/perda de foco ao digitar). Assina o store por campo.
function VF({
  label,
  k,
  placeholder,
  multi,
  desc,
  req,
}: {
  label: string;
  k: keyof VersoState;
  placeholder?: string;
  multi?: boolean;
  desc?: string;
  req?: boolean;
}) {
  const value = useStudioStore((s) => s.verso[k] || "");
  const patch = useStudioStore((s) => s.patch);
  return (
    <div className="fld">
      <label>
        {label}
        {req && <span className="req"> *</span>}
      </label>
      {multi ? (
        <textarea className="ipt" placeholder={placeholder} value={value} onChange={(e) => patch("verso", { [k]: e.target.value })} />
      ) : (
        <input className="ipt" placeholder={placeholder} value={value} onChange={(e) => patch("verso", { [k]: e.target.value })} />
      )}
      {desc && <div className="desc">{desc}</div>}
    </div>
  );
}

// Porte de RENDER.verso.
export default function StepVerso() {
  return (
    <div className="screen">
      <div className="eyebrow">Passo 3 · Verso do rótulo</div>
      <h1 className="scr">
        Informações <span className="hl">obrigatórias</span> do verso
      </h1>
      <p className="scr-sub">
        Os textos exigidos para a aprovação na ANVISA. Cada bloco vira um parágrafo editável no rótulo — pode
        deixar campos em branco e completar depois no editor.
      </p>

      <div className="section-h">§ 1 — Apresentação e uso</div>
      <div className="fgrid g2">
        <VF label="Nome do produto" k="nome" placeholder="Ex.: Shampoo Hidratação Intensa" req />
        <VF label="Introdução" k="introducao" placeholder="Breve descrição do produto" />
      </div>
      <div className="fgrid" style={{ marginTop: 18 }}>
        <VF label="Modo de uso" k="modoUso" placeholder="Como aplicar o produto..." multi />
        <VF label="Dicas" k="dicas" placeholder="Dicas de uso (opcional)" multi />
        <VF label="Precauções" k="precaucoes" placeholder="Advertências e precauções" multi />
      </div>
      <div className="note teal">
        <Svg paths='<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/>' sw={2.2} />
        <p>
          Estes cinco campos se combinam em <b>um único parágrafo</b> no verso, no padrão: &quot;Nome do
          produto. Introdução. <b>MODO DE USO</b>: ... <b>DICAS</b>: ... <b>PRECAUÇÕES</b>: ...&quot;
        </p>
      </div>

      <div className="section-h">§ 2 — Ingredientes</div>
      <div className="fgrid">
        <VF label="Ingredientes em inglês (INCI)" k="ingEn" placeholder="Aqua, Sodium Laureth Sulfate, Cocamidopropyl Betaine..." multi />
        <VF label="Ingredientes em português" k="ingPt" placeholder="Água, Lauril Éter Sulfato de Sódio, Cocoamidopropil Betaína..." multi />
        <VF label="Ou link para gerar QR Code" k="qrLink" placeholder="https://..." desc="Se você informar um link, um QR Code vetorial será gerado no rótulo no lugar da lista escrita." />
      </div>

      <div className="section-h">§ 3 — Fabricação e fornecedor</div>
      <div className="fgrid g2">
        <VF label="Fabricado por (indústria)" k="fabNome" placeholder="Nome da indústria" />
        <VF label="CNPJ da indústria" k="fabCnpj" placeholder="00.000.000/0001-00" />
        <VF label="Inscrição estadual (I.E.)" k="fabIe" placeholder="Se houver" />
        <VF label="Endereço completo" k="fabEnd" placeholder="Rua, nº, cidade/UF" />
        <VF label="Químico responsável (CRQ-V)" k="fabCrq" placeholder="Apenas o número do CRQ" />
        <VF label="Processo ANVISA" k="fabAnvisa" placeholder="XXXXX se ainda não houver" desc="Obrigatório na impressão. Para aprovar na ANVISA, o rótulo vai sem este número." />
        <VF label="Fornecedor exclusivo" k="fornNome" placeholder="Nome do fornecedor" />
        <VF label="CNPJ do fornecedor" k="fornCnpj" placeholder="00.000.000/0001-00" />
        <VF label="Endereço do fornecedor" k="fornEnd" placeholder="Rua, nº, cidade/UF" />
        <VF label="I.E. do fornecedor" k="fornIe" placeholder="Se houver" />
      </div>

      <div className="section-h">Demais informações</div>
      <div className="fgrid g2">
        <VF label="SAC" k="sac" placeholder="0800 000 0000 · sac@empresa.com" />
        <VF label="Código de barras (EAN-13)" k="codBarras" placeholder="7890000000000" desc="Será gerado um EAN-13 vetorial." />
        <VF label="Validade e lote" k="validadeLote" placeholder="Vide embalagem" />
      </div>

      <div className="note warn" style={{ marginTop: 18 }}>
        <Svg paths='<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4M12 17h.01"/>' sw={2.2} />
        <p>
          <b>Atenção ANVISA:</b> o número do processo é obrigatório na impressão, mas no envio para aprovação
          ele vai em branco. O sistema vai gerar duas versões do PDF no final — uma sem o número (para aprovar)
          e outra com (para imprimir).
        </p>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";
import CookiePreferencesButton from "@/components/legal/CookiePreferencesButton";

export const metadata: Metadata = {
  title: "Política de Cookies | CanvaLabel",
  description: "Quais cookies o CanvaLabel usa, para quê, e como gerenciar suas preferências.",
};

export default function CookiesPage() {
  return (
    <LegalPage title="Política de Cookies" subtitle="Cookies são pequenos arquivos salvos no seu navegador. Usamos poucos — e só os de medição dependem da sua autorização.">
      <section>
        <h2>1. Cookies essenciais (sempre ativos)</h2>
        <ul>
          <li><b>token</b> — mantém você conectada(o) à sua conta (7 dias).</li>
          <li><b>g_state</b> — proteção contra fraude durante o login com Google (10 minutos).</li>
          <li><b>cl_cookie_consent</b> — guarda a sua escolha sobre cookies (12 meses).</li>
          <li>Armazenamento local do navegador para rascunhos e preferências da ferramenta (por exemplo, a prévia gerada antes do cadastro).</li>
        </ul>
        <p>Sem esses cookies a plataforma não funciona; por isso não pedem consentimento.</p>
      </section>
      <section>
        <h2>2. Cookies de medição (opcionais)</h2>
        <ul>
          <li><b>Google Analytics</b> (_ga, _ga_*) — estatísticas anônimas de visitas e eventos, usadas para melhorar o site. Só são ativados se você clicar em “Aceitar” no aviso de cookies. O IP é anonimizado.</li>
        </ul>
        <p>Não usamos cookies de publicidade nem vendemos dados de navegação.</p>
      </section>
      <section>
        <h2>3. Como gerenciar</h2>
        <p>Você pode mudar sua escolha a qualquer momento:</p>
        <CookiePreferencesButton />
        <p className="mt-3">Também é possível apagar ou bloquear cookies nas configurações do seu navegador — nesse caso, pode ser preciso entrar de novo na conta.</p>
      </section>
    </LegalPage>
  );
}

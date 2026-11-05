import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Exclusão de dados | CanvaLabel",
  description: "Como pedir a exclusão da sua conta e dos seus dados pessoais no CanvaLabel, inclusive se você entrou com Google ou Facebook.",
  alternates: { canonical: "/exclusao-de-dados" },
};

// Página exigida pelo Facebook ("URL de instruções de exclusão de dados") e
// pelo direito de eliminação da LGPD (art. 18, VI).
export default function ExclusaoDeDadosPage() {
  return (
    <LegalPage
      title="Como excluir sua conta e seus dados"
      subtitle="Você pode pedir a exclusão da sua conta e dos dados pessoais associados a qualquer momento, inclusive se entrou com Google ou Facebook."
    >
      <section>
        <h2>1. Faça o pedido</h2>
        <p>
          Envie um e-mail para <a href="mailto:contato@canvalabel.com.br?subject=Exclus%C3%A3o%20de%20conta">contato@canvalabel.com.br</a>{" "}
          com o assunto <b>“Exclusão de conta”</b>, a partir do mesmo e-mail cadastrado no CanvaLabel (ou o e-mail da sua conta
          Google/Facebook). Se preferir, informe também o nome usado no cadastro.
        </p>
      </section>

      <section>
        <h2>2. O que acontece depois</h2>
        <ul>
          <li>Confirmamos o pedido por e-mail em até 15 dias.</li>
          <li>Excluímos a conta, os rótulos, modelos, imagens enviadas e o vínculo com o login do Google ou do Facebook.</li>
          <li>
            Mantemos apenas o que a lei obriga a guardar — por exemplo, registros de pagamentos e notas fiscais pelo prazo legal
            (em regra, 5 anos) e registros de acesso por 6 meses (Marco Civil da Internet).
          </li>
          <li>Assinaturas pagas e não utilizadas seguem as regras de cancelamento dos <a href="/termos">Termos de Uso</a>.</li>
        </ul>
      </section>

      <section>
        <h2>3. Removendo o acesso do Facebook ou do Google</h2>
        <p>
          Você também pode remover o CanvaLabel das suas contas conectadas: no Facebook, em <b>Configurações → Apps e sites</b>;
          no Google, em <b>Conta Google → Segurança → Apps de terceiros com acesso à conta</b>. Isso impede novos logins, mas não
          apaga os dados já salvos no CanvaLabel — para isso, faça o pedido acima.
        </p>
      </section>

      <section>
        <h2>4. Mais informações</h2>
        <p>
          Veja a <a href="/privacidade">Política de Privacidade</a> para saber quais dados tratamos e todos os seus direitos pela LGPD.
        </p>
      </section>
    </LegalPage>
  );
}

import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Política de Privacidade | CanvaLabel",
  description: "Como o CanvaLabel coleta, usa, armazena e protege seus dados pessoais, em conformidade com a LGPD.",
};

export default function PrivacidadePage() {
  return (
    <LegalPage
      title="Política de Privacidade"
      subtitle="Esta política explica quais dados coletamos, por que e como você pode exercer seus direitos previstos na Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD)."
    >
      <section>
        <h2>1. Quem somos</h2>
        <p>
          O CanvaLabel é uma plataforma on-line para criação de rótulos de alimentos e cosméticos em conformidade com as
          normas da ANVISA. Somos o <b>controlador</b> dos dados pessoais tratados na plataforma. Contato do encarregado
          (DPO): <a href="mailto:contato@canvalabel.com.br">contato@canvalabel.com.br</a>.
        </p>
      </section>

      <section>
        <h2>2. Quais dados coletamos</h2>
        <h3>Dados que você nos informa</h3>
        <ul>
          <li><b>Cadastro:</b> nome, e-mail, senha (armazenada apenas de forma criptografada/hash), telefone.</li>
          <li><b>Cobrança:</b> CPF ou CNPJ — exigido pela instituição de pagamento para emissão de PIX, boleto e cobrança no cartão. Os dados completos do cartão são enviados diretamente ao processador de pagamento (Asaas) e <b>não ficam armazenados</b> em nossos servidores.</li>
          <li><b>Conteúdo:</b> textos, imagens, logotipos e informações de produto (ingredientes, tabela nutricional, dados do fabricante) que você insere para montar seus rótulos.</li>
          <li><b>Suporte:</b> mensagens trocadas com o atendimento.</li>
        </ul>
        <h3>Dados coletados automaticamente</h3>
        <ul>
          <li>Endereço IP, tipo de navegador e dispositivo, páginas visitadas e eventos de uso (por exemplo, clique em “gerar prévia”), por meio de cookies e do Google Analytics — somente com o seu consentimento, conforme a <a href="/cookies">Política de Cookies</a>.</li>
          <li>Registros técnicos (logs) necessários à segurança e ao funcionamento do serviço.</li>
        </ul>
        <h3>Login com Google ou Facebook</h3>
        <p>
          Se você optar por entrar com o Google ou com o Facebook, recebemos do provedor escolhido seu nome, e-mail, foto de
          perfil e um identificador da conta. Não temos acesso à sua senha nem a outros dados, contatos ou publicações. Para
          desconectar ou excluir esses dados, veja <a href="/exclusao-de-dados">Exclusão de dados</a>.
        </p>
      </section>

      <section>
        <h2>3. Para que usamos os dados (finalidades e bases legais)</h2>
        <ul>
          <li><b>Prestar o serviço</b> (criar e manter sua conta, salvar e exportar rótulos, suporte) — execução de contrato.</li>
          <li><b>Cobrança</b> (emissão de pagamentos, notas e histórico) — execução de contrato e cumprimento de obrigação legal/fiscal.</li>
          <li><b>Gerar conteúdo com inteligência artificial</b> a partir do que você descreve — execução de contrato. Os textos enviados aos provedores de IA não incluem seus dados de cobrança.</li>
          <li><b>Comunicações sobre a conta</b> (boas-vindas, confirmação de pagamento, redefinição de senha) — execução de contrato.</li>
          <li><b>Melhorar o produto e medir o uso</b> (analytics) — consentimento, que pode ser retirado a qualquer momento no banner de cookies.</li>
          <li><b>Materiais gratuitos e novidades</b> (por exemplo, checklist ANVISA por e-mail) — consentimento; você pode cancelar em qualquer mensagem.</li>
          <li><b>Segurança, prevenção a fraudes e defesa de direitos</b> — legítimo interesse e cumprimento de obrigação legal.</li>
        </ul>
      </section>

      <section>
        <h2>4. Com quem compartilhamos</h2>
        <p>Compartilhamos dados apenas com operadores necessários ao serviço, sob contrato e com dever de sigilo:</p>
        <ul>
          <li><b>Asaas</b> (processamento de pagamentos — PIX, boleto e cartão);</li>
          <li><b>Vercel</b> (hospedagem e banco de dados) e serviços de armazenamento de arquivos;</li>
          <li><b>Google</b> (Analytics, com consentimento; e login social, se você escolher);</li>
          <li><b>Meta/Facebook</b> (somente login social, se você escolher);</li>
          <li><b>Provedores de inteligência artificial</b> para gerar textos e imagens dos rótulos;</li>
          <li><b>Serviço de envio de e-mails transacionais</b>.</li>
        </ul>
        <p>
          Não vendemos dados pessoais. Podemos divulgar dados quando exigido por lei, ordem judicial ou autoridade competente.
          Alguns operadores ficam fora do Brasil; nesses casos adotamos as salvaguardas previstas na LGPD para transferência internacional.
        </p>
      </section>

      <section>
        <h2>5. Por quanto tempo guardamos</h2>
        <ul>
          <li>Dados da conta e rótulos: enquanto a conta existir. Você pode excluir rótulos a qualquer momento.</li>
          <li>Dados de cobrança e registros fiscais: pelo prazo legal (em regra, 5 anos).</li>
          <li>Contas criadas sem pagamento: mantidas para que você possa concluir a assinatura quando quiser; podem ser excluídas após 12 meses de inatividade, com aviso prévio por e-mail.</li>
          <li>Logs de segurança: até 6 meses, salvo obrigação legal (Marco Civil da Internet).</li>
        </ul>
      </section>

      <section>
        <h2>6. Seus direitos (art. 18 da LGPD)</h2>
        <p>Você pode, a qualquer momento, solicitar: confirmação de tratamento e acesso aos dados; correção; anonimização, bloqueio ou eliminação; portabilidade; informação sobre compartilhamentos; revogação do consentimento; e exclusão da conta.</p>
        <p>Para exercer esses direitos, escreva para <a href="mailto:contato@canvalabel.com.br">contato@canvalabel.com.br</a> (para excluir a conta, veja <a href="/exclusao-de-dados">Exclusão de dados</a>). Respondemos em até 15 dias. Você também pode apresentar reclamação à Autoridade Nacional de Proteção de Dados (ANPD).</p>
      </section>

      <section>
        <h2>7. Segurança</h2>
        <p>Usamos conexão criptografada (HTTPS), senhas protegidas por hash, controle de acesso e monitoramento. Nenhum sistema é 100% seguro; em caso de incidente que possa gerar risco relevante, avisaremos você e a ANPD conforme a lei.</p>
      </section>

      <section>
        <h2>8. Crianças e adolescentes</h2>
        <p>A plataforma é destinada a maiores de 18 anos e a empresas. Não coletamos intencionalmente dados de menores.</p>
      </section>

      <section>
        <h2>9. Alterações</h2>
        <p>Podemos atualizar esta política. Mudanças relevantes serão comunicadas por e-mail ou aviso na plataforma. A data da última atualização aparece no topo da página.</p>
      </section>
    </LegalPage>
  );
}

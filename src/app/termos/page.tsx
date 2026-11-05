import type { Metadata } from "next";
import LegalPage from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Termos de Uso | CanvaLabel",
  description: "Condições para uso da plataforma CanvaLabel: conta, planos, pagamentos, garantia, responsabilidades e cancelamento.",
  alternates: { canonical: "/termos" },
};

export default function TermosPage() {
  return (
    <LegalPage
      title="Termos de Uso"
      subtitle="Ao criar uma conta ou usar o CanvaLabel você concorda com estes termos. Leia com atenção — escrevemos de forma direta, sem juridiquês desnecessário."
    >
      <section>
        <h2>1. O serviço</h2>
        <p>
          O CanvaLabel é uma ferramenta on-line que ajuda a criar rótulos de alimentos e cosméticos com apoio de inteligência
          artificial, modelos prontos, cálculo de tabela nutricional, lupa “ALTO EM” e revisão automática de itens exigidos
          pela ANVISA, gerando arquivos para impressão.
        </p>
        <p>
          <b>Importante:</b> a ferramenta apoia, mas não substitui, a responsabilidade legal do fabricante. As regras da
          ANVISA mudam e dependem do produto; a conferência final do rótulo, dos dados nutricionais informados e do
          registro/notificação do produto é sua. O CanvaLabel não presta consultoria regulatória.
        </p>
      </section>

      <section>
        <h2>2. Conta</h2>
        <ul>
          <li>Você precisa ter 18 anos ou mais e informar dados verdadeiros. Uma conta por CPF/CNPJ.</li>
          <li>Você é responsável por manter a senha em sigilo e por tudo que for feito na sua conta.</li>
          <li>Sua conta e seus rótulos ficam salvos mesmo que o pagamento ainda não tenha sido concluído; até a confirmação valem os limites do modo gratuito e a exportação fica bloqueada.</li>
        </ul>
      </section>

      <section>
        <h2>3. Planos, pagamento e renovação</h2>
        <ul>
          <li>Os valores, limites e recursos de cada plano estão na página de planos e podem ser atualizados; mudanças não afetam o período já pago.</li>
          <li>O pagamento é processado pelo Asaas (PIX, boleto ou cartão). No plano mensal você paga 1 mês; no anual, 12 meses de uma vez com o desconto indicado.</li>
          <li><b>Não há renovação automática.</b> Perto do vencimento avisamos você e, se quiser continuar, basta renovar. Sem renovação, a conta volta ao modo gratuito e seus rótulos permanecem salvos.</li>
          <li>Créditos de IA são mensais e não acumulam; pacotes avulsos de créditos não expiram no ciclo.</li>
        </ul>
      </section>

      <section>
        <h2 id="garantia">4. Garantia de 7 dias e reembolso</h2>
        <p>
          Se você assinou pela primeira vez e não ficou satisfeita(o), peça o reembolso integral em até 7 dias corridos após o
          pagamento (art. 49 do Código de Defesa do Consumidor), pelo e-mail <a href="mailto:contato@canvalabel.com.br">contato@canvalabel.com.br</a>.
          O estorno é feito pelo mesmo meio de pagamento. Após esse prazo, não há reembolso proporcional do período já contratado.
        </p>
      </section>

      <section>
        <h2>5. Uso permitido</h2>
        <ul>
          <li>Use a plataforma apenas para fins lícitos e para seus próprios produtos (ou de clientes que você represente).</li>
          <li>É proibido copiar, revender ou tentar extrair o código, os modelos ou a base de dados da plataforma, ou usar meios automatizados para sobrecarregar o serviço.</li>
          <li>Você garante ter direito de uso sobre logotipos, imagens e textos que enviar.</li>
        </ul>
      </section>

      <section>
        <h2>6. Propriedade intelectual</h2>
        <p>
          Os rótulos que você cria são seus. A plataforma, seus modelos, código, marca e textos são do CanvaLabel. Conteúdo
          gerado por IA pode ser semelhante ao de outros usuários e não garantimos exclusividade ou registro de marca.
        </p>
      </section>

      <section>
        <h2>7. Disponibilidade e limitação de responsabilidade</h2>
        <p>
          Trabalhamos para manter o serviço no ar, mas podem ocorrer manutenções e indisponibilidades. O CanvaLabel não responde
          por lucros cessantes, autuações, recolhimento de produtos ou danos indiretos decorrentes do uso dos rótulos — a
          responsabilidade pela conformidade final é do fabricante. Em qualquer hipótese, nossa responsabilidade se limita ao
          valor pago nos últimos 12 meses.
        </p>
      </section>

      <section>
        <h2>8. Cancelamento e encerramento</h2>
        <p>
          Você pode parar de usar quando quiser e pedir a exclusão da conta pelo e-mail de contato. Podemos suspender contas
          que violem estes termos, com aviso quando possível.
        </p>
      </section>

      <section>
        <h2>9. Privacidade</h2>
        <p>O tratamento de dados pessoais segue a nossa <a href="/privacidade">Política de Privacidade</a> e a <a href="/cookies">Política de Cookies</a>.</p>
      </section>

      <section>
        <h2>10. Lei aplicável</h2>
        <p>Estes termos são regidos pelas leis brasileiras. Fica eleito o foro do domicílio do consumidor para resolver qualquer disputa.</p>
      </section>
    </LegalPage>
  );
}

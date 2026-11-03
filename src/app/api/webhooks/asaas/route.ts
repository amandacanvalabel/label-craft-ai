import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addCredits } from "@/lib/usage";
import { sendPlanConfirmationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { event, payment: asaasPayment } = body;

    if (!event || !asaasPayment?.id) {
      return NextResponse.json({ received: true });
    }

    // Eventos de confirmação de pagamento
    const confirmedEvents = [
      "PAYMENT_CONFIRMED",
      "PAYMENT_RECEIVED",
    ];

    const cancelledEvents = [
      "PAYMENT_OVERDUE",
      "PAYMENT_DELETED",
      "PAYMENT_REFUNDED",
    ];

    if (confirmedEvents.includes(event)) {
      const payment = await prisma.payment.findUnique({
        where: { asaasPaymentId: asaasPayment.id },
        include: { creditPackage: true, plan: { select: { name: true } }, subscriber: { select: { email: true, name: true } } },
      });

      if (payment) {
        const wasPending = payment.status !== "CONFIRMED";
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "CONFIRMED" },
        });

        // Assinatura paga (PIX/boleto compensado): avisa por e-mail uma vez.
        if (wasPending && payment.kind === "SUBSCRIPTION" && payment.plan) {
          sendPlanConfirmationEmail(payment.subscriber.email, payment.subscriber.name, payment.plan.name, payment.amount).catch(() => {});
        }

        // Compra de pacote: credita os créditos avulsos uma única vez.
        if (payment.kind === "CREDIT_PACKAGE" && payment.creditPackage && !payment.creditsApplied) {
          await addCredits(payment.subscriberId, payment.creditPackage.aiCredits, payment.creditPackage.imageCredits);
          await prisma.payment.update({ where: { id: payment.id }, data: { creditsApplied: true } });
        }
      }
    }

    if (cancelledEvents.includes(event)) {
      const payment = await prisma.payment.findUnique({
        where: { asaasPaymentId: asaasPayment.id },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: event === "PAYMENT_REFUNDED" ? "REFUNDED" : "CANCELLED",
          },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[ASAAS WEBHOOK ERROR]", error);
    return NextResponse.json({ received: true });
  }
}

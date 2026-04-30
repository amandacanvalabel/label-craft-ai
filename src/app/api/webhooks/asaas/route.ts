import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "CONFIRMED" },
        });
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

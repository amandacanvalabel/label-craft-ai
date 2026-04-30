import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/auth";
import { getPaymentStatus } from "@/lib/asaas";
import { cookies } from "next/headers";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: { subscriber: true },
    });

    if (!payment) {
      return NextResponse.json(
        { error: "Pagamento não encontrado" },
        { status: 404 }
      );
    }

    // Se já confirmado no DB, retornar direto
    if (payment.status === "CONFIRMED") {
      const token = await signToken({
        id: payment.subscriber.id,
        email: payment.subscriber.email,
        name: payment.subscriber.name,
        role: "SUBSCRIBER",
      });

      const cookieStore = await cookies();
      cookieStore.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });

      return NextResponse.json({
        status: "CONFIRMED",
        authenticated: true,
        redirectTo: "/dashboard",
      });
    }

    // Verificar status no Asaas
    if (payment.asaasPaymentId) {
      const asaasPayment = await getPaymentStatus(payment.asaasPaymentId);

      if (
        asaasPayment.status === "CONFIRMED" ||
        asaasPayment.status === "RECEIVED"
      ) {
        // Atualizar no DB
        await prisma.payment.update({
          where: { id: payment.id },
          data: { status: "CONFIRMED" },
        });

        // Gerar token e logar
        const token = await signToken({
          id: payment.subscriber.id,
          email: payment.subscriber.email,
          name: payment.subscriber.name,
          role: "SUBSCRIBER",
        });

        const cookieStore = await cookies();
        cookieStore.set("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60,
          path: "/",
        });

        return NextResponse.json({
          status: "CONFIRMED",
          authenticated: true,
          redirectTo: "/dashboard",
        });
      }

      return NextResponse.json({
        status: asaasPayment.status,
        authenticated: false,
      });
    }

    return NextResponse.json({
      status: payment.status,
      authenticated: false,
    });
  } catch (error: unknown) {
    console.error("[CHECKOUT STATUS ERROR]", error);
    return NextResponse.json(
      { error: "Erro ao verificar status" },
      { status: 500 }
    );
  }
}

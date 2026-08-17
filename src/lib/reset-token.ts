// Token de recuperação de senha SEM tabela no banco.
// O token é um JWT assinado com uma chave derivada de (JWT_SECRET + hash da
// senha ATUAL do usuário). Consequência: assim que a senha é trocada, o hash
// muda e o token deixa de ser válido — ou seja, é de uso único e expira sozinho.
// Também tem expiração de 1 hora.

import { SignJWT, jwtVerify, decodeJwt } from "jose";

export type ResetKind = "subscriber" | "admin";

const SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";

function keyFor(passwordHash: string): Uint8Array {
  return new TextEncoder().encode(`${SECRET}::pwreset::${passwordHash}`);
}

export async function makeResetToken(opts: {
  id: string;
  kind: ResetKind;
  passwordHash: string;
}): Promise<string> {
  return new SignJWT({ kind: opts.kind })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(opts.id)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(keyFor(opts.passwordHash));
}

/** Lê id/kind do token SEM validar a assinatura (para localizar o usuário). */
export function peekResetToken(token: string): { id: string; kind: ResetKind } | null {
  try {
    const p = decodeJwt(token);
    const kind = p.kind;
    if (!p.sub || (kind !== "subscriber" && kind !== "admin")) return null;
    return { id: p.sub, kind: kind as ResetKind };
  } catch {
    return null;
  }
}

/** Valida a assinatura e a validade do token usando o hash de senha atual. */
export async function verifyResetToken(token: string, passwordHash: string): Promise<boolean> {
  try {
    await jwtVerify(token, keyFor(passwordHash));
    return true;
  } catch {
    return false;
  }
}

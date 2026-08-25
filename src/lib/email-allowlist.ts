import { prisma } from "@/lib/prisma";

/**
 * The roster's email column is the allowlist. An access code or reminder may
 * only ever land on an address that belongs to a seated board member, so the
 * set of permitted recipients is read from the roster rather than kept in a
 * second list that would drift out of step with it — and no real address has to
 * be committed to the repository to express the rule.
 *
 * The gate is fail-closed: an address absent from the column is refused, so an
 * empty roster stops delivery altogether instead of opening it up.
 */

/** The roster stores addresses lowercased; never trust the caller to have done it. */
export function normalizeRecipient(email: string) {
  return email.trim().toLowerCase();
}

export async function isDeliverable(email: string) {
  const address = normalizeRecipient(email);
  if (!address) {
    return false;
  }

  // Compared case-insensitively so a row written by some future path that
  // forgets to lowercase cannot lock a legitimate member out of their own code.
  const match = await prisma.advisoryBoardMember.findFirst({
    where: { email: { equals: address, mode: "insensitive" } },
    select: { id: true },
  });

  return match !== null;
}

/**
 * Throws when `email` is not on the roster. Both callers in `mail.ts` surface a
 * thrown message to the operator, so the text is written to be read.
 */
export async function assertDeliverable(email: string) {
  if (!(await isDeliverable(email))) {
    throw new Error(
      `Delivery is restricted to addresses on the board roster. ${normalizeRecipient(email) || "An empty address"} is not one of them, so nothing was sent.`,
    );
  }
}

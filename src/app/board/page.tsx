import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { getSession } from "@/lib/session";

export default async function BoardPage() {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <main className="board-shell">
      <p className="eyebrow">Authenticated · AI Advisory Board</p>
      <h1>{session.name}</h1>
      <p className="lede">
        You are signed in to the board workspace. Member tools will live here as
        they are built.
      </p>
      <form action={signOut}>
        <button className="text-btn" type="submit">
          Sign out
        </button>
      </form>
    </main>
  );
}

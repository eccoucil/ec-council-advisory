import { redirect } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export default async function AdminPage() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  if (session.role !== "ADMIN") {
    redirect("/board");
  }

  const [members, admins, issuedCodes] = await Promise.all([
    prisma.advisoryBoardMember.findMany({
      where: { role: "MEMBER" },
      select: { id: true, name: true, title: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.advisoryBoardMember.count({ where: { role: "ADMIN" } }),
    prisma.otpChallenge.count({
      where: { createdAt: { gt: hoursAgo(24) } },
    }),
  ]);

  const reachable = members.filter((member) => member.email).length;

  return (
    <main className="admin-shell">
      <header className="admin-head">
        <div>
          <p className="eyebrow">Administration · {session.name}</p>
          <h1>Board console</h1>
        </div>
        <form action={signOut}>
          <button className="text-btn" type="submit">
            Sign out
          </button>
        </form>
      </header>

      <dl className="admin-stats">
        <div>
          <dt>Seated members</dt>
          <dd>{members.length}</dd>
        </div>
        <div>
          <dt>Reachable by email</dt>
          <dd>
            {reachable}
            <span> / {members.length}</span>
          </dd>
        </div>
        <div>
          <dt>Codes issued (24h)</dt>
          <dd>{issuedCodes}</dd>
        </div>
        <div>
          <dt>Administrators</dt>
          <dd>{admins}</dd>
        </div>
      </dl>

      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th scope="col">Member</th>
              <th scope="col">Title</th>
              <th scope="col">Email on file</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id}>
                <td>{member.name}</td>
                <td className="admin-cell-muted">{member.title}</td>
                <td>
                  {member.email ? (
                    member.email
                  ) : (
                    <span className="admin-flag">No email — cannot sign in</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}

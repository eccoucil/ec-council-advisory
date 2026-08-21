import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="gate">
      <section className="gate-brief">
        <p className="eyebrow">EC-Council · Administration</p>
        <h1>
          Advisory Board
          <span>console</span>
        </h1>
        <p>
          Restricted to administrators of the Artificial Intelligence Advisory
          Board. Board members should use the member gate instead, where access
          is issued by one-time code.
        </p>
        <dl>
          <div>
            <dt>Access</dt>
            <dd>Admin</dd>
          </div>
          <div>
            <dt>Clearance</dt>
            <dd>Password</dd>
          </div>
        </dl>
      </section>

      <section className="gate-access">
        <AdminLoginForm />
      </section>
    </main>
  );
}

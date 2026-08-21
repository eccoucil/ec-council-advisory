import { AccessGate, GateStats } from "@/components/access-gate";
import { AdminLoginForm } from "@/components/admin-login-form";

export default function AdminLoginPage() {
  return (
    <AccessGate
      figure="Fig. 00"
      section="Administration"
      kicker="Administrator"
      step="01 / 01"
      title={
        <>
          Advisory Board
          <span>console</span>
        </>
      }
      lede="Restricted to administrators of the Artificial Intelligence Advisory Board. Seated members should use the member gate instead, where access is issued by one-time code."
      stats={
        <GateStats
          items={[
            { label: "Access", value: "Admin" },
            { label: "Clearance", value: "Password" },
          ]}
        />
      }
    >
      <AdminLoginForm />
    </AccessGate>
  );
}

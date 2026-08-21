import { signOut } from "@/app/actions/auth";
import { memberInitials, memberShortName } from "@/lib/member-display";

export function PulseTopbar({ name }: { name: string }) {
  return (
    <header className="pulse-topbar">
      <div className="pulse-brand">
        <span className="pulse-mark">EC-Council</span>
        <span className="pulse-sep" aria-hidden />
        <span className="pulse-product">Board Pulse</span>
      </div>
      <div className="pulse-topbar-right">
        <p className="pulse-window-note">
          Window closes 1 Sep 2026, 23:59 MYT
        </p>
        <div className="pulse-user">
          <span className="pulse-avatar" aria-hidden>
            {memberInitials(name)}
          </span>
          <span className="pulse-user-name">{memberShortName(name)}</span>
        </div>
        <form action={signOut}>
          <button className="pulse-signout" type="submit">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}

"use client";

export default function SignOutButton() {
  return (
    <form action="/api/auth/signout" method="post">
      <button type="submit" className="btn-ghost px-3.5 py-1.5 rounded-lg text-xs border-0 cursor-pointer">
        Déconnexion
      </button>
    </form>
  );
}

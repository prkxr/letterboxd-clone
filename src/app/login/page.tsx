"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="page">
      <div className="shell">
        <section className="panel mx-auto max-w-xl p-8 text-center">
          <p className="kicker">Authentication</p>
          <h1 className="section-title mt-2">Sign in to CineJournal</h1>
          <p className="section-subtitle mx-auto">
            Use OAuth to unlock logging, social feed, notifications, and personalized recommendations.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <button className="button" onClick={() => signIn("google", { callbackUrl: "/app" })}>
              Continue with Google
            </button>
            <button className="button" onClick={() => signIn("github", { callbackUrl: "/app" })}>
              Continue with GitHub
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

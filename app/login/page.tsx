"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password.trim() || loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "same-origin",

        body: JSON.stringify({
          password,
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Incorrect password.");
        } else {
          setError(
            "Unable to sign in. Please try again."
          );
        }

        setPassword("");
        return;
      }

      /*
       * replace() means pressing Back won't simply return the user
       * to the login form after authentication.
       */
      router.replace("/");
      router.refresh();
    } catch {
      setError(
        "Unable to connect. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="
        min-h-dvh
        flex
        items-center
        justify-center
        bg-[#FFF6EC]
        dark:bg-slate-900
        px-4
      "
    >
      <div
        className="
          w-full
          max-w-sm
          rounded-2xl
          border
          border-[#EED9C4]
          dark:border-slate-700
          bg-[#FAE9D2]
          dark:bg-slate-800
          p-6
          shadow-xl
        "
      >
        <div className="mb-6 text-center">
          <h1
            className="
              text-3xl
              font-bold
              text-[#8B5E3C]
              dark:text-[#D7A978]
            "
          >
            Medi Milo
          </h1>

          <p
            className="
              mt-2
              text-sm
              text-slate-600
              dark:text-slate-300
            "
          >
            Enter the access password to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="password"
              className="
                mb-1.5
                block
                text-sm
                font-medium
                text-slate-700
                dark:text-slate-200
              "
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              maxLength={512}
              value={password}
              disabled={loading}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              className="
                w-full
                rounded-lg
                border
                border-[#EED9C4]
                bg-[#F9EFDF]
                px-3
                py-2.5
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-[#C98A5B]
                focus:ring-2
                focus:ring-[#C98A5B]/20
                disabled:cursor-not-allowed
                disabled:opacity-60
                dark:border-slate-600
                dark:bg-slate-700
                dark:text-white
              "
            />
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="
                rounded-lg
                border
                border-red-200
                bg-red-50
                px-3
                py-2
                text-sm
                text-red-700
                dark:border-red-900/50
                dark:bg-red-950/30
                dark:text-red-300
              "
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="
              w-full
              cursor-pointer
              rounded-lg
              bg-[#C98A5B]
              px-4
              py-2.5
              font-semibold
              text-white
              transition
              hover:bg-[#B97D51]
              focus:outline-none
              focus:ring-2
              focus:ring-[#C98A5B]/40
              disabled:cursor-not-allowed
              disabled:opacity-60
              dark:bg-[#E6B980]
              dark:text-slate-900
              dark:hover:bg-[#D7A978]
            "
          >
            {loading
              ? "Checking..."
              : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
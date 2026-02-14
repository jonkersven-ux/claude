"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login, register, getAuth, seedIfEmpty } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    seedIfEmpty();
    if (getAuth()) {
      router.replace("/dashboard");
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        if (password.length < 6) {
          setError("Password must be at least 6 characters");
          setLoading(false);
          return;
        }
        register({ companyName, email, password, firstName, lastName });
      } else {
        const result = login(email, password);
        if (!result) {
          setError("Invalid email or password");
          setLoading(false);
          return;
        }
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="flex flex-1 flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-sm">
          <Link href="/" className="mb-8 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600">
              <span className="text-sm font-bold text-white">H</span>
            </div>
            <span className="text-xl font-bold text-surface-900">
              Host<span className="text-brand-600">IQ</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-surface-900">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-surface-500">
            {isRegister
              ? "Start your 14-day free trial. No credit card required."
              : "Sign in to your HostIQ account."}
          </p>

          {!isRegister && (
            <div className="mt-4 rounded-lg bg-brand-50 p-3">
              <p className="text-xs font-medium text-brand-700">Demo account</p>
              <p className="text-xs text-brand-600">
                Email: admin@hostiq.io &nbsp;|&nbsp; Password: admin123
              </p>
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">First name</label>
                    <input
                      className="input"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Last name</label>
                    <input
                      className="input"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="label">Company name</label>
                  <input
                    className="input"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                className="input"
                placeholder={isRegister ? "Min. 6 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? "Please wait..." : isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              {isRegister ? "Sign in" : "Start free trial"}
            </button>
          </p>
        </div>
      </div>

      {/* Right panel — branding */}
      <div className="hidden flex-1 items-center justify-center bg-brand-600 lg:flex">
        <div className="max-w-md text-center">
          <p className="text-4xl font-bold text-white leading-tight">
            &ldquo;HostIQ turned our skybox from a cost center into our best
            sales channel.&rdquo;
          </p>
          <div className="mt-8">
            <p className="font-medium text-brand-100">Jan de Vries</p>
            <p className="text-sm text-brand-200">Commercial Director, TechVentures BV</p>
          </div>
        </div>
      </div>
    </div>
  );
}

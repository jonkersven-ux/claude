"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companyName, setCompanyName] = useState("");

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

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              // Auth logic handled by API client
              window.location.href = "/dashboard";
            }}
          >
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
                placeholder={isRegister ? "Min. 8 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-primary w-full">
              {isRegister ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-surface-500">
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <button
              onClick={() => setIsRegister(!isRegister)}
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

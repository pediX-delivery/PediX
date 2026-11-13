"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function RecoverPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`
      });
      if (resetError) throw resetError;
      setMessage("Se esse e-mail estiver cadastrado, você receberá um link para redefinir a senha.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível enviar o link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/"><span className="brand-mark">P</span><span>PediX</span></Link>
        <div className="auth-kicker">RECUPERAÇÃO DE ACESSO</div>
        <h1>Redefinir senha.</h1>
        <p className="auth-description">Informe seu e-mail. Se houver uma conta associada, enviaremos um link seguro.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@restaurante.com" />
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Enviando..." : "Enviar link de recuperação"}</button>
        </form>
        <Link className="auth-back" href="/login">← Voltar ao login</Link>
      </section>
    </main>
  );
}

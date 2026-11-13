"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SetNewPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Senha atualizada. Você já pode entrar com a nova senha.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível atualizar a senha. Solicite um novo link.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/"><span className="brand-mark">P</span><span>PediX</span></Link>
        <div className="auth-kicker">SEGURANÇA DA CONTA</div>
        <h1>Nova senha.</h1>
        <p className="auth-description">Escolha uma senha com pelo menos 8 caracteres.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="password">Nova senha</label>
          <input id="password" type="password" minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} />
          <label htmlFor="confirm">Confirme a nova senha</label>
          <input id="confirm" type="password" minLength={8} required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Salvando..." : "Atualizar senha"}</button>
        </form>
        <Link className="auth-back" href="/login">← Ir para o login</Link>
      </section>
    </main>
  );
}

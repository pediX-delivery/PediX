"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        window.location.assign("/painel");
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=/painel`
          }
        });
        if (authError) throw authError;
        if (data.session) {
          window.location.assign("/painel");
        } else {
          setMessage("Cadastro recebido. Confira seu e-mail para confirmar a conta antes de entrar.");
        }
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Não foi possível concluir a operação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card">
        <Link className="brand auth-brand" href="/">
          <span className="brand-mark">P</span><span>PediX</span>
        </Link>
        <div className="auth-kicker">ÁREA ADMINISTRATIVA</div>
        <h1>{mode === "login" ? "Bem-vindo de volta." : "Crie sua conta."}</h1>
        <p className="auth-description">
          {mode === "login" ? "Entre para gerenciar a operação do seu restaurante." : "Cadastre seu acesso para começar a configurar sua operação."}
        </p>

        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); setMessage(""); }}>Entrar</button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); setMessage(""); }}>Criar conta</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="voce@restaurante.com" />
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Mínimo de 8 caracteres" />
          {mode === "login" && <div className="auth-forgot"><Link href="/recuperar-senha">Esqueci minha senha</Link></div>}
          {error && <p className="auth-error" role="alert">{error}</p>}
          {message && <p className="auth-success" role="status">{message}</p>}
          <button className="auth-submit" type="submit" disabled={loading}>{loading ? "Aguarde..." : mode === "login" ? "Entrar no PediX" : "Criar minha conta"}</button>
        </form>
        <Link className="auth-back" href="/">← Voltar para o site</Link>
      </section>
    </main>
  );
}

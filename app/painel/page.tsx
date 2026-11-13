import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";
    const client = await createClient();
    await client.auth.signOut();
    redirect("/login");
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-topbar">
        <Link className="brand" href="/"><span className="brand-mark">P</span><span>PediX</span></Link>
        <form action={signOut}><button className="dashboard-logout" type="submit">Sair</button></form>
      </header>
      <section className="dashboard-content">
        <div className="auth-kicker">PAINEL ADMINISTRATIVO</div>
        <h1>Bem-vindo ao PediX.</h1>
        <p className="auth-description">Sua sessão está autenticada e protegida pelo Supabase.</p>
        <div className="dashboard-info">
          <span className="dashboard-info-label">Conta conectada</span>
          <strong>{user.email}</strong>
          <span className="dashboard-info-note">Próxima etapa: vincular esta conta a um restaurante e aplicar as permissões por função.</span>
        </div>
        <p className="dashboard-warning">Este é o primeiro painel técnico. As ferramentas operacionais e o vínculo com restaurantes ainda serão implementados.</p>
      </section>
    </main>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  ["/painel", "⌂", "Visão geral"],
  ["/painel/dados", "▣", "Dados da loja"],
  ["/painel/categorias", "▤", "Categorias"],
  ["/painel/produtos", "◇", "Produtos"],
] as const;

export default function PainelLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return <main className="dashboard-shell">
    <header className="dashboard-topbar"><Link className="brand" href="/"><span className="brand-mark">P</span><span>PediX</span></Link><form action="/auth/logout" method="post"><button className="dashboard-logout" type="submit">Sair</button></form></header>
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar"><div className="sidebar-label">MENU PRINCIPAL</div><nav className="sidebar-nav" aria-label="Navegação do painel">
        {items.map(([href, icon, label]) => <Link key={href} href={href} className={`sidebar-link ${pathname === href ? "active" : ""}`}><span>{icon}</span>{label}</Link>)}
      </nav><div className="sidebar-help"><strong>Precisa de ajuda?</strong><span>Organize sua loja, cardápio e produtos por aqui.</span></div></aside>
      <section className="dashboard-content">{children}</section>
    </div>
  </main>;
}

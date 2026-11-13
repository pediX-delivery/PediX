import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type RestaurantMembership = {
  restaurant_id: string;
  role: "owner" | "admin" | "manager" | "operator";
  restaurants: {
    name: string;
    slug: string;
    status: "draft" | "active" | "suspended" | "closed";
  } | null;
};

const statusLabels: Record<RestaurantMembership["restaurants"] extends infer R ? NonNullable<R>["status"] : never, string> = {
  draft: "Em configuração",
  active: "Ativo",
  suspended: "Suspenso",
  closed: "Fechado",
};

const roleLabels: Record<RestaurantMembership["role"], string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gerente",
  operator: "Operador",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect("/login");
  }

  const { data: memberships } = await supabase
    .from("restaurant_members")
    .select("restaurant_id, role, restaurants(name, slug, status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  const restaurants = (memberships ?? []) as unknown as RestaurantMembership[];

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
          <span className="dashboard-info-note">Acesso individual e permissões vinculadas à sua conta.</span>
        </div>

        <div className="dashboard-section-heading">
          <div>
            <div className="auth-kicker">SEU NEGÓCIO</div>
            <h2>Restaurantes</h2>
          </div>
          <span className="dashboard-count">{restaurants.length} {restaurants.length === 1 ? "unidade" : "unidades"}</span>
        </div>

        {restaurants.length > 0 ? (
          <div className="restaurant-list">
            {restaurants.map((membership) => {
              const restaurant = membership.restaurants;
              if (!restaurant) return null;
              return (
                <article className="restaurant-card" key={membership.restaurant_id}>
                  <div className="restaurant-card-top">
                    <span className="restaurant-avatar">S</span>
                    <span className="restaurant-status">{statusLabels[restaurant.status]}</span>
                  </div>
                  <h3>{restaurant.name}</h3>
                  <p className="restaurant-slug">pedix.app/loja/{restaurant.slug}</p>
                  <div className="restaurant-card-footer">
                    <span>{roleLabels[membership.role]}</span>
                    <span>Moeda: BRL</span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-info">
            <strong>Nenhum restaurante vinculado</strong>
            <span className="dashboard-info-note">Quando um restaurante for associado à sua conta, ele aparecerá aqui.</span>
          </div>
        )}
        <p className="dashboard-warning">O restaurante em configuração ainda não está publicado e não pode receber pedidos. Vamos concluir os dados da loja antes de ativá-la.</p>
      </section>
    </main>
  );
}

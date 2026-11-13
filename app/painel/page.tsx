import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateRestaurant } from "./actions";

type BusinessHoursDay = { open?: string; close?: string; closed?: boolean };
type BusinessHours = Record<string, BusinessHoursDay>;

type RestaurantMembership = {
  restaurant_id: string;
  role: "owner" | "admin" | "manager" | "operator";
  restaurants: {
    name: string;
    slug: string;
    status: "draft" | "active" | "suspended" | "closed";
    description: string | null;
    address_street: string | null;
    address_number: string | null;
    neighborhood: string | null;
    postal_code: string | null;
    phone: string | null;
    whatsapp: string | null;
    business_hours: BusinessHours | null;
  } | null;
};

type RestaurantStatus = "draft" | "active" | "suspended" | "closed";

const statusLabels: Record<RestaurantStatus, string> = {
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

const days = [
  ["monday", "Segunda-feira"],
  ["tuesday", "Terça-feira"],
  ["wednesday", "Quarta-feira"],
  ["thursday", "Quinta-feira"],
  ["friday", "Sexta-feira"],
  ["saturday", "Sábado"],
  ["sunday", "Domingo"],
] as const;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  const { data: memberships } = await supabase
    .from("restaurant_members")
    .select("restaurant_id, role, restaurants(name, slug, status, description, address_street, address_number, neighborhood, postal_code, phone, whatsapp, business_hours)")
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
        <p className="auth-description">Gerencie as informações comerciais da sua loja em um só lugar.</p>

        <div className="dashboard-info">
          <span className="dashboard-info-label">Conta conectada</span>
          <strong>{user.email}</strong>
          <span className="dashboard-info-note">Acesso individual e permissões vinculadas à sua conta.</span>
        </div>

        {params.saved === "1" && <p className="form-notice success" role="status">Informações da loja salvas com sucesso.</p>}
        {params.error === "permission" && <p className="form-notice error" role="alert">Sua conta não tem permissão para editar esta loja.</p>}
        {params.error === "validation" && <p className="form-notice error" role="alert">Informe o nome da loja para continuar.</p>}
        {params.error === "hours" && <p className="form-notice error" role="alert">Confira os horários informados. Use o formato HH:MM.</p>}
        {params.error === "save" && <p className="form-notice error" role="alert">Não foi possível salvar. Verifique suas permissões e tente novamente.</p>}

        <div className="dashboard-section-heading">
          <div><div className="auth-kicker">SEU NEGÓCIO</div><h2>Restaurantes</h2></div>
          <span className="dashboard-count">{restaurants.length} {restaurants.length === 1 ? "unidade" : "unidades"}</span>
        </div>

        {restaurants.length > 0 ? (
          <div className="restaurant-list">
            {restaurants.map((membership) => {
              const restaurant = membership.restaurants;
              if (!restaurant) return null;
              const canEdit = ["owner", "admin", "manager"].includes(membership.role);
              const hours = restaurant.business_hours ?? {};
              return (
                <article className="restaurant-editor" key={membership.restaurant_id}>
                  <div className="restaurant-editor-heading">
                    <div>
                      <span className="restaurant-status">{statusLabels[restaurant.status]}</span>
                      <h3>{restaurant.name}</h3>
                      <p className="restaurant-slug">pedix.app/loja/{restaurant.slug}</p>
                    </div>
                    <span className="role-pill">{roleLabels[membership.role]}</span>
                  </div>

                  <form action={updateRestaurant} className="business-form">
                    <input type="hidden" name="restaurant_id" value={membership.restaurant_id} />
                    <div className="business-section-title">Dados da loja</div>
                    <div className="business-field">
                      <label htmlFor={`name-${membership.restaurant_id}`}>Nome da loja</label>
                      <input id={`name-${membership.restaurant_id}`} name="name" defaultValue={restaurant.name} maxLength={120} required disabled={!canEdit} />
                    </div>
                    <div className="business-field">
                      <label htmlFor={`description-${membership.restaurant_id}`}>Descrição</label>
                      <textarea id={`description-${membership.restaurant_id}`} name="description" defaultValue={restaurant.description ?? ""} maxLength={600} rows={3} disabled={!canEdit} />
                      <small>Até 600 caracteres. Você pode ajustar o texto provisório.</small>
                    </div>

                    <div className="business-section-title">Contato e endereço</div>
                    <div className="business-fields-grid">
                      <div className="business-field"><label htmlFor={`phone-${membership.restaurant_id}`}>Telefone</label><input id={`phone-${membership.restaurant_id}`} name="phone" defaultValue={restaurant.phone ?? ""} maxLength={30} disabled={!canEdit} /></div>
                      <div className="business-field"><label htmlFor={`whatsapp-${membership.restaurant_id}`}>WhatsApp</label><input id={`whatsapp-${membership.restaurant_id}`} name="whatsapp" defaultValue={restaurant.whatsapp ?? ""} maxLength={30} disabled={!canEdit} /></div>
                      <div className="business-field"><label htmlFor={`street-${membership.restaurant_id}`}>Rua / Avenida</label><input id={`street-${membership.restaurant_id}`} name="address_street" defaultValue={restaurant.address_street ?? ""} maxLength={160} disabled={!canEdit} /></div>
                      <div className="business-field"><label htmlFor={`number-${membership.restaurant_id}`}>Número</label><input id={`number-${membership.restaurant_id}`} name="address_number" defaultValue={restaurant.address_number ?? ""} maxLength={30} disabled={!canEdit} /></div>
                      <div className="business-field"><label htmlFor={`neighborhood-${membership.restaurant_id}`}>Bairro</label><input id={`neighborhood-${membership.restaurant_id}`} name="neighborhood" defaultValue={restaurant.neighborhood ?? ""} maxLength={100} disabled={!canEdit} /></div>
                      <div className="business-field"><label htmlFor={`postal-${membership.restaurant_id}`}>CEP</label><input id={`postal-${membership.restaurant_id}`} name="postal_code" defaultValue={restaurant.postal_code ?? ""} maxLength={20} disabled={!canEdit} /></div>
                    </div>

                    <div className="business-section-title">Horário de funcionamento</div>
                    <div className="hours-list">
                      {days.map(([key, label]) => {
                        const day = hours[key] ?? {};
                        return (
                          <div className="hours-row" key={key}>
                            <strong>{label}</strong>
                            <label className="hours-time">Abre<input type="time" name={`${key}_open`} defaultValue={day.open ?? "14:00"} disabled={!canEdit || day.closed === true} /></label>
                            <label className="hours-time">Fecha<input type="time" name={`${key}_close`} defaultValue={day.close ?? "22:00"} disabled={!canEdit || day.closed === true} /></label>
                            <label className="hours-closed"><input type="checkbox" name={`${key}_closed`} defaultChecked={day.closed === true} disabled={!canEdit} /> Fechado</label>
                          </div>
                        );
                      })}
                    </div>
                    {canEdit ? <button className="business-save" type="submit">Salvar informações</button> : <p className="dashboard-info-note">Seu perfil pode consultar os dados, mas não editá-los.</p>}
                  </form>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="dashboard-info"><strong>Nenhum restaurante vinculado</strong><span className="dashboard-info-note">Quando um restaurante for associado à sua conta, ele aparecerá aqui.</span></div>
        )}
        <p className="dashboard-warning">O restaurante em configuração ainda não está publicado e não pode receber pedidos. Os horários atuais são provisórios; confirme-os antes de ativar a loja.</p>
      </section>
    </main>
  );
}

const features = [
  {
    icon: "↗",
    title: "Delivery e pedidos",
    description: "Sua loja digital, pedidos centralizados e acompanhamento de cada etapa da operação."
  },
  {
    icon: "▤",
    title: "PDV e cozinha",
    description: "Atendimento no balcão e fluxo de preparo organizados em uma experiência integrada."
  },
  {
    icon: "✳",
    title: "Gestão inteligente",
    description: "Indicadores, relacionamento com clientes e ferramentas para decisões melhores."
  }
];

export default function Home() {
  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="PediX início">
          <span className="brand-mark">P</span>
          <span>PediX</span>
        </a>
        <span className="top-note">Tecnologia para operações de alimentação</span>
      </header>

      <section className="hero">
        <div>
          <div className="eyebrow"><span className="dot" /> Plataforma em construção</div>
          <h1>Seu restaurante. <span>Sua operação.</span> Mais controle.</h1>
          <p className="lead">
            O PediX reúne delivery, pedidos, atendimento e gestão em uma única plataforma.
            Menos tarefas espalhadas. Mais clareza para fazer seu negócio crescer.
          </p>
          <div className="actions">
            <a className="primary" href="#recursos">Conheça a plataforma <span aria-hidden="true"> ↗</span></a>
            <a className="secondary" href="mailto:contato@pedix.app">Fale com a equipe</a>
          </div>
        </div>

        <div className="preview-wrap" aria-label="Prévia ilustrativa do painel PediX">
          <div className="glow" />
          <div className="preview">
            <div className="preview-head">
              <span className="preview-title">Visão geral da operação</span>
              <span className="live">● VISÃO DEMONSTRATIVA</span>
            </div>
            <div className="metric-grid">
              <div className="metric">
                <div className="metric-label">Pedidos hoje</div>
                <div className="metric-value">128</div>
                <div className="metric-change">Prévia ilustrativa</div>
              </div>
              <div className="metric">
                <div className="metric-label">Faturamento</div>
                <div className="metric-value">R$ 4,8k</div>
                <div className="metric-change">Dados fictícios</div>
              </div>
            </div>
            <div className="orders">
              <div className="orders-head"><span>Fluxo de pedidos</span><span style={{color:"#91a49a"}}>Exemplo</span></div>
              <div className="order-row"><span className="order-name">#1048 · Pedido recebido</span><span className="order-status">Novo</span></div>
              <div className="order-row"><span className="order-name">#1047 · Em preparação</span><span className="order-status">Cozinha</span></div>
              <div className="order-row"><span className="order-name">#1046 · Saiu para entrega</span><span className="order-status">Entrega</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="recursos">
        <div className="section-label">Uma plataforma. Toda a operação.</div>
        <div className="features">
          {features.map((feature) => (
            <article className="feature" key={feature.title}>
              <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">© {new Date().getFullYear()} PediX. Plataforma em desenvolvimento.</footer>
    </main>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PediX — Gestão inteligente para restaurantes",
  description:
    "Delivery, pedidos, operação e relacionamento com clientes em uma única plataforma."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

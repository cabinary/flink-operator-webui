import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flink Operator WebUI",
  description: "A Web UI for managing Apache Flink deployments on Kubernetes",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

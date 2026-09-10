import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
export const metadata = {
  title: "Beads World Africa — Bracelets with a story.",
  description: "Natural stone bracelets made to mean something.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

import "./globals.css";
import Header from "../components/Header";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import { ModalProvider } from "../context/ModalContext";
import { Analytics } from "@vercel/analytics/next";

export const metadata = {
  title: "Unbound",
  description: "",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">
        <SessionProviderWrapper>
          <ModalProvider>
            <Header />
            {children}
          </ModalProvider>
        </SessionProviderWrapper>
        <Analytics />
      </body>
    </html>
  );
}

import "./globals.css";
import Header from "../components/Header";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import { ModalProvider } from "../context/ModalContext";

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
      </body>
    </html>
  );
}

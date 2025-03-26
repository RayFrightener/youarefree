import "./globals.css";
import Header from "../components/Header";
import SessionProviderWrapper from "../components/SessionProviderWrapper";

export const metadata = {
  title: "Unbound",
  description: "Generated by create next app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased overflow-hidden">
        <SessionProviderWrapper>
        <Header />
        {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}



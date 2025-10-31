
import { Geist, Geist_Mono } from "next/font/google";
import "..//globals.css";
import Layout from "@/components/Layout";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Childern Salon Admin Panel",
  description: "Next.js Admin Panel with Authentication",
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Layout>
          <AuthProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </AuthProvider>
        </Layout>
      </body>
    </html>
  );
}


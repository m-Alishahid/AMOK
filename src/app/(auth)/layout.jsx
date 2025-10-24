import { AuthProvider } from "@/context/AuthContext";

export const metadata = {
  title: "Childern Salon Login",
  description: "Next.js Admin Panel with Authentication",
};

// This layout will override the root layout for /login
export default function LoginLayout({
  children,
}) {
  return (
    // No Layout component here, direct children
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
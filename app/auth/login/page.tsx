import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="container mx-auto p-4 w-full max-w-md my-20 flex items-center justify-center">
      <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}

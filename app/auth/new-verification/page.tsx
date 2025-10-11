import { Suspense } from "react";
import { NewVerifictionForm } from "@/components/auth/new-verification-form";
import { Loader2 } from "lucide-react";

export default function NewVerificationPage() {
  return (
    <main className="container mx-auto p-4 w-full max-w-md my-20">

    <Suspense fallback={<Loader2 className="h-5 w-5 animate-spin" />}>
      <NewVerifictionForm />
    </Suspense>
    </main>
  );
}

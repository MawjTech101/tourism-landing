import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { Compass } from "lucide-react";

export default async function AdminLoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Branding Side */}
      <div className="relative hidden w-1/2 items-center justify-center overflow-hidden bg-gradient-to-br from-[#51487E] via-[#6B5A9E] to-[#AB4E83] lg:flex">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 start-20 h-64 w-64 rounded-full bg-white/20 blur-[80px]" />
          <div className="absolute bottom-20 end-20 h-48 w-48 rounded-full bg-[#C49B66]/30 blur-[60px]" />
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

        <div className="relative z-10 max-w-md px-12 text-center text-white">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm">
            <Compass className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">SafarCMS</h1>
          <div className="mx-auto mt-5 flex items-center justify-center gap-3">
            <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#C49B66]" />
            <span className="h-1.5 w-1.5 rotate-45 bg-[#C49B66]" />
            <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#C49B66]" />
          </div>
          <p className="mt-5 text-base leading-relaxed text-white/70">
            Manage your travel agency with elegance. Create trips, publish deals, and connect with travelers.
          </p>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex w-full items-center justify-center bg-background px-6 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-10 text-center lg:hidden">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#51487E] to-[#AB4E83]">
              <Compass className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SafarCMS</h1>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}

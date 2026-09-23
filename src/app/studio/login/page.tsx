import type { Metadata } from "next";
import { Logo } from "@/components/site/Logo";
import { LoginForm } from "@/components/studio/LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  // Only ever redirect back inside the Studio.
  const safeNext = next?.startsWith("/studio") ? next : "/studio";

  return (
    <div className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex justify-center">
          <Logo className="h-12" showTagline />
        </div>

        <div className="card card-sheen mt-10 p-7">
          <h1 className="font-display text-xl font-bold text-cream-50">Blog Studio</h1>
          <p className="mt-1.5 text-sm text-cream-400">
            Sign in to write, edit and publish articles.
          </p>

          <div className="mt-7">
            <LoginForm next={safeNext} />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-cream-500">
          Authorised users only. All activity is logged.
        </p>
      </div>
    </div>
  );
}

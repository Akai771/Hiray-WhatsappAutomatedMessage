import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Eye, EyeSlash } from "@phosphor-icons/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/store/auth-store";
import { ApiClientError } from "@/services";

export function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Enter email and password.");
      return;
    }

    setSubmitting(true);
    try {
      await login(email.trim(), password);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Login failed. Check your connection.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30">
      <Card className="w-full max-w-95">
        <CardHeader>
          <div className="mb-1 flex size-9 items-center justify-center rounded-sm bg-primary text-sm font-extrabold text-primary-foreground">
            HC
          </div>
          <CardTitle className="text-[17px] font-extrabold">Hiray College Notification System</CardTitle>
          <CardDescription>Sign in with your Faculty or Super Admin account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            <div>
              <Label className="mb-1 text-xs font-semibold text-muted-foreground">Email</Label>
              <Input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@college.edu"
                className="h-9.5 text-[13px] rounded-sm"
              />
            </div>
            <div>
              <Label className="mb-1 text-xs font-semibold text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-9.5 pr-9 text-[13px] rounded-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" disabled={submitting} className="mt-1.5 h-9.5 rounded-lg text-[13px] font-bold">
              {submitting ? "Signing in…" : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

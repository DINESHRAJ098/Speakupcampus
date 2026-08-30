import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Suspense, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, UserX } from "lucide-react";

interface AuthProps {
  redirectAfterAuth?: string;
}

function resolveRedirectAfterAuth(returnTo: string | null, fallback = "/dashboard") {
  if (returnTo?.startsWith("/") && !returnTo.startsWith("//")) return returnTo;
  return fallback;
}

function Auth({ redirectAfterAuth }: AuthProps = {}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = resolveRedirectAfterAuth(searchParams.get("returnTo"), redirectAfterAuth);
  const signIn = useMutation(api.authActions.signIn);


  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const result = await signIn({ email: email.toLowerCase().trim(), password });
      if (result.success) {
        // Store user info in localStorage for the auth hook
        localStorage.setItem("speakup_user", JSON.stringify({
          _id: result.userId,
          name: result.name,
          email: result.email,
          role: result.role,
        }));
        toast.success("Welcome back!", { description: `Signed in as ${result.name || result.email}` });
        navigate(redirect);
      }
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setIsLoading(false);
    }
  };

  // Check if already signed in
  useEffect(() => {
    const stored = localStorage.getItem("speakup_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user._id) navigate(redirect);
      } catch {}
    }
  }, [navigate, redirect]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">S</div>
          </div>
          <CardTitle className="text-xl">Welcome Back</CardTitle>
          <CardDescription>Sign in to your SpeakUp Campus account</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="john@college.edu" className="pl-9" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} disabled={isLoading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-9 pr-9" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} disabled={isLoading} />
                <button type="button" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button type="button" onClick={() => navigate("/register")} className="text-primary hover:underline font-medium">
                Create one
              </button>
            </p>
          </CardFooter>
        </form>

        <div className="py-3 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
          SpeakUp Campus — Campus Grievance Management
        </div>
      </Card>
    </div>
  );
}

export default function AuthPage(props: AuthProps) {
  return (
    <Suspense>
      <Auth {...props} />
    </Suspense>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Loader2, Mail, KeyRound } from "lucide-react";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const forgotPassword = useMutation(api.authActions.forgotPassword);

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError("Email is required"); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Invalid email address"); return; }

    setIsLoading(true);
    setError("");
    try {
      const result = await forgotPassword({ email: email.toLowerCase().trim() });
      if (result.otp) {
        localStorage.setItem(`speakup_reset_otp_${email.toLowerCase().trim()}`, result.otp);
      }
      toast.success("OTP sent!", { description: `A 6-digit code has been sent to ${email}` });
      navigate(`/reset-password?email=${encodeURIComponent(email.toLowerCase().trim())}`);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="size-6" />
            </div>
          </div>
          <CardTitle className="text-xl">Forgot Password?</CardTitle>
          <CardDescription>Enter your email and we'll send you a code to reset your password</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="john@college.edu" className="pl-9" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} disabled={isLoading} />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {isLoading ? "Sending OTP..." : "Send Reset Code"}
            </Button>
            <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/auth")}>
              <ArrowLeft className="size-4" />Back to Sign In
            </Button>
          </CardFooter>
        </form>

        <div className="py-3 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
          SpeakUp Campus — Campus Grievance Management
        </div>
      </Card>
    </div>
  );
}

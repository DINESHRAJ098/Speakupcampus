import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Eye, EyeOff, KeyRound, Lock, Loader2, X } from "lucide-react";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const resetPassword = useMutation(api.authActions.resetPassword);
  const resendOTP = useMutation(api.authActions.resendOTP);

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [error, setError] = useState("");

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword.length > 0,
  };

  const handleSubmit = useCallback(async () => {
    if (otp.length !== 6 || !newPassword || !confirmPassword || !email) return;

    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }
    if (!passwordChecks.length || !passwordChecks.uppercase || !passwordChecks.lowercase || !passwordChecks.number) {
      setError("Password does not meet security requirements"); return;
    }

    setIsLoading(true);
    setError("");
    try {
      await resetPassword({ email, otp, newPassword, confirmPassword });
      setIsSuccess(true);
      toast.success("Password reset successful!", { description: "You can now sign in with your new password" });
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err: any) {
      setError(err.message || "Reset failed");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  }, [otp, newPassword, confirmPassword, email, resetPassword, navigate, passwordChecks]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    try {
      await resendOTP({ email });
      toast.success("New OTP sent!");
      setResendCooldown(60);
      setOtp("");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend");
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <p className="text-muted-foreground">No email provided.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/forgot-password")}>Start Over</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <CheckCircle2 className="mx-auto size-12 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold">Password Reset!</h2>
            <p className="text-muted-foreground mt-2">Redirecting to sign in...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <KeyRound className="size-6" />
            </div>
          </div>
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            Enter the 6-digit code sent to<br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* OTP Input */}
          <div className="space-y-2">
            <Label className="text-center block">Verification Code</Label>
            <div className="flex justify-center">
              <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}>
                <InputOTPGroup>
                  {Array.from({ length: 6 }).map((_, i) => (<InputOTPSlot key={i} index={i} />))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label>New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="pl-9 pr-9" value={newPassword} onChange={(e) => { setNewPassword(e.target.value); setError(""); }} disabled={isLoading} />
              <button type="button" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="grid grid-cols-2 gap-1 mt-2">
                {[
                  { key: "length", label: "8+ characters" },
                  { key: "uppercase", label: "Uppercase letter" },
                  { key: "lowercase", label: "Lowercase letter" },
                  { key: "number", label: "Number" },
                ].map((check) => (
                  <div key={check.key} className="flex items-center gap-1.5 text-[10px]">
                    {passwordChecks[check.key as keyof typeof passwordChecks] ? <Check className="size-3 text-emerald-500" /> : <X className="size-3 text-muted-foreground" />}
                    <span className={passwordChecks[check.key as keyof typeof passwordChecks] ? "text-emerald-500" : "text-muted-foreground"}>{check.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
              <Input type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your new password" className="pl-9 pr-9" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }} disabled={isLoading} />
              <button type="button" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
          </div>

          {error && <p className="text-sm text-destructive text-center">{error}</p>}

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />Resetting password...
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3">
          <Button className="w-full gap-2" disabled={isLoading || otp.length !== 6 || !newPassword || !confirmPassword} onClick={handleSubmit}>
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
            Reset Password
          </Button>

          <p className="text-sm text-muted-foreground">
            Didn't receive the code?{" "}
            <button type="button" onClick={handleResend} disabled={resendCooldown > 0}
              className="text-primary hover:underline font-medium disabled:text-muted-foreground disabled:no-underline">
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </button>
          </p>

          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/forgot-password")}>
            <ArrowLeft className="size-4" />Back
          </Button>
        </CardFooter>

        <div className="py-3 px-6 text-xs text-center text-muted-foreground bg-muted border-t rounded-b-lg">
          SpeakUp Campus — Campus Grievance Management
        </div>
      </Card>
    </div>
  );
}

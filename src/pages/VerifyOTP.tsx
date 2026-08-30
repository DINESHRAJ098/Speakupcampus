import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Loader2, Mail, RotateCcw } from "lucide-react";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";

  const verifyOTP = useMutation(api.authActions.verifyOTP);
  const resendOTP = useMutation(api.authActions.resendOTP);

  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleVerify = useCallback(async () => {
    if (otp.length !== 6 || !email) return;
    setIsLoading(true);
    try {
      await verifyOTP({ email, otp });
      setIsVerified(true);
      toast.success("Email verified!", { description: "Your account has been created. Redirecting to sign in..." });
      setTimeout(() => navigate("/auth"), 2000);
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  }, [otp, email, verifyOTP, navigate]);

  // Auto-submit when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && !isLoading && !isVerified) {
      handleVerify();
    }
  }, [otp, isLoading, isVerified, handleVerify]);

  const handleResend = async () => {
    if (resendCooldown > 0 || !email) return;
    try {
      await resendOTP({ email });
      toast.success("New OTP sent!", { description: `A new 6-digit code has been sent to ${email}` });
      setResendCooldown(60);
      setOtp("");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP");
    }
  };

  if (!email) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <p className="text-muted-foreground">No email provided. Please register first.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate("/register")}>Go to Registration</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isVerified) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-8">
            <CheckCircle2 className="mx-auto size-12 text-emerald-500 mb-4" />
            <h2 className="text-xl font-bold">Email Verified!</h2>
            <p className="text-muted-foreground mt-2">Your account has been created successfully.</p>
            <p className="text-sm text-muted-foreground mt-1">Redirecting to sign in...</p>
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
              <Mail className="size-6" />
            </div>
          </div>
          <CardTitle className="text-xl">Verify Your Email</CardTitle>
          <CardDescription>
            We've sent a 6-digit code to<br />
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP value={otp} onChange={setOtp} maxLength={6} disabled={isLoading}>
              <InputOTPGroup>
                {Array.from({ length: 6 }).map((_, index) => (
                  <InputOTPSlot key={index} index={index} />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />Verifying...
            </div>
          )}

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="text-primary hover:underline font-medium disabled:text-muted-foreground disabled:no-underline"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
              </button>
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => navigate("/register")}>
            <ArrowLeft className="size-4" />Back to Registration
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            SpeakUp Campus — Campus Grievance Management
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ArrowRight, Loader2, Mail, Lock, User, Eye, EyeOff, Check, X } from "lucide-react";

export default function Register() {
  const navigate = useNavigate();
  const register = useMutation(api.authActions.register);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password strength checks
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    match: password === confirmPassword && confirmPassword.length > 0,
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = "Invalid email address";
    if (!password) newErrors.password = "Password is required";
    else if (!passwordChecks.length) newErrors.password = "Password must be at least 8 characters";
    else if (!passwordChecks.uppercase) newErrors.password = "Must contain an uppercase letter";
    else if (!passwordChecks.lowercase) newErrors.password = "Must contain a lowercase letter";
    else if (!passwordChecks.number) newErrors.password = "Must contain a number";
    if (!confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({ name: name.trim(), email: email.toLowerCase().trim(), password, confirmPassword });
      toast.success("OTP sent!", { description: `A 6-digit code has been sent to ${email}` });
      navigate(`/verify-otp?email=${encodeURIComponent(email.toLowerCase().trim())}`);
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-lg font-bold">S</div>
          </div>
          <CardTitle className="text-xl">Create Account</CardTitle>
          <CardDescription>Join SpeakUp Campus to submit and track grievances</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input id="name" placeholder="John Doe" className="pl-9" value={name} onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: "" })); }} disabled={isLoading} />
              </div>
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email ID</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="john@college.edu" className="pl-9" value={email} onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }} disabled={isLoading} />
              </div>
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input id="password" type={showPassword ? "text" : "password"} placeholder="Create a strong password" className="pl-9 pr-9" value={password} onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: "" })); }} disabled={isLoading} />
                <button type="button" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}

              {/* Password strength indicators */}
              {password.length > 0 && (
                <div className="grid grid-cols-2 gap-1 mt-2">
                  {[
                    { key: "length", label: "8+ characters" },
                    { key: "uppercase", label: "Uppercase letter" },
                    { key: "lowercase", label: "Lowercase letter" },
                    { key: "number", label: "Number" },
                  ].map((check) => (
                    <div key={check.key} className="flex items-center gap-1.5 text-[10px]">
                      {passwordChecks[check.key as keyof typeof passwordChecks] ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <X className="size-3 text-muted-foreground" />
                      )}
                      <span className={passwordChecks[check.key as keyof typeof passwordChecks] ? "text-emerald-500" : "text-muted-foreground"}>{check.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 size-4 text-muted-foreground" />
                <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} placeholder="Re-enter your password" className="pl-9 pr-9" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setErrors((prev) => ({ ...prev, confirmPassword: "" })); }} disabled={isLoading} />
                <button type="button" className="absolute right-3 top-3 text-muted-foreground hover:text-foreground" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {isLoading ? "Creating account..." : "Create Account"}
            </Button>
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <button type="button" onClick={() => navigate("/auth")} className="text-primary hover:underline font-medium">Sign in</button>
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

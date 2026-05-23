import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Globe, Monitor } from "lucide-react";
import logo from "@/assets/logo.png";
import { toast } from "sonner";

export default function Login() {
  const { login, socialLogin, isAuthenticated, isLoadingAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, from, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    setIsSubmitting(true);
    try {
      await login(email, password, rememberMe);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Invalid credentials";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSocialLogin = async (provider: string) => {
    // In a real implementation, this would redirect to the provider's OAuth page
    // For this demo, we'll simulate a successful social login
    toast.info(`Redirecting to ${provider}...`);
    setTimeout(() => {
      socialLogin(provider, {
        providerId: "mock-id-" + Math.random().toString(36).substr(2, 9),
        email: email || "social-user@example.com",
        name: "Social User"
      });
    }, 1000);
  };

  if (isLoadingAuth) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center text-center">
          <img src={logo} alt="Sanku" className="h-12 w-auto mb-6" />
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Or{" "}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/90 transition-colors">
              create a new account
            </Link>
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-sm border rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="block w-full"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-primary hover:text-primary/90"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-slate-700 cursor-pointer"
              >
                Remember me
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full py-2 px-4 flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin("google")}
              >
                <Globe className="h-5 w-5" />
                <span className="text-xs">Google</span>
              </Button>
              <Button
                variant="outline"
                className="w-full py-2 px-4 flex items-center justify-center gap-2"
                onClick={() => handleSocialLogin("microsoft")}
              >
                <Monitor className="h-5 w-5" />
                <span className="text-xs">Microsoft</span>
              </Button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-500">
          By signing in, you agree to our{" "}
          <Link to="/terms" className="underline hover:text-slate-700">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="underline hover:text-slate-700">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}


import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2, LogIn, UserPlus, Mail, Lock, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function Landing() {
  const { toast } = useToast();
  const [location, setLocation] = useLocation();

  const [isProcessing, setIsProcessing] = useState(false);
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    if (error) {
      let message = "Authentication failed. Please try again.";
      if (error === "auth_failed") {
        message = "Login was cancelled or failed.";
      } else if (error === "callback_failed") {
        message = "Authentication callback failed.";
      } else if (error === "auth_not_configured") {
        message = "Authentication is not configured.";
      } else if (error === "login_failed") {
        message = "Unable to initiate login.";
      }
      toast({
        title: "Login Error",
        description: message,
        variant: "destructive",
      });
      setLocation("/");
    }
  }, [toast, setLocation]);

  const handleGoogleLogin = async () => {
    setIsProcessing(true);
    try {
      const redirectTo = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (error) throw error;
      if (!data?.url) throw new Error("Unable to initiate Google login.");
      window.location.href = data.url;
    } catch (error: any) {
      console.error("Google login error:", error);
      toast({
        title: "Google login failed",
        description: error.message || "Unable to continue with Google.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleEmailLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast({
        title: "Welcome back",
        description: "Redirecting to your dashboard…",
      });
    } catch (error: any) {
      console.error("Email login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailSignup = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsProcessing(true);
    try {
      if (!firstName.trim() || !lastName.trim()) {
        toast({
          title: "Missing information",
          description: "Please enter your first and last name.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });
      if (error) throw error;

      toast({
        title: "Check your inbox",
        description: "We sent you a confirmation link to finish signup.",
      });

      setTab("login");
    } catch (error: any) {
      console.error("Signup error:", error);
      toast({
        title: "Signup failed",
        description: error.message || "Unable to create your account.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 flex items-center justify-center px-4 py-10">
      <Card className="w-full max-w-xl shadow-2xl border-slate-800 bg-slate-900/70 backdrop-blur">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-white">Martek Marina</CardTitle>
          <CardDescription className="text-slate-300">
            Sign in or create an account to manage berths, bookings, and smart pedestals.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Button
            variant="outline"
            className="w-full text-white border-slate-700 hover:bg-slate-800"
            onClick={handleGoogleLogin}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redirecting…
              </>
            ) : (
              "Continue with Google"
            )}
          </Button>

          <div className="relative">
            <Separator className="bg-slate-800" />
            <span className="absolute inset-0 mx-auto -mt-3 flex w-fit items-center bg-slate-900 px-3 text-xs uppercase text-slate-400">
              or continue with email
            </span>
          </div>

          <Tabs value={tab} onValueChange={(value) => setTab(value as "login" | "signup")}>
            <TabsList className="grid grid-cols-2 bg-slate-800/60 text-white">
              <TabsTrigger value="login" className="data-[state=active]:bg-slate-900">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </TabsTrigger>
              <TabsTrigger value="signup" className="data-[state=active]:bg-slate-900">
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form className="space-y-4" onSubmit={handleEmailLogin}>
                <div className="space-y-2">
                  <Label className="text-slate-200">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-slate-900/60 border-slate-700 text-white"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-slate-900/60 border-slate-700 text-white"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Log In
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form className="space-y-4" onSubmit={handleEmailSignup}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-200">First name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        placeholder="Jane"
                        className="pl-10 bg-slate-900/60 border-slate-700 text-white"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-200">Last name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        placeholder="Skipper"
                        className="pl-10 bg-slate-900/60 border-slate-700 text-white"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 bg-slate-900/60 border-slate-700 text-white"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-200">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <Input
                      type="password"
                      placeholder="At least 8 characters"
                      className="pl-10 bg-slate-900/60 border-slate-700 text-white"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

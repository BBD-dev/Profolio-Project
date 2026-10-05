import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth, getErrorMessage } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { easeOut } from "@/components/shared/Motion";
import { BrandMark } from "@/components/layout/BrandMark";

const lines = ["Showcasing", "verified graduates", "& the real work", "they shipped."];
const marquee = ["Mobile Apps", "Web Development", "UI/UX", "Graphic Design", "Motion Graphics", "Digital Marketing", "Cybersecurity"];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Please enter your email and password"); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Welcome back to BBD PROFOLIO");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Left — kinetic brand panel */}
      <div className="relative hidden overflow-hidden bg-primary lg:flex lg:flex-col">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-accent/10 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "linear-gradient(hsl(var(--primary-foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary-foreground)) 1px, transparent 1px)", backgroundSize: "48px 48px" }}
        />

        <div className="relative z-10 flex items-center gap-3 p-10">
          <BrandMark dark subtitle="by BBD Select" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center px-10 pb-16">
          <h1 className="font-heading text-5xl font-bold leading-[1.12] tracking-tight text-primary-foreground xl:text-6xl">
            {lines.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.12em]">
                <motion.span
                  className="block"
                  initial={{ y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.7, ease: easeOut, delay: 0.15 + i * 0.09 }}
                >
                  {i === 1 ? <span className="text-accent">{line}</span> : line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8 max-w-md text-base leading-relaxed text-primary-foreground/60"
          >
            The official administration panel for the BBD PROFOLIO mobile app — approve graduates, curate projects and shape the public experience.
          </motion.p>
        </div>

        {/* editorial marquee */}
        <div className="relative z-10 border-t border-primary-foreground/10 py-5">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap">
            {[...marquee, ...marquee].map((m, i) => (
              <span key={i} className="flex items-center gap-10 text-sm font-medium uppercase tracking-[0.18em] text-primary-foreground/40">
                {m}<span className="text-accent">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: easeOut }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 lg:hidden">
            <BrandMark />
          </div>

          <div className="mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Admin access only
            </div>
            <h2 className="font-heading text-3xl font-bold tracking-tight">Sign in</h2>
            <p className="mt-2 text-sm text-muted-foreground">Enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={submit} className="space-y-5" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" data-testid="login-email" value={email}
                onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="h-11 py-0" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" onClick={() => toast.info("Ask a BBD Select admin to reset your password.")}
                  className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground" data-testid="forgot-password">
                  Forgot password?
                </button>
              </div>
              <div className="relative h-11">
                <Input id="password" type={show ? "text" : "password"} data-testid="login-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="h-11 py-0 pr-11" />
                <button type="button" onClick={() => setShow((s) => !s)}
                  className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground" data-testid="toggle-password">
                  {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" disabled={loading} data-testid="login-submit"
              className="group h-11 w-full text-sm font-semibold">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

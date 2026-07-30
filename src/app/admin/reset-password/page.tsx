"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Lock, Loader2, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      // Supabase lit automatiquement le token dans l'URL (hash) pour établir la session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // Laissons le temps au client de parser le hash (parfois asynchrone au montage)
        setTimeout(async () => {
          const { data: { session: delayedSession } } = await supabase.auth.getSession();
          if (!delayedSession) {
            setError("Lien invalide ou expiré. Veuillez refaire une demande de réinitialisation.");
            setHasSession(false);
          } else {
            setHasSession(true);
          }
        }, 1000);
      } else {
        setHasSession(true);
      }
    };
    checkSession();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError("Erreur lors de la mise à jour : " + error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      // Redirection automatique vers la connexion après succès
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
      }, 3000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed opacity-10 blur-sm"
        style={{ backgroundImage: "url('/lots/abstract_luxury.png')" }} 
      />
      
      <Card className="w-full max-w-md z-10 border-border/50 bg-card/80 backdrop-blur-md shadow-2xl">
        <CardHeader className="space-y-4 text-center pb-8">
          <div className="mx-auto flex justify-center mb-2">
            <Logo className="scale-110" />
          </div>
          <CardTitle className="font-heading text-2xl font-bold tracking-tight">Nouveau mot de passe</CardTitle>
          <CardDescription>
            Définissez un nouveau mot de passe pour votre compte administrateur.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasSession === false ? (
            <div className="space-y-6 text-center">
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                {error}
              </div>
              <Button onClick={() => router.push("/admin/login")} className="w-full">
                Retour à la connexion
              </Button>
            </div>
          ) : hasSession === null ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-4 text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p>Vérification du lien sécurisé...</p>
            </div>
          ) : success ? (
            <div className="space-y-6 text-center">
              <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <h3 className="font-semibold mb-2">Mot de passe mis à jour !</h3>
                <p className="text-sm">Vous allez être redirigé vers la page de connexion dans quelques instants...</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleUpdatePassword} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full h-11" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Mise à jour...
                  </>
                ) : (
                  "Enregistrer le mot de passe"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

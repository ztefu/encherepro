"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Building2, CreditCard, User, Mail, Bell, Shield, Image as ImageIcon, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAdmin } from "@/context/AdminContext";
import { createClient } from "@/lib/supabase/client";
import { uploadFileToSupabase } from "@/lib/upload";

export default function SettingsPage() {
  const { 
    registrationFee, setRegistrationFee, 
    adminAvatar, setAdminAvatar, 
    adminEmail, 
    autoEmailDraft, setAutoEmailDraft, 
    autoEmailAccess, setAutoEmailAccess 
  } = useAdmin();
  const router = useRouter();
  const supabase = createClient();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(adminAvatar);
  const [localFee, setLocalFee] = useState<number>(registrationFee);
  
  // Local state for switches before saving
  const [localAutoDraft, setLocalAutoDraft] = useState(autoEmailDraft);
  const [localAutoAccess, setLocalAutoAccess] = useState(autoEmailAccess);

  useEffect(() => {
    if (!logoFile) setLogoPreview(adminAvatar);
    setLocalFee(registrationFee);
    setLocalAutoDraft(autoEmailDraft);
    setLocalAutoAccess(autoEmailAccess);
  }, [adminAvatar, registrationFee, autoEmailDraft, autoEmailAccess, logoFile]);

  // Auth / Password state
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading state for the save button
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    
    let finalLogoUrl = adminAvatar;
    if (logoFile) {
      const uploadedUrl = await uploadFileToSupabase(logoFile, 'logos');
      if (uploadedUrl) {
        finalLogoUrl = uploadedUrl;
      }
    }

    setRegistrationFee(localFee);
    setAutoEmailDraft(localAutoDraft);
    setAutoEmailAccess(localAutoAccess);
    if (finalLogoUrl !== adminAvatar) {
      setAdminAvatar(finalLogoUrl);
    }
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    // Reset success message after 3 seconds
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPasswordError("Veuillez remplir tous les champs.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    
    setIsUpdatingPassword(true);

    try {
      // 1. Verify old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: oldPassword,
      });

      if (signInError) {
        setPasswordError("L'ancien mot de passe est incorrect.");
        setIsUpdatingPassword(false);
        return;
      }

      // 2. Update to new password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setPasswordError("Erreur lors de la mise à jour : " + updateError.message);
        setIsUpdatingPassword(false);
        return;
      }

      setPasswordSuccess("Mot de passe mis à jour ! Déconnexion en cours...");
      
      // 3. Sign out and redirect
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
      }, 2000);

    } catch (err: any) {
      setPasswordError("Une erreur inattendue est survenue.");
    } finally {
      if (!passwordSuccess) {
        setIsUpdatingPassword(false);
      }
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Paramètres</h1>
          <p className="text-muted-foreground mt-2">Gérez les configurations globales de votre plateforme.</p>
        </div>
        <Button 
          className="gap-2 transition-all" 
          onClick={handleSave} 
          disabled={isSaving}
          variant={saveSuccess ? "outline" : "default"}
        >
          {isSaving ? (
            <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" /> Sauvegarde...</span>
          ) : saveSuccess ? (
            <span className="flex items-center gap-2 text-emerald-500"><Shield className="w-4 h-4" /> Sauvegardé !</span>
          ) : (
            <span className="flex items-center gap-2"><Save className="w-4 h-4" /> Sauvegarder les modifications</span>
          )}
        </Button>
      </div>

      <Tabs defaultValue="company" orientation="vertical" className="flex flex-col md:flex-row gap-8">
        <TabsList className="flex flex-col bg-transparent border-none w-full md:w-64 h-auto p-0 gap-2 items-stretch justify-start shrink-0">
          <TabsTrigger 
            value="company" 
            className="justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-lg transition-all"
          >
            <Building2 className="w-4 h-4 mr-3" /> Entreprise
          </TabsTrigger>
          <TabsTrigger 
            value="sales" 
            className="justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-lg transition-all"
          >
            <CreditCard className="w-4 h-4 mr-3" /> Ventes & Paiements
          </TabsTrigger>
          <TabsTrigger 
            value="profile" 
            className="justify-start px-4 py-3 data-[state=active]:bg-primary/10 data-[state=active]:text-primary border border-transparent data-[state=active]:border-primary/20 rounded-lg transition-all"
          >
            <User className="w-4 h-4 mr-3" /> Profil Admin
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          {/* ONGLET: ENTREPRISE */}
          <TabsContent value="company" className="space-y-6 outline-none mt-0">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Informations de l'entreprise</CardTitle>
              <CardDescription>Ces informations apparaîtront sur les factures et les emails.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Logo de l'entreprise</Label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-lg bg-muted border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                    )}
                  </div>
                  <div>
                    <input type="file" id="logo-upload" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                    <Button variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
                      Changer le logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">Format recommandé: PNG transparent, max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input id="companyName" defaultValue="EnchèrePro Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email de contact (Support)</Label>
                  <Input id="companyEmail" defaultValue="contact@encherepro.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Téléphone</Label>
                  <Input id="companyPhone" defaultValue="+33 1 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Site web</Label>
                  <Input id="companyWebsite" defaultValue="https://encherepro.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Adresse complète</Label>
                <Textarea id="companyAddress" defaultValue="125 Avenue des Champs-Élysées, 75008 Paris, France" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET: VENTES & PAIEMENTS */}
        <TabsContent value="sales" className="space-y-6 outline-none mt-0">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Configuration des Ventes</CardTitle>
              <CardDescription>Paramètres par défaut appliqués lors de la création d'une nouvelle vente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="currency">Devise par défaut</Label>
                  <Input id="currency" defaultValue="€" disabled />
                  <p className="text-xs text-muted-foreground">La devise principale est fixée en Euros.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="defaultFee">Montant par défaut des frais d'inscription</Label>
                  <Input 
                    id="defaultFee" 
                    type="number" 
                    value={localFee} 
                    onChange={(e) => setLocalFee(Number(e.target.value))} 
                  />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border/50">
                <h3 className="font-medium text-foreground">Communications Automatiques</h3>
                
                <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email de confirmation (Brouillon)</Label>
                    <p className="text-sm text-muted-foreground">Envoyer un email dès que l'inscription est reçue (avant paiement).</p>
                  </div>
                  <Switch 
                    checked={localAutoDraft} 
                    onCheckedChange={setLocalAutoDraft} 
                  />
                </div>

                <div className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/30">
                  <div className="space-y-0.5">
                    <Label className="text-base">Email d'accès (Après paiement)</Label>
                    <p className="text-sm text-muted-foreground">Envoyer automatiquement les accès après la confirmation Stripe.</p>
                  </div>
                  <Switch 
                    checked={localAutoAccess} 
                    onCheckedChange={setLocalAutoAccess} 
                  />
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Label htmlFor="terms">Conditions Générales de Vente (URL ou Texte)</Label>
                <Textarea id="terms" placeholder="Vos conditions générales, affichées lors du paiement..." className="min-h-[100px]" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ONGLET: PROFIL ADMIN */}
        <TabsContent value="profile" className="space-y-6 outline-none mt-0">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Mon Profil Administrateur</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nom complet</Label>
                  <Input id="adminName" defaultValue="Admin Principal" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email de connexion</Label>
                  <Input id="adminEmail" value={adminEmail} readOnly className="bg-muted text-muted-foreground cursor-not-allowed" />
                  <p className="text-xs text-muted-foreground">Cet email est géré par le système d'authentification.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm border-red-500/20">
            <CardHeader>
              <CardTitle className="font-heading flex items-center gap-2 text-red-500">
                <Shield className="w-5 h-5" /> Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {passwordError && <div className="p-3 text-sm rounded-md bg-red-500/10 text-red-500 border border-red-500/20">{passwordError}</div>}
                {passwordSuccess && <div className="p-3 text-sm rounded-md bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">{passwordSuccess}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="oldPassword">Ancien mot de passe</Label>
                    <div className="relative">
                      <Input id="oldPassword" type={showOldPassword ? "text" : "password"} className="pr-10" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
                      <button 
                        type="button" onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Nouveau mot de passe</Label>
                    <div className="relative">
                      <Input id="newPassword" type={showNewPassword ? "text" : "password"} className="pr-10" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                      <button 
                        type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
                    <div className="relative">
                      <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} className="pr-10" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      <button 
                        type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                onClick={handleUpdatePassword}
                disabled={isUpdatingPassword || !!passwordSuccess}
              >
                {isUpdatingPassword ? (
                  <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Vérification...</span>
                ) : (
                  "Mettre à jour le mot de passe"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        </div>

      </Tabs>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ShieldCheck, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "react-phone-number-input/style.css";
import { createClient } from "@/lib/supabase/client";
import { useAdmin } from "@/context/AdminContext";

export default function InscriptionPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [phoneInput, setPhoneInput] = useState<string | undefined>("");
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  
  // For Supabase
  const supabase = createClient();
  const { sales } = useAdmin();

  // Find upcoming sale to verify status
  const upcomingSale = sales.find(s => s.status !== "finished") || sales[0];
  const isRegistrationOpen = upcomingSale?.status === "open";

  const handleNextStep = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      alert("Veuillez accepter les conditions générales.");
      return;
    }

    setIsProcessing(true);
    // Vérifier si l'utilisateur est déjà inscrit
    const { data: existingParticipant } = await supabase
      .from('participants')
      .select('id')
      .eq('email', email)
      .eq('sale_id', upcomingSale?.id)
      .maybeSingle();
    setIsProcessing(false);

    if (existingParticipant) {
      alert("Cette adresse email est déjà inscrite pour cette vente !");
      return;
    }

    setStep(2);
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Insertion dans Supabase
    const { error } = await supabase.from('participants').insert({
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phoneInput,
      country: "France", // default for now, could be derived from phone
      address: address,
      city: city,
      postal_code: postalCode,
      payment_status: "paid",
      participation_status: "registered",
      sale_id: upcomingSale?.id
    });

    setIsProcessing(false);
    if (!error) {
      setStep(3);
    } else {
      alert("Une erreur est survenue lors de l'enregistrement de votre inscription.");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex flex-col justify-center py-12">
      {/* Background Decor (Optional) */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed opacity-10 blur-sm"
        style={{ backgroundImage: "url('/lots/abstract_luxury.png')" }} 
      />
      
      <div className="container relative z-10 max-w-3xl mx-auto px-4">
        
        {/* En-tête (Logo et Retour) */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/">
            <Button variant="ghost" className="gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
            </Button>
          </Link>
          <div className="font-heading font-bold text-2xl tracking-tight text-foreground">
            Enchère<span className="text-primary">Pro</span>
          </div>
        </div>



        {!isRegistrationOpen ? (
          <Card className="bg-card/60 backdrop-blur-md border-border/50 text-center py-16">
            <CardContent className="flex flex-col items-center">
              <Lock className="w-12 h-12 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-bold font-heading mb-2">Les inscriptions sont closes</h2>
              <p className="text-muted-foreground mb-6">
                Les inscriptions pour notre prochaine vente ({upcomingSale?.title || "Événement à venir"}) ne sont pas encore ouvertes ou sont déjà terminées.
              </p>
              <Link href="/">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Retourner sur le site
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Stepper visuel */}
            <div className="flex items-center justify-center mb-8">
              <div className={`flex items-center gap-2 ${step >= 1 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              1
            </div>
            <span className="hidden sm:inline text-sm font-medium">Informations</span>
          </div>
          <div className={`w-12 sm:w-24 h-px mx-4 ${step >= 2 ? 'bg-primary' : 'bg-border/50'}`} />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              2
            </div>
            <span className="hidden sm:inline text-sm font-medium">Paiement</span>
          </div>
          <div className={`w-12 sm:w-24 h-px mx-4 ${step >= 3 ? 'bg-primary' : 'bg-border/50'}`} />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-primary' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
              3
            </div>
            <span className="hidden sm:inline text-sm font-medium">Succès</span>
          </div>
        </div>

        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl overflow-hidden">
          
          {/* ETAPE 1 : Informations */}
          {step === 1 && (
            <CardContent className="p-6 sm:p-10">
              <div className="mb-8 text-center">
                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                  Inscription à la vente
                </h1>
                <p className="text-muted-foreground mt-2">
                  Vente Exceptionnelle : Collection Immobilière Prestige
                </p>
              </div>

              <form onSubmit={handleNextStep} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom <span className="text-red-500">*</span></Label>
                    <Input id="firstName" required placeholder="Ex: Jean" value={firstName} onChange={e => setFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom <span className="text-red-500">*</span></Label>
                    <Input id="lastName" required placeholder="Ex: Dupont" value={lastName} onChange={e => setLastName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Adresse Email <span className="text-red-500">*</span></Label>
                  <Input id="email" type="email" required placeholder="jean.dupont@exemple.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Numéro de téléphone <span className="text-red-500">*</span></Label>
                  <PhoneInput
                    id="phone"
                    international
                    defaultCountry="FR"
                    withCountryCallingCode
                    value={phoneInput}
                    onChange={setPhoneInput}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:outline-none"
                    numberInputProps={{
                      className: "flex-1 border-none shadow-none focus-visible:ring-0 rounded-none bg-transparent ml-2 outline-none",
                      required: true
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse postale <span className="text-red-500">*</span></Label>
                  <Input id="address" required placeholder="123 Avenue des Champs-Élysées" value={address} onChange={e => setAddress(e.target.value)} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Code Postal <span className="text-red-500">*</span></Label>
                    <Input id="postalCode" required placeholder="75008" value={postalCode} onChange={e => setPostalCode(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Ville <span className="text-red-500">*</span></Label>
                    <Input id="city" required placeholder="Paris" value={city} onChange={e => setCity(e.target.value)} />
                  </div>
                </div>

                <div className="flex items-center space-x-3 pt-2">
                  <Checkbox 
                    id="terms" 
                    checked={termsAccepted} 
                    onCheckedChange={(checked) => setTermsAccepted(checked as boolean)} 
                  />
                  <Label htmlFor="terms" className="text-sm font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    <span>
                      J'accepte les <Link href="/cgv" className="text-primary hover:underline" target="_blank">conditions générales de vente</Link> et la <Link href="/confidentialite" className="text-primary hover:underline" target="_blank">politique de confidentialité</Link>.
                    </span>
                  </Label>
                </div>

                <div className="pt-6">
                  <Button type="submit" size="lg" className="w-full text-lg gap-2" disabled={!termsAccepted || isProcessing}>
                    {isProcessing ? "Vérification..." : (
                      <>Continuer vers le paiement <ArrowLeft className="w-5 h-5 rotate-180" /></>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          )}

          {/* ETAPE 2 : Paiement (Simulation) */}
          {step === 2 && (
            <CardContent className="p-6 sm:p-10">
              <div className="mb-8 text-center">
                <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                  Frais d'inscription
                </h1>
                <p className="text-muted-foreground mt-2">
                  Validation de votre participation à la vente
                </p>
              </div>

              <div className="bg-muted/30 p-6 rounded-xl border border-border/50 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Frais de dossier</span>
                  <span className="font-medium">25,00 €</span>
                </div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="font-medium">0,00 €</span>
                </div>
                <Separator className="bg-border/50 mb-4" />
                <div className="flex justify-between items-center text-lg">
                  <span className="font-bold text-foreground">Total à payer</span>
                  <span className="font-bold text-primary">25,00 €</span>
                </div>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                
                {/* Fausses informations de carte bancaire */}
                <div className="space-y-4">
                  <Label>Informations de paiement (Simulation)</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input disabled value="**** **** **** 4242" className="pl-10 bg-muted/50" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input disabled value="12/28" className="bg-muted/50" />
                    <Input disabled value="123" className="bg-muted/50" />
                  </div>
                </div>

                <div className="pt-6 flex gap-4">
                  <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
                    Retour
                  </Button>
                  <Button type="submit" size="lg" className="w-full text-lg gap-2" disabled={isProcessing}>
                    {isProcessing ? (
                      "Traitement..."
                    ) : (
                      <>
                        <Lock className="w-5 h-5" /> Payer 25,00 €
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex justify-center items-center gap-2 text-xs text-muted-foreground mt-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Paiement fictif 100% sécurisé (Simulation Stripe)
                </div>
              </form>
            </CardContent>
          )}

          {/* ETAPE 3 : Succès */}
          {step === 3 && (
            <CardContent className="p-10 text-center space-y-6">
              <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
                Inscription Validée !
              </h1>
              <div className="max-w-md mx-auto text-muted-foreground space-y-4">
                <p>
                  Félicitations, vos informations personnelles et votre paiement de 25,00 € ont bien été enregistrés.
                </p>
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-foreground font-medium">
                  Nous vous contacterons par email ou téléphone au moment venu pour vous transmettre vos identifiants d'accès sécurisés à la salle de vente.
                </div>
              </div>
              <div className="pt-8">
                <Link href="/">
                  <Button size="lg" className="gap-2">
                    Retourner à la page d'accueil
                  </Button>
                </Link>
              </div>
            </CardContent>
          )}

        </Card>
        </>
        )}
      </div>
    </div>
  );
}

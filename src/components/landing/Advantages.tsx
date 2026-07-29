"use client";

import { ShieldCheck, Gem, Lock, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";

export function Advantages() {
  const advantages = [
    {
      icon: <Gem className="w-8 h-8 text-primary" />,
      title: "Sélection Rigoureuse",
      desc: "Chaque lot est expertisé, certifié authentique et soigneusement sélectionné par notre comité d'experts en art et horlogerie.",
    },
    {
      icon: <Lock className="w-8 h-8 text-primary" />,
      title: "Confidentialité Absolue",
      desc: "Nous garantissons l'anonymat complet de nos acheteurs et vendeurs. Vos données et vos acquisitions restent strictement confidentielles.",
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: "Paiement Sécurisé",
      desc: "Transactions protégées par les plus hauts standards bancaires. Démarches administratives et douanières prises en charge.",
    },
    {
      icon: <Sparkles className="w-8 h-8 text-primary" />,
      title: "Service Conciergerie",
      desc: "Un accompagnement sur-mesure de l'inscription jusqu'à la livraison sécurisée de votre lot à domicile.",
    },
  ];

  return (
    <section className="relative py-24">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/lots/lot3.png')" }} />
      <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Pourquoi participer ?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Une expérience d'enchères réinventée, alliant le prestige des maisons traditionnelles
            à l'efficacité du numérique.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {advantages.map((adv, idx) => (
            <motion.div 
              key={idx} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex gap-6 p-6 rounded-2xl hover:bg-card hover:shadow-sm border border-transparent hover:border-border/50 transition-all duration-300"
            >
              <div className="shrink-0 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                {adv.icon}
              </div>
              <div>
                <h3 className="font-heading font-semibold text-xl mb-2">{adv.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{adv.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mt-16"
        >
          <Link href="/inscription">
            <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-lg shadow-primary/20">
              Profiter de ces privilèges
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

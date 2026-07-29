"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

import { useAdmin } from "@/context/AdminContext";

export function FAQ() {
  const { registrationFee } = useAdmin();
  
  const faqs = [
    {
      q: "À quoi servent les frais d'inscription ?",
      a: `Les frais d'inscription de ${registrationFee}€ nous permettent de garantir le sérieux des participants et d'assurer une vente de qualité. Ce montant sera déduit de votre facture si vous remportez un lot lors de la vente.`
    },
    {
      q: "Comment puis-je enchérir le jour de la vente ?",
      a: "Vous pouvez enchérir de trois manières : en personne dans la salle de vente, par téléphone via l'un de nos collaborateurs, ou directement en ligne via notre plateforme sécurisée."
    },
    {
      q: "Les lots sont-ils expertisés ?",
      a: "Oui, chaque lot présenté dans notre catalogue a fait l'objet d'une expertise rigoureuse par nos spécialistes. Un certificat d'authenticité est délivré à l'acquéreur."
    },
    {
      q: "Quels sont les frais acheteurs ?",
      a: "En plus du prix d'adjudication, l'acquéreur devra acquitter des frais de vente fixés à 20% TTC. Ces frais s'appliquent sur chaque lot remporté."
    },
    {
      q: "Comment s'organise le transport des objets ?",
      a: "Nous proposons un service d'emballage et d'expédition sécurisé pour tous les lots. Les frais de transport sont à la charge de l'acquéreur et sont calculés en fonction de la destination et de la valeur de l'objet."
    }
  ];

  return (
    <section id="faq" className="relative py-24">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/lots/house.png')" }} />
      <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Questions Fréquentes</h2>
          <p className="text-muted-foreground">
            Tout ce que vous devez savoir avant de participer à notre vente.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion className="w-full">
            {faqs.map((faq, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`} className="border-border/50">
                <AccordionTrigger className="text-left font-medium text-foreground hover:text-primary transition-colors py-6">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mt-12"
        >
          <Link href="/inscription">
            <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-lg shadow-primary/20">
              Rejoindre la vente privée
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

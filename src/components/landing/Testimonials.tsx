"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Marc L.",
      role: "Collectionneur privé",
      image: "https://randomuser.me/api/portraits/men/45.jpg",
      text: "Une expérience d'enchère exceptionnelle. J'ai pu acquérir une pièce rare que je cherchais depuis des années en toute confidentialité et sécurité.",
      rating: 5,
    },
    {
      id: 2,
      name: "Sophie T.",
      role: "Investisseuse",
      image: "https://randomuser.me/api/portraits/women/42.jpg",
      text: "La qualité du catalogue est impressionnante. Le processus de réservation est très fluide et le service client est aux petits soins pour les acheteurs.",
      rating: 5,
    },
    {
      id: 3,
      name: "Jean-Baptiste R.",
      role: "Passionné d'horlogerie",
      image: "https://randomuser.me/api/portraits/men/29.jpg",
      text: "C'est la première fois que je participe à une vente privée aussi bien organisée. Les lots sont certifiés et l'estimation est toujours juste.",
      rating: 5,
    }
  ];

  return (
    <section id="temoignages" className="relative py-24">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/lots/lot4.png')" }} />
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
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Ce que disent nos acheteurs</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Rejoignez notre communauté de collectionneurs et d'investisseurs satisfaits de nos ventes privées.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="h-full bg-background border-border/50 hover:border-primary/50 transition-colors">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-6">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <p className="text-foreground mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center gap-4">
                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                    <div>
                      <p className="font-semibold text-lg leading-tight">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center"
        >
          <Link href="/inscription">
            <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-lg shadow-primary/20">
              Rejoindre le cercle des membres
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

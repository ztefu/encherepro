"use client";

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function LotGallery() {
  const lots = [
    {
      id: 1,
      title: "Tableau Abstrait Contemporain - Collection Privée",
      est: "15 000 € - 25 000 €",
      image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
      featured: true,
      category: "Art Contemporain",
    },
    {
      id: 2,
      title: "Villa d'architecte - Vue panoramique",
      est: "2 500 000 € - 3 200 000 €",
      image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800",
      featured: false,
      category: "Maisons",
    },
    {
      id: 3,
      title: "Patek Philippe Grand Complications",
      est: "120 000 € - 150 000 €",
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&q=80&w=800",
      featured: true,
      category: "Horlogeries",
    },
    {
      id: 4,
      title: "Cabinet Renaissance en Noyer",
      est: "25 000 € - 35 000 €",
      image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
      featured: false,
      category: "Antiquités",
    },
    {
      id: 5,
      title: "Porsche 911 Classic Édition Limitée",
      est: "180 000 € - 220 000 €",
      image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&q=80&w=800",
      featured: true,
      category: "Automobiles",
    },
    {
      id: 6,
      title: "Parure Diamants et Saphirs Ceylan",
      est: "85 000 € - 110 000 €",
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80&w=800",
      featured: false,
      category: "Bijoux",
    },
  ];

  return (
    <section id="lots" className="relative py-24">
      <div className="absolute inset-0 z-0 bg-cover bg-center bg-fixed" style={{ backgroundImage: "url('/lots/lot1.png')" }} />
      <div className="absolute inset-0 z-0 bg-background/80 backdrop-blur-sm" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent z-0 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-0 pointer-events-none" />
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.1 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6"
        >
          <div>
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Aperçu du Catalogue</h2>
            <p className="text-muted-foreground max-w-2xl">
              Découvrez une sélection des lots exceptionnels qui seront présentés lors de notre prochaine vente.
              Le catalogue complet sera accessible uniquement aux inscrits.
            </p>
          </div>
          <Button variant="outline" className="shrink-0">
            Voir tous les lots publics
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {lots.map((lot, idx) => (
            <motion.div
              key={lot.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <Card className="overflow-hidden bg-background border-border/50 group cursor-pointer h-full">
                <div className="relative h-72 overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${lot.image}')` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {lot.featured && (
                      <Badge className="bg-primary text-primary-foreground hover:bg-primary border-none">Lot Phare</Badge>
                    )}
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm border-none">{lot.category}</Badge>
                  </div>
                </div>
                <CardContent className="p-6 flex flex-col justify-between h-[calc(100%-18rem)]">
                  <h3 className="font-heading font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">{lot.title}</h3>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Estimation</p>
                      <p className="font-medium text-foreground">{lot.est}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Détails
                    </Button>
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
          className="flex justify-center mt-16"
        >
          <Link href="/inscription">
            <Button size="lg" className="h-14 px-8 bg-primary text-primary-foreground hover:bg-primary/90 text-base shadow-lg shadow-primary/20">
              Découvrir tout le catalogue
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

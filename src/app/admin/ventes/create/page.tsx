"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, Save, Play, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateSalePage() {
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // Fausse fonction pour simuler un upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Dans la réalité, on uploadera sur Supabase Storage.
      // Ici, on simule l'affichage de l'image.
      const url = URL.createObjectURL(e.target.files[0]);
      setCoverImage(url);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/ventes">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Créer une vente</h1>
          </div>
          <p className="text-muted-foreground ml-10">Remplissez les informations ci-dessous pour configurer une nouvelle vente aux enchères.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Save className="w-4 h-4" />
            Enregistrer comme brouillon
          </Button>
          <Button className="gap-2">
            <Play className="w-4 h-4" />
            Publier la vente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Colonne Principale */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Informations Générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de la vente</Label>
                <Input id="title" placeholder="Ex: Grande Vente d'Horlogerie Suisse" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subtitle">Sous-titre (Optionnel)</Label>
                <Input id="subtitle" placeholder="Ex: Une collection privée exclusive de 50 pièces" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description complète</Label>
                <Textarea 
                  id="description" 
                  placeholder="Décrivez l'événement, son histoire, et les points forts..." 
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Visuels</CardTitle>
              <CardDescription>Ajoutez une image de couverture pour la bannière de la vente.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Image de couverture</Label>
                <div 
                  className="border-2 border-dashed border-border/50 rounded-lg p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors relative overflow-hidden"
                  onClick={() => document.getElementById('cover-upload')?.click()}
                >
                  {coverImage ? (
                    <div 
                      className="absolute inset-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${coverImage})` }}
                    />
                  ) : (
                    <>
                      <div className="p-3 bg-primary/10 rounded-full mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <p className="font-medium text-foreground">Cliquez pour uploader</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou WEBP (Max 5MB)</p>
                    </>
                  )}
                  <input 
                    type="file" 
                    id="cover-upload" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Galerie d'images (Ambiance, Salle, etc.)</Label>
                <div className="border border-border/50 rounded-lg p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" /> Ajouter des images
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne Latérale */}
        <div className="space-y-6">
          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Type de vente</Label>
                <Select defaultValue="online">
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="online">En ligne uniquement</SelectItem>
                    <SelectItem value="physical">Présentiel</SelectItem>
                    <SelectItem value="hybrid">Hybride (En ligne + Présentiel)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_participants">Limite de participants</Label>
                <Input id="max_participants" type="number" placeholder="Optionnel" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lieu / Lien</Label>
                <Input id="location" placeholder="Adresse complète ou lien visio" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="font-heading">Dates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Début de la vente</Label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label>Fin de la vente</Label>
                <Input type="datetime-local" />
              </div>
              <div className="space-y-2">
                <Label>Clôture des inscriptions</Label>
                <Input type="datetime-local" />
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

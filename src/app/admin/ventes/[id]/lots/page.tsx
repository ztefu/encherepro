"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdmin } from "@/context/AdminContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { use } from "react";
import { uploadFileToSupabase } from "@/lib/upload";
import { Loader2 } from "lucide-react";

export default function SaleLotsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { lots, addLot, updateLot, deleteLot, reorderLots } = useAdmin();
  const saleId = resolvedParams.id.slice(-36);
  const saleLots = lots.filter(l => l.saleId === saleId);
  
  const [lotToDelete, setLotToDelete] = useState<string | number | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLot, setNewLot] = useState({
    id: null as string | number | null,
    title: "",
    description: "",
    ref: "",
    category: "",
    startPrice: "",
    estLow: "",
    estHigh: "",
    condition: "",
    image: "/lots/placeholder.png"
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lotFile, setLotFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewLot({ ...newLot, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Simulation de réorganisation visuelle simple
  const moveLotUp = (index: number) => {
    if (index === 0) return;
    const newLots = [...saleLots];
    const temp = newLots[index - 1];
    newLots[index - 1] = newLots[index];
    newLots[index] = temp;
    reorderLots(saleId, newLots);
  };

  const handleSaveLot = async () => {
    setIsUploading(true);
    let finalImageUrl = newLot.image;
    
    if (lotFile) {
      const uploadedUrl = await uploadFileToSupabase(lotFile, 'lots');
      if (uploadedUrl) {
        finalImageUrl = uploadedUrl;
      }
    }

    if (newLot.id) {
      await updateLot(newLot.id, {
        ref: newLot.ref || `LOT-${Date.now().toString().slice(-4)}`,
        title: newLot.title || "Lot Modifié",
        category: newLot.category || "Divers",
        startPrice: Number(newLot.startPrice) || 0,
        estLow: Number(newLot.estLow) || 0,
        estHigh: Number(newLot.estHigh) || 0,
        condition: newLot.condition || "Non précisé",
        image: finalImageUrl || "/lots/placeholder.png"
      });
    } else {
      await addLot({
        id: Date.now(),
        saleId: saleId,
        ref: newLot.ref || `LOT-${Date.now().toString().slice(-4)}`,
        title: newLot.title || "Nouveau Lot",
        category: newLot.category || "Divers",
        startPrice: Number(newLot.startPrice) || 0,
        estLow: Number(newLot.estLow) || 0,
        estHigh: Number(newLot.estHigh) || 0,
        condition: newLot.condition || "Non précisé",
        image: finalImageUrl || "/lots/placeholder.png"
      });
    }
    
    setNewLot({
      id: null, title: "", description: "", ref: "", category: "",
      startPrice: "", estLow: "", estHigh: "", condition: "",
      image: "/lots/placeholder.png"
    });
    setLotFile(null);
    setIsUploading(false);
    setIsAddDialogOpen(false);
  };

  const handleEditLot = (lot: any) => {
    setNewLot({
      id: lot.id,
      title: lot.title,
      description: lot.description || "",
      ref: lot.ref,
      category: lot.category,
      startPrice: lot.startPrice.toString(),
      estLow: lot.estLow.toString(),
      estHigh: lot.estHigh.toString(),
      condition: lot.condition,
      image: lot.image
    });
    setIsAddDialogOpen(true);
  };

  const openAddDialog = () => {
    setNewLot({
      id: null, title: "", description: "", ref: "", category: "",
      startPrice: "", estLow: "", estHigh: "", condition: "",
      image: "/lots/placeholder.png"
    });
    setIsAddDialogOpen(true);
  };


  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href={`/admin/ventes/${resolvedParams.id}`}>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">Gestion des Lots</h1>
          </div>
          <p className="text-muted-foreground ml-10">Ajoutez, modifiez et réorganisez les lots de cette vente.</p>
        </div>
        <div>
          <Button className="gap-2" onClick={openAddDialog}>
            <Plus className="w-4 h-4" /> Ajouter un lot
          </Button>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-[700px]">
            <DialogHeader>
              <DialogTitle className="font-heading">{newLot.id ? "Modifier le lot" : "Ajouter un nouveau lot"}</DialogTitle>
              <DialogDescription>
                {newLot.id ? "Modifiez les informations du lot." : "Remplissez les informations du lot pour l'ajouter à la vente."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-6 py-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Image Principale</Label>
                  <div 
                    className="border-2 border-dashed border-border/50 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/30 transition-colors relative overflow-hidden h-32"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                    />
                    {newLot.image && newLot.image !== "/lots/placeholder.png" ? (
                      <img src={newLot.image} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-muted-foreground/50 mb-2" />
                        <span className="text-sm font-medium">Uploader une image</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Titre du lot</Label>
                  <Input placeholder="Ex: Montre Rolex Submariner" value={newLot.title} onChange={e => setNewLot({...newLot, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Description détaillée..." value={newLot.description} onChange={e => setNewLot({...newLot, description: e.target.value})} />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Référence</Label>
                    <Input placeholder="Ex: LOT-004" value={newLot.ref} onChange={e => setNewLot({...newLot, ref: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select value={newLot.category} onValueChange={(val) => setNewLot({ ...newLot, category: val || "" })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Art Contemporain">Art Contemporain</SelectItem>
                        <SelectItem value="Maisons">Maisons</SelectItem>
                        <SelectItem value="Horlogeries">Horlogeries</SelectItem>
                        <SelectItem value="Antiquités">Antiquités</SelectItem>
                        <SelectItem value="Automobiles">Automobiles</SelectItem>
                        <SelectItem value="Bijoux">Bijoux</SelectItem>
                        <SelectItem value="Divers">Divers</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Prix de départ (€)</Label>
                  <Input type="number" placeholder="Ex: 5000" value={newLot.startPrice} onChange={e => setNewLot({...newLot, startPrice: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Est. Basse (€)</Label>
                    <Input type="number" placeholder="Ex: 6000" value={newLot.estLow} onChange={e => setNewLot({...newLot, estLow: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Est. Haute (€)</Label>
                    <Input type="number" placeholder="Ex: 8000" value={newLot.estHigh} onChange={e => setNewLot({...newLot, estHigh: e.target.value})} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>État du bien</Label>
                  <Input placeholder="Ex: Excellent état, avec boîte d'origine" value={newLot.condition} onChange={e => setNewLot({...newLot, condition: e.target.value})} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isUploading}>Annuler</Button>
              <Button type="submit" onClick={handleSaveLot} disabled={isUploading}>
                {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {newLot.id ? "Enregistrer" : "Sauvegarder le lot"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Dialog open={!!lotToDelete} onOpenChange={(open) => !open && setLotToDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer ce lot ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLotToDelete(null)}>Annuler</Button>
            <Button variant="destructive" onClick={() => {
              if (lotToDelete) {
                deleteLot(lotToDelete);
                setLotToDelete(null);
              }
            }}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-4">
        {saleLots.map((lot, index) => (
          <Card key={lot.id} className="bg-card border-border/50 shadow-sm overflow-hidden group">
            <CardContent className="p-0 flex items-stretch">
              {/* Drag Handle (Simulé via flèche pour simplifier sans dnd kit) */}
              <div 
                className="w-12 bg-muted/30 flex items-center justify-center border-r border-border/50 cursor-grab hover:bg-muted/50 transition-colors"
                onClick={() => moveLotUp(index)}
                title="Cliquez pour monter (simulation drag)"
              >
                <GripVertical className="w-5 h-5 text-muted-foreground" />
              </div>
              
              {/* Lot Image */}
              <div 
                className="w-32 sm:w-48 bg-cover bg-center shrink-0 border-r border-border/50"
                style={{ backgroundImage: `url('${lot.image}')` }}
              />
              
              {/* Lot Content */}
              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge variant="outline" className="mb-2 text-xs font-mono">{lot.ref}</Badge>
                      <h3 className="font-heading font-bold text-lg text-foreground">{lot.title}</h3>
                      <p className="text-sm text-muted-foreground">{lot.category} • {lot.condition}</p>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditLot(lot)}>
                        <Edit className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setLotToDelete(lot.id)}>
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border/50">
                  <div>
                    <div className="text-xs text-muted-foreground">Prix de départ</div>
                    <div className="font-semibold text-foreground">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(lot.startPrice)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Est. Basse</div>
                    <div className="font-medium text-muted-foreground">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(lot.estLow)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Est. Haute</div>
                    <div className="font-medium text-muted-foreground">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(lot.estHigh)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

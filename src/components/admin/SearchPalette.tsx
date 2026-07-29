"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useAdmin } from "@/context/AdminContext";
import { Calendar, User, Gavel } from "lucide-react";

export function SearchPalette({ open, setOpen }: { open: boolean, setOpen: (open: boolean) => void }) {
  const { sales } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(true);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [setOpen]);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <Command>
        <CommandInput placeholder="Tapez une commande ou recherchez..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          <CommandGroup heading="Ventes">
            {sales.map((sale) => (
              <CommandItem
                key={sale.id}
                value={sale.title}
                onSelect={() => runCommand(() => router.push(`/admin/ventes/${sale.id}/lots`))}
                className="cursor-pointer"
              >
                <Calendar className="mr-2 h-4 w-4" />
                <span>{sale.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Accès rapides">
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/ventes/creer"))} className="cursor-pointer">
              <Gavel className="mr-2 h-4 w-4" />
              <span>Créer une nouvelle vente</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push("/admin/inscriptions"))} className="cursor-pointer">
              <User className="mr-2 h-4 w-4" />
              <span>Gérer les inscriptions</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

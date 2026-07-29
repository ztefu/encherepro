

export default function MentionsLegalesPage() {
  return (
    <div className="container max-w-4xl mx-auto pt-32 pb-12 px-4">

      
      <h1 className="font-heading text-4xl font-bold tracking-tight mb-8">Mentions Légales</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Dernière mise à jour : 27 Juillet 2026</p>
        
        <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">1. Éditeur du site</h2>
        <p>
          Le site <strong>EnchèrePro</strong> est édité par la société (Nom de la société), 
          société par actions simplifiée (SAS) au capital de XXX €, 
          immatriculée au Registre du Commerce et des Sociétés sous le numéro XXX XXX XXX.
        </p>
        <p>
          <strong>Siège social :</strong> 12 Place Vendôme, 75001 Paris, France<br />
          <strong>Email :</strong> contact@encherepro.fr<br />
          <strong>Téléphone :</strong> +33 (0)1 23 45 67 89
        </p>

        <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">2. Directeur de la publication</h2>
        <p>
          Le directeur de la publication est Monsieur / Madame [Nom du Directeur], en qualité de [Fonction].
        </p>

        <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">3. Hébergement</h2>
        <p>
          Ce site est hébergé par Vercel Inc.<br />
          440 N Barranca Ave #4133<br />
          Covina, CA 91723<br />
          États-Unis
        </p>

        <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">4. Propriété intellectuelle</h2>
        <p>
          L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. 
          Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
        </p>

        <p className="mt-12 text-sm text-muted-foreground">
          Ceci est une page de démonstration. Les mentions légales réelles devront être complétées avec vos véritables informations d'entreprise.
        </p>
      </div>
    </div>
  );
}

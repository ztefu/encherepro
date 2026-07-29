

export default function PrivacyPolicyPage() {
  return (
    <div className="container max-w-4xl mx-auto pt-32 pb-12 px-4">

      
      <h1 className="font-heading text-4xl font-bold tracking-tight mb-8">Politique de Confidentialité</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
        <p className="text-muted-foreground">Dernière mise à jour : 27 Juillet 2026</p>
        
        <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">1. Collecte des données</h2>
        <p>
          Dans le cadre de votre inscription à nos ventes aux enchères, nous collectons les données personnelles suivantes : nom, prénom, adresse email, numéro de téléphone, et adresse postale. 
          Ces données sont strictement nécessaires au traitement de votre inscription et à l'organisation de la vente.
        </p>

        <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">2. Utilisation des données</h2>
        <p>
          Vos données sont utilisées exclusivement pour :
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>La gestion de votre participation à la vente (envoi des accès)</li>
          <li>Le traitement de votre paiement (simulation)</li>
          <li>La communication d'informations importantes concernant l'événement</li>
        </ul>

        <h2 className="font-heading text-2xl font-semibold mt-8 mb-4">3. Protection et Sécurité</h2>
        <p>
          Nous mettons en œuvre toutes les mesures techniques et organisationnelles nécessaires pour garantir la sécurité de vos données personnelles et empêcher toute perte, mauvaise utilisation ou accès non autorisé.
        </p>

        <p className="mt-12 text-sm text-muted-foreground">
          Ceci est une page de démonstration. La politique de confidentialité réelle devra être rédigée par un professionnel compétent (conformité RGPD, etc.).
        </p>
      </div>
    </div>
  );
}

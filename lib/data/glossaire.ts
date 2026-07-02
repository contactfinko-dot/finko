export type Cat = 'invest' | 'bourse' | 'epargne' | 'fiscalite' | 'credit' | 'crypto'

export type Term = {
  id: string
  letter: string
  name: string
  cat: Cat
  def: string
  also?: { label: string; href: string }[]
}

export const CAT_META: Record<Cat, { label: string; color: string; bg: string; dot: string }> = {
  invest:    { label: 'Investissement', color: '#0F6E56', bg: '#E1F5EE', dot: '#1D9E75' },
  bourse:    { label: 'Bourse',         color: '#185FA5', bg: '#E6F1FB', dot: '#185FA5' },
  epargne:   { label: 'Épargne',        color: '#854F0B', bg: '#FAEEDA', dot: '#854F0B' },
  fiscalite: { label: 'Fiscalité',      color: '#3C3489', bg: '#EEEDFE', dot: '#3C3489' },
  credit:    { label: 'Crédit',         color: '#993C1D', bg: '#FAECE7', dot: '#993C1D' },
  crypto:    { label: 'Crypto',         color: '#333',    bg: '#F0F0F0', dot: '#555'    },
}

export const TERMS: Term[] = [
  // A
  { id: 'action',              letter: 'A', name: 'Action',              cat: 'invest',    def: "Titre de propriété représentant une fraction du capital d'une entreprise. Détenir une action donne droit à une part des bénéfices (dividendes) et à un droit de vote en assemblée générale." },
  { id: 'assurance-vie',       letter: 'A', name: 'Assurance-vie',       cat: 'epargne',   def: "Contrat d'épargne à long terme qui permet de se constituer un capital ou de préparer sa retraite, avec une fiscalité avantageuse après 8 ans de détention.", also: [{ label: 'Fonds euros', href: '#fonds-euros' }, { label: 'Unité de compte', href: '#unite-de-compte' }] },
  { id: 'analyse-fondamentale',letter: 'A', name: 'Analyse fondamentale',cat: 'bourse',    def: "Méthode d'évaluation d'un actif basée sur les données économiques réelles (résultats, bilan, secteur). Elle vise à déterminer la valeur intrinsèque d'une entreprise.", also: [{ label: 'Analyse technique', href: '#analyse-technique' }] },
  { id: 'analyse-technique',   letter: 'A', name: 'Analyse technique',   cat: 'bourse',    def: "Méthode d'analyse boursière basée sur l'étude des graphiques de prix et des volumes échangés pour anticiper les mouvements futurs d'un actif.", also: [{ label: 'Analyse fondamentale', href: '#analyse-fondamentale' }] },
  { id: 'amortissement',       letter: 'A', name: 'Amortissement',       cat: 'credit',    def: "Remboursement progressif du capital emprunté. Dans un prêt immobilier classique, chaque mensualité comporte une part d'intérêts et une part d'amortissement du capital." },
  // B
  { id: 'blockchain',          letter: 'B', name: 'Blockchain',          cat: 'crypto',    def: 'Base de données décentralisée et immuable fonctionnant comme un registre partagé de transactions. Chaque « bloc » contient un ensemble de transactions validées et est lié au précédent.', also: [{ label: 'Bitcoin', href: '#bitcoin' }, { label: 'Staking', href: '#staking' }] },
  { id: 'bitcoin',             letter: 'B', name: 'Bitcoin (BTC)',        cat: 'crypto',    def: "Première cryptomonnaie décentralisée, créée en 2009 par Satoshi Nakamoto. Son offre est limitée à 21 millions d'unités, ce qui lui confère une rareté programmée." },
  { id: 'bon-du-tresor',       letter: 'B', name: 'Bon du Trésor',       cat: 'epargne',   def: "Titre de dette à court terme émis par l'État. Considéré comme un placement sans risque, il offre un rendement modeste en échange d'une sécurité maximale.", also: [{ label: 'Obligation', href: '#obligation' }] },
  // C
  { id: 'cac-40',              letter: 'C', name: 'CAC 40',              cat: 'bourse',    def: "Principal indice boursier français, composé des 40 plus grandes entreprises cotées à Paris par capitalisation. Il sert de baromètre de l'économie française.", also: [{ label: 'Indice boursier', href: '#indice' }, { label: 'ETF', href: '#etf' }] },
  { id: 'capitalisation',      letter: 'C', name: 'Capitalisation boursière', cat: 'invest', def: "Valeur totale d'une entreprise en bourse, calculée en multipliant le prix d'une action par le nombre total d'actions en circulation." },
  { id: 'credit-immobilier',   letter: 'C', name: 'Crédit immobilier',   cat: 'credit',    def: "Prêt bancaire destiné à financer l'achat d'un bien immobilier. Il est remboursé par mensualités sur une durée pouvant aller jusqu'à 25 ans.", also: [{ label: 'TAEG', href: '#taeg' }, { label: 'Amortissement', href: '#amortissement' }] },
  { id: 'correlation',         letter: 'C', name: 'Corrélation',         cat: 'invest',    def: "Mesure statistique de la relation entre deux actifs. Une corrélation négative signifie qu'ils évoluent en sens contraire, ce qui est utile pour diversifier un portefeuille.", also: [{ label: 'Diversification', href: '#diversification' }] },
  { id: 'cryptomonnaie',       letter: 'C', name: 'Cryptomonnaie',       cat: 'crypto',    def: "Monnaie numérique décentralisée utilisant la cryptographie pour sécuriser les transactions et contrôler la création de nouvelles unités.", also: [{ label: 'Bitcoin', href: '#bitcoin' }, { label: 'Blockchain', href: '#blockchain' }] },
  // D
  { id: 'dividende',           letter: 'D', name: 'Dividende',           cat: 'invest',    def: "Part des bénéfices distribuée aux actionnaires par une entreprise. Le dividende peut être versé en numéraire (cash) ou en actions supplémentaires.", also: [{ label: 'Action', href: '#action' }, { label: 'Rendement', href: '#rendement' }] },
  { id: 'diversification',     letter: 'D', name: 'Diversification',     cat: 'invest',    def: "Stratégie consistant à répartir ses investissements sur différents actifs, secteurs ou zones géographiques pour réduire le risque global du portefeuille." },
  { id: 'drawdown',            letter: 'D', name: 'Drawdown',            cat: 'bourse',    def: "Baisse maximale d'un actif ou d'un portefeuille depuis son plus haut historique jusqu'à son plus bas. Indicateur clé du risque d'un investissement." },
  { id: 'dette',               letter: 'D', name: 'Dette / Endettement', cat: 'credit',    def: "Somme d'argent empruntée à rembourser, augmentée des intérêts. Le taux d'endettement mesure la part des revenus consacrée au remboursement des dettes (limite réglementaire : 35 %)." },
  // E
  { id: 'etf',                 letter: 'E', name: 'ETF (Exchange-Traded Fund)', cat: 'invest', def: "Fonds indiciel coté en bourse qui réplique la performance d'un indice (ex : CAC 40, S&P 500). Peu coûteux et très diversifié, c'est l'un des outils préférés des investisseurs passifs.", also: [{ label: 'Indice boursier', href: '#indice' }, { label: 'PEA', href: '#pea' }] },
  { id: 'effet-levier',        letter: 'E', name: 'Effet de levier',     cat: 'bourse',    def: "Technique consistant à emprunter des fonds pour amplifier la mise de départ. L'effet de levier augmente les gains potentiels mais aussi les pertes." },
  { id: 'epargne-retraite',    letter: 'E', name: 'Épargne retraite (PER)', cat: 'epargne', def: "Plan d'Épargne Retraite permettant de se constituer un capital pour la retraite, avec une déduction fiscale des versements du revenu imposable.", also: [{ label: 'Fiscalité', href: '#fiscalite' }, { label: 'PFU', href: '#pfu' }] },
  // F
  { id: 'fonds-euros',         letter: 'F', name: 'Fonds euros',         cat: 'epargne',   def: "Support d'investissement en assurance-vie dont le capital est garanti. Composé principalement d'obligations d'État, son rendement est modéré mais sécurisé.", also: [{ label: 'Assurance-vie', href: '#assurance-vie' }, { label: 'Unité de compte', href: '#unite-de-compte' }] },
  { id: 'flat-tax',            letter: 'F', name: 'Flat tax (PFU)',      cat: 'fiscalite', def: "Prélèvement Forfaitaire Unique de 30 % (12,8 % d'IR + 17,2 % de prélèvements sociaux) appliqué aux revenus du capital : dividendes, intérêts, plus-values.", also: [{ label: 'PEA', href: '#pea' }, { label: 'Dividende', href: '#dividende' }] },
  // I
  { id: 'indice',              letter: 'I', name: 'Indice boursier',     cat: 'bourse',    def: "Indicateur statistique mesurant l'évolution d'un panier d'actions représentatif d'un marché ou d'un secteur. Les plus connus : CAC 40, S&P 500, MSCI World.", also: [{ label: 'ETF', href: '#etf' }, { label: 'CAC 40', href: '#cac-40' }] },
  { id: 'inflation',           letter: 'I', name: 'Inflation',           cat: 'bourse',    def: "Hausse généralisée et durable des prix des biens et services, qui réduit le pouvoir d'achat de la monnaie. Mesurée par l'IPC (Indice des Prix à la Consommation)." },
  { id: 'interet',             letter: 'I', name: 'Intérêts composés',   cat: 'credit',    def: "Mécanisme par lequel les intérêts générés s'ajoutent au capital et produisent eux-mêmes des intérêts. C'est l'un des principes les plus puissants en finance sur le long terme." },
  // L
  { id: 'livret-a',            letter: 'L', name: 'Livret A',            cat: 'epargne',   def: "Produit d'épargne réglementé, exonéré d'impôts et de prélèvements sociaux. Plafond de 22 950 €, taux fixé par l'État. Idéal pour l'épargne de précaution." },
  { id: 'liquidite',           letter: 'L', name: 'Liquidité',           cat: 'bourse',    def: "Capacité à convertir rapidement un actif en cash sans en affecter significativement le prix. Un actif très liquide (ex : action du CAC 40) se vend immédiatement au prix du marché." },
  { id: 'ldds',                letter: 'L', name: 'LDDS',                cat: 'epargne',   def: "Livret de Développement Durable et Solidaire. Similaire au Livret A (même taux), plafonné à 12 000 €. Les fonds financent des projets d'économie sociale et environnementale.", also: [{ label: 'Livret A', href: '#livret-a' }] },
  // M
  { id: 'moins-value',         letter: 'M', name: 'Moins-value / Plus-value', cat: 'invest', def: "Différence entre le prix de vente et le prix d'achat d'un actif. Si positive : plus-value (gain) ; si négative : moins-value (perte). Fiscalisée au PFU de 30 %.", also: [{ label: 'Flat tax', href: '#flat-tax' }, { label: 'PEA', href: '#pea' }] },
  { id: 'market-cap',          letter: 'M', name: 'Market cap',          cat: 'bourse',    def: "Voir Capitalisation boursière. Terme anglais couramment utilisé pour désigner la valeur totale d'une entreprise en bourse." },
  // O
  { id: 'obligation',          letter: 'O', name: 'Obligation',          cat: 'invest',    def: "Titre de dette émis par une entreprise ou un État pour se financer. L'investisseur prête de l'argent et reçoit des intérêts (coupons) réguliers jusqu'au remboursement.", also: [{ label: 'Bon du Trésor', href: '#bon-du-tresor' }] },
  { id: 'ordre-bourse',        letter: 'O', name: 'Ordre de bourse',     cat: 'bourse',    def: "Instruction donnée à un courtier pour acheter ou vendre un actif. Les principaux types : ordre au marché (exécution immédiate) et ordre à cours limité (exécution à un prix fixé)." },
  // P
  { id: 'pea',                 letter: 'P', name: "PEA (Plan d'Épargne en Actions)", cat: 'fiscalite', def: "Enveloppe fiscale permettant d'investir en actions européennes avec une exonération d'impôt sur les plus-values après 5 ans (seuls les prélèvements sociaux de 17,2 % restent dus). Plafond : 150 000 €.", also: [{ label: 'ETF', href: '#etf' }, { label: 'Flat tax', href: '#flat-tax' }] },
  { id: 'pfu',                 letter: 'P', name: 'PFU',                 cat: 'fiscalite', def: "Prélèvement Forfaitaire Unique, alias flat tax. Taux global de 30 % sur les revenus du capital (dividendes, intérêts, plus-values mobilières)." },
  { id: 'portefeuille',        letter: 'P', name: 'Portefeuille',        cat: 'invest',    def: "Ensemble des actifs financiers détenus par un investisseur (actions, obligations, liquidités, ETF…). Sa composition reflète le profil de risque et les objectifs de l'investisseur.", also: [{ label: 'Diversification', href: '#diversification' }] },
  { id: 'pel',                 letter: 'P', name: 'PEL (Plan Épargne Logement)', cat: 'epargne', def: "Plan d'épargne réglementé permettant de bénéficier d'un prêt immobilier à taux préférentiel. Taux garanti à l'ouverture, plafond de 61 200 €, durée minimale de 4 ans.", also: [{ label: 'Crédit immobilier', href: '#credit-immobilier' }] },
  // R
  { id: 'rendement',           letter: 'R', name: 'Rendement',           cat: 'invest',    def: "Gain généré par un investissement, exprimé en pourcentage du capital investi sur une période donnée. Il peut inclure les revenus (dividendes, loyers) et la plus-value.", also: [{ label: 'Dividende', href: '#dividende' }, { label: 'Risque', href: '#risque' }] },
  { id: 'risque',              letter: 'R', name: 'Risque',              cat: 'invest',    def: "Probabilité de perdre tout ou partie du capital investi. En finance, risque et rendement sont liés : plus un actif est risqué, plus son rendement potentiel est élevé.", also: [{ label: 'Volatilité', href: '#volatilite' }, { label: 'Diversification', href: '#diversification' }] },
  { id: 'reit',                letter: 'R', name: 'REIT / SCPI',         cat: 'invest',    def: "Société Civile de Placement Immobilier (SCPI) : fonds permettant d'investir dans l'immobilier locatif collectif à partir de quelques centaines d'euros. Distribue des loyers réguliers." },
  // S
  { id: 'staking',             letter: 'S', name: 'Staking',             cat: 'crypto',    def: "Mécanisme permettant de bloquer des cryptomonnaies dans un protocole pour valider des transactions et recevoir des récompenses, similaire à un dividende.", also: [{ label: 'Blockchain', href: '#blockchain' }] },
  { id: 'spread',              letter: 'S', name: 'Spread',              cat: 'bourse',    def: "Écart entre le prix d'achat (ask) et le prix de vente (bid) d'un actif. Un spread étroit indique un marché liquide. Il représente un coût implicite pour l'investisseur.", also: [{ label: 'Liquidité', href: '#liquidite' }] },
  { id: 'sp500',               letter: 'S', name: 'S&P 500',             cat: 'invest',    def: "Indice regroupant les 500 plus grandes entreprises américaines cotées. Considéré comme la référence mondiale de la performance boursière à long terme.", also: [{ label: 'Indice boursier', href: '#indice' }, { label: 'ETF', href: '#etf' }] },
  // T
  { id: 'taeg',                letter: 'T', name: 'TAEG',                cat: 'credit',    def: "Taux Annuel Effectif Global. Inclut le taux d'intérêt, les frais de dossier, l'assurance et tous les frais obligatoires d'un crédit. Seul indicateur à comparer entre offres de prêt.", also: [{ label: 'Crédit immobilier', href: '#credit-immobilier' }] },
  { id: 'tracker',             letter: 'T', name: 'Tracker',             cat: 'invest',    def: "Autre nom pour un ETF. Fonds coté en bourse qui « traque » la performance d'un indice de référence avec des frais de gestion très réduits (souvent inférieurs à 0,3 % par an).", also: [{ label: 'ETF', href: '#etf' }] },
  { id: 'taux-imposition',     letter: 'T', name: "Taux marginal d'imposition (TMI)", cat: 'fiscalite', def: "Taux appliqué à la dernière tranche de revenus. En France, il varie de 0 % à 45 %. Connaître son TMI est essentiel pour choisir entre flat tax et barème progressif.", also: [{ label: 'Flat tax', href: '#flat-tax' }, { label: 'PFU', href: '#pfu' }] },
  // V
  { id: 'volatilite',          letter: 'V', name: 'Volatilité',          cat: 'bourse',    def: "Mesure de l'amplitude des variations de prix d'un actif sur une période donnée. Un actif très volatile présente des variations fortes — à la hausse comme à la baisse.", also: [{ label: 'Risque', href: '#risque' }, { label: 'Drawdown', href: '#drawdown' }] },
  { id: 'unite-de-compte',     letter: 'V', name: 'Unité de compte (UC)',cat: 'epargne',   def: "Support d'investissement en assurance-vie dont la valeur fluctue selon les marchés financiers (actions, obligations, immobilier). Capital non garanti, mais potentiel de rendement plus élevé.", also: [{ label: 'Assurance-vie', href: '#assurance-vie' }, { label: 'Fonds euros', href: '#fonds-euros' }] },
]

export const LETTERS = [...new Set(TERMS.map(t => t.letter))].sort()

export const LETTER_COUNTS = Object.fromEntries(
  LETTERS.map(l => [l, TERMS.filter(t => t.letter === l).length])
)


import { World, Faction, Artefact, Creature, Quest, Ally, NarrativeArc } from './types';

export const FACTIONS: Faction[] = [
  {
    id: 'guardians',
    name: 'L’ORDRE DES GARDIENS DU TEMPS',
    nature: 'Caste d’êtres forgés dans la chronomatière par les Architectes Stellaires.',
    ideology: 'Préserver l’équilibre du Temps, protéger les lignes temporelles, empêcher l’Entropie de dévorer le multivers.',
    organisation: 'Le Gardien Absolu (Onyzuka), Gardiens Primaires (Disparus), Gardiens Mineurs (Échos).',
    symbols: ['◯', '🪶', '🌀'],
    relations: 'Hostiles aux Enfants de l’Entropie. Méfiants envers les mortels.',
    lore: 'Forgés dans les feux de Virellion, ils sont le dernier rempart contre le néant.'
  },
  {
    id: 'entropy_children',
    name: 'LES ENFANTS DE L’ENTROPIE',
    nature: 'Créatures nées de la singularité entropique.',
    ideology: 'Tout doit retourner au néant. Le Temps est une anomalie.',
    organisation: 'Seraphon (Avatar), Fractales Vivantes, Ombres Chroniques.',
    symbols: ['⚡', '⚫', '❄️'],
    relations: 'Ennemis jurés des Gardiens. Dévorent les mondes instables.',
    lore: 'Ils ne cherchent pas à régner, mais à effacer l\'existence même.'
  },
  {
    id: 'temporal_echoes',
    name: 'LES ÉCHOS TEMPORELS',
    nature: 'Fragments d’anciens Gardiens, coincés entre deux réalités.',
    ideology: 'Variable selon leur corruption (Purs, Instables, Corrompus).',
    organisation: 'Silhouettes errantes dans les rifts temporels.',
    symbols: ['🌫️', '⏳', '⛓️'],
    relations: 'Alliés ou obstacles selon leur état de résonance.',
    lore: 'Ce sont les fantômes de ceux qui ont échoué avant vous.'
  },
  {
    id: 'stellar_architects',
    name: 'LES ARCHITECTES STELLAIRES',
    nature: 'Civilisation disparue, créatrice des Gardiens.',
    ideology: 'Le Temps doit être structuré. Le chaos doit être contenu.',
    organisation: 'Hiérarchie géométrique parfaite (Disparue).',
    symbols: ['⬢', '☉', '♾️'],
    relations: 'Vénérés comme des créateurs. Leurs plans guident Onyzuka.',
    lore: 'Ils ont laissé le Codex comme guide avant de transcender la matière.'
  }
];

export const ARTEFACTS: Artefact[] = [
  {
    id: 'codex',
    name: 'LE CODEX DES ÂGES',
    nature: 'Livre cosmique vivant, contenant les lois du Temps.',
    functions: ['Stabilise les lignes temporelles', 'Archive les civilisations', 'Permet la création de Gardiens'],
    powers: 'Source de pouvoir ultime, capable de réécrire les cycles de l\'Entropie.',
    icon: '📜',
    lore: 'Le Nexus de toute connaissance, dont les pages respirent au rythme des éons de chronomatière.'
  },
  {
    id: 'rings',
    name: 'LES ANNEAUX DU TEMPS',
    nature: 'Portails géants, conscients, mi‑métal mi‑énergie.',
    functions: ['Voyage temporel', 'Communication entre Gardiens', 'Stockage de mémoire'],
    powers: 'Permet une synchronisation instantanée entre les mondes du Codex.',
    icon: '🌀',
    lore: 'Des conduits circulaires reliant les lointaines nébuleuses aux forges centrales des Architectes.'
  },
  {
    id: 'blades',
    name: 'LES LAMES DU TEMPS',
    nature: 'Rubans métalliques d’Onyzuka, capables de se transformer.',
    functions: ['Lames tranchantes', 'Fouets énergétiques', 'Boucliers', 'Propulseurs', 'Analyseurs'],
    powers: 'Extensions vivantes de l\'armure de combat, adaptables à toute menace.',
    icon: '🗡️',
    lore: 'Lames mutables forgées dans le néant absolu pour trancher les fils de l\'entropie rampante.'
  },
  {
    id: 'heart',
    name: 'LE CŒUR ENTROPIQUE',
    nature: 'Fragment vivant de la singularité.',
    functions: ['Dévore la chronomatière', 'Corrompt les Gardiens', 'Déforme les lignes temporelles'],
    powers: 'L\'antithèse de l\'ordre, cherchant à dissoudre toute structure.',
    icon: '🔥',
    lore: 'Un battement de chaos pur qui menace de réduire le Codex et ses mondes en poussière stellaire.'
  },
  {
    id: 'forge',
    name: 'LA FORGE VIVANTE',
    nature: 'Lieu où les Gardiens sont créés.',
    functions: ['Manipule la chronomatière', 'Imprime les mémoires', 'Forge les armures'],
    powers: 'Le berceau de la volonté des Architectes Stellaires.',
    icon: '⚙️',
    lore: 'L\'athanor cosmique où la volonté pure rencontre la chronomatière malléable pour enfanter des héros.'
  }
];

export const CREATURES: Creature[] = [
  {
    id: 'spirales_vivantes',
    name: 'LES SPIRALES VIVANTES',
    nature: 'Rubans d’énergie sensibles.',
    behavior: 'Curieux, pacifiques, attirés par Onyzuka.',
    worldId: 'virellion',
    icon: '🌀',
    lore: 'Nées du premier soupir des Architectes, ces filaments de lumière liquide tissent la reality entre les nébuleuses indigo de Virellion.'
  },
  {
    id: 'chromatic_wisps',
    name: 'LES FEUX-FOLLETS CHROMATIQUES',
    nature: 'Spectres de lumière réfractée.',
    behavior: 'Hypnotiques, flottent près des cristaux d’Iridia.',
    worldId: 'iridia',
    icon: '✨',
    lore: 'Petites poches de conscience nées de la décomposition spectrale. Ils portent en eux les couleurs des souvenirs des mondes disparus, changeant de teinte selon les émotions de ceux qui les observent.'
  },
  {
    id: 'golems_chrono',
    name: 'LES GOLEMS DE CHRONOMATIÈRE',
    nature: 'Créatures forgées par les Architectes.',
    behavior: 'Protecteurs, agressifs envers les intrus.',
    worldId: 'kharon',
    icon: '🗿',
    lore: 'Massives sentinelles d\'obsidienne et d\'acier stellaire, ces golems ne sont pas de simples gardes mais la mémoire vivante des forges de Kharon.'
  },
  {
    id: 'gear_grinders',
    name: 'LES GRIGNOTEURS D’ENGRENAGES',
    nature: 'Parasites bio-mécaniques.',
    behavior: 'Scavengers, dévorent la rouille et l’entropie.',
    worldId: 'mechanus',
    icon: '⚙️',
    lore: 'Minuscules automates organiques qui se nourrissent des frottements entre les dimensions. Sans eux, les rouages de Mechanus se gripperaient sous le poids de la causalité accumulée.'
  },
  {
    id: 'leviathans_lumiere',
    name: 'LES LÉVIATHANS DE LUMIÈRE',
    nature: 'Immenses créatures océaniques d’énergie.',
    behavior: 'Pacifiques sauf si perturbés.',
    worldId: 'elyndra',
    icon: '🐋',
    lore: 'Majestueux gardiens des eaux d\'Aether, ces colosses de données liquides archivent les émotions de chaque civilisation disparue.'
  },
  {
    id: 'root_nodes',
    name: 'LES NODES-RACINES',
    nature: 'Faisceaux neuronaux végétaux.',
    behavior: 'Stationnaires, transmettent des impulsions.',
    worldId: 'verdant-core',
    icon: '🌱',
    lore: 'Le système nerveux de la jungle bio-mécanique. Chaque node-racine est un serveur biologique stockant les données de croissance des lignes temporelles de Verdant Core.'
  },
  {
    id: 'ombres_chroniques',
    name: 'LES OMBRES CHRONIQUES',
    nature: 'Entités absorbant la lumière.',
    behavior: 'Chasse en meute, silencieuse.',
    worldId: 'noxaris',
    icon: '👥',
    lore: 'Ces cicatrices mouvantes sur la réalité représentent l\'absence même de Temps. Nées là où Seraphon a effacé l\'existence.'
  },
  {
    id: 'void_stalkers',
    name: 'LES TRAQUEURS DU VIDE',
    nature: 'Antimatière consciente.',
    behavior: 'Furtifs, absorbent la chronomatière.',
    worldId: 'noxaris',
    icon: '👁️',
    lore: 'Les yeux de Seraphon dans les ténèbres. Ils ne voient pas la lumière, mais les vibrations de la volonté, traquant Onyzuka par la résonance de son armure de Gardien.'
  },
  {
    id: 'vector_drones',
    name: 'LES DRONES VECTORIELS',
    nature: 'Logique géométrique pure.',
    behavior: 'Patrouilles prévisibles mais implacables.',
    worldId: 'tensor-reach',
    icon: '⬢',
    lore: 'Extensions du processeur planétaire de Tensor Reach. Ils sont la manifestation physique des équations qui maintiennent la gravité stable dans cet espace de calcul pur.'
  },
  {
    id: 'solariens',
    name: 'LES SOLARIENS',
    nature: 'Êtres humanoïdes faits de lumière.',
    behavior: 'Sages, mais méfiants envers les Gardiens.',
    worldId: 'solara-prime',
    icon: '☀️',
    lore: 'Ayant transcendé le besoin d\'une forme physique, les Solariens vivent en synchronie totale avec le soleil artificiel de Solara Prime.'
  },
  {
    id: 'helios_sentries',
    name: 'LES SENTINELLES D’HELIOS',
    nature: 'Lumière solaire solidifiée.',
    behavior: 'Immobiles jusqu’au contact, brûlants.',
    worldId: 'solara-prime',
    icon: '🔥',
    lore: 'Des fragments de flammes éternelles mis en cage dans du verre de cristal. Ils gardent les archives stellaires avec une ferveur qui ne s’éteint jamais.'
  },
  {
    id: 'fractales_vivantes',
    name: 'LES FRACTALES VIVANTES',
    nature: 'Créatures géométriques auto‑répliquantes.',
    behavior: 'Imprévisibles, parfois hostiles.',
    worldId: 'aetheryon',
    icon: '⬢',
    lore: 'Paradoxes biologiques nés du Labyrinthe, ces créatures représentent toutes les itérations possibles d\'un même organisme.'
  }
];

export const ALLIES: Ally[] = [
  { id: 'kalder', name: 'Kalder', role: 'Forgeron de l\'Âme', icon: '🔧', lore: 'Répare l\'armure d\'Onyzuka with devotion.', outcome: 'Meurt en héros pour sceller the Forge.' },
  { id: 'elyia', name: 'Elya', role: 'Guide Spirituelle', icon: '✨', lore: 'Offre des visions de futurs possibles.', outcome: 'Devient la nouvelle archiviste du Codex.' },
  { id: 'nox', name: 'Nox', role: 'Traître Repenti', icon: '🎭', lore: 'Ancien serviteur de l\'Entropie cherchant la rédemption.', outcome: 'Sacrifice final pour protéger Onyzuka.' },
  { id: 'solarion', name: 'Solarion', role: 'Rival Solaire', icon: '⚔️', lore: 'Guerrier fier de Solara Prime.', outcome: 'Offre la Couronne après un duel mémorable.' },
  { id: 'aeth', name: 'Aeth', role: 'Logique Pure', icon: '🧩', lore: 'Entité mathématique du Labyrinthe.', outcome: 'Fusion temporaire pour résoudre le Paradoxe Final.' },
  { id: 'lyria', name: 'Lyria', role: 'L\'Étincelle', icon: '💖', lore: 'Première humaine rencontrée par Onyzuka.', outcome: 'Lui enseigne l\'importance de la transmission.' }
];

export const QUESTS: Quest[] = [
  { id: 'q1', title: 'Spirale de l’Éveil', worldId: 'virellion', description: 'Premier affrontement contre Seraphon.', objective: 'Récupérer le premier fragment.', outcome: 'L’éveil d’Onyzuka est complet.' },
  { id: 'q2', title: 'La Forge du Passé', worldId: 'kharon', description: 'Réparation des rubans métalliques.', objective: 'Découvrir le secret de Seraphon.', outcome: 'L’Arsenal est stabilisé.' },
  { id: 'q3', title: 'L’Océan des Visions', worldId: 'elyndra', description: 'Épreuve spirituelle dans les eaux d’Aether.', objective: 'Obtenir la Lame d’Elyndra.', outcome: 'La vision du futur est clarifiée.' },
  { id: 'q4', title: 'Le Monde Sans Lumière', worldId: 'noxaris', description: 'Traverser l’obscurité totale.', objective: 'Gérer la trahison de Nox.', outcome: 'Le fragment de l’Ombre est sécurisé.' },
  { id: 'q5', title: 'Le Duel Solaire', worldId: 'solara-prime', description: 'Combat rituel pour la souveraineté.', objective: 'Gagner la Couronne de Solara.', outcome: 'Solarion reconnaît votre authority.' },
  { id: 'q6', title: 'Le Labyrinthe Fractal', worldId: 'aetheryon', description: 'Épreuve de logique pure.', objective: 'Extraire le Fractal d’Aetheryon.', outcome: 'La géométrie du Temps est comprise.' },
  { id: 'q7', title: 'Le Jugement Final', worldId: 'entropy-core', description: 'Bataille finale au cœur du néant.', objective: 'Vaincre Seraphon définitivement.', outcome: 'Restauration complète du Codex.' }
];

export const NARRATIVE_ARCS: NarrativeArc[] = [
  { id: 'main', title: 'La Reconstruction du Codex', stages: ['Éveil', 'Codex Brisé', 'Voyage des 7 Mondes', 'Confrontation', 'Fusion', 'Renaissance'] },
  { id: 'villain', title: 'La Chute de Seraphon', stages: ['Corruption', 'Manipulation', 'Destruction', 'Absorption', 'Combat Final', 'Annihilation'] },
  { id: 'emotional', title: 'De la Solitude à la Transmission', stages: ['Isolement', 'Rencontre (Lyria)', 'Héritage', 'Doute', 'Acceptation', 'Nouvel Ordre'] },
  { id: 'cosmic', title: 'La Maladie du Temps', stages: ['Distorsions', 'Répétitions', 'Échos Instables', 'Effondrement', 'Guérison'] }
];

export const WORLDS: World[] = [
  {
    id: 'virellion',
    name: 'Virellion',
    description: 'Le berceau mystique d\'Onyzuka. Une nébuleuse vivante baignée de chronomatière éthérée.',
    palette: ['#4c1d95', '#0f766e', '#1e1b4b'],
    fragmentName: 'Spirale de Virellion',
    order: 1,
    biome: 'Nebula',
    category: 'NEBULA',
    variant: 'STABLE',
    status: 'unlocked',
    keyPoints: ['Anneau fracturé', 'Spirale de Virellion', 'Champ de particules sensibles'],
    ambiance: 'Mystique, organique, naissance du héros.',
    history: 'Née du premier soupir des Architectes, Virellion n\'est pas une simple planète mais une pépinière de probabilités cosmiques.'
  },
  {
    id: 'iridia',
    name: 'Iridia',
    description: 'Un prisme stellaire où la lumière se décompose en spectres solides.',
    palette: ['#d946ef', '#0ea5e9', '#ffffff'],
    fragmentName: 'Prisme d’Iridia',
    order: 2,
    biome: 'Liquid Light',
    category: 'WORLD',
    variant: 'STABLE',
    status: 'locked',
    keyPoints: ['Cascades chromatiques', 'Forêt de verre', 'Échos spectraux'],
    ambiance: 'Éclatante, fragile, kaléidoscopique.',
    history: 'Iridia servait de lentille focale pour les Architectes, purifiant la lumière brute des étoiles avant de l\'injecter dans les veines du Temps.'
  },
  {
    id: 'kharon',
    name: 'Kharon',
    description: 'Une forge astéroïdale titanesque vibrant du vacarme des marteaux des Architectes.',
    palette: ['#44403c', '#ef4444', '#78350f'],
    fragmentName: 'Forge de Kharon',
    order: 3,
    biome: 'Metallic Forge',
    category: 'WORLD',
    variant: 'STABLE',
    status: 'locked',
    keyPoints: ['Forge vivante', 'Archives des Architectes', 'Lave de chronomatière'],
    ambiance: 'Industrielle, sacrée, brutale.',
    history: 'Autrefois une naine blanche mourante, Kharon fut capturée pour devenir le cœur industriel de la création.'
  },
  {
    id: 'mechanus',
    name: 'Mechanus',
    description: 'Une grille infinie d’engrenages et de pistons à l’échelle planétaire.',
    palette: ['#334155', '#f97316', '#0f172a'],
    fragmentName: 'Pignon de l’Éternité',
    order: 4,
    biome: 'Metallic Forge',
    category: 'WORLD',
    variant: 'STABLE',
    status: 'locked',
    keyPoints: ['Horloge centrale', 'Vapeurs de cuivre', 'Labyrinthe de fer'],
    ambiance: 'Mécanique, implacable, rythmée.',
    history: 'Le régulateur de la causalité. Chaque rotation d’engrenage sur Mechanus définit une seconde dans la réalité matérielle.'
  },
  {
    id: 'elyndra',
    name: 'Elyndra',
    description: 'Une étendue infinie de lumière liquide, un océan onirique de sagesse oubliée.',
    palette: ['#0ea5e9', '#06b6d4', '#e0f2fe'],
    fragmentName: 'Lame d’Elyndra',
    order: 5,
    biome: 'Liquid Light',
    category: 'WORLD',
    variant: 'STABLE',
    status: 'locked',
    keyPoints: ['Temple submergé', 'Îles flottantes', 'Faune luminescente'],
    ambiance: 'Calme, hypnotique, spirituelle.',
    history: 'Ici, les mémoires se dissolvent dans l\'eau d\'Aether pour être purifiées par les courants du Temps.'
  },
  {
    id: 'verdant-core',
    name: 'Verdant Core',
    description: 'Une jungle bio-mécanique où la chronomatière a pris racine sous forme de lianes d\'énergie.',
    palette: ['#166534', '#14532d', '#86efac'],
    fragmentName: 'Graine de Vie Chronique',
    order: 6,
    biome: 'Nebula',
    category: 'WORLD',
    variant: 'STABLE',
    status: 'locked',
    keyPoints: ['Arbre des Âges', 'Pollution entropique', 'Lumière filtrée'],
    ambiance: 'Organique, étouffante, vibrante.',
    history: 'Une expérience de croissance temporelle où les Architectes ont tenté de faire "pousser" des lignes temporelles.'
  },
  {
    id: 'noxaris',
    name: 'Noxaris',
    description: 'Une prison de ténèbres absolues, un cimetière stellaire dévorant la lumière.',
    palette: ['#171717', '#450a0a', '#000000'],
    fragmentName: 'Obscurité de Noxaris',
    order: 7,
    biome: 'Total Darkness',
    category: 'WORLD',
    variant: 'FRACTURED',
    status: 'locked',
    keyPoints: ['Ombres chroniques', 'Structures fractales', 'Lumière absorbée'],
    ambiance: 'Oppressante, silencieuse, entropique.',
    history: 'Le Jardin des Murmures, corrompu par Seraphon en une encre de plomb étouffante.'
  },
  {
    id: 'tensor-reach',
    name: 'Tensor Reach',
    description: 'Un espace de calcul pur où la réalité est définie par des vecteurs de probabilité.',
    palette: ['#4f46e5', '#818cf8', '#312e81'],
    fragmentName: 'Vecteur de Tensor',
    order: 8,
    biome: 'Fractal Labyrinth',
    category: 'WORLD',
    variant: 'STABLE',
    status: 'locked',
    keyPoints: ['Grille logique', 'Données flottantes', 'Gravité scalaire'],
    ambiance: 'Froide, abstraite, mathématique.',
    history: 'Le processeur central de l\'Anneau des Âges, calculant les trajectoires des mondes pour éviter les collisions temporelles.'
  },
  {
    id: 'solara-prime',
    name: 'Solara Prime',
    description: 'Une citadelle de cristal et d\'or nichée au cœur d\'un astre artificiel majestueux.',
    palette: ['#facc15', '#ea580c', '#fbbf24'],
    fragmentName: 'Couronne de Solara',
    order: 9,
    biome: 'Radiant City',
    category: 'WORLD',
    variant: 'STABLE',
    status: 'locked',
    keyPoints: ['Archives stellaires', 'Tours dorées', 'Anneaux solaires'],
    ambiance: 'Majestueuse, divine, éclatante.',
    history: 'Le phare central diffusant le signal de Synchronie qui maintenait la stabilité du multivers.'
  },
  {
    id: 'aetheryon',
    name: 'Aetheryon',
    description: 'Un labyrinthe fractal où la géométrie se tord et se multiplie à l’infini.',
    palette: ['#d946ef', '#6366f1', '#a855f7'],
    fragmentName: 'Fractal d’Aetheryon',
    order: 10,
    biome: 'Fractal Labyrinth',
    category: 'WORLD',
    variant: 'RESTORED',
    status: 'locked',
    keyPoints: ['Labyrinthe vivant', 'Géométrie impossible', 'Gravité variable'],
    ambiance: 'Psychédélique, déroutante, mathématique.',
    history: 'Une prison logique conçue pour enfermer les paradoxes trop dangereux pour le reste de l’existence.'
  },
  {
    id: 'entropy-core',
    name: 'Cœur de l’Entropie',
    description: 'Le point d\'ancrage du Néant. Une singularité affamée marquant la fin des cycles.',
    palette: ['#000000', '#dc2626', '#1a1a1a'],
    fragmentName: 'Cœur Entropique',
    order: 11,
    biome: 'Singularity',
    category: 'CORE',
    variant: 'FRACTURED',
    status: 'locked',
    keyPoints: ['Seraphon', 'Entropie', 'Distorsions temporelles'],
    ambiance: 'Apocalyptique, instable, finale.',
    history: 'Le point de rupture final, là où la chronomatière se dissout pour retourner à l\'état de pur néant.'
  }
];


export enum GameState {
  TITLE = 'TITLE',
  WAKING = 'WAKING',
  MAP = 'MAP',
  WORLD = 'WORLD',
  CODEX = 'CODEX',
  CONFRONTATION = 'CONFRONTATION',
  ASCENSION = 'ASCENSION',
  BOSS = 'BOSS'
}

export enum CodexTab {
  ARCHIVES = 'ARCHIVES',
  UPGRADES = 'UPGRADES',
  ARSENAL = 'ARSENAL',
  LAWS = 'LAWS',
  FACTIONS = 'FACTIONS',
  ARTEFACTS = 'ARTEFACTS',
  CREATURES = 'CREATURES',
  QUESTS = 'QUESTS'
}

export type LocationCategory = 'NEBULA' | 'RING' | 'RUIN' | 'WORLD' | 'CORE';
export type LocationVariant = 'STABLE' | 'FRACTURED' | 'DORMANT' | 'CORRUPTED' | 'RESTORED';

export type RibbonMode = 'BLADE' | 'SHIELD' | 'PROPULSION' | 'ANALYSIS' | 'CAPTURE';

export interface Faction {
  id: string;
  name: string;
  nature: string;
  ideology: string;
  organisation: string;
  symbols: string[];
  relations: string;
  lore: string;
}

export interface Artefact {
  id: string;
  name: string;
  nature: string;
  functions: string[];
  powers?: string;
  origins?: string;
  icon: string;
  // Added lore property to ensure type compatibility when objects are mixed in collective arrays.
  lore: string;
}

export interface Creature {
  id: string;
  name: string;
  nature: string;
  behavior: string;
  worldId: string;
  icon: string;
  lore: string;
}

export interface World {
  id: string;
  name: string;
  description: string;
  palette: string[];
  fragmentName: string;
  order: number;
  biome: string;
  category: LocationCategory;
  variant: LocationVariant;
  status: 'locked' | 'unlocked' | 'cleared';
  keyPoints: string[];
  ambiance: string;
  history?: string;
}

export interface Quest {
  id: string;
  title: string;
  worldId: string;
  description: string;
  objective: string;
  outcome: string;
}

export interface Ally {
  id: string;
  name: string;
  role: string;
  lore: string;
  outcome: string;
  icon: string;
}

export interface NarrativeArc {
  id: string;
  title: string;
  stages: string[];
}

export interface GameProgress {
  state: GameState;
  currentWorldId: string | null;
  clearedWorlds: string[];
  chronomatter: number;
  integrity: number;
  ribbonLevel: number;
  ribbonMode: RibbonMode;
  discoveredLore: string[]; // World IDs
  unlockedLoreSnippets: string[]; // IDs of creatures/factions/artefacts
  unlockedLaws: string[];
  discoveredFactions: string[];
  discoveredArtefacts: string[];
  discoveredCreatures: string[];
  metAllies: string[];
  activeArcStage: number;
  upgrades: {
    armorIntegrity: number;
    chronomatterChanneling: number;
    resonanceAdaptation: number;
  };
}

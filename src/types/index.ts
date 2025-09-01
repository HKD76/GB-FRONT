export interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface TokenVerificationResponse {
  valid: boolean;
  user: {
    userId: string;
    username: string;
    email: string;
  };
}

export interface ApiError {
  message: string;
  error?: string;
}

// Types pour les armes (structure réelle)
export interface Weapon {
  _id: string;
  unique_key: string;
  id: string;
  name: string;
  any_weapon?: string;
  series?: string;
  title: string;
  grp: string;
  rarity: string;
  element: string;
  type: string;
  arcarum?: string;
  awakening?: string;
  awakening_type1?: string;
  awakening_type2?: string;
  parent?: string;
  img_full: string;
  img_icon: string;
  img_square: string;
  img_tall: string;
  evo_min: number;
  evo_base: number;
  evo_max: number;
  evo_red: number;
  slot11_req?: string;
  atk1: number;
  atk2: number;
  atk3: number;
  atk4: number;
  atk5: number;
  hp1: number;
  hp2: number;
  hp3: number;
  hp4: number;
  hp5: number;
  ca_mul0?: string;
  ca_mul3?: string;
  ca_mul4?: string;
  ca_mul5?: string;
  ca_mul6?: string;
  ca_cap0: number;
  ca_cap3: number;
  ca_cap4: number;
  ca_cap5: number;
  ca_cap6: number;
  ca_fixed0?: string;
  ca_fixed3?: string;
  ca_fixed4?: string;
  ca_fixed5?: string;
  ca_fixed6?: string;
  ca1_name: string;
  ca1_desc: string;
  ca2_name?: string;
  ca2_desc?: string;
  ca3_name?: string;
  ca3_desc?: string;
  ca_t0?: string;
  ca_t1?: string;
  ca_t2?: string;
  ca_t3?: string;
  ca_t4?: string;
  ca_t5?: string;
  s1_icon?: string;
  s1_name?: string;
  s1_lvl?: number;
  s1_desc?: string;
  s1u1_icon?: string;
  s1u1_name?: string;
  s1u1_lvl?: number;
  s1u1_desc?: string;
  s2_icon?: string;
  s2_name?: string;
  s2_lvl?: number;
  s2_desc?: string;
  s2u1_icon?: string;
  s2u1_name?: string;
  s2u1_lvl?: number;
  s2u1_desc?: string;
  s3_icon?: string;
  s3_name?: string;
  s3_lvl?: number;
  s3_desc?: string;
  s3u1_icon?: string;
  s3u1_name?: string;
  s3u1_lvl?: number;
  s3u1_desc?: string;
  bullets: number;
  bullet1?: string;
  bullet2?: string;
  bullet3?: string;
  bullet4?: string;
  bullet5?: string;
  bullet6?: string;
  bullet7?: string;
  bullet8?: string;
  bullet9?: string;
  filters: string[];
  created_at: string;
  updated_at: string;
}

// Types pour les compétences d'armes (structure réelle)
export interface WeaponSkill {
  _id: string;
  ca?: string;
  created_at: string;
  filters: string[];
  icon: string;
  ix: number;
  jpca?: string;
  jpname?: string;
  jptext?: string;
  lvl: number;
  name: string;
  req?: string;
  text: string;
  type: string;
  unique_key: string;
  updated_at: string;
  upgrade: number;
  weapon_id: string;
}

export interface WeaponsResponse {
  weapons: Weapon[];
  total: number;
  page: number;
  limit: number;
}

export interface WeaponSkillsResponse {
  weapon_skills: WeaponSkill[];
  total: number;
  page: number;
  limit: number;
}

export interface WeaponStats {
  total: number;
  byType: Record<string, number>;
  byRarity: Record<string, number>;
}

export interface SkillStats {
  total: number;
  byType: Record<string, number>;
  byElement: Record<string, number>;
}

export interface WeaponFilters {
  type?: string;
  rarity?: string;
  element?: string;
  minAtk?: number;
  maxAtk?: number;
  search?: string;
}

export interface SkillFilters {
  type?: string;
  weapon_id?: string;
  search?: string;
}

// Types pour les summons
export interface Summon {
  _id: string;
  unique_key: string;
  id: number;
  summonid: number;
  name: string;
  series?: string;
  series_text?: string;
  rarity: string;
  element: string;
  arcarum?: string;
  jpname: string;
  release_date?: string;
  "4star_date"?: string;
  "5star_date"?: string;
  "6star_date"?: string;
  obtain?: string;
  obtain_text?: string;
  homescreen: boolean;
  img_full: string;
  img_icon: string;
  img_square: string;
  img_tall: string;
  evo_min: number;
  evo_base: number;
  evo_max: number;
  atk1: number;
  atk2: number;
  atk3?: number;
  atk4?: number;
  atk5?: number;
  hp1: number;
  hp2: number;
  hp3?: number;
  hp4?: number;
  hp5?: number;
  call_name: string;
  call1: string;
  call2?: string;
  call3?: string;
  call4?: string;
  call5?: string;
  call_t0?: string;
  call_t1?: string;
  call_t2?: string;
  call_t3?: string;
  call_t4?: string;
  call_t5?: string;
  call_reuse: boolean;
  comboable: boolean;
  call_cd_first1: number;
  call_cd_first2: number;
  call_cd_first3?: number;
  call_cd_first4?: number;
  call_cd_first5?: number;
  call_cd1: number;
  call_cd2: number;
  call_cd3?: number;
  call_cd4?: number;
  call_cd5?: number;
  combo1?: string;
  combo2?: string;
  aura1: string;
  aura2: string;
  aura3?: string;
  aura4?: string;
  aura5?: string;
  aura_t0?: string;
  aura_t1?: string;
  aura_t2?: string;
  aura_t3?: string;
  aura_t4?: string;
  aura_t5?: string;
  subaura1?: string;
  subaura2?: string;
  subaura3?: string;
  subaura4?: string;
  subaura5?: string;
  subaura_t0?: string;
  subaura_t1?: string;
  subaura_t2?: string;
  subaura_t3?: string;
  subaura_t4?: string;
  subaura_t5?: string;
  cache_slgr?: string;
  created_at: string;
  updated_at: string;
  selectedLevel?: number; // Niveau sélectionné par l'utilisateur
}

export interface SummonsResponse {
  summons: Summon[];
  total: number;
  page: number;
  limit: number;
}

export interface SummonFilters {
  element?: string;
  rarity?: string;
  search?: string;
  specialAuras?: string[];
}

// Types pour les Weapon Grids sauvegardées
export interface SavedWeaponGrid {
  _id: string;
  name: string;
  description?: string;
  userId: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;

  weapons: {
    [key: number]: {
      weaponId: string;
      weaponData: Weapon;
      selectedLevel?: number;
    };
  };

  summons: {
    [key: number]: {
      summonId: string;
      summonData: Summon;
      selectedLevel?: number;
      selectedSpecialAura?: string;
    };
  };

  metadata: {
    totalAtk: number;
    totalHp: number;
    weaponCount: number;
    summonCount: number;
    elements: string[];
    rarities: string[];
  };

  stats?: {
    views: number;
    likes: number;
    downloads: number;
  };
}

export interface WeaponGridResponse {
  weaponGrid: SavedWeaponGrid;
}

export interface WeaponGridsResponse {
  weaponGrids: SavedWeaponGrid[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateWeaponGridRequest {
  name: string;
  description?: string;
  isPublic: boolean;
  weapons: {
    [key: number]: {
      weaponId: string;
      weaponData: Weapon;
      selectedLevel?: number;
    };
  };
  summons: {
    [key: number]: {
      summonId: string;
      summonData: Summon;
      selectedLevel?: number;
      selectedSpecialAura?: string;
    };
  };
  metadata?: {
    totalAtk: number;
    totalHp: number;
    weaponCount: number;
    summonCount: number;
    elements: string[];
  };
}

export interface UpdateWeaponGridRequest {
  name?: string;
  description?: string;
  isPublic?: boolean;
}

export interface WeaponGridFilters {
  element?: string;
  rarity?: string;
  isPublic?: boolean;
  userId?: string;
  search?: string;
  sortBy?: "createdAt" | "updatedAt" | "views" | "likes" | "downloads";
  sortOrder?: "asc" | "desc";
}

export interface WeaponGridStats {
  total: number;
  public: number;
  private: number;
  totalViews: number;
  totalLikes: number;
  totalDownloads: number;
  mostPopularElement: string;
  mostPopularRarity: string;
}

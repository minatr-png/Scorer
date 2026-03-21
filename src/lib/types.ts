export interface ScoreCategory {
  id: number;
  name: string;
  order: number;
}

export interface Game {
  id: string;
  name: string;
  picture: string;
  start_date: string;
  finish_date: string | null;
  left: boolean;
  score_id: number | null;
  score_categories?: ScoreCategory;
}

export interface Movie {
  id: string;
  name: string;
  picture: string;
  watch_date: string;
  score_id: number | null;
  score_categories?: ScoreCategory;
}

export interface GameInsert {
  name: string;
  picture: string;
  start_date: string;
  finish_date: string | null;
  left: boolean;
  score_id: number | null;
}

export interface MovieInsert {
  name: string;
  picture: string;
  watch_date: string;
  score_id: number | null;
}

export type Database = {
  public: {
    Tables: {
      score_categories: {
        Row: ScoreCategory;
        Insert: ScoreCategory;
        Update: Partial<ScoreCategory>;
        Relationships: [];
      };
      games: {
        Row: Game;
        Insert: GameInsert;
        Update: Partial<GameInsert>;
        Relationships: [
          {
            foreignKeyName: "games_score_id_fkey";
            columns: ["score_id"];
            isOneToOne: false;
            referencedRelation: "score_categories";
            referencedColumns: ["id"];
          }
        ];
      };
      movies: {
        Row: Movie;
        Insert: MovieInsert;
        Update: Partial<MovieInsert>;
        Relationships: [
          {
            foreignKeyName: "movies_score_id_fkey";
            columns: ["score_id"];
            isOneToOne: false;
            referencedRelation: "score_categories";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// Generated from the Supabase project schema (Supabase MCP generate_typescript_types).
// Regenerate after every migration. Helper generics trimmed; only `Database` is used.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      actors: {
        Row: {
          agency: string;
          base_fans: number;
          bio: string;
          birthdate: string | null;
          created_at: string;
          created_by: string | null;
          decades: string[];
          gender: string;
          generation: string;
          genres: string[];
          hometown: string;
          id: string;
          name: string;
          network: string;
          photo_url: string | null;
          photo_credit: string;
          photo_source: string | null;
          wiki_title: string | null;
          socials: Json;
          spotlight: boolean;
          stage_name: string;
          tagline: string;
          trending_rank: number | null;
          updated_at: string;
        };
        Insert: {
          agency?: string;
          base_fans?: number;
          bio?: string;
          birthdate?: string | null;
          created_at?: string;
          created_by?: string | null;
          decades?: string[];
          gender: string;
          generation: string;
          genres?: string[];
          hometown?: string;
          id: string;
          name: string;
          network: string;
          photo_url?: string | null;
          photo_credit?: string;
          photo_source?: string | null;
          wiki_title?: string | null;
          socials?: Json;
          spotlight?: boolean;
          stage_name?: string;
          tagline: string;
          trending_rank?: number | null;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['actors']['Insert']>;
        Relationships: [];
      };
      awards: {
        Row: {
          actor_id: string;
          created_at: string;
          id: string;
          org: string;
          position: number;
          title: string;
          won: boolean;
          year: number;
        };
        Insert: {
          actor_id: string;
          created_at?: string;
          id?: string;
          org: string;
          position?: number;
          title: string;
          won?: boolean;
          year: number;
        };
        Update: Partial<Database['public']['Tables']['awards']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'awards_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'actors';
            referencedColumns: ['id'];
          },
        ];
      };
      credits: {
        Row: {
          actor_id: string;
          created_at: string;
          id: string;
          position: number;
          role: string;
          title_id: string;
        };
        Insert: {
          actor_id: string;
          created_at?: string;
          id?: string;
          position?: number;
          role: string;
          title_id: string;
        };
        Update: Partial<Database['public']['Tables']['credits']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'credits_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'actors';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'credits_title_id_fkey';
            columns: ['title_id'];
            isOneToOne: false;
            referencedRelation: 'titles';
            referencedColumns: ['id'];
          },
        ];
      };
      favorite_actors: {
        Row: { actor_id: string; created_at: string; user_id: string };
        Insert: { actor_id: string; created_at?: string; user_id?: string };
        Update: { actor_id?: string; created_at?: string; user_id?: string };
        Relationships: [
          {
            foreignKeyName: 'favorite_actors_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'actors';
            referencedColumns: ['id'];
          },
        ];
      };
      news: {
        Row: {
          actor_id: string | null;
          body: string;
          created_at: string;
          excerpt: string;
          headline: string;
          id: string;
          image_url: string | null;
          minutes_read: number;
          published_at: string;
          source: string;
          tag: string;
        };
        Insert: {
          actor_id?: string | null;
          body?: string;
          created_at?: string;
          excerpt: string;
          headline: string;
          id: string;
          image_url?: string | null;
          minutes_read?: number;
          published_at?: string;
          source: string;
          tag: string;
        };
        Update: Partial<Database['public']['Tables']['news']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'news_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'actors';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          city: string | null;
          created_at: string;
          display_name: string;
          favorite_genres: string[];
          id: string;
          is_admin: boolean;
          updated_at: string;
        };
        Insert: {
          city?: string | null;
          created_at?: string;
          display_name?: string;
          favorite_genres?: string[];
          id: string;
          is_admin?: boolean;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      titles: {
        Row: {
          created_at: string;
          created_by: string | null;
          id: string;
          note: string | null;
          poster_url: string | null;
          title: string;
          type: string;
          year: number;
        };
        Insert: {
          created_at?: string;
          created_by?: string | null;
          id: string;
          note?: string | null;
          poster_url?: string | null;
          title: string;
          type: string;
          year: number;
        };
        Update: Partial<Database['public']['Tables']['titles']['Insert']>;
        Relationships: [];
      };
      trivia_attempts: {
        Row: {
          best_streak: number;
          created_at: string;
          id: string;
          score: number;
          total: number;
          user_id: string;
        };
        Insert: {
          best_streak?: number;
          created_at?: string;
          id?: string;
          score: number;
          total: number;
          user_id?: string;
        };
        Update: Partial<Database['public']['Tables']['trivia_attempts']['Insert']>;
        Relationships: [];
      };
      trivia_questions: {
        Row: {
          active: boolean;
          actor_id: string;
          answer_index: number;
          choices: string[];
          created_at: string;
          fact: string;
          id: string;
          position: number;
          prompt: string;
        };
        Insert: {
          active?: boolean;
          actor_id: string;
          answer_index: number;
          choices: string[];
          created_at?: string;
          fact: string;
          id: string;
          position?: number;
          prompt: string;
        };
        Update: Partial<Database['public']['Tables']['trivia_questions']['Insert']>;
        Relationships: [
          {
            foreignKeyName: 'trivia_questions_actor_id_fkey';
            columns: ['actor_id'];
            isOneToOne: false;
            referencedRelation: 'actors';
            referencedColumns: ['id'];
          },
        ];
      };
      watchlist: {
        Row: { created_at: string; title_id: string; user_id: string };
        Insert: { created_at?: string; title_id: string; user_id?: string };
        Update: { created_at?: string; title_id?: string; user_id?: string };
        Relationships: [
          {
            foreignKeyName: 'watchlist_title_id_fkey';
            columns: ['title_id'];
            isOneToOne: false;
            referencedRelation: 'titles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      actor_follower_counts: {
        Args: { p_ids: string[] };
        Returns: { actor_id: string; followers: number }[];
      };
      answer_trivia: {
        Args: { p_choice: number; p_question: string };
        Returns: { answer_index: number; correct: boolean; fact: string }[];
      };
      save_actor: { Args: { p: Json; p_id: string | null }; Returns: string };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipi per la leaderboard
export interface LeaderboardEntry {
  id: number
  mode: string
  name: string
  streak: number
  score: number
  timestamp: string
}

export interface LeaderboardData {
  achille: LeaderboardEntry[]
  eracle: LeaderboardEntry[]
}

// Funzioni per la leaderboard
export const leaderboardApi = {
  // Ottieni tutti i record
  async getAll(): Promise<LeaderboardData> {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('streak', { ascending: false })
      .order('score', { ascending: false })
      .order('timestamp', { ascending: true })

    if (error) {
      console.error('Errore nel caricamento leaderboard:', error)
      throw error
    }

    // Raggruppa per modalità
    const achille = data?.filter(entry => entry.mode === 'achille').slice(0, 5) || []
    const eracle = data?.filter(entry => entry.mode === 'eracle').slice(0, 5) || []

    return { achille, eracle }
  },

  // Aggiungi nuovo record
  async addRecord(mode: string, name: string, streak: number, score: number): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert([
        {
          mode,
          name,
          streak,
          score
        }
      ])
      .select()

    if (error) {
      console.error('Errore nel salvataggio record:', error)
      throw error
    }

    // Ottieni i top 5 per la modalità
    const { data: topRecords, error: fetchError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('mode', mode)
      .order('streak', { ascending: false })
      .order('score', { ascending: false })
      .order('timestamp', { ascending: true })
      .limit(5)

    if (fetchError) {
      console.error('Errore nel recupero top 5:', fetchError)
      throw fetchError
    }

    return topRecords || []
  }
}

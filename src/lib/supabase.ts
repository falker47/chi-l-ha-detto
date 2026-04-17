import { createClient } from '@supabase/supabase-js'

// Configurazione Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Tipi per la leaderboard
export interface LeaderboardEntry {
  id: number
  mode: string
  theme: string
  name: string
  streak: number
  score: number
  timestamp: string
}

export interface LeaderboardData {
  achille: LeaderboardEntry[]
  eracle: LeaderboardEntry[]
  // Nuovi temi
  intrattenimento_achille: LeaderboardEntry[]
  intrattenimento_eracle: LeaderboardEntry[]
  trash_achille: LeaderboardEntry[]
  trash_eracle: LeaderboardEntry[]
  mista_achille: LeaderboardEntry[]
  mista_eracle: LeaderboardEntry[]
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

    // Raggruppa per modalità e tema
    const achille = data?.filter(entry => entry.mode === 'achille' && entry.theme === 'classica').slice(0, 5) || []
    const eracle = data?.filter(entry => entry.mode === 'eracle' && entry.theme === 'classica').slice(0, 5) || []
    
    // Nuovi temi
    const intrattenimento_achille = data?.filter(entry => entry.mode === 'achille' && entry.theme === 'intrattenimento').slice(0, 5) || []
    const intrattenimento_eracle = data?.filter(entry => entry.mode === 'eracle' && entry.theme === 'intrattenimento').slice(0, 5) || []
    const trash_achille = data?.filter(entry => entry.mode === 'achille' && entry.theme === 'trash').slice(0, 5) || []
    const trash_eracle = data?.filter(entry => entry.mode === 'eracle' && entry.theme === 'trash').slice(0, 5) || []
    const mista_achille = data?.filter(entry => entry.mode === 'achille' && entry.theme === 'mista').slice(0, 5) || []
    const mista_eracle = data?.filter(entry => entry.mode === 'eracle' && entry.theme === 'mista').slice(0, 5) || []

    return { 
      achille, 
      eracle,
      intrattenimento_achille,
      intrattenimento_eracle,
      trash_achille,
      trash_eracle,
      mista_achille,
      mista_eracle
    }
  },

  // Aggiungi nuovo record (con sovrascrittura se esiste già)
  async addRecord(mode: string, theme: string, name: string, streak: number, score: number): Promise<LeaderboardEntry[]> {
    // Prima controlla se esiste già un record con lo stesso nome per questa modalità e tema
    const { data: existingRecord, error: checkError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('mode', mode)
      .eq('theme', theme)
      .eq('name', name)
      .single()

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Errore nel controllo record esistente:', checkError)
      throw checkError
    }

    let result
    if (existingRecord) {
      // Se esiste già, aggiorna il record esistente
      console.log(`Aggiornando record esistente per ${name} in ${mode}/${theme}`)
      const { data, error } = await supabase
        .from('leaderboard')
        .update({
          streak,
          score,
          timestamp: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()

      if (error) {
        console.error('Errore nell\'aggiornamento record:', error)
        throw error
      }
      result = data
    } else {
      // Se non esiste, inserisci un nuovo record
      console.log(`Inserendo nuovo record per ${name} in ${mode}/${theme}`)
      const { data, error } = await supabase
        .from('leaderboard')
        .insert([
          {
            mode,
            theme,
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
      result = data
    }

    // Ottieni i top 5 per la modalità e tema
    const { data: topRecords, error: fetchError } = await supabase
      .from('leaderboard')
      .select('*')
      .eq('mode', mode)
      .eq('theme', theme)
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

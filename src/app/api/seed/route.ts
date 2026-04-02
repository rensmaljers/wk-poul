import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const FAKE_USERS = [
  'Jan de Boer', 'Lisa van Dijk', 'Mohammed El Amrani', 'Sophie Bakker',
  'Thomas Visser', 'Emma de Groot', 'Daan Mulder', 'Fleur Jansen',
  'Bram de Vries', 'Nina Smit', 'Luca Peters', 'Sanne Meijer',
  'Jesse de Jong', 'Roos Hendriks', 'Milan Dekker', 'Eva van den Berg',
  'Thijs Willems', 'Isa Bos', 'Sem van Leeuwen', 'Lotte Brouwer',
  'Finn de Wit', 'Julia Dijkstra', 'Luuk Vermeer', 'Noa Hermans',
  'Stijn van der Linden', 'Amy Jacobs', 'Mees de Graaf', 'Zoë Maas',
  'Ruben Schouten', 'Vera Koning', 'Lars van der Heijden', 'Fenna Vos',
  'Cas Verhoeven', 'Tess van Beek', 'Hugo Scholten',
]

const AVATARS = [
  '⚽', '🏆', '🥅', '🎯', '🦁', '🐉', '🦅', '🐺',
  '🔥', '⭐', '💎', '🌍', '🎩', '👑', '🤖', '🧙',
  '🦈', '🐻', '🦊', '🐯', '🦉', '🐧', '🦋', '🌟',
  '🇳🇱', '🍊', '🏅', '🎪', '🚀', '💪', '🧠', '🎲',
  '🦖', '🐸', '🐼',
]

function randomScore(): number {
  // Weighted: lower scores more likely
  const weights = [25, 30, 20, 12, 7, 3, 2, 1]
  const total = weights.reduce((a, b) => a + b, 0)
  let rand = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    rand -= weights[i]
    if (rand <= 0) return i
  }
  return 0
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')

  if (secret !== process.env.SYNC_SECRET && process.env.SYNC_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const action = searchParams.get('action') ?? 'seed'

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  if (action === 'cleanup') {
    // Remove all fake users (emails ending in @test.wkpoule.nl)
    const { data: profiles } = await supabase.from('profiles').select('id, display_name')
    const fakeIds: string[] = []
    for (const p of (profiles ?? [])) {
      if (FAKE_USERS.includes((p as { display_name: string }).display_name)) {
        fakeIds.push((p as { id: string }).id)
      }
    }

    if (fakeIds.length > 0) {
      await supabase.from('bonus_predictions').delete().in('user_id', fakeIds)
      await supabase.from('predictions').delete().in('user_id', fakeIds)
      await supabase.from('profiles').delete().in('id', fakeIds)
      for (const id of fakeIds) {
        await supabase.auth.admin.deleteUser(id)
      }
    }

    return NextResponse.json({ success: true, removed: fakeIds.length })
  }

  // --- SEED ---
  const { data: matches } = await supabase
    .from('matches')
    .select('id')
    .order('match_date', { ascending: true })

  const matchIds = (matches ?? []).map((m: { id: number }) => m.id)

  let created = 0
  const userIds: string[] = []

  for (let i = 0; i < FAKE_USERS.length; i++) {
    const name = FAKE_USERS[i]
    const email = `test${i + 1}@test.wkpoule.nl`

    // Create auth user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'TestWK2026!',
      email_confirm: true,
      user_metadata: { display_name: name },
    })

    if (authError) {
      // User might already exist, try to find them
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('display_name', name)
        .single()
      if (existing) {
        userIds.push((existing as { id: string }).id)
      }
      continue
    }

    const userId = authUser.user.id
    userIds.push(userId)

    // Update avatar
    await supabase
      .from('profiles')
      .update({ avatar_url: AVATARS[i % AVATARS.length] })
      .eq('id', userId)

    created++
  }

  // Create predictions for each user
  let predictionsCreated = 0
  for (const userId of userIds) {
    // Each user fills in 60-100% of matches
    const fillRate = 0.6 + Math.random() * 0.4
    const matchesToFill = matchIds.filter(() => Math.random() < fillRate)

    for (const matchId of matchesToFill) {
      const { error } = await supabase.from('predictions').upsert({
        user_id: userId,
        match_id: matchId,
        home_score: randomScore(),
        away_score: randomScore(),
      }, { onConflict: 'user_id,match_id' })

      if (!error) predictionsCreated++
    }

    // Fill in some bonus predictions
    const bonusQuestions = [
      'world_champion', 'runner_up', 'top_scorer', 'netherlands_stage',
      'most_goals_team', 'total_goals', 'most_yellow_cards', 'most_red_cards',
      'first_red_card', 'highest_scoring_match', 'best_goalkeeper', 'best_young_player',
    ]
    const landen = ['Nederland', 'Frankrijk', 'Brazilië', 'Argentinië', 'Duitsland', 'Spanje', 'Engeland', 'Portugal', 'België', 'Kroatië']
    const spelers = ['Mbappé', 'Haaland', 'Messi', 'Vinicius Jr', 'Bellingham', 'Gakpo', 'Kane', 'Salah']
    const stages = ['Groepsfase', 'Achtste finale', 'Kwartfinale', 'Halve finale', 'Finale', 'Wereldkampioen']

    for (const key of bonusQuestions) {
      if (Math.random() < 0.75) {
        let answer = ''
        if (key === 'total_goals') answer = String(120 + Math.floor(Math.random() * 80))
        else if (key === 'highest_scoring_match') answer = String(4 + Math.floor(Math.random() * 6))
        else if (key === 'netherlands_stage') answer = stages[Math.floor(Math.random() * stages.length)]
        else if (key === 'top_scorer' || key === 'best_goalkeeper' || key === 'best_young_player')
          answer = spelers[Math.floor(Math.random() * spelers.length)]
        else answer = landen[Math.floor(Math.random() * landen.length)]

        await supabase.from('bonus_predictions').upsert({
          user_id: userId,
          question_key: key,
          answer,
        }, { onConflict: 'user_id,question_key' })
      }
    }

    // Group predictions
    const groups = ['A','B','C','D','E','F','G','H','I','J','K','L']
    for (const g of groups) {
      if (Math.random() < 0.7) {
        await supabase.from('bonus_predictions').upsert({
          user_id: userId,
          question_key: `group_${g}_winner`,
          answer: landen[Math.floor(Math.random() * landen.length)],
        }, { onConflict: 'user_id,question_key' })
        await supabase.from('bonus_predictions').upsert({
          user_id: userId,
          question_key: `group_${g}_runnerup`,
          answer: landen[Math.floor(Math.random() * landen.length)],
        }, { onConflict: 'user_id,question_key' })
      }
    }
  }

  return NextResponse.json({
    success: true,
    usersCreated: created,
    totalUsers: userIds.length,
    predictionsCreated,
  })
}

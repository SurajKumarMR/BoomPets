import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function getUserPets(userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false });
}

export async function getPetById(petId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('pets')
    .select('*')
    .eq('id', petId)
    .eq('owner_id', userId)
    .single();
}

export async function createPet(petData: any, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('pets')
    .insert({ ...petData, owner_id: userId })
    .select()
    .single();
}

export async function updatePet(petId: string, petData: any, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('pets')
    .update(petData)
    .eq('id', petId)
    .eq('owner_id', userId)
    .select()
    .single();
}

export async function deletePet(petId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('pets')
    .delete()
    .eq('id', petId)
    .eq('owner_id', userId);
}

export async function getMealLogs(petId: string, limit = 30) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('meal_logs')
    .select('*')
    .eq('pet_id', petId)
    .order('meal_time', { ascending: false })
    .limit(limit);
}

export async function createMealLog(mealData: any) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('meal_logs')
    .insert(mealData)
    .select()
    .single();
}

export async function getVaccinations(petId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('vaccinations')
    .select('*')
    .eq('pet_id', petId)
    .order('vaccination_date', { ascending: false });
}

export async function createVaccination(vaccinationData: any) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('vaccinations')
    .insert(vaccinationData)
    .select()
    .single();
}

export async function getConsultations(userId: string, limit = 20) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('consultations')
    .select(`
      *,
      specialist:specialists(*),
      pet:pets(*)
    `)
    .eq('user_id', userId)
    .order('scheduled_at', { ascending: false })
    .limit(limit);
}

export async function createConsultation(consultationData: any) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('consultations')
    .insert(consultationData)
    .select()
    .single();
}

export async function getSpecialists(filters?: {
  specialty?: string;
  availability?: boolean;
}) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  let query = supabase
    .from('specialists')
    .select('*')
    .eq('verified', true);

  if (filters?.specialty) {
    query = query.eq('specialty', filters.specialty);
  }

  if (filters?.availability) {
    query = query.eq('available', true);
  }

  return await query.order('rating', { ascending: false });
}

export async function getCommunityPosts(limit = 20, offset = 0) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('community_posts')
    .select(`
      *,
      user:users(id, name, avatar_url),
      likes:likes(count),
      comments:comments(count)
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
}

export async function createCommunityPost(postData: any, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('community_posts')
    .insert({ ...postData, user_id: userId })
    .select()
    .single();
}

export async function getCourses(category?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  let query = supabase
    .from('courses')
    .select('*')
    .eq('published', true);

  if (category) {
    query = query.eq('category', category);
  }

  return await query.order('created_at', { ascending: false });
}

export async function enrollInCourse(courseId: string, userId: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { data: null, error: new Error('Database not configured') };

  return await supabase
    .from('course_enrollments')
    .insert({ course_id: courseId, user_id: userId })
    .select()
    .single();
}

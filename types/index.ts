export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: 'pet_owner' | 'nutritionist' | 'vet';
  subscription_tier?: 'free' | 'pro';
  created_at: string;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat' | 'exotic';
  breed?: string;
  age: number;
  weight: number;
  avatar_url?: string;
  created_at: string;
}

export interface Specialist {
  id: string;
  user_id: string;
  name: string;
  specialty: string;
  years_experience: number;
  rating: number;
  reviews_count: number;
  hourly_rate: number;
  status: 'online' | 'offline';
  available_next?: string;
  avatar_url?: string;
  certifications?: string[];
}

export interface Consultation {
  id: string;
  pet_id: string;
  specialist_id: string;
  user_id: string;
  type: 'video' | 'chat';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at: string;
  duration_minutes: number;
  video_room_url?: string;
  notes?: string;
  created_at: string;
}

export interface MealLog {
  id: string;
  pet_id: string;
  food_type: string;
  amount: number;
  unit: 'cups' | 'grams' | 'oz';
  time: string;
  notes?: string;
  created_at: string;
}

export interface Vaccination {
  id: string;
  pet_id: string;
  name: string;
  administered_date: string;
  next_due_date: string;
  status: 'active' | 'due_soon' | 'overdue' | 'history';
  veterinarian?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  image_url: string;
  instructor_id: string;
  is_bestseller?: boolean;
  species?: string[];
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  type: 'success' | 'recipe' | 'tip' | 'question';
  likes_count: number;
  comments_count: number;
  is_moderated: boolean;
  created_at: string;
}

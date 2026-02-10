'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getHandbookCategories() {
  try {
    const { data, error } = await supabase
      .from('handbook_categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch categories' };
  }
}

export async function getHandbookContent(categoryId?: string, search?: string) {
  try {
    let query = supabase
      .from('handbook_content')
      .select('*')
      .eq('is_published', true);

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch handbook content' };
  }
}

export async function createHandbookCategory(name: string, description?: string, icon?: string) {
  try {
    const { data, error } = await supabase
      .from('handbook_categories')
      .insert({
        name,
        description,
        icon,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Category created successfully', data };
  } catch (error) {
    return { success: false, error: 'Failed to create category' };
  }
}

export async function createHandbookContent(
  categoryId: string,
  title: string,
  content: string,
  userId: string,
  tags?: string[]
) {
  try {
    if (!title.trim() || !content.trim()) {
      return { success: false, error: 'Title and content are required' };
    }

    const { data, error } = await supabase
      .from('handbook_content')
      .insert({
        category_id: categoryId,
        title,
        content,
        tags: tags || [],
        created_by: userId,
        is_published: true,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Content created successfully', data };
  } catch (error) {
    return { success: false, error: 'Failed to create content' };
  }
}

export async function updateHandbookContent(
  contentId: string,
  title: string,
  content: string,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from('handbook_content')
      .update({
        title,
        content,
        updated_by: userId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contentId)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Content updated successfully', data };
  } catch (error) {
    return { success: false, error: 'Failed to update content' };
  }
}

export async function searchHandbook(query: string) {
  try {
    if (!query.trim()) {
      return { success: false, error: 'Search query is required' };
    }

    const { data, error } = await supabase
      .from('handbook_content')
      .select('*, handbook_categories(name)')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .limit(20);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Search failed' };
  }
}

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { content, slug, editCode } = req.body;

    if (!content || !slug || !editCode) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (slug.length < 3 || slug.length > 50) {
      return res.status(400).json({ error: 'Slug must be 3-50 characters' });
    }

    try {
      const { data, error } = await supabase
        .from('pastes')
        .insert([{ slug, content, edit_code: editCode }])
        .select();

      if (error) {
        if (error.message.includes('unique')) {
          return res.status(409).json({ error: 'Slug already exists' });
        }
        throw error;
      }

      return res.status(201).json({ slug, editCode: data[0].edit_code });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create paste' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

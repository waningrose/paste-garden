import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

export default async function handler(req, res) {
  const { slug } = req.query;

  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('pastes')
        .select('content, created_at')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        return res.status(404).json({ error: 'Paste not found' });
      }

      return res.status(200).json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'PUT') {
    const { content, editCode } = req.body;

    if (!editCode) {
      return res.status(401).json({ error: 'Edit code required' });
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('pastes')
        .select('edit_code')
        .eq('slug', slug)
        .single();

      if (fetchError || !data) {
        return res.status(404).json({ error: 'Paste not found' });
      }

      if (data.edit_code !== editCode) {
        return res.status(403).json({ error: 'Invalid edit code' });
      }

      const { error: updateError } = await supabase
        .from('pastes')
        .update({ content, updated_at: new Date() })
        .eq('slug', slug);

      if (updateError) throw updateError;

      return res.status(200).json({ message: 'Paste updated' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  if (req.method === 'DELETE') {
    const { editCode } = req.body;

    if (!editCode) {
      return res.status(401).json({ error: 'Edit code required' });
    }

    try {
      const { data, error: fetchError } = await supabase
        .from('pastes')
        .select('edit_code')
        .eq('slug', slug)
        .single();

      if (fetchError || !data) {
        return res.status(404).json({ error: 'Paste not found' });
      }

      if (data.edit_code !== editCode) {
        return res.status(403).json({ error: 'Invalid edit code' });
      }

      await supabase.from('pastes').delete().eq('slug', slug);

      return res.status(200).json({ message: 'Paste deleted' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

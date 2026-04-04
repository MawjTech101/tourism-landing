-- Create public storage bucket for tenant media (logos, trip photos, hero images)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif']
);

-- Allow public read access to all files in media bucket
CREATE POLICY "Public read access for media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

-- Authenticated users can upload to media bucket
CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can update their uploads
CREATE POLICY "Authenticated users can update media"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
  );

-- Authenticated users can delete media
CREATE POLICY "Authenticated users can delete media"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'media'
    AND auth.role() = 'authenticated'
  );

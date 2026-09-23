-- Storage deletes must first *see* the object, so owners need SELECT on their own folder.
-- (Public URLs for the public `media` bucket don't depend on this policy.)
create policy "media: users read own files" on storage.objects for select to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = (select auth.uid())::text);

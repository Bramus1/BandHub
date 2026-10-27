BEGIN;
ALTER TABLE public.songs ADD COLUMN deleted_at timestamptz;
REVOKE UPDATE ON public.songs FROM authenticated;
GRANT UPDATE(title,artist,description,kind,bpm,musical_key,time_signature,status,lyrics,chords,tabs) ON public.songs TO authenticated;
ALTER POLICY song_insert ON public.songs WITH CHECK(public.is_member(band_id) AND created_by=auth.uid() AND deleted_at IS NULL);
CREATE FUNCTION public.set_song_trashed(target_song uuid,trashed boolean) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
DECLARE target public.songs;
BEGIN
 SELECT * INTO target FROM public.songs WHERE id=target_song FOR UPDATE;
 IF NOT FOUND OR NOT public.is_member(target.band_id) OR NOT (target.created_by=auth.uid() OR public.has_band_role(target.band_id,ARRAY['owner','admin'])) THEN
 RAISE EXCEPTION 'Only the song creator or a band administrator can trash or restore this song';
 END IF;
 IF trashed IS NULL THEN RAISE EXCEPTION 'Choose trash or restore'; END IF;
 UPDATE public.songs SET deleted_at=CASE WHEN trashed THEN coalesce(deleted_at,now()) ELSE NULL END WHERE id=target_song;
END;
$$;
REVOKE ALL ON FUNCTION public.set_song_trashed(uuid,boolean) FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.set_song_trashed(uuid,boolean) TO authenticated;
COMMIT;

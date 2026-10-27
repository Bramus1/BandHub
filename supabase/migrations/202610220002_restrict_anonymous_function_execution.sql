-- Supabase default privileges grant anon EXECUTE directly, in addition to PUBLIC.
REVOKE EXECUTE ON FUNCTION public.is_member(uuid), public.has_band_role(uuid,text[]), public.create_band(text,text,text), public.create_invite(uuid,text,text), public.accept_invite(text), public.remove_member(uuid,uuid), public.change_member_role(uuid,uuid,text), public.add_recording(uuid,text,text,text,bigint), public.freeze_song_identity() FROM anon;
-- Platform event trigger is not an app RPC; its owner can still invoke it.
DO $$ BEGIN
 IF to_regprocedure('public.rls_auto_enable()') IS NOT NULL THEN
  REVOKE EXECUTE ON FUNCTION public.rls_auto_enable() FROM PUBLIC, anon, authenticated;
 END IF;
END $$;

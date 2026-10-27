-- BandHub core. Apply once through Supabase migrations or SQL Editor.
BEGIN;
CREATE TABLE public.profiles (
 id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 display_name text NOT NULL DEFAULT '' CHECK(length(display_name)<=80),
 main_instrument text NOT NULL DEFAULT '', additional_instruments text[] NOT NULL DEFAULT '{}',
 biography text NOT NULL DEFAULT '' CHECK(length(biography)<=1000)
);
CREATE TABLE public.bands (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 120),
 genre text NOT NULL DEFAULT '' CHECK(length(genre)<=80), description text NOT NULL DEFAULT '' CHECK(length(description)<=2000),
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.memberships (
 band_id uuid NOT NULL REFERENCES public.bands(id) ON DELETE CASCADE,
 user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 role text NOT NULL CHECK(role IN ('owner','admin','member')), joined_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(band_id,user_id)
);
CREATE UNIQUE INDEX one_owner_per_band ON public.memberships(band_id) WHERE role='owner';
CREATE INDEX memberships_user ON public.memberships(user_id);
CREATE TABLE public.invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),band_id uuid NOT NULL REFERENCES public.bands(id) ON DELETE CASCADE,
 email text NOT NULL, role text NOT NULL CHECK(role IN ('admin','member')), token_hash text NOT NULL UNIQUE,
 created_by uuid NOT NULL REFERENCES auth.users(id), expires_at timestamptz NOT NULL DEFAULT now()+interval '7 days', accepted_at timestamptz
);
CREATE TABLE public.songs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), band_id uuid NOT NULL REFERENCES public.bands(id) ON DELETE CASCADE,
 title text NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120), artist text NOT NULL DEFAULT '' CHECK(length(artist)<=120),
 description text NOT NULL DEFAULT '' CHECK(length(description)<=4000),
 kind text NOT NULL DEFAULT 'song' CHECK(kind IN ('song','idea','cover')),
 bpm integer DEFAULT 120 CHECK(bpm BETWEEN 1 AND 300), musical_key text NOT NULL DEFAULT '' CHECK(length(musical_key)<=20),
 time_signature text NOT NULL DEFAULT '4/4' CHECK(time_signature ~ '^([1-9]|1[0-6])/(2|4|8|16)$'),
 status text NOT NULL DEFAULT 'New Idea' CHECK(status IN ('New Idea','In Development','Ready for Rehearsal','Completed','Archived')),
 lyrics text NOT NULL DEFAULT '' CHECK(length(lyrics)<=50000), chords text NOT NULL DEFAULT '' CHECK(length(chords)<=50000), tabs text NOT NULL DEFAULT '' CHECK(length(tabs)<=50000),
 created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id), created_at timestamptz NOT NULL DEFAULT now(),updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id,band_id)
);
CREATE INDEX songs_band ON public.songs(band_id,updated_at DESC);
CREATE TABLE public.recordings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), band_id uuid NOT NULL REFERENCES public.bands(id),song_id uuid NOT NULL,
 storage_path text NOT NULL UNIQUE, name text NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 200),
 mime text NOT NULL CHECK(mime IN ('audio/mpeg','audio/wav','audio/x-wav','audio/wave','audio/mp4','audio/x-m4a','audio/webm')),
 size bigint NOT NULL CHECK(size BETWEEN 1 AND 26214400), version integer NOT NULL CHECK(version>0),
 created_by uuid NOT NULL REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(song_id,band_id) REFERENCES public.songs(id,band_id), UNIQUE(song_id,version),UNIQUE(id,band_id)
);
CREATE TABLE public.documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),band_id uuid NOT NULL REFERENCES public.bands(id),song_id uuid NOT NULL,
 name text NOT NULL CHECK(length(trim(name)) BETWEEN 1 AND 200),storage_path text NOT NULL UNIQUE,
 mime text NOT NULL CHECK(mime IN ('application/pdf','text/plain')),size bigint NOT NULL CHECK(size BETWEEN 1 AND 26214400),
 rights text NOT NULL CHECK(rights IN ('owned','authorized')),created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(song_id,band_id) REFERENCES public.songs(id,band_id)
);
CREATE TABLE public.messages (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),band_id uuid NOT NULL REFERENCES public.bands(id), song_id uuid,
 author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 4000),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(song_id,band_id) REFERENCES public.songs(id,band_id)
);
CREATE INDEX messages_band_time ON public.messages(band_id,created_at);
CREATE TABLE public.comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),band_id uuid NOT NULL REFERENCES public.bands(id),recording_id uuid NOT NULL,
 author_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),body text NOT NULL CHECK(length(trim(body)) BETWEEN 1 AND 4000),
 at_seconds numeric NOT NULL CHECK(at_seconds>=0 AND at_seconds<86400),created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(recording_id,band_id) REFERENCES public.recordings(id,band_id)
);

-- These helpers avoid recursive membership RLS; their only output is authorization for the caller.
CREATE FUNCTION public.is_member(target uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT EXISTS(SELECT 1 FROM public.memberships WHERE band_id=target AND user_id=auth.uid())
$$;
CREATE FUNCTION public.has_band_role(target uuid,roles text[]) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public,pg_temp AS $$
 SELECT EXISTS(SELECT 1 FROM public.memberships WHERE band_id=target AND user_id=auth.uid() AND role=ANY(roles))
$$;
CREATE FUNCTION public.create_band(band_name text,band_genre text DEFAULT '',band_description text DEFAULT '') RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
 DECLARE new_id uuid; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in first'; END IF;
 INSERT INTO public.bands(name,genre,description) VALUES(trim(band_name),band_genre,band_description) RETURNING id INTO new_id;
 INSERT INTO public.memberships(band_id,user_id,role) VALUES(new_id,auth.uid(),'owner'); RETURN new_id;
 END
$$;
CREATE FUNCTION public.create_invite(target_band uuid,target_email text,target_role text DEFAULT 'member') RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
 DECLARE token text; BEGIN
 IF NOT public.has_band_role(target_band,ARRAY['owner','admin']) THEN RAISE EXCEPTION 'Only band administrators can invite members'; END IF;
 IF target_role='admin' AND NOT public.has_band_role(target_band,ARRAY['owner']) THEN RAISE EXCEPTION 'Only the owner can invite admins'; END IF;
 IF target_role NOT IN ('member','admin') OR length(target_email)>254 OR target_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'Invalid invitation'; END IF;
 token=gen_random_uuid()::text||gen_random_uuid()::text;
 INSERT INTO public.invitations(band_id,email,role,token_hash,created_by) VALUES(target_band,lower(trim(target_email)),target_role,encode(sha256(convert_to(token,'UTF8')),'hex'),auth.uid());
 RETURN token; END
$$;
CREATE FUNCTION public.accept_invite(invite_token text) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
 DECLARE inv public.invitations; recipient text; BEGIN
 SELECT email INTO recipient FROM auth.users WHERE id=auth.uid() AND email_confirmed_at IS NOT NULL;
 SELECT * INTO inv FROM public.invitations WHERE token_hash=encode(sha256(convert_to(invite_token,'UTF8')),'hex') FOR UPDATE;
 IF inv.id IS NULL OR inv.accepted_at IS NOT NULL OR inv.expires_at<=now() OR recipient IS NULL OR lower(recipient)<>inv.email THEN RAISE EXCEPTION 'Invitation is invalid, expired, used, or belongs to another email'; END IF;
 INSERT INTO public.memberships(band_id,user_id,role) VALUES(inv.band_id,auth.uid(),inv.role);
 UPDATE public.invitations SET accepted_at=now() WHERE id=inv.id; RETURN inv.band_id; END
$$;
CREATE FUNCTION public.remove_member(target_band uuid,target_user uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
 DECLARE member_role text; BEGIN
 SELECT role INTO member_role FROM public.memberships WHERE band_id=target_band AND user_id=target_user FOR UPDATE;
 IF member_role='owner' OR NOT public.has_band_role(target_band,ARRAY['owner','admin']) OR (member_role='admin' AND NOT public.has_band_role(target_band,ARRAY['owner'])) THEN RAISE EXCEPTION 'You cannot remove this member'; END IF;
 DELETE FROM public.memberships WHERE band_id=target_band AND user_id=target_user; END
$$;
CREATE FUNCTION public.change_member_role(target_band uuid,target_user uuid,new_role text) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
 BEGIN
 IF NOT public.has_band_role(target_band,ARRAY['owner']) OR new_role NOT IN ('admin','member') THEN RAISE EXCEPTION 'Only the owner can assign admin/member roles'; END IF;
 UPDATE public.memberships SET role=new_role WHERE band_id=target_band AND user_id=target_user AND role<>'owner';
 IF NOT FOUND THEN RAISE EXCEPTION 'Member not found or is the owner'; END IF; END
$$;
CREATE FUNCTION public.add_recording(target_song uuid,object_path text,file_name text,file_mime text,file_size bigint) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public,pg_temp AS $$
 DECLARE song public.songs; next_version integer; new_id uuid; BEGIN
 SELECT * INTO song FROM public.songs WHERE id=target_song FOR UPDATE;
 IF song.id IS NULL OR NOT public.is_member(song.band_id) THEN RAISE EXCEPTION 'Song unavailable'; END IF;
 IF split_part(object_path,'/',1)<>song.band_id::text OR split_part(object_path,'/',2)<>auth.uid()::text OR split_part(object_path,'/',3)<>song.id::text OR NOT EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='band-files' AND name=object_path) THEN RAISE EXCEPTION 'Upload the file to your authorized song folder first'; END IF;
 SELECT coalesce(max(version),0)+1 INTO next_version FROM public.recordings WHERE song_id=target_song;
 INSERT INTO public.recordings(band_id,song_id,storage_path,name,mime,size,version,created_by) VALUES(song.band_id,target_song,object_path,file_name,file_mime,file_size,next_version,auth.uid()) RETURNING id INTO new_id;
 RETURN new_id; END
$$;
CREATE FUNCTION public.freeze_song_identity() RETURNS trigger LANGUAGE plpgsql SET search_path=public,pg_temp AS $$
 BEGIN
 IF NEW.band_id<>OLD.band_id OR NEW.created_by<>OLD.created_by OR NEW.id<>OLD.id THEN RAISE EXCEPTION 'Song identity cannot change'; END IF;
 NEW.updated_at=now(); RETURN NEW; END
$$;
CREATE TRIGGER songs_identity BEFORE UPDATE ON public.songs FOR EACH ROW EXECUTE FUNCTION public.freeze_song_identity();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.profiles,public.bands,public.memberships,public.invitations,public.songs,public.recordings,public.documents,public.messages,public.comments FROM anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON public.profiles TO authenticated;
GRANT SELECT,UPDATE ON public.bands TO authenticated;
GRANT SELECT ON public.memberships,public.invitations,public.recordings TO authenticated;
GRANT SELECT,INSERT,UPDATE ON public.songs TO authenticated;
GRANT SELECT,INSERT ON public.messages,public.comments,public.documents TO authenticated;
CREATE POLICY profile_read ON public.profiles FOR SELECT TO authenticated USING(id=auth.uid() OR EXISTS(SELECT 1 FROM public.memberships m WHERE m.user_id=profiles.id AND public.is_member(m.band_id)));
CREATE POLICY profile_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK(id=auth.uid());
CREATE POLICY profile_update ON public.profiles FOR UPDATE TO authenticated USING(id=auth.uid()) WITH CHECK(id=auth.uid());
CREATE POLICY band_read ON public.bands FOR SELECT TO authenticated USING(public.is_member(id));
CREATE POLICY band_update ON public.bands FOR UPDATE TO authenticated USING(public.has_band_role(id,ARRAY['owner','admin'])) WITH CHECK(public.has_band_role(id,ARRAY['owner','admin']));
CREATE POLICY membership_read ON public.memberships FOR SELECT TO authenticated USING(public.is_member(band_id));
CREATE POLICY invitation_read ON public.invitations FOR SELECT TO authenticated USING(public.has_band_role(band_id,ARRAY['owner','admin']));
CREATE POLICY song_read ON public.songs FOR SELECT TO authenticated USING(public.is_member(band_id));
CREATE POLICY song_insert ON public.songs FOR INSERT TO authenticated WITH CHECK(public.is_member(band_id) AND created_by=auth.uid());
CREATE POLICY song_update ON public.songs FOR UPDATE TO authenticated USING(public.is_member(band_id)) WITH CHECK(public.is_member(band_id));
CREATE POLICY recording_read ON public.recordings FOR SELECT TO authenticated USING(public.is_member(band_id));
CREATE POLICY document_read ON public.documents FOR SELECT TO authenticated USING(public.is_member(band_id));
CREATE POLICY document_insert ON public.documents FOR INSERT TO authenticated WITH CHECK(public.is_member(band_id) AND created_by=auth.uid() AND split_part(storage_path,'/',1)=band_id::text AND split_part(storage_path,'/',2)=auth.uid()::text AND split_part(storage_path,'/',3)=song_id::text AND EXISTS(SELECT 1 FROM storage.objects WHERE bucket_id='band-files' AND name=storage_path));
CREATE POLICY message_read ON public.messages FOR SELECT TO authenticated USING(public.is_member(band_id));
CREATE POLICY message_insert ON public.messages FOR INSERT TO authenticated WITH CHECK(public.is_member(band_id) AND author_id=auth.uid());
CREATE POLICY comment_read ON public.comments FOR SELECT TO authenticated USING(public.is_member(band_id));
CREATE POLICY comment_insert ON public.comments FOR INSERT TO authenticated WITH CHECK(public.is_member(band_id) AND author_id=auth.uid());

INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types) VALUES('band-files','band-files',false,26214400,ARRAY['audio/mpeg','audio/wav','audio/x-wav','audio/wave','audio/mp4','audio/x-m4a','audio/webm','application/pdf','text/plain']);
CREATE POLICY band_file_read ON storage.objects FOR SELECT TO authenticated USING(bucket_id='band-files' AND EXISTS(SELECT 1 FROM public.memberships m WHERE m.band_id::text=split_part(name,'/',1) AND m.user_id=auth.uid()));
CREATE POLICY band_file_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='band-files' AND split_part(name,'/',2)=auth.uid()::text AND EXISTS(SELECT 1 FROM public.songs s WHERE s.id::text=split_part(name,'/',3) AND s.band_id::text=split_part(name,'/',1) AND public.is_member(s.band_id)));
-- A client may clean up only its unreferenced failed uploads. Referenced recording versions remain intact.
CREATE POLICY orphan_file_delete ON storage.objects FOR DELETE TO authenticated USING(bucket_id='band-files' AND split_part(name,'/',2)=auth.uid()::text AND EXISTS(SELECT 1 FROM public.memberships m WHERE m.band_id::text=split_part(name,'/',1) AND m.user_id=auth.uid()) AND NOT EXISTS(SELECT 1 FROM public.recordings r WHERE r.storage_path=name) AND NOT EXISTS(SELECT 1 FROM public.documents d WHERE d.storage_path=name));

REVOKE ALL ON FUNCTION public.is_member(uuid),public.has_band_role(uuid,text[]),public.create_band(text,text,text),public.create_invite(uuid,text,text),public.accept_invite(text),public.remove_member(uuid,uuid),public.change_member_role(uuid,uuid,text),public.add_recording(uuid,text,text,text,bigint) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_member(uuid),public.has_band_role(uuid,text[]),public.create_band(text,text,text),public.create_invite(uuid,text,text),public.accept_invite(text),public.remove_member(uuid,uuid),public.change_member_role(uuid,uuid,text),public.add_recording(uuid,text,text,text,bigint) TO authenticated;
-- Supabase creates this publication. PGlite tests intentionally do not emulate the realtime service.
DO $$ BEGIN IF EXISTS(SELECT 1 FROM pg_publication WHERE pubname='supabase_realtime') THEN
 ALTER PUBLICATION supabase_realtime ADD TABLE public.messages,public.songs,public.recordings,public.comments,public.memberships;
 END IF; END $$;
COMMIT;


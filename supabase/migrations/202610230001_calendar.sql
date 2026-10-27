BEGIN;
CREATE TABLE public.calendar_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), band_id uuid NOT NULL REFERENCES public.bands(id),
 title text NOT NULL CHECK(length(trim(title)) BETWEEN 1 AND 120),
 kind text NOT NULL DEFAULT 'rehearsal' CHECK(kind IN ('rehearsal','gig','session')),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL CHECK(ends_at>starts_at AND ends_at<=starts_at+interval '24 hours'),
 location text NOT NULL DEFAULT '' CHECK(length(location)<=250),
 created_by uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id),created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX calendar_band_time ON public.calendar_events(band_id,starts_at);
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.calendar_events FROM anon,authenticated;
GRANT SELECT,INSERT,DELETE ON public.calendar_events TO authenticated;
CREATE POLICY calendar_read ON public.calendar_events FOR SELECT TO authenticated USING(public.is_member(band_id));
CREATE POLICY calendar_insert ON public.calendar_events FOR INSERT TO authenticated WITH CHECK(public.is_member(band_id) AND created_by=auth.uid());
CREATE POLICY calendar_delete ON public.calendar_events FOR DELETE TO authenticated USING(public.is_member(band_id) AND (created_by=auth.uid() OR public.has_band_role(band_id,ARRAY['owner','admin'])));
COMMIT;

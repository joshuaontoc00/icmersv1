CREATE OR REPLACE FUNCTION public.gen_request_number()
RETURNS text
LANGUAGE sql
VOLATILE
SET search_path = public
AS $$
  SELECT 'ICM-' || lpad(floor(random() * 1000000)::int::text, 6, '0');
$$;

CREATE TABLE public.emergency_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number text NOT NULL DEFAULT public.gen_request_number(),
  reporter_id text NOT NULL CHECK (char_length(reporter_id) BETWEEN 1 AND 60),
  reporter_name text NOT NULL CHECK (char_length(reporter_name) BETWEEN 1 AND 80),
  building text NOT NULL CHECK (char_length(building) BETWEEN 1 AND 40),
  room text NOT NULL CHECK (char_length(room) BETWEEN 1 AND 40),
  description text NOT NULL DEFAULT '' CHECK (char_length(description) <= 500),
  status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Acknowledged')),
  acknowledged_by text,
  acknowledged_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  cleared_at timestamptz
);

COMMENT ON COLUMN public.emergency_requests.cleared_at IS 'Set by reset_demo_data; cleared rows are hidden from the app instead of deleted.';

CREATE INDEX emergency_requests_active_idx ON public.emergency_requests (created_at DESC) WHERE cleared_at IS NULL;

GRANT SELECT, INSERT ON public.emergency_requests TO anon, authenticated;
GRANT ALL ON public.emergency_requests TO service_role;

ALTER TABLE public.emergency_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active emergency requests"
ON public.emergency_requests FOR SELECT
TO anon, authenticated
USING (cleared_at IS NULL);

CREATE POLICY "Anyone can report a pending emergency"
ON public.emergency_requests FOR INSERT
TO anon, authenticated
WITH CHECK (status = 'Pending' AND acknowledged_by IS NULL AND acknowledged_at IS NULL AND cleared_at IS NULL);

ALTER TABLE public.emergency_requests REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.emergency_requests;

CREATE OR REPLACE FUNCTION public.acknowledge_request(_id uuid, _by text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _by IS NULL OR char_length(_by) = 0 OR char_length(_by) > 80 THEN
    RAISE EXCEPTION 'Invalid acknowledger';
  END IF;
  UPDATE public.emergency_requests
     SET status = 'Acknowledged', acknowledged_by = _by, acknowledged_at = now()
   WHERE id = _id AND status = 'Pending' AND cleared_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_demo_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.emergency_requests SET cleared_at = now() WHERE cleared_at IS NULL;
  INSERT INTO public.emergency_requests
    (reporter_id, reporter_name, building, room, description, status, acknowledged_by, acknowledged_at, created_at)
  VALUES
    ('23-10452', 'Carlos Reyes', 'CET', '103', '', 'Acknowledged', 'Dr. Santos', now() - interval '50 minutes', now() - interval '55 minutes'),
    ('24-22817', 'Maria Santos', 'CICS', '102', '', 'Pending', NULL, NULL, now() - interval '20 minutes'),
    ('25-64946', 'Juan Dela Cruz', 'CET', '101', 'Feeling dizzy', 'Pending', NULL, NULL, now() - interval '5 minutes');
END;
$$;

REVOKE ALL ON FUNCTION public.acknowledge_request(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.reset_demo_data() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.acknowledge_request(uuid, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_demo_data() TO anon, authenticated;

INSERT INTO public.emergency_requests
  (request_number, reporter_id, reporter_name, building, room, description, status, acknowledged_by, acknowledged_at, created_at)
VALUES
  ('ICM-104821', '23-10452', 'Carlos Reyes', 'CET', '103', '', 'Acknowledged', 'Dr. Santos', now() - interval '50 minutes', now() - interval '55 minutes'),
  ('ICM-104822', '24-22817', 'Maria Santos', 'CICS', '102', '', 'Pending', NULL, NULL, now() - interval '20 minutes'),
  ('ICM-104823', '25-64946', 'Juan Dela Cruz', 'CET', '101', 'Feeling dizzy', 'Pending', NULL, NULL, now() - interval '5 minutes');
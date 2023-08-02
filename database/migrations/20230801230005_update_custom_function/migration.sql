DROP FUNCTION calculate_score(timestamp without time zone,integer);

CREATE OR REPLACE FUNCTION calculate_score(entry_datetime timestamp, entry_number integer)
RETURNS double precision AS $$
BEGIN
   RETURN (86400000 * exp(1) / (EXTRACT(EPOCH FROM NOW() - entry_datetime) * 1000)) * entry_number;
END;
$$ LANGUAGE plpgsql;

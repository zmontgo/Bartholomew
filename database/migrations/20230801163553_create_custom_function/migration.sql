CREATE OR REPLACE FUNCTION calculate_score(date timestamp, number integer)
RETURNS double precision AS $$
BEGIN
   RETURN (86400000 * exp(1) / (EXTRACT(EPOCH FROM NOW() - date) * 1000)) * number;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION calculate_score(entry_datetime timestamp, entry_number integer)
RETURNS double precision AS $$
DECLARE
  daysAgo CONSTANT double precision := EXTRACT(EPOCH FROM NOW() - entry_datetime) / 86400;
  w_value CONSTANT double precision := 86.56;
BEGIN
  /*
   * Formula: N * e^(-x)
   * N = entry_number
   * x = daysAgo
   */

  RETURN entry_number * exp(-daysAgo / w_value);
END;
$$ LANGUAGE plpgsql;

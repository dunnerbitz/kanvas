-- Migration: remove_nft_update_trigger
-- Created at: 2022-02-03 14:20:39
-- ====  UP  ====

BEGIN;

DROP FUNCTION IF EXISTS update_updated_at_column;
DROP TRIGGER IF EXITS update_nft_updated_at;

ALTER TABLE nft DROP COLUMN updated_at;

COMMIT;

-- ==== DOWN ====

BEGIN;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   IF row(NEW.*) IS DISTINCT FROM row(OLD.*) THEN
      NEW.updated_at = now();
      RETURN NEW;
   ELSE
      RETURN OLD;
   END IF;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_nft_updated_at BEFORE UPDATE ON nft FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();


ALTER TABLE nft ADD COLUMN updated_at TIMESTAMP WITHOUT TIME ZONE;

COMMIT;

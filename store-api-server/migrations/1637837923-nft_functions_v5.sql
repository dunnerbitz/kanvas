-- Migration: nft_functions_v5
-- Created at: 2021-11-25 11:58:43
-- ====  UP  ====

BEGIN;

-- Diff between previous and this version:
--   Added priceAtLeast and priceAtMost filters
ALTER FUNCTION nft_ids_filtered RENAME TO __nft_ids_filtered_v4;
CREATE FUNCTION nft_ids_filtered(
    address TEXT, categories INTEGER[],
    priceAtLeast NUMERIC, priceAtMost NUMERIC,
    orderBy TEXT, orderDirection TEXT,
    "offset" INTEGER, "limit" INTEGER,
    untilNftLastUpdated TIMESTAMP WITHOUT TIME ZONE)
  RETURNS TABLE(nft_id nft.id%TYPE, total_nft_count bigint)
AS $$
BEGIN
  IF orderDirection NOT IN ('asc', 'desc') THEN
    RAISE EXCEPTION 'nfts_filtered(): invalid orderDirection';
  END IF;
  RETURN QUERY EXECUTE '
    SELECT
      nft.id as nft_id,
      COUNT(1) OVER () AS total_nft_count
    FROM nft
    JOIN mtm_nft_category
      ON mtm_nft_category.nft_id = nft.id
    LEFT JOIN mtm_kanvas_user_nft
      ON mtm_kanvas_user_nft.nft_id = nft.id
    LEFT JOIN kanvas_user
      ON mtm_kanvas_user_nft.kanvas_user_id = kanvas_user.id
    WHERE ($1 IS NULL OR nft.updated_at <= $1)
      AND ($2 IS NULL OR kanvas_user.address = $2)
      AND ($3 IS NULL OR nft_category_id = ANY($3))
      AND ($4 IS NULL OR nft.price >= $4)
      AND ($5 IS NULL OR nft.price <= $5)
    GROUP BY nft.id
    ORDER BY ' || quote_ident(orderBy) || ' ' || orderDirection || '
    OFFSET $6
    LIMIT  $7'
    USING untilNftLastUpdated, address, categories, priceAtLeast, priceAtMost, "offset", "limit";
END
$$
LANGUAGE plpgsql;

-- Diff between previous and this version:
--   additionally return price
ALTER FUNCTION nfts_by_id RENAME TO __nfts_by_id_v4;
CREATE FUNCTION nfts_by_id(ids INTEGER[], orderBy TEXT, orderDirection TEXT)
  RETURNS TABLE(
    nft_id INTEGER, nft_name TEXT, ipfs_hash TEXT, metadata jsonb, data_uri TEXT, contract TEXT, price NUMERIC, token_id TEXT, categories TEXT[][], editions_available BIGINT)
AS $$
BEGIN
  IF orderDirection NOT IN ('asc', 'desc') THEN
    RAISE EXCEPTION 'nfts_by_id(): invalid orderDirection';
  END IF;
  RETURN QUERY EXECUTE '
    SELECT
      nft.id as nft_id,
      nft_name,
      ipfs_hash,
      metadata,
      data_uri,
      contract,
      price,
      token_id,
      ARRAY_AGG(ARRAY[category, cat.description]) AS categories,
      nft.editions_size - (
        SELECT reserved + owned FROM nft_editions_locked(nft.id)
      ) AS editions_available
    FROM nft
    JOIN mtm_nft_category AS mtm
      ON mtm.nft_id = nft.id
    JOIN nft_category AS cat
      ON mtm.nft_category_id = cat.id
    WHERE nft.id = ANY($1)
    GROUP BY
      nft.id, nft_name, ipfs_hash, metadata, data_uri, contract, token_id, nft.editions_size
    ORDER BY ' || quote_ident(orderBy) || ' ' || orderDirection
    USING ids;
END
$$
LANGUAGE plpgsql;

COMMIT;

-- ==== DOWN ====

BEGIN;

DROP FUNCTION nfts_by_id(INTEGER[], TEXT, TEXT);
ALTER FUNCTION __nfts_by_id_v4 RENAME TO nfts_by_id;

DROP FUNCTION nft_ids_filtered(
    TEXT, INTEGER[],
    NUMERIC, NUMERIC,
    TEXT, TEXT,
    INTEGER, INTEGER,
    TIMESTAMP WITHOUT TIME ZONE);
ALTER FUNCTION __nft_ids_filtered_v4 RENAME TO nft_ids_filtered;

COMMIT;
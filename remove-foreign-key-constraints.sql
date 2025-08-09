-- 外部キー制約を削除してローカル認証と互換性を持たせる

-- schoolsテーブルの外部キー制約を削除
ALTER TABLE schools DROP CONSTRAINT IF EXISTS schools_user_id_fkey;

-- user_idカラムをtext型に変更（UUID制約を緩める）
ALTER TABLE schools ALTER COLUMN user_id TYPE text;

-- 必要に応じて、他のテーブルも同様に修正
-- ALTER TABLE players DROP CONSTRAINT IF EXISTS players_school_id_fkey;
-- ALTER TABLE hand_cards DROP CONSTRAINT IF EXISTS hand_cards_school_id_fkey;

-- 注意: 本番環境では適切な外部キー制約を設定してください
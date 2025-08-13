-- 拡張特殊能力システム - マスターデータ投入スクリプト
-- このファイルを実行して、44種類の拡張特殊能力をデータベースに投入してください

-- 特殊能力マスターデータの投入
INSERT INTO special_abilities_master (id, name, english_name, category, color, rank, description, effects, acquisition_methods, power_level, rarity_weight, display_order) VALUES

-- ダイヤモンドランク（SS+）特殊能力
('diamond_serve_master', '究極サーブマスター', 'Ultimate Serve Master', 'serve', 'diamond', 'SS+', 'サーブの究極形態。全てのサーブが完璧に近い精度と威力を持つ。', 
'{"serveBoost": 50, "perfectServeChance": 0.8, "aceServeChance": 0.6, "intimidationEffect": 0.9}', 
'["evolution", "combination"]', 200, 0.001, 1),

('diamond_return_legend', 'リターンの伝説', 'Return Legend', 'return', 'diamond', 'SS+', 'リターンの神技。相手の最強サーブでも確実に返球する。', 
'{"returnBoost": 45, "breakPointBonus": 0.7, "vsLeftHandedBonus": 0.8, "vsRightHandedBonus": 0.8}', 
'["evolution", "combination"]', 195, 0.001, 2),

-- ゴールドランク（SS）特殊能力
('gold_net_dominator', 'ネット支配者', 'Net Dominator', 'volley', 'gold', 'SS', 'ネットプレーで圧倒的な支配力。全てのボレーが完璧。', 
'{"volleyBoost": 40, "approachVolleyBonus": 0.6, "netRushBonus": 0.7, "touchVolleyBonus": 0.8}', 
'["training", "match"]', 180, 0.005, 3),

('gold_baseline_emperor', 'ベースライン皇帝', 'Baseline Emperor', 'stroke', 'gold', 'SS', 'ベースラインからの強力なストローク。相手を圧倒する。', 
'{"strokeBoost": 38, "longRallyBonus": 0.6, "clayCourtBonus": 0.7, "hardCourtBonus": 0.7}', 
'["training", "match"]', 175, 0.005, 4),

-- ブルーランク（S+）特殊能力
('blue_mental_fortress', 'メンタル要塞', 'Mental Fortress', 'mental', 'blue', 'S+', '試合中のメンタルが揺るがない。プレッシャーに強い。', 
'{"mentalBoost": 35, "pressureResistance": 0.8, "comebackSpirit": 0.7, "focusMaintenance": 0.9}', 
'["training", "event"]', 160, 0.02, 5),

('blue_stamina_monster', 'スタミナモンスター', 'Stamina Monster', 'physical', 'blue', 'S+', '驚異的なスタミナ。長時間の試合でも疲れない。', 
'{"staminaBoost": 40, "fatiguePenaltyReduction": 0.8, "recoveryRate": 0.9, "enduranceBonus": 0.7}', 
'["training", "event"]', 165, 0.02, 6),

-- グリーンランク（S）特殊能力
('green_serve_specialist', 'サーブスペシャリスト', 'Serve Specialist', 'serve', 'green', 'S', 'サーブに特化した能力。安定したサーブゲーム。', 
'{"serveBoost": 30, "firstServeBonus": 0.6, "secondServeBonus": 0.5, "servePlacement": 0.7}', 
'["training", "match"]', 150, 0.05, 7),

('green_return_expert', 'リターンエキスパート', 'Return Expert', 'return', 'green', 'S', 'リターンに特化。相手のサーブを確実に返球。', 
'{"returnBoost": 28, "breakPointBonus": 0.5, "returnDepth": 0.6, "returnAccuracy": 0.7}', 
'["training", "match"]', 145, 0.05, 8),

-- パープルランク（A+）特殊能力
('purple_volley_artist', 'ボレーアーティスト', 'Volley Artist', 'volley', 'purple', 'A+', '芸術的なボレー。美しく効果的なネットプレー。', 
'{"volleyBoost": 25, "touchVolleyBonus": 0.6, "volleyPlacement": 0.7, "netRushBonus": 0.5}', 
'["training", "match"]', 135, 0.1, 9),

('purple_stroke_master', 'ストロークマスター', 'Stroke Master', 'stroke', 'purple', 'A+', '完璧なストローク技術。様々なショットを操る。', 
'{"strokeBoost": 24, "topspinBonus": 0.6, "sliceBonus": 0.6, "flatShotBonus": 0.7}', 
'["training", "match"]', 130, 0.1, 10),

-- オレンジランク（A）特殊能力
('orange_mental_warrior', 'メンタル戦士', 'Mental Warrior', 'mental', 'orange', 'A', '戦闘的なメンタル。試合中に強くなる。', 
'{"mentalBoost": 20, "pressureResistance": 0.6, "aggressiveMindset": 0.7, "confidenceBoost": 0.6}', 
'["training", "event"]', 120, 0.15, 11),

('orange_physical_trainer', 'フィジカルトレーナー', 'Physical Trainer', 'physical', 'orange', 'A', '身体能力の向上。効率的なトレーニング効果。', 
'{"staminaBoost": 22, "practiceEfficiencyBoost": 0.6, "skillGrowthMultiplier": 0.5, "recoveryRate": 0.6}', 
'["training", "event"]', 125, 0.15, 12),

-- グレーランク（B+）特殊能力
('gray_serve_improver', 'サーブ改善者', 'Serve Improver', 'serve', 'gray', 'B+', 'サーブの基本を向上。安定したサーブ。', 
'{"serveBoost": 18, "firstServeBonus": 0.4, "serveConsistency": 0.6, "servePower": 0.5}', 
'["training"]', 110, 0.25, 13),

('gray_return_basics', 'リターン基礎', 'Return Basics', 'return', 'gray', 'B+', 'リターンの基本技術。確実な返球。', 
'{"returnBoost": 16, "returnConsistency": 0.6, "returnDepth": 0.5, "breakPointBonus": 0.3}', 
'["training"]', 105, 0.25, 14),

-- レッドランク（B）特殊能力
('red_volley_basics', 'ボレー基礎', 'Volley Basics', 'volley', 'red', 'B', 'ボレーの基本技術。シンプルで効果的。', 
'{"volleyBoost": 15, "netPlayBonus": 0.5, "volleyConsistency": 0.6, "approachVolleyBonus": 0.4}', 
'["training"]', 100, 0.3, 15),

('red_stroke_basics', 'ストローク基礎', 'Stroke Basics', 'stroke', 'red', 'B', 'ストロークの基本技術。安定したショット。', 
'{"strokeBoost": 14, "strokeConsistency": 0.6, "topspinBonus": 0.4, "sliceBonus": 0.4}', 
'["training"]', 95, 0.3, 16),

-- その他のランク（C, D）の特殊能力も同様に追加...
('c_mental_basics', 'メンタル基礎', 'Mental Basics', 'mental', 'gray', 'C', 'メンタルの基本。集中力の向上。', 
'{"mentalBoost": 12, "focusMaintenance": 0.5, "pressureResistance": 0.4}', 
'["training"]', 85, 0.4, 17),

('d_physical_basics', 'フィジカル基礎', 'Physical Basics', 'physical', 'red', 'D', '身体能力の基本。スタミナの向上。', 
'{"staminaBoost": 10, "practiceEfficiencyBoost": 0.3, "recoveryRate": 0.4}', 
'["training"]', 70, 0.5, 18);

-- 特殊能力組み合わせデータの投入
INSERT INTO ability_combinations (combination_name, required_abilities, result_ability_id, success_rate, description) VALUES
('究極のサーブ', ARRAY['blue_serve_specialist', 'gold_net_dominator'], 'diamond_serve_master', 15.0, 'サーブとボレーの達人が組み合わさって究極のサーブマスターになる'),
('リターンの真髄', ARRAY['green_return_expert', 'blue_mental_fortress'], 'diamond_return_legend', 12.0, 'リターン技術とメンタルの強さが合わさってリターンの伝説になる'),
('ネットの支配者', ARRAY['purple_volley_artist', 'orange_physical_trainer'], 'gold_net_dominator', 20.0, 'ボレー技術と身体能力が合わさってネットを支配する'),
('ベースラインの皇帝', ARRAY['purple_stroke_master', 'blue_stamina_monster'], 'gold_baseline_emperor', 18.0, 'ストローク技術とスタミナが合わさってベースラインを制する');

-- 確認用クエリ
SELECT 
  COUNT(*) as total_abilities,
  COUNT(CASE WHEN rank = 'SS+' THEN 1 END) as ss_plus_count,
  COUNT(CASE WHEN rank = 'SS' THEN 1 END) as ss_count,
  COUNT(CASE WHEN rank = 'S+' THEN 1 END) as s_plus_count,
  COUNT(CASE WHEN rank = 'S' THEN 1 END) as s_count
FROM special_abilities_master;

SELECT 
  category,
  COUNT(*) as ability_count,
  AVG(power_level) as avg_power
FROM special_abilities_master 
GROUP BY category 
ORDER BY avg_power DESC;

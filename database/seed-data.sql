-- Seed data for Pregnancy Blood Pressure Tracker
-- Reference data for symptoms and medications

-- Insert common pregnancy and cardiovascular symptoms
INSERT INTO symptoms (name, category, description, severity_scale) VALUES
-- Physical symptoms
('Headache', 'physical', 'Head pain or discomfort', 10),
('Dizziness', 'physical', 'Feeling lightheaded or unsteady', 5),
('Fatigue', 'physical', 'Excessive tiredness or lack of energy', 5),
('Nausea', 'physical', 'Feeling sick to stomach', 5),
('Vomiting', 'physical', 'Throwing up', 3),
('Blurred Vision', 'physical', 'Difficulty seeing clearly', 10),
('Chest Pain', 'physical', 'Pain or discomfort in chest area', 10),
('Shortness of Breath', 'physical', 'Difficulty breathing', 10),
('Swelling in Hands', 'physical', 'Fluid retention in hands', 5),
('Swelling in Feet', 'physical', 'Fluid retention in feet and ankles', 5),
('Swelling in Face', 'physical', 'Facial puffiness or swelling', 8),
('Back Pain', 'physical', 'Lower or upper back discomfort', 5),
('Palpitations', 'cardiovascular', 'Awareness of heart beating', 8),
('Rapid Heartbeat', 'cardiovascular', 'Heart rate feels too fast', 8),

-- Pregnancy-specific symptoms
('Morning Sickness', 'pregnancy-specific', 'Nausea and vomiting during pregnancy', 5),
('Braxton Hicks Contractions', 'pregnancy-specific', 'False labor contractions', 3),
('Leg Cramps', 'pregnancy-specific', 'Muscle cramps in legs', 3),
('Heartburn', 'pregnancy-specific', 'Acid reflux and burning sensation', 3),
('Frequent Urination', 'pregnancy-specific', 'Need to urinate more often', 2),
('Breast Tenderness', 'pregnancy-specific', 'Sore or sensitive breasts', 3),
('Food Cravings', 'pregnancy-specific', 'Strong desire for specific foods', 1),
('Food Aversions', 'pregnancy-specific', 'Strong dislike for certain foods', 2),
('Mood Swings', 'pregnancy-specific', 'Rapid changes in emotional state', 3),
('Difficulty Sleeping', 'pregnancy-specific', 'Trouble falling or staying asleep', 5),

-- Emotional symptoms
('Anxiety', 'emotional', 'Feelings of worry or nervousness', 8),
('Stress', 'emotional', 'Feeling overwhelmed or under pressure', 8),
('Irritability', 'emotional', 'Easily annoyed or frustrated', 5),
('Depression', 'emotional', 'Persistent feelings of sadness', 10),

-- Cardiovascular symptoms
('Irregular Heartbeat', 'cardiovascular', 'Heart rhythm feels abnormal', 10),
('Slow Heartbeat', 'cardiovascular', 'Heart rate feels too slow', 8),
('Skipped Heartbeat', 'cardiovascular', 'Feeling like heart skipped a beat', 6);

-- Insert common medications for pregnancy and blood pressure
INSERT INTO medications (name, generic_name, category, dosage_forms, pregnancy_category, common_dosages, description, warnings) VALUES
-- Antihypertensive medications (pregnancy-safe)
('Labetalol', 'labetalol', 'antihypertensive', ARRAY['tablet'], 'C', ARRAY['100mg', '200mg', '300mg'], 
 'Beta-blocker used to treat high blood pressure during pregnancy', 
 'Monitor for low blood pressure and slow heart rate'),

('Methyldopa', 'methyldopa', 'antihypertensive', ARRAY['tablet'], 'B', ARRAY['250mg', '500mg'], 
 'First-line treatment for high blood pressure in pregnancy', 
 'May cause drowsiness and dizziness'),

('Nifedipine', 'nifedipine', 'antihypertensive', ARRAY['tablet', 'capsule'], 'C', ARRAY['10mg', '20mg', '30mg'], 
 'Calcium channel blocker for treating high blood pressure', 
 'Extended-release formulations preferred during pregnancy'),

('Hydralazine', 'hydralazine', 'antihypertensive', ARRAY['tablet', 'injection'], 'C', ARRAY['25mg', '50mg', '100mg'], 
 'Vasodilator used for severe hypertension in pregnancy', 
 'Reserved for severe cases, monitor for headache and palpitations'),

-- Prenatal vitamins and supplements
('Prenatal Vitamin', 'multivitamin', 'prenatal', ARRAY['tablet', 'capsule', 'liquid'], 'A', ARRAY['1 tablet daily'], 
 'Comprehensive vitamin and mineral supplement for pregnancy', 
 'Take with food to reduce nausea'),

('Folic Acid', 'folic acid', 'prenatal', ARRAY['tablet'], 'A', ARRAY['400mcg', '800mcg', '5mg'], 
 'Essential B vitamin for preventing birth defects', 
 'Should be taken before conception and throughout pregnancy'),

('Iron Supplement', 'ferrous sulfate', 'supplement', ARRAY['tablet', 'liquid'], 'A', ARRAY['18mg', '27mg', '65mg'], 
 'Iron supplement for preventing anemia during pregnancy', 
 'May cause constipation and stomach upset'),

('Calcium', 'calcium carbonate', 'supplement', ARRAY['tablet', 'capsule'], 'A', ARRAY['500mg', '600mg', '1000mg'], 
 'Calcium supplement for bone health during pregnancy', 
 'Take separately from iron supplements for better absorption'),

('Vitamin D', 'cholecalciferol', 'supplement', ARRAY['tablet', 'capsule', 'liquid'], 'A', ARRAY['400IU', '1000IU', '2000IU'], 
 'Vitamin D supplement for bone health and immune function', 
 'Safe during pregnancy when used as directed'),

('Magnesium', 'magnesium oxide', 'supplement', ARRAY['tablet', 'capsule'], 'A', ARRAY['200mg', '400mg'], 
 'Magnesium supplement for muscle and nerve function', 
 'May help with leg cramps during pregnancy'),

('Fish Oil', 'omega-3 fatty acids', 'supplement', ARRAY['capsule', 'liquid'], 'A', ARRAY['1000mg'], 
 'Omega-3 fatty acids for fetal brain development', 
 'Choose mercury-free formulations'),

-- Common safe medications during pregnancy
('Acetaminophen', 'acetaminophen', 'other', ARRAY['tablet', 'capsule', 'liquid'], 'B', ARRAY['325mg', '500mg', '650mg'], 
 'Pain reliever and fever reducer safe during pregnancy', 
 'Preferred pain medication during pregnancy'),

('Antacid', 'calcium carbonate', 'other', ARRAY['tablet', 'liquid'], 'A', ARRAY['500mg', '750mg'], 
 'Medication for heartburn and indigestion', 
 'Safe for occasional use during pregnancy'),

('Simethicone', 'simethicone', 'other', ARRAY['tablet', 'liquid'], 'A', ARRAY['40mg', '80mg'], 
 'Medication for gas and bloating', 
 'Safe during pregnancy'),

-- Medications to monitor closely
('Low-dose Aspirin', 'aspirin', 'other', ARRAY['tablet'], 'C', ARRAY['81mg'], 
 'Low-dose aspirin for preventing preeclampsia in high-risk patients', 
 'Only use when prescribed by healthcare provider');

-- Insert sample symptom severity scales and categories
COMMENT ON COLUMN symptoms.severity_scale IS 'Maximum severity rating (1-10 scale)';
COMMENT ON COLUMN symptoms.category IS 'physical, emotional, pregnancy-specific, cardiovascular';

-- Insert pregnancy categories explanation
COMMENT ON COLUMN medications.pregnancy_category IS 'FDA pregnancy categories: A=Safe, B=Probably safe, C=Use with caution, D=Risk present, X=Contraindicated';
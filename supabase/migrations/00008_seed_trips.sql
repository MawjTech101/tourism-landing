-- ============================================================
-- TRIP 1: Istanbul, Turkey — 7 Days / 6 Nights (DEAL + ENDING SOON)
-- ============================================================
INSERT INTO trips (id, tenant_id, title_ar, title_en, slug, destination_ar, destination_en,
  duration_days, duration_nights, price_from, price_to, description_ar, description_en,
  inclusions, exclusions, tags, is_deal, is_ending_soon, deal_price, deal_expiry,
  status, sort_order)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  '932ee790-31d7-4987-b2d3-600cb16137c0',
  'اسطنبول الساحرة',
  'Enchanting Istanbul',
  'enchanting-istanbul',
  'اسطنبول، تركيا',
  'Istanbul, Turkey',
  7, 6,
  3500, 4200,
  'استمتع برحلة مميزة إلى اسطنبول تشمل زيارة أهم المعالم التاريخية والأسواق الشعبية والمطاعم المطلة على البوسفور. تجربة لا تُنسى تجمع بين عبق التاريخ وروعة الحاضر.',
  'Enjoy a unique trip to Istanbul featuring visits to the most iconic historical landmarks, traditional markets, and restaurants overlooking the Bosphorus. An unforgettable experience blending the fragrance of history with the beauty of the present.',
  '[{"text_ar":"تذاكر الطيران ذهاب وعودة","text_en":"Round-trip flight tickets"},{"text_ar":"الإقامة في فندق 4 نجوم","text_en":"4-star hotel accommodation"},{"text_ar":"وجبة إفطار يومية","text_en":"Daily breakfast"},{"text_ar":"جولات سياحية بسيارة خاصة","text_en":"Private car sightseeing tours"},{"text_ar":"مرشد سياحي عربي","text_en":"Arabic-speaking tour guide"},{"text_ar":"تأمين سفر شامل","text_en":"Comprehensive travel insurance"}]',
  '[{"text_ar":"المصاريف الشخصية","text_en":"Personal expenses"},{"text_ar":"وجبات الغداء والعشاء","text_en":"Lunch and dinner"},{"text_ar":"دخول بعض المتاحف","text_en":"Admission to some museums"}]',
  '["عائلي", "تاريخي", "تسوق"]',
  true, true, 2999, '2026-03-20T00:00:00Z',
  'active', 1
);

-- Hotels for Trip 1
INSERT INTO hotels (id, tenant_id, name, city_ar, city_en, stars) VALUES
  ('h1000000-0000-0000-0000-000000000001', '932ee790-31d7-4987-b2d3-600cb16137c0', 'Grand Hyatt Istanbul', 'اسطنبول', 'Istanbul', 5),
  ('h1000000-0000-0000-0000-000000000002', '932ee790-31d7-4987-b2d3-600cb16137c0', 'Dosso Dossi Hotels', 'اسطنبول', 'Istanbul', 4);

INSERT INTO trip_hotels (trip_id, hotel_id, nights, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000001', 'h1000000-0000-0000-0000-000000000001', 3, 1),
  ('a1000000-0000-0000-0000-000000000001', 'h1000000-0000-0000-0000-000000000002', 3, 2);

-- Itinerary for Trip 1
INSERT INTO itinerary_days (id, trip_id, day_number, title_ar, title_en, description_ar, description_en, city_ar, city_en) VALUES
  ('d1000001-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 1, 'الوصول إلى اسطنبول', 'Arrival in Istanbul', 'الوصول إلى مطار اسطنبول والتوجه إلى الفندق للراحة', 'Arrive at Istanbul Airport and transfer to the hotel for rest', 'اسطنبول', 'Istanbul'),
  ('d1000001-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 2, 'السلطان أحمد والمعالم التاريخية', 'Sultanahmet & Historical Landmarks', 'زيارة آيا صوفيا والمسجد الأزرق وقصر توبكابي', 'Visit Hagia Sophia, Blue Mosque, and Topkapi Palace', 'اسطنبول', 'Istanbul'),
  ('d1000001-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000001', 3, 'رحلة البوسفور', 'Bosphorus Cruise', 'جولة بحرية في مضيق البوسفور مع زيارة قلعة روملي حصار', 'Bosphorus boat cruise with a visit to Rumeli Fortress', 'اسطنبول', 'Istanbul'),
  ('d1000001-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000001', 4, 'تقسيم وشارع الاستقلال', 'Taksim & Istiklal Street', 'جولة حرة في ميدان تقسيم وشارع الاستقلال والتسوق', 'Free time at Taksim Square, Istiklal Street, and shopping', 'اسطنبول', 'Istanbul'),
  ('d1000001-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000001', 5, 'بورصة - المدينة الخضراء', 'Bursa - The Green City', 'رحلة يومية إلى بورصة بالتلفريك وزيارة الجامع الكبير والأسواق', 'Day trip to Bursa via cable car, visiting the Grand Mosque and markets', 'بورصة', 'Bursa'),
  ('d1000001-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000001', 6, 'أسواق اسطنبول الكبرى', 'Grand Bazaar & Spice Market', 'زيارة البازار الكبير وسوق التوابل المصري', 'Visit the Grand Bazaar and Egyptian Spice Market', 'اسطنبول', 'Istanbul'),
  ('d1000001-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000001', 7, 'يوم المغادرة', 'Departure Day', 'وقت حر ثم التوجه إلى المطار', 'Free time then transfer to the airport', 'اسطنبول', 'Istanbul');

-- Activities for Trip 1
INSERT INTO itinerary_activities (day_id, sort_order, title_ar, title_en, description_ar, description_en, activity_type) VALUES
  ('d1000001-0000-0000-0000-000000000001', 1, 'استقبال في المطار', 'Airport Welcome', 'استقبال خاص في مطار اسطنبول', 'Private welcome at Istanbul Airport', 'transport'),
  ('d1000001-0000-0000-0000-000000000001', 2, 'التوجه للفندق', 'Hotel Transfer', 'نقل بسيارة خاصة إلى الفندق', 'Private car transfer to the hotel', 'transport'),
  ('d1000001-0000-0000-0000-000000000001', 3, 'عشاء ترحيبي', 'Welcome Dinner', 'عشاء في مطعم مطل على البوسفور', 'Dinner at a Bosphorus-view restaurant', 'meal'),
  ('d1000001-0000-0000-0000-000000000002', 1, 'زيارة آيا صوفيا', 'Visit Hagia Sophia', 'جولة داخل متحف آيا صوفيا التاريخي', 'Tour inside the historic Hagia Sophia', 'sightseeing'),
  ('d1000001-0000-0000-0000-000000000002', 2, 'المسجد الأزرق', 'Blue Mosque', 'زيارة جامع السلطان أحمد', 'Visit Sultan Ahmed Mosque', 'sightseeing'),
  ('d1000001-0000-0000-0000-000000000002', 3, 'قصر توبكابي', 'Topkapi Palace', 'جولة في قصر توبكابي العثماني', 'Tour of the Ottoman Topkapi Palace', 'sightseeing'),
  ('d1000001-0000-0000-0000-000000000003', 1, 'رحلة بحرية', 'Boat Cruise', 'جولة بحرية ساعتين في البوسفور', '2-hour Bosphorus boat cruise', 'sightseeing'),
  ('d1000001-0000-0000-0000-000000000003', 2, 'غداء سمك', 'Fish Lunch', 'غداء سمك طازج على الشاطئ', 'Fresh fish lunch by the shore', 'meal'),
  ('d1000001-0000-0000-0000-000000000004', 1, 'ميدان تقسيم', 'Taksim Square', 'جولة حرة في ميدان تقسيم', 'Free time at Taksim Square', 'free'),
  ('d1000001-0000-0000-0000-000000000004', 2, 'تسوق', 'Shopping', 'تسوق في شارع الاستقلال', 'Shopping on Istiklal Street', 'shopping'),
  ('d1000001-0000-0000-0000-000000000005', 1, 'التلفريك', 'Cable Car', 'صعود جبل أولوداغ بالتلفريك', 'Cable car ride up Uludag Mountain', 'sightseeing'),
  ('d1000001-0000-0000-0000-000000000005', 2, 'الجامع الكبير', 'Grand Mosque', 'زيارة الجامع الكبير في بورصة', 'Visit the Grand Mosque in Bursa', 'sightseeing'),
  ('d1000001-0000-0000-0000-000000000005', 3, 'غداء إسكندر كباب', 'Iskender Kebab Lunch', 'تذوق أشهر أطباق بورصة', 'Taste the most famous dish of Bursa', 'meal'),
  ('d1000001-0000-0000-0000-000000000006', 1, 'البازار الكبير', 'Grand Bazaar', 'تسوق في أكبر سوق مغلق في العالم', 'Shopping in the largest covered market in the world', 'shopping'),
  ('d1000001-0000-0000-0000-000000000006', 2, 'سوق التوابل', 'Spice Market', 'زيارة السوق المصري', 'Visit the Egyptian Bazaar', 'shopping'),
  ('d1000001-0000-0000-0000-000000000007', 1, 'وقت حر', 'Free Time', 'وقت حر للتسوق أو الراحة', 'Free time for shopping or relaxation', 'free'),
  ('d1000001-0000-0000-0000-000000000007', 2, 'التوجه للمطار', 'Airport Transfer', 'نقل إلى مطار اسطنبول', 'Transfer to Istanbul Airport', 'transport');

-- ============================================================
-- TRIP 2: Kuala Lumpur & Langkawi, Malaysia — 8 Days / 7 Nights (DEAL)
-- ============================================================
INSERT INTO trips (id, tenant_id, title_ar, title_en, slug, destination_ar, destination_en,
  duration_days, duration_nights, price_from, price_to, description_ar, description_en,
  inclusions, exclusions, tags, is_deal, is_ending_soon, deal_price, deal_expiry,
  status, sort_order)
VALUES (
  'a1000000-0000-0000-0000-000000000002',
  '932ee790-31d7-4987-b2d3-600cb16137c0',
  'ماليزيا الاستوائية',
  'Tropical Malaysia',
  'tropical-malaysia',
  'كوالالمبور ولنكاوي، ماليزيا',
  'Kuala Lumpur & Langkawi, Malaysia',
  8, 7,
  4500, 5800,
  'رحلة شاملة إلى ماليزيا تجمع بين إثارة العاصمة كوالالمبور وجمال جزيرة لنكاوي الاستوائية. من الأبراج التوأم إلى شواطئ الكريستال الصافية.',
  'A comprehensive trip to Malaysia combining the excitement of Kuala Lumpur with the tropical beauty of Langkawi Island. From the Petronas Towers to crystal-clear beaches.',
  '[{"text_ar":"تذاكر الطيران الدولية والداخلية","text_en":"International and domestic flight tickets"},{"text_ar":"الإقامة في فنادق 4-5 نجوم","text_en":"4-5 star hotel accommodation"},{"text_ar":"وجبة إفطار يومية","text_en":"Daily breakfast"},{"text_ar":"جولة في كوالالمبور","text_en":"Kuala Lumpur city tour"},{"text_ar":"رحلة التلفريك في لنكاوي","text_en":"Langkawi cable car ride"},{"text_ar":"جولة بحرية في الجزر","text_en":"Island hopping boat tour"},{"text_ar":"تأمين سفر","text_en":"Travel insurance"}]',
  '[{"text_ar":"رسوم التأشيرة (إن وجدت)","text_en":"Visa fees (if applicable)"},{"text_ar":"المصاريف الشخصية","text_en":"Personal expenses"},{"text_ar":"الأنشطة المائية الإضافية","text_en":"Additional water activities"}]',
  '["عائلي", "شواطئ", "طبيعة", "مغامرة"]',
  true, false, 3999, NULL,
  'active', 2
);

INSERT INTO hotels (id, tenant_id, name, city_ar, city_en, stars) VALUES
  ('h1000000-0000-0000-0000-000000000003', '932ee790-31d7-4987-b2d3-600cb16137c0', 'Mandarin Oriental KL', 'كوالالمبور', 'Kuala Lumpur', 5),
  ('h1000000-0000-0000-0000-000000000004', '932ee790-31d7-4987-b2d3-600cb16137c0', 'The Danna Langkawi', 'لنكاوي', 'Langkawi', 5);

INSERT INTO trip_hotels (trip_id, hotel_id, nights, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000002', 'h1000000-0000-0000-0000-000000000003', 3, 1),
  ('a1000000-0000-0000-0000-000000000002', 'h1000000-0000-0000-0000-000000000004', 4, 2);

INSERT INTO itinerary_days (id, trip_id, day_number, title_ar, title_en, description_ar, description_en, city_ar, city_en) VALUES
  ('d1000002-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 1, 'الوصول إلى كوالالمبور', 'Arrival in Kuala Lumpur', 'الوصول والتوجه للفندق والراحة', 'Arrival and hotel transfer for rest', 'كوالالمبور', 'Kuala Lumpur'),
  ('d1000002-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 2, 'جولة في كوالالمبور', 'Kuala Lumpur City Tour', 'زيارة الأبراج التوأم ومنارة كوالالمبور وكهوف باتو', 'Visit Petronas Towers, KL Tower, and Batu Caves', 'كوالالمبور', 'Kuala Lumpur'),
  ('d1000002-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 3, 'مرتفعات جنتنج', 'Genting Highlands', 'رحلة يومية إلى مرتفعات جنتنج بالتلفريك', 'Day trip to Genting Highlands via cable car', 'جنتنج', 'Genting'),
  ('d1000002-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', 4, 'التسوق والسفر للنكاوي', 'Shopping & Fly to Langkawi', 'تسوق صباحي ثم رحلة داخلية إلى لنكاوي', 'Morning shopping then domestic flight to Langkawi', 'كوالالمبور', 'Kuala Lumpur'),
  ('d1000002-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', 5, 'تلفريك لنكاوي وجسر السماء', 'Langkawi Cable Car & Sky Bridge', 'صعود تلفريك لنكاوي والمشي على جسر السماء المعلق', 'Ride the Langkawi cable car and walk the suspended Sky Bridge', 'لنكاوي', 'Langkawi'),
  ('d1000002-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 6, 'جولة الجزر', 'Island Hopping', 'جولة بحرية تشمل جزيرة العذراء الحامل وبحيرة المياه العذبة', 'Boat tour including Pregnant Maiden Island and Freshwater Lake', 'لنكاوي', 'Langkawi'),
  ('d1000002-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', 7, 'يوم حر على الشاطئ', 'Free Beach Day', 'يوم حر للاستمتاع بالشاطئ والأنشطة المائية', 'Free day to enjoy the beach and water activities', 'لنكاوي', 'Langkawi'),
  ('d1000002-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', 8, 'المغادرة', 'Departure', 'وقت حر ثم التوجه للمطار', 'Free time then airport transfer', 'لنكاوي', 'Langkawi');

INSERT INTO itinerary_activities (day_id, sort_order, title_ar, title_en, description_ar, description_en, activity_type) VALUES
  ('d1000002-0000-0000-0000-000000000001', 1, 'استقبال المطار', 'Airport Welcome', 'استقبال ونقل خاص', 'Private welcome and transfer', 'transport'),
  ('d1000002-0000-0000-0000-000000000001', 2, 'عشاء في جالان ألور', 'Dinner at Jalan Alor', 'عشاء في شارع الطعام الشهير', 'Dinner at the famous food street', 'meal'),
  ('d1000002-0000-0000-0000-000000000002', 1, 'الأبراج التوأم', 'Petronas Towers', 'زيارة أبراج بتروناس التوأم', 'Visit the iconic Petronas Twin Towers', 'sightseeing'),
  ('d1000002-0000-0000-0000-000000000002', 2, 'كهوف باتو', 'Batu Caves', 'زيارة كهوف باتو الشهيرة', 'Visit the famous Batu Caves', 'sightseeing'),
  ('d1000002-0000-0000-0000-000000000002', 3, 'منارة كوالالمبور', 'KL Tower', 'صعود منارة كوالالمبور للمنظر البانورامي', 'Ascend KL Tower for panoramic views', 'sightseeing'),
  ('d1000002-0000-0000-0000-000000000003', 1, 'تلفريك جنتنج', 'Genting Cable Car', 'صعود مرتفعات جنتنج بالتلفريك', 'Cable car up to Genting Highlands', 'sightseeing'),
  ('d1000002-0000-0000-0000-000000000003', 2, 'وقت حر في جنتنج', 'Free Time at Genting', 'ترفيه وتسوق في المجمع', 'Entertainment and shopping at the complex', 'free'),
  ('d1000002-0000-0000-0000-000000000004', 1, 'تسوق في بوكيت بينتانج', 'Shopping in Bukit Bintang', 'تسوق في أشهر مناطق التسوق', 'Shopping in the most famous shopping district', 'shopping'),
  ('d1000002-0000-0000-0000-000000000004', 2, 'رحلة داخلية', 'Domestic Flight', 'طيران من كوالالمبور إلى لنكاوي', 'Flight from KL to Langkawi', 'transport'),
  ('d1000002-0000-0000-0000-000000000005', 1, 'تلفريك لنكاوي', 'Langkawi Cable Car', 'صعود تلفريك لنكاوي', 'Ride the Langkawi cable car', 'sightseeing'),
  ('d1000002-0000-0000-0000-000000000005', 2, 'جسر السماء', 'Sky Bridge', 'المشي على الجسر المعلق', 'Walk across the suspended bridge', 'sightseeing'),
  ('d1000002-0000-0000-0000-000000000006', 1, 'جولة بحرية', 'Boat Tour', 'جولة في الجزر المحيطة', 'Tour of surrounding islands', 'sightseeing'),
  ('d1000002-0000-0000-0000-000000000006', 2, 'سباحة', 'Swimming', 'سباحة في البحيرة العذبة', 'Swimming in the freshwater lake', 'free'),
  ('d1000002-0000-0000-0000-000000000007', 1, 'يوم شاطئ', 'Beach Day', 'استرخاء على شاطئ سينانج', 'Relax at Cenang Beach', 'free'),
  ('d1000002-0000-0000-0000-000000000008', 1, 'نقل للمطار', 'Airport Transfer', 'التوجه لمطار لنكاوي', 'Transfer to Langkawi Airport', 'transport');

-- ============================================================
-- TRIP 3: Baku, Azerbaijan — 5 Days / 4 Nights (NOT a deal)
-- ============================================================
INSERT INTO trips (id, tenant_id, title_ar, title_en, slug, destination_ar, destination_en,
  duration_days, duration_nights, price_from, price_to, description_ar, description_en,
  inclusions, exclusions, tags, is_deal, is_ending_soon,
  status, sort_order)
VALUES (
  'a1000000-0000-0000-0000-000000000003',
  '932ee790-31d7-4987-b2d3-600cb16137c0',
  'باكو لؤلؤة القوقاز',
  'Baku - Pearl of the Caucasus',
  'baku-pearl-of-caucasus',
  'باكو، أذربيجان',
  'Baku, Azerbaijan',
  5, 4,
  2800, 3500,
  'اكتشف جمال باكو حيث تلتقي الهندسة المعمارية الحديثة مع المدينة القديمة المدرجة في اليونسكو. أبراج اللهب وقصر شروان شاه وبراكين الطين الفريدة.',
  'Discover the beauty of Baku where modern architecture meets the UNESCO-listed Old City. The Flame Towers, Shirvanshah Palace, and unique mud volcanoes.',
  '[{"text_ar":"تذاكر الطيران ذهاب وعودة","text_en":"Round-trip flight tickets"},{"text_ar":"الإقامة في فندق 4 نجوم","text_en":"4-star hotel accommodation"},{"text_ar":"وجبة إفطار يومية","text_en":"Daily breakfast"},{"text_ar":"جولة في المدينة القديمة","text_en":"Old City walking tour"},{"text_ar":"رحلة إلى براكين الطين","text_en":"Mud volcanoes excursion"},{"text_ar":"نقل من وإلى المطار","text_en":"Airport transfers"}]',
  '[{"text_ar":"تأشيرة الدخول","text_en":"Entry visa"},{"text_ar":"المصاريف الشخصية","text_en":"Personal expenses"},{"text_ar":"الوجبات غير المذكورة","text_en":"Meals not mentioned"}]',
  '["ثقافي", "تاريخي", "طبيعة"]',
  false, false,
  'active', 3
);

INSERT INTO hotels (id, tenant_id, name, city_ar, city_en, stars) VALUES
  ('h1000000-0000-0000-0000-000000000005', '932ee790-31d7-4987-b2d3-600cb16137c0', 'JW Marriott Absheron Baku', 'باكو', 'Baku', 5);

INSERT INTO trip_hotels (trip_id, hotel_id, nights, sort_order) VALUES
  ('a1000000-0000-0000-0000-000000000003', 'h1000000-0000-0000-0000-000000000005', 4, 1);

INSERT INTO itinerary_days (id, trip_id, day_number, title_ar, title_en, description_ar, description_en, city_ar, city_en) VALUES
  ('d1000003-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003', 1, 'الوصول إلى باكو', 'Arrival in Baku', 'الوصول إلى مطار حيدر علييف والتوجه للفندق', 'Arrive at Heydar Aliyev Airport and transfer to the hotel', 'باكو', 'Baku'),
  ('d1000003-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003', 2, 'المدينة القديمة', 'Old City Tour', 'جولة مشي في المدينة القديمة وبرج العذراء وقصر شروان شاه', 'Walking tour of the Old City, Maiden Tower, and Shirvanshah Palace', 'باكو', 'Baku'),
  ('d1000003-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 3, 'باكو الحديثة', 'Modern Baku', 'زيارة مركز حيدر علييف الثقافي وأبراج اللهب وكورنيش باكو', 'Visit Heydar Aliyev Center, Flame Towers, and Baku Boulevard', 'باكو', 'Baku'),
  ('d1000003-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 4, 'براكين الطين وجوبوستان', 'Mud Volcanoes & Gobustan', 'رحلة إلى براكين الطين ومحمية جوبوستان الأثرية', 'Trip to mud volcanoes and Gobustan National Park', 'جوبوستان', 'Gobustan'),
  ('d1000003-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000003', 5, 'المغادرة', 'Departure', 'وقت حر للتسوق ثم المغادرة', 'Free time for shopping then departure', 'باكو', 'Baku');

INSERT INTO itinerary_activities (day_id, sort_order, title_ar, title_en, description_ar, description_en, activity_type) VALUES
  ('d1000003-0000-0000-0000-000000000001', 1, 'استقبال المطار', 'Airport Transfer', 'استقبال ونقل خاص من المطار', 'Private airport welcome and transfer', 'transport'),
  ('d1000003-0000-0000-0000-000000000001', 2, 'جولة مسائية', 'Evening Walk', 'جولة مسائية على كورنيش باكو', 'Evening walk along Baku Boulevard', 'sightseeing'),
  ('d1000003-0000-0000-0000-000000000002', 1, 'برج العذراء', 'Maiden Tower', 'زيارة برج العذراء التاريخي', 'Visit the historic Maiden Tower', 'sightseeing'),
  ('d1000003-0000-0000-0000-000000000002', 2, 'قصر شروان شاه', 'Shirvanshah Palace', 'جولة في قصر شروان شاه', 'Tour of Shirvanshah Palace', 'sightseeing'),
  ('d1000003-0000-0000-0000-000000000002', 3, 'غداء أذربيجاني', 'Azerbaijani Lunch', 'تذوق المطبخ الأذربيجاني الأصيل', 'Taste authentic Azerbaijani cuisine', 'meal'),
  ('d1000003-0000-0000-0000-000000000002', 4, 'سوق المدينة القديمة', 'Old City Market', 'تسوق في أسواق المدينة القديمة', 'Shopping in Old City markets', 'shopping'),
  ('d1000003-0000-0000-0000-000000000003', 1, 'مركز حيدر علييف', 'Heydar Aliyev Center', 'زيارة المركز الثقافي بتصميم زها حديد', 'Visit the Zaha Hadid-designed cultural center', 'sightseeing'),
  ('d1000003-0000-0000-0000-000000000003', 2, 'أبراج اللهب', 'Flame Towers', 'مشاهدة أبراج اللهب الشهيرة', 'View the iconic Flame Towers', 'sightseeing'),
  ('d1000003-0000-0000-0000-000000000003', 3, 'تسوق في نظامي', 'Nizami Shopping', 'تسوق في شارع نظامي', 'Shopping on Nizami Street', 'shopping'),
  ('d1000003-0000-0000-0000-000000000004', 1, 'براكين الطين', 'Mud Volcanoes', 'زيارة براكين الطين الفريدة', 'Visit the unique mud volcanoes', 'sightseeing'),
  ('d1000003-0000-0000-0000-000000000004', 2, 'نقوش جوبوستان', 'Gobustan Petroglyphs', 'مشاهدة النقوش الصخرية في محمية جوبوستان', 'View the rock petroglyphs at Gobustan National Park', 'sightseeing'),
  ('d1000003-0000-0000-0000-000000000005', 1, 'تسوق أخير', 'Last Shopping', 'وقت حر للتسوق في المولات', 'Free time for mall shopping', 'shopping'),
  ('d1000003-0000-0000-0000-000000000005', 2, 'نقل للمطار', 'Airport Transfer', 'التوجه لمطار حيدر علييف', 'Transfer to Heydar Aliyev Airport', 'transport');

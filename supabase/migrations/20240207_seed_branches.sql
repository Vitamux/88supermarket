-- Clear existing stores to avoid duplicates/conflicts with new structure
TRUNCATE TABLE stores CASCADE;

-- Insert new branches with Name, District, Address
-- Assuming table structure: id (uuid), name (text), district (text), address (text), phone (text default), etc.
-- We will generate UUIDs or let Postgres do it.

INSERT INTO stores (name, district, address) VALUES
('88 Kentron - Mashtots', 'Կենտրոն', 'Մաշտոցի պողոտա 42/4'),
('88 Kentron - Sayat-Nova', 'Կենտրոն', 'Սայաթ-Նովա 40/1'),
('88 Kentron - Vardanants', 'Կենտրոն', 'Վարդանանց 14/4'),
('88 Kentron - Tumanyan', 'Կենտրոն', 'Թումանյան 10'),
('88 Kentron - Abovyan', 'Կենտրոն', 'Աբովյան 7/4 (Հյուսիսային պողոտա)'),
('88 Kentron - Rostomi', 'Կենտրոն', 'Ռոստոմի 30 (Նար-Դոս)'),
('88 Kentron - Argishti', 'Կենտրոն', 'Արգիշտի 7/8'),
('88 Arabkir - Tbilisi', 'Արաբկիր', 'Թբիլիսյան խճուղի 20'),
('88 Arabkir - Nairi Zaryan', 'Արաբկիր', 'Նաիրի Զարյան 26/3'),
('88 Arabkir - 39th St', 'Արաբկիր', 'Արաբկիր 39փ., 1Ա'),
('88 Arabkir - Orbeli', 'Արաբկիր', 'Օրբելի եղբայրներ 67/2'),
('88 Arabkir - Kievyan', 'Արաբկիր', 'Կիևյան 2/1'),
('88 Shengavit - Garegin Nzhdeh 25', 'Շենգավիթ', 'Գարեգին Նժդեհ 25/9'),
('88 Shengavit - Garegin Nzhdeh 28', 'Շենգավիթ', 'Գարեգին Նժդեհ 28 շենք, 50'),
('88 Shengavit - Shiraki', 'Շենգավիթ', 'Շիրակի 1/68'),
('88 Syunik - Sisian', 'Սյունիք', 'Սիսիան, Որոտան 2/36'),
('88 Syunik - Goris', 'Սյունիք', 'Գորիս, Մեսրոպ Մաշտոցի 36'),
('88 Syunik - Kapan Melikyan', 'Սյունիք', 'Կապան, Ռ. Մելիքյան 8/1'),
('88 Syunik - Qajaran', 'Սյունիք', 'Քաջարան, Աբովյան 5/1'),
('88 Syunik - Kapan Shahumyan', 'Սյունիք', 'Կապան, Շահումյան 1'),
('88 Shirak - Gyumri Charents', 'Շիրակ', 'Գյումրի, Եղիշե Չարենց փ., 23'),
('88 Shirak - Akhuryan', 'Շիրակ', 'Ախուրյան, Ղարիբջանյան Գյումրի֊Արմավիր մայրուղի');

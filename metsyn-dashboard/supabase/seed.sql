-- MetSyn — tabla `registros` + RLS + datos de prueba.
-- Pegar en el SQL Editor de Supabase y ejecutar. Luego poner
-- VITE_DATA_SOURCE=supabase en .env y reiniciar el dev server.

-- 1) Tabla
create table if not exists registros (
  id bigint generated always as identity primary key,
  periodo text not null,                       -- '2021' | '2023' | '2024' | '2025'
  sexo text check (sexo in ('M','F')),
  edad int,
  criterio_perabd int default 0,               -- 0 | 1
  criterio_trig int default 0,
  criterio_hdl int default 0,
  criterio_presion int default 0,
  criterio_glu int default 0,
  criterios_acumulados int default 0,          -- 0..5
  metsyn_flag int default 0                     -- 1 si >= 3 criterios
);

-- 2) RLS: lectura para el dashboard (anon key del frontend).
--    OJO producción: estos son datos AGREGADOS sin identificar. El módulo
--    Perfil por Colaborador (identificable) debe exigir auth + rol médico.
alter table registros enable row level security;
drop policy if exists "lectura dashboard" on registros;
create policy "lectura dashboard" on registros
  for select to anon, authenticated using (true);

-- 3) 300 filas sintéticas de prueba (reemplazar luego por tu Excel real)
insert into registros (periodo, sexo, edad, criterio_perabd, criterio_trig, criterio_hdl, criterio_presion, criterio_glu, criterios_acumulados, metsyn_flag)
select
  (array['2021','2023','2024','2025'])[1 + floor(random()*4)::int],
  (array['M','F'])[1 + floor(random()*2)::int],
  (20 + floor(random()*45))::int,
  c1, c2, c3, c4, c5,
  (c1 + c2 + c3 + c4 + c5),
  case when (c1 + c2 + c3 + c4 + c5) >= 3 then 1 else 0 end
from (
  select
    (random() < 0.55)::int as c1,
    (random() < 0.40)::int as c2,
    (random() < 0.38)::int as c3,
    (random() < 0.20)::int as c4,
    (random() < 0.25)::int as c5
  from generate_series(1, 300)
) s;

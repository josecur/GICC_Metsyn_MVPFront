# Cambiar de datos mock a Supabase

La UI **no depende** de dónde vienen los datos: todo pasa por el puerto
`MetSynDataSource` (`src/shared/api/datasource.ts`). Cambiar de mock a Supabase
es un flip de configuración, no una reescritura.

## Pasos

1. **Credenciales** — en `.env` (raíz de `metsyn-dashboard`):
   ```
   VITE_DATA_SOURCE=supabase
   VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ...
   ```
2. **Reiniciar** el dev server (Vite lee `.env` al arrancar).
3. Listo: los hooks de TanStack Query empiezan a leer de Supabase.

## Esquema esperado

El adaptador (`src/shared/api/supabase/supabaseDataSource.ts`) consulta una tabla
`registros` y agrega en JS. Si tus nombres difieren, ajusta el objeto `SCHEMA`
(un solo lugar). Columnas esperadas:

| Columna | Tipo | Notas |
|---|---|---|
| `periodo` | text | "2021" / "2023" / "2024" / "2025" |
| `sexo` | text | "M" / "F" |
| `edad` | int | |
| `criterios_acumulados` | int | 0..5 |
| `metsyn_flag` | int | 0 / 1 (≥3 criterios) |
| `criterio_perabd` | int | 0 / 1 |
| `criterio_trig` | int | 0 / 1 |
| `criterio_hdl` | int | 0 / 1 |
| `criterio_presion` | int | 0 / 1 |
| `criterio_glu` | int | 0 / 1 |

```sql
create table registros (
  id bigint generated always as identity primary key,
  periodo text not null,
  sexo text check (sexo in ('M','F')),
  edad int,
  criterio_perabd int default 0,
  criterio_trig int default 0,
  criterio_hdl int default 0,
  criterio_presion int default 0,
  criterio_glu int default 0,
  criterios_acumulados int default 0,
  metsyn_flag int default 0
);
-- RLS: lectura para médico+investigador. Perfil individual (datos identificables)
-- debe quedar restringido a médico (ver spec). Configurar policies aparte.
```

## Notas

- Para ~4.4k filas, agregar en JS está bien. Si crece, mover las agregaciones a
  **vistas / RPC de Postgres** y cambiar cada método del adaptador por `.rpc(...)`.
- **Ingesta de Excel** (insertar filas) es un paso aparte; el adaptador hoy cubre
  solo lectura del Dashboard.
- Volver a mock en cualquier momento: `VITE_DATA_SOURCE=mock`.

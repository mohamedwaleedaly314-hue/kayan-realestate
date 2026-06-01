/**
 * Supabase-based database adapter that replaces Prisma.
 * Uses the Supabase JS client (REST API over HTTPS) — works in all Vercel
 * serverless environments without needing a Postgres connection pooler.
 */

import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

// ─── Singleton client ────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _supabase: any = null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sb(): any {
  if (!_supabase) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    _supabase = createClient(url, key, {
      auth: { persistSession: false },
      global: {
        // Disable Next.js fetch caching so server components always get fresh data
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: 'no-store' }),
      },
    });
  }
  return _supabase;
}

// ─── Date field conversion ───────────────────────────────────────────────────
// Prisma returns Date objects; the REST API returns ISO strings.
// We convert known date fields back to Date objects so all existing code works.

const DATE_FIELDS = new Set(['created_at', 'updated_at', 'free_listing_until']);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function convertDates(obj: any): any {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  if (Array.isArray(obj)) return obj.map(convertDates);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    if (DATE_FIELDS.has(k) && typeof v === 'string' && v) {
      out[k] = new Date(v);
    } else if (v !== null && typeof v === 'object') {
      out[k] = convertDates(v);
    } else {
      out[k] = v;
    }
  }
  return out;
}

// ─── Relation map: relation field name → child table name ───────────────────

const MODEL_RELATIONS: Record<string, Record<string, string>> = {
  Property:        { images: 'PropertyImage', owner: 'PropertyOwner', leads: 'Lead', saves: 'SavedProperty' },
  User:            { saves: 'SavedProperty', leads: 'Lead', search_history: 'SearchHistory',
                     search_alerts: 'SearchAlert', property_requests: 'PropertyRequest',
                     submitted_listings: 'PropertyOwner', notifications: 'Notification' },
  Lead:            { property: 'Property', user: 'User' },
  SavedProperty:   { user: 'User', property: 'Property' },
  SearchHistory:   { user: 'User' },
  SearchAlert:     { user: 'User' },
  PropertyRequest: { user: 'User' },
  Notification:    { user: 'User' },
  PropertyOwner:   { property: 'Property', user: 'User' },
  PropertyImage:   { property: 'Property' },
  AdminUser:       {},
  Review:          {},
};

/** FK field in the CHILD table that points back to the parent */
const RELATION_FK: Record<string, Record<string, string>> = {
  Property: { images: 'property_id', owner: 'property_id', leads: 'property_id', saves: 'property_id' },
  User:     { saves: 'user_id', leads: 'user_id', search_history: 'user_id',
              search_alerts: 'user_id', property_requests: 'user_id',
              submitted_listings: 'user_id', notifications: 'user_id' },
};

/** FK field used when counting children: childTable → fkField */
const CHILD_FK: Record<string, Record<string, string>> = {
  Property: { PropertyImage: 'property_id', PropertyOwner: 'property_id', Lead: 'property_id', SavedProperty: 'property_id' },
  User:     { SavedProperty: 'user_id', Lead: 'user_id', SearchHistory: 'user_id',
              SearchAlert: 'user_id', PropertyRequest: 'user_id', PropertyOwner: 'user_id', Notification: 'user_id' },
};

// ─── Build PostgREST select string ──────────────────────────────────────────

/**
 * Recursively expand a Prisma include/select config into a PostgREST select string.
 * Handles unlimited depth:
 *   select: { owner: { select: { name } } }
 *   include: { property: { include: { images: { where: ... } } } }
 *   include: { property: { select: { title_ar, owner: { select: { name } } } } }
 */
function expandRelationConfig(
  tableName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cfg: any,
): string {
  if (!cfg || cfg === true) return '*';
  const relations = MODEL_RELATIONS[tableName] ?? {};

  // cfg has a "select" key → use those fields (with possible nested relations)
  if (cfg.select) {
    return buildNestedSelectStr(tableName, cfg.select as Record<string, unknown>);
  }

  // cfg has an "include" key → expand each included relation
  if (cfg.include) {
    const parts = ['*'];
    for (const [rel, relCfg] of Object.entries(cfg.include as Record<string, unknown>)) {
      if (!relCfg || rel === '_count') continue;
      const childTable = relations[rel];
      if (!childTable) continue;
      const nested = expandRelationConfig(childTable, relCfg);
      parts.push(`${rel}:${childTable}(${nested})`);
    }
    return parts.join(', ');
  }

  return '*';
}

/**
 * Recursively build a PostgREST select string from a Prisma "select" object.
 * Handles scalar fields and nested relation selects/includes at any depth.
 */
function buildNestedSelectStr(
  tableName: string,
  selectFields: Record<string, unknown>,
): string {
  const relations = MODEL_RELATIONS[tableName] ?? {};
  const cols: string[] = [];

  for (const [k, v] of Object.entries(selectFields)) {
    if (!v || k === '_count') continue;
    if (k in relations && typeof v === 'object' && v !== null) {
      const childTable = relations[k];
      const nested = expandRelationConfig(childTable, v);
      cols.push(`${k}:${childTable}(${nested})`);
    } else {
      cols.push(k);
    }
  }

  return cols.join(', ');
}

function buildSelectStr(
  tableName: string,
  include?: Record<string, unknown>,
  selectFields?: Record<string, unknown>,
): string {
  const relations = MODEL_RELATIONS[tableName] ?? {};

  if (selectFields) {
    const selectStr = buildNestedSelectStr(tableName, selectFields);
    // Also add any explicit includes not already in select
    if (include) {
      const extraParts: string[] = [];
      for (const [rel, cfg] of Object.entries(include)) {
        if (!cfg || rel === '_count') continue;
        const tbl = relations[rel];
        if (tbl && !selectStr.includes(`${rel}:`)) {
          const nested = expandRelationConfig(tbl, cfg);
          extraParts.push(`${rel}:${tbl}(${nested})`);
        }
      }
      if (extraParts.length) {
        return selectStr ? `${selectStr}, ${extraParts.join(', ')}` : extraParts.join(', ');
      }
    }
    return selectStr || '*';
  }

  if (!include) return '*';
  const parts = ['*'];
  for (const [rel, cfg] of Object.entries(include)) {
    if (!cfg || rel === '_count') continue;
    const tbl = relations[rel];
    if (!tbl) continue;
    const nested = expandRelationConfig(tbl, cfg);
    parts.push(`${rel}:${tbl}(${nested})`);
  }
  return parts.join(', ');
}

// ─── Extract _count config ──────────────────────────────────────────────────

function getCountConfig(
  select?: Record<string, unknown>,
  include?: Record<string, unknown>,
// eslint-disable-next-line @typescript-eslint/no-explicit-any
): any | null {
  return (include as Record<string, unknown> | undefined)?._count
    ?? (select as Record<string, unknown> | undefined)?._count
    ?? null;
}

// ─── Separate nested relation ops from scalar data ───────────────────────────

function extractNestedOps(
  tableName: string,
  data: Record<string, unknown>,
): { mainData: Record<string, unknown>; nestedOps: Record<string, unknown> } {
  const relations = MODEL_RELATIONS[tableName] ?? {};
  const mainData: Record<string, unknown> = {};
  const nestedOps: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(data)) {
    if (key in relations && value !== null && value !== undefined && typeof value === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const v = value as any;
      if ('create' in v || 'createMany' in v || 'upsert' in v || 'update' in v
          || 'delete' in v || 'connect' in v || 'disconnect' in v) {
        nestedOps[key] = value;
        continue;
      }
    }
    mainData[key] = value;
  }
  return { mainData, nestedOps };
}

// ─── Execute nested relation operations ─────────────────────────────────────

async function execNestedOps(
  tableName: string,
  parentId: string,
  nestedOps: Record<string, unknown>,
): Promise<void> {
  const relations = MODEL_RELATIONS[tableName] ?? {};
  const relFk = RELATION_FK[tableName] ?? {};

  for (const [rel, ops] of Object.entries(nestedOps)) {
    const relTable = relations[rel];
    const fkField = relFk[rel];
    if (!relTable || !fkField) continue;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const op = ops as any;

    // create (single or array)
    if (op.create !== undefined) {
      const rows = Array.isArray(op.create)
        ? op.create.map((r: Record<string, unknown>) => ({ id: uuidv4(), ...r, [fkField]: parentId }))
        : [{ id: uuidv4(), ...op.create, [fkField]: parentId }];
      const { error } = await sb().from(relTable).insert(rows);
      if (error) throw new Error(error.message);
    }

    // createMany
    if (op.createMany !== undefined) {
      const rows = (op.createMany.data as Record<string, unknown>[]).map(r => ({ id: uuidv4(), ...r, [fkField]: parentId }));
      const { error } = await sb().from(relTable).insert(rows);
      if (error && !op.createMany.skipDuplicates) throw new Error(error.message);
    }

    // upsert — check if related record exists by FK
    if (op.upsert !== undefined) {
      const { data: existing } = await sb().from(relTable).select('id').eq(fkField, parentId).maybeSingle();
      if (existing) {
        const { error } = await sb().from(relTable).update(op.upsert.update).eq(fkField, parentId);
        if (error) throw new Error(error.message);
      } else {
        const { error } = await sb().from(relTable).insert({ id: uuidv4(), ...op.upsert.create, [fkField]: parentId });
        if (error) throw new Error(error.message);
      }
    }

    // update (single nested update)
    if (op.update !== undefined && !('create' in op) && !('upsert' in op)) {
      const { error } = await sb().from(relTable).update(op.update).eq(fkField, parentId);
      if (error) throw new Error(error.message);
    }

    // delete
    if (op.delete === true) {
      await sb().from(relTable).delete().eq(fkField, parentId);
    }

    // deleteMany
    if (op.deleteMany !== undefined) {
      let q = sb().from(relTable).delete().eq(fkField, parentId);
      if (op.deleteMany && typeof op.deleteMany === 'object' && Object.keys(op.deleteMany).length > 0) {
        q = applyWhere(q, op.deleteMany as Record<string, unknown>);
      }
      await q;
    }
  }
}

// ─── Apply WHERE conditions ──────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildOrStr(conditions: any[]): string {
  return conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((cond: any) =>
      Object.entries(cond)
        .map(([f, v]) => {
          if (v && typeof v === 'object') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const o = v as any;
            if ('contains' in o) return `${f}.ilike.*${o.contains}*`;
            if ('gte' in o)      return `${f}.gte.${toDbVal(o.gte)}`;
            if ('lte' in o)      return `${f}.lte.${toDbVal(o.lte)}`;
            if ('gt' in o)       return `${f}.gt.${toDbVal(o.gt)}`;
            if ('lt' in o)       return `${f}.lt.${toDbVal(o.lt)}`;
            if ('not' in o)      return o.not === null ? `${f}.not.is.null` : `${f}.neq.${toDbVal(o.not)}`;
          }
          if (v === null) return `${f}.is.null`;
          return `${f}.eq.${v}`;
        })
        .join(','),
    )
    .join(',');
}

/** Ensure Date objects are sent as ISO UTC strings that PostgreSQL understands */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbVal(v: any): any {
  if (v instanceof Date) return v.toISOString();
  return v;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyWhere(q: any, where: Record<string, unknown>): any {
  for (const [key, value] of Object.entries(where)) {
    if (key === 'OR') {
      const orStr = buildOrStr(value as unknown[]);
      if (orStr) q = q.or(orStr);
      continue;
    }
    if (key === 'AND') {
      for (const cond of value as Record<string, unknown>[]) q = applyWhere(q, cond);
      continue;
    }
    if (key === 'NOT') {
      if (value && typeof value === 'object') {
        for (const [f, v] of Object.entries(value as Record<string, unknown>)) {
          if (v === null) q = q.not(f, 'is', null);
          else q = q.neq(f, v);
        }
      }
      continue;
    }

    // Date object at top level → convert to ISO string
    if (value instanceof Date) {
      q = q.eq(key, value.toISOString());
      continue;
    }

    // Compound unique key: e.g. user_id_property_id: { user_id, property_id }
    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
      const sub = value as Record<string, unknown>;
      const subKeys = Object.keys(sub);
      if (subKeys.length >= 2 && subKeys.every(k => sub[k] === null || typeof sub[k] !== 'object')) {
        const isOperator = ['contains','gte','lte','gt','lt','in','not','equals','startsWith','endsWith'].some(op => op in sub);
        if (!isOperator) {
          for (const [sf, sv] of Object.entries(sub)) {
            if (sv === null || sv === undefined) q = q.is(sf, null);
            else q = q.eq(sf, toDbVal(sv));
          }
          continue;
        }
      }
    }

    // Operator objects
    if (value !== null && value !== undefined && typeof value === 'object' && !Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const op = value as any;
      if ('contains' in op)        q = q.ilike(key, `%${op.contains}%`);
      else if ('startsWith' in op) q = q.ilike(key, `${op.startsWith}%`);
      else if ('endsWith' in op)   q = q.ilike(key, `%${op.endsWith}`);
      else if ('gte' in op)        q = q.gte(key, toDbVal(op.gte));
      else if ('lte' in op)        q = q.lte(key, toDbVal(op.lte));
      else if ('gt' in op)         q = q.gt(key, toDbVal(op.gt));
      else if ('lt' in op)         q = q.lt(key, toDbVal(op.lt));
      else if ('in' in op)         q = q.in(key, (op.in as unknown[]).map(toDbVal));
      else if ('not' in op) {
        if (op.not === null) q = q.not(key, 'is', null);
        else q = q.neq(key, toDbVal(op.not));
      } else if ('equals' in op) {
        if (op.equals === null) q = q.is(key, null);
        else q = q.eq(key, toDbVal(op.equals));
      }
      // else: unknown object — skip silently (e.g. relation filter pre-resolved)
    } else {
      if (value === null || value === undefined) q = q.is(key, null);
      else q = q.eq(key, toDbVal(value));
    }
  }
  return q;
}

/**
 * Pre-process a Prisma where clause to resolve any relation-based filters
 * (e.g. { owner: { user_id: X } }) into id-list filters using a sub-query.
 * Returns a flat where object that applyWhere can handle.
 */
async function resolveRelationFilters(
  tableName: string,
  where: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const relations = MODEL_RELATIONS[tableName] ?? {};
  const relFk = RELATION_FK[tableName] ?? {};
  const resolved: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(where)) {
    // Is this key a relation name with a filter object?
    if (key in relations && value !== null && typeof value === 'object' && !Array.isArray(value)) {
      const relTable = relations[key];
      const fkField = relFk[key]; // FK in relTable pointing back to this table
      if (fkField) {
        // Sub-query: get parent IDs by querying the related table
        const { data } = await applyWhere(
          sb().from(relTable).select(fkField),
          value as Record<string, unknown>,
        );
        const ids = (data ?? []).map((r: Record<string, unknown>) => r[fkField]).filter(Boolean);
        resolved['id'] = { in: ids.length > 0 ? ids : ['__no_match__'] };
        continue;
      }
    }
    resolved[key] = value;
  }
  return resolved;
}

// ─── Apply ORDER BY ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function applyOrderBy(q: any, orderBy?: unknown): any {
  if (!orderBy) return q;
  const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
  for (const o of orders as Record<string, string>[]) {
    for (const [col, dir] of Object.entries(o)) {
      q = q.order(col, { ascending: dir === 'asc' });
    }
  }
  return q;
}

// ─── Post-process embedded include arrays ────────────────────────────────────

function postProcessInclude(
  records: Record<string, unknown>[],
  include: Record<string, unknown>,
): Record<string, unknown>[] {
  return records.map(item => {
    const out = { ...item };
    for (const [rel, cfg] of Object.entries(include)) {
      if (rel === '_count' || !cfg) continue;
      if (cfg === true) continue;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = cfg as any;

      // ── Array relation (one-to-many) ──
      if (Array.isArray(out[rel])) {
        let arr = out[rel] as Record<string, unknown>[];
        const innerInclude = c.include ?? c.select;
        if (c.where) arr = arr.filter(r => matchWhere(r, c.where));
        if (c.orderBy) {
          const orders = Array.isArray(c.orderBy) ? c.orderBy : [c.orderBy];
          arr = [...arr].sort((a, b) => {
            for (const o of orders as Record<string, string>[]) {
              for (const [col, dir] of Object.entries(o)) {
                const av = a[col] ?? '';
                const bv = b[col] ?? '';
                const cmp = av === bv ? 0 : av < bv ? -1 : 1;
                if (cmp !== 0) return dir === 'desc' ? -cmp : cmp;
              }
            }
            return 0;
          });
        }
        if (typeof c.skip === 'number') arr = arr.slice(c.skip);
        if (typeof c.take === 'number') arr = arr.slice(0, c.take);
        // Recurse into nested include/select on array items
        if (innerInclude && typeof innerInclude === 'object') {
          arr = postProcessInclude(arr, innerInclude as Record<string, unknown>);
        }
        out[rel] = arr;
        continue;
      }

      // ── Object relation (one-to-one / many-to-one) ──
      if (out[rel] !== null && out[rel] !== undefined && typeof out[rel] === 'object') {
        const innerInclude = c.include ?? c.select;
        if (innerInclude && typeof innerInclude === 'object') {
          out[rel] = postProcessInclude(
            [out[rel] as Record<string, unknown>],
            innerInclude as Record<string, unknown>,
          )[0];
        }
      }
    }
    return out;
  });
}

function matchWhere(record: Record<string, unknown>, where: Record<string, unknown>): boolean {
  for (const [key, value] of Object.entries(where)) {
    const rv = record[key];
    if (value === null) { if (rv !== null && rv !== undefined) return false; continue; }
    if (typeof value === 'object' && !Array.isArray(value)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const op = value as any;
      if ('contains' in op && typeof rv === 'string'
          && !rv.toLowerCase().includes(String(op.contains).toLowerCase())) return false;
      if ('gte' in op && !((rv as number) >= (op.gte as number))) return false;
      if ('lte' in op && !((rv as number) <= (op.lte as number))) return false;
      if ('in' in op && !(op.in as unknown[]).includes(rv)) return false;
      if ('not' in op && rv === op.not) return false;
    } else {
      if (rv !== value) return false;
    }
  }
  return true;
}

// ─── Count related records ───────────────────────────────────────────────────

async function applyCountInclude(
  tableName: string,
  records: Record<string, unknown>[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  countCfg: any,
): Promise<Record<string, unknown>[]> {
  if (records.length === 0) return records;

  const countSelect: Record<string, boolean> =
    (countCfg && typeof countCfg === 'object' && 'select' in countCfg)
      ? (countCfg.select as Record<string, boolean>)
      : (typeof countCfg === 'object' ? countCfg as Record<string, boolean> : {});

  if (!countSelect || Object.keys(countSelect).length === 0) return records;

  const relations = MODEL_RELATIONS[tableName] ?? {};
  const childFkMap = CHILD_FK[tableName] ?? {};
  const ids = records.map(r => r.id as string).filter(Boolean);
  if (ids.length === 0) return records;

  const counts: Record<string, Record<string, number>> = {};
  // Pre-initialise every relation count to 0 for every record
  // so missing rows don't produce undefined → NaN
  for (const id of ids) {
    counts[id] = {};
    for (const [rel, enabled] of Object.entries(countSelect)) {
      if (enabled) counts[id][rel] = 0;
    }
  }

  for (const [rel, enabled] of Object.entries(countSelect)) {
    if (!enabled) continue;
    const relTable = relations[rel];
    if (!relTable) continue;
    const fkField = childFkMap[relTable];
    if (!fkField) continue;

    const { data } = await sb().from(relTable).select(fkField).in(fkField, ids);
    if (data) {
      for (const row of data as Record<string, string>[]) {
        const fkVal = row[fkField];
        if (fkVal && counts[fkVal] !== undefined) {
          counts[fkVal][rel] = (counts[fkVal][rel] ?? 0) + 1;
        }
      }
    }
  }

  return records.map(r => ({ ...r, _count: counts[r.id as string] ?? {} }));
}

// ─── Resolve increment/decrement operations ──────────────────────────────────

async function resolveData(
  tableName: string,
  where: Record<string, unknown>,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const resolved: Record<string, unknown> = {};
  let currentRow: Record<string, unknown> | null = null;

  for (const [k, v] of Object.entries(data)) {
    if (v !== null && typeof v === 'object') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const op = v as any;
      if ('increment' in op || 'decrement' in op) {
        if (!currentRow) {
          const { data: cur } = await applyWhere(sb().from(tableName).select('*'), where).maybeSingle();
          currentRow = (cur as Record<string, unknown>) ?? {};
        }
        const cur = (currentRow[k] as number) ?? 0;
        resolved[k] = 'increment' in op ? cur + (op.increment as number) : cur - (op.decrement as number);
        continue;
      }
      if ('set' in op) { resolved[k] = op.set; continue; }
    }
    resolved[k] = v;
  }
  return resolved;
}

// ─── Error helper ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function throwIfErr(error: any) {
  // Ignore null/undefined and errors with no message (aborted/cancelled requests)
  if (!error) return;
  const msg: string = error.message ?? '';
  if (!msg) return;                       // empty-message pseudo-error — not real
  console.error('[supabase-db] Error:', JSON.stringify(error));
  throw new Error(msg);
}

// ─── Model factory ───────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function createModel(tableName: string): any {
  const model = {
    async findUnique(args: {
      where?: Record<string, unknown>;
      select?: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) {
      const { where = {}, select, include } = args;
      const countCfg = getCountConfig(select, include);
      const selectStr = buildSelectStr(tableName, include, select);
      const resolvedWhere = await resolveRelationFilters(tableName, where);
      const { data, error } = await applyWhere(sb().from(tableName).select(selectStr), resolvedWhere).maybeSingle();
      if (error && error.code !== 'PGRST116') throwIfErr(error);
      if (!data) return null;
      let result = [convertDates(data) as Record<string, unknown>];
      if (include) result = postProcessInclude(result, include);
      if (countCfg) result = await applyCountInclude(tableName, result, countCfg);
      return result[0] ?? null;
    },

    async findFirst(args: {
      where?: Record<string, unknown>;
      select?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: unknown;
      skip?: number;
    } = {}) {
      const { where = {}, select, include, orderBy, skip } = args;
      const countCfg = getCountConfig(select, include);
      const selectStr = buildSelectStr(tableName, include, select);
      const resolvedWhere = await resolveRelationFilters(tableName, where);
      let q = applyWhere(sb().from(tableName).select(selectStr), resolvedWhere);
      q = applyOrderBy(q, orderBy);
      if (typeof skip === 'number') q = q.range(skip, skip);
      q = q.limit(1);
      const { data, error } = await q;
      throwIfErr(error);
      if (!data || data.length === 0) return null;
      let result = (data as Record<string, unknown>[]).map(convertDates);
      if (include) result = postProcessInclude(result, include);
      if (countCfg) result = await applyCountInclude(tableName, result, countCfg);
      return result[0] ?? null;
    },

    async findMany(args: {
      where?: Record<string, unknown>;
      select?: Record<string, unknown>;
      include?: Record<string, unknown>;
      orderBy?: unknown;
      take?: number;
      skip?: number;
      distinct?: string[];
    } = {}) {
      const { where = {}, select, include, orderBy, take, skip } = args;
      const countCfg = getCountConfig(select, include);
      const selectStr = buildSelectStr(tableName, include, select);
      const resolvedWhere = await resolveRelationFilters(tableName, where);
      let q = applyWhere(sb().from(tableName).select(selectStr), resolvedWhere);
      q = applyOrderBy(q, orderBy);
      if (typeof skip === 'number' && typeof take === 'number') {
        q = q.range(skip, skip + take - 1);
      } else if (typeof take === 'number') {
        q = q.limit(take);
      } else if (typeof skip === 'number') {
        q = q.range(skip, skip + 9999);
      }
      const { data, error } = await q;
      throwIfErr(error);
      let result = ((data ?? []) as Record<string, unknown>[]).map(convertDates);
      if (include) result = postProcessInclude(result, include);
      if (countCfg) result = await applyCountInclude(tableName, result, countCfg);
      return result;
    },

    async create(args: {
      data: Record<string, unknown>;
      select?: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) {
      const { data, select, include } = args;
      const { mainData, nestedOps } = extractNestedOps(tableName, data);

      // Auto-generate ID if not provided (Prisma does this client-side via cuid())
      if (!mainData.id) mainData.id = uuidv4();

      // Create the main record
      const { data: result, error } = await sb()
        .from(tableName)
        .insert(mainData)
        .select('*')
        .single();
      throwIfErr(error);
      const mainRecord = convertDates(result) as Record<string, unknown>;

      // Execute nested operations (create images, owner, etc.)
      if (Object.keys(nestedOps).length > 0) {
        await execNestedOps(tableName, mainRecord.id as string, nestedOps);
      }

      // Fetch fresh with includes if requested
      if (include || Object.keys(nestedOps).length > 0) {
        const fresh = await model.findUnique({
          where: { id: mainRecord.id as string },
          include,
          select,
        });
        return fresh ?? mainRecord;
      }
      return mainRecord;
    },

    async createMany(args: { data: Record<string, unknown>[]; skipDuplicates?: boolean }) {
      const { data, skipDuplicates } = args;
      const { error } = await sb().from(tableName).insert(data).select();
      if (error) {
        if (skipDuplicates && error.code === '23505') return { count: 0 };
        throwIfErr(error);
      }
      return { count: data.length };
    },

    async update(args: {
      where: Record<string, unknown>;
      data: Record<string, unknown>;
      select?: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) {
      const { where, data, select, include } = args;
      const { mainData, nestedOps } = extractNestedOps(tableName, data);
      const resolved = await resolveData(tableName, where, mainData);

      let mainRecord: Record<string, unknown>;

      if (Object.keys(resolved).length > 0) {
        const { data: result, error } = await applyWhere(
          sb().from(tableName).update(resolved),
          where,
        ).select('*').single();
        throwIfErr(error);
        mainRecord = convertDates(result) as Record<string, unknown>;
      } else {
        // Nothing to update in main table — just fetch it
        const { data: result } = await applyWhere(sb().from(tableName).select('*'), where).single();
        mainRecord = convertDates(result) as Record<string, unknown> ?? {};
      }

      // Execute nested relation operations
      if (Object.keys(nestedOps).length > 0 && mainRecord.id) {
        await execNestedOps(tableName, mainRecord.id as string, nestedOps);
      }

      // Fetch fresh if includes requested
      if (include || Object.keys(nestedOps).length > 0) {
        const fresh = await model.findUnique({
          where: { id: mainRecord.id as string },
          include,
          select,
        });
        return fresh ?? mainRecord;
      }
      return mainRecord;
    },

    async updateMany(args: { where: Record<string, unknown>; data: Record<string, unknown> }) {
      const { where, data } = args;
      const { error } = await applyWhere(sb().from(tableName).update(data), where).select();
      throwIfErr(error);
      return { count: 0 };
    },

    async upsert(args: {
      where: Record<string, unknown>;
      create: Record<string, unknown>;
      update: Record<string, unknown>;
      select?: Record<string, unknown>;
      include?: Record<string, unknown>;
    }) {
      const { where, create, update, select, include } = args;
      const { data: existing } = await applyWhere(sb().from(tableName).select('id'), where).maybeSingle();
      if (existing) {
        return model.update({ where, data: update, select, include });
      }
      return model.create({ data: create, select, include });
    },

    async delete(args: { where: Record<string, unknown>; select?: Record<string, unknown> }) {
      const { where } = args;
      const { data, error } = await applyWhere(sb().from(tableName).delete(), where).select('*').single();
      throwIfErr(error);
      return convertDates(data) as Record<string, unknown>;
    },

    async deleteMany(args: { where?: Record<string, unknown> } = {}) {
      const { where = {} } = args;
      const { error } = await applyWhere(sb().from(tableName).delete(), where).select();
      throwIfErr(error);
      return { count: 0 };
    },

    async count(args: { where?: Record<string, unknown> } = {}) {
      const { where = {} } = args;
      const { count, error } = await applyWhere(
        sb().from(tableName).select('*', { count: 'exact', head: true }),
        where,
      );
      throwIfErr(error);
      return count ?? 0;
    },

    async aggregate(args: {
      _sum?: Record<string, boolean>;
      _count?: Record<string, boolean> | true;
      _avg?: Record<string, boolean>;
      where?: Record<string, unknown>;
    } = {}) {
      const { _sum, where = {} } = args;
      const result: Record<string, unknown> = {};

      if (_sum) {
        const cols = Object.keys(_sum);
        const { data, error } = await applyWhere(sb().from(tableName).select(cols.join(', ')), where);
        throwIfErr(error);
        const sums: Record<string, number> = {};
        for (const col of cols) {
          sums[col] = (data ?? []).reduce(
            (acc: number, row: Record<string, unknown>) => acc + ((row[col] as number) ?? 0),
            0,
          );
        }
        result._sum = sums;
      }

      return result;
    },

    async groupBy(args: {
      by: string[];
      _count?: Record<string, boolean>;
      _sum?: Record<string, boolean>;
      where?: Record<string, unknown>;
      orderBy?: unknown;
      having?: Record<string, unknown>;
    }) {
      const { by, _count, _sum, where = {} } = args;
      // Fetch all relevant rows with grouped fields + count/sum fields
      const fetchCols = [...by];
      if (_sum) fetchCols.push(...Object.keys(_sum));
      const { data, error } = await applyWhere(sb().from(tableName).select(fetchCols.join(', ')), where);
      throwIfErr(error);

      // Group in JavaScript
      const groups = new Map<string, Record<string, unknown>>();
      for (const row of (data ?? []) as Record<string, unknown>[]) {
        const key = by.map(f => String(row[f] ?? '')).join('|||');
        if (!groups.has(key)) {
          const entry: Record<string, unknown> = {};
          for (const f of by) entry[f] = row[f];
          if (_count) entry._count = {} as Record<string, number>;
          if (_sum)   entry._sum   = {} as Record<string, number>;
          groups.set(key, entry);
        }
        const entry = groups.get(key)!;
        if (_count) {
          for (const [f, enabled] of Object.entries(_count)) {
            if (enabled) {
              (entry._count as Record<string, number>)[f] = ((entry._count as Record<string, number>)[f] ?? 0) + 1;
            }
          }
        }
        if (_sum) {
          for (const [f, enabled] of Object.entries(_sum)) {
            if (enabled) {
              (entry._sum as Record<string, number>)[f] =
                ((entry._sum as Record<string, number>)[f] ?? 0) + ((row[f] as number) ?? 0);
            }
          }
        }
      }

      return Array.from(groups.values());
    },
  };

  return model;
}

// ─── Export Prisma-compatible client ─────────────────────────────────────────

export const prismaDb = {
  property:        createModel('Property'),
  propertyImage:   createModel('PropertyImage'),
  propertyOwner:   createModel('PropertyOwner'),
  user:            createModel('User'),
  adminUser:       createModel('AdminUser'),
  lead:            createModel('Lead'),
  searchAlert:     createModel('SearchAlert'),
  savedProperty:   createModel('SavedProperty'),
  searchHistory:   createModel('SearchHistory'),
  propertyRequest: createModel('PropertyRequest'),
  notification:    createModel('Notification'),
  review:          createModel('Review'),

  $disconnect: async () => {},
  $connect:    async () => {},
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  $transaction: async <T>(fn: (db: typeof prismaDb) => Promise<T>): Promise<T> => fn(prismaDb),
};

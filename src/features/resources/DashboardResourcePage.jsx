import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { apiRequest } from "@/lib/api";

const inputClass = "mt-1 h-9 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none focus:border-gray-400";
const labelClass = "block text-xs font-medium text-gray-700";

function emptyForm(fields) {
  return Object.fromEntries(fields.map((field) => [
    field.key,
    field.type === "select" ? field.options[0] : "",
  ]));
}

function displayValue(field, value) {
  if (value === undefined || value === null || value === "") return "—";
  if (field.format === "currency") return `$${Number(value).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;
  return String(value);
}

function DashboardResourcePage({ config }) {
  const [records, setRecords] = useState([]);
  const [search, setSearch] = useState("");
  const [recordToEdit, setRecordToEdit] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(() => emptyForm(config.fields));
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let current = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      const query = new URLSearchParams({ limit: "500" });
      if (search.trim()) query.set("search", search.trim());
      apiRequest(`/resources/${config.resource}?${query}`)
        .then((result) => {
          if (!current) return;
          setRecords(result.records);
          setError("");
        })
        .catch((requestError) => {
          if (current) setError(requestError.message);
        })
        .finally(() => {
          if (current) setLoading(false);
        });
    }, 180);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [config.resource, revision, search]);

  function startCreate() {
    setRecordToEdit(null);
    setForm(emptyForm(config.fields));
    setIsFormOpen(true);
    setError("");
  }

  function startEdit(record) {
    setRecordToEdit(record);
    setIsFormOpen(true);
    setForm(Object.fromEntries(config.fields.map((field) => [
      field.key,
      record[field.key] === undefined || record[field.key] === null ? "" : String(record[field.key]),
    ])));
    setError("");
  }

  async function saveRecord(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const values = Object.fromEntries(config.fields.map((field) => {
      const value = form[field.key];
      return [field.key, field.type === "number" ? Number(value || 0) : value];
    }));

    try {
      if (recordToEdit) {
        await apiRequest(`/resources/${config.resource}/${recordToEdit.id}`, {
          method: "PATCH",
          body: JSON.stringify(values),
        });
      } else {
        await apiRequest(`/resources/${config.resource}`, {
          method: "POST",
          body: JSON.stringify(values),
        });
      }
      setIsFormOpen(false);
      setRecordToEdit(null);
      setRevision((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteRecord(record) {
    const label = record[config.fields[0].key] ?? record.id;
    if (!window.confirm(`Delete “${label}”? This cannot be undone.`)) return;
    setError("");
    try {
      await apiRequest(`/resources/${config.resource}/${record.id}`, { method: "DELETE" });
      setRevision((value) => value + 1);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <main className="mx-auto w-full max-w-[1440px] p-6 md:p-8">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-xs text-gray-500">Dashboard</p>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{config.title}</h1>
          <p className="mt-1 text-sm text-gray-500">{config.description}</p>
        </div>
        <button
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-900 px-3 text-sm font-medium text-white hover:bg-gray-700"
          onClick={startCreate}
          type="button"
        >
          <Plus size={15} /> Add {config.singular ?? "record"}
        </button>
      </div>

      {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}

      <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <CardHeader className="flex min-h-14 grid-cols-none grid-rows-none flex-row items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-800">{config.title} records <span className="font-normal text-gray-400">({records.length})</span></h2>
          <label className="flex h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-gray-200 px-3 text-gray-400">
            <Search aria-hidden="true" size={15} />
            <input
              aria-label={`Search ${config.title.toLowerCase()}`}
              className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search records..."
              type="search"
              value={search}
            />
          </label>
        </CardHeader>

        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                {config.fields.map((field) => <th className="px-4 py-3 font-medium" key={field.key}>{field.label}</th>)}
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {records.map((record) => (
                <tr className="text-gray-700" key={record.id}>
                  {config.fields.map((field) => (
                    <td className="max-w-[280px] truncate px-4 py-3" key={field.key} title={String(record[field.key] ?? "")}>
                      {displayValue(field, record[field.key])}
                    </td>
                  ))}
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <button aria-label={`Edit ${config.singular ?? "record"}`} className="mr-1 inline-grid size-8 place-items-center rounded-md text-gray-500 hover:bg-gray-100" onClick={() => startEdit(record)} type="button"><Pencil size={15} /></button>
                    <button aria-label={`Delete ${config.singular ?? "record"}`} className="inline-grid size-8 place-items-center rounded-md text-red-600 hover:bg-red-50" onClick={() => deleteRecord(record)} type="button"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
              {!loading && records.length === 0 && (
                <tr><td className="px-4 py-12 text-center text-sm text-gray-500" colSpan={config.fields.length + 1}>{search ? "No matching records." : `No ${config.title.toLowerCase()} yet. Add the first one to get started.`}</td></tr>
              )}
              {loading && <tr><td className="px-4 py-12 text-center text-sm text-gray-500" colSpan={config.fields.length + 1}>Loading records…</td></tr>}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {isFormOpen && (
        <div className="fixed inset-0 z-[130] grid place-items-center bg-gray-950/35 p-4" onClick={() => setIsFormOpen(false)}>
          <section aria-label={`${recordToEdit ? "Edit" : "Add"} ${config.title} record`} aria-modal="true" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{recordToEdit ? "Edit" : "Add"} {config.singular ?? "record"}</h2>
              <button aria-label="Close form" className="grid size-8 place-items-center rounded-md text-gray-500 hover:bg-gray-100" onClick={() => setIsFormOpen(false)} type="button"><X size={17} /></button>
            </div>
            {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{error}</p>}
            <form className="space-y-3" onSubmit={saveRecord}>
              <div className="grid gap-3 sm:grid-cols-2">
                {config.fields.map((field) => (
                  <label className={`${labelClass} ${field.type === "textarea" ? "sm:col-span-2" : ""}`} key={field.key}>
                    {field.label}{field.required ? " *" : ""}
                    {field.type === "select" ? (
                      <select className={inputClass} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} required={field.required} value={form[field.key]}>
                        {field.options.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    ) : field.type === "textarea" ? (
                      <textarea className={`${inputClass} h-24 py-2`} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} required={field.required} value={form[field.key]} />
                    ) : (
                      <input
                        className={inputClass}
                        min={field.type === "number" ? "0" : undefined}
                        onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))}
                        required={field.required}
                        step={field.format === "number" && ["stock", "quantity"].includes(field.key) ? "1" : field.type === "number" ? "0.01" : undefined}
                        type={field.type}
                        value={form[field.key]}
                      />
                    )}
                  </label>
                ))}
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
                <button className="h-9 rounded-lg border border-gray-200 px-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setIsFormOpen(false)} type="button">Cancel</button>
                <button className="h-9 rounded-lg bg-gray-900 px-4 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50" disabled={saving} type="submit">{saving ? "Saving…" : recordToEdit ? "Save changes" : "Create record"}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}

export default DashboardResourcePage;

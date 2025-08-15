// [web/src/components/SearchBar.jsx]
import React, { useState } from "react";

export default function SearchBar({ onSearch, defaultValue="" }) {
  const [q, setQ] = useState(defaultValue);
  return (
    <div className="glass p-4 flex items-center gap-2">
      <input
        className="flex-1 bg-transparent outline-none text-lg"
        placeholder="Buscar cidade (ex: São Paulo, BR)"
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        onKeyDown={(e)=> e.key==="Enter" && onSearch(q)}
        aria-label="Buscar cidade"
      />
      <button className="px-4 py-2 rounded-xl bg-sky-600 text-white" onClick={()=>onSearch(q)}>
        Buscar
      </button>
      <button className="px-3 py-2 rounded-xl" onClick={()=>location.reload()}>
        📍
      </button>
    </div>
  );
}

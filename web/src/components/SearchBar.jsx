import React, { useState } from "react";

export default function SearchBar({ onSearch }){
  const [q, setQ] = useState(localStorage.getItem("city") || "");

  function submit(e){
    e.preventDefault();
    const value = q.trim();
    if (!value) return;
    localStorage.setItem("city", value);
    onSearch?.(value);
  }

  return (
    <form className="search glass" onSubmit={submit}>
      <div className="search-left">
        <span className="loc-icon">📍</span>
        <input
          className="input"
          placeholder="Busque por Cidade, Estado ou País (ex.: Curitiba, Paraná ou Brasil)"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
      </div>
      <button className="btn" type="submit">Buscar</button>
    </form>
  );
}

// [web/src/components/InstallPWA.jsx]
import React, { useEffect, useState } from "react";

export default function InstallPWA() {
  const [prompt, setPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(()=>{
    const before = e => { e.preventDefault(); setPrompt(e); };
    window.addEventListener("beforeinstallprompt", before);
    window.addEventListener("appinstalled", ()=>setInstalled(true));
    return ()=> window.removeEventListener("beforeinstallprompt", before);
  },[]);

  if (installed) return null;

  return (
    <div className="glass p-4 flex items-center justify-between">
      <div>
        <div className="font-medium">Instalar o app</div>
        <div className="text-sm text-slate-600">
          Adicione o WeatherNow à tela inicial do celular ou instale no desktop.
        </div>
      </div>
      <button
        className="px-4 py-2 rounded-xl bg-sky-600 text-white disabled:opacity-50"
        disabled={!prompt}
        onClick={async ()=>{
          if (!prompt) return;
          prompt.prompt();
          await prompt.userChoice;
          setPrompt(null);
        }}>
        Instalar
      </button>
    </div>
  );
}

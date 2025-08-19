// web/src/components/InstallPWA.jsx
import React, { useEffect, useState } from "react";

export default function InstallPWA() {
  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferred(null);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) {
    return <div className="install-ok">✅ App instalado</div>;
  }

  if (!deferred) {
    return (
      <div className="muted">
        Para instalar, abra o menu do navegador e escolha <b>“Adicionar à tela inicial”</b>.
      </div>
    );
  }

  const handleInstall = async () => {
    deferred.prompt();
    const choice = await deferred.userChoice.catch(() => null);
    if (choice && choice.outcome === "accepted") {
      setDeferred(null);
    }
  };

  return (
    <div className="install">
      <button className="btn" onClick={handleInstall}>
        Instalar WeatherNow
      </button>
    </div>
  );
}

// CoachingTab.jsx
import React from "react";
import CoachingSessionsPanel from "./CoachingSessionsPanel";

function CoachingTab({ subscription }) {
  // Si no hay suscripción, ni renderizar
  if (!subscription) {
    return <p>Sin suscripción, no hay sesiones de coaching.</p>;
  }

  return (
    <div>
      {/* 
        Simplemente pasamos `subscription` completo
        en lugar de `subscriptionId`. 
      */}
      <CoachingSessionsPanel subscription={subscription} />
    </div>
  );
}

export default CoachingTab;

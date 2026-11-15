"use strict";
/* Solo interfaz: no entrega logros y no cambia las reglas de StarFlow. */
document.addEventListener('DOMContentLoaded', () => {
  const guide = document.getElementById('moonProgressGuide');
  const link = document.querySelector('a.next-act[href^="/marte"]');
  if (!guide || !link) return;
  const ready = () => window.StarFlow?.isActComplete?.('luna') === true && window.StarFlow?.canEnter?.('mars_transition') === true; // el Acto II empieza por la transición
  function render() {
    const en = window.StarI18n?.lang === 'en';
    const eagle = window.StarFlow?.getArtifact?.('eagle')?.state === 'registered';
    const arrived = window.StarFlow?.isStageCompleted?.('moon_landing') === true;
    const unlocked = ready();
    // Paso actual del Acto I según StarFlow (exploración, instrumentos, regreso, laboratorio).
    const stage = window.StarFlow?.getCurrentStage?.();
    const next = {
      moon_exploration: en ? 'Explore: Eagle, the plaque and the 5 items of the sample box.' : 'Explorá: Eagle, la placa y las 5 piezas de la caja de muestras.',
      moon_install_easep: en ? 'Install EASEP.' : 'Instalá el EASEP.',
      moon_install_reflector: en ? 'Install and aim the retroreflector.' : 'Instalá y orientá el retrorreflector.',
      moon_return: en ? 'Dock with Columbia.' : 'Acoplá con Columbia.',
      moon_lab: en ? 'Analyze the samples in the laboratory.' : 'Analizá las muestras en el laboratorio.'
    }[stage] || (en ? 'Inspect all Eagle components to register the discovery.' : 'Inspeccioná todos los componentes de Eagle para registrar el descubrimiento.');
    guide.textContent = unlocked ? (en ? '✓ Moon complete · On to Mars' : '✓ Luna completada · Rumbo a Marte')
      : !arrived ? (en ? 'Complete the landing.' : 'Completá el alunizaje.')
      : stage === 'moon_exploration' ? (en ? `Eagle ${eagle?'✓':'○'} · Plaque ${window.StarFlow?.getArtifact?.('plaque')?.state==='registered'?'✓':'○'}` : `Eagle ${eagle?'✓':'○'} · Placa ${window.StarFlow?.getArtifact?.('plaque')?.state==='registered'?'✓':'○'}`) : next;
    link.setAttribute('aria-disabled', String(!unlocked));
    link.title = unlocked ? '' : (en ? 'Complete the Moon mission first' : 'Completá la misión lunar primero');
  }
  // El enlace ya incorpora ?viaje=luna; no creamos datos de jugador adicionales.
  render();
  document.addEventListener('starstep:completed', render);
  document.addEventListener('starstep:unlocked', render);
  document.addEventListener('starflow:change', render);
  document.addEventListener('starstep:language', render);
});

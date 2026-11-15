"use strict";
/* Solo interfaz: no entrega logros y no cambia las reglas de StarFlow. */
document.addEventListener('DOMContentLoaded', () => {
  const guide = document.getElementById('moonProgressGuide');
  const link = document.querySelector('a.next-act[href^="/marte"]');
  if (!guide || !link) return;
  const ready = () => window.StarFlow?.isActComplete?.('luna') === true && window.StarFlow?.canEnter?.('mars_exploration') === true;
  function render() {
    const en = window.StarI18n?.lang === 'en';
    const eagle = window.StarFlow?.getArtifact?.('eagle')?.state === 'registered';
    const arrived = window.StarFlow?.isStageCompleted?.('moon_landing') === true;
    const unlocked = ready();
    guide.textContent = en
      ? (unlocked ? '✓ Lunar mission complete. Your lunar diploma is available in the logbook. Board the ship for Mars.'
        : `Lunar mission: landing ${arrived?'✓':'○'} · Eagle ${eagle?'✓':'○'}. ${!arrived?'Finish the launch and Moon landing sequence.':'Inspect all Eagle components to register the discovery.'}`)
      : (unlocked ? '✓ Misión lunar completada. Tu diploma lunar está disponible en la bitácora. Abordá la nave rumbo a Marte.'
        : `Misión lunar: alunizaje ${arrived?'✓':'○'} · Eagle ${eagle?'✓':'○'}. ${!arrived?'Completá el despegue y alunizaje.':'Inspeccioná todos los componentes de Eagle para registrar el descubrimiento.'}`);
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

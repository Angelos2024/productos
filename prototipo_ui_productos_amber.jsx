export default function ProductosAmberMobilePrototype() {
  const PrimaryButton = ({ children, className = "" }) => (
    <button className={`w-full rounded-2xl bg-slate-900 text-white py-4 px-4 text-[15px] font-semibold shadow-sm active:scale-[0.99] transition ${className}`}>
      {children}
    </button>
  );

  const SecondaryButton = ({ children, className = "" }) => (
    <button className={`w-full rounded-2xl border border-slate-200 bg-white text-slate-800 py-4 px-4 text-[15px] font-medium shadow-sm active:scale-[0.99] transition ${className}`}>
      {children}
    </button>
  );

  const Chip = ({ children, tone = "default" }) => {
    const tones = {
      default: "bg-slate-100 text-slate-700 border-slate-200",
      success: "bg-emerald-50 text-emerald-700 border-emerald-200",
      warning: "bg-amber-50 text-amber-700 border-amber-200",
      danger: "bg-rose-50 text-rose-700 border-rose-200",
      info: "bg-blue-50 text-blue-700 border-blue-200",
    };
    return <span className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${tones[tone]}`}>{children}</span>;
  };

  const SectionCard = ({ title, action, children }) => (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-[16px] font-semibold text-slate-900">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  );

  const BottomNavItem = ({ icon, label, active = false }) => (
    <button className="flex flex-col items-center justify-center gap-1 py-2 flex-1">
      <span className={`text-lg ${active ? "opacity-100" : "opacity-60"}`}>{icon}</span>
      <span className={`text-[11px] font-medium ${active ? "text-slate-900" : "text-slate-500"}`}>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex items-start justify-center py-0 sm:py-6">
      <div className="w-full max-w-[390px] min-h-screen sm:min-h-0 bg-slate-50 sm:rounded-[2.2rem] sm:border-8 sm:border-slate-900 sm:shadow-2xl overflow-hidden relative">
        <div className="bg-white border-b border-slate-200 px-4 pt-4 pb-3 sticky top-0 z-20">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[11px] text-slate-500">Android UI</p>
              <h1 className="text-[22px] font-bold tracking-tight text-slate-900">Productos Amber</h1>
            </div>
            <Chip tone="info">Demo</Chip>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button className="rounded-2xl bg-slate-900 text-white py-3 text-[13px] font-semibold">Tahor / Tame</button>
            <button className="rounded-2xl border border-slate-200 bg-white text-slate-700 py-3 text-[13px] font-semibold">Matzah</button>
          </div>
        </div>

        <main className="px-4 py-4 pb-28 space-y-4">
          <SectionCard title="Consulta rápida" action={<Chip>Principal</Chip>}>
            <div className="space-y-3">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-[15px] outline-none focus:ring-2 focus:ring-slate-300"
                placeholder="Nombre, marca o código"
              />
              <div className="grid grid-cols-2 gap-2">
                <PrimaryButton>Buscar</PrimaryButton>
                <SecondaryButton>Escanear</SecondaryButton>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <SecondaryButton>Subir ingredientes</SecondaryButton>
                <SecondaryButton>Filtros</SecondaryButton>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Acciones rápidas">
            <div className="grid grid-cols-3 gap-2">
              <button className="rounded-2xl bg-white border border-slate-200 p-3 text-center shadow-sm active:scale-[0.99]">
                <div className="text-xl mb-1">📷</div>
                <div className="text-[12px] font-medium text-slate-700 leading-tight">Escanear</div>
              </button>
              <button className="rounded-2xl bg-white border border-slate-200 p-3 text-center shadow-sm active:scale-[0.99]">
                <div className="text-xl mb-1">📝</div>
                <div className="text-[12px] font-medium text-slate-700 leading-tight">Registrar</div>
              </button>
              <button className="rounded-2xl bg-white border border-slate-200 p-3 text-center shadow-sm active:scale-[0.99]">
                <div className="text-xl mb-1">📂</div>
                <div className="text-[12px] font-medium text-slate-700 leading-tight">Pendientes</div>
              </button>
            </div>
          </SectionCard>

          <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 pt-4 pb-3 border-b border-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[12px] text-slate-500 mb-1">Resultado</p>
                  <h2 className="text-[18px] font-bold text-slate-900 leading-tight">Bebida de ejemplo</h2>
                </div>
                <Chip tone="success">Apto</Chip>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="rounded-3xl bg-slate-100 aspect-[4/3] flex items-center justify-center text-5xl">🧃</div>

              <div className="flex flex-wrap gap-2">
                <Chip>Marca Demo</Chip>
                <Chip>MX</Chip>
                <Chip tone="info">EAN</Chip>
              </div>

              <p className="text-[14px] leading-6 text-slate-600">
                El producto aparece como apto según la información disponible en esta demostración. No se detectaron coincidencias negativas visibles.
              </p>

              <div className="space-y-2">
                <PrimaryButton>Ver detalles</PrimaryButton>
                <SecondaryButton>Preguntar por este producto</SecondaryButton>
                <SecondaryButton>Corregir información</SecondaryButton>
              </div>
            </div>
          </div>

          <SectionCard title="Detalles del análisis" action={<button className="text-[12px] text-slate-500 font-medium">Ver más</button>}>
            <div className="space-y-3">
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[12px] text-slate-500 mb-1">Motivo principal</p>
                <p className="text-[14px] text-slate-700 leading-6">No se encontraron coincidencias negativas dentro de los ingredientes procesados.</p>
              </div>
              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3">
                <p className="text-[12px] text-slate-500 mb-2">Ingredientes destacados</p>
                <div className="flex flex-wrap gap-2">
                  <Chip>agua</Chip>
                  <Chip>azúcar</Chip>
                  <Chip>ácido cítrico</Chip>
                  <Chip>sabores naturales</Chip>
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Registro manual" action={<Chip>Simple</Chip>}>
            <div className="space-y-3">
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-[15px]" placeholder="Nombre del producto" />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-[15px]" placeholder="Marca" />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-[15px]" placeholder="Código de barras" />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-[15px]" placeholder="País" />
              <textarea className="w-full rounded-2xl border border-slate-200 px-4 py-4 text-[15px] min-h-[110px]" placeholder="Ingredientes" />
              <div className="grid grid-cols-2 gap-2">
                <SecondaryButton>Subir imagen</SecondaryButton>
                <SecondaryButton>Marcar dudoso</SecondaryButton>
              </div>
              <PrimaryButton>Enviar</PrimaryButton>
            </div>
          </SectionCard>

          <SectionCard title="Actividad reciente">
            <div className="space-y-2">
              {[
                ["Pan integral demo", "Dudoso", "warning"],
                ["Galletas demo", "Pendiente", "info"],
                ["Jugo demo", "Apto", "success"],
              ].map(([name, state, tone], i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-[14px] font-medium text-slate-800">{name}</p>
                    <p className="text-[12px] text-slate-500">Consulta reciente</p>
                  </div>
                  <Chip tone={tone}>{state}</Chip>
                </div>
              ))}
            </div>
          </SectionCard>
        </main>

        <button className="absolute right-4 bottom-24 w-14 h-14 rounded-full bg-slate-900 text-white text-2xl shadow-lg active:scale-[0.98] z-20">
          +
        </button>

        <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-2 py-2 flex items-center justify-between z-20">
          <BottomNavItem icon="🏠" label="Inicio" active />
          <BottomNavItem icon="🔎" label="Buscar" />
          <BottomNavItem icon="📷" label="Escanear" />
          <BottomNavItem icon="📝" label="Registrar" />
          <BottomNavItem icon="📂" label="Pendientes" />
        </nav>
      </div>
    </div>
  );
}

import React from "react";

export const Equipo = ({ propiedades }) => {
  console.log(propiedades);
  const todosLosAgentes = propiedades.map((p) => p.agentes).filter(Boolean); // elimina undefined/null por seguridad

  // 2. Filtrar agentes únicos por su ID
  const agentesUnicos = Array.from(
    new Map(todosLosAgentes.map((a) => [a.agente_id, a])).values()
  );

  // 3. Puedes enriquecer con nombre si tienes el mapeo:
  const agentesId = [
    { id: "101914741", nombre: "Verónica Olán García" },
    { id: "102162316", nombre: "Andrés Guerra Olan" },
    { id: "101932987", nombre: "Andrés Guerra García" },
    { id: "102296937", nombre: "Beatriz Hernandez Aguilera" },
    { id: "102298360", nombre: "Verónica Itzel Guerra Olán" },
    { id: "102312153", nombre: "Dulce Angelica Flores De Jesus" },
    { id: "102427296", nombre: "Aída Leon Varela" },
    { id: "102437017", nombre: "Yazmin Vazquez Valdez" },
    { id: "102433046", nombre: "Fernanda Lozada" },
  ];

  const agentesConNombre = agentesUnicos.map((agente) => {
    const match = agentesId.find((a) => a.id === agente.numeroasociado);
    return {
      ...agente, nombre: match?.nombre || "Agente desconocido",
    };
  });

  return (
    <div className="bg-white flex flex-row justify-center w-full">
      <div className="bg-white w-full max-w-[1440px] py-16 px-6 relative">
        <div className="bg-[#f9f9f9] rounded-[10px] shadow-[0px_4px_4px_#00000040] overflow-hidden mb-8 p-8">
          <h1 className="font-extrabold italic text-[#7b7b7b] text-3xl text-center mb-4 [font-family:'Lato',Helvetica]">
            Nuestro Equipo
          </h1>
          <p className="text-center text-[#7b7b7b] text-lg [font-family:'Lato',Helvetica]">
            Conoce a los profesionales que hacen posible brindar el mejor servicio a nuestros clientes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {agentesConNombre.map((agente) => (
            <div
              key={agente.id}
              className="bg-[#f9f9f9] rounded-[10px] shadow-[0px_4px_4px_#00000040] overflow-hidden p-5 flex flex-col items-center"
            >
              <div className="w-[200px] h-[200px] mb-6 relative">
                <img
                  className="w-full h-full object-cover rounded-full"
                  alt="Agente"
                  src=  {`https://cdn.remax.com.mx/agentes/${agente.imagen}`}
                />
              </div>

              <h3 className="font-extrabold italic text-[#7b7b7b] text-xl text-center mb-1 [font-family:'Lato',Helvetica]">
              {agente.nombre}
              </h3>

              <p className="font-normal italic text-[#db1c2e] text-lg text-center mb-3 [font-family:'Lato',Helvetica]">
                {/* {member.role} */}
              </p>

              <div className="flex space-x-4">
                <button aria-label="Send email" className="p-1">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </button>
                <button aria-label="Call" className="p-1">
                  <svg width="20" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

};

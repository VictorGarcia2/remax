import React from "react";

export const Equipo = ({ propiedades }) => {
  console.log(propiedades);
  const todosLosAgentes = propiedades.map((p) => p.agentes).filter(Boolean); // elimina undefined/null por seguridad

  // 2. Filtrar agentes únicos por su ID
  const agentesUnicos = Array.from(
    new Map(todosLosAgentes.map((a) => [a.agente_id, a])).values()
  );

  // 3. Lista de agentes con sus nombres
  const agentesId = [
    {
      id: "101914741",
      nombre: "Verónica Olán García",
      role: "Broker Owner",
      correo: null,
      telefono: null,
    },
    {
      id: "102162316",
      nombre: "Andrés Guerra Olan",
      role: "Gerente Comercial",
      imagen: "https://cdn.remax.com.mx/agentes/1631137654.jpg",
      correo: "a.guerraolan@gmail.com",
      telefono: "9933468417",
    },
    {
      id: "101932987",
      nombre: "Andrés Guerra García",
      role: "Silent Broker",
      correo: "aguerra736@gmail.com",
      telefono: "2292696629",
    },
    {
      id: "102427296",
      nombre: "Aída Leon Varela",
      role: "Coordinadora Jurídica",
      imagen: "https://cdn.remax.com.mx/agentes/1743614587.jpg",
      correo: "juridico.remax.cin.veracruz@gmail.com",
      telefono: "2292696629",
    },
    {
      id: "102296937",
      nombre: "Beatriz Hernandez Aguilera",
      role: "Asociado",
      correo: "bettyhdez1@gmail.com",
      telefono: "2292696629",
    },
    {
      id: "102298360",
      nombre: "Verónica Itzel Guerra Olán",
      role: "Asociado",
      correo: "remaxcincoleccion@gmail.com",
      telefono: "2292696629",
    },
    {
      id: "102312153",
      nombre: "Dulce Angelica Flores De Jesus",
      role: "Asociado",
      correo: "floresdejesus9@gmail.com",
      telefono: "2292696629",
    },
    {
      id: "102437017",
      nombre: "Yazmin Vazquez Valdez",
      role: "Asociado",
      correo: "arq.vazquez@live.com.mx",
      telefono: "7821224287",
    },
    {
      id: "102433046",
      nombre: "Fernanda Lozada",
      role: "Asociado",
      correo: "fernanda.lozada0608@gmail.com",
      telefono: "2291746290",
      imagen: "https://cdn.remax.com.mx/agentes/1738008694.jpg"
    },
    {
      id: "FALTANTE",
      nombre: "Oscar Cordero García",
      role: "Asociado",
      correo: "oscar.corderoga@gmail.com",
      telefono: "228147770",
      imagen: "https://cdn.remax.com.mx/agentes/1739232781.jpg"
    },
    {
      id: "FALTANTE",
      nombre: "Daniela Martínez",
      role: "Asociado",
      correo: "danielamtzvarela07@gmail.com",
      telefono: "2291125136",
      imagen: "https://cdn.remax.com.mx/agentes/1741797649.jpg"
    },
  ];
  

  // 4. Combinar agentes únicos con la lista completa de agentes
  const agentesConNombre = agentesId.map((agente) => {
    const match = agentesUnicos.find((a) => a.numeroasociado === agente.id);
    return {
      ...match,
      ...agente, // agente sobrescribe match
      imagen:
        agente.imagen ||
        match?.imagen ||
        "https://cdn.remax.com.mx/agentes/default.jpg",
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
            Conoce a los profesionales que hacen posible brindar el mejor
            servicio a nuestros clientes
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
                  src={
                    agente.imagen
                      ? agente.imagen.startsWith("http")
                        ? agente.imagen
                        : `https://cdn.remax.com.mx/agentes/${agente.imagen}`
                      : "https://cdn.remax.com.mx/agentes/default.jpg"
                  }
                />
              </div>

              <h3 className="font-extrabold italic text-[#7b7b7b] text-xl text-center mb-1 [font-family:'Lato',Helvetica]">
                {agente.nombre}
              </h3>

              <p className="font-normal italic text-[#db1c2e] text-lg text-center mb-3 [font-family:'Lato',Helvetica]">
                {agente.role}
              </p>

              <div className="flex space-x-4">
                <button aria-label="Send email" className="p-1">
                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-700"
                  >
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </button>
                <button aria-label="Call" className="p-1">
                  <svg
                    width="20"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gray-700"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

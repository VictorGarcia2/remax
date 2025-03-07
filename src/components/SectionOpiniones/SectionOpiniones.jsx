import React from "react";
const opiniones = [
  {
    nombre: "Fernando Gutierrez",
    comentario:
      "Muy buena atención y gran servicio por parte del asesor que me atendió",
    estrellas: 3,
    imagenUsuario: "HomePageContent/user-solid 1.svg",
  },
  {
    nombre: "Fernando Gutierrez",
    comentario:
      "Muy buena atención y gran servicio por parte del asesor que me atendió",
    estrellas: 1,
    imagenUsuario: "HomePageContent/user-solid 1.svg",
  },
  {
    nombre: "Fernando Gutierrez",
    comentario:
      "Muy buena atención y gran servicio por parte del asesor que me atendió",
    estrellas: 5,
    imagenUsuario: "HomePageContent/user-solid 1.svg",
  },
  {
    nombre: "Fernando Gutierrez",
    comentario:
      "Muy buena atención y gran servicio por parte del asesor que me atendió",
    estrellas: 2,
    imagenUsuario: "HomePageContent/user-solid 1.svg",
  },
  {
    nombre: "Fernando Gutierrez",
    comentario:
      "Muy buena atención y gran servicio por parte del asesor que me atendió",
    estrellas: 3,
    imagenUsuario: "HomePageContent/user-solid 1.svg",
  },
  {
    nombre: "Fernando Gutierrez",
    comentario:
      "Muy buena atención y gran servicio por parte del asesor que me atendió",
    estrellas: 2,
    imagenUsuario: "HomePageContent/user-solid 1.svg",
  },
  {
    nombre: "Fernando Gutierrez",
    comentario:
      "Muy buena atención y gran servicio por parte del asesor que me atendió",
    estrellas: 3,
    imagenUsuario: "HomePageContent/user-solid 1.svg",
  },
  {
    nombre: "Fernando Gutierrez",
    comentario:
      "Muy buena atención y gran servicio por parte del asesor que me atendió",
    estrellas: 1,
    imagenUsuario: "HomePageContent/user-solid 1.svg",
  },
  // Puedes agregar más opiniones aquí
];
export default function SectionOpiniones() {
  return (
    <div className="mt-10 mb-10 px-5 font-display   justify-center items-center text-center">
      <p className="italic text-2xl font-[800] text-[#7b7b7b]">
        Opiniones Verificadas en Google
      </p>
      <div className="mt-6 pt-10 ps-10 pe-3 flex gap-10 overflow-x-scroll">
        {opiniones.map((opinion, index) => (
          <div key={index} className="relative  mb-10">
            <div className="bg-[#D9D9D9]  absolute shadow-[0_5px_5px] shadow-black/40 -mt-6 -ml-6 w-16 h-16 rounded-full flex justify-center items-center">
              <img loading="lazy" src={opinion.imagenUsuario} alt="" />
            </div>
            <div className="flex flex-col items-center w-[279px] h-[212px] shadow-[0_5px_5px] shadow-black/40 bg-[#f0f0f0] p-5 font-display text-[#7b7b7b] rounded">
              <p className="font-[500] italic text-base">{opinion.nombre}</p>
              <div className="flex gap-1 mt-3">
                {Array.from({ length: opinion.estrellas }).map((_, i) => (
                  <img loading="lazy" key={i} src="HomePageContent/Star.svg" alt="" />
                ))}
              </div>
              <p className="mt-3 text-base">{opinion.comentario}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

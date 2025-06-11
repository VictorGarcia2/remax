import React from "react";

export default function SectionEquipo({ valor }) {
  const contenido = {
    residencial: {
      tituloPrincipal:
        "Encuentra la casa de tus sueños antes que nadie. ¡Suscríbete!",
      textoImagen:
        "Tu nuevo hogar está más cerca de lo que piensas. Descubre propiedades exclusivas.",
      subtituloDesktop:
        "Descubre casas, departamentos y terrenos ideales para ti y tu familia.",
      textoBoton: "Más información",
      imagenSrc: "/HomePageContent/mujer-llamando.jpg",
    },
    comercial: {
      tituloPrincipal:
        "Recibe primero las mejores oportunidades industriales y comerciales. ¡Suscríbete ahora!",
      textoImagen:
        "Únete a nosotros y aprovecha las oportunidades del mercado inmobiliario comercial.",
      subtituloDesktop:
        "Explora locales, oficinas y bodegas. ¡Tu próximo gran negocio te espera!",
      textoBoton: "Más información",
      imagenSrc: "/HomePageContent/mujer-llamando.jpg",
    },
  };

  const contenidoActual =
    valor === "comercial" ? contenido.comercial : contenido.residencial;

  return (
    <>
      {/* Vista Móvil */}
      <div className="sm:hidden mt-10 mb-10 px-5 font-display flex flex-col justify-center items-center text-center">
        <p className="italic text-2xl font-[800] text-[#7b7b7b]">
          {contenidoActual.tituloPrincipal}
        </p>

        <div className="mt-4 relative font-display font-[400] flex flex-col items-center">
          <p className="absolute z-10 italic bottom-16 sm:bottom-20 bg-black/40 rounded-2xl p-2 w-full max-w-[300px] sm:max-w-xs font-[700] text-[18px] sm:text-[20px] text-white">
            {contenidoActual.textoImagen}
          </p>

          <img
            className="rounded-2xl shadow-[0_5px_5px] shadow-black/10 w-full max-w-sm object-cover h-auto"
            src={contenidoActual.imagenSrc}
            alt="Profesional inmobiliario contactando clientes"
            loading="lazy"
          />
          <button
            className={`z-10 shadow-[0_5px_5px] shadow-black/40 -mt-8 w-44 h-14 rounded-2xl text-white ${
              valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
            }`}
          >
            {contenidoActual.textoBoton}
          </button>
        </div>
      </div>

      {/* Vista Escritorio */}
      <div className="hidden sm:flex mt-10 mb-10 px-5 font-display gap-10 justify-center items-center text-center">
        <img
          className="rounded-2xl w-[462px] h-[514px] object-cover shadow-[0_5px_5px] shadow-black/10"
          src={contenidoActual.imagenSrc}
          alt="Profesional inmobiliario en oficina"
          loading="lazy"
        />
        <div className="mt-4 font-display gap-4 font-[400] flex flex-col items-center">
          <p className="italic text-4xl lg:text-5xl w-[480px] font-[800] text-[#7b7b7b]">
            {contenidoActual.tituloPrincipal}
          </p>
          <p className="text-lg lg:text-xl w-[480px] font-[700] text-[#7b7b7b] mt-2">
            {contenidoActual.subtituloDesktop}
          </p>

          <button
            className={`z-10 shadow-[0_5px_5px] shadow-black/40 w-52 h-16 rounded-2xl text-white text-lg font-semibold mt-6 ${
              valor === "comercial" ? "bg-redRemax" : "bg-blueRemax"
            }`}
          >
            {contenidoActual.textoBoton}
          </button>
        </div>
      </div>
    </>
  );
}

import React from "react";
export default function SectionPorque() {
  return (
    <>
      {/*  <div className="px-5 font-display flex flex-col justify-center items-center text-center">
        <p className="text-2xl mt-10 text-[#7b7b7b]">
          ¿<span className="font-[800] "> Por qué</span> Elegir
          <span className="font-[800] italic ">REMAX CIN </span> para tu Próxima{" "}
          <span className="font-[800] italic "> Propiedad Residencial </span> ?
        </p>
        <p className="text-base text-[#7b7b7b] mt-3">
          En REMAX CIN, nos esforzamos por ofrecerte la mejor experiencia en
          bienes raíces residenciales. Nuestro compromiso con la calidad y el
          servicio personalizado nos distingue, asegurando que encuentres el
          hogar perfecto para ti y tu familia.
        </p>
      </div> */}
      <div class=" w-full bg-blueRemax/20  py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
        <div class="md:grid md:grid-cols-2 md:items-center md:gap-12 xl:gap-32">
          <div>
            <img
              class="rounded-xl"
              src="/HomePageContent/nathan-fertig-FBXuXp57eM0-unsplash.webp"
              alt="Features Image"
            />
          </div>
          <div class="">
            <div class="space-y-6 sm:space-y-8">
              <div class="space-y-2 md:space-y-4">
                <p className="text-2xl sm:text-[40px] sm:mt-0 mt-10 text-[#2e2c2c]">
                  ¿Qué hace de{" "}
                  <span className="font-[800] italic "> REMAX CIN</span> tu
                  mejor aliado en{" "}
                  <span className="font-[800] italic "> propiedades</span>{" "}
                  comerciales?
                </p>
                <p className="text-base sm:text-3xl text-[#2e2c2c] mt-3">
                  Encuentra opciones comerciales ideales con asesoría experta y
                  certeza jurídica en REMAX CIN. Vende o renta tu propiedad con
                  seguridad, rapidez y el mejor valo
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

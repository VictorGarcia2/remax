import React, { useState, useEffect } from "react";

const content = [
  {
    key: "comercial",
    tittle: (
      <>
        ¿Qué hace de <span className="font-[800] italic">REMAX CIN</span> tu
        mejor aliado en <span className="font-[800] italic">propiedades</span>{" "}
        comerciales?
      </>
    ),
    description: (
      <>
        Solo REMAX, forma parte del del Instituto Comercial e Industrial (ICEI),
        transformamos el mercado con asesores especializados y certificados.
        Nuestra red de{" "}
        <span className="font-[800] italic"> 15,000+ expertos</span> en{" "}
        <span className="font-[800] italic"> 110 países </span> , combinada con
        capacitación de élite y soporte corporativo, garantiza transacciones
        seguras y estratégicas. Aquí no solo compras o vendes; inviertes con
        ventaja competitiva
      </>
    ),
    imagen: "/public/HomePageContent/comercial/Comercial-nave2.jpg",
  },
  {
    key: "residencial",
    tittle: (
      <>
        ¿Por qué Elegir <span className="font-[800] italic">REMAX CIN</span>{" "}
        para tu Próxima Propiedad?
      </>
    ),
    description:
      "Con el respaldo de una marca global y más de 28 años transformando sueños en hogares. Más que una inmobiliaria, somos tu plataforma de soluciones inmobiliarias con asesores expertamente capacitados. Combinamos experiencia, innovación y servicio personalizado para ofrecerte la mejor experiencia en bienes raíces residenciales. Descubre la diferencia de trabajar con los mejores.",
    imagen: "/HomePageContent/residencial/2.webp",
  },
];

export default function SectionPorque({ valor }) {
  const [selectedKey, setSelectedKey] = useState(null);

  // Cargar valor inicial desde localStorage o prop "valor"
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedKey = localStorage.getItem("selectedKey");
      setSelectedKey(storedKey || valor);
    }
  }, []);

  // Guardar en localStorage cuando cambia selectedKey
  useEffect(() => {
    if (selectedKey) {
      localStorage.setItem("selectedKey", selectedKey);
    }
  }, [selectedKey]);

  // Actualizar si el prop "valor" cambia
  useEffect(() => {
    if (valor) {
      setSelectedKey(valor);
    }
  }, [valor]);

  const selectedContent = content.find((item) => item.key === valor) || content[0];

  return (
    <div className="w-full bg-blueRemax/20 px-6 py-10 sm:px-6 lg:px-8 lg:py-14 mx-auto">
      <div className="md:grid md:grid-cols-2 md:items-center md:gap-12 xl:gap-32">
        <div>
          <img
            className="rounded-xl"
            src={selectedContent.imagen}
            alt="Features Image"
          />
        </div>
        <div>
          <div className="space-y-6 sm:space-y-8">
            <div className="space-y-2 md:space-y-4">
              <p className="text-2xl sm:text-[40px] sm:mt-0 mt-10 text-[#2e2c2c]">
                {selectedContent.tittle}
              </p>
              <p className="text-base sm:text-3xl text-[#2e2c2c] mt-3">
                {selectedContent.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

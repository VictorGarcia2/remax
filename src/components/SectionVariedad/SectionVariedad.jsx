import { Navigate, useNavigate } from "react-router";

export default function SectionVariedad({ setBusqueda, setSelectedOptionsTipos, valor }) {
  const Navigate = useNavigate();

  const categorias = [
    {
      nombre: "Residencial",
      propiedades: [
        { img: "/HomePageContent/residencial/residencial-desarrollo.webp", title: "Desarrollos", tipo_id: 6 },
        { img: "/HomePageContent/residencial/residencial-terreno.webp", title: "Terrenos", tipo_id: 4 },
        { img: "/HomePageContent/residencial/residencial-interiordepa3.webp", title: "Departamentos", tipo_id: 3 },
        { img: "/HomePageContent/residencial/residencial-casa2.webp", title: "Casa", tipo_id: 1 },
      ],
    },
    {
      nombre: "Comercial",
      propiedades: [
        { img: "/HomePageContent/comercial/Comercial-oficina2.webp", title: "Oficinas", tipo_id: 7 },
        { img: "/HomePageContent/comercial/Comercial-bodega.webp", title: "Bodegas y Naves", tipo_id: 7 },
        { img: "/HomePageContent/comercial/Comercial-local2.webp", title: "Locales", tipo_id: 9 },
        { img: "/HomePageContent/comercial/Comercial-rancho.webp", title: "Fincas y Ranchos", tipo_id: 14 },
        { img: "/HomePageContent/comercial/Comercial-terreno2.webp", title: "Terrenos", tipo_id: 10 },
        { img: "/HomePageContent/comercial/Comercial-hotel.webp", title: "Hoteles", tipo_id: 7 },
      ],
    },
  ];

  const handleSearch = (e) => {
    const tipo = e.currentTarget.id;
    setSelectedOptionsTipos([tipo]);
    Navigate("/propiedades");
  };

  // Filtra la categoría que coincide con `valor`
  const categoriaSeleccionada = categorias.find(
    (cat) => cat.nombre.toLowerCase() === valor?.toLowerCase()
  );

  if (!categoriaSeleccionada) {
    return (
      <div className="text-center text-gray-600 py-10">
        <p>No hay propiedades para la categoría seleccionada.</p>
      </div>
    );
  }

  return (
    <div className="sm:px-6 lg:px-8 bg-gray-100 pb-10 font-display flex flex-col justify-center items-center text-center">
      <p className="text-2xl mt-10 font-[800] pb-4 sm:text-3xl sm:w-96 sm:pb-10 text-[#2e2c2c]">
        Inmuebles {categoriaSeleccionada.nombre}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {categoriaSeleccionada.propiedades.map((propiedad, index) => (
          <div
            key={index}
            id={propiedad.tipo_id}
            onClick={handleSearch}
            className="bg-black rounded relative flex flex-col justify-center items-center cursor-pointer"
          >
            <p className="absolute text-lg italic text-white font-bold sm:text-4xl z-50">
              {propiedad.title}
            </p>
            <img
              loading="lazy"
              className="opacity-90 object-cover w-[356px] sm:w-[660px] sm:h-[262px] h-[140px] rounded"
              src={propiedad.img}
              alt={propiedad.title}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Navigate, useNavigate } from "react-router";


export default function SectionVariedad({ setBusqueda, setSelectedOptionsTipos }) {
  const Navigate = useNavigate();

  const propiedades = [
    { img: "/HomePageContent/optim.webp", title: "Desarrollos","tipo_id": 6,  },
    { img: "/HomePageContent/optim2.webp", title: "Terrenos", "tipo_id": 4},
    { img: "/HomePageContent/optim3.webp", title: "Departamentos", "tipo_id": 3 },
    { img: "/HomePageContent/optim4.webp", title: "Casa" , "tipo_id": 1, },
  ];

  const handleSearch = (e) => {
    const tipo = e.currentTarget.id; // usa currentTarget para evitar errores con children
    setSelectedOptionsTipos([tipo]);
    Navigate("/propiedades");
  };

  return (
    <div className="sm:px-6 lg:px-8 bg-gray-100 pb-10 font-display flex flex-col justify-center items-center text-center">
      <p className="text-2xl mt-10 font-[800] pb-4 sm:text-3xl sm:w-96 sm:pb-10 text-[#2e2c2c]">
        Amplia Variedad de Inmuebles Residenciales
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 ">
        {propiedades.map((propiedad, index) => (
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

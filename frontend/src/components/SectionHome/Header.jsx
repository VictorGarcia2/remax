import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSearchContext } from "../../context/SearchContext";

export default function Header({ setSelectedOptionsOperacion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVenderOpen, setIsVenderOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { valor } = useSearchContext();

  // Cerrar dropdown al hacer clic fuera (solo en móvil)
  useEffect(() => {
    function handleClickOutside(event) {
      if (window.innerWidth < 768 && dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsVenderOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  return (
    <nav className="bg-white fixed w-full z-100 top-0 start-0 shadow-sm">
      <div className="max-w-screen-xl  flex flex-wrap items-center justify-between mx-auto h-16 md:h-20 px-3 md:px-6">
        <Link
          to={"/inicio"}
          className="flex items-center space-x-3 rtl:space-x-reverse h-full"
        >
          <img
            src="logos/New_RMX_Mark_R4_RGB_dark.png"
            className="h-10 md:h-14"
            alt="REMAX Logo"
          />
        </Link>
        <div className="flex  md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse items-center h-full">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 ${
              valor === "comercial" ? "text-red-500 focus:ring-red-200" : "text-blue-500 focus:ring-blue-200"
            }`}
            aria-controls="navbar-sticky"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Abrir menú</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } items-center  justify-between w-full md:flex md:w-auto md:order-1 transition-all duration-300 ease-in-out h-full`}
          id="navbar-sticky"
        >
          {/* Overlay para menú hamburguesa en móvil */}
          {isOpen && (
            <div className="fixed mt-1 z-50 flex items-center justify-center md:hidden">
              <div className="w-[90vw] max-h-[50vh] min-h-fit bg-white rounded-2xl shadow-2xl flex flex-col items-center p-6 border border-gray-200 overflow-y-auto justify-center">
                <ul className="flex flex-col w-full font-medium space-y-2 items-center justify-center">
                  <li className="py-1 w-full">
                    <Link
                      to="/"
                      className={`block py-2 px-3 rounded-md w-full text-center md:bg-transparent md:p-0 md:hover:text-current ${valor === "comercial" ? "text-red-700 md:text-red-700 md:hover:text-red-800" : "text-blue-700 md:text-blue-700 md:hover:text-blue-800"}`}
                      aria-current="page"
                      onClick={() => setIsOpen(false)}
                    >
                      Inicio
                    </Link>
                  </li>
                  <li className="py-1 w-full">
                    <Link
                      onClick={() => {
                        setSelectedOptionsOperacion([1]);
                        setIsOpen(false);
                      }}
                      to="/propiedades"
                      className={`block py-2 px-3 text-gray-700 rounded-md w-full text-center hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                    >
                      Comprar
                    </Link>
                  </li>
                  <li className="py-1 w-full">
                    <Link
                      to="/valuador"
                      className="block py-2 px-3 text-gray-700 rounded-md w-full text-center hover:bg-gray-100 md:hover:bg-transparent md:p-0"
                      onClick={() => setIsOpen(false)}
                    >
                      Valuar mi propiedad
                    </Link>
                  </li>
                {/*   <li className="py-1 w-full">
                    <a
                      href="#"
                      className={`block py-2 px-3 text-gray-700 rounded-md w-full text-center hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Tramita tu crédito
                    </a>
                  </li> */}
                  <li className="py-1 w-full">
                    <Link
                      to="/Polizas-de-renta"
                      className={`block py-2 px-3 text-gray-700 rounded-md w-full text-center hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Pólizas de renta
                    </Link>
                  </li>
                  <li className="py-1 w-full">
                    <Link
                      to="/NuestroEquipo"
                      className={`block py-2 px-3 text-gray-700 rounded-md w-full text-center hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Nuestro equipo
                    </Link>
                  </li>
                  <li className="py-1 w-full">
                    <Link
                      to="/reclutamiento"
                      className="block py-2 px-3 text-gray-700 rounded-md w-full text-center hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
                      onClick={() => setIsOpen(false)}
                    >
                      Únete a nosotros
                    </Link>
                  </li>
                  <li className="py-1 w-full">
                    <Link
                      to="/desarrollo-trebol-ii"
                      className="py-2 px-3 rounded-md bg-[#db1c2e] text-white font-bold shadow-md border border-[#db1c2e] hover:bg-red-700 transition flex items-center gap-2 relative w-full justify-center"
                      onClick={() => setIsOpen(false)}
                    >
                      Trébol II
                      <span className="ml-2 bg-white text-[#db1c2e] text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-[#db1c2e]">Nuevo</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          )}
          {/* Menú normal en desktop */}
          <ul className="hidden md:flex flex-row p-0 mt-0 font-medium md:space-x-6 lg:space-x-8 md:mt-0 md:border-0 md:bg-white h-full items-center">
            <li className="py-1">
              <Link
                to="/"
                className={`block py-2 px-3 rounded-md md:bg-transparent md:p-0 md:hover:text-current ${valor === "comercial" ? "text-red-700 md:text-red-700 md:hover:text-red-800" : "text-blue-700 md:text-blue-700 md:hover:text-blue-800"}`}
                aria-current="page"
                onClick={() => setIsOpen(false)}
              >
                Inicio
              </Link>
            </li>
            <li className="py-1">
              <Link
                onClick={() => {
                  setSelectedOptionsOperacion([1]);
                  setIsOpen(false);
                }}
                to="/propiedades"
                className={`block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
              >
                Comprar
              </Link>
            </li>
            <li className="relative py-1 group" ref={dropdownRef}>
              <div className="flex items-center">
                <button
                  className="flex items-center w-full py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:w-auto"
                  onMouseEnter={() => setIsVenderOpen(true)}
                  onClick={() => setIsVenderOpen(!isVenderOpen)}
                >
                  Vender
                  <svg
                    className={`w-2.5 h-2.5 ml-2.5 transition-transform ${isVenderOpen ? 'rotate-180' : ''}`}
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 10 6"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 4 4 4-4"
                    />
                  </svg>
                </button>
              </div>
            
              <div
                className={`${
                  isVenderOpen ? "block" : "hidden"
                } md:group-hover:block absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 md:w-48 mt-1`}
                onMouseLeave={() => setIsVenderOpen(false)}
              >
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                  </li>
                  <li>
                    <Link
                      onClick={() => {
                        setIsVenderOpen(false);
                        setIsOpen(false);
                      }}
                      to={"/valuador"}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Valuar mi propiedad
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
         {/*    <li className="py-1">
              <a
                href="#"
                className={`block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                onClick={() => setIsOpen(false)}
              >
                Tramita tu crédito
              </a>
            </li> */}
            <li className="py-1">
              <Link
                to="/Polizas-de-renta"
                className={`block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                onClick={() => setIsOpen(false)}
              >
                Pólizas de renta
              </Link>
            </li>
            <li className="py-1">
              <Link
                to="/NuestroEquipo"
                className={`block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                onClick={() => setIsOpen(false)}
              >
                Nuestro equipo
              </Link>
            </li>
            <li className="py-1">
              <Link
                to="/reclutamiento"
                className="block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
                onClick={() => setIsOpen(false)}
              >
                Únete a nosotros
              </Link>
            </li>
            <li className="hidden md:block mx-2 border-l border-gray-300 h-8 self-center"></li>
            <li className="py-1 md:ml-4 mt-2 md:mt-0">
              <Link
                to="/desarrollo-trebol-ii"
                className=" py-2 px-3 rounded-md bg-[#db1c2e] text-white font-bold shadow-md border border-[#db1c2e] hover:bg-red-700 transition flex items-center gap-2 relative"
                onClick={() => setIsOpen(false)}
              >
                Trébol II
                <span className="ml-2 bg-white text-[#db1c2e] text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-[#db1c2e]">Nuevo</span>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
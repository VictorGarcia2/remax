import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Header({ setSelectedOptionsOperacion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVenderOpen, setIsVenderOpen] = useState(false);
  const dropdownRef = useRef(null);

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
    <nav className="bg-white fixed w-full z-50 top-0 start-0 shadow-sm">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-3">
        <Link
          to={"/inicio"}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="logos/New_RMX_Mark_R4_RGB_dark.png"
            className="h-10 md:h-14"
            alt="REMAX Logo"
          />
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
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
          } items-center justify-between w-full md:flex md:w-auto md:order-1 transition-all duration-300 ease-in-out`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-6 lg:space-x-8 md:mt-0 md:border-0 md:bg-white">
            <li className="py-1">
              <Link
                to={"/"}
                className="block py-2 px-3 text-white bg-blue-700 rounded-md md:bg-transparent md:text-blue-700 md:p-0 md:hover:text-blue-800"
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
                to={"/propiedades"}
                className="block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
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
              {/* Dropdown menu */}
              <div
                className={`${
                  isVenderOpen ? "block" : "hidden"
                } md:group-hover:block absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 md:w-48 mt-1`}
                onMouseLeave={() => setIsVenderOpen(false)}
              >
                <ul className="py-2 text-sm text-gray-700">
                  <li>
                    <Link
                      onClick={() => {
                        setSelectedOptionsOperacion([2]);
                        setIsVenderOpen(false);
                        setIsOpen(false);
                      }}
                      to={"/propiedades"}
                      className="block px-4 py-2 hover:bg-gray-100"
                    >
                      Publicar propiedad
                    </Link>
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
            <li className="py-1">
              <a
                href="#"
                className="block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
                onClick={() => setIsOpen(false)}
              >
                Tramita tu crédito
              </a>
            </li>
            <li className="py-1">
              <Link
                to={"/Polizas-de-renta"}
                className="block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
                onClick={() => setIsOpen(false)}
              >
                Pólizas de renta
              </Link>
            </li>
            <li className="py-1">
              <Link
                to={"/NuestroEquipo"}
                className="block py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
                onClick={() => setIsOpen(false)}
              >
                Nuestro equipo
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
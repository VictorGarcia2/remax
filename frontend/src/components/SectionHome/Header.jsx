import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSearchContext } from "../../context/SearchContext";

export default function Header({ setSelectedOptionsOperacion }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isVenderOpen, setIsVenderOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { valor } = useSearchContext();

  // Función para scroll suave a sección de desarrollos
  const scrollToDesarrollos = (e) => {
    e.preventDefault();
    setIsOpen(false);
    
    // Si no estamos en la página de inicio, navegar primero
    if (window.location.pathname !== '/' && window.location.pathname !== '/inicio') {
      window.location.href = '/#desarrollos-section';
      return;
    }
    
    // Scroll suave a la sección
    const elemento = document.getElementById('desarrollos-section');
    if (elemento) {
      elemento.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

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

  // Cerrar dropdown cuando se abre un modal o se cambia de página
  useEffect(() => {
    const handleRouteChange = () => {
      setIsVenderOpen(false);
      setIsOpen(false);
    };

    // Escuchar cambios de ruta
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Función para cerrar dropdowns cuando se abre un modal
  const closeDropdowns = () => {
    setIsVenderOpen(false);
    setIsOpen(false);
  };

  // Escuchar eventos de modal
  useEffect(() => {
    const handleModalOpen = () => {
      closeDropdowns();
    };

    // Escuchar eventos personalizados de modal
    document.addEventListener('modal:open', handleModalOpen);
    
    return () => {
      document.removeEventListener('modal:open', handleModalOpen);
    };
  }, []);
  return (
    <nav className="bg-white fixed w-full z-[9999] top-0 left-0 shadow-sm">
      <div className="w-full flex flex-wrap items-center justify-between h-16 md:h-20 px-2 sm:px-4 md:px-6 max-w-full">
        <Link
          to={"/inicio"}
          className="flex items-center space-x-3 rtl:space-x-reverse h-full min-w-0"
        >
          <img
            src="logos/New_RMX_Mark_R4_RGB_dark.png"
            className="h-10 md:h-14 max-w-[120px] w-auto object-contain"
            alt="REMAX Logo"
          />
        </Link>
        <div className="flex md:order-2 items-center h-full min-w-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className={`inline-flex items-center justify-center p-2 w-10 h-10 text-sm rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 flex-shrink-0 transition-colors duration-200 ${
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
          } items-center justify-between w-full md:flex md:w-auto md:order-1 transition-all duration-300 ease-in-out h-full`}
          id="navbar-sticky"
        >
          {/* Overlay para menú hamburguesa en móvil */}
          {isOpen && (
            <div className="fixed inset-0 z-[9997] flex items-start justify-center md:hidden bg-black/60 transition-opacity duration-300 animate-fadeIn" onClick={() => setIsOpen(false)}>
              <div className="w-[95vw] max-w-sm max-h-[80vh] min-h-fit bg-white rounded-2xl shadow-2xl flex flex-col items-center p-6 border border-gray-200 overflow-y-auto justify-center mt-4 relative animate-slideDown z-[9998]" onClick={e => e.stopPropagation()}>
                {/* Botón de cerrar (X) */}
                <button className="absolute top-3 right-3 text-3xl text-gray-500 hover:text-red-500 focus:outline-none" onClick={() => setIsOpen(false)} aria-label="Cerrar menú">
                  &times;
                </button>
                <ul className="flex flex-col w-full font-medium space-y-3 items-center justify-center">
                  <li className="py-2 w-full">
                    <Link
                      to="/"
                      className={`block py-4 px-3 rounded-md w-full text-center text-lg md:bg-transparent md:p-0 md:hover:text-current ${valor === "comercial" ? "text-red-700 md:text-red-700 md:hover:text-red-800" : "text-blue-700 md:text-blue-700 md:hover:text-blue-800"}`}
                      aria-current="page"
                      onClick={() => setIsOpen(false)}
                    >
                      Inicio
                    </Link>
                  </li>
                  <li className="py-2 w-full">
                    <Link
                      onClick={() => {
                        setSelectedOptionsOperacion([1]);
                        setIsOpen(false);
                      }}
                      to="/propiedades"
                      className={`block py-4 px-3 text-gray-700 rounded-md w-full text-center text-lg hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                    >
                      Comprar
                    </Link>
                  </li>
                  <li className="py-2 w-full">
                    <Link
                      to="/valuador"
                      className="block py-4 px-3 text-gray-700 rounded-md w-full text-center text-lg hover:bg-gray-100 md:hover:bg-transparent md:p-0"
                      onClick={() => setIsOpen(false)}
                    >
                      Valuar mi propiedad
                    </Link>
                  </li>
                  <li className="py-2 w-full">
                    <Link
                      to="/Polizas-de-renta"
                      className={`block py-4 px-3 text-gray-700 rounded-md w-full text-center text-lg hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Pólizas de renta
                    </Link>
                  </li>
                  <li className="py-2 w-full">
                    <Link
                      to="/NuestroEquipo"
                      className={`block py-4 px-3 text-gray-700 rounded-md w-full text-center text-lg hover:bg-gray-100 md:hover:bg-transparent md:p-0 ${valor === "comercial" ? "md:hover:text-red-700" : "md:hover:text-blue-700"}`}
                      onClick={() => setIsOpen(false)}
                    >
                      Nuestro equipo
                    </Link>
                  </li>
                  <li className="py-2 w-full">
                    <Link
                      to="/reclutamiento"
                      className="block py-4 px-3 text-gray-700 rounded-md w-full text-center text-lg hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0"
                      onClick={() => setIsOpen(false)}
                    >
                      Únete a nosotros
                    </Link>
                  </li>
                  <li className="py-2 w-full">
                    <button
                      onClick={scrollToDesarrollos}
                      className="py-4 px-3 rounded-md bg-[#db1c2e] text-white font-bold shadow-md border border-[#db1c2e] hover:bg-red-700 transition flex items-center gap-2 relative w-full justify-center text-lg"
                    >
                      Nuestros Desarrollos
                      <span className="ml-2 bg-white text-[#db1c2e] text-[12px] font-bold px-2 py-0.5 rounded-full shadow border border-[#db1c2e]">Nuevo</span>
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
          {/* Menú normal en desktop */}
          <ul className="hidden md:flex flex-row p-0 mt-0 font-medium md:space-x-6 lg:space-x-8 md:mt-0 md:border-0 md:bg-white h-full items-center min-w-0 flex-shrink-0">
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
            <li className="relative z-70 py-1 group" ref={dropdownRef}>
              <div className="flex items-center">
                <button
                  className="flex items-center w-full py-2 px-3 text-gray-700 rounded-md hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 md:w-auto transition-colors duration-200"
                  onMouseEnter={() => setIsVenderOpen(true)}
                  onMouseLeave={() => setTimeout(() => setIsVenderOpen(false), 100)}
                  onClick={() => setIsVenderOpen(!isVenderOpen)}
                >
                  Vender
                  <svg
                    className={`w-2.5 h-2.5 ml-2.5 transition-transform duration-200 ${isVenderOpen ? 'rotate-180' : ''}`}
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
                  isVenderOpen ? "block opacity-100" : "hidden opacity-0"
                } md:group-hover:block absolute z-50 bg-white divide-y divide-gray-100 rounded-lg shadow-lg w-44 md:w-48 mt-1 border border-gray-200 transition-all duration-200`}
                onMouseEnter={() => setIsVenderOpen(true)}
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
              <button
                onClick={scrollToDesarrollos}
                className=" py-2 px-3 rounded-md bg-[#db1c2e] text-white font-bold shadow-md border border-[#db1c2e] hover:bg-red-700 transition flex items-center gap-2 relative"
              >
                Nuestros Desarrollos
                <span className="ml-2 bg-white text-[#db1c2e] text-[10px] font-bold px-2 py-0.5 rounded-full shadow border border-[#db1c2e]">Nuevo</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
import { useState } from "react";
import { Link } from "react-router-dom";
export default function Header({ setSelectedOptionsOperacion }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <nav className="bg-white fixed w-full z-50 top-0 start-0">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          to={"/inicio"}
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <img
            src="logos/New_RMX_Mark_R4_RGB_dark.png"
            className="h-12 md:h-16"
            alt="Flowbite Logo"
          />
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="navbar-sticky"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
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
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium border border-gray-100 rounded-lg bg-gray-50 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-white ">
            <li>
              <Link
                to={"/"}
                className="block py-2 px-3 text-white bg-blueRemax rounded-sm md:bg-transparent md:text-blue-700 md:p-0 "
                aria-current="page"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                onClick={() => setSelectedOptionsOperacion([1])}
                to={"/propiedades"}
                className="block py-2 px-3 text-[#2e2c2c] rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0  "
              >
                Comprar
              </Link>
            </li>
            <li>
              <Link
                onClick={() => setSelectedOptionsOperacion([2])}
                to={"/propiedades"}
                className="block py-2 px-3 text-[#2e2c2c] rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 "
              >
                Vender
              </Link>
            </li>
            <li>
              <a
                href="#"
                className="block py-2 px-3 text-[#2e2c2c] rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 "
              >
                Tramita tu crédito
              </a>
            </li>
            <li>
              <Link
                to={"/Polizas-de-renta"}
                className="block py-2 px-3 text-[#2e2c2c]rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 "
              >
                Pólizas de renta
              </Link>
            </li>
            <li>
              <Link
                to={"/NuestroEquipo"}
                className="block py-2 px-3 text-[#2e2c2c] rounded-sm hover:bg-gray-100 md:hover:bg-transparent md:hover:text-blue-700 md:p-0 "
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

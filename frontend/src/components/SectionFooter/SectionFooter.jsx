import { Link } from "react-router-dom";
import { useSearchContext } from "../../context/SearchContext";
import { FaTiktok } from "react-icons/fa";

export default function SectionFooter() {
  const { valor } = useSearchContext();

  const linkClasses = `hover:underline ${valor === "comercial" ? "text-redRemax hover:text-red-700" : "text-blueRemax hover:text-blue-700"}`;

  return (
    <>
      <footer className="bg-blueRemax/10 text-[#2e2c2c]">
        <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
          <div className="md:flex md:justify-between">
            <div className="mb-6 md:mb-0">
              <img
                className="w-30"
                src="/logos/New_RMX_Mark_R4_RGB_dark.png"
                alt=""
              />
            </div>
            <div className="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
              <div>
                <h2 className="mb-6 text-sm font-semibold text-[#2e2c2c] uppercase ">
                  Empresa
                </h2>
                <ul className="text-[#2e2c2c]  font-medium">
                  <li className="mb-4">
                    <Link to={'/NuestroEquipo'} className={linkClasses}>
                      Nuestro Equipo
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link to={'/valuador'} className={linkClasses}>
                      Valuador de Propiedades
                    </Link>
                  </li>
                  <li className="mb-4">
                    <a 
                      href="https://blog.remaxcin.com/" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={linkClasses}
                    >
                      Blog
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="mb-6 text-sm font-semibold text-[#2e2c2c] uppercase ">
                  Legal
                </h2>
                <ul className=" font-medium">
                  <li className="mb-4">
                    <Link to={"/politica-de-privacidad"} className={linkClasses}>
                      Aviso de privacidad
                    </Link>
                  </li>
                  <li className="mb-4">
                    <Link to={"/codigo-de-etica"} className={linkClasses}>
                      Código de ética
                    </Link>
                  </li>
                  <li>
                    <Link to={"/terminos-y-condiciones"} className={linkClasses}>
                      Terminos & Condiciones
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <div className="sm:flex sm:items-center sm:justify-between">
            <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © 2025{" "}
              <a href="https://flowbite.com/" className="hover:underline">
                RE/MAX
              </a>
              .
            </span>
            <div className="flex mt-4 sm:justify-center gap-10 sm:mt-0">
              <a
                href="https://www.facebook.com/remaxcinveracruz/" 
                target="_blank"
                className="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 8 19"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="sr-only">Facebook page</span>
              </a>
              <a href="https://www.instagram.com/remaxcin.veracruz?igsh=bG96MG53a2V4eGp6" target="_blank">
                <img
                  className="w-5 h-5"
                  src="/HomePageContent/Instagram.svg"
                  alt="Instagram"
                />
              </a>
              <a href="https://www.tiktok.com/@remax.cin?_t=ZS-8xfVVLQz56d&_r=1" target="_blank" rel="noopener noreferrer">
                <FaTiktok className="w-5 h-5 text-gray-500 hover:text-gray-900 dark:hover:text-white" />
                <span className="sr-only">TikTok</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

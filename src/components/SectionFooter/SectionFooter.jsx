import React from "react";

export default function SectionFooter() {
  return (
    <>
      {/* <div className="px-5 font-display flex flex-col justify-center items-center text-center mb-5">
        <hr className="text-[#7b7b7b] w-80" />
        <ol className="text-[#7b7b7b] mt-3">
          <li>
            <a href="">Términos y condiciones</a>  
          </li>
          <li>
            <a href="">Aviso de privacidad</a>{" "}
          </li>
          <li>
            <a href="">Código de ética</a>{" "}
          </li>
        </ol>
        <div className="flex gap-3 mt-3">
          <a href="">
            <img src="HomePageContent/Facebook.svg" alt="" />
          </a>
          <a href="">
            <img src="HomePageContent/Instagram.svg" alt="" />
          </a>
        </div>
      </div> */}
      <footer class="bg-blueRemax/10 text-[#2e2c2c]">
        <div class="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
          <div class="md:flex md:justify-between">
            <div class="mb-6 md:mb-0">
              <img
                className="w-30"
                src="logos/New_RMX_Mark_R4_RGB_dark.png"
                alt=""
              />
            </div>
            <div class="grid grid-cols-2 gap-8 sm:gap-6 sm:grid-cols-3">
              <div>
                <h2 class="mb-6 text-sm font-semibold text-[#2e2c2c] uppercase ">
                  Empresa
                </h2>
                <ul class="text-[#2e2c2c]  font-medium">
                  <li class="mb-4">
                    <a href="https://flowbite.com/" class="hover:underline">
                      Nuestro Equipo
                    </a>
                  </li>
                </ul>
              </div>

              <div>
                <h2 class="mb-6 text-sm font-semibold text-[#2e2c2c] uppercase ">
                  Legal
                </h2>
                <ul class=" font-medium">
                  <li class="mb-4">
                    <a href="#" class="hover:underline">
                      Aviso de privacidad
                    </a>
                  </li>
                  <li class="mb-4">
                    <a href="#" class="hover:underline">
                      Código de ética
                    </a>
                  </li>
                  <li>
                    <a href="#" class="hover:underline">
                      Terminos &amp; Condiciones
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <hr class="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
          <div class="sm:flex sm:items-center sm:justify-between">
            <span class="text-sm text-gray-500 sm:text-center dark:text-gray-400">
              © 2025{" "}
              <a href="https://flowbite.com/" class="hover:underline">
                RE/MAX
              </a>
              .
            </span>
            <div class="flex mt-4 sm:justify-center gap-10 sm:mt-0">
              <a
                href="#"
                class="text-gray-500 hover:text-gray-900 dark:hover:text-white"
              >
                <svg
                  class="w-5 h-5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 8 19"
                >
                  <path
                    fill-rule="evenodd"
                    d="M6.135 3H8V0H6.135a4.147 4.147 0 0 0-4.142 4.142V6H0v3h2v9.938h3V9h2.021l.592-3H5V3.591A.6.6 0 0 1 5.592 3h.543Z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="sr-only">Facebook page</span>
              </a>
              <a href="">
                <img
                  className="w-5 h-5"
                  src="HomePageContent/Instagram.svg"
                  alt=""
                />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

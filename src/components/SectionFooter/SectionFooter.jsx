import React from "react";

export default function SectionFooter() {
  return (
    <div className="px-5 font-display flex flex-col justify-center items-center text-center mb-5">
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
          <img src="/public/HomePageContent/Facebook.svg" alt="" />
        </a>
        <a href="">
          <img src="/public/HomePageContent/Instagram.svg" alt="" />
        </a>
      </div>
    </div>
  );
}

import React from "react";

export default function SectionVariedad() {
  return (
    <div className="px-5 font-display flex flex-col py-8 justify-center items-center text-center">
      <p className="text-2xl mt-10 font-[800] text-[#7b7b7b]">
        Amplia Variedad de Inmuebles Residenciales
      </p>
      <div className="grid grid-cols-1 gap-6 mt-3">
        <div className="bg-black rounded relative flex flex-col justify-center items-center">
            <p className="absolute text-white z-50">Departamentos</p>
          <img
            className=" opacity-70 object-cover w-[356px] h-[140px] rounded"
            src="/public/HomePageContent/pexels-binyaminmellish-186077 1.jpg"
            alt=""
          />
        </div>
        <div className="bg-black rounded relative flex flex-col justify-center items-center">
            <p className="absolute text-white z-50">Departamentos</p>
          <img
            className=" opacity-70 object-cover w-[356px] h-[140px] rounded"
            src="/public/HomePageContent/pexels-binyaminmellish-186077 1.jpg"
            alt=""
          />
        </div>
        <div className="bg-black rounded relative flex flex-col justify-center items-center">
            <p className="absolute text-white z-50">Departamentos</p>
          <img
            className=" opacity-70 object-cover w-[356px] h-[140px] rounded"
            src="/public/HomePageContent/pexels-binyaminmellish-186077 1.jpg"
            alt=""
          />
        </div>
        <div className="bg-black rounded relative flex flex-col justify-center items-center">
            <p className="absolute text-white z-50">Departamentos</p>
          <img
            className=" opacity-70 object-cover w-[356px] h-[140px] rounded"
            src="/public/HomePageContent/pexels-binyaminmellish-186077 1.jpg"
            alt=""
          />
        </div>
      </div>
    </div>
  );
}

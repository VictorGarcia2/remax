import React, { useState } from "react";

export default function Header() {
const [openMenu, setOpenMenu] = useState(false)
const handle = (prop)=> {
  setOpenMenu(prop)
}

  return (
    <>



              
      <div className={` w-48 bg-white fixed transition-all duration-[900ms] ease-in-out  right-0 z-50 font-display text-[#7B7B7B] h-screen ${openMenu ? "translate-x-0 pointer-events-auto":" translate-x-full pointer-events-none"}`}>
        <div className="p-5 flex flex-col justify-end items-end">
          <div className="flex w-full justify-between">
            <p className="font-[600] text-[1.131rem]">Menu</p>
            <img 
            onClick={()=> setOpenMenu(false)}
              className="w-8"
              src="HomePageContent/close.svg"
              alt=""
            />
          </div>
          <br />
          <br />
          <ol className="flex flex-col items-end text-end font-[300] text-[1.131rem]">
            <li className="w-ful ">Consultoria gratis</li>
            <li>Nuestro equipo</li>
          </ol>
        </div>
      </div>
      <div className="flex m-5 justify-between">
        <div>
          <img
            className="w-32  "
            src="logos/New_RMX_Mark_R4_RGB_cream.png"
            alt=""
          />
        </div>
        <div>
          <img onClick={handle} src="HomePageContent/Menu.svg" alt="" />
        </div>
      </div>
    </>
  );
}

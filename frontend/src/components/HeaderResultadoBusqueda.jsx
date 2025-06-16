import React from "react";
import { Link } from "react-router-dom";
export default function HeaderResultadoBusqueda() {
  return (
    <div className="flex justify-center z-50 items-center xl:justify-center  w-full my-10 px-10">
      <Link to={"/inicio"}>
        <img
          loading="lazy"
          className="w-30 "
          src="logos/New_RMX_Mark_R4_RGB_dark.png"
          alt=""
        />
      </Link>
    </div>
  );
}

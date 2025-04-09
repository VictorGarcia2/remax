import React from "react";
import { Link } from "react-router";
export default function HeaderResultadoBusqueda() {
  return (
    <div className="flex  items-center xl:justify-center gap-120  w-full my-10 px-10">
      <Link to={"/"}>
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

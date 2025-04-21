import React from "react";
import { Link } from "react-router"; // Asegúrate que sea "react-router-dom"



// Button Component
const Button = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <button
      className={className}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

// Card Components
const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`rounded-lg  bg-card text-card-foreground  ${className}`}
    {...props}
  />
));
Card.displayName = "Card";

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={`p-6 pt-0 ${className}`}
    {...props}
  />
));
CardContent.displayName = "CardContent";

// Main App Component
const Eleccion = ({setValor}) => {
    const handle = (value) => {
      console.log(value.toLowerCase());
      setValor(value.toLowerCase());
    }
  const sectors = [
    { id: 1, name: "Comercial", color: "bg-[#db1c2e]", path: "/residencial" },
    { id: 2, name: "Residencial", color: "bg-[#003da4]", path: "/residencial" },
  ];

  return (
    <main className="flex justify-center items-center min-h-screen bg-white px-4">
      <Card className=" w-full max-w-md sm:max-w-xl">
        <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8 space-y-10 sm:space-y-12">
          <img
            className="w-[220px] sm:w-[290px] h-auto object-cover"
            alt="RE/MAX Logo"
            src="/logos/New_RMX_Mark_R4_RGB_dark.png"
          />

          <h1 className="text-center text-neutral-700 text-xl sm:text-2xl md:text-3xl font-light leading-snug">
            <span className="font-bold">Bienvenido:</span> Elige el sector que te interesa.
          </h1>

          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            {sectors.map((sector) => (
              <Link to={sector.path} key={sector.id} className="w-full sm:w-auto ">
                <Button
                  onClick={() => handle(sector.name)}
                  className={`${sector.color} w-full cursor-pointer text-white text-lg sm:text-xl md:text-2xl font-semibold py-3 px-6 rounded-lg shadow-[0px_4px_4px_#00000040]`}
                >
                  {sector.name}
                </Button>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
};

export default Eleccion;

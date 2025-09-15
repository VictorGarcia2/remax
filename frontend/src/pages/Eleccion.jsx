import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

// Button Component
const Button = React.forwardRef(({ className, ...props }, ref) => {
  return <button className={className} ref={ref} {...props} />;
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
  <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
));
CardContent.displayName = "CardContent";

// Main App Component
const Eleccion = ({ setValor }) => {
  const navigate = useNavigate();
  
  // Precargar el componente Residencial para mejorar el rendimiento
  useEffect(() => {
    // Importación dinámica para precargar el componente
    const preloadResidencial = async () => {
      await import("./Residencial");
    };
    preloadResidencial();
  }, []);
  
  const handleSelection = (value) => {
    // Establecer el valor inmediatamente
    setValor(value.toLowerCase());
    // Navegar programáticamente para mejor rendimiento
    navigate("/inicio");
  };
  
  const sectors = [
    { id: 1, name: "Comercial / Industrial", color: "bg-[#db1c2e]", valor: "comercial" },
    { id: 2, name: "Residencial", color: "bg-[#003da4]", valor: "residencial" },
  ];

  return (
    <>
      <Helmet>
        <title>REMAX CIN Veracruz - Inicio</title>
        <meta
          name="description"
          content="REMAX CIN Veracruz - Elige entre propiedades residenciales o comerciales/industriales. Tu hogar o negocio ideal te espera."
        />
        <link rel="canonical" href="https://remaxcin.com/" />
        <meta property="og:title" content="REMAX CIN Veracruz - Inicio" />
        <meta property="og:description" content="Elige entre propiedades residenciales o comerciales/industriales. Tu hogar o negocio ideal te espera." />
        <meta property="og:url" content="https://remaxcin.com/" />
        <meta property="og:type" content="website" />
      </Helmet>
      <main className="flex justify-center items-center min-h-screen bg-white px-4">
        <Card className=" w-full max-w-md sm:max-w-xl">
          <CardContent className="flex flex-col items-center justify-center p-6 sm:p-8 space-y-10 sm:space-y-12">
            <img
              className="w-[220px] sm:w-[290px] h-auto object-cover"
              alt="RE/MAX Logo"
              src="/logos/New_RMX_Mark_R4_RGB_dark.png"
            />

            <h1 className="text-center text-neutral-700 text-xl sm:text-2xl md:text-3xl font-light leading-snug">
              <span className="font-bold">Bienvenido:</span> Elige el sector que
              te interesa.
            </h1>

            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
              {sectors.map((sector) => (
                <Button
                  key={sector.id}
                  onClick={() => handleSelection(sector.valor)}
                  className={`${sector.color} w-full cursor-pointer text-white text-lg sm:text-xl md:text-2xl font-semibold py-3 px-6 rounded-lg shadow-[0px_4px_4px_#00000040]`}
                >
                  {sector.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
};

export default Eleccion;
import React from 'react';
import Header from './SectionHome/Header';
import SectionFooter from './SectionFooter/SectionFooter';

export default function CodigodeEtica() {
    return (
        <>
        <Header/>
        <div className="p-6  text-[#7b7b7b] max-w-6xl flex flex-col justify-center items-center mx-auto mb-5 font-sans leading-relaxed">
            <h1 className="text-2xl font-bold text-center mb-6">CÓDIGO DE ÉTICA REMAX CIN</h1>
            <h2 className="text-xl font-semibold text-center mb-4">RE/MAX CIN REAL ESTATE</h2>
            <p className="mb-4">
                En RE/MAX CIN, dirigidos por Verónica Olán García, Broker y Directora General, reconocemos
                que actuar con honestidad, responsabilidad y respeto son los pilares fundamentales para
                ofrecer servicios inmobiliarios de excelencia.
            </p>
            <p className="mb-4">
                Nos comprometemos a cumplir y promover los valores establecidos en el Código de Ética de
                RE/MAX MÉXICO, adaptándose a nuestra cultura interna y la comunidad en la que operamos.
            </p>

            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">1. Compromiso con nuestros clientes</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>Actuar siempre en el mejor interés de nuestros clientes, brindándoles asesoría profesional, honesta y basada en información verificada.</li>
                    <li>Proteger la confidencialidad de los datos personales y patrimoniales de nuestros clientes.</li>
                    <li>Ofrecer información clara sobre los inmuebles, contratos, servicios y condiciones de contratación.</li>
                    <li>Evitar cualquier conflicto de interés, actuando siempre con transparencia y rectitud.</li>
                    <li>Cumplir cabalmente con los servicios ofrecidos:</li>
                    <ul className="list-disc list-inside ml-6">
                        <li>Comercialización de inmuebles</li>
                        <li>Pólizas de arrendamiento (Póliza de Rentas)</li>
                        <li>Asesoría para créditos hipotecarios a través de brokers aliados.</li>
                    </ul>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">2. Compromiso con nuestros colegas y la industria inmobiliaria</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>Respetar a todos los profesionales del sector inmobiliario, reconociendo su trabajo y promoviendo relaciones de cooperación sana y ética.</li>
                    <li>Fomentar la colaboración entre oficinas RE/MAX y otros colegas del sector, siempre en beneficio del cliente final.</li>
                    <li>Evitar prácticas desleales como la captación indebida de clientes, publicaciones engañosas o competencia deshonesta.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">3. Compromiso con nuestra comunidad</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>Actuar de manera socialmente responsable, contribuyendo al bienestar de las comunidades en las que operamos.</li>
                    <li>Promover la equidad y el respeto a la diversidad cultural, de género y social.</li>
                    <li>Cumplir con todas las disposiciones legales aplicables en materia inmobiliaria, fiscal, civil y administrativa.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">4. Compromiso interno en RE/MAX CIN</h3>
                <ul className="list-disc list-inside space-y-2">
                    <li>Actuar bajo los principios de integridad, responsabilidad y mejora continua dentro de nuestra oficina.</li>
                    <li>Capacitar de forma constante a nuestros Asesores Inmobiliarios, para que brinden un servicio de la más alta calidad.</li>
                    <li>Cuidar la imagen institucional de RE/MAX CIN y de la marca RE/MAX, reflejando en todo momento los valores que representan nuestra organización.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">5. Procedimiento en caso de incumplimiento</h3>
                <p className="mb-4">
                    En caso de detectar conductas que contravengan este Código de Ética, cualquier persona podrá
                    presentar su queja o denuncia ante la Dirección General de RE/MAX CIN, quien actuará conforme a
                    la normativa interna, asegurando la debida investigación y resolución.
                </p>
            </section>

            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">6. Marco normativo</h3>
                <p className="mb-4">
                    Las acciones de RE/MAX CIN se enmarcan en la legislación mexicana vigente, incluyendo pero no
                    limitándose a:
                </p>
                <ul className="list-disc list-inside space-y-2">
                    <li>La Ley Federal de Protección al Consumidor,</li>
                    <li>La Ley Federal de Protección de Datos Personales en Posesión de los Particulares,</li>
                    <li>El Código Civil Federal y La LEY DE OPERACIONES INMOBILIARIAS PARA EL ESTADO DE VERACRUZ DE IGNACIO DE LA LLAVE.</li>
                </ul>
            </section>

            <section className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Declaratoria Final</h3>
                <p className="mb-4">
                    El Código de Ética de RE/MAX CIN guía nuestra conducta y es parte fundamental de nuestra
                    identidad, nos obliga a actuar cada día con profesionalismo, generando confianza en nuestros
                    clientes, colegas y nuestra comunidad. RE/MAX CIN se reserva el derecho de actualizar o modificar
                    este Código de Ética cuando existan cambios legislativos, regulatorios o internos. La versión vigente
                    estará siempre disponible en el sitio web oficial.
                </p>
                <p className="mb-4">
                    <strong>Domicilio:</strong> Boulevard Miguel Alemán número 933, 2do piso, Local 202, Edificio Levant Boca, Colonia
                    Playa de Oro, Boca del Río, Veracruz de Ignacio de la Llave, C.P. 94297
                </p>
                <p>
                    <strong>Contacto:</strong> [Teléfono / Correo de contacto de tu oficina]
                </p>
            </section>
        </div>
        <SectionFooter/>
        </>

    );
}

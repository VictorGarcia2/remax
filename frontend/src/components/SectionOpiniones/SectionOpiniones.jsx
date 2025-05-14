/* eslint-disable react/no-unknown-property */
import { useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore from "swiper";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

// Instalar módulos de Swiper
SwiperCore.use([Navigation]);
const Testimonials = () => {
  const swiperRef = useRef(null);
  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  const testimonials = [
    {
      "name": "Aida Leon",
      "role": "Customer",
      "text": "Excellent real estate service, they advised me throughout the entire process to find my ideal home🤗",
      "image": "https://lh3.googleusercontent.com/a/ACg8ocIaqoSh1PGLsGsdBayGHdy7pE3eQxIn7a7Oi5A9QpDszTvoPm4g=s128-c0x00000000-cc-rp-mo",
      "rating": 5
    },
    {
      "name": "Andres Guerra",
      "role": "Customer",
      "text": "Excellent service and advice, I found the ideal house with them!",
      "image": "https://lh3.googleusercontent.com/a-/ALV-UjXsZrUje1NR6uaS4pu_dh7QKwukGtNDT2zM-DWVJyOd8ZSRVqCA=s128-c0x00000000-cc-rp-mo",
      "rating": 5
    },
    {
      "name": "Jocelyn Lozada",
      "role": "Customer",
      "text": "Excellent service 👍",
      "image": "https://lh3.googleusercontent.com/a-/ALV-UjWnk3wxmgcBBxLlLj4rXsIYPL5ModCTER1zu1qhbgQuGGPbUSEBAQ=s128-c0x00000000-cc-rp-mo-ba2",
      "rating": 5
    },
    {
      "name": "Arturo León Varela",
      "role": "Customer",
      "text": "Excellent service",
      "image": "https://lh3.googleusercontent.com/a-/ALV-UjXT-G4s06TBx32OiyrHCwTJd-VVrhk6WDxUWUVTXpKv5v6THGh5HA=s128-c0x00000000-cc-rp-mo",
      "rating": 5
    },
    {
      "name": "Itzel Hernandez",
      "role": "Customer",
      "text": "Excellent service",
      "image": "https://lh3.googleusercontent.com/a/ACg8ocL8rFffJX6oma66sek7ae2-rx3FZo847Efi3I7vLZx10QVnNA=s128-c0x00000000-cc-rp-mo",
      "rating": 5
    }
  ]
  

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.params.navigation.prevEl = prevButtonRef.current;
      swiperRef.current.swiper.params.navigation.nextEl = nextButtonRef.current;
      swiperRef.current.swiper.navigation.init();
      swiperRef.current.swiper.navigation.update();
    }
  }, []);

  const StarIcon = () => (
    <svg
      className="w-5 h-5"
      viewBox="0 0 18 17"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.10326 1.31699C8.47008 0.57374 9.52992 0.57374 9.89674 1.31699L11.7063 4.98347C11.8519 5.27862 12.1335 5.48319 12.4592 5.53051L16.5054 6.11846C17.3256 6.23765 17.6531 7.24562 17.0596 7.82416L14.1318 10.6781C13.8961 10.9079 13.7885 11.2389 13.8442 11.5632L14.5353 15.5931C14.6754 16.41 13.818 17.033 13.0844 16.6473L9.46534 14.7446C9.17402 14.5915 8.82598 14.5915 8.53466 14.7446L4.91562 16.6473C4.18199 17.033 3.32456 16.41 3.46467 15.5931L4.15585 11.5632C4.21148 11.2389 4.10393 10.9079 3.86825 10.6781L0.940384 7.82416C0.346867 7.24562 0.674378 6.23765 1.4946 6.11846L5.54081 5.53051C5.86652 5.48319 6.14808 5.27862 6.29374 4.98347L8.10326 1.31699Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-14 flex flex-col justify-center items-center sm:flex-row sm:items-center sm:justify-between max-sm:gap-8">
          <h2 className="text-4xl text-center font-bold text-[#2e2c2c] lg:text-left">
          Opiniones Verificadas en Google
                    </h2>
          <div className="flex items-center gap-20">
            <button
              ref={prevButtonRef}
              className="swiper-button-prev group flex justify-center items-center border border-solid border-blueRemax w-50 h-50 transition-all duration-500 rounded-full hover:bg-blueRemax/50"
            >
              <svg
                className="h-6 w-6 text-blueRemax group-hover:text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.9999 12L4.99992 12M9.99992 6L4.70703 11.2929C4.3737 11.6262 4.20703 11.7929 4.20703 12C4.20703 12.2071 4.3737 12.3738 4.70703 12.7071L9.99992 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              ref={nextButtonRef}
              className="swiper-button-next group flex justify-center items-center border border-solid border-blueRemax w-12 h-12 transition-all duration-500 rounded-full hover:bg-blueRemax"
            >
              <svg
                className="h-6 w-6 text-blueRemax group-hover:text-white"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 12L19 12M14 18L19.2929 12.7071C19.6262 12.3738 19.7929 12.2071 19.7929 12C19.7929 11.7929 19.6262 11.6262 19.2929 11.2929L14 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <Swiper
          ref={swiperRef}
          spaceBetween={28}
          slidesPerView={3}
          centeredSlides={true}
          loop={true}
          navigation={{
            prevEl: prevButtonRef.current,
            nextEl: nextButtonRef.current,
          }}
          breakpoints={{
            0: {
              slidesPerView: 1,
              spaceBetween: 20,
              centeredSlides: false,
            },
            768: {
              slidesPerView: 2,
              spaceBetween: 28,
              centeredSlides: true,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 32,
            },
          }}
          className="mySwiper"
        >
          {testimonials.map((testimonial, index) => (
            <SwiperSlide key={index}>
              <div className="group bg-white border border-solid h-auto border-gray-300 rounded-2xl p-6 transition-all duration-500 w-full hover:border-indigo-600 swiper-slide-active:border-indigo-600">
                <div className="flex items-center mb-9 gap-2 text-amber-500 transition-all duration-500 group-hover:text-indigo-600 swiper-slide-active:text-indigo-600">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <StarIcon key={i} />
                  ))}
                </div>
                <p className="text-lg text-gray-500 leading-8 h-24 transition-all duration-500 mb-9 group-hover:text-gray-800">
                  {testimonial.text}
                </p>
                <div className="flex items-center gap-5">
                  <img
                    className="rounded-full object-cover w-14 h-14"
                    src={testimonial.image}
                    alt={testimonial.name}
                    loading="lazy"
                  />
                  <div className="grid gap-1">
                    <h5 className="text-gray-900 font-medium transition-all duration-500 group-hover:text-indigo-600 swiper-slide-active:text-indigo-600">
                      {testimonial.name}
                    </h5>
                    <span className="text-sm leading-6 text-gray-500">
                      {testimonial.role}
                    </span>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <style jsx global>{`
        .swiper-button-prev:after,
        .swiper-rtl .swiper-button-next:after {
          content: "" !important;
        }

        .swiper-button-next:after,
        .swiper-rtl .swiper-button-prev:after {
          content: "" !important;
        }

        .swiper-button-next svg,
        .swiper-button-prev svg {
          width: 24px !important;
          height: 24px !important;
        }

        .swiper-button-next,
        .swiper-button-prev {
          position: relative !important;
        }

        .swiper-slide.swiper-slide-active {
          --tw-border-opacity: 1 !important;
          border-color: rgb(79 70 229 / var(--tw-border-opacity)) !important;
        }

        .swiper-slide.swiper-slide-active
          > .swiper-slide-active\\:text-indigo-600 {
          --tw-text-opacity: 1;
          color: rgb(79 70 229 / var(--tw-text-opacity));
        }

        .swiper-slide.swiper-slide-active
          > .flex
          .grid
          .swiper-slide-active\\:text-indigo-600 {
          --tw-text-opacity: 1;
          color: rgb(79 70 229 / var(--tw-text-opacity));
        }
      `}</style>
    </section>
  );
};

export default Testimonials;

import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/swiper-bundle.css';

const Slider = ({ images, defaultImageUrl, children }) => {
  const verQpasa = () => {
    console.log(images)
  }
  return (
    <Swiper
      spaceBetween={50}
      slidesPerView={1}
      navigation
    >
      {images.length > 0 ? (
        images.map((image, index) => (
          <SwiperSlide key={index}>
            <img src={image} alt={`Slide ${index}`} onChange={verQpasa} />
          </SwiperSlide>
        ))
      ) : (
        <SwiperSlide>
          <img src={defaultImageUrl} alt="Default Image" />
        </SwiperSlide>
      )}
      {children}
      
    </Swiper>
  );
};

export default Slider;

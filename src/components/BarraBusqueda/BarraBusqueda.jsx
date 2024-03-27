import React, { useState } from "react";
import {
  IonSearchbar,
} from "@ionic/react";
import "./BarraBusqueda.scss";

const BarraBusqueda = ({onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch(term);
  };

  return (
    <>
      <IonSearchbar 
      placeholder="Buscar"
      value={searchTerm}
      onIonInput={handleSearchChange}
      id="searchbar"
      >
      </IonSearchbar>
    </>
  );
};

export default BarraBusqueda;

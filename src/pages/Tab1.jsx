import {
  IonContent,
  IonPage,
  IonRow,
  IonCol,
  IonImg,
  IonGrid,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonInput,
} from "@ionic/react";
import React, { useEffect, useState } from "react";
import firestore from "../firebaseConfig";
import { useHistory } from "react-router-dom";
import { useMaskito } from "@maskito/react";
import Alert from "../components/Alert/Alert";
import "./Tab1.scss";

const Inicio = () => {
  const history = useHistory();
  const [patente, setPatente] = useState("");

  // UseState De mensaje alerta
  const [showAlert, setShowAlert] = useState(false);

  const patenteMask = useMaskito({
    options: {
      mask: [/\w/, /\w/, "-", /\w/, /\w/, "-", /\d/, /\d/],
    },
  });

  const handlePatenteChange = (e) => {
    setPatente(e.target.value.toUpperCase());
  };

  const handleIraAlertar = () => {
    if (patente.length !== 8) {
      console.log("Debes llenar el campo de patente requerido!!");
      setShowAlert(true);
    } else {
      history.push(`/alertar?patente=${patente}`);
      setPatente("")
    }
  };

  const handleIraMapa = () => {
    history.push(`/Mapa-delitos`);
    setPatente("")
  }

  const handleIraAmigos = () => {
    history.push(`/Amigos`);
    setPatente("")
  }

  return (
    <IonPage id="page-inicio">
      <IonContent fullscreen>
        <div className="bg-header"></div>
        <Alert
          titulo="Realizar  una alerta"
          mensaje="Ingresa tu placa patente antes de ir a realizar una alerta"
          boton="Aceptar"
          showAlert={showAlert}
          setShowAlert={setShowAlert}
        />
        <IonGrid>
          <IonImg
            src="images/slide_inicio.jpg"
            alt="The Wisconsin State Capitol building in Madison, WI at night"
          ></IonImg>
          <p className="sub-title">En que te podemos ayudar</p>
          <IonRow>
            <IonCol size="6">
              <div className="btn-inicio" onClick={handleIraMapa}>
              <img src="images/ico-monitor.png" alt="" />
                <IonRow className="ion-align-items-center">
                  <p>Mapa de delitos</p>
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </IonRow>
              </div>
            </IonCol>
            <IonCol size="6">
              <div className="btn-inicio btn-monitor" onClick={handleIraAmigos}>
              <img src="images/viaje_seguro_ico.png" alt="" />
                <IonRow className="ion-align-items-center">
                  <p>Gestion de amigos</p>
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </IonRow>
              </div>
            </IonCol>
          </IonRow>
          <div className="section-alert">
            <span className="ico-alertar">
              <img src="images/ico-alertar.png" alt="" />
            </span>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Realiza una alerta</IonCardTitle>
                <IonCardSubtitle>
                  Ingresa la placa patente del vehículo
                </IonCardSubtitle>
              </IonCardHeader>
              <IonCardContent>
                <IonInput
                  className="ion-text-center"
                  ref={async (cardRef) => {
                    if (cardRef) {
                      const input = await cardRef.getInputElement();
                      patenteMask(input);
                    }
                  }}
                  placeholder="LL-LL-NN"
                  value={patente}
                  onIonInput={handlePatenteChange}
                ></IonInput>
              </IonCardContent>
              <IonButton className="btn-alertar" onClick={handleIraAlertar}>
                Haz tu alerta
              </IonButton>
            </IonCard>
          </div>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Inicio;

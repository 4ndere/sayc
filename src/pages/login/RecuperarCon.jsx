import {
  IonContent,
  IonPage,
  IonButton,
  IonInput,
  IonItem,
  IonCol,
  IonGrid,
  IonRow,
  IonIcon,
  IonText,
  IonImg,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { chevronBack } from "ionicons/icons";
import "./RecuperarCon.scss";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { useState } from 'react';

const RecuperarCon = () => {
  const auth = getAuth();
  const history = useHistory();
  const [email, setEmail] = useState("");

  const handleIrAInicio = () => {
    history.push('/login');
  };

  const handlePasswordReset = () => {
    sendPasswordResetEmail(auth, email)
      .then(() => {
        console.log("El correo de recuperación de contraseña se ha enviado con éxito")
        history.push('/revisa-tu-correo');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error al enviar el correo de recuperación de contraseña:", errorCode, errorMessage);
      });
  };

  return (
    <IonPage id="recuperarCon">
      <IonContent fullscreen>
        <IonRow onClick={handleIrAInicio} class="content-icon-back">
          <IonIcon md={chevronBack}></IonIcon>
          <IonText>
            <p>Volver</p>
          </IonText>
        </IonRow>
        <IonImg
          src="images/fondo_registro.png"
          alt="The Wisconsin State Capitol building in Madison, WI at night"
        ></IonImg>
        <Ion-avatar>
          <ion-text>
            <h1>Recupera tu contraseña</h1>
          </ion-text>
        </Ion-avatar>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            <IonCol>
              <IonItem>
                <IonInput
                  label="Ingresa tu correo electrónico"
                  labelPlacement="stacked"
                  placeholder="Ingrese aquí su correo"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value)}
                ></IonInput>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-end">
            <IonText class="sayc-text">
              <p>SAYC - Seguridad Automotriz y Conductores</p>
            </IonText>
          </IonRow>
          <IonCol>
            <IonRow class="ion-justify-content-center">
              <IonButton fill="solid" onClick={handlePasswordReset}>
                Envía un correo de recuperación
              </IonButton>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonText class="inicia-sesion" onClick={handleIrAInicio}>
                <p>
                  ¿Ya tienes una cuenta en SAYC? -
                  <strong> Inicia sesión aquí</strong>
                </p>
              </IonText>
            </IonRow>
          </IonCol>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default RecuperarCon;

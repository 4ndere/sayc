import {
  IonContent,
  IonPage,
  IonButton,
  IonCol,
  IonGrid,
  IonRow,
  IonIcon,
  IonText,
  IonImg,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { chevronBack } from "ionicons/icons";
import "./RevisaCorreo.scss";

const RevisaCorreo = () => {
  const history = useHistory();

  const handleIrAInicio = () => {
    history.push('/login');
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
            <h1>Revisa tu correo</h1>
          </ion-text>
        </Ion-avatar>
        <IonGrid className="rc-txt">
          <IonRow className="ion-justify-content-center">
            <IonCol>
              <IonText>
                <p>
                  Te acabamos de enviar un e-mail con las instrucciones
                  necesarias para recuperar tu contraseña. Una vez hayas
                  finalizado vuelve con nosotros e intenta iniciar sesión
                  nuevamente.
                </p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid>
          <IonRow class="ion-justify-content-end">
            <IonText class="sayc-text">
              <p>SAYC - Seguridad Automotriz y Conductores</p>
            </IonText>
          </IonRow>
          <IonCol>
            <IonRow class="ion-justify-content-center">
              <IonButton fill="solid" onClick={handleIrAInicio}>
                Volver al inicio
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

export default RevisaCorreo;

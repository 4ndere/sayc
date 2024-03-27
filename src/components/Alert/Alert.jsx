import React from 'react';
import { IonAlert } from '@ionic/react';

function Alert({ titulo, mensaje, boton, showAlert, setShowAlert }) {

  //const showAlert = false;

  return (
    <IonAlert
      isOpen={showAlert}
      header={`${titulo}`}
      message={`${mensaje}`}
      buttons={[`${boton}`]}
      onDidDismiss={() => setShowAlert(false)}
    />
  );
}

export default Alert;
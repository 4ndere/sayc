import React from 'react';
import { IonButton, IonLoading } from '@ionic/react';
function Loading({mensaje, duracion, showLoading}) {
  return (
    <>
      <IonLoading 
      isOpen={showLoading}
      message={`${mensaje}`}
      duration={duracion} 
      />
    </>
  );
}
export default Loading;
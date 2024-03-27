import React, { useEffect, useRef, useState } from "react";
import { IonRouterLink, IonTextarea } from "@ionic/react";
import {
  IonButtons,
  IonButton,
  IonModal,
  IonCard,
  IonRow,
  IonCol,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonContent,
  IonToolbar,
  IonGrid,
  IonCardSubtitle,
  IonImg,
  IonItem,
  IonLabel,
} from "@ionic/react";
import { format, isValid } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import "./Card.scss";
import { reverseGeocode } from "../../services/geocodingUtils";

function Card({
  imagen,
  marca,
  fecha,
  patente,
  color,
  modalDenunciante,
  modalDireccionLat,
  modalDireccionLong,
  ciudad,
  region,
  modalDescripcion,
  modelo,
  alertaId,
  userId,
  selectedSegment,
  onActionButtonClick,
  handleAlertButton,
  handleAlertInputChange,
  onActionEncontrado,
}) {
  const modal = useRef();

  function dismiss() {
    modal.current.dismiss();
  }
  const cardId = uuidv4();
  const modalId = uuidv4();
  const buttonId = uuidv4();

  const handleActionButtonClick = async () => {
    await onActionButtonClick(alertaId, userId);
    dismiss();
  };

  const handleActionButtonClickEncontré = async () => {
    await handleAlertButton(userId, marca, modelo);
    console.log(marca, modelo)
    dismiss();
  };

  const handleMarcarEncontrado = async () => {
    await onActionEncontrado(alertaId);
    dismiss();
  }
  const handleDidPresent = () => {
    console.log("Modal se ha presentado completamente");
    // Puedes realizar acciones adicionales después de que el modal se haya presentado
  };

  return (
    <>
      <div id="card-component">
        <a id={modalId} expand="block">
          <IonCard id={cardId}>
            <IonRow>
              <IonCol size="5">
                <IonImg src={`${imagen}`} alt="SAYC"></IonImg>
              </IonCol>
              <IonCol size="7">
                <IonCardHeader>
                  <IonCardTitle>
                    {marca} {modelo}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <p>
                    Publicado:{" "}
                    <strong>{format(fecha || new Date(), "MM/dd/yyyy")}</strong>
                  </p>
                  <p>
                    Patente: <strong>{patente}</strong>
                  </p>
                  <p>
                    Color: <strong>{color}</strong>
                  </p>
                </IonCardContent>
              </IonCol>
            </IonRow>
          </IonCard>
          <span>+</span>
        </a>
      </div>
      <IonModal
        id="example-modal"
        ref={modal}
        trigger={modalId}
        // onIonModalDidPresent={handleDidPresent}
      >
        <IonContent>
          <IonToolbar>
            <IonButtons slot="end">
              <IonButton color="light" onClick={() => dismiss()}>
                <span>x</span>
              </IonButton>
            </IonButtons>
          </IonToolbar>
          <IonCard>
            <IonImg src={`${imagen}`} alt="Auto robado"></IonImg>
            <IonCardHeader>
              <IonGrid>
                <IonRow class="ion-justify-content-between">
                  <IonCol size="6">
                    <IonCardTitle>
                      {marca} {modelo}
                    </IonCardTitle>
                  </IonCol>
                  <IonCol size="6">
                    <IonCardSubtitle class="ion-text-end art-patente">
                      <div className="patente">{patente}</div>
                    </IonCardSubtitle>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardHeader>
            <IonCardContent>
              <p>
                Publicado:{" "}
                <strong>
                  {format(fecha || new Date(), "MM/dd/yyyy")}
                </strong>
              </p>
              <p>
                Color: <strong>{color}</strong>
              </p>
              <p>
                Denunciante: <strong>{modalDenunciante}</strong>
              </p>
              <p>
                Dirección:{" "}
                <strong>
                  {ciudad}, {region}
                </strong>
              </p>
              <IonRow class="ion-justify-content-between">
                <IonCol size="6">
                  <IonRouterLink
                    className="btn-ghost"
                    href={`https://www.google.com/maps/search/?api=1&query=${modalDireccionLat},${modalDireccionLong}`}
                    target="_blank"
                  >
                    <IonButton className="btn-ghost">Ver mapa</IonButton>
                  </IonRouterLink>
                </IonCol>
                <IonCol size="6">
                  <IonButton className="btn-ghost ml-auto">Comentar</IonButton>
                </IonCol>
              </IonRow>
              <hr />
              <IonCardTitle>
                <strong>Descripción</strong>
                <p>{modalDescripcion}</p>
              </IonCardTitle>
            </IonCardContent>
          </IonCard>
          {selectedSegment === "second" && (
            <>
              <IonButton onClick={handleActionButtonClick}>Eliminar</IonButton>
              <IonButton onClick={handleMarcarEncontrado}>Marcar como encontrado</IonButton>
            </>
          )}
          {selectedSegment === "first" && (
            <>
              <IonItem>
                <IonTextarea placeholder="Si haz visto este vehículo notificale al usuario" onIonInput={handleAlertInputChange}>
                </IonTextarea>
              </IonItem>
              <IonButton className="btn-loencontre" onClick={handleActionButtonClickEncontré}>
                Lo encontré
              </IonButton>
            </>
          )}
        </IonContent>
      </IonModal>
    </>
  );
}

export default Card;

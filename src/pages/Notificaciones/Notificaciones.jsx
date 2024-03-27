import React, { useState, useEffect } from "react";
import "./Notificaciones.scss";
import {
  IonItem,
  IonLabel,
  IonContent,
  IonPage,
  IonList,
  IonListHeader,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { checkmarkOutline, closeOutline, chatbubblesOutline } from "ionicons/icons";
import "firebase/compat/firestore";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  where,
  getDoc,
  doc,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const Notificaciones = () => {
  const [notificacionesData, setNotificacionesData] = useState([]);
  const [solicitudesAmigos, setSolicitudesAmigos] = useState([]);

  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user.uid;
  const uemail = user.email;

  const fetchNotificaciones = async () => {
    try {
      const notiDocRef = doc(collection(db, "notificaciones"), uid);
      const usuarioDocSnapshot = await getDoc(notiDocRef);


      if (usuarioDocSnapshot.exists()) {
        const notificaciones = usuarioDocSnapshot.data().notificaciones || [];
        console.log("Notificaciones del usuario:", notificaciones);
        setNotificacionesData(notificaciones)
      } else {
        console.log("El usuario no tiene notificaciones.");
        return [];
      }
    } catch (error) {
      console.error("Error al obtener las notificaciones:", error);
      console.log(usuarioDocSnapshot)
      return [];
    }
  };



  const fetchSolicitudesAmistad = async () => {
    try {
      const solicitudesDocRef = doc(collection(db, "amigos"), uid);
      const solicitudesDocSnapshot = await getDoc(solicitudesDocRef);
  
      if (solicitudesDocSnapshot.exists()) {
        const solicitudes = solicitudesDocSnapshot.data().notificaciones || [];
        setSolicitudesAmigos(solicitudes);
      } else {
        console.log("El usuario no tiene notificaciones.");
        return [];
      }
    } catch (error) {
      console.error("Error al obtener las notificaciones:", error);
      return [];
    }
  };



  const handleAccept = async (amigoEmail, amigoId) => {
    const usuarioDocRef = doc(collection(db, "amigos"), uid);
    const usuarioSnapshot = await getDoc(usuarioDocRef);

    const usuarioAmigoDocRef = doc(collection(db, "amigos"), amigoId);
    const usuarioAmigoSnapshot = await getDoc(usuarioAmigoDocRef);

    if (usuarioSnapshot.exists() && usuarioAmigoSnapshot.exists()) {
      const amigosActuales = usuarioSnapshot.data().amigos || [];
      amigosActuales.push(amigoEmail);
      await updateDoc(usuarioDocRef, {
        amigos: amigosActuales,
      });
      console.log("Usuario agregado correctamente tu coleccion de amigos");

      const amigosActualesAmigoId = usuarioAmigoSnapshot.data().amigos || [];
      amigosActualesAmigoId.push(uemail);
      await updateDoc(usuarioAmigoDocRef, {
        amigos: amigosActualesAmigoId,
      });
      console.log("Usuario agregado correctamente a la colección del otro usuario");
      fetchSolicitudesAmistad();
      fetchNotificaciones(user);
    }
  };

  const handleReject = () => {

  };

  const handleRefresh = (e) => {
    fetchSolicitudesAmistad();
    fetchNotificaciones(user);
    e.detail.complete();
  };

  useEffect(() => {
    fetchSolicitudesAmistad();
    fetchNotificaciones();
  }, []);

  return (
    <IonPage id="page-notificaciones">
      <IonContent>
        <IonList>
          <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>
          <IonListHeader>
            <IonLabel>Notificaciones recientes</IonLabel>
          </IonListHeader>
          {notificacionesData.map((notificacion, index) => (
            <IonItem key={index}>
              <IonLabel>
                <h3>
                  <span className="bold-text">({notificacion.remitente})</span> te escribió:
                </h3>
                <p>{notificacion.mensaje}</p>
              </IonLabel>
              <IonButton
                slot="end"
                size="small"
                className="btn-ghost"
                onClick={() => {
                  const mensaje = 'Hola vengo desde la App SAYC, ¿Tienes datos acerca de donde se encuentra mi vehículo?';
                  const mensajeCodificado = `https://wa.me/${notificacion.telefono}?text=${mensaje}`;
                  window.open(mensajeCodificado, '_blank');
                }}
              >
                <IonIcon slot="icon-only" icon={chatbubblesOutline}></IonIcon>&nbsp; Chatear
              </IonButton>
            </IonItem>
          ))}

          {solicitudesAmigos.map((notificacion, index) => (
            <IonItem key={index}>
              <IonLabel>
                <h3>{notificacion.mensaje}</h3>
              </IonLabel>
              <IonButton
                slot="end"
                size="small"
                className="btn-notificaciones"
                onClick={() => {
                  handleAccept(notificacion.remitenteEmail, notificacion.remitenteId);
                }}
              >
                <IonIcon slot="icon-only" icon={closeOutline}></IonIcon>
              </IonButton>
              <IonButton slot="end" size="small" className="btn-notificaciones">
                <IonIcon slot="icon-only" icon={checkmarkOutline}></IonIcon>
              </IonButton>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Notificaciones;

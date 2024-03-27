import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonListHeader,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonFab,
  IonFabButton,
  IonRow,
  IonIcon,
  IonModal,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import { personAdd } from "ionicons/icons";
import BarraBusqueda from "../components/BarraBusqueda/BarraBusqueda";
import "firebase/compat/firestore";
import {
  getFirestore,
  query,
  getDocs,
  collection,
  doc,
  updateDoc,
  deleteField,
  getDoc,
  arrayUnion,
  where,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Alert from "../components/Alert/Alert";
import Loading from "../components/Loading/Loading";
import "./Tab4.scss";

function Tab4() {
  const [amigosData, setAmigosData] = useState([]);
  const [amigosFiltrados, setAmigosFiltrados] = useState([]);
  const [misAmigosData, setMisAmigosData] = useState([]);

  // UseState De mensaje alerta
  const [tituloAlerta, setTituloAlerta] = useState("");
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  //LOADING
  const [showLoading, setshowLoading] = useState(false);

  const modal = null;

  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user.uid;
  const uemail = user.email;

  async function fetchAmigosData() {
    const q = query(collection(db, "amigos"));
    const querySnapshot = await getDocs(q);

    const amigosArray = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email) {
        amigosArray.push({ id: doc.id, email: data.email });
      }
    });
    setAmigosData(amigosArray);
  }

  async function fetchMisAmigosData() {
    const q = query(collection(db, "amigos"), where("id", "==", uid));
    const querySnapshot = await getDocs(q);

    const misAmigosArray = [];
    querySnapshot.forEach((doc) => {
      const amigos = doc.data().amigos || [];
      amigos.forEach((amigo) => {
        misAmigosArray.push({ email: amigo });
      });
    });
    setMisAmigosData(misAmigosArray);

  }

  const handleSearch = (searchTerm) => {
    setshowLoading(true)
    const filtrado = amigosData.filter((amigo) =>
      amigo.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAmigosFiltrados(filtrado);
    setshowLoading(false)
  };

  const handleNotificarUsuario = async (amigoEmail, amigoId) => {
    setshowLoading(true)
    //Referencia a la coleccion del usuario actual
    const usuarioDocRef = doc(collection(db, "amigos"), amigoId);
    const usuarioSnapshot = await getDoc(usuarioDocRef);

    const nuevaSolicitud = {
      remitenteId: uid,
      remitenteEmail: uemail,
      mensaje: uemail + " " + "te ha enviado una solicitud",
    };
    if (usuarioSnapshot.exists()) {
      const notificacionesActuales =
        usuarioSnapshot.data().notificaciones || [];
      notificacionesActuales.push(nuevaSolicitud);
      await updateDoc(usuarioDocRef, {
        notificaciones: arrayUnion(nuevaSolicitud),
      });
      setTituloAlerta("Realizar alerta")
      setMensajeAlerta("Alerta enviada con éxito.")
      setShowAlert(true)
      setshowLoading(false)

    }
    fetchData();
  };

  async function handleDeleteAmigo(amigoEmail) {
    const q = query(
      collection(db, "amigos"),
      where("amigos", "array-contains", amigoEmail)
    );

    const querySnapshot = await getDocs(q);

    // Iterar sobre los resultados
    querySnapshot.forEach(async (d) => {
      const amigoRef = doc(db, "amigos", d.id);

      // Actualizar el documento eliminando el campo del array
      await updateDoc(amigoRef, {
        amigos: deleteField(),
      });
    });
  }

  async function fetchData() {
    await fetchAmigosData();
    await fetchMisAmigosData();
  }

  useEffect(() => {
    setshowLoading(true)
    fetchData();
    setshowLoading(false)
  }, []);

  const handleRefresh = (e) => {
    setshowLoading(true)
    fetchData();
    e.detail.complete();
    setshowLoading(false)
  };

  return (
    <IonPage id="page-amigos">
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <Alert
          titulo={tituloAlerta}
          mensaje={mensajeAlerta}
          boton="Aceptar"
          showAlert={showAlert}
          setShowAlert={setShowAlert} />
        <Loading showLoading={showLoading} mensaje="Cargando"></Loading>
        <IonList>
          <IonListHeader>
            <IonLabel>Tus amigos</IonLabel>
          </IonListHeader>
          {misAmigosData.map((amigo, index) => (
            <IonItemSliding key={index}>
              <IonItem>
                <IonLabel>{amigo.email}</IonLabel>
              </IonItem>
              <IonItemOptions>
                <IonItemOption
                  color="danger"
                  onClick={() => handleDeleteAmigo(amigo.email)}>
                  Eliminar amigo
                </IonItemOption>
              </IonItemOptions>
            </IonItemSliding>
          ))}
        </IonList>
        <IonFab slot="fixed" vertical="bottom" horizontal="end">
          <IonFabButton id="open-modal">
            <IonRow>
              <IonIcon icon={personAdd}></IonIcon>
            </IonRow>
          </IonFabButton>
        </IonFab>

        <IonModal
          ref={modal}
          trigger="open-modal"
          initialBreakpoint={0.75}
          breakpoints={[0, 0.25, 0.5, 0.75]}
        >
          <IonContent className="ion-padding">
            <BarraBusqueda onSearch={handleSearch}></BarraBusqueda>
            <IonList style={{ background: "none" }}>
              <IonListHeader>
                <IonLabel>Usuarios disponibles</IonLabel>
              </IonListHeader>
              {amigosFiltrados.map((amigo) => (
                <IonItemSliding key={amigo.id}>
                  <IonItem>
                    <IonLabel>{amigo.email}</IonLabel>
                  </IonItem>
                  <IonItemOptions>
                    <IonItemOption
                      color="success"
                      onClick={() =>
                        handleNotificarUsuario(amigo.email, amigo.id)
                      }
                    >
                      Añadir amigo
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))}
            </IonList>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
}
export default Tab4;

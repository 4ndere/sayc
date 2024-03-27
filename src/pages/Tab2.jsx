import {
  IonButtons,
  IonButton,
  IonContent,
  IonPage,
  IonGrid,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonIcon,
  IonToolbar,
  IonItem,
  IonModal,
  IonInput,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonRow,
  IonCol,
} from "@ionic/react";
import React, { useState, useEffect, useRef } from "react";
import { optionsOutline } from "ionicons/icons";
import Card from "../components/Card/Card";
import { v4 as uuidv4 } from "uuid";
import "./Tab2.scss";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  arrayUnion,
  setDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import firebase from "firebase/compat/app";
import Alert from "../components/Alert/Alert";
import Loading from "../components/Loading/Loading";
import BarraBusqueda from "../components/BarraBusqueda/BarraBusqueda";
import { getStorage, listAll, ref, deleteObject } from "firebase/storage";

const db = getFirestore();
const storage = getStorage();

const buttonId = uuidv4();

const AlertasRecibidas = () => {
  const [selectedSegment, setSelectedSegment] = useState("first");
  const [telefonoUsuario, setTelefonoUsuario] = useState("");
  //DATOS DE ALERTAS
  const [alertasData, setAlertasData] = useState([]);
  const [alertaspropiasData, setAlertasPropiaData] = useState([]);
  const [alertasEncontradas, setAlertasEncontradas] = useState([]);
  //BARRA DE BUSQUEDA
  const [mostrarBusqueda, setMostrarBusqueda] = useState(false);
  const [alertaFiltrada, setAlertaFiltrada] = useState([]);
  // DATOS DE MENSAJE DE ALERTA
  const [tituloAlerta, setTituloAlerta] = useState("");
  const [alertDescripcion, setAlertDescripcion] = useState("");
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [showAlert, setShowAlert] = useState(false);
  //LOADING
  const [showLoading, setshowLoading] = useState(false);
  //FILTROS
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [regiones, setRegiones] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [filtroOptions, setFiltroOptions] = useState({
    region: "",
    ciudad: "",
  });
  const auth = getAuth();
  const user = auth.currentUser;
  const uid = user.uid;
  const uEmail = user.email;


  const handleSegmentChange = (e) => {
    setSelectedSegment(e.detail.value);
  };

  const obtenerAlertasGenerales = async () => {
    setshowLoading(true);
    const fetchData = async () => {
      // Consulta para obtener la ciudad del usuario actual
      const ubicacionUsuarioQuery = query(
        collection(db, "datosUsuarios"),
        where("userId", "==", uid)
      );
      const ubicacionUsuarioDoc = await getDocs(ubicacionUsuarioQuery);

      // Verifica si hay algún documento retornado
      if (!ubicacionUsuarioDoc.empty) {
        // Obtiene la ciudad del primer documento (asumiendo que solo hay uno por usuario)
        const ciudadUsuario = ubicacionUsuarioDoc.docs[0].data().ciudad;
        const telefonoUsuario = ubicacionUsuarioDoc.docs[0].data().telefono;
        setTelefonoUsuario(telefonoUsuario);

        // Consulta para obtener las alertas no encontradas en la misma ciudad
        const q = query(
          collection(db, "alertas"),
          where("encontrado", "==", false),
          where("ciudad", "==", ciudadUsuario)
        );

        try {
          const querySnapshot = await getDocs(q);
          const alertasData = [];

          querySnapshot.forEach((doc) => {
            alertasData.push({ id: doc.id, data: doc.data() });
          });

          const alertas = await Promise.all(
            alertasData.map(async (alerta) => {
              //const alertaData = doc.data();

              const storageRef = firebase
                .storage()
                .ref(`alerta_images/${alerta.data.userId}/${alerta.id}/`);

              const imageUrls = await Promise.all(
                (
                  await storageRef.listAll()
                ).items.map(async (imageRef) => {
                  return await imageRef.getDownloadURL();
                })
              );

              alerta.data.imageUrls = imageUrls;
              //alertas.push(alertaData);

              return alerta.data;
            })
          );
          setAlertasData(alertasData);
          // console.log("DATOS OK")

          setshowLoading(false);
        } catch (error) {
          console.error("Error al obtener datos:", error);
        }
      } else {
        console.error("No se encontró la ubicación del usuario.");
      }
    };
    fetchData();
  };

  const obtenerAlertasPropia = async () => {
    const fetchData = async () => {
      const q = query(collection(db, "alertas"), where("userId", "==", uid));

      try {
        const querySnapshot = await getDocs(q);
        const alertaspropiasData = [];

        querySnapshot.forEach((doc) => {
          alertaspropiasData.push({ id: doc.id, data: doc.data() });
        });

        const alertas = await Promise.all(
          alertaspropiasData.map(async (alerta) => {
            //const alertaData = doc.data();

            const storageRef = firebase
              .storage()
              .ref(`alerta_images/${alerta.data.userId}/${alerta.id}/`);

            const imageUrls = await Promise.all(
              (
                await storageRef.listAll()
              ).items.map(async (imageRef) => {
                return await imageRef.getDownloadURL();
              })
            );

            alerta.data.imageUrls = imageUrls;
            //alertas.push(alertaData);

            return alerta.data;
          })
        );

        setAlertasPropiaData(alertaspropiasData);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  };

  const obtenerAlertasEncontradas = async () => {
    const fetchData = async () => {
      const q = query(
        collection(db, "alertas"),
        where("encontrado", "==", true)
      );

      try {
        const querySnapshot = await getDocs(q);
        const alertasEncontradas = [];

        querySnapshot.forEach((doc) => {
          alertasEncontradas.push({ id: doc.id, data: doc.data() });
        });

        const alertas = await Promise.all(
          alertasEncontradas.map(async (alerta) => {
            //const alertaData = doc.data();

            const storageRef = firebase
              .storage()
              .ref(`alerta_images/${alerta.data.userId}/${alerta.id}/`);

            const imageUrls = await Promise.all(
              (
                await storageRef.listAll()
              ).items.map(async (imageRef) => {
                return await imageRef.getDownloadURL();
              })
            );

            alerta.data.imageUrls = imageUrls;
            //alertas.push(alertaData);

            return alerta.data;
          })
        );

        setAlertasEncontradas(alertasEncontradas);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
  };

  useEffect(() => {
    obtenerAlertasGenerales();
    obtenerAlertasPropia();
    obtenerAlertasEncontradas();
    obtenerUbicacion();
    setSelectedSegment("first");
  }, []);

  const handleRefresh = async (event) => {
    await obtenerAlertasGenerales();
    await obtenerAlertasPropia();
    await obtenerAlertasEncontradas();
    event.detail.complete();
  };

  const handleMarcarEncontrado = async (alertaId) => {
    // Lógica específica según el segmento

    if (selectedSegment === "second") {
      const alertaRef = doc(db, "alertas", alertaId);
      const nuevosDatos = {
        encontrado: true,
      };

      try {
        await updateDoc(alertaRef, nuevosDatos); // ELIMINA EL DOCUMENTO DE ALERTA

        await obtenerAlertasGenerales();
        await obtenerAlertasPropia();
        await obtenerAlertasEncontradas();

        setTituloAlerta("Alerta");
        setMensajeAlerta(
          "Se ha marcado tu alerta como encontrada. Que bueno!!"
        );
        setShowAlert(true);
      } catch (error) {
        console.error("Error al eliminar la alerta:", error);
        setTituloAlerta("Alerta");
        setMensajeAlerta(
          "Error al eliminar la alerta, intenta nuevamente (",
          error,
          ")."
        );
        setShowAlert(true);
      }
    } else {
      // Otra acción específica
      setTituloAlerta("Alerta");
      setMensajeAlerta("PRUEBAAA");
      setShowAlert(true);
    }
  };

  const handleActionButtonClick = async (alertaId, userId) => {
    const storageRef = ref(storage, `alerta_images/${userId}/${alertaId}`);
    // Lógica específica según el segmento

    if (selectedSegment === "second") {
      const alertaRef = doc(db, "alertas", alertaId);
      try {
        const imagenesLista = await listAll(storageRef);
        await deleteDoc(alertaRef); // ELIMINA EL DOCUMENTO DE ALERTA

        await Promise.all(
          imagenesLista.items.map(async (imagenRef) => {
            await deleteObject(imagenRef);
          })
        );

        await obtenerAlertasGenerales();
        await obtenerAlertasPropia();
        await obtenerAlertasEncontradas();

        setTituloAlerta("Alerta");
        setMensajeAlerta("Alerta eliminada correctamente.");
        setShowAlert(true);
      } catch (error) {
        console.error("Error al eliminar la alerta:", error);
        setTituloAlerta("Alerta");
        setMensajeAlerta(
          "Error al eliminar la alerta, intenta nuevamente (",
          error,
          ")."
        );
        setShowAlert(true);
      }
    } else {
      // Otra acción específica
      setTituloAlerta("Alerta");
      setMensajeAlerta("PRUEBAAA");
      setShowAlert(true);
    }
  };

  const notificarDenuncianteHandler = async (alertaId, uEmail) => {
    const notificacionesDocRef = doc(collection(db, "alertas"), alertaId);
    try {
      const notificacionesDocSnapshot = await getDoc(notificacionesDocRef);

      if (notificacionesDocSnapshot.exists()) {
        const nuevosDatos = {
          notificaciones: arrayUnion(
            "El usuario " + uEmail + " ha avistado tu vehículo"
          ),
        };

        try {
          // Actualiza el documento con los nuevos datos
          await updateDoc(notificacionesDocRef, nuevosDatos);

          console.log("Documento actualizado con éxito.");
        } catch (error) {
          console.error("Error al actualizar el documento:", error);
        }
      } else {
        console.error("El documento no existe.");
      }
    } catch (error) {
      console.error("Error al notificar al denunciante: ", error);
    }
  };

  const handleAlertButton = async (userId) => {
    try {
      const usuarioDocRef = doc(collection(db, "notificaciones"), userId);
      const usuarioDocSnapshot = await getDoc(usuarioDocRef);

      const nuevaNotificacion = {
        remitente: uEmail,
        mensaje: alertDescripcion,
        telefono: telefonoUsuario,
      };

      if (usuarioDocSnapshot.exists()) {
        const notificacionesActuales =
          usuarioDocSnapshot.data().notificaciones || [];
        notificacionesActuales.push(nuevaNotificacion);

        await updateDoc(usuarioDocRef, {
          notificaciones: arrayUnion(nuevaNotificacion),
        });

        setTituloAlerta("Lo encontré");
        setMensajeAlerta("Mensaje enviado correctamente al usuario.");
        setShowAlert(true);
      } else {
        // Si el documento no existe, crea uno nuevo con el campo "notificaciones"
        await setDoc(usuarioDocRef, {
          notificaciones: [nuevaNotificacion],
        });
      }
    } catch (error) {
      console.error("Error al enviar la notificación:", error);
    }
  };

  const handleSearch = (searchTerm) => {
    const filtrado = alertasData.filter((alerta) =>
      alerta.data.patente.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setAlertaFiltrada(filtrado);
    setMostrarBusqueda(true);
  };

  // HANDLE DE FILTROS
  const handleOpenFiltroModal = () => {
    setFilterModalOpen(true);
  };

  const handlecloseFilterModal = () => {
    setFilterModalOpen(false);
  };

  const handleFilterChange = (field, value) => {
    setFiltroOptions((prevOptions) => ({
      ...prevOptions,
      [field]: value,
    }));
  };

  const getFilteredMarkers = async () => {
    setshowLoading(true);

    try {
      // Espera la resolución de la Promesa retornada por fetchData
      const alertasData = await fetchData();

      // Continúa con el resto del código después de que los datos estén disponibles
      console.log(alertasData);
      setshowLoading(false);
      return alertasData;
    } catch (error) {
      console.error("Error al obtener datos:", error);
      setshowLoading(false);
    }
  };

  const fetchData = async () => {
    // Consulta para obtener las alertas no encontradas en la misma ciudad
    const q = query(
      collection(db, "alertas"),
      where("encontrado", "==", false),
      where("region", "==", filtroOptions.region),
      where("ciudad", "==", filtroOptions.ciudad)
    );

    try {
      const querySnapshot = await getDocs(q);
      const alertasData = [];

      querySnapshot.forEach((doc) => {
        alertasData.push({ id: doc.id, data: doc.data() });
      });

      const alertas = await Promise.all(
        alertasData.map(async (alerta) => {
          const storageRef = firebase
            .storage()
            .ref(`alerta_images/${alerta.data.userId}/${alerta.id}/`);

          const imageUrls = await Promise.all(
            (
              await storageRef.listAll()
            ).items.map(async (imageRef) => {
              return await imageRef.getDownloadURL();
            })
          );

          alerta.data.imageUrls = imageUrls;
          return alerta.data;
        })
      );

      return alertasData;
    } catch (error) {
      console.error("Error al obtener datos:", error);
      throw error; // Lanza el error para que sea manejado en la función que llama a fetchData
    }
  };

  const handleApplyFilters = async () => {
    try {
      const filtroAlerta = await getFilteredMarkers();
      console.log(filtroOptions);
      if (filtroOptions.region !== "" || filtroOptions.ciudad !== "") {
        setAlertaFiltrada(filtroAlerta);
        console.log("entró al if: ", filtroAlerta);
        setMostrarBusqueda(true);
        handlecloseFilterModal();
      } else {
        console.log("no está en el if: ", filtroAlerta);
        obtenerAlertasGenerales();
        setTituloAlerta("Filtros");
        setMensajeAlerta("Se eliminaron los filtros.");
        setShowAlert(true);
        setMostrarBusqueda(false);
        handlecloseFilterModal();
      }
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
      // Manejar el error según tus necesidades
    }
  };

  const handleEliminarFilters = async () => {
    await obtenerAlertasGenerales();
    setTituloAlerta("Filtros");
    setMensajeAlerta("Se eliminaron los filtros.");
    setShowAlert(true);
    setMostrarBusqueda(false);
    handlecloseFilterModal();
  };

  const obtenerUbicacion = async () => {
    try {
      const ubicacionesCollection = collection(db, "ubicaciones");
      const ubicacionesSnapshot = await getDocs(ubicacionesCollection);
      const regionesData = [];

      ubicacionesSnapshot.forEach((doc) => {
        const region = doc.data().region;
        const ciudades = doc.data().ciudades;

        regionesData.push({
          id: doc.id,
          region: region,
          ciudades: ciudades,
        });
      });

      // Actualizar los estados de regiones y ciudades
      setRegiones(regionesData);
    } catch (error) {
      console.error("Error al obtener datos de la región:", error);
    }
  };

  const handleRegionChange = (e) => {
    const regionSeleccionada = e.target.value;
    const region = regiones.find((m) => m.region === regionSeleccionada);
    const ciudadesDeRegion = region ? region.ciudades : [];
    setCiudades(ciudadesDeRegion);
    setFiltroOptions({
      ...filtroOptions,
      region: regionSeleccionada,
      ciudad: "",
    });
  };

  const handleCiudadChange = (e) => {
    const ciudadSeleccionada = e.target.value;
    setFiltroOptions({ ...filtroOptions, ciudad: ciudadSeleccionada });
  };

  return (
    <IonPage id="alertas_recibidas">
      <IonContent fullscreen>
        <Alert
          titulo={tituloAlerta}
          mensaje={mensajeAlerta}
          boton="Aceptar"
          showAlert={showAlert}
          setShowAlert={setShowAlert}
        />
        <Loading showLoading={showLoading} mensaje="Cargando"></Loading>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="bg-header"></div>

        <IonGrid>
          <IonSegment onIonChange={handleSegmentChange} value={selectedSegment}>
            <IonSegmentButton value="first">
              <IonLabel>Alertas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="second">
              <IonLabel>Mis alertas</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="third">
              <IonLabel>Encontrados</IonLabel>
            </IonSegmentButton>
          </IonSegment>
          {selectedSegment === "first" && (
            <>
              <IonRow>
                <IonCol size="8">
                  <BarraBusqueda onSearch={handleSearch}></BarraBusqueda>
                </IonCol>
                <IonCol
                  size="4"
                  className="ion-align-items-center"
                  style={{ display: "flex" }}
                >
                  <IonButton
                    onClick={handleOpenFiltroModal}
                    className="btn-filtro-alertas"
                  >
                     <IonIcon icon={optionsOutline} style={{ marginRight: "6px" }} />
                    Filtro
                  </IonButton>
                </IonCol>
              </IonRow>

              {!mostrarBusqueda &&
                alertasData.map((alerta) => (
                  <Card
                    key={alerta.id}
                    alertaId={alerta.id}
                    userId={alerta.data?.userId || ""}
                    imagen={alerta.data?.imageUrls || ""}
                    marca={alerta.data?.marca || ""}
                    modelo={alerta.data?.modelo || ""}
                    fecha={alerta.data?.fecha.toDate() || ""}
                    patente={alerta.data?.patente || ""}
                    color={alerta.data?.color || ""}
                    modalDireccionLat={alerta.data?.location?._lat || ""}
                    modalDireccionLong={alerta.data?.location?._long || ""}
                    ciudad={alerta.data?.ciudad || ""}
                    modalDescripcion={alerta.data?.descripcion || ""}
                    region={alerta.data?.region || ""}
                    modalDenunciante={alerta.data?.userEmail || ""}
                    selectedSegment={selectedSegment}
                    alertUsuario={alerta.data?.userEmail || ""}
                    handleAlertInputChange={(e) =>
                      setAlertDescripcion(e.detail.value)
                    }
                    handleAlertButton={() =>
                      handleAlertButton(alerta.data?.userId)
                    }
                  />
                ))}
              {mostrarBusqueda &&
                alertaFiltrada.map((alerta) => (
                  <Card
                    key={alerta.id}
                    alertaId={alerta.id}
                    userId={alerta.data?.userId || ""}
                    imagen={alerta.data?.imageUrls || ""}
                    marca={alerta.data?.marca || ""}
                    modelo={alerta.data?.modelo || ""}
                    fecha={alerta.data?.fecha.toDate() || ""}
                    patente={alerta.data?.patente || ""}
                    color={alerta.data?.color || ""}
                    modalDireccionLat={alerta.data?.location?._lat || ""}
                    modalDireccionLong={alerta.data?.location?._long || ""}
                    ciudad={alerta.data?.ciudad || ""}
                    region={alerta.data?.region || ""}
                    modalDenunciante={alerta.data?.userEmail || ""}
                    modalDescripcion={alerta.data?.descripcion || ""}
                    selectedSegment={selectedSegment}
                    alertUsuario={alerta.data?.userEmail || ""}
                    handleAlertInputChange={(e) =>
                      setAlertDescripcion(e.detail.value)
                    }
                    handleAlertButton={handleAlertButton}
                  />
                ))}
            </>
          )}
          {selectedSegment === "second" && (
            <>
              {alertaspropiasData.map((alerta) => (
                <Card
                  key={alerta.id}
                  alertaId={alerta.id}
                  userId={alerta.data?.userId || ""}
                  imagen={alerta.data?.imageUrls || ""}
                  marca={alerta.data?.marca || ""}
                  modelo={alerta.data?.modelo || ""}
                  fecha={alerta.data?.fecha.toDate() || ""}
                  patente={alerta.data?.patente || ""}
                  modalDescripcion={alerta.data?.descripcion || ""}
                  color={alerta.data?.color || ""}
                  modalDireccionLat={alerta.data?.location?._lat || ""}
                  modalDireccionLong={alerta.data?.location?._long || ""}
                  ciudad={alerta.data?.ciudad || ""}
                  region={alerta.data?.region || ""}
                  modalDenunciante={alerta.data?.userEmail || ""}
                  selectedSegment={selectedSegment}
                  onActionButtonClick={handleActionButtonClick}
                  onActionEncontrado={handleMarcarEncontrado}
                />
              ))}
            </>
          )}
          {selectedSegment === "third" && (
            <>
              {alertasEncontradas.map((alerta) => (
                <Card
                  key={alerta.id}
                  alertaId={alerta.id}
                  userId={alerta.data?.userId || ""}
                  imagen={alerta.data?.imageUrls || ""}
                  marca={alerta.data?.marca || ""}
                  modelo={alerta.data?.modelo || ""}
                  fecha={alerta.data?.fecha.toDate() || ""}
                  patente={alerta.data?.patente || ""}
                  modalDescripcion={alerta.data?.descripcion || ""}
                  color={alerta.data?.color || ""}
                  modalDireccionLat={alerta.data?.location?._lat || ""}
                  modalDireccionLong={alerta.data?.location?._long || ""}
                  ciudad={alerta.data?.ciudad || ""}
                  region={alerta.data?.region || ""}
                  modalDenunciante={alerta.data?.userEmail || ""}
                  selectedSegment={selectedSegment}
                />
              ))}
            </>
          )}
        </IonGrid>

        <IonModal
          id="example-modal"
          backdropDismiss={false}
          isOpen={filterModalOpen}
        >
          <div className="modal-wrapper">
            <IonToolbar>
              <IonButtons slot="end">
                <IonButton color="light" onClick={handlecloseFilterModal}>
                  <span>x</span>
                </IonButton>
              </IonButtons>
            </IonToolbar>
            <br /><br /><br /><br />
            <div className="item-wrapper">
              <IonItem>
                <IonSelect
                  aria-label="Region"
                  interface="popover"
                  placeholder="Seleccione una region"
                  value={filtroOptions.region}
                  onIonChange={handleRegionChange}
                >
                  <IonSelectOption value="">
                    Selecciona una region
                  </IonSelectOption>
                  {regiones.map((region) => (
                    <IonSelectOption key={region.region} value={region.region}>
                      {region.region}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>

            <div>
              <IonItem>
                <IonSelect
                  aria-label="Ciudad"
                  interface="popover"
                  placeholder="Seleccione su ciudad"
                  value={filtroOptions.ciudad}
                  onIonChange={handleCiudadChange}
                >
                  {ciudades.map((ciudad, index) => (
                    <IonSelectOption key={index} value={ciudad}>
                      {ciudad}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </div>
            <br />



            <IonGrid>
              <IonRow class="ion-justify-content-between">
                <IonCol size="6">
                  <IonButton className="btn-filtro-modal-aplicar" onClick={handleApplyFilters}>Aplicar Filtros</IonButton>
                </IonCol>
                <IonCol size="6">
                  <IonButton className="btn-filtro-modal-eliminar" onClick={handleEliminarFilters}>Eliminar filtros</IonButton>
                </IonCol>
              </IonRow>
            </IonGrid>



          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default AlertasRecibidas;

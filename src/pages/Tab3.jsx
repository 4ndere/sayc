import React, { useState, useRef, useEffect } from 'react';
import { useHistory } from "react-router-dom";
import {
  IonPage,
  IonFab,
  IonFabButton,
  IonIcon,
  IonModal,
  IonButton,
  IonLabel,
  IonItem,
  IonDatetime,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import "./Tab3.scss";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from 'leaflet';
import markerIcon from './images/marker-icon.png';
import { Icon } from "leaflet";
import { add, locate, location } from "ionicons/icons";
import { Geolocation } from '@capacitor/geolocation';
import {

  collection,
  addDoc,
  getFirestore,
  getDocs,
  query,
  where,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  arrayUnion,
  setDoc
} from "firebase/firestore";
import firebase from "firebase/compat/app";
import firestore from "../firebaseConfig";
import Loading from '../components/Loading/Loading';
import Card from "../components/Card/Card";
import ImgNoEncontrado from '../pages/images/alerta_no_encontrado.png';
import ImgEncontrado from '../pages/images/alerta_encontrado.png';

const center = [-33.4729, -70.6475];
const zoom = 7;
const selectedSegment = "first";

const Tab3 = ({ ubicacion, markerPositionProp, setMarkerPositionProp }) => {
  const db = getFirestore();
  const history = useHistory();
  const [markerPosition, setMarkerPosition] = useState(
    ubicacion ? [ubicacion.lat, ubicacion.lng] : center);
  const [isModalMinimized, setIsModalMinimized] = useState(false);
  const [showLoading, setshowLoading] = useState(false)
  const markerRef = useRef(null);
  const mapRef = useRef(null);
  const [markersData, setMarkersData] = useState([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [alertDescripcion, setAlertDescripcion] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    encontrado: null,
    tipoDelito: null,
  });

  const handleIraAlertar = () => {
    history.push(`/alertar?lat=${markerPosition[0]}&lng=${markerPosition[1]}`);
    console.log(markerPosition)
  }

  // HANDLE DE FILTROS 
  const handleFilterChange = (filterType, value) => {
    setFilterOptions({
      ...filterOptions,
      [filterType]: value,
    });
  };

  const getFilteredMarkers = async () => {
    const q = query(collection(db, "alertas"));
    const querySnapshot = await getDocs(q);
    const markers = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const location = data.location;

      // Verifica si se aplica el filtro de "encontrado" o "no encontrado"
      if (
        (filterOptions.encontrado === null ||
          data.encontrado === filterOptions.encontrado) &&
        (filterOptions.tipoDelito === null ||
          data.tipo === filterOptions.tipoDelito)
      ) {
        markers.push({
          id: doc.id,
          data: data,
        });
      }
    });
    return markers;
  };

  const applyFilters = async () => {
    const updatedMarkers = await getFilteredMarkers();
    setMarkersData(updatedMarkers);
    closeFilterModal();
  };

  const openFilterModal = () => {
    setFilterModalOpen(true);
  };

  const closeFilterModal = () => {
    setFilterModalOpen(false);
  };

  const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [28, 38], 
  });

  const getMarkerIcon = (encontrado) => {
    const iconUrl = encontrado
      ? ImgEncontrado
      : ImgNoEncontrado;

    return new Icon({
      iconUrl: iconUrl,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
      shadowUrl: null,
      shadowSize: null,
      shadowAnchor: null,
    });
  };

  const getMarkersData = async () => {
    setshowLoading(true);
    const fetchData = async () => {
      const q = query(
        collection(db, "alertas")
      );

      try {
        const querySnapshot = await getDocs(q);
        const alertasData = [];

        querySnapshot.forEach((doc) => {
          alertasData.push({ id: doc.id, data: doc.data() });
        });

        //const alertasCollection = collection(db, "alertas");
        //const alertasSnapshot = await getDocs(alertasCollection);

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
        setMarkersData(alertasData);
        //console.log(alertasData)
        // console.log("DATOS OK")

        setshowLoading(false)

      } catch (error) {
        console.error("Error al obtener datos:", error);
      }
    };

    fetchData();
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


  // funcion que va observando la posiosion del marcador
  const handleMarkerDrag = (e) => {
    const latLng = e.target.getLatLng();
    setMarkerPosition([latLng.lat, latLng.lng]);
    console.log(markerPosition)
  };


  //funcion que al entrar al mapa ve la posicion inicial del marcador y la distancia
  const locateAndZoomToMarker = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setMarkerPosition(userLocation);
        console.log(userLocation)
        getMarkersData();
        if (mapRef.current) {
          // Ajusta la velocidad de la animación y la duración
          mapRef.current.setView(userLocation, 16, {
            animate: true,
            duration: 2,
          });
        }
      });
    } else {
      alert("La geolocalización no está disponible en tu dispositivo.");
    }
  };

  useEffect(() => {
    getMarkersData();
    locateAndZoomToMarker(); // Obtener la ubicación y hacer zoom al nivel de la calle al cargar el componente
  }, [ubicacion]);

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
        const notificacionesActuales = usuarioDocSnapshot.data().notificaciones || [];
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

  return (
    <IonPage id="page-mapa">
      <div id="map-container" className="map-container">
        <Loading showLoading={showLoading} mensaje="Cargando"></Loading>
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Marker
            position={markerPosition}
            draggable={true}
            zIndexOffset={1000}
            icon={customMarkerIcon}
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
            ref={markerRef}
          >
            <IonIcon icon={location}></IonIcon>
          </Marker>

          {markersData.map((alerta) => (
            <Marker
              key={alerta.id}
              position={[alerta.data?.location?._lat, alerta.data?.location?._long]}
              icon={getMarkerIcon(alerta.data?.encontrado)}
            >
              <Popup>
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
                  handleAlertInputChange={(e) => setAlertDescripcion(e.detail.value)}
                  handleAlertButton={handleAlertButton}
                />
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      <IonFab vertical="bottom" horizontal="start" slot="fixed">

        <IonFabButton size="small" className="fab-button" onClick={handleIraAlertar}>
          <IonIcon icon={add} />
        </IonFabButton>

        <IonFabButton className="fab-button" onClick={locateAndZoomToMarker}>
          <IonIcon icon={locate} />
        </IonFabButton>

        <IonButton onClick={openFilterModal} className='btn-filtros'>Filtros</IonButton>

        <IonModal
          id="filter-modal"
          backdropDismiss={false}
          isOpen={filterModalOpen}
        >
          <div className="modal-wrapper">
            <div className="item-wrapper">
              <IonItem>
                <IonLabel position="stacked">Mostrar</IonLabel>
                <IonSelect
                  aria-label="EncontradoOno"
                  value={filterOptions.encontrado}
                  interface="popover"
                  placeholder="Selecciona"
                  onIonChange={(e) =>
                    handleFilterChange("encontrado", e.detail.value)
                  }
                >
                  <IonSelectOption value={null}>Todos</IonSelectOption>
                  <IonSelectOption value={true}>Encontrados</IonSelectOption>
                  <IonSelectOption value={false}>No Encontrados</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>

            <div className="item-wrapper">
              <IonItem>
                <IonLabel position="stacked">Tipo de Delito</IonLabel>
                <IonSelect
                  aria-label="tipoDelito"
                  value={filterOptions.tipoDelito}
                  placeholder="Selecciona"
                  interface="popover"
                  onIonChange={(e) =>
                    handleFilterChange("tipoDelito", e.detail.value)
                  }
                >
                  <IonSelectOption value={null}>Todos</IonSelectOption>
                  <IonSelectOption value="Asalto">Asalto</IonSelectOption>
                  <IonSelectOption value="Portonazo">Portonazo</IonSelectOption>
                  <IonSelectOption value="Robado estacionado">Robado estacionado</IonSelectOption>
                </IonSelect>
              </IonItem>
            </div>

            <IonButton onClick={applyFilters}>Aplicar Filtros</IonButton>
            <IonButton onClick={closeFilterModal}>Cerrar</IonButton>
          </div>
        </IonModal>

      </IonFab>

    </IonPage>
  );
};

export default Tab3;

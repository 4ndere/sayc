import {
  IonContent,
  IonPage,
  IonButton,
  IonInput,
  IonItem,
  IonCol,
  IonGrid,
  IonRow,
  IonText,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonTextarea
} from "@ionic/react";
import React, { useState, useEffect, useRef } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { contractOutline, homeSharp, imageOutline, mapOutline } from "ionicons/icons";
import Slider from "../../components/Slider/Swiper";
import "./RealizarAlerta.scss";
import firestore from "../../firebaseConfig";
import firebase from "firebase/compat/app";
import { useMaskito } from "@maskito/react";
import "firebase/compat/auth";
import "firebase/compat/storage";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { marker } from "leaflet";
import L from 'leaflet';
import markerIcon from './images/marker-icon.png';
import Alert from "../../components/Alert/Alert";
import { Geolocation } from '@capacitor/geolocation';
import { add, locate, airplane } from "ionicons/icons";
import { reverseGeocode } from "../../services/geocodingUtils";
import Loading from "../../components/Loading/Loading";


const Alertar = () => {
  const imageInputRef = useRef(null);
  const history = useHistory();
  const location = useLocation();
  const user = firebase.auth().currentUser; //Obtener datos de usuarios
  const searchParams = new URLSearchParams(location.search); //Obtener datos de url
  const patenteInicio = searchParams.get("patente"); //Obtener patente
  const center = [-36.7367775, -72.4613075];
  const zoom = 7;
  const markerRef = useRef(null);
  const mapRef = useRef(null);

  const latUrl = parseFloat(searchParams.get('lat')) || 0;
  const lngUrl = parseFloat(searchParams.get('lng')) || 0;


  const accion = Date.now();
  const objectoAccion = new Date(accion);
  const dateTime = objectoAccion.toISOString(); //Obtener datos de fecha y hora actual
  const defaultImage = "https://placehold.jp/370x240.png"; //Imagen por defecto que se muestra

  //USE STATE's
  const [ubicacion, setUbicacion] = useState({ lat: 0, lng: 0 });
  const [direccion, setDireccion] = useState({ ciudad: "", region: "" });
  const [showLoading, setshowLoading] = useState(false)
  const [marcas, setMarcas] = useState([]);
  const [modelos, setModelos] = useState([]);
  const [colores, setColores] = useState([]);
  const [delitos, setDelitos] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [cachedImage, setCachedImage] = useState(null);
  const [userHasImages, setUserHasImages] = useState(false);
  const [markerPosition, setMarkerPosition] = useState([latUrl || 0, lngUrl || 0]);
  const [formData, setFormData] = useState({
    marca: "",
    modelo: "",
    patente: patenteInicio,
    color: "",
    tipo: "",
    descripcion: "",
  });

  // UseState De mensaje alerta
  const [tituloAlerta, setTituloAlerta] = useState("");
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // Mascara de patente
  const patenteMask = useMaskito({
    options: {
      mask: [/\w/, /\w/, "-", /\w/, /\w/, "-", /\d/, /\d/],
    },
  });

  const handleEnviarAlerta = () => {
    if (
      !formData.marca ||
      !formData.modelo ||
      !formData.patente ||
      !formData.tipo ||
      selectedImages.length === 0
    ) {
      console.error(
        "Por favor, complete todos los campos obligatorios y seleccione al menos una imagen."
      );
      setTituloAlerta("Realizar alerta")
      setMensajeAlerta("Complete todos los campos obligatorios y seleccione al menos una imagen.")
      setShowAlert(true)
      return;
    }

    if (user) {
      const alertasCollection = firestore.collection("alertas");

      // Genera un ID de documento único para la nueva alerta
      const id_alerta = alertasCollection.doc().id;
      const { ciudad, region } = direccion;

      const nuevaAlerta = {
        marca: formData.marca,
        modelo: formData.modelo,
        patente: formData.patente,
        color: formData.color,
        tipo: formData.tipo,
        userId: user.uid,
        userEmail: user.email,
        fecha: firebase.firestore.Timestamp.fromDate(new Date(dateTime)),
        descripcion: formData.descripcion,
        location: new firebase.firestore.GeoPoint(markerPosition[0], markerPosition[1]),
        ciudad: ciudad,
        region: region,
        encontrado: false,
        // También puedes agregar otros datos relacionados con la alerta
      };

      alertasCollection
        .doc(id_alerta)
        .set(nuevaAlerta) // Establece el documento con el ID generado
        .then(() => {
          // Define la ruta base para las imágenes usando el ID generado
          const storageBasePath = `alerta_images/${user.uid}/${id_alerta}`;

          const uploadImage = (image) => {
            const storageRef = firebase
              .storage()
              .ref(`${storageBasePath}/${image.name}`);

            // Subir la imagen al almacenamiento
            return storageRef.put(image).then((snapshot) => {
              // Obtener la URL de descarga de la imagen después de cargarla con éxito
              return snapshot.ref.getDownloadURL();
            });
          };

          // Cargar todas las imágenes seleccionadas en paralelo
          const uploadPromises = selectedImages.map(uploadImage);

          Promise.all(uploadPromises)
            .then((downloadURLs) => {
              console.log("Alerta enviada con éxito");

              setTituloAlerta("Realizar alerta")
              setMensajeAlerta("Alerta enviada con éxito.")
              setShowAlert(true)
              history.push('/alertas-recibidas')
              setFormData({
                marca: "",
                modelo: "",
                patente: "",
                color: "",
                tipo: "",
                descripcion: "",
              });
              setSelectedImages([]);
              setUserHasImages(false);
              setMarkerPosition([0, 0]); // Valores iniciales según tus necesidades
              setUbicacion({ lat: 0, lng: 0 });
              // Puedes realizar alguna acción adicional aquí, como redirigir al usuario a otra página
            })
            .catch((error) => {
              console.error("Error al cargar imágenes:", error);
            });
        })
        .catch((error) => {
          // Error al agregar el documento a Firestore
          console.error("Error al enviar la alerta:", error);
          // Puedes manejar el error de acuerdo a tus necesidades, como mostrar un mensaje de error al usuario
        });
    }
  };

  const obtenerMarcas = async () => {
    const autosCollection = firestore.collection("autos");
    const autosSnapshot = await autosCollection.get();
    const marcasData = [];

    autosSnapshot.forEach((doc) => {
      const marca = doc.data().marca;
      marcasData.push({
        id: doc.id,
        nombre: marca,
        modelos: doc.data().modelos,
      });
    });

    setMarcas(marcasData);
  };
  const obtenerColores = async () => {
    const coloresCollection = firestore.collection("color"); // Reemplaza 'colores' con el nombre de tu colección
    const coloresSnapshot = await coloresCollection.get();
    const coloresData = [];

    coloresSnapshot.forEach((doc) => {
      const coloresArray = doc.data().colores;
      coloresData.push(...coloresArray); // Agregar todos los colores al estado
    });

    setColores(coloresData);
  };
  const obtenerTipoDelito = async () => {
    const tipodelitoCollection = firestore.collection("delitos"); // Reemplaza 'delitos' con el nombre de tu colección
    const tipodelitoSnapshot = await tipodelitoCollection.get();
    const tipodelitoData = [];

    tipodelitoSnapshot.forEach((doc) => {
      const tipodelitoArray = doc.data().tipos;
      tipodelitoData.push(...tipodelitoArray); // Agregar todos los colores al estado
    });

    setDelitos(tipodelitoData);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setshowLoading(true);
        await obtenerMarcas();
        await obtenerColores();
        await obtenerTipoDelito();
        setMarkerPosition([latUrl || 0, lngUrl || 0])
        locateAndZoomToMarker(); // Llamar a la función que necesitas ejecutar al inicio

        setshowLoading(false);

        // Función para actualizar el tamaño del mapa después de cargar
        const updateMapSize = () => {
          if (mapRef.current) {
            mapRef.current.invalidateSize();
          }
        };

        // Actualizar el tamaño del mapa después de un segundo
        const timeoutId = setTimeout(updateMapSize, 1000);

        // Limpiar el temporizador al desmontar el componente
        return () => clearTimeout(timeoutId);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setshowLoading(false);
      }
    };

    fetchData();
  }, []);

  // FUNCIONES PARA CUANDO EL VALOR DEL IMPUT CAMBIA
  const handleMarcaChange = (e) => {
    const marcaSeleccionada = e.target.value;
    const marca = marcas.find((m) => m.nombre === marcaSeleccionada);
    if (marca) {
      setModelos(marca.modelos);
    } else {
      setModelos([]);
    }
    setFormData({ ...formData, marca: marcaSeleccionada, modelo: "" });
  };

  const handleModeloChange = (e) => {
    const modeloSeleccionado = e.target.value;
    setFormData({ ...formData, modelo: modeloSeleccionado });
  };

  const handleColorChange = (e) => {
    const colorSeleccionado = e.target.value;
    setFormData({ ...formData, color: colorSeleccionado });
  };

  const handleTipoDelitoChange = (e) => {
    const tipodelitoSeleccionado = e.target.value;
    setFormData({ ...formData, tipo: tipodelitoSeleccionado });
  };

  const handlePatenteChange = (e) => {
    const patenteSeleccionado = e.target.value.toUpperCase();
    setFormData({ ...formData, patente: patenteSeleccionado });
  };

  const handleDescripcionChange = (e) => {
    const descripcionSeleccionada = e.target.value;
    setFormData({ ...formData, descripcion: descripcionSeleccionada });
  };

  const openImagePicker = () => {
    if (imageInputRef.current) {
      imageInputRef.current.click();
    }
  };

  const handleImagesChange = async (e) => {
    const files = e.target.files;
    const selected = Array.from(files);

    // Comprime la imagen antes de almacenarla en caché
    const compressedImages = await Promise.all(selected.map(compressImage));

    // Actualiza las imágenes seleccionadas
    setSelectedImages(compressedImages);
    setUserHasImages(true);

    // Almacena la imagen en caché
    const image = compressedImages[0];
    const imageUrl = URL.createObjectURL(image);
    console.log("URL de la imagen en caché:", imageUrl);
    setCachedImage(imageUrl);
  };

  const compressImage = (image) => {
    return new Promise((resolve) => {
      const reader = new FileReader();

      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;

        img.onload = () => {
          let newWidth = img.width;
          let newHeight = img.height;

          // Configura el tamaño del lienzo para la compresión
          const maxWidth = 800;
          const maxHeight = 600;

          if (newWidth > newHeight) {
            if (newWidth > maxWidth) {
              newHeight *= maxWidth / newWidth;
              newWidth = maxWidth;
            }
          } else {
            if (newHeight > maxHeight) {
              newWidth *= maxHeight / newHeight;
              newHeight = maxHeight;
            }
          }

          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Resto del código...

          canvas.width = newWidth;
          canvas.height = newHeight;

          // Dibuja la imagen en el lienzo
          ctx.drawImage(img, 0, 0, newWidth, newHeight);

          // Convierte el lienzo a una imagen comprimida
          canvas.toBlob((blob) => {
            const compressedImage = new File([blob], image.name, {
              type: "image/jpeg", // Puedes ajustar el tipo de imagen según tus necesidades
              lastModified: Date.now(),
            });
            resolve(compressedImage);
          }, "image/jpeg", 0.7); // Ajusta la calidad de compresión según tus necesidades
        };
      };

      reader.readAsDataURL(image);
    });
  };


  //funcion que al entrar al mapa ve la posicion inicial del marcador y la distancia
  const locateAndZoomToMarker = () => {
    // Verifica si hay valores en la URL para la posición del marcador
    if (latUrl !== 0 && lngUrl !== 0) {
      const userLocation = [latUrl, lngUrl];
      setMarkerPosition(userLocation);
      obtenerDireccionInversa(userLocation[0], userLocation[1])

      if (mapRef.current) {
        // Ajusta la velocidad de la animación y la duración
        mapRef.current.setView(userLocation, 15, {
          animate: true,
          duration: 2,
        });
      }
    } else {
      // Si no hay valores en la URL, obtiene la ubicación actual del usuario
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition((position) => {
          const userLocation = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setMarkerPosition(userLocation);
          obtenerDireccionInversa(userLocation[0], userLocation[1])

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
    }
  };

  
  const customMarkerIcon = new L.Icon({
    iconUrl: markerIcon,
    iconSize: [28, 38], 
  });

  const handleObtenerUbicacionActual = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userLocation = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        setMarkerPosition(userLocation);

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
  }

  const handleMarkerDrag = (e) => {
    const latLng = e.target.getLatLng();
    setMarkerPosition([latLng.lat, latLng.lng]);
    obtenerDireccionInversa(latLng.lat, latLng.lng);
  };


  const obtenerDireccionInversa = async (lat, lng) => {
    try {
      const result = await reverseGeocode(lat, lng);
      setDireccion(result);
    } catch (error) {
      console.error("Error al obtener la dirección inversa:", error);
    }
  };

  return (
    <IonPage id="alertar">
      <IonContent fullscreen>
        <div className="bg-header"></div>
        <Alert
          titulo={tituloAlerta}
          mensaje={mensajeAlerta}
          boton="Aceptar"
          showAlert={showAlert}
          setShowAlert={setShowAlert}
        />
        <Loading showLoading={showLoading} mensaje="Cargando"></Loading>
        <IonGrid>
          <Slider images={selectedImages.length > 0 ? selectedImages.map(image => URL.createObjectURL(image)) : [defaultImage]}>
            <IonRow className="ion-justify-content-center edit-image-alert">
              <IonCol size="6">
                <IonButton onClick={openImagePicker}>
                  <IonIcon md={imageOutline}></IonIcon>
                  <IonText>Añade una foto</IonText>
                  <input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    style={{ display: "none" }}
                    onChange={handleImagesChange}
                  />
                </IonButton>
              </IonCol>
            </IonRow>
          </Slider>
          <div className="form-alertar">
            <IonRow class="ion-justify-content-center">
              <IonCol>
                <IonItem>
                  <IonSelect
                    aria-label="Marca"
                    interface="popover"
                    placeholder="Seleccione la marca del vehículo"
                    value={formData.marca}
                    onIonChange={handleMarcaChange}
                  >
                    <IonSelectOption value="">
                      Selecciona una marca
                    </IonSelectOption>
                    {marcas.map((marca) => (
                      <IonSelectOption key={marca.id} value={marca.nombre}>
                        {marca.nombre}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol>
                <IonItem>
                  <IonSelect
                    aria-label="Modelo"
                    interface="popover"
                    placeholder="Seleccione el modelo del vehículo"
                    value={formData.modelo}
                    onIonChange={handleModeloChange} // Utilizar la función para manejar el cambio de modelo
                  >
                    {modelos.map((modelo) => (
                      <IonSelectOption key={modelo} value={modelo}>
                        {modelo}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol>
                <IonItem>
                  <IonSelect
                    aria-label="Color"
                    interface="popover"
                    placeholder="Seleccione el color del vehículo"
                    value={formData.color}
                    onIonChange={handleColorChange} // Utilizar la función para manejar el cambio de modelo
                  >
                    {colores.map((color) => (
                      <IonSelectOption key={color} value={color}>
                        {color}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol>
                <IonItem>
                  <IonSelect
                    aria-label="Fruit"
                    interface="popover"
                    placeholder="Escoja el tipo de delito"
                    value={formData.tipo}
                    onIonChange={handleTipoDelitoChange} // Utilizar la función para manejar el cambio de modelo
                  >
                    {delitos.map((tipo) => (
                      <IonSelectOption key={tipo} value={tipo}>
                        {tipo}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol>
                <IonItem>
                  <IonInput
                    label="Placa patente"
                    ref={async (cardRef) => {
                      if (cardRef) {
                        const input = await cardRef.getInputElement();
                        patenteMask(input);
                      }
                    }}
                    onIonInput={handlePatenteChange}
                    labelPlacement="stacked"
                    placeholder="Ingresa la placa patente de tu auto"
                    value={formData.patente} // Asegúrate de enlazar el valor al estado
                  //onIonInput={(e) => setFormData({ ...formData, patente: patenteInicio })}
                  ></IonInput>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol>
                <IonItem>
                  <IonTextarea
                    label="Descripcion"
                    labelPlacement="stacked"
                    placeholder="Ingrese una breve descripción del siniestro (opcional)"
                    value={formData.descripcion}
                    onIonInput={handleDescripcionChange} // Utilizar la función para manejar el cambio de modelo
                  >
                  </IonTextarea>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow class="ion-justify-content-center">
              <IonCol>
                <IonItem>
                  <IonRow style={{ flex: "auto" }}>
                    <IonCol size="3">
                      <p className="title_mapa">Lugar del siniestro</p>
                    </IonCol>
                    <IonCol size="9">
                      <IonButton className="btn-ghost">
                        <IonText>Arrastra el marcador a la ubicacion del robo</IonText>
                      </IonButton>
                    </IonCol>

                  </IonRow>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonItem className="mapa-alertar">

              <div id="map-container-2" className="map-container">
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
                    icon={customMarkerIcon}
                    eventHandlers={{
                      dragend: handleMarkerDrag,
                    }}
                    ref={markerRef}
                  >
                  </Marker>
                </MapContainer>
              </div>

              <IonButton className="fab-button locateRefTab3" onClick={locateAndZoomToMarker}>
                <IonIcon icon={mapOutline} />
              </IonButton>

              <IonButton className="fab-button" onClick={handleObtenerUbicacionActual}>
                <IonIcon icon={locate} />
              </IonButton>

            </IonItem>
          </div>
          <IonRow class="ion-justify-content-end">
            <IonText class="sayc-text">
              <p>SAYC - Seguridad Automotriz y Conductores</p>
            </IonText>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonButton fill="solid" onClick={handleEnviarAlerta}>
              Envía tu alerta
            </IonButton>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Alertar;

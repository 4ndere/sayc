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
  IonAvatar,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import Alert from "../../components/Alert/Alert";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useState, useEffect } from "react";
import { doc, setDoc, getDocs, collection } from "firebase/firestore";
import { chevronBack } from "ionicons/icons";
import { useMaskito } from "@maskito/react";
import firestore from "../../firebaseConfig";
import { getFirestore } from "firebase/firestore";
import "./Registro.scss";

const Registro = () => {
  const db = getFirestore();
  const history = useHistory();

  const handleIrAInicio = () => {
    history.push("/login");
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rpassword, setRPassword] = useState("");
  const [regiones, setRegiones] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [ubiData, setUbidata] = useState({
    region: "",
    ciudad: "",
    telefono: "",
  });

  // UseState De mensaje alerta
  const [tituloAlerta, setTituloAlerta] = useState("");
  const [mensajeAlerta, setMensajeAlerta] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  // mascara telefono 
  const telefonoMask = useMaskito({
    options: {
      mask: ["+", "5", "6", " ", "9", " ", /\d/, /\d/, /\d/, /\d/, " ", /\d/, /\d/, /\d/, /\d/],
    },
  });

  const isPasswordValid = (password) => {
    // return password.length >= 6;
    // Inicializar el mensaje como nulo
    let msg = null;

    // Verificar si la contraseña tiene al menos 6 caracteres
    if (password.length < 6) {
      msg = "La contraseña debe tener más de 6 caracteres";
    } else if (!/\d/.test(password)) {
      msg = "La contraseña debe incluir al menos un número";
    } else if (!/[A-Z]/.test(password)) {
      msg = "La contraseña debe incluir al menos una letra mayúscula";
    } else if (!/[a-z]/.test(password)) {
      msg = "La contraseña debe incluir al menos una letra minúscula";
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      msg = "La contraseña debe incluir al menos un símbolo";
    }

    // Devolver un objeto con el resultado y el mensaje
    return {
      isValid: msg === null,
      message: msg,
    };
  };

  //FUNCION PARA REGISTRAR AL USUARIO
  const handleRegister = () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (rpassword === password) {

      const passwordValidationResult = isPasswordValid(password);

      if (passwordValidationResult.isValid) {
        createUserWithEmailAndPassword(auth, email, password)
          .then((userCredential) => {
            // El usuario ha sido creado exitosamente
            const user = userCredential.user;
            console.log("Usuario registrado correctamente");


            //FUNCION QUE AGREGA EL ID DEL USUARIO CREADO A LA COLECCION AMIGOS
            const uid = user.uid;
            const amigosRef = doc(collection(db, "amigos"), uid);
            const notificacionesRef = doc(collection(db, "notificaciones"), uid);
            const ubicacionesRef = doc(collection(db, "datosUsuarios"));
            try {
              const telefonoSinFormato = ubiData.telefono.replace(/[+\s-]/g, "");

              setDoc(amigosRef, {
                email: user.email,
                id: uid
              });
              setDoc(ubicacionesRef, {
                region: ubiData.region,
                ciudad: ubiData.ciudad,
                telefono: telefonoSinFormato,
                userId: uid
              });
              setDoc(notificacionesRef, {
                email: user.email,
                userId: uid,
              });
            } catch (error) {
              console.error(
                "Error al agregar el documento a la colección 'amigos'",
                error
              );
            }
            // Realizar otras operaciones después de iniciar el registro
            history.push("/login");
          })
          .catch((error) => {
            setTituloAlerta("Correo")
            setMensajeAlerta("Ingresa un correo valido para registrar")
            setShowAlert(true)
          });
      } else {
        setTituloAlerta("Contraseña invalida")
        setMensajeAlerta(passwordValidationResult.message);
        setShowAlert(true)

      }
    } else {
      setTituloAlerta("Contraseña invalida")
      setMensajeAlerta("Las contraseña deben ser iguales")
      setShowAlert(true)
      console.log(ubiData.telefono)
    }
  };

  // OBTENER UBICACION
  useEffect(() => {
    obtenerUbicacion();
  }, []); // Agregamos un arreglo vacío para que useEffect solo se ejecute una vez al montar el componente

  const obtenerUbicacion = async () => {
    try {
      const ubicacionesCollection = firestore.collection("ubicaciones");
      const ubicacionesSnapshot = await ubicacionesCollection.get();
      const regionesData = [];

      ubicacionesSnapshot.forEach((doc) => {
        const region = doc.data().region;
        const ciudades = doc.data().ciudades;

        regionesData.push({
          id: doc.id,
          region: region,
          ciudades: ciudades
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
    setUbidata({ ...ubiData, region: regionSeleccionada, ciudad: "" });
  };

  const handleCiudadChange = (e) => {
    const ciudadSeleccionada = e.target.value;
    setUbidata({ ...ubiData, ciudad: ciudadSeleccionada });
  };

  const handleTelefonoChange = (e) => {
    const telefonoIngresado = e.target.value;
    setUbidata({ ...ubiData, telefono: telefonoIngresado });
  };

  return (
    <IonPage id="registro">
      <IonContent fullscreen>
        <Alert
          titulo={tituloAlerta}
          mensaje={mensajeAlerta}
          boton="Aceptar"
          showAlert={showAlert}
          setShowAlert={setShowAlert}
        />
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
        <IonAvatar>
          <ion-text>
            <h1>Regístrate</h1>
          </ion-text>
        </IonAvatar>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            <IonCol>
              <IonItem>
                <IonInput
                  id="ion-input-correo"
                  label="Correo"
                  labelPlacement="stacked"
                  placeholder="Ingrese aquí su correo"
                  type="email"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value)}
                ></IonInput>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol>
              <IonItem>
                <IonInput
                  id="ion-input-pass"
                  label="Contraseña"
                  labelPlacement="stacked"
                  placeholder="Ingrese aquí su contraseña"
                  type="password"
                  required={true}
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value)}
                  className={
                    isPasswordValid(password) ? "ion-valid" : "ion-invalid"
                  }
                ></IonInput>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol>
              <IonItem>
                <IonInput
                  id="ion-input-rpass"
                  label="Repite tu contraseña"
                  labelPlacement="stacked"
                  placeholder="Ingrese aquí su contraseña"
                  type="password"
                  value={rpassword}
                  onIonInput={(e) => setRPassword(e.detail.value)}
                ></IonInput>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonCol>
              <IonItem>
                <IonSelect
                  aria-label="Region"
                  interface="popover"
                  placeholder="Seleccione una region"
                  value={ubiData.region}
                  onIonChange={handleRegionChange}
                >
                  <IonSelectOption value="">
                    Selecciona una region
                  </IonSelectOption>
                  {regiones.map((region) => (
                    <IonSelectOption key={region.id} value={region.region}>
                      {region.region}
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
                  aria-label="Ciudad"
                  interface="popover"
                  placeholder="Seleccione su ciudad"
                  value={ubiData.ciudad}
                  onIonChange={handleCiudadChange} // Utilizar la función para manejar el cambio de modelo
                >
                  {ciudades.map((ciudad) => (
                    <IonSelectOption key={ciudad} value={ciudad}>
                      {ciudad}
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
                  id="ion-input-telefono"
                  label="Telefono"
                  ref={async (cardRef) => {
                    if (cardRef) {
                      const input = await cardRef.getInputElement();
                      telefonoMask(input);
                    }
                  }}
                  labelPlacement="stacked"
                  placeholder="Ingrese aquí su numero (ej: 9 8765 4321)"
                  value={ubiData.telefono}
                  onIonInput={handleTelefonoChange}
                ></IonInput>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow class="ion-justify-content-end">
            <IonText class="sayc-text">
              <p>SAYC - Seguridad Automotriz y Conductores</p>
            </IonText>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonButton fill="solid" onClick={handleRegister}>
              Registrarse en SAYC
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
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Registro;

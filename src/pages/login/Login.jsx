import {
  IonContent,
  IonPage,
  IonButton,
  IonInput,
  IonItem,
  IonText,
  IonImg,
  IonCol,
  IonGrid,
  IonRow,
  IonAvatar,
} from "@ionic/react";
import Alert from "../../components/Alert/Alert";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useHistory } from "react-router-dom";
import { React, useState } from "react";
import "./Login.scss";
import firestore from "../../firebaseConfig"
import firebase from "firebase/compat/app";

const Login = ({ setIsAuthenticated }) => {
  const history = useHistory();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showAlert, setShowAlert] = useState(false);

  const handleSignIn = () => {
    const auth = getAuth();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Usuario ha iniciado sesión exitosamente
        const user = userCredential.user;
        console.log("Usuario autenticado correctamente!");
        // Realizar otras operaciones después de iniciar sesión
        setIsAuthenticated(true);
        history.push("/inicio");
        setEmail('')
        setPassword('')
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // console.error("Error al iniciar sesión:", errorCode, errorMessage);
        setShowAlert(true);

      });
  };

  const handleRedireccion = () => {
    history.push("/registro");
    setEmail('')
    setPassword('')
  };

  const handleRecuperarContra = () => {
    history.push("/recuperar-contrasena");
  };


  // Datos a subir
  const nuevosModelos = [
    "ARX-02",
    "ARX-06",
    "CL-X",
    "ARX-01",
    "CSX",
    "Legend",
    "MDX",
    "NSX",
    "RDX",
    "RL",
    "RSX",
    "TL",
    "TLX",
    "TSX"
  ];

  const agregarModelos = async () => {
    try {
      // Utiliza arrayUnion para agregar nuevos modelos sin duplicados
      await firestore.collection('autos').doc('1GDvgcmvi86oQAVQ5ji9').update({
        modelos: firebase.firestore.FieldValue.arrayUnion(...nuevosModelos)
      });

      console.log('Modelos agregados correctamente.');
    } catch (error) {
      console.error('Error al agregar modelos:', error);
    }
  };

  const agregarModeloOtro = async () => {
    const autosCollection = firebase.firestore().collection('autos');
    const nuevoModelo = 'Otro';

    try {
      const querySnapshot = await autosCollection.get();

      querySnapshot.forEach(async (doc) => {
        const modelosActuales = doc.data().modelos || [];

        if (!modelosActuales.includes(nuevoModelo)) {
          await autosCollection.doc(doc.id).update({
            modelos: [...modelosActuales, nuevoModelo]
          });
          console.log(`Modelo 'Otro' agregado a ${doc.id}`);
        } else {
          console.log(`Modelo 'Otro' ya presente en ${doc.id}`);
        }
      });
    } catch (error) {
      console.error('Error al obtener documentos de la colección autos:', error);
    }
  };


  return (
    <IonPage id="login">
      <IonContent fullscreen>
        <Alert
          titulo="Credenciales invalidas"
          mensaje="El correo o contraseña que ingresaste son invalidos"
          boton="Aceptar"
          showAlert={showAlert}
          setShowAlert={setShowAlert}
        />
        <span className="fondo_logo_login">
          <IonImg
            src="images/fondo_login.png"
            alt="The Wisconsin State Capitol building in Madison, WI at night"
          ></IonImg>
          <IonAvatar>
            <IonText>
              <h1>SAYC</h1>
            </IonText>
          </IonAvatar>
        </span>
        <IonGrid>
          <IonRow class="ion-justify-content-center">
            <IonCol>
              <IonItem>
                <IonInput
                  label="Correo"
                  labelPlacement="stacked"
                  placeholder="Ingrese aquí su correo"
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
                  label="Contraseña"
                  labelPlacement="stacked"
                  type="password"
                  placeholder="Ingrese aquí su contraseña"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value)}
                ></IonInput>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow
            class="ion-justify-content-end"
            onClick={handleRecuperarContra}
          >
            <ion-text>
              <p>
                ¿Olvidaste tu contraseña? - <strong>Recuperala aquí</strong>
              </p>
            </ion-text>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <IonButton fill="solid" onClick={handleSignIn}>
              Inicia sesión en Sayc
            </IonButton>
          </IonRow>
          <IonRow class="ion-justify-content-center">
            <ion-text onClick={handleRedireccion}>
              <p>
                ¿No tienes una cuenta en SAYC? -{" "}
                <strong>Regístrate aquí</strong>
              </p>
            </ion-text>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;

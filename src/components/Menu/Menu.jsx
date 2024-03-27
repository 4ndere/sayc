import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenu,
  IonMenuButton,
  IonAvatar,
  IonTitle,
  IonToolbar,
  IonCol,
  IonGrid,
  IonRow,
  IonButton,
  IonItem,
  IonLabel,
  IonList,
  IonMenuToggle,
  IonIcon,
} from "@ionic/react";
import { notifications } from "ionicons/icons";
import { useState, useEffect } from "react";
import "./Menu.scss";
import { React } from "react";
import { getAuth, signOut } from "firebase/auth";
import { useHistory, useLocation } from "react-router-dom";

function Menu({ setIsAuthenticated }) {
  const auth = getAuth();
  const user = auth.currentUser;
  const [path, setPath] = useState("");
  const [email, setEmail] = useState("");
  const location = useLocation();
  const history = useHistory();

  const handleSingOut = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        console.log("Cerrado sesion okk");
        setIsAuthenticated(false);
        setEmail(null);
        history.push("/login");
      })
      .catch((error) => {
        console.log(error);
      });
    const menu = document.querySelector("ion-menu");
    menu && menu.close();
  };

  useEffect(() => {
    const updateTitle = () => {
      const pathname = location.pathname;
      const newPathname = pathname.slice(1);
      setPath(newPathname);
      document.title = newPathname;
    };

    updateTitle();

    // Limpia el listener cuando el componente se desmonta
    return () => {};
  }, [location]);

  useEffect(() => {
    if (user !== null) {
      const email = user.email;
      setEmail(email);
    } else {
      setEmail[null];
    }
  }, [user]);

  const handleActive = (route) => {
    return route === `/${path}` ? "route-active" : "";
  };

  return (
    <>
      <IonMenu side="end" contentId="main-content">
        <IonHeader>
          <IonToolbar className="menu-toolbar">
            <IonRow>
              <img src="images/logo.png" alt="" />
              <IonTitle>SAYC - SEGURIDAD</IonTitle>
            </IonRow>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <hr />
          <IonRow className="ion-padding">
            <IonCol size="3">
              <IonAvatar>
                <img
                  className="img-avatar"
                  alt="Silhouette of a person's head"
                  src="https://ionicframework.com/docs/img/demos/avatar.svg"
                />
              </IonAvatar>
            </IonCol>
            <IonCol size="9">
              <p>
                <strong>{email}</strong>
              </p>
            </IonCol>
          </IonRow>
          <IonList lines="none">
            <IonMenuToggle>
              <IonItem routerLink="/Inicio" className={handleActive("/Inicio")}>
                <IonLabel>Inicio</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonMenuToggle>
              <IonItem
                routerLink="/Alertas-recibidas"
                className={handleActive("/Alertas-recibidas")}
              >
                <IonLabel>Alertas</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonMenuToggle>
              <IonItem routerLink="/tab3" className={handleActive("/tab3")}>
                <IonLabel>Mapa</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonMenuToggle>
              <IonItem routerLink="/Amigos" className={handleActive("/Amigos")}>
                <IonLabel>Amigos</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonMenuToggle>
              <IonItem routerLink="/Notificaciones" className={handleActive("/Notificaciones")}>
                <IonLabel>notificaciones</IonLabel>
              </IonItem>
            </IonMenuToggle>
            <IonItem>
              <IonMenuToggle>
                <IonLabel>Viaje seguro</IonLabel>
              </IonMenuToggle>
            </IonItem>
          </IonList>
          <IonButton onClick={handleSingOut} menuToggle>
            Cerrar Sesión
          </IonButton>
        </IonContent>
      </IonMenu>
      <IonHeader id="main-content">
        <IonToolbar className="custom-toolbar">
          <IonGrid>
            <IonRow>
              <IonCol>
                <IonItem routerLink="/Notificaciones">
                <IonAvatar>
                  <IonIcon icon={notifications} />
                </IonAvatar>
                </IonItem>
              </IonCol>
              <IonCol>
                <IonRow className="ion-align-items-center title-bar">
                  <IonTitle className="ion-text-center">{path}</IonTitle>
                </IonRow>
              </IonCol>
              <IonCol>
                <IonRow className="ion-align-items-center title-bar ion-justify-content-end">
                  <IonButtons>
                    <IonMenuButton></IonMenuButton>
                  </IonButtons>
                </IonRow>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>
    </>
  );
}
export default Menu;

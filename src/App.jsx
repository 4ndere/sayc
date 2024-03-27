import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { useState } from "react";
import { grid, personAdd, map, home } from "ionicons/icons";

/* Compomemtes Globales*/
import Menu from "./components/Menu/Menu";

/* Páginas */
import Login from "./pages/login/Login";
import Registro from "./pages/login/Registro";
import RecuperarCon from "./pages/login/RecuperarCon";
import RevisaCorreo from "./pages/login/RevisaCorreo";
import Tab1 from "./pages/Tab1";
import Tab2 from "./pages/Tab2";
import Tab3 from "./pages/Tab3";
import Tab4 from "./pages/Tab4";
import Alertar from "./pages/RealizarAlerta/RealizarAlerta";
import Notificaciones from "./pages/Notificaciones/Notificaciones";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/* Leaflet CSS for Map */
import "leaflet/dist/leaflet.css";

/* Theme variables */
import "./theme/variables.css";

setupIonicReact({
  rippleEffect: false,
  mode: "md",
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const currentPath = window.location.pathname;

  return (
    <IonApp>
      <IonReactRouter>
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/" render={() => <Redirect to="/login" />} />
            <Route
              path="/login"
              render={(props) => (
                <Login {...props} setIsAuthenticated={setIsAuthenticated} />
              )}
            />
            <Route path="/registro" component={Registro} />
            <Route path="/recuperar-contrasena" component={RecuperarCon} />
            <Route path="/revisa-tu-correo" component={RevisaCorreo} />
            <Route
              path="/Inicio"
              render={() =>
                isAuthenticated ? <Tab1 /> : <Redirect to="/login" />
              }
            />
            <Route
              path="/Alertas-recibidas"
              render={() =>
                isAuthenticated ? <Tab2 /> : <Redirect to="/login" />
              }
            />
            <Route
              path="/Mapa-delitos"
              render={() =>
                isAuthenticated ? <Tab3 /> : <Redirect to="/login" />
              }
            />
            <Route
              path="/Amigos"
              render={() =>
                isAuthenticated ? <Tab4 /> : <Redirect to="/login" />
              }
            />
            <Route
              path="/alertar"
              render={() =>
                isAuthenticated ? <Alertar /> : <Redirect to="/login" />
              }
            />
            <Route
              path="/Notificaciones"
              render={() =>
                isAuthenticated ? <Notificaciones /> : <Redirect to="/login" />
              }
            />
          </IonRouterOutlet>

          <IonTabBar
            slot="bottom"
            style={{ display: isAuthenticated && !currentPath.startsWith("/alertar") ? "flex" : "none" }}
          >
            <IonTabButton tab="tab1" href="/Inicio">
              <IonIcon aria-hidden="true" icon={home} />
              <IonLabel>Inicio</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab2" href="/Alertas-recibidas">
              <IonIcon aria-hidden="true" icon={grid} />
              <IonLabel>Alertas</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab3" href="/Mapa-delitos">
              <IonIcon aria-hidden="true" icon={map} />
              <IonLabel>Mapa</IonLabel>
            </IonTabButton>
            <IonTabButton tab="tab4" href="/Amigos">
              <IonIcon aria-hidden="true" icon={personAdd} />
              <IonLabel>Amigos</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>

        {isAuthenticated ? (
          <Menu setIsAuthenticated={setIsAuthenticated}></Menu>
        ) : null}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

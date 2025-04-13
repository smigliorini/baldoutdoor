import {
	useIonViewDidEnter,
	useIonToast,
	IonFab,
	IonIcon,
	IonFabButton,
} from "@ionic/react";
import { TileLayer, useMap, Marker, Popup, LayersControl } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import locationIcon from "../assets/images/location-sharp.svg";
import "../assets/leaflet/leaflet.css";
import { ConnectionStatus, Network } from "@capacitor/network";
import { Device } from "@capacitor/device";
import { Preferences } from "@capacitor/preferences";
import { Geolocation, Position } from "@capacitor/geolocation";
import { Capacitor } from "@capacitor/core";
import {
	findCenter,
	fetchTourList,
	fetchPOIList,
	fetchEventList,
} from "../components/Functions";
import { LOCATION_BOUNDS, LANGUAGES } from "../configVar";
import { POI, Event, Tour, TourDetails } from "../types/app_types";
import { i18n } from "i18next";
import '../assets/i18n'
import POIMarker from "./POIMarker";
import EventMarker from "./EventMarker"
import { footsteps } from "ionicons/icons";
import eventIcon from "../assets/images/bx-calendar-event.svg"
import TourListModal from "../modals/TourListModal";
import EventListModal from "../modals/EventListModal";
import FilterFab from "./FilterFab";
import TourOnMap from "./TourOnMap";
import SearchModal from "../modals/SearchModal";


var POIListData: POI[];
var EventListData: Event[];
const onlineBounds = L.latLngBounds(
	[46.82405708134416, 10.194074757395123],
	[44.73066988557427, 13.193342264225922]
);
const offlineBounds = L.latLngBounds([45.573050509734514, 10.671711461949524], [45.86869728276334, 11.043187786274109]);
const locationBounds = L.latLngBounds(LOCATION_BOUNDS);
const { BaseLayer } = LayersControl;
var watchId: string;
var deviceLanguage: string;
var tourListData: Tour[];

function MapChild(props: {
	centerPosition: boolean;
	setCenterPosition: (arg0: boolean) => void;
	i18n: i18n;
	filterFabRef: React.RefObject<HTMLIonFabElement>;
	showSearchModal: boolean;
	setShowSearchModal: (arg0: boolean) => void;
}) {
	const [naturalValenceFilter, setNaturalValenceFilter] = useState<boolean>(true); // Variabile che indica se mostrare sulla gli art di valenza naturale
	const [hisCultValenceFilter, setHisCultValenceFilter] = useState<boolean>(true); // Variabile che indica se mostrare sulla mappa gli art di valenza storico/culturale
	const [activityFilter, setActivityFilter] = useState<boolean>(true); // Variabile che indica se mostrare sulla mappa le attivita'
	const [eventFilter, setEventFilter] = useState<boolean>(true); // Variabile che indica se mostrare sulla mappa gli eventi
	const [dataObtained, setDataObtained] = useState<boolean>(false); // Indica se possiedo la lista dei punti di interesse con le loro coordinate (caricati dalla memoria oppure scaricati dal webserver)
	const [dataEventObtained, setEventDataObtained] = useState<boolean>(false); // Indica se possiedo la lista degli eventi con le loro coordinate (caricati dalla memoria oppure scaricati dal webserver)
	const [downloadedData, setDownloadedData] = useState<boolean>(false); // Indica se la lista dei punti di interesse sono stati scaricati dal webserver
	const [downloadedEventData, setDownloadedEventData] = useState<boolean>(false); // Indica se la lista degli eventi sono stati scaricati dal webserver
	const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
		// Stato della connessione del dispositivo
		connected: true,
		connectionType: "none",
	});
	const [position, setPosition] = useState<Position>(); // Posizione dell'utente
	const [permissionGranted, setPermissionGranted] = useState<boolean>(false); // Indica se si ha il permesso di ottenere la posizione dell'utente
	const [showLocationMarker, setShowLocationMarker] = useState<boolean>(false); // Indica se mostrare il marker della posizione dell'utente
	const [tourDetails, setTourDetails] = useState<TourDetails | undefined>(undefined); // Indica se la mappa del tour è aperta
	const [showTourListModal, setShowTourListModal] = useState<boolean>(false); // Mostra la modale con la lista dei tour
	const [showEventListModal, setShowEventListModal] = useState<boolean>(false); // Mostra la modale con la lista degli eventi
	const mapComponent = useMap();
	const [presentToast] = useIonToast();

	function setCenterData(POIList?: POI[]) {
		if (POIList && mapComponent) {
			mapComponent.panTo(findCenter(POIList));
		} else if (POIListData && mapComponent) {
			mapComponent.panTo(findCenter(POIListData));
		}
	}

	function setOfflineBounds() {
		mapComponent.setMaxBounds(offlineBounds);
	}

	function setOnlineBounds() {
		mapComponent.setMaxBounds(onlineBounds);
	}

	/**
	 * Se lutente ha già dato il permesso di ottenere la posizione, viene richiamata questa funzione quando viene
	 * premuto il pulsante di posizione. Viene centrata la mappa sulla posizione dell'utente e si tiene
	 * aggiornato il marker della posizione dell'utente.
	 */
	function setCenterPosition() {
		if (permissionGranted) {
			Geolocation.getCurrentPosition({
				enableHighAccuracy: true,
				maximumAge: 0,
			}).then((pos) => {
				if (pos) {
					let posll = L.latLng(pos.coords.latitude, pos.coords.longitude);
					if (locationBounds.contains(posll)) {
						mapComponent.panTo(posll);
						Geolocation.watchPosition(
							{ enableHighAccuracy: true },
							updateUserPosition
						).then((id) => (watchId = id));
					} else {
						Geolocation.clearWatch({ id: watchId });
						setShowLocationMarker(false);
						presentToast({
							message: props.i18n.t("user_not_in_baldo"),
							duration: 5000,
						});
					}
				}
				})
			.catch(() => {
				presentToast({
					message: props.i18n.t("enable_geolocation"),
					duration: 5000,
				});
			});
		} else {
			checkLocationPermission();
		}
		props.setCenterPosition(false);
	}

	/**
	 * Funzione che permette di aggiornare la posizione dell'utente, se l'utente è fuori dal bound della zona di Monte Baldo
	 * non viene più aggiornata la posizione dell'utente
	 * @param pos Posizione dell'utente
	 */
	function updateUserPosition(pos: Position | null) {
		if (pos) {
			setPosition(pos);
			let posll = L.latLng(pos.coords.latitude, pos.coords.longitude);
			if (!locationBounds.contains(posll)) {
				Geolocation.clearWatch({ id: watchId });
				setShowLocationMarker(false);
			} else setShowLocationMarker(true);
		}
	}

	/**
	 * Funzione che controlla se l'utente ha dato il permesso di ottenere la posizione,
	 * se non ha dato alcuna preferenza viene mostrato un alert per chiedere il permesso
	 */
	async function checkLocationPermission() {
		try {
			const { location } = await Geolocation.requestPermissions();
			if (location === "granted") {
				setPermissionGranted(true);
				Geolocation.watchPosition(
					{ enableHighAccuracy: true },
						updateUserPosition
					).then((id) => (watchId = id));
			} else {
				presentToast({
					message: props.i18n.t("geopermissions_disabled"),
					duration: 5000,
				});
			}
		} catch {
			if (Capacitor.isNativePlatform()) {
				presentToast({
					message: props.i18n.t("enable_geolocation"),
					duration: 5000,
				});
			} else {
				presentToast({
					message: "Not implemented on web.",
					duration: 5000,
				});
				console.log("Not implemented on web.");
			}
		}
	}

	/**
	 * Funzione invocata quando viene creato il componente
	 */
	useIonViewDidEnter(() => {
		// Ridisegna la mappa, senza questa funzione non viene mostrata correttamente la mappa
		mapComponent.invalidateSize();

		// Recupera la lingua scelta precedentemente e salvata, oppure quella del dispositivo, oppure quella di default
		Preferences.get({ key: "languageCode" }).then((result) => {
			if (result.value !== null) {
				props.i18n.changeLanguage(result.value);
			} else {
				Device.getLanguageCode().then((lang) => {
					deviceLanguage = lang.value;
					if (LANGUAGES.includes(deviceLanguage)) {
						props.i18n.changeLanguage(deviceLanguage);
					}
				});
			}
		});

		checkLocationPermission();

		/**
		 * Controlla se l'utente è online o offline
		 * Nel primo caso, viene caricata la lista dei punti di interesse e degli eventi e salvata in locale
		 * Nel secondo caso, viene caricata la lista dei punti di interesse e degli eventi salvata in locale se possibile
		 */
		Network.getStatus().then((netStatus) => {
			setConnectionStatus(netStatus);
			Preferences.get({ key: "baseData" }).then((result) => {
				if (result.value !== null) {
					POIListData = JSON.parse(result.value);
					setDataObtained(true);
					setOnlineBounds();
				}
			});

			Preferences.get({ key: "baseEventData" }).then((result) => {
				if (result.value !== null) {
					EventListData = JSON.parse(result.value);
					setEventDataObtained(true);
				}
			});

			if (netStatus.connected) {
				getList();
				getEventList();
			} else {
				setOfflineBounds();
				presentToast({
					/*buttons: [{ text: "hide", handler: () => dismissToast() }],*/
					message: props.i18n.t("user_offline"),
					duration: 5000,
				});
			}
		});
	});

	/**
	 * Intercetta il cambiamento dello stato della connessione, se l'utente torna online,
	 * si ricarica la lista dei punti di interesse e cambia i limiti della mappa, altrimenti
	 * si mostra un toast che indica che l'utente non è connesso a internet
	 */
	Network.addListener("networkStatusChange", (status) => {
		console.log("Network status changed", status);
		if (status.connected) {
			getList();
			getEventList();
			setOnlineBounds();
		} else {
			setOfflineBounds();
			presentToast({
				message: props.i18n.t("user_offline"),
				duration: 5000,
			});
		}
		setConnectionStatus(status);
	});

	/**
	 * Scarica la lista dei POI dal server e li salva in locale
	 */
	function getList() {
		if (downloadedData) return;
		fetchPOIList((poiList: POI[]) => {
			POIListData = poiList;
			Preferences.set({
				key: "baseData",
				value: JSON.stringify(POIListData),
			});
			setDownloadedData(true);
			setDataObtained(false);
			setDataObtained(true);
		});
	}

	/**
	 * Scarica la lista degli Event dal server e li salva in locale
	 */
	function getEventList() {
		if (downloadedEventData) return;
		fetchEventList((eventList: Event[]) => {
			EventListData = eventList;
			Preferences.set({
				key: "baseEventData",
				value: JSON.stringify(EventListData),
			});
			setDownloadedEventData(true);
			setEventDataObtained(false);
			setEventDataObtained(true);
		});
	}

	/** Richiedi al server la lista dei tour */
	function getTourList() {
		if (connectionStatus.connected) {
			if (tourListData === undefined) {
				fetchTourList((tourList: Tour[]) => {
					tourListData = tourList;
					setShowTourListModal(true);
				});
			} else {
				setShowTourListModal(true);
			}
		} else {
			presentToast({
				message: props.i18n.t("user_offline"),
				duration: 5000,
			});
		}
	}

	return (
		<>
		{/* Filtro dei marker */}
		{!tourDetails && dataObtained && (
			<FilterFab
				i18n={props.i18n}
				fabRef={props.filterFabRef}
				naturalValenceFilter={naturalValenceFilter}
				setNaturalValenceFilter={setNaturalValenceFilter}
				hisCultValenceFilter={hisCultValenceFilter}
				setHisCultValenceFilter={setHisCultValenceFilter}
				activityFilter={activityFilter}
				setActivityFilter={setActivityFilter}
				eventFilter={eventFilter}
				setEventFilter={setEventFilter}
			/>
		)}

		{/* Pulsante per aprire la lista di itinerari */}
		{!tourDetails && (
			<IonFab
				vertical="top"
				horizontal="end"
				className="tours"
				onClick={() => {
					getTourList();
				}}
			>
				<IonFabButton
					className="te-ion-fab-button"
					data-desc={ props.i18n.t("tours") }
				>
					<IonIcon icon={ footsteps } />
				</IonFabButton>
			</IonFab>
		)}

		{/* Pulsante per aprire la lista degli eventi */}
		{dataEventObtained && !tourDetails && (
			<IonFab
				vertical="top"
				horizontal="end"
				className="events"
				onClick={() => {
					setShowEventListModal(true);
				}}
			>
				<IonFabButton
					className="te-ion-fab-button"
					data-desc={ props.i18n.t("search_events") }
				>
					<IonIcon icon={ eventIcon } />
				</IonFabButton>
			</IonFab>
		)}

		{props.centerPosition && setCenterPosition()}

		{connectionStatus?.connected && (
			<LayersControl>
				<BaseLayer checked name="OpenStreetMap">
					<TileLayer
						attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
						url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
						maxZoom={17}
					/>
				</BaseLayer>
				<BaseLayer name="Satellite">
					<TileLayer
						attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
						url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
					/>
				</BaseLayer>
			</LayersControl>
		)}
		{!connectionStatus?.connected && (
			<TileLayer
				attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
				url="/tiles/{z}/{x}/{y}.png"
				maxZoom={16}
			/>
		)}

		{/* Marker della posizione corrente dell'utente */}
		{showLocationMarker && (
			<Marker
				position={[position!.coords.latitude, position!.coords.longitude]}
				icon={L.icon({
					iconUrl: locationIcon,
					iconSize: [40, 40], // size of the icon
				})}
			>
			<Popup>{props.i18n.t("user_position")}</Popup>
			</Marker>
		)}

		{/* Creazione dinamica dei marker dei POI */}
		{dataObtained && (
			<POIMarker
				POIListData={POIListData}
				i18n={props.i18n}
				naturalValenceFilter={naturalValenceFilter}
				hisCultValenceFilter={hisCultValenceFilter}
				activityFilter={activityFilter}
				setTourDetails={setTourDetails}
				connectionStatus={connectionStatus}
				POIIds={tourDetails?.properties.points_tour_id.split(",")}
				setMapCenter={setCenterData}
			/>
		)}

		{/* Creazione dinamica dei marker degli Event */}
		{dataEventObtained && !tourDetails && (
			<EventMarker
				EventListData={EventListData}
				i18n={props.i18n}
				eventFilter={eventFilter}
				connectionStatus={connectionStatus}
			/>
		)}

		{/* Creazione dinamica dei marker dei POI appartenenti all'itinerario */}
		{tourDetails && dataObtained && (
			<TourOnMap
				i18n={props.i18n}
				tourDetails={tourDetails}
				setTourDetails={setTourDetails}
			/>
		)}

		{showTourListModal && (
			<TourListModal
				openCondition={showTourListModal}
				onDismissConditions={setShowTourListModal}
				data={tourListData}
				i18n={props.i18n}
				setTourDetails={setTourDetails}
				closeAllModals={() => {
					setShowTourListModal(false);
				}}
			/>
		)}

		{showEventListModal && (
			<EventListModal
				openCondition={showEventListModal}
				onDismissConditions={setShowEventListModal}
				data={EventListData}
				i18n={props.i18n}
				closeAllModals={() => {
					setShowEventListModal(false);
				}}
			/>
		)}

		{props.showSearchModal && dataObtained && (
			<SearchModal
				openCondition={ props.showSearchModal }
				onDismissConditions={ props.setShowSearchModal }
				setTourDetails={ setTourDetails }
				i18n={ props.i18n }
				POIListData={ POIListData }
				EventListData={ EventListData }
				closeAllModals={() => {
					props.setShowSearchModal(false);
				}}
			/>
		)}
		</>
	);
}

export default MapChild;

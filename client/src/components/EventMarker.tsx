import { IonLabel, IonButton, IonLoading, useIonToast } from "@ionic/react";
import { Marker } from "react-leaflet";
import L from "leaflet";
import { i18n } from "i18next";
import { LanguageCode, Event, EventDetails, EventMedia } from "../types/app_types";
import eventIcon from "../assets/images/event.png"; // Icona attivita'
import { useState } from "react";
import EventModal from "../modals/EventModal";
import { ConnectionStatus } from "@capacitor/network";
import { fetchEventDetails, fetchEventMedia } from "./Functions";
import CustomPopup from "./CustomPopup";

var EventDetailsData: EventDetails;
var EventMediaData: EventMedia[];
var isLoading: boolean = false;

function EventMarker(props: {
	EventListData: Event[];
	i18n: i18n;
	eventFilter: boolean;
	connectionStatus: ConnectionStatus;
}) {
	const [showLoading, setShowLoading] = useState<boolean>(false); // Permette di mostrare il componente di caricamento
	const [showEventModal, setShowEventModal] = useState<boolean>(false); // Mostra la modale con i dettagli dell'evento
	const [presentToast] = useIonToast();

  	/**
   	* Vengono filtrati gli eventi e tolti quelli non appartenti alle tre categorie
   	*/
  	var data = props.EventListData.filter((element: Event) =>
		[
			props.i18n.t("cat_event_show", { lng: "it" }),
			props.i18n.t("cat_event_trip", { lng: "it" }),
			props.i18n.t("cat_meeting", { lng: "it" }),
		].includes(element.properties.category_it)
  	);

	/**
	 * Scarica i dettagli di un Event dal server
	 * @param id Identificatore del punto di interesse
	 */
	function getEventDetails(id: string) {
		if (props.connectionStatus.connected &&
			((EventDetailsData !== undefined && EventDetailsData.classid !== id) ||
			EventDetailsData === undefined)
		) {
			fetchEventDetails(id, (poi: EventDetails) => {
				EventDetailsData = poi;
				if (isLoading) {
					setShowEventModal(true);
				}
			});
			fetchEventMedia(id, (media: EventMedia[]) => {
				EventMediaData = media;
			})
		}
	}

	/**
	 * Funzione che apre la modale di dettaglio dell'evento selezionato
	 * @param id Identificatore del punto di cui si vogliono i dettagli
	 */
	function openModal(id: string) {
		if (props.connectionStatus.connected) {
			if (EventDetailsData !== undefined && EventDetailsData.classid === id) {
				setShowEventModal(true);
				isLoading = false;
			} else {
				setShowLoading(true);
				isLoading = true;
			}
		} else {
			presentToast({
				message: props.i18n.t("user_offline"),
				duration: 5000,
			});
		}
	}

	/**
	 * Restituisce la variabile del filtro in base alla categoria dell'evento
	 * @param category Categoria del Event
	 * @returns Filtro della categoria
	 */
	const filter = (category: string) => {
		if (category === props.i18n.t("cat_event_show", { lng: "it" })) {
			return props.eventFilter;
		} else if (category === props.i18n.t("cat_event_meeting", { lng: "it" })) {
			return props.eventFilter;
		} else if (category === props.i18n.t("cat_event_trip", { lng: "it" })) {
			return props.eventFilter;
		}
	};

	const lang_code: LanguageCode = props.i18n.language as LanguageCode;

	/**
	 * Crea il marker dell'evento con il relativo popup
	 */
	const listMarkers = data.map((element: Event) => (
		<div key={element.properties.id_event}>
		{filter(element.properties.category_it) && (
			<Marker
				position={[
					element.geometry.coordinates[1],
					element.geometry.coordinates[0],
				]}
				icon={L.icon({
					iconUrl: eventIcon,
					iconSize: [30, 30], // size of the icon
				})}
			>
				<CustomPopup
					autoClose={false}
					onOpen={() => {
						getEventDetails(element.properties.id_event);
					}}
					minWidth={125}
					keepInView
				>
					<div style={{ textAlign: "center" }}>
					<IonLabel style={{ fontSize: "14px" }}>
						{element.properties[`name_${lang_code}`] !== null
						? element.properties[`name_${lang_code}`]
						: element.properties.name_en}
					</IonLabel>
					<br />
					<IonButton
						shape="round"
						fill="outline"
						size="small"
						onClick={() => openModal(element.properties.id_event)}
					>
						{props.i18n.t("details_button")}
					</IonButton>
					</div>
				</CustomPopup>
			</Marker>
		)}
		</div>
	));
	return (
		<>
		{listMarkers}
		{showLoading && (
			<IonLoading
				isOpen={showLoading}
				backdropDismiss={true}
				onDidDismiss={() => (isLoading = false)}
				spinner="circular"
			/>
		)}

		{/* Modal delle informazioni riguardanti il punto di interesse cliccato */}
		{showEventModal && (
			<EventModal
				openCondition={showEventModal}
				onPresent={() => {
					isLoading = false;
					setShowLoading(false);
				}}
				onDismissConditions={setShowEventModal}
				data={EventDetailsData}
				media={EventMediaData}
				i18n={props.i18n}
				closeAllModals={() => {
					setShowEventModal(false);
				}}
			/>
		)}
		</>
	);
}

export default EventMarker;

import {
	IonButtons,
	IonContent,
	IonHeader,
	IonIcon,
	IonImg,
	IonItem,
	IonLabel,
	IonList,
	IonModal,
	IonSearchbar,
	IonToolbar,
	useIonPopover,
} from "@ionic/react";
import { useState } from "react";
import {
	chevronBack,
	arrowBack,
	ellipsisHorizontal,
	ellipsisVertical,
} from "ionicons/icons";
import naturalValenceIcon from "../assets/images/natural_valence.svg"; // Icona arti di valenza naturale filtro
import hisCultValenceIcon from "../assets/images/his_cult_valence.svg"; // Icona art di valenza storico/culturale filtro
import activityIcon from "../assets/images/activity.svg"; // Icona attivita' filtro
import eventIcon from "../assets/images/bx-calendar-event.svg" // Icona evento filtro
import toolbarIcon from "../assets/images/logo.png";
import { i18n } from "i18next";
import PopoverList from "../components/PopoverList";
import { LanguageCode, POI, POIDetails, POIMedia, Event, EventDetails, EventMedia, TourDetails } from "../types/app_types";
import POIModal from "./POIModal";
import EventModal from "./EventModal";
import { fetchPOIDetails, fetchEventDetails, fetchPOIMedia, fetchEventMedia } from "../components/Functions";

var poi_details: POIDetails;
var poi_media: POIMedia[];
var event_details: EventDetails;
var event_media: EventMedia[];

function SearchModal(props: {
	openCondition: boolean;
	onDismissConditions: (arg0: boolean) => void;
	POIListData: POI[];
	EventListData: Event[];
	i18n: i18n;
	setTourDetails: (arg0: TourDetails) => void;
	closeAllModals: () => void;
}) {
	const [showPOIModal, setShowPOIModal] = useState<boolean>(false); // Mostra la modale con i dettagli del punto di interesse
	const [showEventModal, setShowEventModal] = useState<boolean>(false); // Mostra la modale con i dettagli del punto di interesse
	const [search, setSearch] = useState<boolean>(false); // Mostra o nascondi ricerca
	const [present, dismiss] = useIonPopover(PopoverList, {
		onHide: () => dismiss(),
	});
	const [searchText, setSearchText] = useState<string>(""); // Valore searchbar

	const lang_code: LanguageCode = props.i18n.language as LanguageCode;

	/**
	 * Vengono filtrati i POI e tolti quelli non appartenti alle tre categorie
	 */
	var data = props.POIListData.filter((element: POI) =>
		[
			props.i18n.t("cat_natural_valence", { lng: "it" }),
			props.i18n.t("cat_his_cult_valence", { lng: "it" }),
			props.i18n.t("cat_activity", { lng: "it" }),
		].includes(element.properties.category_it)
	).sort((a: POI, b: POI) =>
		a.properties.name_it.localeCompare(b.properties.name_it)
	);

	/**
	 * Vengono filtrati gli eventi e tolti quelli non appartenti alle tre categorie
	 */
	var dataEvent = props.EventListData.filter((element: Event) =>
		[
			props.i18n.t("cat_event_show", { lng: "it" }),
			props.i18n.t("cat_event_meeting", { lng: "it" }),
			props.i18n.t("cat_event_trip", { lng: "it" }),
		].includes(element.properties.category_it)
	).sort((a: Event, b: Event) =>
		a.properties.name_it.localeCompare(b.properties.name_it)
	);

	/**
	 * Restituisce l'icona corretta in base alla categoria del POI
	 * @param category Categoria del POI
	 * @returns Icona
	 */
	const icon = (category: string) => {
		if (category === props.i18n.t("cat_natural_valence", { lng: "it" })) {
			return naturalValenceIcon;
		} else if (category === props.i18n.t("cat_his_cult_valence", { lng: "it" })) {
			return hisCultValenceIcon;
		} else if (category === props.i18n.t("cat_activity", { lng: "it" })) {
			return activityIcon;
		} else if (category === props.i18n.t("cat_event_show", { lng: "it" })) {
			return eventIcon;
		} else if (category === props.i18n.t("cat_event_meeting", { lng: "it" })) {
			return eventIcon;
		} else if (category === props.i18n.t("cat_event_trip", { lng: "it" })) {
			return eventIcon;
		} 
	};

	const POIname = (POI: POI) => {
		return POI.properties[`name_${lang_code}`] !== null
			? POI.properties[`name_${lang_code}`]
			: POI.properties.name_en;
	};

	const Eventname = (Event: Event) => {
		return Event.properties[`name_${lang_code}`] !== null
			? Event.properties[`name_${lang_code}`]
			: Event.properties.name_en;
	}

	function FilterPOI() {
		const filteredPOI = data.filter((element: POI) => POIname(element).toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) >= 0);

		const listPOI = filteredPOI.map((POI: POI) => (
			<IonItem
				key={POI.properties.id_art}
				onClick={() =>
					{fetchPOIMedia(POI.properties.id_art, (media: POIMedia[]) => {
						poi_media = media;
					});
					fetchPOIDetails(POI.properties.id_art, (poi_data: POIDetails) => {
						poi_details = poi_data;
						setShowPOIModal(true);
					})}
				}
				button
				detail
			>
				<IonIcon
					icon={icon(POI.properties.category_it)}
					className="ion-margin-end"
				/>
				<IonLabel>{POIname(POI)}</IonLabel>
			</IonItem>
		));

		return <IonList>{ listPOI }</IonList>;
	}

	function FilterEvent() {
		const filteredEvent = dataEvent.filter((element: Event) => Eventname(element).toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) >= 0);

		const listEvent = filteredEvent.map((Event: Event) => (
			<IonItem
				key={ Event.properties.id_event }
				onClick={() =>
					{fetchEventMedia(Event.properties.id_event, (media: EventMedia[]) => {
						event_media = media;
					});
					fetchEventDetails(Event.properties.id_event, (event_data: EventDetails) => {
						event_details = event_data;
						setShowEventModal(true);
					})}
				}
				button
				detail
			>
			<IonIcon
				icon={ icon(Event.properties.category_it) }
				className="ion-margin-end"
			/>
			<IonLabel>{ Eventname(Event) }</IonLabel>
			</IonItem>
		));

		return <IonList>{ listEvent }</IonList>;
	}

	/**
	 * Crea la lista di POI
	 */
	const listPOI = data.map((POI: POI) => (
		<IonItem
			key={POI.properties.id_art}
			onClick={() =>
				{fetchPOIMedia(POI.properties.id_art, (media: POIMedia[]) => {
					poi_media = media;
				});
				fetchPOIDetails(POI.properties.id_art, (poi_data: POIDetails) => {
					poi_details = poi_data;
					setShowPOIModal(true);
				})}
			}
			button
			detail
		>
		<IonIcon
			icon={icon(POI.properties.category_it)}
			className="ion-margin-end"
		/>
		<IonLabel>{POIname(POI)}</IonLabel>
		</IonItem>
	));

	/**
	 * Crea la lista di Event
	 */
	const listEvent = dataEvent.map((Event: Event) => (
		<IonItem
			key={ Event.properties.id_event }
			onClick={() =>
				{fetchEventMedia(Event.properties.id_event, (media: EventMedia[]) => {
					event_media = media;
				});
				fetchEventDetails(Event.properties.id_event, (event_data: EventDetails) => {
					event_details = event_data;
					setShowEventModal(true);
				})}
			}
			button
			detail
		>
		<IonIcon
			icon={ icon(Event.properties.category_it) }
			className="ion-margin-end"
		/>
		<IonLabel>{ Eventname(Event) }</IonLabel>
		</IonItem>
	));

	return (
		<IonModal
			isOpen={props.openCondition}
			onDidDismiss={() => props.onDismissConditions(false)}
		>
		{/* HEADER */}
		<IonHeader>
			<IonToolbar color="primary">
				{/* FRECCIA INDIETRO */}
				<IonButtons slot="start" class="toolbar_back_button">
					<IonIcon
						slot="icon-only"
						ios={ chevronBack }
						md={ arrowBack }
						onClick={() => props.onDismissConditions(false)}
					/>
				</IonButtons>

				{/* LOGO COMUNE */}
				<IonItem slot="start" lines="none" color="primary">
					<IonImg src={ toolbarIcon } style={{ height: "80%" }} />
				</IonItem>

				{/* MENU OPZIONI POPOVER */}
				<IonButtons slot="end" className="ion-margin-end">
					<IonIcon
						slot="icon-only"
						ios={ ellipsisHorizontal }
						md={ ellipsisVertical }
						onClick={(e: any) =>
							present({
								event: e.nativeEvent,
							})
						}
					/>
				</IonButtons>
			</IonToolbar>
		</IonHeader>

		<IonContent>
			{/* Search Bar */}
			<IonSearchbar
				value={ searchText }
				onIonInput={(e) => {
					setSearchText(e.detail.value!);
					setSearch(true);
				}}
				onIonCancel={() => {
					setSearchText("");
					setSearch(false);
				}}
			/>

			{/* Lista  Poi*/}
			{search && (<FilterPOI/>)}
			{!search && (<IonList>{ listPOI }</IonList>)}

			{/* Lista  Event */}
			{search && (<FilterEvent/>)}
			{!search && (<IonList>{ listEvent }</IonList>)}

			{/* Modal delle informazioni riguardanti il punto di interesse cliccato */}
			{showPOIModal && (
				<POIModal
					openCondition={ showPOIModal }
					onDismissConditions={ setShowPOIModal }
					data={ poi_details }
					media={ poi_media }
					i18n={ props.i18n }
					setTourDetails={ props.setTourDetails }
					closeAllModals={() => {
						props.closeAllModals();
						setShowPOIModal(false);
					}}
				/>
			)}

			{/* Modal delle informazioni riguardanti l'evento cliccato */}
			{showEventModal && (
				<EventModal
					openCondition={ showEventModal }
					onDismissConditions={ setShowEventModal }
					data={ event_details }
					media={ event_media }
					i18n={ props.i18n }
					closeAllModals={() => {
						props.closeAllModals();
						setShowEventModal(false);
					}}
				/>
			)}
		</IonContent>
		</IonModal>
	);
}

export default SearchModal;

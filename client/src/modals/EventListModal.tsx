import {
	IonButtons,
	IonCard,
	IonCardContent,
	IonCol,
	IonContent,
	IonGrid,
	IonHeader,
	IonIcon,
	IonImg,
	IonItem,
	IonLabel,
	IonList,
	IonModal,
	IonRow,
	IonTitle,
	IonToolbar,
	useIonPopover,
	IonDatetime,
	IonButton,
} from "@ionic/react";
import { useState } from "react";
import {
	chevronBack,
	arrowBack,
	ellipsisHorizontal,
	ellipsisVertical,
} from "ionicons/icons";
import toolbarIcon from "../assets/images/logo.png";
import EventModal from "./EventModal";
import { i18n } from "i18next";
import { LanguageCode, Event, EventDetails, EventMedia } from "../types/app_types";
import PopoverList from "../components/PopoverList";
import { fetchEventDetails, fetchEventMedia } from "../components/Functions";

var event_details: EventDetails;
var event_media: EventMedia[];

function EventListModal(props: {
	openCondition: boolean;
	onDismissConditions: (arg0: boolean) => void;
	data: Event[];
	i18n: i18n;
	closeAllModals: () => void;
}) {
	const [showEventModal, setShowEventModal] = useState<boolean>(false); // Mostra o nascondi il modale dell'evento
	const [showFilteredEvents, setShowFilteredEvents] = useState<boolean>(false); // Mostra o nascondi eventi filtrati
	const [startDate, setStartDate] = useState<string>(Date());
	const [endDate, setEndDate] = useState<string>(Date());
	const [present, dismiss] = useIonPopover(PopoverList, {
		onHide: () => dismiss(),
	});
	const lng = props.i18n.language as LanguageCode;

	var locale = "it-IT";
	if (lng == "en") {
		locale = "en-EN";
	} else if (lng == "de") {
		locale = "de-De";
	} else if (lng == "fr") {
		locale = "fr-FR";
	} else if (lng == "es") {
		locale = "es-ES";
	} else if (lng == "it") {
		locale = "it-IT";
	}

	const today = new Date();
	const dd = String(today.getDate()).padStart(2, '0');
	const mm = String(today.getMonth() + 1).padStart(2, '0');
	const yyyy = today.getFullYear();

	const minDate = yyyy + '-' + mm + '-' + dd;
	const maxDate = yyyy + 2 + '-' + mm + '-' + dd;

	function getEventNameFallback(event: Event): string {
		const name = event.properties[`name_${lng}`];
		return name ? name : event.properties.name_en;
	}

	/** Richiedi al server i dettagli di un evento */
	function getEventDetail(id_event: string) {
		fetchEventDetails(id_event, (event: EventDetails) => {
			event_details = event;
			setShowEventModal(true);
		});

		fetchEventMedia(id_event, (media: EventMedia[]) => {
			event_media = media;
		})
	}

	/** Creazione delle sezioni delle categorie dei poi*/
	function EventList(pr: { category: string }) {
		const filteredEvent = props.data.filter(
			(event: Event) => event.properties.category_it === pr.category
			&&
			event.properties.day.split(',')
		);
		const n_events = filteredEvent.length;
		const listItems = filteredEvent.map((event: Event, index: number) => (
			<IonItem
				button={ true }
				key={ event.properties.id_event }
				lines={ index < n_events - 1 ? "inset" : "none" }
				onClick={() => {
					getEventDetail(event.properties.id_event);
				}}
			>
				<IonLabel>{ getEventNameFallback(event) }</IonLabel>
			</IonItem>
		));

		return <IonList className="ion-no-padding">{ listItems }</IonList>;
	}

	function FilterEventByDate(pr: { category: string }) {
		const filteredEvent = props.data.filter(
			function(event: Event) {
				if (event.properties.category_it === pr.category) {
					var days = event.properties.day.split(',').map(date => new Date(date));
					var partsStartDate = new Date(startDate).toLocaleDateString().split('/');
					var start = new Date(+partsStartDate[2], +partsStartDate[1] - 1, +partsStartDate[0]);
					var partsEndDate = new Date(endDate).toLocaleDateString().split('/');
					var end = new Date(+partsEndDate[2], +partsEndDate[1] - 1, +partsEndDate[0]);

					for (var day of days) {
						if (day >= start && day <= end) {
							return true;
						}
					}
					return false;
				} else {
					return false
				}
			}
		);
		const n_events = filteredEvent.length;
		const listItems = filteredEvent.map((event: Event, index: number) => (
			<IonItem
				button={ true }
				key={ event.properties.id_event }
				lines={ index < n_events - 1 ? "inset" : "none" }
				onClick={() => {
					getEventDetail(event.properties.id_event);
				}}
			>
				<IonLabel>{ getEventNameFallback(event) }</IonLabel>
			</IonItem>
		));

		return <IonList className="ion-no-padding">{ listItems }</IonList>;
	}

	return (
		<IonModal
			isOpen={ props.openCondition }
			onDidDismiss={ () => props.onDismissConditions(false) }
		>
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

		{/* HEADER */}
		<IonHeader>
			<IonToolbar color="primary">
			{/* FRECCIA INDIETRO */}
			<IonButtons slot="start" class="toolbar_back_button">
				<IonIcon
					slot="icon-only"
					ios={ chevronBack }
					md={ arrowBack }
					onClick={ () => props.onDismissConditions(false) }
				/>
			</IonButtons>

			{/* LOGO */}
			<IonItem slot="start" lines="none" color="primary">
				<IonImg src={ toolbarIcon } style={{ height: "80%" }} />
			</IonItem>

			{/* TITOLO */}
			{/* <IonLabel slot="start" className="ion-padding-start">
				{t("tours")}
			</IonLabel> */}

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
			<IonGrid fixed={true}>
				{/* TITOLO */}
				<IonRow>
					<IonCol>
						<IonTitle>
							<h1>{ props.i18n.t("events") }</h1>
						</IonTitle>
					</IonCol>
				</IonRow>

				<IonRow>
					<IonCol class="event-date">
						<IonLabel>{ props.i18n.t("start_date") }:</IonLabel>
						<IonDatetime
							class="datetime"
							presentation="date"
							locale={ locale }
							min={ minDate }
							max={ maxDate }
							onIonChange={ (e) => setStartDate(e.detail.value!) }
						/>
					</IonCol>
					<IonCol class="event-date">
						<IonLabel>{ props.i18n.t("end_date") }:</IonLabel>
						<IonDatetime
							class="datetime"
							presentation="date"
							locale={ locale }
							min={ minDate }
							max={ maxDate }
							onIonChange={ (e) => setEndDate(e.detail.value!) }
						/>
					</IonCol>
				</IonRow>
				<IonRow>
					<IonCol class="event-date-find">
						<IonButton
							style={{ width: "25%", margin: "10px" }}
							onClick={() => {
								setShowFilteredEvents(true);
							}}
						>
							{ props.i18n.t("event_find_btn") }
						</IonButton>
						<IonButton
							style={{ width: "25%", margin: "10px" }}
							onClick={() => {
								setShowFilteredEvents(false);
							}}
						>
							{ props.i18n.t("event_clear_btn") }
						</IonButton>
					</IonCol>
				</IonRow>

				{/* SCHEDA SPETTACOLI */}
				<IonRow>
					<IonCol>
					<IonCard>
						<IonItem
							color="primary" //TITOLO MENU COLORATO
						>
							<IonLabel>{ props.i18n.t("cat_event_show") }</IonLabel>
						</IonItem>

						<IonCardContent className="ion-no-padding">
							{!showFilteredEvents &&
								(<EventList category="Spettacolo" />)}
							{showFilteredEvents &&
								(<FilterEventByDate category="Spettacolo" />)}
						</IonCardContent>
					</IonCard>
					</IonCol>
				</IonRow>

				{/* SCHEDA INCONTRI */}
				<IonRow>
					<IonCol>
					<IonCard>
						<IonItem
							color="primary" //TITOLO MENU COLORATO
						>
							<IonLabel>{ props.i18n.t("cat_event_meeting") }</IonLabel>
						</IonItem>

						<IonCardContent className="ion-no-padding">
						{!showFilteredEvents &&
								(<EventList category="Incontro" />)}
						{showFilteredEvents &&
							(<FilterEventByDate category="Incontro" />)}
						</IonCardContent>
					</IonCard>
					</IonCol>
				</IonRow>

				{/* SCHEDA GITE */}
				<IonRow>
					<IonCol>
					<IonCard>
						<IonItem
						color="primary" //TITOLO MENU COLORATO
						>
							<IonLabel>{ props.i18n.t("cat_event_trip") }</IonLabel>
						</IonItem>

						<IonCardContent className="ion-no-padding">
						{!showFilteredEvents &&
								(<EventList category="Gita" />)}
						{showFilteredEvents &&
							(<FilterEventByDate category="Gita" />)}
						</IonCardContent>
					</IonCard>
					</IonCol>
				</IonRow>
			</IonGrid>
		</IonContent>
		</IonModal>
	);
}

export default EventListModal;

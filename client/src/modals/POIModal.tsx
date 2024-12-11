import { useState } from "react";
import {
	IonButton,
	IonCard,
	IonCardContent,
	IonCol,
	IonContent,
	IonGrid,
	IonIcon,
	IonImg,
	IonItem,
	IonLabel,
	IonModal,
	IonRow,
	IonText,
	IonToolbar,
	IonHeader,
	useIonPopover,
	IonButtons,
	IonNote,
	IonList,
} from "@ionic/react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Keyboard, Pagination, Navigation } from 'swiper/modules';
import "swiper/css";
import 'swiper/css/keyboard';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import "@ionic/react/css/ionic-swiper.css";
import {
	addCircle,
	arrowBack,
	chevronBack,
	ellipsisHorizontal,
	ellipsisVertical,
	link,
	removeCircle,
	volumeHigh,
  	volumeMute,
} from "ionicons/icons";
import ReactHtmlParser from "html-react-parser";
import { fetchTourDetails, fetchTourMedia } from "../components/Functions";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import PopoverList from "../components/PopoverList";
import TourModal from "./TourModal";
import { i18n } from "i18next";
import { LanguageCode, POIDetails, TourDetails, POIMedia, TourMedia } from "../types/app_types";
import { SERVER_MEDIA } from "../configVar";


var tour_details: TourDetails;
var tour_media: TourMedia[];

function POIModal(props: {
	openCondition: boolean;
	onPresent?: (arg0: boolean) => void;
	onDismissConditions: (arg0: boolean) => void;
	data: POIDetails;
	media: POIMedia[];
	i18n: i18n;
	setTourDetails: (arg0: TourDetails) => void;
	closeAllModals: () => void;
}) {
	const [openTimeView, setOpenTimeView] = useState<boolean>(false); // Mostra o nascondi il testo relativo agli orari del punto di interesse
	const [ticketsView, setTicketsView] = useState<boolean>(false); // Mostra o nascondi il testo relativo al prezzo dei biglietti del punto di interesse
	const [toursView, setToursView] = useState<boolean>(false); // Mostra o nascondi il testo relativo agli itinerari
	const [textPlaying, setTextPlaying] = useState<boolean>(false); // Controlla se il TTS è in riproduzione o no
	const [showTourModal, setShowTourModal] = useState<boolean>(false); // Mostra o nascondi il modale dell'itinerario
	const [linkView, setLinkView] = useState<boolean>(false); // Mostra o nascondi il testo relativo ai collegamenti esterni

	/**
	 * Conta il numero di itinerari in cui il punto di interesse è presente
	 */
	const n_tours = props.data.tours_id
		? props.data.tours_id.split(",").length
		: 0;

  /**
   * Funzione che manda in riproduzione vocale la descrizione del punto di interesse
   */
	function speak() {
		setTextPlaying(true);
		let lngPlay = getDescription()
			? props.i18n.language + "-" + props.i18n.language.toUpperCase()
			: "en-US";
		if (lngPlay === "en-EN") lngPlay = "en-US";
		TextToSpeech.speak({
			text: removeDoubleSlashN(getDescriptionFallback()),
			lang: lngPlay,
		}).then(() => setTextPlaying(false));
	}

	/**
	 * Ferma la riproduzione vocale
	 */
	function stop() {
		TextToSpeech.stop();
		setTextPlaying(false);
	}
	const code = props.i18n.language as LanguageCode;

	/**
	 * Funzioni che restituiscono orari, biglietti e descrizione nel linguaggio scelto,
	 * servono anche a controllare se il contenuto è disponibile in quella lingua
	 */
	const getOpenTime = () => {
		if (code === "it") return props.data.open_time;
		return props.data[`open_time_${code}`];
	};
	const getTickets = () => {
		if (code === "it") return props.data.tickets;
		return props.data[`tickets_${code}`];
	};
	function getDescription() {
		return props.data[`descr_${code}`];
	}

	/**
	 * Funzioni che restituiscono il contenuto da visualizzare nelle schede nella propria lingua,
	 * se presente oppure in inglese
	 */
	const getOpenTimeFallback = () => {
		let openTime = getOpenTime();
		return openTime ? openTime : props.data["open_time_en"];
	};

	const getTicketsFallback = () => {
		let tickets = getTickets();
		if (tickets != null) return tickets ? tickets : props.data["tickets_en"];
		else return "";
	};

	function getDescriptionFallback(): string {
		let description = getDescription();
		return description ? description : props.data["descr_en"];
	}

	const removeDoubleSlashN = (str: string) => {
		if (str) return str.replace(/\\n/g, "");
		return "No description for this POI.";
	};

	/** Menu opzioni */
	const [present, dismiss] = useIonPopover(PopoverList, {
		onHide: () => dismiss(),
	});

	/**
	 * Scarica i dettagli di un itinerario e apre la modale per visualizzarli
	 * @param id_tour Identificativo del tour
	 */
	function getTourDetail(id_tour: string) {
		fetchTourDetails(id_tour, (tour: TourDetails) => {
			tour_details = tour;
			setShowTourModal(true);
		});

		fetchTourMedia(id_tour, (media: TourMedia[]) => {
			tour_media = media;
		})
	}

	/** Creazione della lista di itinerari cliccabili */
	var tours_id: string[] = [];
	var tours_name: string[];
	if (props.data.tours_id != null) {
		tours_id = props.data.tours_id.split(",");
		tours_id = tours_id.filter(function (item, pos) {
			return tours_id.indexOf(item) === pos;
		});
		tours_name = props.data[`tours_name_${code}`]
			? props.data[`tours_name_${code}`].split(",")
			: props.data.tours_name_en.split(",");
	}
	const listItems = tours_id.map((id: string, index: number) => (
		<IonItem
			button={ true }
			key={ id }
			lines={ index < n_tours - 1 ? "inset" : "none" }
			onClick={() => {
				getTourDetail(id);
			}}
		>
			<IonLabel>{ tours_name[index] }</IonLabel>
		</IonItem>
	));
	
	var mediaPath: string[] = [];

	props.media.forEach((obj) => (
		mediaPath.push(SERVER_MEDIA + obj.properties.path)
	));
	
	const slides = mediaPath.map((path: string, index: number) => (
		<SwiperSlide key={ index }>
			<IonImg src={ path } />
		</SwiperSlide>
	));

	return (
		<IonModal
			isOpen={props.openCondition}
			onDidDismiss={() => {
				props.onDismissConditions(false);
				TextToSpeech.stop();
			}}
			onWillPresent={() => {
				props.onPresent?.(false);
			}}
		>
		{showTourModal && (
			<TourModal
				openCondition={showTourModal}
				onDismissConditions={setShowTourModal}
				data={tour_details}
				media={tour_media}
				i18n={props.i18n}
				setTourDetails={props.setTourDetails}
				closeAllModals={() => {
					props.closeAllModals();
					setShowTourModal(false);
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
					ios={chevronBack}
					md={arrowBack}
					onClick={() => props.onDismissConditions(false)}
				/>
			</IonButtons>

			{/* NOME POI */}
			<IonLabel slot="start" class="toolbar_label">
				{props.data[`name_${code}`] !== null
				? props.data[`name_${code}`]
				: props.data["name_en"]}
			</IonLabel>

			{/* MENU OPZIONI POPOVER */}
			<IonButtons slot="end" className="ion-margin-end">
				<IonIcon
					slot="icon-only"
					ios={ellipsisHorizontal}
					md={ellipsisVertical}
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
			{/* IMMAGINE */}
			<IonRow className="ion-align-items-center">
				<IonCol>
					<Swiper
						pagination={{
							type: 'fraction',
						}}
						navigation={ true }
						modules={ [ Keyboard, Pagination, Navigation ] }
						keyboard={ true }
					>
						{ slides }
					</Swiper>
				</IonCol>
			</IonRow>

			{/* SCHEDA ORARI */}
			<IonRow>
				<IonCol>
					<IonCard>
						<IonItem
							color="primary" //TITOLO MENU COLORATO
							lines={openTimeView ? "inset" : "none"}
							onClick={() => setOpenTimeView(!openTimeView)}
						>
						<IonLabel>{props.i18n.t("open_time")}:</IonLabel>
						<IonIcon
							slot="end"
							icon={openTimeView ? removeCircle : addCircle}
							// color="primary" BOTTONE BIANCO CON TITOLO COLORATO
						/>
						</IonItem>

						{openTimeView && (
							<IonCardContent>
								{!getOpenTime() && (
									<IonNote color="danger">
										{props.i18n.t("not_supported")}
										<br />
										<br />
									</IonNote>
								)}
								<IonLabel color="dark">
								{ReactHtmlParser(getOpenTimeFallback())}
								</IonLabel>
							</IonCardContent>
						)}
					</IonCard>
				</IonCol>
			</IonRow>

			{/* SCHEDA BIGLIETTI */}
			{ props.data.category_name_it != "Attività" && (
				<IonRow>
					<IonCol>
						<IonCard>
							<IonItem
								color="primary" //TITOLO MENU COLORATO
								lines={ticketsView ? "inset" : "none"}
								onClick={() => setTicketsView(!ticketsView)}
							>
							<IonLabel>{props.i18n.t("tickets")}:</IonLabel>
							<IonIcon
								slot="end"
								icon={ticketsView ? removeCircle : addCircle}
								// color="primary" BOTTONE BIANCO CON TITOLO COLORATO
							/>
							</IonItem>

							{ticketsView && (
								<IonCardContent>
									{!getTickets() && (
										<IonNote color="danger">
											{props.i18n.t("not_supported")}
											<br />
											<br />
										</IonNote>
									)}
									<IonLabel color="dark">
										{ ReactHtmlParser(getTicketsFallback()) }
									</IonLabel>
								</IonCardContent>
							)}
						</IonCard>
					</IonCol>
				</IonRow>
			)}

			{/* SCHEDA ITINERARI */}
			{n_tours > 0 && (
				<IonRow>
					<IonCol>
						<IonCard>
							<IonItem
								color="primary" //TITOLO MENU COLORATO
								lines={toursView ? "inset" : "none"}
								onClick={() => setToursView(!toursView)}
							>
								<IonLabel>{props.i18n.t("tours")}:</IonLabel>
								<IonIcon
									slot="end"
									icon={toursView ? removeCircle : addCircle}
									// color="primary" BOTTONE BIANCO CON TITOLO COLORATO
								/>
							</IonItem>

							{toursView && (
								<IonCardContent className="ion-no-padding">
									<IonList className="ion-no-padding">{ listItems }</IonList>
								</IonCardContent>
							)}
						</IonCard>
					</IonCol>
				</IonRow>
			)}

			{/* SCHEDA COLLEGAMENTI ESTERNI */}
			{ props.data.link && (
				<IonRow>
					<IonCol>
						<IonCard>
							<IonItem
								color="primary" //TITOLO MENU COLORATO
								lines={linkView ? "inset" : "none"}
								onClick={() => setLinkView(!linkView)}
							>
								<IonLabel>{props.i18n.t("link")}:</IonLabel>
								<IonIcon
									slot="end"
									icon={linkView ? removeCircle : addCircle}
								/>
							</IonItem>

							{linkView && (
								<IonCardContent>
									<IonLabel className="ion-no-padding">
										{ ReactHtmlParser(props.data.link) }
									</IonLabel>
								</IonCardContent>
							)}
						</IonCard>
					</IonCol>
				</IonRow>
			)}

			{/* SCHEDA DESCRIZIONE */}
			<IonRow>
				<IonCol>
					<IonCard>
						<IonItem
							color="primary" //TITOLO MENU COLORATO
						>
						<IonLabel>{props.i18n.t("description")}:</IonLabel>
						<IonButton
							slot="end"
							fill="clear"
							onClick={textPlaying ? stop : speak}
						>
							<IonIcon
								slot="icon-only"
								color="light"
								icon={textPlaying ? volumeMute : volumeHigh}
							/>
						</IonButton>
						</IonItem>

						<IonCardContent>
							{!getDescription() && (
								<IonNote color="danger">
									{props.i18n.t("not_supported")}
									<br />
									<br />
								</IonNote>
							)}
						<IonText color="dark" class="format-text">
							{ ReactHtmlParser(removeDoubleSlashN(getDescriptionFallback())) }
						</IonText>
						</IonCardContent>
					</IonCard>
				</IonCol>
			</IonRow>
			</IonGrid>
		</IonContent>
		</IonModal>
	);
}

export default POIModal;

import React, { useState } from "react";
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
	removeCircle,
	volumeHigh,
  	volumeMute,
} from "ionicons/icons";
import ReactHtmlParser from "html-react-parser";
import { TextToSpeech } from "@capacitor-community/text-to-speech";
import "swiper/css";
import "@ionic/react/css/ionic-swiper.css";
import PopoverList from "../components/PopoverList";
import { i18n } from "i18next";
import { LanguageCode, EventDetails, EventMedia } from "../types/app_types";
import { SERVER_MEDIA } from "../configVar";

function EventModal(props: {
	openCondition: boolean;
	onPresent?: (arg0: boolean) => void;
	onDismissConditions: (arg0: boolean) => void;
	data: EventDetails;
	media: EventMedia[];
	i18n: i18n;
	closeAllModals: () => void;
}) {
	const [openTimeView, setOpenTimeView] = useState<boolean>(false); // Mostra o nascondi il testo relativo agli orari del punto di interesse
	const [ticketsView, setTicketsView] = useState<boolean>(false); // Mostra o nascondi il testo relativo al prezzo dei biglietti del punto di interesse
	const [textPlaying, setTextPlaying] = useState<boolean>(false); // Controlla se il TTS è in riproduzione o no

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

	const open_time = props.data.open_time.split(';').map((part: string) => (
		<IonItem
			key={ part }
		>
			<IonLabel>{ props.i18n.t("date") }: { part.split(',')[0] }</IonLabel>
			<IonLabel>{ props.i18n.t("start_time") }: { part.split(',')[1] }</IonLabel>
			<IonLabel>{ props.i18n.t("end_time") }: { part.split(',')[2] }</IonLabel>
		</IonItem>
	));

	/**
	 * Funzioni che restituiscono orari, biglietti e descrizione nel linguaggio scelto,
	 * servono anche a controllare se il contenuto è disponibile in quella lingua
	 */
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
	const getTicketsFallback = () => {
		let tickets = getTickets();
		return tickets ? tickets : props.data["tickets_en"];
	};
	function getDescriptionFallback(): string {
		let description = getDescription();
		return description ? description : props.data["descr_en"];
	}

	const removeDoubleSlashN = (str: string) => {
		if (str) return str.replace(/\\n/g, "");
		return "No description for this Event.";
	};

	/** Menu opzioni */
	const [present, dismiss] = useIonPopover(PopoverList, {
		onHide: () => dismiss(),
	});

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

				{/* NOME EVENTO */}
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
									<IonLabel color="dark">
										{ open_time }
									</IonLabel>
								</IonCardContent>
							)}
						</IonCard>
					</IonCol>
				</IonRow>

				{/* SCHEDA BIGLIETTI */}
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
							{ReactHtmlParser(getTicketsFallback())}
							</IonLabel>
						</IonCardContent>
						)}
					</IonCard>
					</IonCol>
				</IonRow>

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

export default EventModal;

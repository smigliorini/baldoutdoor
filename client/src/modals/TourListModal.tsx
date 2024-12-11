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
} from "@ionic/react";
import { useState } from "react";
import {
	chevronBack,
	arrowBack,
	ellipsisHorizontal,
	ellipsisVertical,
} from "ionicons/icons";
import toolbarIcon from "../assets/images/logo.png";
import TourModal from "./TourModal";
import { i18n } from "i18next";
import { LanguageCode, Tour, TourDetails, TourMedia } from "../types/app_types";
import PopoverList from "../components/PopoverList";
import { fetchTourDetails, fetchTourMedia } from "../components/Functions";

var tour_details: TourDetails;
var tour_media: TourMedia[];

function TourListModal(props: {
	openCondition: boolean;
	onDismissConditions: (arg0: boolean) => void;
	data: Tour[];
	i18n: i18n;
	setTourDetails: (arg0: TourDetails) => void;
	closeAllModals: () => void;
}) {
	const [showTourModal, setShowTourModal] = useState<boolean>(false); // Mostra o nascondi il modale dell'itinerario
	const [present, dismiss] = useIonPopover(PopoverList, {
		onHide: () => dismiss(),
	});
	const lng = props.i18n.language as LanguageCode;

	function getTourNameFallback(tour: Tour): string {
		const name = tour.properties[`name_${lng}`];
		return name ? name : tour.properties.name_en;
	}

	/** Richiedi al server i dettagli di un itinerario */
	function getTourDetail(id_tour: string) {
		fetchTourDetails(id_tour, (tour: TourDetails) => {
			tour_details = tour;
			setShowTourModal(true);
		});

		fetchTourMedia(id_tour, (media: TourMedia[]) => {
			tour_media = media;
		})
	}

	/** Creazione delle sezioni delle categorie dei poi*/
	function TourList(pr: { type: string }) {
		const filteredTour = props.data.filter(
			(tour: Tour) => tour.properties.type === pr.type
		);
		const n_tours = filteredTour.length;
		const listItems = filteredTour.map((tour: Tour, index: number) => (
			<IonItem
				button={true}
				key={tour.properties.id_tour}
				lines={index < n_tours - 1 ? "inset" : "none"}
				onClick={() => {
					getTourDetail(tour.properties.id_tour);
				}}
			>
				<IonLabel>{getTourNameFallback(tour)}</IonLabel>
			</IonItem>
		));
		return <IonList className="ion-no-padding">{listItems}</IonList>;
	}

	return (
		<IonModal
		isOpen={props.openCondition}
		onDidDismiss={() => props.onDismissConditions(false)}
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

			{/* LOGO COMUNE */}
			<IonItem slot="start" lines="none" color="primary">
				<IonImg src={toolbarIcon} style={{ height: "80%" }} />
			</IonItem>

			{/* TITOLO */}
			{/* <IonLabel slot="start" className="ion-padding-start">
				{t("tours")}
			</IonLabel> */}

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
				{/* TITOLO ITINERARI */}
				<IonRow>
					<IonCol>
					<IonTitle>
						<h1>{props.i18n.t("tours")}</h1>
					</IonTitle>
					</IonCol>
				</IonRow>

				{/* SCHEDA ITINERARI A TEMPO */}
				<IonRow>
					<IonCol>
						<IonCard>
							<IonItem
								color="primary" //TITOLO MENU COLORATO
							>
								<IonLabel>{props.i18n.t("a_tempo")}</IonLabel>
							</IonItem>

							<IonCardContent className="ion-no-padding">
								<TourList type="a tempo" />
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>

				{/* SCHEDA ITINERARI STORICI */}
				<IonRow>
					<IonCol>
						<IonCard>
							<IonItem
							color="primary" //TITOLO MENU COLORATO
							>
							<IonLabel>{props.i18n.t("storico")}</IonLabel>
							</IonItem>

							<IonCardContent className="ion-no-padding">
								<TourList type="storico" />
							</IonCardContent>
						</IonCard>
					</IonCol>
				</IonRow>
			</IonGrid>
		</IonContent>
		</IonModal>
	);
}

export default TourListModal;

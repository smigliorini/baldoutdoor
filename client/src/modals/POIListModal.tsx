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
import POIModal from "./POIModal";
import { i18n } from "i18next";
import { LanguageCode, POI, POIDetails, POIMedia, TourDetails } from "../types/app_types";
import PopoverList from "../components/PopoverList";
import { fetchPOIDetails, fetchPOIMedia } from "../components/Functions";

var poi_details: POIDetails;
var poi_media: POIMedia[];

function POIListModal(props: {
	openCondition: boolean;
	onDismissConditions: (arg0: boolean) => void;
	data: POI[];
	i18n: i18n;
	setTourDetails: (arg0: TourDetails) => void;
	closeAllModals: () => void;
}) {
	const [showPOIModal, setShowPOIModal] = useState<boolean>(false); // Mostra o nascondi il modale del POI
	const [present, dismiss] = useIonPopover(PopoverList, {
		onHide: () => dismiss(),
	});
	const lng = props.i18n.language as LanguageCode;

	function getPOINameFallback(poi: POI): string {
		const name = poi.properties[`name_${lng}`];
		return name ? name : poi.properties.name_en;
	}

	/** Richiedi al server i dettagli di un POI */
	function getPOIDetail(id_poi: string) {
		fetchPOIDetails(id_poi, (poi: POIDetails) => {
			poi_details = poi;
			setShowPOIModal(true);
		});

		fetchPOIMedia(id_poi, (media: POIMedia[]) => {
			poi_media = media;
		})
	}

	/** Creazione delle sezioni delle categorie dei poi*/
	function POIList(pr: { category: string }) {
		const filteredEvent = props.data.filter(
			(poi: POI) => poi.properties.category_it === pr.category
		);
		const n_pois = filteredEvent.length;
		const listItems = filteredEvent.map((poi: POI, index: number) => (
			<IonItem
				button={ true }
				key={ poi.properties.id_art }
				lines={ index < n_pois - 1 ? "inset" : "none" }
				onClick={() => {
					getPOIDetail(poi.properties.id_art);
				}}
			>
				<IonLabel>{ getPOINameFallback(poi) }</IonLabel>
			</IonItem>
		));
		return <IonList className="ion-no-padding">{ listItems }</IonList>;
	}

	return (
		<IonModal
			isOpen={ props.openCondition }
			onDidDismiss={ () => props.onDismissConditions(false) }
		>
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

			{/* LOGO COMUNE */}
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
				{/* TITOLO ITINERARI */}
				<IonRow>
					<IonCol>
					<IonTitle>
						<h1>{props.i18n.t("pois")}</h1>
					</IonTitle>
					</IonCol>
				</IonRow>

				{/* SCHEDA POI DI VALENZA NATURALE */}
				<IonRow>
					<IonCol>
					<IonCard>
						<IonItem
						color="primary" //TITOLO MENU COLORATO
						>
						<IonLabel>{props.i18n.t("cat_natural_valence")}</IonLabel>
						</IonItem>

						<IonCardContent className="ion-no-padding">
							<POIList category="Elemento a valenza naturale" />
						</IonCardContent>
					</IonCard>
					</IonCol>
				</IonRow>

				{/* SCHEDA POI DI VALENZA STORICO/CULTURALE */}
				<IonRow>
					<IonCol>
					<IonCard>
						<IonItem
						color="primary" //TITOLO MENU COLORATO
						>
						<IonLabel>{props.i18n.t("cat_his_cult_valence")}</IonLabel>
						</IonItem>

						<IonCardContent className="ion-no-padding">
							<POIList category="Elemento a valenza storico/culturale" />
						</IonCardContent>
					</IonCard>
					</IonCol>
				</IonRow>

				{/* SCHEDA ATTIVITA' */}
				<IonRow>
					<IonCol>
					<IonCard>
						<IonItem
						color="primary" //TITOLO MENU COLORATO
						>
						<IonLabel>{props.i18n.t("cat_activity")}</IonLabel>
						</IonItem>

						<IonCardContent className="ion-no-padding">
							<POIList category="Attività" />
						</IonCardContent>
					</IonCard>
					</IonCol>
				</IonRow>
			</IonGrid>
		</IonContent>
		</IonModal>
	);
}

export default POIListModal;

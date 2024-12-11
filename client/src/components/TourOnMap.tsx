import {
  IonAlert,
  IonButtons,
  IonChip,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonToolbar,
} from "@ionic/react";
import { i18n } from "i18next";
import { footsteps, map } from "ionicons/icons";
import { Polyline } from "react-leaflet";
import { useState } from "react";
import { TourDetails, POI, LanguageCode, TourMedia } from "../types/app_types";
import TourModal from "../modals/TourModal";


var tourMedia: TourMedia[];

function TourOnMap(props: {
	i18n: i18n;
	tourDetails: TourDetails;
	setTourDetails: (arg0: TourDetails | undefined) => void;
	POIListData: POI[];
}) {
	const [closeTourAlert, setCloseTourAlert] = useState<boolean>(false); // Indica se mostrare l'alert di conferma chiusura del tour
	const [showTourModal, setShowTourModal] = useState<boolean>(false); // Mostra la modale dell'itinerario
	const code = props.i18n.language as LanguageCode;

	/** Mostra l'alert di chiusura itinerario se viene premuto il tasto indietro sul telefono */
	document.addEventListener("ionBackButton", (ev) => {
		setCloseTourAlert(true);
	});

	function getColor(elevation: number) {
		return 	elevation < 800     ?	'#4DD0F7':
				elevation < 900		?   '#52C6F7':
				elevation < 1000	?   '#57BBF6':
				elevation < 1100	?   '#5CB1F6':
				elevation < 1200	?   '#61A6F5':
				elevation < 1300	?   '#F7DE4D':
				elevation < 1400	?   '#F7D352':
				elevation < 1500	?   '#F6C758':
				elevation < 1600    ?   '#F6BC5D':
				elevation < 1700    ?   '#F5B062':
				elevation < 1800    ?   '#FF5959':
				elevation < 1900    ?   '#EF5050':
				elevation < 2000    ?   '#DF4747':
				elevation < 2000    ?   '#D03F3F':
				elevation < 2100    ?   '#C03636':
				elevation < 2200    ?   '#B02D2D':
										'#B02D2D' ;
		}

	var currElevation = props.tourDetails.geometry.coordinates[0][0][2];
	var positions: [number, number, number][] = [];
	var polylines: JSX.Element[] = [];
	for (var i = 0; i < props.tourDetails.geometry.coordinates[0].length; i++) {
		positions.push([props.tourDetails.geometry.coordinates[0][i][0], props.tourDetails.geometry.coordinates[0][i][1], props.tourDetails.geometry.coordinates[0][i][2]]);
		if (currElevation + 100 < props.tourDetails.geometry.coordinates[0][i][2] || currElevation - 100 > props.tourDetails.geometry.coordinates[0][i][2]) {
			var color = getColor(currElevation);
			polylines.push(<Polyline key={i} pathOptions={{ color: color }}  positions={ positions } />);
			currElevation = props.tourDetails.geometry.coordinates[0][i][2];
			positions = [];
		}
	}
	if (polylines.length === 0) {
		color = getColor(positions[0][2]);
		polylines.push(<Polyline key={i} pathOptions={{ color: color }}  positions={ positions } />);
	}

	return (
		<>
		<IonFab vertical="top" horizontal="end" className="ion-margin-end tours">
			<IonToolbar color="none" className="ion-margin-start ion-padding-start">
				<IonButtons className="ion-margin-end">
					{/* Titolo itinerario */}
					<IonChip
						class="chip"
						onClick={() => {
							setShowTourModal(true);
						}}
					>
						<IonIcon icon={ footsteps } color="primary" />
						<IonLabel>
							{ 
								props.tourDetails.properties[`name_${code}`] ??
								props.tourDetails.properties.name_en
							}
						</IonLabel>
					</IonChip>
				</IonButtons>
				{/* Pulsante per tornare alla mappa originale */}
				<IonButtons slot="primary">
					<IonFabButton onClick={ () => setCloseTourAlert(true) }>
						<IonIcon icon={ map } />
					</IonFabButton>
				</IonButtons>
			</IonToolbar>
		</IonFab>

		{/* Alert di conferma chiusura itinerario */}
		<IonAlert
			isOpen={closeTourAlert}
			header={props.i18n.t("tour_alert_title")}
			message={props.i18n.t("tour_alert_message")}
			onDidDismiss={() => {
				setCloseTourAlert(false);
			}}
			buttons={[
			{
				text: "Cancel",
				role: "cancel",
				cssClass: "secondary",
			},
			{
				text: "Okay",
				handler: () => {
					props.setTourDetails(undefined);
				},
			},
			]}
		/>

		{ polylines }

		{showTourModal && (
			<TourModal
				openCondition={showTourModal}
				onDismissConditions={setShowTourModal}
				data={props.tourDetails}
				media={tourMedia}
				i18n={props.i18n}
				setTourDetails={props.setTourDetails}
				closeAllModals={() => {
					setShowTourModal(false);
				}}
			/>
		)}
		</>
	);
}

export default TourOnMap;

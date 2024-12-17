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
import { Polyline, Popup } from "react-leaflet";
import { useState } from "react";
import { TourDetails, POI, LanguageCode, TourMedia } from "../types/app_types";
import TourModal from "../modals/TourModal";
import * as turf from '@turf/turf';
import nearestPointOnLine from "@turf/nearest-point-on-line";


var tourMedia: TourMedia[];

function TourOnMap(props: {
	i18n: i18n;
	tourDetails: TourDetails;
	setTourDetails: (arg0: TourDetails | undefined) => void;
	POIListData: POI[];
}) {
	const [closeTourAlert, setCloseTourAlert] = useState<boolean>(false); // Indica se mostrare l'alert di conferma chiusura del tour
	const [showTourModal, setShowTourModal] = useState<boolean>(false); // Mostra la modale dell'itinerario
	const [popupPosition, setPopupPosition] = useState<[number, number] | null>(null); // Mostra info tracciato
	const [altitude, setAltitude] = useState<number | null>(null);
	const code = props.i18n.language as LanguageCode;

	/** Mostra l'alert di chiusura itinerario se viene premuto il tasto indietro sul telefono */
	document.addEventListener("ionBackButton", (ev) => {
		setCloseTourAlert(true);
	});

	const hadlePolylineClick = (event: any): void => {
		const polylinePositions = props.tourDetails.geometry.coordinates[0];
		const { lat, lng } = event.latlng;

		// Convert polyline and click position to Turf.js features
		const line = turf.lineString(polylinePositions.map(([lat, lng, alt]) => [lng, lat]));
		const clickedPoint = turf.point([lng, lat]);

		// Get the closes point on the polyline
		const snappedPoint = nearestPointOnLine(line, clickedPoint);

		// Extract altitude by finding the closes segment in the polyline
		const snappedCoords = snappedPoint.geometry.coordinates as [number, number];
		const closestSegmentIndex = findClosestSegmentIndex(polylinePositions, snappedCoords);

		const altitudeAtPoint = interpolateAltitude(
			polylinePositions[closestSegmentIndex],
			polylinePositions[closestSegmentIndex + 1],
			snappedCoords
		)

		setPopupPosition([snappedCoords[1], snappedCoords[0]]);
		setAltitude(altitudeAtPoint);
	}

	const findClosestSegmentIndex = (
		polyline: [number, number, number][],
		snappedCoords: [number, number]
	): number => {
		let closestIndex = 0;
		let minDistance = Infinity;

		const snappedPoint = turf.point(snappedCoords);
	
		for (let i = 0; i < polyline.length - 1; i++) {
			const segmentStart = [polyline[i][1], polyline[i][0]]; // [lng, lat]
			const segmentEnd = [polyline[i + 1][1], polyline[i + 1][0]]; // [lng, lat]
		
			const segment = turf.lineString([segmentStart, segmentEnd]);
			const distance = turf.pointToLineDistance(snappedPoint, segment);
		
			if (distance < minDistance) {
				minDistance = distance;
				closestIndex = i;
			}
		}

		return closestIndex;
	};

	const interpolateAltitude = (
		start: [number, number, number],
		end: [number, number, number],
		snappedCoords: [number, number]
	): number => {
		const startPoint = turf.point([start[1], start[0]]); // [lng, lat]
		const endPoint = turf.point([end[1], end[0]]); // [lng, lat]
		const snappedPoint = turf.point(snappedCoords);

		const totalDistance = turf.distance(startPoint, endPoint);
		const snappedDistance = turf.distance(startPoint, snappedPoint);

		const altitudeDelta = end[2] - start[2];
		const interpolatedAltitude = start[2] + (altitudeDelta * snappedDistance) / totalDistance;

		return interpolatedAltitude;
	};

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
			polylines.push(<Polyline weight={6} eventHandlers={{ click:hadlePolylineClick }} key={i} pathOptions={{ color: color }}  positions={ positions } />);
			currElevation = props.tourDetails.geometry.coordinates[0][i][2];
			positions = [];
		}
	}
	if (polylines.length === 0) {
		color = getColor(positions[0][2]);
		polylines.push(<Polyline key={i} weight={6} pathOptions={{ color: color }}  positions={ positions } />);
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

		{popupPosition && (
			<Popup 
				position={ popupPosition } 
				eventHandlers={{ 
					remove: () => setPopupPosition(null)
				}}
			>
				<div>{ props.i18n.t("altitude") }: {altitude?.toFixed(2)} { props.i18n.t("meters") }</div>
			</Popup>
		)}

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

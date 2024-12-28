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
import { useState, useMemo } from "react";
import { TourDetails, POI, LanguageCode, TourMedia } from "../types/app_types";
import { fetchTourMedia } from "../components/Functions";
import TourModal from "../modals/TourModal";
import * as turf from '@turf/turf';
import nearestPointOnLine from "@turf/nearest-point-on-line";
import chroma from "chroma-js";


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
	const coordinates = props.tourDetails.geometry.coordinates[0];

	/** Mostra l'alert di chiusura itinerario se viene premuto il tasto indietro sul telefono */
	document.addEventListener("ionBackButton", (ev) => {
		setCloseTourAlert(true);
	});

	
	fetchTourMedia(props.tourDetails.properties.classid, (media: TourMedia[]) => {
		tourMedia = media;
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

	const elevationColorScale = chroma.scale([
		"F9C376",
		"#F8B95F",
		"#F7AF48", 
		"#F6A531",
		"#F59B1A",
		"#DD8C17",
		"#C47C15",
		"#AC6D12",
	]).domain([Math.min(...coordinates.map((coord) => coord[2])), Math.max(...coordinates.map((coord) => coord[2]))]);

	const segments = useMemo(() => {
		const segments: {
			positions: [number, number][];
			color: string;
		}[] = [];

		for (let i = 1; i < coordinates.length; i++) {
			const [lat1, lng1, elevation1] = coordinates[i - 1];
			const [lat2, lng2, elevation2] = coordinates[i];

			const color1 = elevationColorScale(elevation1).hex();
			const color2 = elevationColorScale(elevation2).hex();
			const segmentColor = chroma.mix(color1, color2, 0.5).hex();

			segments.push({
				positions: [
					[lat1, lng1],
					[lat2, lng2],
				],
				color: segmentColor,
			});
		}

		return segments;
	}, [coordinates]);

	const polylines = segments.map((segment, i) => (
		<Polyline
			key={ i }
			weight={ 6 }
			pathOptions={{ color: segment.color }}
			positions={ segment.positions }
			eventHandlers={{ click:hadlePolylineClick }}
		/>
	));

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

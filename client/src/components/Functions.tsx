import L from "leaflet";
import { SERVER_DOMAIN, WEBAPP, WORKSPACE } from "../configVar";
import { POI, POIDetails, POIMedia, Event, EventDetails, EventMedia, Tour, TourDetails, TourMedia } from "../types/app_types";

// Trova il centro rispetto a tutti i punti di interesse
export function findCenter(data: POI[]) {
	let x;
	let y;
	let z;
	let sumx = 0;
	let sumy = 0;
	let sumz = 0;
	let latitude;
	let longitude;
	data.forEach((element: POI) => {
		longitude = (element.geometry.coordinates[0] * Math.PI) / 180;
		latitude = (element.geometry.coordinates[1] * Math.PI) / 180;
		x = Math.cos(latitude) * Math.cos(longitude);
		y = Math.cos(latitude) * Math.sin(longitude);
		z = Math.sin(latitude);

		sumx += x;
		sumy += y;
		sumz += z;
	});

	sumx /= data.length;
	sumy /= data.length;
	sumz /= data.length;
	
	let lon = Math.atan2(sumy, sumx);
	let lan = Math.atan2(sumz, Math.sqrt(sumx * sumx + sumy * sumy));

	lan = (lan * 180) / Math.PI;
	lon = (lon * 180) / Math.PI;
	return new L.LatLng(lan, lon);
}

/**
 * Scarica la lista di tutti i punti di interesse con le coordinate e i nomi e poi esegue la funzione callback
 * @param callback Funzione di callback
 */
export function fetchPOIList(callback: (arg0: POI[]) => void) {
	const artCategoryRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=" + WORKSPACE + ":v_art_space" +
		"&outputFormat=json";

	type POIList = {
		features: POI[];
	};

	fetch(artCategoryRequest)
		.then((response) => response.json())
		.then((data: POIList) => callback(data.features))
		.catch((e) => {
			console.log(e);
		});
}

/**
 * Scarica i dettagli di un punto di interesse ed esegue la funzione di callback
 * @param id_poi Identificativo del poi
 * @param callback Funzione di callback
 */
export function fetchPOIDetails(id_poi: string,	callback: (arg0: POIDetails) => void) {
	const classIdRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=" + WORKSPACE + ":v_art" +
		"&cql_filter=(classid='" +
		id_poi +
		"')" +
		"&outputFormat=json";

	type POIDetailsList = {
		numberReturned: number;
		features: { properties: POIDetails }[];
	};

	fetch(classIdRequest)
		.then((response) => response.json())
		.then((data: POIDetailsList) =>
			data.numberReturned === 1
				? callback(data.features[0].properties)
				: Promise.reject())
		.catch((e) => {
			console.log(e);
		});
}

/**
 * Scarica i media di un punto di interesse ed esegue la funzione di callback
 * @param id_poi Identificativo del poi
 * @param callback Funzione di callback
 */
export function fetchPOIMedia(id_poi: string, callback: (arg0: POIMedia[]) => void) {
	const classIdRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=tourism:v_art_media" +
		"&cql_filter=(art='" +
		id_poi +
		"')" +
		"&outputFormat=json";

	type POIMediaList = {
		features: POIMedia[];
	};

	fetch(classIdRequest)
		.then((response) => response.json())
		.then((data: POIMediaList) => callback(data.features))
		.catch((e) => {
			console.log("Errore nella comunicazione con il server: fetchPOIMedia: " + e);
		});
}

/**
 * Scarica la lista di tutti gli eventi con le coordinate e i nomi e poi esegue la funzione callback
 * @param callback Funzione di callback
 */
export function fetchEventList(callback: (arg0: Event[]) => void) {
	const eventCategoryRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=" + WORKSPACE + ":v_event_spacetime" +
		"&outputFormat=json";

	type EventList = {
		features: Event[];
	};

	fetch(eventCategoryRequest)
		.then((response) => response.json())
		.then((data: EventList) => callback(data.features))
		.catch((e) => {
			console.log(e);
		});
}

/**
 * Scarica i dettagli di un evento ed esegue la funzione di callback
 * @param id_event Identificativo dell'evento
 * @param callback Funzione di callback
 */
export function fetchEventDetails(id_event: string,	callback: (arg0: EventDetails) => void) {
	const classIdRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=" + WORKSPACE + ":v_event" +
		"&cql_filter=(classid='" +
		id_event +
		"')" +
		"&outputFormat=json";

	type EventDetailsList = {
		numberReturned: number;
		features: { properties: EventDetails }[];
	};

	fetch(classIdRequest)
		.then((response) => response.json())
		.then((data: EventDetailsList) =>
			data.numberReturned === 1
				? callback(data.features[0].properties)
				: Promise.reject())
		.catch((e) => {
			console.log(e + id_event);
		});
}

/**
 * Scarica i media di un evento ed esegue la funzione di callback
 * @param id_event Identificativo del poi
 * @param callback Funzione di callback
 */
export function fetchEventMedia(id_event: string, callback: (arg0: EventMedia[]) => void) {
	const classIdRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=tourism:v_event_media" +
		"&cql_filter=(linked_event='" +
		id_event +
		"')" +
		"&outputFormat=json";
	
	type EventMediaList = {
		features: EventMedia[];
	};

	fetch(classIdRequest)
	.then((response) => response.json())
	.then((data: EventMediaList) => callback(data.features))
	.catch((e) => {
		console.log("Errore nella comunicazione con il server: fetchEventMedia: " + e);
	});
}

/**
 * Scarica la lista di tutti gli itinerari e poi esegue la funzione callback
 * @param callback Funzione di callback
 */
export function fetchTourList(callback: (arg0: Tour[]) => void) {
	const artCategoryRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=" + WORKSPACE + ":v_tour_space" +
		"&outputFormat=json";

	type TourList = {
		features: Tour[];
	};

	fetch(artCategoryRequest)
		.then((response) => response.json())
		.then((data: TourList) => callback(data.features))
		.catch(() => {
			console.log("Errore nella comunicazione con il server: fetchTourList");
		});
}

/**
 * Scarica i dettagli di un itinerario ed esegue la funzione di callback
 * @param id_tour Identificativo dell'itinerario
 * @param callback Funzione di callback
 */
export function fetchTourDetails(id_tour: string, callback: (arg0: TourDetails) => void) {
	const classIdRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=" + WORKSPACE + ":v_tour" +
		"&cql_filter=(classid='" +
		id_tour +
		"')" +
		"&outputFormat=json";

	type POIDetailsList = {
		numberReturned: number;
		features: TourDetails[];
	};

	fetch(classIdRequest)
		.then((response) => response.json())
		.then((data: POIDetailsList) =>
		data.numberReturned === 1 ? callback(data.features[0]) : Promise.reject())
		.catch(() => {
			console.log("Errore nella comunicazione con il server: fetchTourDetails");
		});
}

/**
 * Scarica i media di un tour ed esegue la funzione di callback
 * @param id_tour Identificativo del poi
 * @param callback Funzione di callback
 */
export function fetchTourMedia(id_tour: string,	callback: (arg0: TourMedia[]) => void) {
	const classIdRequest =
		SERVER_DOMAIN + WEBAPP + WORKSPACE +
		"/ows?service=WFS&version=1.0.0" +
		"&request=GetFeature" +
		"&typeName=" + WORKSPACE + ":v_tour_media" +
		"&cql_filter=(tour='" +
		id_tour +
		"')" +
		"&outputFormat=json";

	type TourMediaList = {
		features: TourMedia[];
	};

	fetch(classIdRequest)
	.then((response) => response.json())
	.then((data: TourMediaList) => callback(data.features))
	.catch((e) => {
		console.log("Errore nella comunicazione con il server: fetchTourMedia: " + e);
	});
}

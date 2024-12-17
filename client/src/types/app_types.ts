export enum LanguageCode {
	it = "it",
	en = "en",
	fr = "fr",
	de = "de",
	es = "es",
}

export interface POI {
	properties: {
		id_art: string;

		name_it: string;
		name_en: string;
		name_de: string;
		name_fr: string;
		name_es: string;

		category_it: string;
		category_en: string;
		category_de: string;
		category_fr: string;
		category_es: string;
	};

	geometry: {
		coordinates: [number, number];
	};
}

export interface POIDetails {
	classid: string;
	image_url: string;

	name_it: string;
	name_en: string;
	name_de: string;
	name_fr: string;
	name_es: string;

	descr_it: string;
	descr_en: string;
	descr_de: string;
	descr_fr: string;
	descr_es: string;

	open_time: string;
	open_time_en: string;
	open_time_de: string;
	open_time_fr: string;
	open_time_es: string;

	tickets: string;
	tickets_en: string;
	tickets_de: string;
	tickets_fr: string;
	tickets_es: string;

	link: string;

	category_name_it: string;

	tours_id: string;
	tours_name_it: string;
	tours_name_en: string;
	tours_name_de: string;
	tours_name_fr: string;
	tours_name_es: string;
}

export interface POIMedia {
	properties: {
		classid: string;
		art: string;
		path: string;
	};
}

export interface Event {
	properties: {
		id_event: string;

		day: string;

		name_it: string;
		name_en: string;
		name_de: string;
		name_fr: string;
		name_es: string;

		category_it: string;
		category_en: string;
		category_de: string;
		category_fr: string;
		category_es: string;
	};

	geometry: {
		coordinates: [number, number];
	};
}

export interface EventDetails {
	classid: string;
	image_url: string;

	name_it: string;
	name_en: string;
	name_de: string;
	name_fr: string;
	name_es: string;

	descr_it: string;
	descr_en: string;
	descr_de: string;
	descr_fr: string;
	descr_es: string;

	open_time: string;

	tickets: string;
	tickets_en: string;
	tickets_de: string;
	tickets_fr: string;
	tickets_es: string;
}

export interface EventMedia {
	properties: {
		classid: string;
		linked_event: string;
		path: string;
	};
}

export interface Tour {
	properties: {
		id_tour: string;

		type: string;

		name_it: string;
		name_en: string;
		name_de: string;
		name_fr: string;
		name_es: string;
	};
}

export interface TourDetails {
	geometry: {
		coordinates: [number, number, number][][];
	};

	properties: {
		classid: string;
		image_url: string;
		filename: string;

		duration: string,
		length: string,
		max_altitude: string,
		elevation_difference: string,

		name_it: string;
		name_en: string;
		name_de: string;
		name_fr: string;
		name_es: string;

		descr_it: string;
		descr_en: string;
		descr_de: string;
		descr_fr: string;
		descr_es: string;

		points_tour_id: string;
		points_tour_name_it: string;
		points_tour_name_en: string;
		points_tour_name_de: string;
		points_tour_name_fr: string;
		points_tour_name_es: string;
		points_geom: string;
	};
}

export interface TourMedia {
	properties: {
		classid: string;
		tour: string;
		path: string;
	};
}
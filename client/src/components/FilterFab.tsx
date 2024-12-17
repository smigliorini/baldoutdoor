import { IonFab, IonFabButton, IonIcon, IonFabList } from "@ionic/react";
import { i18n } from "i18next";
import naturalValenceIconFilter from "../assets/images/natural_valence.svg"; // Icona art di valenza naturale filtro
import hisCultValenceIconFilter from "../assets/images/his_cult_valence.svg"; // Icona art di valenza storico/culturale filtro
import activityIconFilter from "../assets/images/activity.svg"; // Icona art attivita' filtro
import eventIconFilter from "../assets/images/bx-calendar-event.svg"; // Icon evento
import { settings } from "ionicons/icons";
import React, { useState } from "react";

function FilterFab(props: {
	i18n: i18n;
	naturalValenceFilter: boolean;
	setNaturalValenceFilter: (arg0: boolean) => void;
	hisCultValenceFilter: boolean;
	setHisCultValenceFilter: (arg0: boolean) => void;
	activityFilter: boolean;
	setActivityFilter: (arg0: boolean) => void;
	eventFilter: boolean;
	setEventFilter: (arg0: boolean) => void;
	fabRef: React.RefObject<HTMLIonFabElement>;
}) {
	const [isOpen, setIsOpen] = useState(true);

	// Toggle fab list
	const toggleFab = () => {
		setIsOpen(!isOpen);
	};

	const handleEventFilterClick = () => {
		props.setEventFilter(!props.eventFilter)
	};

	const handleNaturalValenceFilterClick = () => {
		props.setNaturalValenceFilter(!props.naturalValenceFilter)
	};

	const handleHisCultValenceFilterClick = () => {
		props.setHisCultValenceFilter(!props.hisCultValenceFilter)
	};

	const handleActivityFilterClick = () => {
		props.setActivityFilter(!props.activityFilter)
	};

  	return (
		<IonFab
			vertical="bottom"
			horizontal="end"
			className="ion-margin-bottom"
			ref={props.fabRef}
			activated={isOpen}
		>
			<IonFabButton onClick={toggleFab}>
				<IonIcon icon={settings} />
			</IonFabButton>
			{isOpen && (
				<IonFabList side="top">
					<IonFabButton
						className={
							props.eventFilter
							? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
							: "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
						}
						onClick={handleEventFilterClick}
						data-desc={props.i18n.t("cat_event")}
						data-bool={props.eventFilter}
					>
					<IonIcon
						icon={eventIconFilter}
						className={
							props.eventFilter
								? "my-icon md hydrated"
								: "my-icon-opacity md hydrated"
						}
					/>
					</IonFabButton>
					<IonFabButton
						className={
							props.naturalValenceFilter
							? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
							: "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
						}
						onClick={handleNaturalValenceFilterClick}
						data-desc={props.i18n.t("cat_natural_valence")}
						data-bool={props.naturalValenceFilter}
					>
					<IonIcon
						icon={naturalValenceIconFilter}
						className={
							props.naturalValenceFilter
								? "my-icon md hydrated"
								: "my-icon-opacity md hydrated"
						}
					/>
					</IonFabButton>
					<IonFabButton
						className={
							props.hisCultValenceFilter
							? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
							: "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
						}
						onClick={handleHisCultValenceFilterClick}
						data-desc={props.i18n.t("cat_his_cult_valence")}
						data-bool={props.hisCultValenceFilter}
					>
					<IonIcon
						icon={hisCultValenceIconFilter}
						className={
							props.hisCultValenceFilter
								? "my-icon md hydrated"
								: "my-icon-opacity md hydrated"
						}
					/>
					</IonFabButton>
					<IonFabButton
						className={
							props.activityFilter
							? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
							: "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
						}
						onClick={handleActivityFilterClick}
						data-desc={props.i18n.t("cat_activity")}
						data-bool={props.activityFilter}
					>
					<IonIcon
						icon={activityIconFilter}
						className={
							props.activityFilter
								? "my-icon md hydrated"
								: "my-icon-opacity md hydrated"
						}
					/>
					</IonFabButton>
				</IonFabList>
			)}
		</IonFab>
	);
}

export default FilterFab;

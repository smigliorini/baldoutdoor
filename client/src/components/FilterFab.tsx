import { IonFab, IonFabButton, IonIcon, IonFabList } from "@ionic/react";
import { i18n } from "i18next";
import naturalValenceIconFilter from "../assets/images/natural_valence.svg"; // Icona art di valenza naturale filtro
import hisCultValenceIconFilter from "../assets/images/his_cult_valence.svg"; // Icona art di valenza storico/culturale filtro
import activityIconFilter from "../assets/images/activity.svg"; // Icona art attivita' filtro
import eventIconFilter from "../assets/images/bx-calendar-event.svg"; // Icon evento
import { settings } from "ionicons/icons";

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
  	return (
		<IonFab
			vertical="bottom"
			horizontal="end"
			className="ion-margin-bottom"
			ref={props.fabRef}
			activated
		>
			<IonFabButton>
				<IonIcon icon={settings} />
			</IonFabButton>
			<IonFabList side="top">
				<IonFabButton
					className={
						props.eventFilter
						? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list fab-button-show ion-activatable ion-focusable hydrated"
						: "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable fab-button-show ion-focusable hydrated"
					}
					onClick={() => props.setEventFilter(!props.eventFilter)}
					data-desc={props.i18n.t("cat_event")}
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
					onClick={() => {
						props.setNaturalValenceFilter(!props.naturalValenceFilter);
					}}
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
						? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable ion-focusable hydrated"
						: "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable ion-focusable hydrated"
					}
					onClick={() => props.setHisCultValenceFilter(!props.hisCultValenceFilter)}
					data-desc={props.i18n.t("cat_his_cult_valence")}
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
						? "my-ion-fab-button ion-color ion-color-success md fab-button-in-list ion-activatable ion-focusable hydrated"
						: "my-ion-fab-button-opacity ion-color ion-color-danger md fab-button-in-list ion-activatable ion-focusable hydrated"
					}
					onClick={() => props.setActivityFilter(!props.activityFilter)}
					data-desc={props.i18n.t("cat_activity")}
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
		</IonFab>
	);
}

export default FilterFab;

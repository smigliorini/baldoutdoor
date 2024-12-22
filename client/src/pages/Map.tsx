import {
	IonButtons,
	IonContent,
	IonFab,
	IonFabButton,
	IonHeader,
	IonIcon,
	IonImg,
	IonItem,
	IonPage,
	IonToolbar,
	useIonPopover,
} from "@ionic/react";
import {
	ellipsisHorizontal,
	ellipsisVertical,
	location,
	search,
} from "ionicons/icons";
import "./Map.css";
import { MapContainer } from "react-leaflet";
import React, { useRef, useState } from "react";
import "../assets/leaflet/leaflet.css";
import toolbarIcon from "../assets/images/logo.svg";
import MapChild from "../components/MapChild";
import PopoverList from "../components/PopoverList";
import '../assets/i18n';
import { useTranslation } from "react-i18next";

// var isOpen = true;
const Map: React.FC = () => {
	const [centerPosition, setCenterPosition] = useState<boolean>(false);
	const [showSearchModal, setShowSearchModal] = useState<boolean>(false);
	const fabRef = useRef<HTMLIonFabElement>(null);
	const { i18n } = useTranslation();

	const [present, dismiss] = useIonPopover(PopoverList, {
		onHide: () => dismiss(),
	});
	
	return (
		<IonPage
		>
		{/* Utilizzo di css e javascript di leaflet online
		<link
			rel="stylesheet"
			href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"
			integrity="sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A=="
			crossOrigin=""
		/>

		<script
			src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"
			integrity="sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA=="
			crossOrigin=""
		></script>
		*/}
		<IonHeader>
			<IonToolbar color="primary">
				<IonItem slot="start" lines="none" color="primary" button href="/home">
					<IonImg src={ toolbarIcon } style={{ height: "80%" }} />
				</IonItem>

				<IonButtons slot="end" className="ion-margin-end">
					<IonIcon
						slot="icon-only"
						icon={ search }
						onClick={ () => setShowSearchModal(true) }
					/>
				</IonButtons>

				<IonButtons slot="end" className="ion-margin-end">
					<IonIcon
						slot="icon-only"
						ios={ ellipsisHorizontal }
						md={ ellipsisVertical }
						onClick={(e) =>
							present({
								event: e.nativeEvent,
							})
						}
					/>
				</IonButtons>
			</IonToolbar>
		</IonHeader>
		<IonContent>
			{/* Pulsante per centrare nell propria posizione */}
			<IonFab
				vertical="bottom"
				horizontal="start"
				className="ion-margin-bottom"
				onClick={() => {
					setCenterPosition(true);
				}}
			>
				<IonFabButton>
					<IonIcon icon={location} />
				</IonFabButton>
			</IonFab>

			<MapContainer
				center={[45.64893875856411, 10.81850173405084]}
				zoom={13}
				minZoom={13}
				scrollWheelZoom={true}
				style={{ height: "100%", width: "100%" }}
				zoomControl={true}
			>
				<MapChild
					filterFabRef={fabRef}
					centerPosition={centerPosition}
					setCenterPosition={setCenterPosition}
					i18n={i18n}
					showSearchModal={showSearchModal}
					setShowSearchModal={setShowSearchModal}
				/>
			</MapContainer>
		</IonContent>
		</IonPage>
	);
};

export default Map;

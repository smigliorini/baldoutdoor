import {
	IonButton,
	IonButtons,
	IonContent,
	IonHeader,
	IonPage,
    IonTitle,
    IonToolbar,
    IonGrid,
    IonRow,
    IonCol,
    useIonToast,
    useIonViewDidEnter,
	IonIcon,
	useIonPopover,
	IonImg,
	IonCardContent,
	IonCardTitle,
	IonCard,
} from "@ionic/react";
import {
	ellipsisHorizontal,
	ellipsisVertical,
} from "ionicons/icons";
import { useState } from "react";
import { ConnectionStatus, Network } from "@capacitor/network";
import { Preferences } from "@capacitor/preferences";
import { Device } from "@capacitor/device";
import {
	fetchTourList,
	fetchPOIList,
	fetchEventList,
} from "../components/Functions";
import { LANGUAGES } from "../configVar";
import { POI, Event, Tour, TourDetails } from "../types/app_types";
import POIListModal from "../modals/POIListModal";
import TourListModal from "../modals/TourListModal";
import EventListModal from "../modals/EventListModal";
import PopoverList from "../components/PopoverList";
import "./Home.css";
import '../assets/i18n'
import { useTranslation } from "react-i18next";
import toolbarIcon from "../assets/images/logo.svg";

var POIListData: POI[];
var EventListData: Event[];
var tourListData: Tour[];
var deviceLanguage: string;

// var isOpen = true;
const Home: React.FC = () => {
    const [tourDetails, setTourDetails] = useState<TourDetails | undefined>(undefined); // Indica se la mappa del tour è aperta
    const [dataObtained, setDataObtained] = useState<boolean>(false); // Indica se possiedo la lista dei punti di interesse con le loro coordinate (caricati dalla memoria oppure scaricati dal webserver)
	const [dataEventObtained, setEventDataObtained] = useState<boolean>(false); // Indica se possiedo la lista degli eventi con le loro coordinate (caricati dalla memoria oppure scaricati dal webserver)
    const [downloadedData, setDownloadedData] = useState<boolean>(false); // Indica se la lista dei punti di interesse sono stati scaricati dal webserver
	const [downloadedEventData, setDownloadedEventData] = useState<boolean>(false); // Indica se la lista degli eventi sono stati scaricati dal webserver
    const [showPOIListModal, setShowPOIListModal] = useState<boolean>(false); // Mostra la modale con la lista degli eventi
    const [showTourListModal, setShowTourListModal] = useState<boolean>(false); // Mostra la modale con la lista dei tour
	const [showEventListModal, setShowEventListModal] = useState<boolean>(false); // Mostra la modale con la lista degli eventi
    const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
		// Stato della connessione del dispositivo
		connected: true,
		connectionType: "none",
	});
    const [presentToast] = useIonToast();
	const { i18n } = useTranslation();
	const [present, dismiss] = useIonPopover(PopoverList, {
		onHide: () => dismiss(),
	});


    /**
	 * Funzione invocata quando viene creato il componente
	 */
	useIonViewDidEnter(() => {
		// Recupera la lingua scelta precedentemente e salvata, oppure quella del dispositivo, oppure quella di default
		Preferences.get({ key: "languageCode" }).then((result) => {
		if (result.value !== null) {
			i18n.changeLanguage(result.value);
		} else {
			Device.getLanguageCode().then((lang) => {
				deviceLanguage = lang.value;
				if (LANGUAGES.includes(deviceLanguage)) {
					i18n.changeLanguage(deviceLanguage);
				}
			});
		}
		});

		/**
		 * Controlla se l'utente è online o offline
		 * Nel primo caso, viene caricata la lista dei punti di interesse e degli eventi e salvata in locale
		 * Nel secondo caso, viene caricata la lista dei punti di interesse e degli eventi salvata in locale se possibile
		 */
		Network.getStatus().then((netStatus) => {
			setConnectionStatus(netStatus);
			Preferences.get({ key: "baseData" }).then((result) => {
				if (result.value !== null) {
					POIListData = JSON.parse(result.value);
					setDataObtained(true);
				}
			});

			Preferences.get({ key: "baseEventData" }).then((result) => {
				if (result.value !== null) {
					EventListData = JSON.parse(result.value);
					setEventDataObtained(true);
				}
			});

			if (netStatus.connected) {
				getList();
				getEventList();
			} else {
				presentToast({
					message: i18n.t("user_offline"),
					duration: 5000,
				});
			}
		});

	});

    /**
	 * Scarica la lista dei POI dal server e li salva in locale
	 */
	function getList() {
		if (downloadedData) return;
		fetchPOIList((poiList: POI[]) => {
			POIListData = poiList;
			Preferences.set({
				key: "baseData",
				value: JSON.stringify(POIListData),
			});
			setDownloadedData(true);
			setDataObtained(false);
			setDataObtained(true);
		});
	}

    /**
	 * Scarica la lista degli Event dal server e li salva in locale
	 */
	function getEventList() {
		if (downloadedEventData) return;
		fetchEventList((eventList: Event[]) => {
			EventListData = eventList;
			Preferences.set({
				key: "baseEventData",
				value: JSON.stringify(EventListData),
			});
			setDownloadedEventData(true);
			setEventDataObtained(false);
			setEventDataObtained(true);
		});
	}

    /** Richiedi al server la lista dei tour */
	function getTourList() {
		if (connectionStatus.connected) {
            if (tourListData === undefined) {
                fetchTourList((tourList: Tour[]) => {
                    tourListData = tourList;
                    setShowTourListModal(true);
                });
            } else {
                setShowTourListModal(true);
            }
		} else {
            presentToast({
                message: i18n.t("user_offline"),
                duration: 5000,
            });
		}
	}
	
	return (
		<IonPage className="background">
		<IonHeader>
            <IonToolbar color="primary">
                <IonGrid fixed={ true }>
					<IonRow class="ion-align-items-end">
						<IonCol size="6">
							<IonImg src= { toolbarIcon } style={{ height: '40px', width: '40px' }}/>
						</IonCol>
						<IonCol size="6" className="home">
							<IonButtons>
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
						</IonCol>
					</IonRow>
				</IonGrid>
			</IonToolbar>
		</IonHeader>
		<IonContent className="home">
            <IonGrid fixed={ true }>
                <IonRow class="home">
					<IonCol className="header" size="12" sizeMd="12">
						<h1 className="home">Esplora il Monte Baldo<br/>con BaldOutdoor</h1>
						<p className="home">L'atmosfera unica del Monte&nbsp;Baldo ti&nbsp;aspetta:<br/>BaldOutdoor è l'opportunità perfetta per&nbsp;te</p>
					</IonCol>
                    <IonCol size="12" sizeMd="6">
						<IonCard
							className="home"
							href="/map"
						>
							<IonCardTitle className="home">
								Mappa
							</IonCardTitle>
							<IonCardContent className="home">
								Esplora eventi, itinerari, e&nbsp;molti altri luoghi di interesse: clicca&nbsp;sulla&nbsp;mappa per vivere l’essenza del Monte&nbsp;Baldo!
							</IonCardContent>
						</IonCard>
					</IonCol>
					<IonCol size="12" sizeMd="6">
						<IonCard
							className="home"
							onClick={() => { setShowPOIListModal(true); }}
							button
						>
							<IonCardTitle className="home">
								Punti di interesse
							</IonCardTitle>
							<IonCardContent className="home">
								Scopri i punti di interesse storici, culturali, naturali e le&nbsp;attività&nbsp;disponibili: clicca per accedere all'elenco completo!
							</IonCardContent>
						</IonCard>
					</IonCol>
					<IonCol size="12" sizeMd="6">
						<IonCard
							className="home"
							onClick={() => { getTourList(); }}
							button
						>
							<IonCardTitle className="home">
								Tour
							</IonCardTitle>
							<IonCardContent className="home">
								Clicca per esplorare tutti i tour disponibili!
							</IonCardContent>
						</IonCard>
					</IonCol>
					<IonCol size="12" sizeMd="6">
						<IonCard
							className="home"
							onClick={() => { setShowEventListModal(true); }}
							button
						>
							<IonCardTitle className="home">
								Eventi
							</IonCardTitle>
							<IonCardContent className="home">
								Clicca per scoprire tutti gli eventi imperdibili!
							</IonCardContent>
						</IonCard>
					</IonCol>
                </IonRow>
            </IonGrid>
		</IonContent>
            {showPOIListModal && (
                <POIListModal
                    openCondition={showPOIListModal}
                    onDismissConditions={setShowPOIListModal}
                    data={POIListData}
                    i18n={i18n}
                    setTourDetails={ setTourDetails }
                    closeAllModals={() => {
                        setShowPOIListModal(false);
                    }}
                />
            )}

            {showTourListModal && (
                <TourListModal
                    openCondition={showTourListModal}
                    onDismissConditions={setShowTourListModal}
                    data={tourListData}
                    i18n={i18n}
                    setTourDetails={setTourDetails}
                    closeAllModals={() => {
                        setShowTourListModal(false);
                    }}
                />
            )}

            {showEventListModal && (
                <EventListModal
                    openCondition={showEventListModal}
                    onDismissConditions={setShowEventListModal}
                    data={EventListData}
                    i18n={i18n}
                    closeAllModals={() => {
                        setShowEventListModal(false);
                    }}
                />
            )}
		</IonPage>
	);
};

export default Home;

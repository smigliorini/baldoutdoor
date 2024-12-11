import { IonAlert, IonIcon, IonItem, IonLabel, IonList } from "@ionic/react";
import { informationCircle, language } from "ionicons/icons";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import '../assets/i18n'
import LanguageAlert from "./LanguageAlert";

const PopoverList: React.FC<{
	onHide: () => void;
}> = ({ onHide }) => {
	const [chooseLanguage, setChooseLanguage] = useState<boolean>(false); // Indica se mostrare l'alert per la selezione della lingua
	const [showInfo, setShowInfo] = useState<boolean>(false); // Indica se mostrare l'alert delle informazioni
	const { t, i18n } = useTranslation();

	return (
		<>
		<IonList>
			<IonItem
				detail={false}
				button
				onClick={() => {
					setChooseLanguage(true);
					// onHide();
				}}
			>
			<IonIcon icon={ language } />
			<IonLabel className="ion-margin-start">
				{ t("change_language") }
			</IonLabel>
			</IonItem>

			<IonItem
				lines="none"
				detail={false}
				onClick={() => {
					setShowInfo(true);
					// onHide();
				}}
				button
			>
			<IonIcon icon={ informationCircle } />
			<IonLabel className="ion-padding-start">{t("info")}</IonLabel>
			</IonItem>
		</IonList>

		{chooseLanguage && (
			<LanguageAlert 
				i18n={i18n} 
				onDismiss={() => setChooseLanguage(false)} 
				backdropDismiss={true}
			/>
		)}

		<IonAlert
			isOpen={showInfo}
			header={t("info_title")}
			onDidDismiss={() => setShowInfo(false)}
			buttons={[{ text: t("close"), role: "cancel", cssClass: "secondary" }]}
			message={t("info_message")}
		/>
		</>
	);
};

export default PopoverList;

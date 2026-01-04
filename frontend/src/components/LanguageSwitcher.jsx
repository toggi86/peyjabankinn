import React from "react";
import { useTranslation } from "react-i18next";

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng); // persist choice
  };

  const currentLanguage = i18n.language?.split("-")[0] || "is";

  return (
    <div className="flex space-x-2 items-center">
      <button
        onClick={() => changeLanguage("en")}
        className={`px-2 py-1 rounded ${currentLanguage === "en" ? "bg-gray-700 text-white" : ""}`}
      >
        EN
      </button>
      <button
        onClick={() => changeLanguage("is")}
        className={`px-2 py-1 rounded ${currentLanguage === "is" ? "bg-gray-700 text-white" : ""}`}
      >
        IS
      </button>
    </div>
  );
};

export default LanguageSwitcher;

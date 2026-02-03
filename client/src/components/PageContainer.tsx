import { ReactNode, useContext, useState } from "react";

// components
import { AdminIconButton, Loading, Admin } from "@/components";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export const PageContainer = ({
  children,
  isLoading,
  showAdminIcon,
}: {
  children: ReactNode;
  isLoading: boolean;
  showAdminIcon: boolean;
}) => {
  const { error, questDetails, visitor, badges, visitorInventory } = useContext(GlobalStateContext);
  const { questItemImage } = questDetails || {};
  const { isAdmin } = visitor || {};

  const [activeTab, setActiveTab] = useState("leaderboard");
  const [showSettings, setShowSettings] = useState(false);

  if (isLoading) return <Loading />;

  return (
    <div className="p-4 mb-28">
      {isAdmin && showAdminIcon && (
        <AdminIconButton setShowSettings={() => setShowSettings(!showSettings)} showSettings={showSettings} />
      )}
      {questItemImage ? <img alt="Find me" className="mx-auto" src={questItemImage} /> : <div />}
      <div className="flex flex-col mb-4 mt-2">
        <h1 className="h2 text-center">Quest</h1>
      </div>
      {showSettings ? (
        <Admin />
      ) : (
        <>
          <div className="tab-container mb-4">
            <button
              className={activeTab === "leaderboard" ? "btn" : "btn btn-text"}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </button>
            <button className={activeTab === "badges" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("badges")}>
              Badges
            </button>
          </div>

          {activeTab === "leaderboard" ? (
            children
          ) : (
            <div className="grid grid-cols-3 gap-6 pt-4">
              {badges &&
                Object.values(badges).map((badge) => {
                  const hasBadge = visitorInventory && Object.keys(visitorInventory).includes(badge.name);
                  const style = { width: "90px", filter: "none" };
                  if (!hasBadge) style.filter = "grayscale(1)";
                  return (
                    <div className="tooltip" key={badge.id}>
                      <span className="tooltip-content">{badge.name}</span>
                      <img src={badge.icon} alt={badge.name} style={style} />
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
      {error && <p className="p3 pt-10 text-center text-error">{error}</p>}
    </div>
  );
};

export default PageContainer;

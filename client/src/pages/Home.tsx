import { useContext, useEffect, useState } from "react";

// components
import { Leaderboard, PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { ErrorType, SET_QUEST_DETAILS, SET_VISITOR_INFO } from "@/context/types";

// utils
import { backendAPI, setErrorMessage } from "@/utils";

export const Home = () => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams, badges, visitorInventory } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .get("/quest")
        .then((response) => {
          const { questDetails, visitor, visitorInventory, badges } = response.data;
          dispatch!({
            type: SET_QUEST_DETAILS,
            payload: { questDetails, badges },
          });
          dispatch!({
            type: SET_VISITOR_INFO,
            payload: { visitor, visitorInventory },
          });
        })
        .catch((error) => setErrorMessage(dispatch, error as ErrorType))
        .finally(() => setIsLoading(false));
    }
  }, [hasInteractiveParams]);

  return (
    <PageContainer isLoading={isLoading}>
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
          <Leaderboard isKeyAsset={true} />
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
    </PageContainer>
  );
};

export default Home;

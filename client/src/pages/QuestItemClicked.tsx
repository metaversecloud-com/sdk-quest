import { useContext, useEffect, useState } from "react";

// components
import { Leaderboard, Loading, PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_QUEST_DETAILS, SET_VISITOR_INFO } from "@/context/types";

// utils
import { backendAPI } from "@utils/backendAPI";

export const QuestItemClicked = () => {
  const [message, setMessage] = useState("");
  const [collectedText, setCollectedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .post("/quest-item-clicked")
        .then((response) => {
          const {
            addedClick,
            numberAllowedToCollect,
            totalCollectedToday,
            questDetails,
            visitor,
            visitorInventory,
            badges,
          } = response.data;
          dispatch!({
            type: SET_QUEST_DETAILS,
            payload: { questDetails, badges },
          });
          dispatch!({
            type: SET_VISITOR_INFO,
            payload: { visitor, visitorInventory },
          });
          if (addedClick) {
            setCollectedText(`${totalCollectedToday}/${numberAllowedToCollect} collected today`);
            if (totalCollectedToday === numberAllowedToCollect) {
              setMessage(`🎉 Congratulations! You have completed your daily quest!`);
            } else {
              setMessage(`🎉 Congratulations! You are one step closer to completing your daily quest!`);
            }
          } else {
            setMessage(`🎉 You have already completed your daily quest! Come back tomorrow!`);
            setCollectedText(`${numberAllowedToCollect}/${numberAllowedToCollect} collected today`);
          }
        })
        .catch(() => console.error("Error collecting Quest item"))
        .finally(() => setIsLoading(false));
    }
  }, [hasInteractiveParams]);

  if (isLoading) return <Loading />;

  return (
    <PageContainer isLoading={isLoading} showAdminIcon={false}>
      <div className="grid gap-4">
        {message && <p>{message}</p>}
        {collectedText && <p>{collectedText}</p>}
        <Leaderboard isKeyAsset={false} />
      </div>
    </PageContainer>
  );
};

export default QuestItemClicked;

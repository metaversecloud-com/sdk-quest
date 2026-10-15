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
  const [wasQuestRemoved, setWasQuestRemoved] = useState(false);
  const [removedIsAdmin, setRemovedIsAdmin] = useState(false);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { hasInteractiveParams } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .post("/quest-item-clicked")
        .then((response) => {
          const {
            isAdmin,
            addedClick,
            numberAllowedToCollect,
            totalCollectedToday,
            questDetails,
            visitor,
            visitorInventory,
            badges,
            wasItemAlreadyFound,
            wasQuestRemoved,
          } = response.data;

          if (wasQuestRemoved) {
            setWasQuestRemoved(true);
            setRemovedIsAdmin(!!isAdmin);
            return;
          }
          dispatch!({
            type: SET_QUEST_DETAILS,
            payload: { questDetails, badges },
          });
          dispatch!({
            type: SET_VISITOR_INFO,
            payload: { visitor, visitorInventory },
          });

          if (wasItemAlreadyFound) {
            setMessage(`This quest item has already been found. Please search for another one!`);
          } else if (addedClick) {
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

  if (wasQuestRemoved) {
    return (
      <PageContainer isLoading={isLoading} showAdminIcon={false}>
        <div className="grid gap-4">
          {removedIsAdmin ? (
            <>
              <h2 className="h2">This Quest has been removed</h2>
              <p className="p1">
                This Quest&apos;s key asset was deleted, so we&apos;re removing its leftover quest items from the world
                now. To start a new Quest, add the Quest app again.
              </p>
              <p className="p2">
                Tip: Next time, use Remove Quest from World in the Quest admin settings to clean up all quest items at
                once.
              </p>
            </>
          ) : (
            <>
              <h2 className="h2">This Quest has ended</h2>
              <p className="p1">
                This Quest was removed from the world, so we&apos;re clearing away its leftover items. Keep exploring!
              </p>
            </>
          )}
        </div>
      </PageContainer>
    );
  }

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

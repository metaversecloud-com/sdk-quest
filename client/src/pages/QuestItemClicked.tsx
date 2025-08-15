import { useContext, useEffect, useState } from "react";

// components
import { Leaderboard, Loading } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_QUEST_DETAILS } from "@/context/types";

// utils
import { backendAPI } from "@utils/backendAPI";

export const QuestItemClicked = () => {
  const [message, setMessage] = useState("");
  const [collectedText, setCollectedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { questDetails, hasInteractiveParams } = useContext(GlobalStateContext);
  const { questItemImage } = questDetails || {};

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI
        .post("/quest-item-clicked")
        .then((response) => {
          const { addedClick, numberAllowedToCollect, totalCollectedToday, questDetails } = response.data;
          dispatch!({
            type: SET_QUEST_DETAILS,
            payload: { questDetails },
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
    <div className="container p-6 items-center justify-start">
      {questItemImage ? <img alt="Find me" className="mx-auto" src={questItemImage} /> : <div />}
      <div className="flex flex-col mb-6 mt-4">
        <h1 className="h2 text-center">Quest</h1>
      </div>
      <div className="container py-6 items-center justify-start">
        {message && (
          <div className="flex flex-col p-1">
            <p>{message}</p>
          </div>
        )}
        {collectedText && (
          <div className="flex flex-col p-1">
            <p>{collectedText}</p>
          </div>
        )}
      </div>
      <Leaderboard isKeyAsset={false} />
    </div>
  );
};

export default QuestItemClicked;

import { useContext, useEffect, useState } from "react";

// components
import { Leaderboard, Loading } from "@/components";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export const QuestItemClicked = () => {
  const [message, setMessage] = useState("");
  const [collectedText, setCollectedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const { keyAssetImage, hasInteractiveParams } = useContext(GlobalStateContext);

  useEffect(() => {
    if (hasInteractiveParams) {
      backendAPI.post("/quest-item-clicked")
        .then((result) => {
          const { addedClick, numberAllowedToCollect, totalCollectedToday, success } = result.data;

          if (addedClick) {
            setCollectedText(`${totalCollectedToday}/${numberAllowedToCollect} collected today`);
            setMessage(`🎉 Congratulations! You are one step closer to completing your daily quest!`);
          } else if (success) {
            setMessage(`🎉 You have already completed your daily quest! Come back tomorrow!`);
            setCollectedText(`${numberAllowedToCollect}/${numberAllowedToCollect} collected today`);
          }
        })
        .catch(() => console.error("Error collecting Quest item"))
        .finally(() => setIsLoading(false))
    }
  }, [hasInteractiveParams]);

  if (isLoading) return <Loading />;

  return (
    <div className="container p-6 items-center justify-start">
      {keyAssetImage ? <img alt="Find me" className="mx-auto" src={keyAssetImage} /> : <div />}
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
      <Leaderboard isKeyAsset={false} keyAssetImage={keyAssetImage} />
    </div>
  );
};

export default QuestItemClicked
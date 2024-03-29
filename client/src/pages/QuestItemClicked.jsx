import React, { useCallback, useContext, useEffect, useState } from "react";

// components
import { Leaderboard, Loading } from "@components";

// utils
import { backendAPI } from "@utils/backendAPI";

export const QuestItemClicked = () => {
  const [message, setMessage] = useState("");
  const [collectedText, setCollectedText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const { keyAssetImage, hasInteractiveParams } = useContext();

  useEffect(() => {
    if (hasInteractiveParams) handleItemAssetClicked();
    // eslint-disable-next-line
  }, [hasInteractiveParams]);

  const handleItemAssetClicked = useCallback(async () => {
    try {
      const result = await backendAPI.post("/quest-item-clicked");
      const { addedClick, numberAllowedToCollect, totalCollectedToday, success } = result.data;

      if (addedClick) {
        setCollectedText(`${totalCollectedToday}/${numberAllowedToCollect} collected today`);
        setMessage(`🎉 Congratulations! You are one step closer to completing your daily quest!`);
      } else if (success) {
        setMessage(`🎉 You have already completed your daily quest! Come back tomorrow!`);
        setCollectedText(`${numberAllowedToCollect}/${numberAllowedToCollect} collected today`);
      } else {
        console.error("ERROR getting data object");
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.error(error);
    }
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className="container p-6 items-center justify-start">
      <div className="flex flex-col px-3">{keyAssetImage ? <img alt="Find me" src={keyAssetImage} /> : <div />}</div>
      <div className="flex flex-col px-3">
        <h1 className="h2">Quest</h1>
      </div>
      <div className="container p-6 items-center justify-start">
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